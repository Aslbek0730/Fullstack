import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import CourseList from './components/CourseList';
import BookList from './components/BookList';
import Login from './components/Login';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => (
    <PrivateRoute>
        <AdminLayout>{children}</AdminLayout>
    </PrivateRoute>
);

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/admin/courses"
                    element={
                        <AdminRoute>
                            <CourseList />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/books"
                    element={
                        <AdminRoute>
                            <BookList />
                        </AdminRoute>
                    }
                />
                <Route path="/" element={<Navigate to="/admin/courses" />} />
            </Routes>
        </Router>
    );
};

export default App; 