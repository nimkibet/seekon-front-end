import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiChevronDown, FiChevronRight, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [newBrand, setNewBrand] = useState('');
  
  // Expanded category state
  const [expandedId, setExpandedId] = useState(null);
  
  // Edit states
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  
  // Loading states
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const res = await fetch(`${API_URL}/api/categories/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will add the default categories, subcategories, and brands. Continue?')) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/seed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to seed data');
      }
    } catch (error) {
      toast.error('Error seeding data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.category]);
        setNewCategoryName('');
        toast.success('Category added');
      } else {
        toast.error(data.message || 'Failed to add category');
      }
    } catch (error) {
      toast.error('Error adding category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category and all its subcategories/brands?')) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c._id !== id));
        toast.success('Category deleted');
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const handleUpdateCategoryName = async (id) => {
    if (!editName.trim()) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: editName.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === id ? data.category : c));
        setEditingCategory(null);
        setEditName('');
        toast.success('Category updated');
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      toast.error('Error updating category');
    }
  };

  const handleAddSubCategory = async (categoryId) => {
    if (!newSubCategory.trim()) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subCategory: newSubCategory.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === categoryId ? data.category : c));
        setNewSubCategory('');
        toast.success('Sub-category added');
      } else {
        toast.error(data.message || 'Failed to add');
      }
    } catch (error) {
      toast.error('Error adding sub-category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (categoryId, subCategory) => {
    if (!window.confirm(`Delete "${subCategory}"?`)) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${categoryId}/subcategories/${subCategory}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === categoryId ? data.category : c));
        toast.success('Sub-category deleted');
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting sub-category');
    }
  };

  const handleAddBrand = async (categoryId) => {
    if (!newBrand.trim()) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${categoryId}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ brand: newBrand.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === categoryId ? data.category : c));
        setNewBrand('');
        toast.success('Brand added');
      } else {
        toast.error(data.message || 'Failed to add');
      }
    } catch (error) {
      toast.error('Error adding brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (categoryId, brand) => {
    if (!window.confirm(`Remove "${brand}" from this category?`)) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${categoryId}/brands/${brand}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === categoryId ? data.category : c));
        toast.success('Brand removed');
      } else {
        toast.error(data.message || 'Failed to remove');
      }
    } catch (error) {
      toast.error('Error removing brand');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-gray-600">Hierarchical category management with subcategories & brands</p>
        </div>
        <button
          onClick={handleSeedData}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Seed Default Data
        </button>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name (e.g., Electronics)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A676] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] disabled:opacity-50 flex items-center gap-2"
          >
            <FiPlus /> Add
          </button>
        </form>
      </div>

      {/* Categories List with Expandable Cards */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <FiLayers className="mx-auto text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">No categories yet. Add one or click "Seed Default Data"</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Category Header - Clickable */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(category._id)}
              >
                <div className="flex items-center gap-3">
                  {expandedId === category._id ? (
                    <FiChevronDown className="text-gray-400" />
                  ) : (
                    <FiChevronRight className="text-gray-400" />
                  )}
                  <FiLayers className="text-[#00A676]" />
                  {editingCategory === category._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-2 py-1 border rounded"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateCategoryName(category._id);
                        }}
                        className="text-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(null);
                        }}
                        className="text-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-lg">{category.name}</span>
                  )}
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {category.subCategories?.length || 0} subcats
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {category.brands?.length || 0} brands
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingCategory(category._id);
                      setEditName(category.name);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Name"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Category"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expandable Content */}
              <AnimatePresence>
                {expandedId === category._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-gray-50"
                  >
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Subcategories Section */}
                      <div>
                        <h3 className="font-semibold mb-3">Subcategories</h3>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newSubCategory}
                            onChange={(e) => setNewSubCategory(e.target.value)}
                            placeholder="Add subcategory"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleAddSubCategory(category._id)}
                            disabled={submitting || !newSubCategory.trim()}
                            className="px-3 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] disabled:opacity-50 text-sm"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {category.subCategories?.map((subCat) => (
                            <span
                              key={subCat}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-sm"
                            >
                              {subCat}
                              <button
                                onClick={() => handleDeleteSubCategory(category._id, subCat)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                          {(!category.subCategories || category.subCategories.length === 0) && (
                            <p className="text-gray-400 text-sm">No subcategories</p>
                          )}
                        </div>
                      </div>

                      {/* Brands Section */}
                      <div>
                        <h3 className="font-semibold mb-3">Brands</h3>
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            value={newBrand}
                            onChange={(e) => setNewBrand(e.target.value)}
                            placeholder="Add brand"
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleAddBrand(category._id)}
                            disabled={submitting || !newBrand.trim()}
                            className="px-3 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] disabled:opacity-50 text-sm"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                          {category.brands?.map((brand) => (
                            <span
                              key={brand}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-full text-sm"
                            >
                              {brand}
                              <button
                                onClick={() => handleDeleteBrand(category._id, brand)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FiX size={12} />
                              </button>
                            </span>
                          ))}
                          {(!category.brands || category.brands.length === 0) && (
                            <p className="text-gray-400 text-sm">No brands</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
