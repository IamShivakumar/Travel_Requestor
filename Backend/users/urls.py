from django.urls import path
from .views import TravelRequestViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'travel-requests', TravelRequestViewSet, basename='travel-request')

urlpatterns = [
    
]

urlpatterns += router.urls
