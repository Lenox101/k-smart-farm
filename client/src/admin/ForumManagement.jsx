import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaComment } from 'react-icons/fa';

function ForumManagement() {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        category: ''
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/forum/posts', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (err) {
            setError('Error fetching forum posts');
            console.error('Error:', err);
        }
    };

    const handleEdit = (post) => {
        setSelectedPost(post);
        setEditForm({
            title: post.title,
            content: post.content,
            category: post.category
        });
        setIsEditing(true);
    };

    const handleView = (post) => {
        setSelectedPost(post);
        setIsViewing(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/forum/posts/${selectedPost._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(post => 
                    post._id === updatedPost._id ? updatedPost : post
                ));
                setIsEditing(false);
                setSelectedPost(null);
            }
        } catch (err) {
            setError('Error updating forum post');
            console.error('Error:', err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/forum/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setPosts(posts.filter(post => post._id !== postId));
            }
        } catch (err) {
            setError('Error deleting forum post');
            console.error('Error:', err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/forum/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const updatedPost = await response.json();
                setPosts(posts.map(post => 
                    post._id === postId ? updatedPost : post
                ));
                if (selectedPost?._id === postId) {
                    setSelectedPost(updatedPost);
                }
            }
        } catch (err) {
            setError('Error deleting comment');
            console.error('Error:', err);
        }
    };

    const filteredPosts = filter === 'all' 
        ? posts 
        : posts.filter(post => post.category === filter);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Forum Management</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filter */}
            <div className="mb-6">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="all">All Categories</option>
                    <option value="Crop Farming">Crop Farming</option>
                    <option value="Pest Control">Pest Control</option>
                    <option value="Market Trends">Market Trends</option>
                    <option value="Uncategorized">Uncategorized</option>
                </select>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Author
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comments
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Likes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPosts.map(post => (
                            <tr key={post._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {post.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {post.author.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {post.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <FaComment className="text-gray-400 mr-2" />
                                        {post.comments.length}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {post.likes.length}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleView(post)}
                                        className="text-gray-600 hover:text-gray-900 mr-4"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post._id)}
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

            {/* View Modal */}
            {isViewing && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Post Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <p className="mt-1 text-lg font-medium">{selectedPost.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Author</label>
                                <p className="mt-1">{selectedPost.author.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <p className="mt-1">{selectedPost.category}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content</label>
                                <p className="mt-1 whitespace-pre-wrap">{selectedPost.content}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Comments</label>
                                <div className="mt-2 space-y-4">
                                    {selectedPost.comments.map(comment => (
                                        <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{comment.author.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteComment(selectedPost._id, comment._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                            <p className="mt-2">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setIsViewing(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Edit Post</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Crop Farming">Crop Farming</option>
                                    <option value="Pest Control">Pest Control</option>
                                    <option value="Market Trends">Market Trends</option>
                                    <option value="Uncategorized">Uncategorized</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Content
                                </label>
                                <textarea
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="6"
                                />
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

export default ForumManagement; 