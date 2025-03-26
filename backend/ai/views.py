from django.shortcuts import render
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class ChatView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: Implement chat functionality
        return Response({
            'message': 'Chat endpoint is under development'
        }, status=status.HTTP_200_OK)

class GenerateContentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # TODO: Implement content generation
        return Response({
            'message': 'Content generation endpoint is under development'
        }, status=status.HTTP_200_OK)
