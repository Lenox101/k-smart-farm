import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import images from "./utils";
import Footer from "./Footer";
import {
  FaSeedling,
  FaTools,
  FaSprayCan,
  FaShoppingCart,
} from "react-icons/fa";
import { GiChemicalDrop } from "react-icons/gi";
import { MdAdd, MdEdit, MdDelete, MdClose } from "react-icons/md";
import { BsCart4, BsPerson } from "react-icons/bs";
import { BiPurchaseTag } from "react-icons/bi";
const { farminputspBG } = images;

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FarmInputs = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const categoriesRef = useRef([]);
  const productsRef = useRef([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const emptyProduct = {
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: "",
    unit: "kg",
    discountEligible: false,
    discountThreshold: "",
    discountPercentage: "",
    specifications: {
      brand: "",
      manufacturer: "",
      applicationMethod: "",
      safetyInstructions: "",
      storageInstructions: "",
    },
    image: null,
  };

  const [newProduct, setNewProduct] = useState(emptyProduct);

  // Update the categories array with icons
  const categories = [
    {
      id: "Seeds",
      name: "Seeds",
      description: "High-quality seeds for various crops.",
      icon: <FaSeedling className="text-3xl text-green-600" />,
    },
    {
      id: "Fertilizers",
      name: "Fertilizers",
      description: "Nutrient-rich fertilizers for healthy growth.",
      icon: <GiChemicalDrop className="text-3xl text-green-600" />,
    },
    {
      id: "Tools",
      name: "Tools",
      description: "Essential tools for effective farming.",
      icon: <FaTools className="text-3xl text-green-600" />,
    },
    {
      id: "Pesticides",
      name: "Pesticides",
      description: "Protect your crops from pests and diseases.",
      icon: <FaSprayCan className="text-3xl text-green-600" />,
    },
  ];
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

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const url = selectedCategory
          ? `http://localhost:5000/api/farminputs/category/${selectedCategory.id}`
          : "http://localhost:5000/api/farminputs";

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await handleEditProduct(e);
      return;
    }

    const formData = new FormData();

    // Append basic fields
    Object.keys(newProduct).forEach((key) => {
      if (key === "image" && newProduct[key] instanceof File) {
        formData.append("image", newProduct[key]);
      } else if (key === "specifications") {
        formData.append(key, JSON.stringify(newProduct[key]));
      } else if (key !== "image") {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5000/api/farminputs", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      const data = await response.json();
      setProducts([data, ...products]);
      setNewProduct(emptyProduct);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description || "",
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      discountEligible: product.discountEligible,
      discountThreshold: product.discountThreshold || "",
      discountPercentage: product.discountPercentage || "",
      specifications: {
        brand: product.specifications?.brand || "",
        manufacturer: product.specifications?.manufacturer || "",
        applicationMethod: product.specifications?.applicationMethod || "",
        safetyInstructions: product.specifications?.safetyInstructions || "",
        storageInstructions: product.specifications?.storageInstructions || "",
      },
      image: null,
    });
    setShowForm(true);
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData();

    Object.keys(newProduct).forEach((key) => {
      if (key === "image" && newProduct[key] instanceof File) {
        formData.append("image", newProduct[key]);
      } else if (key === "specifications") {
        formData.append(key, JSON.stringify(newProduct[key]));
      } else if (key !== "image") {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      const response = await fetch(
        `http://localhost:5000/api/farminputs/${editingProduct._id}`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update product");

      const updatedProduct = await response.json();
      setProducts(
        products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      setNewProduct(emptyProduct);
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/farminputs/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to delete product");

      setProducts(products.filter((p) => p._id !== productId));
      setProductToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // GSAP animations
  useEffect(() => {
    // Header animation
    gsap.from("header", {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    gsap.to("header", {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: "power3.out",
    });

    // Categories animation
    gsap.from(categoriesRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: categoriesRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
      },
    });

    gsap.to(categoriesRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: categoriesRef.current,
        start: "top bottom-=100",
        toggleActions: "play none none reverse",
      },
    });
  }, []);

  // Form animation
  useEffect(() => {
    if (showForm) {
      gsap.from("form", {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to("form", {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [showForm]);

  // Modal animations
  useEffect(() => {
    if (selectedProduct || productToDelete) {
      gsap.from(".modal-content", {
        opacity: 0,
        scale: 0.5,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
      gsap.to(".modal-content", {
        opacity: 1,
        scale: 1,
      });
    }
  }, [selectedProduct, productToDelete]);

  if (error)
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="w-full min-h-screen bg-gray-100">
        <header className="text-center mb-10 p-4 bg-green-50">
          <h1 className="text-4xl font-bold text-green-700 mb-2 flex items-center justify-center gap-3">
            Resource Access <FaShoppingCart className="text-green-500" />
          </h1>
          <p className="text-gray-700 flex items-center justify-center gap-2">
            <BiPurchaseTag className="text-green-600" />
            Access and purchase farming resources
          </p>
        </header>

        <div
          className="w-full min-h-screen text-black px-8 p-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${farminputspBG})` }}
        >
          {/* Add Product Button */}
          {currentUser && (
            <div className="mb-6">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 flex items-center gap-2 shadow-md"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? <MdClose /> : <MdAdd />}
                {showForm ? "Cancel" : "Add New Product"}
              </button>
              {/* Add Product Form */}
              {showForm && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 p-4 border rounded-lg bg-white"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="border p-2 rounded"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Price"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        className="border p-2 rounded flex-1"
                        required
                      />
                      <select
                        value={newProduct.unit}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, unit: e.target.value })
                        }
                        className="border p-2 rounded w-24"
                      >
                        <option value="kg">kg</option>
                        <option value="pieces">pcs</option>
                        <option value="units">units</option>
                      </select>
                    </div>
                    <select
                      value={newProduct.category}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          quantity: e.target.value,
                        })
                      }
                      className="border p-2 rounded"
                      required
                    />
                    <div className="col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newProduct.discountEligible}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              discountEligible: e.target.checked,
                            })
                          }
                        />
                        Enable Bulk Discount
                      </label>
                    </div>
                    {newProduct.discountEligible && (
                      <>
                        <input
                          type="number"
                          placeholder="Minimum Quantity for Discount"
                          value={newProduct.discountThreshold}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              discountThreshold: e.target.value,
                            })
                          }
                          className="border p-2 rounded"
                        />
                        <input
                          type="number"
                          placeholder="Discount Percentage"
                          value={newProduct.discountPercentage}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              discountPercentage: e.target.value,
                            })
                          }
                          className="border p-2 rounded"
                        />
                      </>
                    )}
                    <input
                      type="text"
                      placeholder="Brand"
                      value={newProduct.specifications.brand}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: {
                            ...newProduct.specifications,
                            brand: e.target.value,
                          },
                        })
                      }
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Manufacturer"
                      value={newProduct.specifications.manufacturer}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: {
                            ...newProduct.specifications,
                            manufacturer: e.target.value,
                          },
                        })
                      }
                      className="border p-2 rounded"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="border p-2 rounded col-span-2"
                    />
                    <textarea
                      placeholder="Application Method"
                      value={newProduct.specifications.applicationMethod}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: {
                            ...newProduct.specifications,
                            applicationMethod: e.target.value,
                          },
                        })
                      }
                      className="border p-2 rounded col-span-2"
                      rows="2"
                    />
                    <textarea
                      placeholder="Safety Instructions"
                      value={newProduct.specifications.safetyInstructions}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: {
                            ...newProduct.specifications,
                            safetyInstructions: e.target.value,
                          },
                        })
                      }
                      className="border p-2 rounded col-span-2"
                      rows="2"
                    />
                    <textarea
                      placeholder="Storage Instructions"
                      value={newProduct.specifications.storageInstructions}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          specifications: {
                            ...newProduct.specifications,
                            storageInstructions: e.target.value,
                          },
                        })
                      }
                      className="border p-2 rounded col-span-2"
                      rows="2"
                    />
                    <textarea
                      placeholder="Description"
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
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
          )}

          {/* Categories Section */}
          <section>
            <h2 className="text-2xl p-5 rounded font-semibold mb-6 text-green-800 bg-white">
              Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  ref={(el) => (categoriesRef.current[index] = el)}
                  className={`border p-6 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 cursor-pointer ${
                    selectedCategory?.id === category.id
                      ? "ring-2 ring-green-500"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory?.id === category.id ? null : category
                    )
                  }
                >
                  <h3 className="text-xl font-semibold text-green-600">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mt-2">{category.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Products Section */}
          {isLoading ? (
            <div className="text-center mt-10">Loading...</div>
          ) : (
            <section className="mt-16">
              <h2 className="text-2xl p-5 rounded font-semibold mb-6 text-green-800 bg-white">
                {selectedCategory
                  ? `${selectedCategory.name} Products`
                  : "All Products"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(product => product.seller)
                  .map((product, index) => (
                    <div
                      key={product._id}
                      ref={(el) => (productsRef.current[index] = el)}
                      className="border p-6 rounded-lg shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-green-600 flex items-center gap-2">
                          <FaSeedling /> {product.name}
                        </h3>
                        {currentUser && product.seller && 
                          currentUser._id === product.seller._id && (
                            <div className="flex gap-2">
                              <MdEdit
                                onClick={() => startEdit(product)}
                                className="text-yellow-500 hover:text-yellow-600 cursor-pointer"
                              />
                              <MdDelete
                                onClick={() => setProductToDelete(product)}
                                className="text-red-500 hover:text-red-600 cursor-pointer"
                              />
                            </div>
                          )}
                      </div>
                      {product.image && (
                        <img
                          src={`http://localhost:5000/${product.image}`}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded mb-4"
                        />
                      )}
                      <p className="text-gray-600 mt-2">{product.description}</p>
                      <p className="font-bold mt-2">
                        Price: Ksh {product.price.toFixed(2)} per {product.unit}
                      </p>
                      <p>
                        Quantity Available: {product.quantity} {product.unit}
                      </p>
                      {product.discountEligible && (
                        <div className="mt-2 text-green-600">
                          <p>Bulk Discount: {product.discountPercentage}% off</p>
                          <p>
                            Minimum Quantity: {product.discountThreshold}{" "}
                            {product.unit}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 space-y-2">
                        <p>
                          <strong>Brand:</strong> {product.specifications?.brand}
                        </p>
                        <p>
                          <strong>Manufacturer:</strong>{" "}
                          {product.specifications?.manufacturer}
                        </p>
                      </div>
                      {product.seller && (
                        <p className="text-sm text-gray-500 mt-2">
                          Posted by: {product.seller.name}
                        </p>
                      )}
                      <div className="mt-4">
                        {(!currentUser || (product.seller && currentUser._id !== product.seller._id)) && (
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                            onClick={() => setSelectedProduct(product)}
                          >
                            Contact Seller
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Contact Modal */}
          {selectedProduct && selectedProduct.seller && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="modal-content bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="font-semibold text-xl mb-4">Contact Seller</h2>
                <p>Seller: {selectedProduct.seller.name}</p>
                <p>Phone: {selectedProduct.seller.phone}</p>
                <p>Email: {selectedProduct.seller.email}</p>
                <button
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {/* Group Buying Discounts Section */}
          <section className="mt-16 bg-green-50 p-5 rounded group-buying-section">
            <h2 className="text-2xl font-semibold mb-4 text-green-800 flex items-center gap-2">
              <BiPurchaseTag /> Group Buying Discounts
            </h2>
            <ul className="list-disc pl-6 text-gray-700">
              <li className="mb-3 flex items-center gap-2">
                <FaShoppingCart /> Look for products with bulk discount
                eligibility
              </li>
              <li className="mb-3 flex items-center gap-2">
                <MdAdd /> Discounts automatically apply when minimum quantity is
                met
              </li>
              <li className="mb-3 flex items-center gap-2">
                <BsPerson /> Contact seller for custom bulk orders
              </li>
            </ul>
          </section>
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
      </div>
      <Footer />
    </>
  );
};

export default FarmInputs;
