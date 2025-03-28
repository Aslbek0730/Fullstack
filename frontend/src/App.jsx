import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import Login from './components/Login';
import Register from './components/Register';
import AdminLayout from './components/admin/AdminLayout';
import CourseList from './components/admin/CourseList';
import BookList from './components/BookList';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/admin"
                            element={
                                <AuthGuard>
                                    <AdminLayout>
                                        <Navigate to="/admin/courses" replace />
                                    </AdminLayout>
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/admin/courses"
                            element={
                                <AuthGuard>
                                    <AdminLayout>
                                        <CourseList />
                                    </AdminLayout>
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/admin/books"
                            element={
                                <AuthGuard>
                                    <AdminLayout>
                                        <BookList />
                                    </AdminLayout>
                                </AuthGuard>
                            }
                        />
                        <Route path="/" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App; 