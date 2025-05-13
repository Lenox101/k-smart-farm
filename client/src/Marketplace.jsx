import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import images from "./utils";
import Footer from "./Footer";
const { marketplaceBG } = images;

function Marketplace() {
  const [produceList, setProduceList] = useState([]);
  const [selectedProduce, setSelectedProduce] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const produceRefs = useRef([]);
  const contactRef = useRef(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const emptyProduct = {
    name: "",
    price: "",
    description: "",
    city: "",
    category: "",
    quantity: "",
    unit: "kg",
    image: null,
  };

  const [newProduce, setNewProduce] = useState(emptyProduct);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/currentuser", {
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProduceList(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // GSAP animations for product cards
  useEffect(() => {
    gsap.from(produceRefs.current, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out",
    });
    gsap.to(produceRefs.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out",
    });
  }, [produceList]);

  // GSAP animation for modal
  useEffect(() => {
    if (selectedProduce) {
      const modalElement = document.querySelector(".modal-content");
      gsap.fromTo(
        modalElement,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
      );
    }
  }, [selectedProduce]);

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();

    Object.keys(newProduce).forEach((key) => {
      if (key === "image" && newProduce[key] instanceof File) {
        formData.append("image", newProduce[key]);
      } else if (newProduce[key]) {
        formData.append(key, newProduce[key]);
      }
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update product");

      const updatedProduct = await response.json();
      setProduceList(
        produceList.map((p) =>
          p._id === updatedProduct._id ? updatedProduct : p
        )
      );
      setNewProduce(emptyProduct);
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setNewProduce({
      name: product.name,
      price: product.price,
      description: product.description || "",
      city: product.city,
      category: product.category || "",
      quantity: product.quantity,
      unit: product.unit,
      image: null, // Reset image since we don't want to show the old file
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await handleEditProduct(e);
      return;
    }

    const formData = new FormData();

    Object.keys(newProduce).forEach((key) => {
      if (key === "image" && newProduce[key] instanceof File) {
        formData.append("image", newProduce[key]);
      } else if (newProduce[key]) {
        formData.append(key, newProduce[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      const data = await response.json();
      setProduceList([data, ...produceList]);
      setNewProduce(emptyProduct);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduce({ ...newProduce, image: file });
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete product");

      setProduceList(produceList.filter((p) => p._id !== productId));
      setProductToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="text-center mt-20">Loading...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;

  return (
    <>
      <div
        className="w-full min-h-screen text-black px-8 p-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${marketplaceBG})` }}
      >
        <h1 className="font-bold tracking-wide text-3xl mb-4 text-white">
          Marketplace
        </h1>

        {/* Upload/Edit Form */}
        <div className="mb-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => {
              if (!showForm) {
                setNewProduce(emptyProduct);
                setEditingProduct(null);
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "Add New Product"}
          </button>

          {showForm && (
            <form
              onSubmit={handleFormSubmit}
              className="mt-4 p-4 border rounded-lg bg-white bg-opacity-80"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduce.name}
                  onChange={(e) =>
                    setNewProduce({ ...newProduce, name: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={newProduce.price}
                    onChange={(e) =>
                      setNewProduce({ ...newProduce, price: e.target.value })
                    }
                    className="border p-2 rounded flex-1"
                    required
                  />
                  <select
                    value={newProduce.unit}
                    onChange={(e) =>
                      setNewProduce({ ...newProduce, unit: e.target.value })
                    }
                    className="border p-2 rounded w-24"
                  >
                    <option value="kg">kg</option>
                    <option value="pieces">pcs</option>
                    <option value="bunches">bunch</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="City"
                  value={newProduce.city}
                  onChange={(e) =>
                    setNewProduce({ ...newProduce, city: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newProduce.quantity}
                  onChange={(e) =>
                    setNewProduce({ ...newProduce, quantity: e.target.value })
                  }
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduce.category}
                  onChange={(e) =>
                    setNewProduce({ ...newProduce, category: e.target.value })
                  }
                  className="border p-2 rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border p-2 rounded"
                />
                <textarea
                  placeholder="Description"
                  value={newProduce.description}
                  onChange={(e) =>
                    setNewProduce({
                      ...newProduce,
                      description: e.target.value,
                    })
                  }
                  className="border p-2 rounded col-span-2"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {editingProduct ? "Update Product" : "Add Product"}
              </button>
            </form>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produceList.filter(product => product.farmer).map((product, index) => (
            <div
              key={product._id}
              ref={(el) => (produceRefs.current[index] = el)}
              className="border p-4 rounded-lg shadow-lg bg-white bg-opacity-80 transform hover:scale-105 transition-transform duration-200"
            >
              {product.image && (
                <img
                  src={`http://localhost:5000/${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="font-semibold text-xl mt-2">{product.name}</h2>
              <p className="text-gray-600">{product.description}</p>
              <p className="font-bold">
                Price: Ksh {product.price.toFixed(2)} per {product.unit}
              </p>
              <p>
                Quantity: {product.quantity} {product.unit}
              </p>
              <p>Location: {product.city}</p>
              <p>Category: {product.category}</p>
              <div className="flex gap-2 mt-2">
                {currentUser && product.farmer && currentUser._id === product.farmer._id ? (
                  <div className="flex gap-2 w-full">
                    <button
                      className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 flex-1"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 flex-1"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1"
                      onClick={() => handleContact(product)}
                    >
                      Contact Farmer
                    </button>
                  </div>
                )}
              </div>
              {product.farmer && (
                <p className="text-sm text-gray-500 mt-2">
                  Posted by: {product.farmer.name}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Contact Modal */}
        {selectedProduce && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="modal-content bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="font-semibold text-xl mb-4">Contact Farmer</h2>
              <p>Farmer: {selectedProduce.farmer.name}</p>
              <p>Phone: {selectedProduce.farmer.phone}</p>
              <p>Email: {selectedProduce.farmer.email}</p>
              <button
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => setSelectedProduce(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {productToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="modal-content bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="font-semibold text-xl mb-4">Delete Product</h2>
              <p>Are you sure you want to delete "{productToDelete.name}"?</p>
              <p className="text-gray-600 mt-2">
                This action cannot be undone.
              </p>
              <div className="flex gap-4 mt-6">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1"
                  onClick={() => setProductToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1"
                  onClick={() => handleDeleteProduct(productToDelete._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Marketplace;
