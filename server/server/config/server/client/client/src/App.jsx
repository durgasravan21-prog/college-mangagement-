import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
                />
                <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
            </Routes>
        </Router>
    );
}

export default App;