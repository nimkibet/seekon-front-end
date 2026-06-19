import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiInstagram, FiMail, FiTruck, FiUsers, FiHeart, FiBriefcase } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

const CorporatePage = () => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1); // Remove leading slash

  const sections = [
    {
      id: "about",
      title: "About Seekon Apparel",
      subtitle: "Live Bold. Dress Sharper. Walk Your Story.",
      icon: <FiHeart className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          <strong>Seekon Apparel</strong> is Kenya's premier streetwear and footwear destination, dedicated to curating the finest selection of premium sneakers, designer apparel, and standout fashion accessories. We bridge global urban styles with local culture, offering fashion-forward individuals products that elevate their everyday lifestyle.
        </>
      ),
      bg: "bg-seekon-pureWhite",
    },
    {
      id: "delivery",
      title: "Our Delivery & Operations",
      subtitle: "Speed, Security & Convenience",
      icon: <FiTruck className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          We have engineered our operations to match your pace. We guarantee door-to-door delivery within <strong>2 hours</strong> for purchases within Nairobi limits, and swift nationwide dispatch within <strong>18 hours</strong> for destinations outside Nairobi. To ensure reliability, all return shipments are chargeable, and exchanges can be processed within our strict 72-hour window.
        </>
      ),
      bg: "bg-seekon-platinumSilver",
    },
    {
      id: "careers",
      title: "Careers",
      subtitle: "Join the Fashion Movement",
      icon: <FiBriefcase className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          At Seekon Apparel, we are always on the lookout for creative thinkers, retail innovators, logistics planners, and brand builders. If you're eager to make an impact in the East African fashion landscape, explore roles with us. Inquire directly or share your portfolio via email at <a href="mailto:seekonapparel77@gmail.com" className="underline hover:text-seekon-charcoalGray">seekonapparel77@gmail.com</a>.
        </>
      ),
      bg: "bg-seekon-pureWhite",
    },
    {
      id: "social",
      title: "Follow the Story",
      subtitle: "Join Our Dynamic Community",
      icon: <FiInstagram className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          Our collections, styling inspiration, customer spotlights, and flash announcements are updated daily across our official social platforms. Connect, tag us, and walk your story with the Seekon community.
        </>
      ),
      socials: [
        {
          name: "Instagram",
          handle: "@seekon_apparel",
          url: "https://www.instagram.com/seekon_apparel?igsh=MWg4NzJudDFjZmVrcg%3D%3D&utm_source=qr",
          icon: <FiInstagram className="w-5 h-5 mr-2" />,
          color: "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-700"
        },
        {
          name: "TikTok",
          handle: "@seekonapparel",
          url: "https://www.tiktok.com/@seekonapparel?_r=1&_t=ZM-91cAgV12dBb",
          icon: <FaTiktok className="w-4 h-4 mr-2" />,
          color: "bg-black hover:bg-zinc-900"
        }
      ],
      bg: "bg-seekon-platinumSilver",
    },
    {
      id: "press",
      title: "Press & Business",
      subtitle: "Collaboration & Partnerships",
      icon: <FiMail className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          For brand partnerships, marketing collaborations, wholesale inquiries, or media assets, please contact our business desk.
        </>
      ),
      contact: "seekonapparel77@gmail.com",
      bg: "bg-seekon-pureWhite",
    },
    {
      id: "sustainability",
      title: "Conscious Retail",
      subtitle: "Ethical Sourcing & Community",
      icon: <FiUsers className="w-6 h-6 text-seekon-pureWhite" />,
      text: (
        <>
          We believe in fashion that respects both people and the environment. Seekon partners exclusively with suppliers who enforce ethical labor standards and pursue energy-efficient, sustainable packaging materials to lessen our carbon footprint.
        </>
      ),
      bg: "bg-seekon-platinumSilver",
    }
  ];

  // Auto-scroll to the specific section when component mounts
  useEffect(() => {
    const targetSection = currentPath || 'about';
    const element = document.getElementById(targetSection);
    
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 150);
    }
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-seekon-platinumSilver">
      {/* Navigation Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <Link 
          to="/" 
          className="inline-flex items-center text-seekon-midnight hover:text-seekon-charcoalGray transition-colors duration-200 mb-6 font-medium"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 rounded-2xl border border-gray-200/60 shadow-sm ${section.bg}`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Section Icon */}
                <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center flex-shrink-0">
                  {section.icon}
                </div>

                <div className="flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-seekon-charcoalGray/60 block mb-1">
                    {section.subtitle}
                  </span>
                  <h2 className="text-2xl font-bold text-seekon-midnight mb-4">
                    {section.title}
                  </h2>
                  <p className="text-seekon-charcoalGray text-base leading-relaxed max-w-3xl">
                    {section.text}
                  </p>

                  {/* Render Custom Social Action Buttons */}
                  {section.socials && (
                    <div className="flex flex-wrap gap-4 mt-6">
                      {section.socials.map((social) => (
                        <a
                          key={social.name}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center px-5 py-3 text-seekon-pureWhite text-sm font-medium rounded-xl transition-all duration-200 shadow-sm ${social.color}`}
                          style={{ minHeight: "44px", minWidth: "150px" }}
                        >
                          {social.icon}
                          <span>{social.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Contact Section email */}
                  {section.contact && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm text-seekon-charcoalGray">
                        Direct Inquiries:{" "}
                        <a
                          href={`mailto:${section.contact}`}
                          className="underline font-semibold text-seekon-midnight hover:text-seekon-charcoalGray"
                        >
                          {section.contact}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      </div>

      <footer className="py-8 text-center text-xs text-seekon-charcoalGray/60 bg-gray-100 border-t border-gray-200">
        © 2026 Seekon Apparel. All rights reserved.
      </footer>
    </div>
  );
};

export default CorporatePage;
