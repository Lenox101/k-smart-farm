import React, { useState } from 'react';

function AdminRegistration() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        adminKey: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            // First try to register as a new admin
            console.log('Attempting to register admin...');
            let response = await fetch('http://localhost:5000/api/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // Log the response status and headers
            console.log('Registration Response Status:', response.status);
            console.log('Registration Response Headers:', Object.fromEntries(response.headers.entries()));

            // If response is not ok, try to get the error message
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    if (data.error === 'User already exists') {
                        console.log('User exists, attempting login...');
                        // Log in first to get authentication
                        const loginResponse = await fetch('http://localhost:5000/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                email: formData.email,
                                password: formData.password
                            })
                        });

                        if (!loginResponse.ok) {
                            const loginData = await loginResponse.json();
                            setError(loginData.error || 'Invalid credentials');
                            return;
                        }

                        console.log('Login successful, attempting admin upgrade...');
                        // Now update the user to admin
                        const upgradeResponse = await fetch('http://localhost:5000/api/admin/upgrade', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                adminKey: formData.adminKey
                            })
                        });

                        if (!upgradeResponse.ok) {
                            const upgradeData = await upgradeResponse.json();
                            setError(upgradeData.error || 'Failed to upgrade to admin');
                            return;
                        }

                        setSuccess(true);
                        setFormData({
                            name: '',
                            email: '',
                            password: '',
                            adminKey: ''
                        });
                        return;
                    } else {
                        setError(data.error || 'Registration failed');
                        return;
                    }
                } else {
                    // If we got a non-JSON response, get the text content for debugging
                    const textContent = await response.text();
                    console.error('Non-JSON response received:', textContent);
                    setError(`Server error: ${response.status} ${response.statusText}`);
                    return;
                }
            }

            // If we get here, the registration was successful
            const data = await response.json();
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                password: '',
                adminKey: ''
            });
        } catch (err) {
            console.error('Registration error:', err);
            setError(`Connection error: ${err.message}`);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Register/Upgrade to Admin
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your credentials and admin key to register as a new admin or upgrade your existing account
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        Admin privileges granted successfully! You can now log in.
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="adminKey" className="sr-only">Admin Key</label>
                            <input
                                id="adminKey"
                                name="adminKey"
                                type="password"
                                required
                                value={formData.adminKey}
                                onChange={handleChange}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Admin Key"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Register/Upgrade to Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminRegistration; 