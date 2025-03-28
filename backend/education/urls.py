from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'learning-history', views.UserLearningHistoryViewSet, basename='learning-history')
router.register(r'tests', views.TestViewSet)
router.register(r'questions', views.QuestionViewSet)
router.register(r'choices', views.ChoiceViewSet)
router.register(r'test-attempts', views.UserTestAttemptViewSet, basename='test-attempts')

urlpatterns = [
    path('', include(router.urls)),
] 