import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUpload, FiVideo, FiX } from 'react-icons/fi';
import { uploadVideoToCloudinary } from '../../utils/cloudinary';

const WebSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    heroVideoUrl: '',
    heroHeading: '',
    heroSubtitle: ''
  });
  const [videoPreview, setVideoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Hardcoded backend URL for safety
  const API_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/home';

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data);
      if (res.data.heroVideoUrl) {
        setVideoPreview(res.data.heroVideoUrl);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validVideoTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, WebM, OGG)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file must be less than 50MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Upload to Cloudinary
    try {
      setUploading(true);
      toast.loading('Uploading video to Cloudinary...');
      
      const result = await uploadVideoToCloudinary(file, 'seekon-hero');
      
      setFormData(prev => ({ ...prev, heroVideoUrl: result.url }));
      
      toast.dismiss();
      toast.success('Video uploaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload video. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Website settings saved! Refresh home page to see changes.');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const removeVideo = () => {
    setVideoPreview(null);
    setFormData(prev => ({ ...prev, heroVideoUrl: '' }));
  };

  if (loading) return <div className="p-6">Loading Settings...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎨 Website Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Hero Video Upload
          </label>
          
          {videoPreview ? (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video 
                src={videoPreview} 
                className="w-full h-48 object-cover"
                controls
              />
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[#00A676] transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <FiVideo className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-400 mb-1">
                Click to upload a video (MP4, WebM, OGG)
              </p>
              <p className="text-xs text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          )}
          
          {uploading && (
            <div className="mt-2 text-sm text-[#00A676]">
              Uploading to Cloudinary...
            </div>
          )}
        </div>

        {/* Video URL (auto-filled after upload) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Video URL (Auto-filled after upload)
          </label>
          <input
            type="url"
            value={formData.heroVideoUrl}
            onChange={(e) => setFormData({...formData, heroVideoUrl: e.target.value})}
            className="w-full p-3 border rounded-lg bg-gray-800 text-white"
            placeholder="https://res.cloudinary.com/..."
            readOnly={uploading}
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
          disabled={saving || uploading}
          className="w-full bg-[#00A676] text-white font-bold py-3 rounded-lg hover:bg-[#008A5E] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

// Need to import useEffect since we're using it
import { useEffect } from 'react';

export default WebSettings;
