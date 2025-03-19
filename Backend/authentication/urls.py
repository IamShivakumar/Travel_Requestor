from django.contrib import admin
from django.urls import path,include
from .views import UserSignupView,LoginUserView

urlpatterns = [
    path('register/',UserSignupView.as_view(),name='CreateUser'),
    path('login/',LoginUserView.as_view(),name='LoginUser'),
]