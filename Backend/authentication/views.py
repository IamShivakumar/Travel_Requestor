from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework import status
from .serializers import userSerializer
from rest_framework.response import Response
from .models import User

# Create your views here.
class UserSignupView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        user_data = {
            "username": request.data.get("username"),
            "email": request.data.get("email"),
            "password": request.data.get("password"),
        }
        serializer = userSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User Created Successfully", "user": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"message": "Validation failed", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        is_admin = request.data.get("isAdmin", False)
        print(email,password,is_admin)
        user = authenticate(request, username=email, password=password)
        if user is not None:
            if is_admin and not user.is_staff:
                return Response(
                    {"error": "You are not authorized as an admin."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            user_data = userSerializer(user).data
            return Response(
                {
                    "message": "Login successful",
                    "user": user_data,
                    "access_token": access_token,
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

