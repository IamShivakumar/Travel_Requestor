from django.shortcuts import render
from rest_framework import viewsets,permissions
from rest_framework.response import Response
from .models import TravelRegistration
from .serializers import TravelRegistrationSerializer
# Create your views here.
class TravelRequestViewSet(viewsets.ModelViewSet):
    queryset = TravelRegistration.objects.all()
    serializer_class = TravelRegistrationSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update']: 
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TravelRegistration.objects.all()
        return TravelRegistration.objects.filter(user=user)

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