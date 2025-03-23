from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import TravelRegistration
from .serializers import TravelRegistrationSerializer
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta
import logging
import openai
from django.core.cache import cache
import time
import re

# Set up logging
logger = logging.getLogger(__name__)

# Rate limiting settings
RATE_LIMIT_KEY = 'chat_rate_limit'
RATE_LIMIT_WINDOW = 60  # 1 minute
MAX_REQUESTS_PER_WINDOW = 30  # 30 requests per minute

def check_rate_limit():
    """Check if the rate limit has been exceeded"""
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    # Get existing requests in the window
    requests = cache.get(RATE_LIMIT_KEY, [])
    
    # Remove old requests
    requests = [req_time for req_time in requests if req_time > window_start]
    
    # Check if we've exceeded the limit
    if len(requests) >= MAX_REQUESTS_PER_WINDOW:
        return False
    
    # Add current request
    requests.append(current_time)
    cache.set(RATE_LIMIT_KEY, requests, RATE_LIMIT_WINDOW)
    return True

def format_response(text, is_list=False):
    """Format the response text with proper spacing and structure"""
    if is_list:
        return text.strip()
    return text.strip()

def get_chat_response(message, stats):
    """Generate a response based on predefined rules and statistics"""
    message = message.lower().strip()
    
    # Define patterns and their corresponding responses
    patterns = {
        # Total requests and statistics
        r'(total|count|number|statistics|stats).*request': format_response(
            f"📊 Travel Request Statistics\n\n"
            f"Total number of travel requests in the system: {stats['total']}\n\n"
            f"Breakdown:\n"
            f"• Pending: {stats['pending']}\n"
            f"• Approved: {stats['approved']}\n"
            f"• Rejected: {stats['rejected']}\n\n"
            f"Percentage Distribution:\n"
            f"• Pending: {(stats['pending'] / stats['total'] * 100):.1f}%\n"
            f"• Approved: {(stats['approved'] / stats['total'] * 100):.1f}%\n"
            f"• Rejected: {(stats['rejected'] / stats['total'] * 100):.1f}%"
        ),
        
        # Pending/approved/rejected requests
        r'(pending|waiting).*request': format_response(
            f"⏳ Pending Requests Status\n\n"
            f"Currently, there are {stats['pending']} pending travel requests awaiting review.\n"
            f"Percentage of total: {(stats['pending'] / stats['total'] * 100):.1f}%\n\n"
            f"Recent pending requests:\n"
            f"{stats['recent_text']}"
        ),
        
        r'(approved|accepted).*request': format_response(
            f"✅ Approved Requests Summary\n\n"
            f"Total approved requests: {stats['approved']}\n"
            f"Percentage of total: {(stats['approved'] / stats['total'] * 100):.1f}%\n\n"
            f"Recent approvals:\n"
            f"{stats['recent_text']}"
        ),
        
        r'(rejected|denied).*request': format_response(
            f"❌ Rejected Requests Overview\n\n"
            f"Total rejected requests: {stats['rejected']}\n"
            f"Percentage of total: {(stats['rejected'] / stats['total'] * 100):.1f}%\n\n"
            f"Recent rejections:\n"
            f"{stats['recent_text']}"
        ),
        
        # Recent travel requests
        r'(recent|latest|new).*request': format_response(
            f"📋 Recent Travel Requests\n\n"
            f"Here are the most recent travel requests:\n\n"
            f"{stats['recent_text']}\n\n"
            f"Status Distribution:\n"
            f"• Pending: {stats['pending']}\n"
            f"• Approved: {stats['approved']}\n"
            f"• Rejected: {stats['rejected']}\n\n"
            f"Would you like to see more details about any specific request?"
        ),
        
        # Travel mode distribution - Updated pattern to be more flexible
        r'(mode|travel mode|transport|travel|travel mode distribution)': format_response(
            f"🚗 Travel Mode Distribution\n\n"
            f"Current distribution of travel requests by mode:\n\n"
            f"{stats['modes_text']}\n\n"
            f"Total requests: {stats['total']}\n\n"
            f"Breakdown by percentage:\n" + 
            "\n".join([
                f"• {mode['travel_mode']}: {(mode['count'] / stats['total'] * 100):.1f}%"
                for mode in stats['modes']
            ])
        ),
        
        # Request status overview
        r'(status|overview|summary).*request': format_response(
            f"📈 Travel Request Dashboard\n\n"
            f"Current Status Overview:\n\n"
            f"Total Requests: {stats['total']}\n"
            f"• Pending: {stats['pending']} ({(stats['pending'] / stats['total'] * 100):.1f}%)\n"
            f"• Approved: {stats['approved']} ({(stats['approved'] / stats['total'] * 100):.1f}%)\n"
            f"• Rejected: {stats['rejected']} ({(stats['rejected'] / stats['total'] * 100):.1f}%)\n\n"
            f"Recent Activity:\n"
            f"{stats['recent_text']}\n\n"
            f"Travel Mode Distribution:\n"
            f"{stats['modes_text']}"
        ),
        
        # Request percentages - Updated pattern to be more flexible
        r'(percentage|percent|rate|show me request percentages|percentages)': format_response(
            f"📊 Request Status Percentages\n\n"
            f"Current distribution of travel requests:\n\n"
            f"• Pending: {stats['pending']} ({(stats['pending'] / stats['total'] * 100):.1f}%)\n"
            f"• Approved: {stats['approved']} ({(stats['approved'] / stats['total'] * 100):.1f}%)\n"
            f"• Rejected: {stats['rejected']} ({(stats['rejected'] / stats['total'] * 100):.1f}%)\n\n"
            f"Total Requests: {stats['total']}\n\n"
            f"Recent Activity:\n"
            f"{stats['recent_text']}"
        ),
        
        # Help command
        r'(help|assist|what can you do)': format_response(
            f"👋 Welcome to Travel Request Assistant!\n\n"
            f"I can help you with the following information:\n\n"
            f"📊 Statistics\n"
            f"• Total number of requests\n"
            f"• Pending/approved/rejected counts\n"
            f"• Approval/rejection rates\n\n"
            f"📋 Recent Activity\n"
            f"• Latest travel requests\n"
            f"• Recent status changes\n\n"
            f"🚗 Travel Details\n"
            f"• Travel mode distribution\n"
            f"• Booking mode statistics\n\n"
            f"💡 Tips:\n"
            f"• Ask for 'status' to get a complete overview\n"
            f"• Use 'recent' to see latest requests\n"
            f"• Type 'help' anytime to see this menu"
        )
    }
    
    # Check for matching patterns
    for pattern, response in patterns.items():
        if re.search(pattern, message):
            return response
    
    # If no pattern matches, try to understand the intent
    if any(word in message for word in ['hello', 'hi', 'hey']):
        return format_response(
            f"👋 Hello! I'm your Travel Request Assistant.\n\n"
            f"I can help you with information about travel requests, including:\n"
            f"• Total requests and statistics\n"
            f"• Pending/approved/rejected requests\n"
            f"• Recent travel requests\n"
            f"• Travel mode distribution\n\n"
            f"Type 'help' to see all available commands."
        )
    
    if any(word in message for word in ['thanks', 'thank you']):
        return format_response("You're welcome! Let me know if you need anything else.")
    
    if any(word in message for word in ['bye', 'goodbye']):
        return format_response("Goodbye! Have a great day!")
    
    # Default response if no pattern matches
    return format_response(
        f"🤔 I'm not sure I understand. Here's what I can help you with:\n\n"
        f"📊 Statistics\n"
        f"• Total requests: {stats['total']}\n"
        f"• Pending: {stats['pending']}\n"
        f"• Approved: {stats['approved']}\n"
        f"• Rejected: {stats['rejected']}\n\n"
        f"Try asking about:\n"
        f"• Total requests and statistics\n"
        f"• Pending/approved/rejected requests\n"
        f"• Recent travel requests\n"
        f"• Travel mode distribution\n"
        f"• Request status overview\n"
        f"• Request percentages\n\n"
        f"Type 'help' for a complete list of available commands."
    )

class TravelRequestViewSet(viewsets.ModelViewSet):
    queryset = TravelRegistration.objects.all()
    serializer_class = TravelRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return TravelRegistration.objects.all()
        return TravelRegistration.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if not request.user.is_staff:
            return Response({'error': 'Only admins can update travel requests'}, status=403)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        return super().update(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def chat(request):
    try:
        # Check rate limit
        if not check_rate_limit():
            return Response(
                {'error': 'Rate limit exceeded. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Get user's message
        message = request.data.get('message')
        if not message:
            return Response(
                {'error': 'Message is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get travel request statistics
        stats = {
            'total': TravelRegistration.objects.count(),
            'pending': TravelRegistration.objects.filter(status='Pending').count(),
            'approved': TravelRegistration.objects.filter(status='Approved').count(),
            'rejected': TravelRegistration.objects.filter(status='Rejected').count(),
            'recent': TravelRegistration.objects.order_by('-created_at')[:3],
            'modes': TravelRegistration.objects.values('travel_mode').annotate(count=Count('id'))
        }

        # Format recent requests
        stats['recent_text'] = "\n".join([
            f"• {req.project_name} ({req.status})"
            for req in stats['recent']
        ])

        # Format travel modes
        stats['modes_text'] = "\n".join([
            f"• {mode['travel_mode']}: {mode['count']} requests"
            for mode in stats['modes']
        ])

        # Generate response
        response = get_chat_response(message, stats)
        return Response({'response': response})

    except Exception as e:
        logger.error(f"Unexpected error in chat view: {str(e)}")
        return Response(
            {'error': 'An unexpected error occurred'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )