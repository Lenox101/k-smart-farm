import React, { useState, useEffect } from 'react';
import { FaUsers, FaStore, FaTools, FaComments } from 'react-icons/fa';

function Dashboard() {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        farmInputs: 0,
        forumPosts: 0,
        recentActivities: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/admin/stats', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold">{stats.users}</h3>
                        </div>
                        <FaUsers className="text-3xl text-blue-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Total Products</p>
                            <h3 className="text-2xl font-bold">{stats.products}</h3>
                        </div>
                        <FaStore className="text-3xl text-green-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Farm Inputs</p>
                            <h3 className="text-2xl font-bold">{stats.farmInputs}</h3>
                        </div>
                        <FaTools className="text-3xl text-orange-500" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500">Forum Posts</p>
                            <h3 className="text-2xl font-bold">{stats.forumPosts}</h3>
                        </div>
                        <FaComments className="text-3xl text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {stats.recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                            <div>
                                <p className="font-semibold">{activity.type}</p>
                                <p className="text-sm text-gray-500">{activity.description}</p>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 