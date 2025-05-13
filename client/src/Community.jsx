import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import images from "./utils";
import Footer from "./Footer";
const { communityBack } = images;

function CommunityForum() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    const [currentUser, setCurrentUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const mainContainerRef = useRef(null);
    const forumPostsRef = useRef(null);
    const [editingPost, setEditingPost] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState({});

    const categories = ["All", "Crop Farming", "Pest Control", "Market Trends"];

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/currentuser', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                }
            } catch (err) {
                console.error('Error fetching current user:', err);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const url = selectedCategory === "all" 
                    ? 'http://localhost:5000/api/forum/posts'
                    : `http://localhost:5000/api/forum/posts?category=${selectedCategory}`;
                
                const response = await fetch(url, {
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Failed to fetch posts');
                
                const data = await response.json();
                setPosts(data);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category.toLowerCase());
    };

    const handlePostSubmit = async () => {
        if (!currentUser) {
            setError("Please log in to create a post");
            return;
        }

        if (!newPost.title.trim() || !newPost.content.trim()) {
            setError("Please provide both title and content for your post");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/forum/posts', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newPost.title,
                    content: newPost.content,
                    category: selectedCategory === "all" ? "Uncategorized" : selectedCategory
                })
            });

            if (!response.ok) throw new Error('Failed to create post');

            const newPostData = await response.json();
            setPosts([newPostData, ...posts]);
            setNewPost({ title: "", content: "" });
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLikePost = async (postId) => {
        if (!currentUser) {
            setError("Please log in to like posts");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}/like`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Failed to like post');

            const updatedPost = await response.json();
            setPosts(posts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditPost = async (postId) => {
        if (!currentUser) {
            setError("Please log in to edit posts");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editingPost.title,
                    content: editingPost.content,
                    category: editingPost.category
                })
            });

            if (!response.ok) throw new Error('Failed to update post');

            const updatedPost = await response.json();
            setPosts(posts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            ));
            setEditingPost(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddComment = async (postId) => {
        if (!currentUser) {
            setError("Please log in to comment");
            return;
        }

        if (!newComment.trim()) {
            setError("Comment cannot be empty");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newComment })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const updatedPost = await response.json();
            setPosts(posts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            ));
            setNewComment("");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!currentUser) {
            setError("Please log in to delete posts");
            return;
        }

        // Prompt the user for confirmation
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) {
            return; // Exit the function if the user cancels
        }

        try {
            const response = await fetch(`http://localhost:5000/api/forum/posts/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to delete post');

            // Remove the deleted post from the state
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            setError(err.message);
        }
    };

    // GSAP animations
    useEffect(() => {
        gsap.from(mainContainerRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.6,
        });
        gsap.to(mainContainerRef.current, {
            opacity: 1,
            y: 0,
            duration: 1.5,
        });
    }, []);

    useEffect(() => {
        if (posts.length > 0) {
            gsap.from(forumPostsRef.current.children, {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.2,
            });
            gsap.to(forumPostsRef.current.children, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.2,
            });
        }
    }, [posts]);

    if (isLoading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <>
        <div className="min-h-screen bg-gray-50 p-8" 
            style={{
                backgroundImage: `url(${communityBack})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
            <div ref={mainContainerRef} className="max-w-4xl bg-black bg-opacity-30 mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-4xl font-extrabold text-green-700 text-center mb-8">
                    Community Forum
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Categories Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Categories</h2>
                    <div className="flex flex-wrap gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`py-2 px-4 rounded-lg font-semibold ${
                                    selectedCategory === category.toLowerCase()
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                }`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create a New Post Section */}
                {currentUser && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a Post</h2>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-4 mb-4"
                            placeholder="Post title..."
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-4 mb-4"
                            rows="4"
                            placeholder="Share your advice or ask a question..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
                            onClick={handlePostSubmit}
                        >
                            Post
                        </button>
                    </div>
                )}

                {/* Forum Posts Section */}
                <div ref={forumPostsRef}>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Discussions</h2>
                    <div className="space-y-6">
                        {posts
                            .filter(post => post.author) // Filter out posts with deleted authors
                            .map((post) => (
                                <div
                                    key={post._id}
                                    className="bg-gray-100 p-4 rounded-lg shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-green-700 font-semibold">
                                            {post.category}
                                        </span>
                                        {post.author && (
                                            <span className="text-sm text-gray-600">
                                                Posted by {post.author.name}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {editingPost && editingPost._id === post._id ? (
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                                value={editingPost.title}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    title: e.target.value
                                                })}
                                            />
                                            <textarea
                                                className="w-full border border-gray-300 rounded-lg p-2"
                                                value={editingPost.content}
                                                onChange={(e) => setEditingPost({
                                                    ...editingPost,
                                                    content: e.target.value
                                                })}
                                                rows="3"
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                                    onClick={() => handleEditPost(post._id)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                    onClick={() => setEditingPost(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                            <p className="text-gray-700 mb-4">{post.content}</p>
                                        </>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <button
                                                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                                                onClick={() => handleLikePost(post._id)}
                                            >
                                                {post.likes.includes(currentUser?._id) ? (
                                                    <FaHeart className="text-green-600" />
                                                ) : (
                                                    <FaRegHeart />
                                                )}
                                                <span>{post.likes.length}</span>
                                            </button>
                                            <button
                                                className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                                                onClick={() => setShowComments({
                                                    ...showComments,
                                                    [post._id]: !showComments[post._id]
                                                })}
                                            >
                                                <FaRegComment />
                                                <span>{post.comments.length}</span>
                                            </button>
                                        </div>
                                        {currentUser && post.author && currentUser._id === post.author._id && (
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-yellow-600 hover:text-yellow-700"
                                                    onClick={() => setEditingPost(post)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-700"
                                                    onClick={() => handleDeletePost(post._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    {showComments[post._id] && (
                                        <div className="mt-4 space-y-4">
                                            {post.comments
                                                .filter(comment => comment.author) // Filter out comments with deleted authors
                                                .map((comment) => (
                                                    <div key={comment._id} className="bg-white p-3 rounded">
                                                        {comment.author && (
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                {comment.author.name}
                                                            </div>
                                                        )}
                                                        <p>{comment.content}</p>
                                                        {currentUser && comment.author && currentUser._id === comment.author._id && (
                                                            <button
                                                                className="text-red-600 hover:text-red-700 text-sm mt-1"
                                                                onClick={() => handleDeleteComment(post._id, comment._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            {currentUser && (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        className="flex-1 border border-gray-300 rounded p-2"
                                                    />
                                                    <button
                                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                                        onClick={() => handleAddComment(post._id)}
                                                    >
                                                        Comment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        {posts.length === 0 && (
                            <p className="text-gray-600 text-center">No posts in this category yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default CommunityForum;