import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        isAdmin: false
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (err) {
            setError('Error fetching users');
            console.error('Error:', err);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            isAdmin: user.isAdmin || false
        });
        setIsEditing(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUsers(users.map(user => 
                    user._id === updatedUser._id ? updatedUser : user
                ));
                setIsEditing(false);
                setSelectedUser(null);
            }
        } catch (err) {
            setError('Error updating user');
            console.error('Error:', err);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setUsers(users.filter(user => user._id !== userId));
            }
        } catch (err) {
            setError('Error deleting user');
            console.error('Error:', err);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">User Management</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* User List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Admin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.phone || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isAdmin ? (
                                        <FaCheck className="text-green-500" />
                                    ) : (
                                        <FaTimes className="text-red-500" />
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Edit User</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.isAdmin}
                                    onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Admin User
                                </label>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement; 