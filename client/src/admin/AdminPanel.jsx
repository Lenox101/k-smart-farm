import React, { useState, useEffect } from 'react';
import { FaUsers, FaStore, FaTools, FaComments, FaChartBar, FaTachometerAlt } from 'react-icons/fa';
import UserManagement from './UserManagement';
import ProductManagement from './ProductManagement';
import FarmInputsManagement from './FarmInputsManagement';
import ForumManagement from './ForumManagement';
import Analytics from './Analytics';

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationForm, setRegistrationForm] = useState({
        name: '',
        email: '',
        password: '',
        adminKey: ''
    });

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/currentuser', {
                credentials: 'include'
            });
            if (response.ok) {
                const userData = await response.json();
                if (!userData.isAdmin) {
                    window.location.href = '/';
                    return;
                }
                setCurrentUser(userData);
            }
        } catch (err) {
            setError('Error fetching user data');
            console.error('Error:', err);
        }
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationForm)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Admin registered successfully!');
                setShowRegistration(false);
                setRegistrationForm({
                    name: '',
                    email: '',
                    password: '',
                    adminKey: ''
                });
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Error registering admin');
            console.error('Error:', err);
        }
    };

    if (!currentUser) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
        { id: 'users', label: 'User Management', icon: FaUsers },
        { id: 'products', label: 'Product Management', icon: FaStore },
        { id: 'farminputs', label: 'Farm Inputs', icon: FaTools },
        { id: 'forum', label: 'Forum Management', icon: FaComments },
        { id: 'analytics', label: 'Analytics', icon: FaChartBar }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'products':
                return <ProductManagement />;
            case 'farminputs':
                return <FarmInputsManagement />;
            case 'forum':
                return <ForumManagement />;
            case 'analytics':
                return <Analytics />;
            default:
                return <Analytics />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
                </div>
                <nav className="mt-4">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center px-6 py-3 text-left ${
                                    activeTab === item.id
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setShowRegistration(true)}
                        className="w-full flex items-center px-6 py-3 text-left text-gray-600 hover:bg-gray-50"
                    >
                        <FaUsers className="w-5 h-5 mr-3" />
                        Register New Admin
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>

            {/* Admin Registration Modal */}
            {showRegistration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Register New Admin</h3>
                        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={registrationForm.name}
                                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={registrationForm.email}
                                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    value={registrationForm.password}
                                    onChange={(e) => setRegistrationForm({ ...registrationForm, password: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Admin Key</label>
                                <input
                                    type="password"
                                    value={registrationForm.adminKey}
                                    onChange={(e) => setRegistrationForm({ ...registrationForm, adminKey: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRegistration(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPanel; 