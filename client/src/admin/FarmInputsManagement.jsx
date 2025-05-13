import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

function FarmInputsManagement() {
    const [farmInputs, setFarmInputs] = useState([]);
    const [selectedInput, setSelectedInput] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        quantity: '',
        unit: '',
        available: true,
        discountEligible: false,
        discountThreshold: '',
        discountPercentage: '',
        specifications: {
            brand: '',
            manufacturer: '',
            applicationMethod: '',
            safetyInstructions: '',
            storageInstructions: ''
        }
    });

    useEffect(() => {
        fetchFarmInputs();
    }, []);

    const fetchFarmInputs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/farminputs', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFarmInputs(data);
            }
        } catch (err) {
            setError('Error fetching farm inputs');
            console.error('Error:', err);
        }
    };

    const handleEdit = (input) => {
        setSelectedInput(input);
        setEditForm({
            name: input.name,
            price: input.price,
            description: input.description || '',
            category: input.category || '',
            quantity: input.quantity,
            unit: input.unit,
            available: input.available,
            discountEligible: input.discountEligible || false,
            discountThreshold: input.discountThreshold || '',
            discountPercentage: input.discountPercentage || '',
            specifications: {
                brand: input.specifications?.brand || '',
                manufacturer: input.specifications?.manufacturer || '',
                applicationMethod: input.specifications?.applicationMethod || '',
                safetyInstructions: input.specifications?.safetyInstructions || '',
                storageInstructions: input.specifications?.storageInstructions || ''
            }
        });
        setIsEditing(true);
    };

    const handleView = (input) => {
        setSelectedInput(input);
        setIsViewing(true);
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/farminputs/${selectedInput._id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const updatedInput = await response.json();
                setFarmInputs(farmInputs.map(input => 
                    input._id === updatedInput._id ? updatedInput : input
                ));
                setIsEditing(false);
                setSelectedInput(null);
            }
        } catch (err) {
            setError('Error updating farm input');
            console.error('Error:', err);
        }
    };

    const handleDelete = async (inputId) => {
        if (!window.confirm('Are you sure you want to delete this farm input?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/farminputs/${inputId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setFarmInputs(farmInputs.filter(input => input._id !== inputId));
            }
        } catch (err) {
            setError('Error deleting farm input');
            console.error('Error:', err);
        }
    };

    const filteredInputs = filter === 'all' 
        ? farmInputs 
        : farmInputs.filter(input => input.category === filter);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">Farm Inputs Management</h2>

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
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Tools">Tools</option>
                    <option value="Pesticides">Pesticides</option>
                </select>
            </div>

            {/* Farm Inputs List */}
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
                                Available
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Discount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInputs.map(input => (
                            <tr key={input._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {input.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    ${input.price}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {input.category || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        input.available 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {input.available ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {input.discountEligible ? (
                                        <span className="text-green-600">
                                            {input.discountPercentage}% off above ${input.discountThreshold}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">No discount</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleView(input)}
                                        className="text-gray-600 hover:text-gray-900 mr-4"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(input)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(input._id)}
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
            {isViewing && selectedInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Farm Input Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <p className="mt-1">{selectedInput.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                <p className="mt-1">${selectedInput.price}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <p className="mt-1">{selectedInput.description || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <p className="mt-1">{selectedInput.category || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <p className="mt-1">{selectedInput.quantity} {selectedInput.unit}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                                <div className="mt-1 space-y-2 pl-4">
                                    <p><strong>Brand:</strong> {selectedInput.specifications?.brand || '-'}</p>
                                    <p><strong>Manufacturer:</strong> {selectedInput.specifications?.manufacturer || '-'}</p>
                                    <p><strong>Application Method:</strong> {selectedInput.specifications?.applicationMethod || '-'}</p>
                                    <p><strong>Safety Instructions:</strong> {selectedInput.specifications?.safetyInstructions || '-'}</p>
                                    <p><strong>Storage Instructions:</strong> {selectedInput.specifications?.storageInstructions || '-'}</p>
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
                    <div className="bg-white p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Edit Farm Input</h3>
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
                                    <option value="Seeds">Seeds</option>
                                    <option value="Fertilizers">Fertilizers</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Pesticides">Pesticides</option>
                                </select>
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
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.discountEligible}
                                    onChange={(e) => setEditForm({ ...editForm, discountEligible: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Discount Eligible
                                </label>
                            </div>
                            {editForm.discountEligible && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Discount Threshold ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.discountThreshold}
                                            onChange={(e) => setEditForm({ ...editForm, discountThreshold: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Discount Percentage (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.discountPercentage}
                                            onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Specifications</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.specifications.brand}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                specifications: {
                                                    ...editForm.specifications,
                                                    brand: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Manufacturer
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.specifications.manufacturer}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                specifications: {
                                                    ...editForm.specifications,
                                                    manufacturer: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Application Method
                                        </label>
                                        <textarea
                                            value={editForm.specifications.applicationMethod}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                specifications: {
                                                    ...editForm.specifications,
                                                    applicationMethod: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Safety Instructions
                                        </label>
                                        <textarea
                                            value={editForm.specifications.safetyInstructions}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                specifications: {
                                                    ...editForm.specifications,
                                                    safetyInstructions: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Storage Instructions
                                        </label>
                                        <textarea
                                            value={editForm.specifications.storageInstructions}
                                            onChange={(e) => setEditForm({
                                                ...editForm,
                                                specifications: {
                                                    ...editForm.specifications,
                                                    storageInstructions: e.target.value
                                                }
                                            })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows="2"
                                        />
                                    </div>
                                </div>
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

export default FarmInputsManagement; 