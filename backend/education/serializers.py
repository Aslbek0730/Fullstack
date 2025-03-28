from rest_framework import serializers
from .models import Course, Book, UserLearningHistory, CourseTag, Test, Question, Choice, UserTestAttempt

class CourseTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTag
        fields = ['id', 'name']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class CourseSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    tags = CourseTagSerializer(many=True, read_only=True)
    user_progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'instructor_name')

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            history = UserLearningHistory.objects.filter(
                user=request.user,
                course=obj
            ).first()
            if history:
                return {
                    'progress': history.progress,
                    'completed': history.completed,
                    'rating': history.rating
                }
        return None

    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)

class UserLearningHistorySerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_description = serializers.CharField(source='course.description', read_only=True)

    class Meta:
        model = UserLearningHistory
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'last_accessed')

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'is_correct']
        read_only_fields = ('created_at',)

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'points', 'choices']
        read_only_fields = ('created_at', 'updated_at')

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Test
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class UserTestAttemptSerializer(serializers.ModelSerializer):
    test_title = serializers.CharField(source='test.title', read_only=True)
    course_title = serializers.CharField(source='test.course.title', read_only=True)

    class Meta:
        model = UserTestAttempt
        fields = '__all__'
        read_only_fields = ('user', 'started_at', 'completed_at', 'passed') 