from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import TravelRegistration
from .serializers import TravelRegistrationSerializer
from django.db.models import Count
import logging
from google import genai
from django.core.cache import cache
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)

# Cache settings
CACHE_KEY_STATS = "travel_request_stats"
CACHE_TIMEOUT = 300


def get_travel_stats():
    """Get travel request statistics from cache or database"""
    # Try to get stats from cache
    stats = cache.get(CACHE_KEY_STATS)
    if stats is not None:
        return stats

    # If not in cache, query database
    travel_requests = TravelRegistration.objects.select_related('user')\
        .values(
            'status', 
            'travel_mode', 
            'user__username',
            'project_name',
            'start_date',
            'start_location',
            'end_location',
            'created_at'
        )\
        .annotate(count=Count('id'))\
        .order_by('-created_at') # Get last 10 requests for recent activity
    
    # Format recent requests
    recent_requests = [
        {
            'username': req['user__username'],
            'project': req['project_name'],
            'status': req['status'],
            'travel_mode': req['travel_mode'],
            'route': f"{req['start_location']} to {req['end_location']}",
            'date': req['start_date'].strftime('%Y-%m-%d'),
            'created': req['created_at'].strftime('%Y-%m-%d %H:%M')
        }
        for req in travel_requests
    ]

    # Create stats dictionary with detailed information
    stats = {
        'recent_requests': recent_requests,
    }

    # Store in cache
    cache.set(CACHE_KEY_STATS, stats, CACHE_TIMEOUT)
    return stats


@api_view(["POST"])
@permission_classes([permissions.IsAdminUser])
def chat(request):
    try:
        # Get user's message
        message = request.data.get("message")
        if not message:
            return Response(
                {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get cached stats
        stats = get_travel_stats()
        print(stats)

        # Create context for AI
        context = f"""You are a travel request assistant. Here's the current data:

        Total Requests: {stats['recent_requests']}

        Recent Requests:
        {'\n'.join(f"- {req['username']}'s request for {req['project']} ({req['status']}) - {req['route']} on {req['date']} by {req['travel_mode']}" for req in stats['recent_requests'])}

        User Question: {message}

        Provide a professional and concise response based on this data. Include relevant statistics and percentages where appropriate."""

        # Generate response using Gemini
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash", contents=context
            )
            return Response({"response": response.text})
        except Exception as e:
            logger.error(f"Error generating response with Gemini: {str(e)}")
            return Response(
                {"error": "Failed to generate response"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected error in chat view: {str(e)}")
        return Response(
            {"error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
            return Response(
                {"error": "Only admins can update travel requests"}, status=403
            )
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        return super().update(request, *args, **kwargs)
