// src/pages/CorporatePage.jsx

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const CorporatePage = () => {
  const location = useLocation();
  const currentPath = location.pathname.substring(1); // Remove leading slash
  
  const sections = [
    {
      id: "about",
      title: "About Us",
      text: (
        <>
          <strong>Seekon</strong> is redefining online shopping through artificial intelligence.
          Our mission is to make every shopping experience smarter, faster, and more personal.
          Led by innovators in technology and commerce, we continue to shape the future of digital retail.
        </>
      ),
      bg: "bg-white",
    },
    {
      id: "careers",
      title: "Careers",
      text: (
        <>
          Join <strong>Seekon</strong> and help build the next generation of AI-driven shopping.
          We value creativity, collaboration, and curiosity. Explore opportunities in
          engineering, design, and marketing.
        </>
      ),
      button: { label: "View Open Roles", link: "https://careers.seekon.ai" },
      bg: "bg-gray-50",
    },
    {
      id: "press",
      title: "Press",
      text: (
        <>
          Stay current with <strong>Seekon</strong> news, launches, and partnerships.
          Download our media kit and access official announcements.
        </>
      ),
      button: { label: "Press Kit", link: "https://press.seekon.ai" },
      contact: "press@seekon.ai",
      bg: "bg-white",
    },
    {
      id: "sustainability",
      title: "Sustainability",
      text: (
        <>
          <strong>Seekon</strong> is committed to responsible innovation.
          Our ESG initiatives promote energy efficiency, ethical sourcing, and diversity across our teams —
          building technology that benefits both people and the planet.
        </>
      ),
      bg: "bg-gray-50",
    },
    {
      id: "investors",
      title: "Investor Relations",
      text: (
        <>
          <strong>Seekon</strong> merges AI and commerce to deliver measurable growth and innovation.
          Access financial updates, reports, and shareholder information.
        </>
      ),
      button: { label: "View Reports", link: "https://investors.seekon.ai" },
      bg: "bg-white",
    },
  ];

  // Auto-scroll to the specific section when component mounts
  useEffect(() => {
    const targetSection = currentPath || 'about';
    const element = document.getElementById(targetSection);
    
    if (element) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [currentPath]);

  return (
    <div className="font-sans text-gray-800">
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`${section.bg} py-20 text-center px-4`}
        >
          <h2 className="text-4xl font-bold mb-4">{section.title}</h2>
          <p className="max-w-3xl mx-auto text-gray-600 text-lg leading-relaxed">
            {section.text}
          </p>

          {section.button && (
            <a
              href={section.button.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              {section.button.label}
            </a>
          )}

          {section.contact && (
            <p className="mt-3 text-sm text-gray-500">
              Media inquiries:{" "}
              <a
                href={`mailto:${section.contact}`}
                className="underline hover:text-gray-700"
              >
                {section.contact}
              </a>
            </p>
          )}
        </section>
      ))}

      <footer className="py-8 text-center text-sm text-gray-500 bg-gray-100">
        © 2025 Seekon. All rights reserved.
      </footer>
    </div>
  );
};

export default CorporatePage;
