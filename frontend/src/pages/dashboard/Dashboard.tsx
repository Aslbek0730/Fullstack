import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CourseProgress {
  courseId: string;
  title: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface LearningStats {
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  averageScore: number;
}

export default function Dashboard() {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [progressResponse, statsResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/dashboard/progress'),
        axios.get('http://localhost:3000/api/dashboard/stats'),
      ]);

      setCourseProgress(progressResponse.data);
      setLearningStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressChartData = {
    labels: courseProgress.map((course) => course.title),
    datasets: [
      {
        label: 'Course Progress',
        data: courseProgress.map((course) => course.progress),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const completionChartData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
      {
        data: [
          learningStats.completedCourses,
          learningStats.totalCourses - learningStats.completedCourses,
        ],
        backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
      },
    ],
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Learning Statistics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Learning Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {learningStats.totalCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Courses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {learningStats.completedCourses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Courses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {learningStats.totalHours}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {learningStats.averageScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Course Completion Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Completion
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={completionChartData} />
            </Box>
          </Paper>
        </Grid>

        {/* Course Progress Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Course Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={progressChartData} />
            </Box>
          </Paper>
        </Grid>

        {/* Course List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Courses
            </Typography>
            <List>
              {courseProgress.map((course) => (
                <ListItem key={course.courseId}>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={course.title}
                    secondary={`${course.completedLessons}/${course.totalLessons} lessons completed`}
                  />
                  <Box sx={{ width: '200px', mr: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {course.progress}%
                  </Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 