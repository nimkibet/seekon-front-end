import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiSave, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const ManageCategories = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');
  
  // Form states
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  
  // Loading states
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/brands/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/categories/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const brandsData = await brandsRes.json();
      const categoriesData = await categoriesRes.json();
      
      if (brandsData.success) setBrands(brandsData.brands);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newBrand.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setBrands([...brands, data.brand]);
        setNewBrand('');
        toast.success('Brand added successfully');
      } else {
        toast.error(data.message || 'Failed to add brand');
      }
    } catch (error) {
      toast.error('Error adding brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/brands/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setBrands(brands.filter(b => b._id !== id));
        toast.success('Brand deleted');
      } else {
        toast.error(data.message || 'Failed to delete brand');
      }
    } catch (error) {
      toast.error('Error deleting brand');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.category]);
        setNewCategory('');
        toast.success('Category added successfully');
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
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
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
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!newSubCategory.trim() || !selectedCategory) return;
    
    try {
      setSubmitting(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${selectedCategory._id}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ subCategory: newSubCategory.trim() })
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => 
          c._id === selectedCategory._id ? data.category : c
        ));
        setNewSubCategory('');
        setIsAddingSubCategory(false);
        setSelectedCategory(null);
        toast.success('Sub-category added');
      } else {
        toast.error(data.message || 'Failed to add sub-category');
      }
    } catch (error) {
      toast.error('Error adding sub-category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubCategory = async (categoryId, subCategory) => {
    if (!window.confirm(`Delete sub-category "${subCategory}"?`)) return;
    
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/api/categories/${categoryId}/subcategories/${subCategory}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => 
          c._id === categoryId ? data.category : c
        ));
        toast.success('Sub-category deleted');
      } else {
        toast.error(data.message || 'Failed to delete sub-category');
      }
    } catch (error) {
      toast.error('Error deleting sub-category');
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories & Brands</h1>
        <p className="text-gray-600">Add and manage product categories and brands</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-[#00A676] border-b-2 border-[#00A676]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'brands'
              ? 'text-[#00A676] border-b-2 border-[#00A676]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Brands
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="flex gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
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

          {/* Categories List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Existing Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500">No categories yet</p>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiLayers className="text-[#00A676]" />
                        <span className="font-medium">{category.name}</span>
                        {!category.isActive && (
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsAddingSubCategory(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Add Sub-category"
                        >
                          <FiPlus />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Category"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    
                    {/* Sub-categories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="mt-3 ml-8 flex flex-wrap gap-2">
                        {category.subCategories.map((subCat) => (
                          <span
                            key={subCat}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Sub-category Modal */}
          {isAddingSubCategory && selectedCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  Add Sub-category to {selectedCategory.name}
                </h3>
                <form onSubmit={handleAddSubCategory}>
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    placeholder="Enter sub-category name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#00A676] focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSubCategory(false);
                        setSelectedCategory(null);
                        setNewSubCategory('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !newSubCategory.trim()}
                      className="px-4 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] disabled:opacity-50"
                    >
                      Add Sub-category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          {/* Add Brand Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Brand</h2>
            <form onSubmit={handleAddBrand} className="flex gap-3">
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Enter brand name"
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

          {/* Brands List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Existing Brands</h2>
            {brands.length === 0 ? (
              <p className="text-gray-500">No brands yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {brands.map((brand) => (
                  <div
                    key={brand._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium truncate">{brand.name}</span>
                    <button
                      onClick={() => handleDeleteBrand(brand._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Brand"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
