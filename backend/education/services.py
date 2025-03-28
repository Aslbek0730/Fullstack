from django.db.models import Avg, Count, StdDev
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from .models import Course, UserLearningHistory, CourseTag

class RecommendationService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.course_vectors = None
        self.courses = None
        self._initialize_vectors()

    def _initialize_vectors(self):
        """Initialize course vectors using TF-IDF"""
        self.courses = Course.objects.all()
        course_texts = [
            f"{course.title} {course.description} {' '.join(tag.name for tag in course.tags.all())} {course.difficulty_level}"
            for course in self.courses
        ]
        self.course_vectors = self.vectorizer.fit_transform(course_texts)

    def get_user_preferences(self, user):
        """Extract user preferences from learning history"""
        history = UserLearningHistory.objects.filter(user=user)
        
        # Get average difficulty level preference
        difficulty_pref = history.values('course__difficulty_level').annotate(
            avg_rating=Avg('rating'),
            count=Count('id')
        ).order_by('-avg_rating').first()
        
        # Get preferred tags
        tag_preferences = history.values('course__tags__name').annotate(
            count=Count('id'),
            avg_rating=Avg('rating')
        ).filter(course__tags__name__isnull=False)
        
        # Get preferred price range
        price_pref = history.aggregate(
            avg_price=Avg('course__price'),
            price_std=StdDev('course__price')
        )
        
        return {
            'difficulty_level': difficulty_pref['course__difficulty_level'] if difficulty_pref else None,
            'tag_preferences': [
                {'tag': pref['course__tags__name'], 'weight': pref['avg_rating'] * pref['count']}
                for pref in tag_preferences
            ],
            'price_range': {
                'min': price_pref['avg_price'] - price_pref['price_std'],
                'max': price_pref['avg_price'] + price_pref['price_std']
            } if price_pref['avg_price'] else None
        }

    def get_recommendations(self, user, limit=5):
        """Get personalized course recommendations for a user"""
        preferences = self.get_user_preferences(user)
        
        # Get courses the user hasn't taken yet
        taken_courses = set(UserLearningHistory.objects.filter(user=user).values_list('course_id', flat=True))
        available_courses = [course for course in self.courses if course.id not in taken_courses]
        
        if not available_courses:
            return []
        
        # Calculate similarity scores
        course_scores = []
        for course in available_courses:
            score = 0
            
            # Content-based similarity
            course_text = f"{course.title} {course.description} {' '.join(tag.name for tag in course.tags.all())} {course.difficulty_level}"
            course_vector = self.vectorizer.transform([course_text])
            similarity = cosine_similarity(course_vector, self.course_vectors).flatten()
            score += np.mean(similarity) * 0.4  # 40% weight for content similarity
            
            # Difficulty level match
            if preferences['difficulty_level'] and course.difficulty_level == preferences['difficulty_level']:
                score += 0.2  # 20% weight for difficulty match
            
            # Tag preferences
            if preferences['tag_preferences']:
                course_tags = set(course.tags.values_list('name', flat=True))
                tag_score = sum(
                    pref['weight'] for pref in preferences['tag_preferences']
                    if pref['tag'] in course_tags
                )
                score += tag_score * 0.2  # 20% weight for tag preferences
            
            # Price range match
            if preferences['price_range']:
                price_range = preferences['price_range']
                if price_range['min'] <= course.price <= price_range['max']:
                    score += 0.2  # 20% weight for price range match
            
            course_scores.append((course, score))
        
        # Sort by score and return top recommendations
        course_scores.sort(key=lambda x: x[1], reverse=True)
        return [course for course, _ in course_scores[:limit]]

    def update_recommendations(self):
        """Update course vectors when new courses are added"""
        self._initialize_vectors() 