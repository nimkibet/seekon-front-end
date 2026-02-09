import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WebSettings = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    heroVideoUrl: '',
    heroHeading: '',
    heroSubtitle: ''
  });

  // Hardcoded backend URL for safety
  const API_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/home';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Website updated! Refresh home page to see changes.");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (loading) return <div className="p-6">Loading Settings...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎨 Website Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Hero Video URL (Cloudinary)</label>
          <input
            type="url"
            value={formData.heroVideoUrl}
            onChange={(e) => setFormData({...formData, heroVideoUrl: e.target.value})}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            placeholder="https://res.cloudinary.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hero Heading</label>
          <input
            type="text"
            value={formData.heroHeading}
            onChange={(e) => setFormData({...formData, heroHeading: e.target.value})}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            placeholder="STEP INTO THE FUTURE"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
          <textarea
            value={formData.heroSubtitle}
            onChange={(e) => setFormData({...formData, heroSubtitle: e.target.value})}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            rows={3}
            placeholder="Discover the latest drops..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#00A676] text-white font-bold py-3 rounded-lg hover:bg-[#008A5E]"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default WebSettings;
