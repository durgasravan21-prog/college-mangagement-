import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '', password: '', businessName: '', governmentId: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/register', formData);
            if (res.data.verified) {
                alert("Verified! Please Login.");
                navigate('/login');
            } else {
                alert("Verification Failed. Fake ID detected.");
            }
        } catch (err) {
            alert("Error registering");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Vendor Registration</h2>
                <p className="text-xs text-gray-500 mb-4 text-center">Use a Government ID starting with 'GOV' to pass verification.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" placeholder="Business Name" className="w-full p-2 border rounded"
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                    <input type="text" placeholder="Gov ID (Tax/EIN)" className="w-full p-2 border rounded"
                        onChange={e => setFormData({ ...formData, governmentId: e.target.value })} />
                    <input type="email" placeholder="Email" className="w-full p-2 border rounded"
                        onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input type="password" placeholder="Password" className="w-full p-2 border rounded"
                        onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    <button className="w-full bg-green-6002 rounded hover:bg text-white p--green-700">
                        Verify & Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    <Link to="/login" className="text-blue-600">Back to Login</Link>
                </p>
            </div>
        </div>
    );
}
