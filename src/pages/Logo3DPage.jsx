import React from 'react';
import Logo3D from '../components/Logo3D';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Logo3DPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-gray-50 to-[#1F1F1F] flex items-center justify-center relative overflow-hidden">
      {/* Background gradient particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00A676] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00A676] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F1F1F] mb-4">
            Seekon 3D Logo
          </h1>
          <p className="text-lg text-[#666666] max-w-2xl mx-auto">
            Experience our brand in three dimensions with an interactive 3D representation
          </p>
        </motion.div>

        {/* 3D Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-[#00A676]/20"
          style={{ height: '600px' }}
        >
          <Logo3D width="100%" height="100%" />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-[#00A676]/20">
              <div className="text-[#00A676] text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">3D Design</h3>
              <p className="text-sm text-[#666666]">
                Beautiful three-dimensional logo with smooth animations
              </p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-[#00A676]/20">
              <div className="text-[#00A676] text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">Interactive</h3>
              <p className="text-sm text-[#666666]">
                Auto-rotating with responsive controls for exploration
              </p>
            </div>
            
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-[#00A676]/20">
              <div className="text-[#00A676] text-3xl mb-3">✨</div>
              <h3 className="text-lg font-semibold text-[#1F1F1F] mb-2">Modern</h3>
              <p className="text-sm text-[#666666]">
                Built with Three.js and React Three Fiber
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-[#00A676] text-[#FAFAFA] font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
          >
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Logo3DPage;

