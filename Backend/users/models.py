from django.db import models
from authentication.models import User

# Create your models here.
class TravelRegistration(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    TRAVEL_MODES = [
        ('train', 'By Train'),
        ('flight', 'By Flight'),
    ]
    BOOKING_MODES = [
        ('self', 'Self'),
        ('travelDesk', 'Travel Desk'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_name = models.CharField(max_length=255)
    travel_purpose = models.TextField()
    start_date = models.DateField()
    travel_mode = models.CharField(max_length=10, choices=TRAVEL_MODES)
    booking_mode = models.CharField(max_length=10, choices=BOOKING_MODES)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    class Meta:
        db_table='travel_requests'

