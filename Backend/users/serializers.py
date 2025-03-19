from rest_framework import serializers
from .models import TravelRegistration

class TravelRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = TravelRegistration
        fields = '__all__'
        read_only_fields = ['user']

    def validate_start_date(self, value):
        from datetime import date
        if value <= date.today():
            raise serializers.ValidationError("Start date must be a future date.")
        return value

    def validate(self, data):
        start_location = data.get('start_location')
        end_location = data.get('end_location')
        if start_location and end_location and start_location == end_location:
            raise serializers.ValidationError("Start and end locations cannot be the same.")
        return data
