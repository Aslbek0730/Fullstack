import React, { useState, useEffect } from 'react';
import { courseApi } from '../services/api';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    message,
    Popconfirm,
    Space
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [form] = Form.useForm();

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await courseApi.getAll();
            setCourses(response.data);
        } catch (error) {
            message.error('Failed to fetch courses');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreate = () => {
        setEditingCourse(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCourse(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await courseApi.delete(id);
            message.success('Course deleted successfully');
            fetchCourses();
        } catch (error) {
            message.error('Failed to delete course');
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingCourse) {
                await courseApi.update(editingCourse.id, values);
                message.success('Course updated successfully');
            } else {
                await courseApi.create(values);
                message.success('Course created successfully');
            }
            setModalVisible(false);
            fetchCourses();
        } catch (error) {
            message.error('Failed to save course');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `£${price}`,
        },
        {
            title: 'Duration (weeks)',
            dataIndex: 'duration',
            key: 'duration',
        },
        {
            title: 'Active',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (active ? 'Yes' : 'No'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this course?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Add Course
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={courses}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingCourse ? 'Edit Course' : 'Add Course'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            precision={2}
                            prefix="£"
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Duration (weeks)"
                        rules={[{ required: true, message: 'Please enter duration' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingCourse ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CourseList; 