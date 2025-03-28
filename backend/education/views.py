from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Course, Book, UserLearningHistory, Test, Question, Choice, UserTestAttempt
from .serializers import (
    CourseSerializer, BookSerializer, UserLearningHistorySerializer,
    TestSerializer, QuestionSerializer, ChoiceSerializer, UserTestAttemptSerializer
)
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

class TestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = Test.objects.all()
        if self.action == 'list':
            course_id = self.request.query_params.get('course', None)
            if course_id:
                queryset = queryset.filter(course_id=course_id)
        return queryset

    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        test = self.get_object()
        attempt = UserTestAttempt.objects.create(user=request.user, test=test)
        return Response(UserTestAttemptSerializer(attempt).data)

    @action(detail=True, methods=['post'])
    def submit_attempt(self, request, pk=None):
        test = self.get_object()
        attempt = get_object_or_404(UserTestAttempt, user=request.user, test=test)
        
        if attempt.completed_at:
            return Response(
                {'error': 'Test attempt already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = request.data.get('answers', {})
        score = 0
        total_points = 0

        for question in test.questions.all():
            total_points += question.points
            if question.question_type == 'multiple_choice':
                selected_choice = get_object_or_404(Choice, id=answers.get(str(question.id)))
                if selected_choice.is_correct:
                    score += question.points
            elif question.question_type == 'true_false':
                if answers.get(str(question.id)) == question.choices.first().is_correct:
                    score += question.points
            elif question.question_type == 'short_answer':
                # Implement short answer validation logic here
                pass

        attempt.score = score
        attempt.completed_at = timezone.now()
        attempt.passed = score >= test.passing_score
        attempt.save()

        return Response({
            'score': score,
            'total_points': total_points,
            'passed': attempt.passed,
            'passing_score': test.passing_score
        })

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = Question.objects.all()
        if self.action == 'list':
            test_id = self.request.query_params.get('test', None)
            if test_id:
                queryset = queryset.filter(test_id=test_id)
        return queryset

class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        queryset = Choice.objects.all()
        if self.action == 'list':
            question_id = self.request.query_params.get('question', None)
            if question_id:
                queryset = queryset.filter(question_id=question_id)
        return queryset

class UserTestAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = UserTestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserTestAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
