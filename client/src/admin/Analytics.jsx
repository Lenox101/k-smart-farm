import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Analytics() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/analytics?range=${timeRange}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            setError('Error fetching analytics data');
            console.error('Error:', err);
        }
    };

    if (!stats) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const userActivityData = {
        labels: stats.userActivity.labels,
        datasets: [
            {
                label: 'New Users',
                data: stats.userActivity.newUsers,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4
            },
            {
                label: 'Active Users',
                data: stats.userActivity.activeUsers,
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                tension: 0.4
            }
        ]
    };

    const productCategoryData = {
        labels: stats.productCategories.labels,
        datasets: [
            {
                label: 'Products by Category',
                data: stats.productCategories.counts,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.5)',
                    'rgba(34, 197, 94, 0.5)',
                    'rgba(239, 68, 68, 0.5)',
                    'rgba(234, 179, 8, 0.5)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(34, 197, 94)',
                    'rgb(239, 68, 68)',
                    'rgb(234, 179, 8)'
                ],
                borderWidth: 1
            }
        ]
    };

    const forumActivityData = {
        labels: stats.forumActivity.labels,
        datasets: [
            {
                label: 'Posts',
                data: stats.forumActivity.posts,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
            {
                label: 'Comments',
                data: stats.forumActivity.comments,
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
            }
        ]
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.summary.totalUsers}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.summary.userGrowth >= 0 ? '+' : ''}{stats.summary.userGrowth}% from last period
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.summary.totalProducts}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.summary.productGrowth >= 0 ? '+' : ''}{stats.summary.productGrowth}% from last period
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Forum Posts</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.summary.totalPosts}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.summary.postGrowth >= 0 ? '+' : ''}{stats.summary.postGrowth}% from last period
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.summary.activeUsers}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.summary.activeUserGrowth >= 0 ? '+' : ''}{stats.summary.activeUserGrowth}% from last period
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Activity Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
                    <Line
                        data={userActivityData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>

                {/* Product Categories Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Categories</h3>
                    <Doughnut
                        data={productCategoryData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false
                                }
                            }
                        }}
                    />
                </div>

                {/* Forum Activity Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Forum Activity</h3>
                    <Bar
                        data={forumActivityData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Analytics; 