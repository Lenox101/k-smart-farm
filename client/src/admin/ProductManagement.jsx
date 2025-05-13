import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        description: '',
        city: '',
        category: '',
        quantity: '',
        unit: '',
        available: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/products', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (err) {
            setError('Error fetching products');
            console.error('Error:', err);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setEditForm({
            name: product.name,
            price: product.price,
            description: product.description || '',
            city: product.city,
            category: product.category || '',
            quantity: product.quantity,
            unit: product.unit,
            available: product.available
        });
        setIsEditing(true);
    };

    const handleView = (product) => {
        setSelectedProduct(product);
        setIsViewing(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${selectedProduct._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setProducts(products.map(product => 
                    product._id === updatedProduct._id ? updatedProduct : product
                ));
                setIsEditing(false);
                setSelectedProduct(null);
            }
        } catch (err) {
            setError('Error updating product');
            console.error('Error:', err);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setProducts(products.filter(product => product._id !== productId));
            }
        } catch (err) {
            setError('Error deleting product');
            console.error('Error:', err);
        }
    };

    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(product => product.category === filter);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Product Management</h2>

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
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                City
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Available
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${product.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.category || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.city}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.available 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {product.available ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleView(product)}
                                        className="text-gray-600 hover:text-gray-900 mr-4"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
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
            {isViewing && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Product Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1">{selectedProduct.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <p className="mt-1">${selectedProduct.price}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <p className="mt-1">{selectedProduct.description || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <p className="mt-1">{selectedProduct.category || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <p className="mt-1">{selectedProduct.city}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <p className="mt-1">{selectedProduct.quantity} {selectedProduct.unit}</p>
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
                        <h3 className="text-xl font-bold mb-4">Edit Product</h3>
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
                                    Price
                                </label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows="3"
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
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Grains">Grains</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    value={editForm.unit}
                                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.available}
                                    onChange={(e) => setEditForm({ ...editForm, available: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Available
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

export default ProductManagement; 