from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Course, Book, UserLearningHistory
from .serializers import CourseSerializer, BookSerializer, UserLearningHistorySerializer
from .services import RecommendationService

# Create your views here.

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = Course.objects.all()
        if self.action == 'list':
            instructor_id = self.request.query_params.get('instructor', None)
            if instructor_id:
                queryset = queryset.filter(instructor_id=instructor_id)
        return queryset

    @action(detail=True, methods=['get'])
    def books(self, request, pk=None):
        course = self.get_object()
        books = Book.objects.filter(course=course)
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        recommendation_service = RecommendationService()
        recommended_courses = recommendation_service.get_recommendations(request.user)
        serializer = self.get_serializer(recommended_courses, many=True)
        return Response(serializer.data)

class UserLearningHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = UserLearningHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserLearningHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        history = self.get_object()
        progress = request.data.get('progress')
        if progress is not None:
            history.progress = progress
            if progress >= 100:
                history.completed = True
            history.save()
            return Response(self.get_serializer(history).data)
        return Response(
            {'error': 'Progress value is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def rate_course(self, request, pk=None):
        history = self.get_object()
        rating = request.data.get('rating')
        if rating is not None and 1 <= rating <= 5:
            history.rating = rating
            history.save()
            return Response(self.get_serializer(history).data)
        return Response(
            {'error': 'Rating must be between 1 and 5'},
            status=status.HTTP_400_BAD_REQUEST
        )

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = Book.objects.all()
        if self.action == 'list':
            course_id = self.request.query_params.get('course', None)
            if course_id:
                queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course = get_object_or_404(Course, pk=self.request.data.get('course'))
        if course.instructor != self.request.user:
            self.permission_denied(self.request)
        serializer.save()
