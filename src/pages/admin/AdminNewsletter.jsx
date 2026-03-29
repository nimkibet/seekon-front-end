import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMail, FiSend, FiUsers, FiCalendar, FiCheck, FiX, FiLoader } from 'react-icons/fi';

const AdminNewsletter = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    htmlBody: ''
  });

  // Fetch subscribers on mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://seekonbackend-production-5aa7.up.railway.app'}/api/admin/subscribers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.htmlBody.trim()) {
      toast.error('Please fill in both subject and message body');
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'https://seekonbackend-production-5aa7.up.railway.app'}/api/admin/newsletter/broadcast`,
        {
          subject: formData.subject,
          htmlBody: formData.htmlBody
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(response.data.message || `Newsletter sent to ${response.data.recipientCount} subscribers!`);
      setFormData({ subject: '', htmlBody: '' });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      const message = error.response?.data?.message || 'Failed to send newsletter';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiMail className="text-[#00A676]" />
          Newsletter Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Broadcast emails to your subscribers and manage your mailing list
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Newsletter Composer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiSend className="text-[#00A676]" />
            Compose Newsletter
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject Line
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00A676] focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Body (HTML)
              </label>
              <textarea
                name="htmlBody"
                value={formData.htmlBody}
                onChange={handleInputChange}
                placeholder="<h1>Your Newsletter Content</h1>&#10;<p>Write your message here...</p>&#10;<p>Use HTML for formatting!</p>"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00A676] focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports HTML formatting (headers, paragraphs, links, etc.)
              </p>
            </div>

            <button
              type="submit"
              disabled={sending || !formData.subject.trim() || !formData.htmlBody.trim()}
              className="w-full bg-[#00A676] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#008F5D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <FiLoader className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend />
                  Send Newsletter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column - Subscribers List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUsers className="text-[#00A676]" />
              Subscribers
            </h2>
            <span className="bg-[#00A676]/10 text-[#00A676] px-3 py-1 rounded-full text-sm font-medium">
              {subscribers.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <FiLoader className="animate-spin text-[#00A676] text-2xl" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-gray-400 text-4xl mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No subscribers yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Subscribers will appear here when they sign up for the newsletter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <FiCalendar className="inline mr-1" />
                      Subscribed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr 
                      key={subscriber._id || index} 
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {subscriber.email}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          subscriber.status === 'subscribed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {subscriber.status === 'subscribed' ? (
                            <>
                              <FiCheck className="text-xs" />
                              Active
                            </>
                          ) : (
                            <>
                              <FiX className="text-xs" />
                              Unsubscribed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(subscriber.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;