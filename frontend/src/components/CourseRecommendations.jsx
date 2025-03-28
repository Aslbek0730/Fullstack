import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Rate, Progress, Tag, Typography, Spin } from 'antd';
import { courseApi } from '../services/api';

const { Title, Text } = Typography;

const CourseRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await courseApi.getRecommendations();
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Recommended Courses</Title>
            <Row gutter={[16, 16]}>
                {recommendations.map(course => (
                    <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
                        <Card
                            hoverable
                            cover={
                                <div style={{ 
                                    height: '200px', 
                                    background: '#f0f2f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text strong>{course.title}</Text>
                                </div>
                            }
                        >
                            <Card.Meta
                                description={
                                    <div>
                                        <Text type="secondary">{course.description}</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            {course.tags.map(tag => (
                                                <Tag key={tag.id} color="blue">
                                                    {tag.name}
                                                </Tag>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">Difficulty: </Text>
                                            <Tag color={
                                                course.difficulty_level === 'beginner' ? 'green' :
                                                course.difficulty_level === 'intermediate' ? 'orange' : 'red'
                                            }>
                                                {course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
                                            </Tag>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">Price: </Text>
                                            <Text strong>£{course.price}</Text>
                                        </div>
                                        {course.user_progress && (
                                            <div style={{ marginTop: '8px' }}>
                                                <Progress
                                                    percent={course.user_progress.progress}
                                                    size="small"
                                                    status={course.user_progress.completed ? "success" : "active"}
                                                />
                                                {course.user_progress.rating && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        <Rate disabled defaultValue={course.user_progress.rating} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CourseRecommendations; 