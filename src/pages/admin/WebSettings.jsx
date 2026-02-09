import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSave, FiLayout, FiType, FiSliders, FiEye, FiVideo } from 'react-icons/fi';

const WebSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heroVideoUrl: '',
    heroHeading: '',
    heroSubtitle: '',
    heroOverlayOpacity: 50,
    heroHeight: 85,
    heroHeadingSize: 'large',
    showHeroBadge: true
  });

  const API_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/home';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Website updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const isVideo = (url) => url && (url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.webm'));

  const fontSizeClasses = {
    small: 'text-3xl md:text-5xl',
    medium: 'text-4xl md:text-6xl',
    large: 'text-5xl md:text-7xl',
    xlarge: 'text-6xl md:text-8xl'
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎨 Website Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Live Preview Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiEye size={20} /> Live Preview
          </h2>
          <div 
            className="rounded-xl overflow-hidden relative bg-gray-900 flex items-center justify-center text-center"
            style={{ height: `${formData.heroHeight * 0.4}vh`, maxHeight: '400px' }}
          >
            {/* Media */}
            <div className="absolute inset-0">
              {isVideo(formData.heroVideoUrl) ? (
                <video src={formData.heroVideoUrl} className="w-full h-full object-cover" autoPlay muted loop />
              ) : (
                <img src={formData.heroVideoUrl} className="w-full h-full object-cover" alt="Preview" />
              )}
            </div>
            {/* Overlay */}
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: `rgba(0,0,0,${formData.heroOverlayOpacity / 100})` }} 
            />
            
            {/* Content */}
            <div className="relative z-10 text-white px-4">
              {formData.showHeroBadge && (
                <div className="inline-block border border-white/30 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                  New Collection
                </div>
              )}
              <h1 className={`${fontSizeClasses[formData.heroHeadingSize]} font-black leading-tight tracking-tighter uppercase drop-shadow-lg line-clamp-2`}>
                {formData.heroHeading || 'Your Heading'}
              </h1>
              <p className="text-sm opacity-90 mt-2 max-w-lg mx-auto font-light leading-relaxed line-clamp-2">
                {formData.heroSubtitle || 'Your Subtitle'}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiSliders size={20} /> Appearance & Layout
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overlay Opacity ({formData.heroOverlayOpacity}%)
              </label>
              <input 
                type="range" 
                name="heroOverlayOpacity" 
                min="0" 
                max="90" 
                value={formData.heroOverlayOpacity} 
                onChange={handleChange} 
                className="w-full accent-[#00A676]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Height ({formData.heroHeight}vh)
              </label>
              <input 
                type="range" 
                name="heroHeight" 
                min="50" 
                max="100" 
                value={formData.heroHeight} 
                onChange={handleChange} 
                className="w-full accent-[#00A676]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading Size</label>
              <select 
                name="heroHeadingSize" 
                value={formData.heroHeadingSize} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-lg bg-gray-800 text-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large (Default)</option>
                <option value="xlarge">Extra Large</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <label className="text-sm font-medium text-gray-700">Show 'New Collection' Badge</label>
              <input 
                type="checkbox" 
                name="showHeroBadge" 
                checked={formData.showHeroBadge} 
                onChange={handleChange} 
                className="w-5 h-5 accent-[#00A676]"
              />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiType size={20} /> Text Content
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
              <input 
                type="text" 
                name="heroHeading" 
                value={formData.heroHeading} 
                onChange={handleChange} 
                className="w-full p-3 border rounded-lg bg-gray-800 text-white font-bold text-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea 
                name="heroSubtitle" 
                value={formData.heroSubtitle} 
                onChange={handleChange} 
                rows="3" 
                className="w-full p-3 border rounded-lg bg-gray-800 text-white" 
              />
            </div>
          </div>
        </div>

        {/* Media Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiLayout size={20} /> Hero Background Media
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video or Image URL (Cloudinary)
            </label>
            <input 
              type="text" 
              name="heroVideoUrl" 
              value={formData.heroVideoUrl} 
              onChange={handleChange} 
              placeholder="https://res.cloudinary.com/..." 
              className="w-full p-3 border rounded-lg bg-gray-800 text-white" 
            />
            <p className="text-xs text-gray-500 mt-1">
              <FiVideo className="inline mr-1" />
              Upload videos via the admin panel's image upload feature
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving} 
          className="flex items-center justify-center gap-2 w-full bg-[#00A676] hover:bg-[#008A5E] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : <><FiSave size={20} /> Save & Publish Live</>}
        </button>
      </form>
    </div>
  );
};

export default WebSettings;
