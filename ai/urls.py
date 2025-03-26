from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'chatbot', views.ChatbotViewSet, basename='chatbot')
router.register(r'recommendations', views.CourseRecommendationViewSet, basename='recommendations')
router.register(r'voice', views.VoiceAssistantViewSet, basename='voice')
router.register(r'assessment', views.AssessmentViewSet, basename='assessment')

urlpatterns = [
    path('', include(router.urls)),
] 