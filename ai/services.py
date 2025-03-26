import openai
from django.conf import settings
from django.db.models import Q
from courses.models import Course
from .models import ChatConversation, ChatMessage, CourseRecommendation, UserEmbedding, CourseEmbedding

class AIChatbotService:
    """Service for handling AI chatbot interactions."""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def get_chat_response(self, conversation_id, user_message):
        """Get AI response for user message."""
        conversation = ChatConversation.objects.get(id=conversation_id)
        messages = conversation.messages.all()
        
        # Prepare conversation history
        messages_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
        
        # Add current user message
        messages_history.append({"role": "user", "content": user_message})
        
        try:
            # Get response from OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages_history,
                temperature=0.7,
                max_tokens=500
            )
            
            # Extract and store the response
            ai_response = response.choices[0].message.content
            ChatMessage.objects.create(
                conversation=conversation,
                role="assistant",
                content=ai_response
            )
            
            return ai_response
            
        except Exception as e:
            return f"Error: {str(e)}"

class CourseRecommendationService:
    """Service for handling course recommendations."""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def generate_user_embedding(self, user):
        """Generate embedding for user interests and learning history."""
        # Combine user interests and learning history
        user_data = f"Interests: {', '.join(user.interests)}\n"
        user_data += f"Learning Progress: {user.learning_progress}"
        
        try:
            response = openai.Embedding.create(
                model="text-embedding-ada-002",
                input=user_data
            )
            
            # Store the embedding
            UserEmbedding.objects.update_or_create(
                user=user,
                defaults={'embedding_vector': response['data'][0]['embedding']}
            )
            
            return response['data'][0]['embedding']
            
        except Exception as e:
            return None

    def generate_course_embedding(self, course):
        """Generate embedding for course content."""
        # Combine course information
        course_data = f"Title: {course.title}\n"
        course_data += f"Description: {course.description}\n"
        course_data += f"Category: {course.category}\n"
        course_data += f"Level: {course.level}"
        
        try:
            response = openai.Embedding.create(
                model="text-embedding-ada-002",
                input=course_data
            )
            
            # Store the embedding
            CourseEmbedding.objects.update_or_create(
                course=course,
                defaults={'embedding_vector': response['data'][0]['embedding']}
            )
            
            return response['data'][0]['embedding']
            
        except Exception as e:
            return None

    def get_recommendations(self, user, limit=5):
        """Get course recommendations for a user."""
        # Get user embedding
        user_embedding = UserEmbedding.objects.filter(user=user).first()
        if not user_embedding:
            user_embedding = self.generate_user_embedding(user)
            if not user_embedding:
                return []

        # Get all course embeddings
        course_embeddings = CourseEmbedding.objects.all()
        
        # Calculate similarity scores
        recommendations = []
        for course_embedding in course_embeddings:
            if not course_embedding.course.is_published:
                continue
                
            # Calculate cosine similarity
            similarity = self.cosine_similarity(
                user_embedding.embedding_vector,
                course_embedding.embedding_vector
            )
            
            # Generate recommendation reason
            reason = self.generate_recommendation_reason(
                user, course_embedding.course, similarity
            )
            
            recommendations.append({
                'course': course_embedding.course,
                'score': similarity,
                'reason': reason
            })
        
        # Sort by similarity score and get top recommendations
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        top_recommendations = recommendations[:limit]
        
        # Store recommendations
        for rec in top_recommendations:
            CourseRecommendation.objects.update_or_create(
                user=user,
                course=rec['course'],
                defaults={
                    'score': rec['score'],
                    'reason': rec['reason']
                }
            )
        
        return top_recommendations

    def cosine_similarity(self, vec1, vec2):
        """Calculate cosine similarity between two vectors."""
        import numpy as np
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    def generate_recommendation_reason(self, user, course, similarity):
        """Generate explanation for course recommendation."""
        prompt = f"""Based on the user's interests ({', '.join(user.interests)}) 
        and learning progress, explain why this course ({course.title}) would be 
        a good fit. Similarity score: {similarity:.2f}"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=200
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Recommended based on your interests and learning history."

class VoiceAssistantService:
    """Service for handling text-to-speech conversion."""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def text_to_speech(self, text, voice="alloy", model="tts-1"):
        """Convert text to speech using OpenAI's TTS API."""
        try:
            response = openai.audio.speech.create(
                model=model,
                voice=voice,
                input=text
            )
            return response
        except Exception as e:
            return None

class AssessmentService:
    """Service for handling automated test assessment."""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    def grade_free_text_answer(self, question, answer, max_points):
        """Grade free text answers using GPT-4."""
        prompt = f"""Please grade this answer to the following question:
        Question: {question.text}
        Answer: {answer}
        Maximum points: {max_points}
        
        Provide:
        1. Points earned (0 to {max_points})
        2. Brief feedback
        3. Explanation of the grade
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )
            
            # Parse the response
            feedback = response.choices[0].message.content
            
            # Extract points (assuming format: "Points: X")
            import re
            points_match = re.search(r"Points:?\s*(\d+)", feedback)
            points = int(points_match.group(1)) if points_match else 0
            
            return {
                'points': min(points, max_points),
                'feedback': feedback
            }
            
        except Exception as e:
            return {
                'points': 0,
                'feedback': f"Error grading answer: {str(e)}"
            } 