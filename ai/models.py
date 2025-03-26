from django.db import models
from django.conf import settings
from courses.models import Course

class ChatConversation(models.Model):
    """Model for storing chat conversations with the AI assistant."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_conversations')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.email} - {self.created_at}"

class ChatMessage(models.Model):
    """Model for storing individual chat messages."""
    conversation = models.ForeignKey(ChatConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.conversation.user.email} - {self.role} - {self.created_at}"

class CourseRecommendation(models.Model):
    """Model for storing course recommendations."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='course_recommendations')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='recommendations')
    score = models.FloatField()  # Recommendation score/confidence
    reason = models.TextField()  # Explanation for the recommendation
    is_viewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']
        unique_together = ['user', 'course']

    def __str__(self):
        return f"{self.user.email} - {self.course.title}"

class UserEmbedding(models.Model):
    """Model for storing user embeddings for recommendation system."""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='embedding')
    embedding_vector = models.JSONField()  # Store the embedding as a JSON array
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Embedding"

class CourseEmbedding(models.Model):
    """Model for storing course embeddings for recommendation system."""
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='embedding')
    embedding_vector = models.JSONField()  # Store the embedding as a JSON array
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.course.title} - Embedding" 