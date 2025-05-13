import React, { useState, useEffect } from 'react';

function ProtectedRoute({ children, isAdmin }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/currentuser', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const user = await response.json();
                    if (isAdmin && !user.isAdmin) {
                        window.location.href = '/';
                        return;
                    }
                    setCurrentUser(user);
                } else {
                    window.location.href = '/login';
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                window.location.href = '/login';
            }
            setLoading(false);
        };

        checkAuth();
    }, [isAdmin]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return currentUser ? children : null;
}

export default ProtectedRoute;