from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ChatView.as_view(), name='chat'),
    path('generate/', views.GenerateContentView.as_view(), name='generate'),
] 