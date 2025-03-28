import React, { useState, useEffect } from 'react';
import { bookApi, courseApi } from '../services/api';
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
    Space,
    Select,
    DatePicker
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [form] = Form.useForm();

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await bookApi.getAll();
            setBooks(response.data);
        } catch (error) {
            message.error('Failed to fetch books');
        }
        setLoading(false);
    };

    const fetchCourses = async () => {
        try {
            const response = await courseApi.getAll();
            setCourses(response.data);
        } catch (error) {
            message.error('Failed to fetch courses');
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchCourses();
    }, []);

    const handleCreate = () => {
        setEditingBook(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingBook(record);
        form.setFieldsValue({
            ...record,
            publication_date: dayjs(record.publication_date),
        });
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await bookApi.delete(id);
            message.success('Book deleted successfully');
            fetchBooks();
        } catch (error) {
            message.error('Failed to delete book');
        }
    };

    const handleSubmit = async (values) => {
        const data = {
            ...values,
            publication_date: values.publication_date.format('YYYY-MM-DD'),
        };

        try {
            if (editingBook) {
                await bookApi.update(editingBook.id, data);
                message.success('Book updated successfully');
            } else {
                await bookApi.create(data);
                message.success('Book created successfully');
            }
            setModalVisible(false);
            fetchBooks();
        } catch (error) {
            message.error('Failed to save book');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'ISBN',
            dataIndex: 'isbn',
            key: 'isbn',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `£${price}`,
        },
        {
            title: 'Available',
            dataIndex: 'is_available',
            key: 'is_available',
            render: (available) => (available ? 'Yes' : 'No'),
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
                        title="Are you sure you want to delete this book?"
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
                    Add Book
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={books}
                rowKey="id"
                loading={loading}
            />

            <Modal
                title={editingBook ? 'Edit Book' : 'Add Book'}
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
                        name="author"
                        label="Author"
                        rules={[{ required: true, message: 'Please enter author' }]}
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
                        name="course"
                        label="Course"
                        rules={[{ required: true, message: 'Please select course' }]}
                    >
                        <Select>
                            {courses.map(course => (
                                <Select.Option key={course.id} value={course.id}>
                                    {course.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="isbn"
                        label="ISBN"
                        rules={[{ required: true, message: 'Please enter ISBN' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="publication_date"
                        label="Publication Date"
                        rules={[{ required: true, message: 'Please select publication date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
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
                        name="is_available"
                        label="Available"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingBook ? 'Update' : 'Create'}
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

export default BookList; 