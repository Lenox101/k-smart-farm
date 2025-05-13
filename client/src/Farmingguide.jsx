import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import images from "./utils";
import Footer from "./Footer";
import { FaLeaf, FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa';

const { guide } = images;

function Farmingguides() {
  const [crops, setCrops] = useState([]);
  const [guides, setGuides] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedGuide, setSelectedGuide] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [newGuide, setNewGuide] = useState({
    crop: "",
    title: "",
    content: "",
  });
  const [editGuide, setEditGuide] = useState(null); // For editing
  const guideContentRef = useRef(null);
  const mainContainerRef = useRef(null);
  const cropSelectRef = useRef(null);
  const guidesListRef = useRef(null);

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

  useEffect(() => {
    fetch("http://localhost:5000/api/crops")
      .then((response) => response.json())
      .then((data) => setCrops(data))
      .catch((error) => console.log("Error fetching crops:", error));
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      fetch(`http://localhost:5000/api/guides/${selectedCrop}`)
        .then((response) => response.json())
        .then((data) => setGuides(data))
        .catch((error) => console.log("Error fetching guides:", error));
    }
  }, [selectedCrop]);

  // GSAP Animations
  useEffect(() => {
    // Animate main container on mount
    gsap.fromTo(
      mainContainerRef.current, 
      { opacity: 0, y: 50 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power3.out" 
      }
    );

    // Animate crop select dropdown
    gsap.fromTo(
      cropSelectRef.current,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.6, 
        delay: 0.3,
        ease: "back.out(1.7)"
      }
    );
  }, []);

  // Animation for guides list
  useEffect(() => {
    if (guides.length > 0 && guidesListRef.current) {
      gsap.fromTo(
        guidesListRef.current.children,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [guides]);

  // Animation for adding/editing guide
  const animateGuideForm = () => {
    gsap.fromTo(
      guideContentRef.current,
      { opacity: 0, x: -20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        ease: "power1.out"
      }
    );
  };

  const handleCropChange = (event) => {
    setSelectedCrop(event.target.value);
    setSelectedGuide("");
  };

  const handleNewGuideChange = (e) => {
    const { name, value } = e.target;
    setNewGuide({ ...newGuide, [name]: value });
  };

  const handleAddGuide = () => {
    if (!newGuide.crop || !newGuide.title || !newGuide.content) {
      alert("Please fill in all fields");
      return;
    }

    fetch("http://localhost:5000/api/guides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newGuide,
        userId: currentUser._id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Add GSAP animation for new guide
        if (!crops.includes(newGuide.crop)) {
          setCrops([...crops, newGuide.crop]);
        }
        setGuides([...guides, data]);
        setNewGuide({ crop: "", title: "", content: "" });
        
        // Animate new guide addition
        gsap.fromTo(
          guidesListRef.current.lastChild,
          { opacity: 0, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1, 
            duration: 0.5, 
            ease: "back.out(1.7)"
          }
        );

        alert("Guide added successfully!");
      })
      .catch((error) => {
        console.error("Error adding guide:", error);
        alert("Error adding guide. Please try again.");
      });
  };

  const handleDeleteGuide = (id) => {
    fetch(`http://localhost:5000/api/guides/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setGuides(guides.filter((guide) => guide._id !== id));
        alert("Guide deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting guide:", error);
        alert("Error deleting guide. Please try again.");
      });
  };

  const handleEditGuide = (id) => {
    const guideToEdit = guides.find((guide) => guide._id === id);
    setEditGuide(guideToEdit);
    setNewGuide({
      crop: guideToEdit.crop,
      title: guideToEdit.title,
      content: guideToEdit.content,
    });
  };

  const handleUpdateGuide = () => {
    if (!editGuide) return;

    fetch(`http://localhost:5000/api/guides/${editGuide._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newGuide,
        userId: currentUser._id, // Send user ID
      }),
    })
      .then((response) => response.json())
      .then((updatedGuide) => {
        setGuides(
          guides.map((guide) =>
            guide._id === editGuide._id ? updatedGuide : guide
          )
        );
        setEditGuide(null);
        setNewGuide({ crop: "", title: "", content: "" });
        alert("Guide updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating guide:", error);
        alert("Error updating guide. Please try again.");
      });
  };

  const handleCancelUpdate = () => {
    setEditGuide(null);
    setNewGuide({ crop: "", title: "", content: "" });
  };

  return (
    <>
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8"
      style={{
        backgroundImage: `url(${guide})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay"
      }}
    >
      <div
        className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 border-2 border-green-100"
        ref={mainContainerRef}
      >
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-green-800 flex items-center justify-center gap-4">
            <FaBook className="text-green-600" />
            Farming Knowledge Hub
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Discover comprehensive guides and insights to enhance your agricultural knowledge and farming practices.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Guide Creation Section */}
          <section 
            ref={guideContentRef} 
            className="bg-green-50 p-6 rounded-xl shadow-md"
          >
            <h2 className="text-2xl font-semibold text-green-800 mb-6 flex items-center gap-3">
              <FaLeaf className="text-green-600" />
              {editGuide ? "Edit Farming Guide" : "Create New Guide"}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="crop"
                value={newGuide.crop}
                placeholder="Crop Name (e.g., Tomatoes)"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 transition"
                onChange={handleNewGuideChange}
              />

              <input
                type="text"
                name="title"
                value={newGuide.title}
                placeholder="Guide Title"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 transition"
                onChange={handleNewGuideChange}
              />

              <textarea
                name="content"
                value={newGuide.content}
                placeholder="Detailed Guide Content"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg h-40 focus:ring-2 focus:ring-green-400 transition"
                onChange={handleNewGuideChange}
              />

              <div className="flex gap-4">
                <button
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:scale-105"
                  onClick={editGuide ? handleUpdateGuide : handleAddGuide}
                >
                  <FaPlus />
                  {editGuide ? "Update Guide" : "Add Guide"}
                </button>
                {editGuide && (
                  <button
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                    onClick={handleCancelUpdate}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Guides Display Section */}
          <section className="bg-white/80 p-6 rounded-xl shadow-md">
            <select
              ref={cropSelectRef}
              value={selectedCrop}
              onChange={handleCropChange}
              className="w-full px-4 py-3 border-2 border-green-200 rounded-lg mb-6 focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select a Crop for Guides</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>

            {selectedCrop && guides.length > 0 ? (
              <div ref={guidesListRef} className="space-y-4">
                <h3 className="text-2xl font-semibold text-green-800 mb-4">
                  Guides for {selectedCrop}
                </h3>
                <div className="space-y-4">
                  {guides.map((guide) => (
                    <div
                      key={guide._id}
                      className="bg-green-50 border-2 border-green-100 rounded-lg p-5 hover:shadow-lg transition"
                    >
                      <h4 className="text-xl font-semibold text-green-700 mb-2">
                        {guide.title}
                      </h4>
                      <p className="text-gray-700 mb-4">{guide.content}</p>
                      {guide.userId === currentUser?._id && (
                        <div className="flex gap-4">
                          <button
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
                            onClick={() => handleEditGuide(guide._id)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
                            onClick={() => handleDeleteGuide(guide._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-10">
                No guides available for the selected crop.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}

export default Farmingguides;