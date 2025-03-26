import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  PlayCircle as PlayCircleIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  locked: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  lessons: Lesson[];
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/courses/${id}`);
      setCourse(response.data);
      if (response.data.lessons.length > 0) {
        setSelectedLesson(response.data.lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    if (!lesson.locked) {
      setSelectedLesson(lesson);
    }
  };

  if (loading || !course) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Course Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {course.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {course.description}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label={course.level} color="primary" sx={{ mr: 1 }} />
              <Chip label={course.duration} color="secondary" />
            </Box>
          </Paper>

          {selectedLesson && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedLesson.title}
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  backgroundColor: '#000',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  src={selectedLesson.videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Course Lessons */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Content
            </Typography>
            <List>
              {course.lessons.map((lesson, index) => (
                <div key={lesson.id}>
                  <ListItem
                    button
                    onClick={() => handleLessonSelect(lesson)}
                    selected={selectedLesson?.id === lesson.id}
                    sx={{
                      backgroundColor: lesson.locked
                        ? 'rgba(0, 0, 0, 0.04)'
                        : 'transparent',
                    }}
                  >
                    <ListItemIcon>
                      {lesson.completed ? (
                        <CheckCircleIcon color="success" />
                      ) : lesson.locked ? (
                        <LockIcon color="disabled" />
                      ) : (
                        <PlayCircleIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={lesson.title}
                      secondary={lesson.duration}
                    />
                  </ListItem>
                  {index < course.lessons.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 