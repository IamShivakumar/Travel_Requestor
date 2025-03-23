from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TravelRequestViewSet, chat

router = DefaultRouter()
router.register(r'travel-requests', TravelRequestViewSet, basename='travel-request')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', chat, name='chat'),
]
