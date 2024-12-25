import React, { useEffect, useState } from "react";
import images from "./utils";
const { settingsBG } = images;

function Settings() {

    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [language, setLanguage] = useState("en");
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        push: true,
    });

    // Move fetchUserData outside useEffect
    const fetchUserData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/currentuser", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const userData = await response.json();
                setProfile({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                });
                setLanguage(userData.language || "en");
                setNotifications(userData.notifications || {
                    email: true,
                    push: true,
                });
                if (userData.profilePicture) {
                    const pictureUrl = userData.profilePicture.startsWith('http') 
                        ? userData.profilePicture 
                        : `http://localhost:5000/${userData.profilePicture}`;
                    setPreviewUrl(pictureUrl);
                }
                localStorage.setItem('userSettings', JSON.stringify(userData));
            } else {
                const errorData = await response.json();
                if (response.status === 440 || errorData.error === 'Session expired') {
                    alert('Your session has expired. Please login again.');
                    localStorage.removeItem('userSettings');
                    window.location.href = '/login';
                    return;
                }
                console.error("Error fetching user data:", errorData.error);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    useEffect(() => {
        fetchUserData(); // Call fetchUserData when component mounts
    }, []);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file); // Store the actual file
            const previewURL = URL.createObjectURL(file);
            setPreviewUrl(previewURL); // Create URL for preview
            console.log('Preview URL set:', previewURL);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotifications({ ...notifications, [name]: checked });
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
    };

    const saveSettings = async () => {
        if (window.confirm("Are you sure you want to save these changes?")) {
            const formData = new FormData();
            
            if (profilePicture instanceof File) {
                formData.append('profilePicture', profilePicture);
                console.log('Appending profile picture:', profilePicture.name);
            }
            
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            formData.append('phone', profile.phone || '');
            formData.append('language', language);
            formData.append('notifications', JSON.stringify(notifications));

            try {
                console.log('Sending settings update...');
                const response = await fetch('http://localhost:5000/api/settings', {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData
                });

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Received non-JSON response from server");
                }

                const data = await response.json();
                
                if (response.ok) {
                    alert(data.message);
                    if (data.user.profilePicture) {
                        setPreviewUrl(data.user.profilePicture);
                    }
                    fetchUserData();
                } else {
                    if (response.status === 440 || data.error === 'Session expired') {
                        alert('Your session has expired. Please login again.');
                        localStorage.removeItem('userSettings');
                        window.location.href = '/login';
                        return;
                    }
                    console.error('Settings update failed:', data);
                    alert(data.error || 'Error saving settings.');
                }
            } catch (error) {
                console.error('Network error:', error);
                alert('Error saving settings: ' + error.message);
            }
        }
    };

    // Add session check interval
    useEffect(() => {
        // Check session every 30 seconds
        const sessionCheckInterval = setInterval(async () => {
            try {
                const response = await fetch("http://localhost:5000/api/currentuser", {
                    method: "GET",
                    credentials: "include",
                });
                
                if (response.status === 440 || (response.status === 401 && (await response.json()).error === 'Session expired')) {
                    clearInterval(sessionCheckInterval);
                    alert('Your session has expired. Please login again.');
                    localStorage.removeItem('userSettings');
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error("Session check error:", error);
            }
        }, 30000); // Check every 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(sessionCheckInterval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8"
            style={{
                backgroundImage: `url(${settingsBG})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}

        >
            <div className="max-w-4xl mx-auto bg-white bg-opacity-70 shadow-lg rounded-lg p-6">
                <h1 className="text-4xl font-extrabold text-green-700 text-center mb-8">
                    Settings
                </h1>

                {/* Profile Settings */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Profile Settings
                    </h2>
                    <div className="pb-5">
                        <label htmlFor="profilePicture" className="block text-lg font-medium text-gray-700">Profile Picture</label>
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="mt-2 block w-full border border-gray-300 rounded-md p-3 text-lg"
                        />
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Profile Preview"
                                className="mt-2 h-20 w-20 rounded-full"
                            />
                        )}

                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-600 mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2">Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Notification Settings
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="email"
                                checked={notifications.email}
                                onChange={handleNotificationChange}
                                className="mr-3"
                            />
                            <label>Email Notifications</label>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="push"
                                checked={notifications.push}
                                onChange={handleNotificationChange}
                                className="mr-3"
                            />
                            <label>Push Notifications</label>
                        </div>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Language Preferences
                    </h2>
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="w-full border border-gray-300 rounded-lg p-3"
                    >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                    </select>
                </div>

                {/* Save Button */}
                <div className="text-center">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                        onClick={saveSettings}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
