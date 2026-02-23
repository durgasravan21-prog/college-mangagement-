import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ setToken }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', { email, password });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            navigate('/dashboard');
        } catch (err) {
            alert('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Vendor Portal</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email" placeholder="Email"
                        className="w-full p-2 border rounded"
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password" placeholder="Password"
                        className="w-full p-2 border rounded"
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Are you a new vendor? <Link to="/register" className="text-blue-600">Register Here</Link>
                </p>
            </div>
        </div>
    );
}