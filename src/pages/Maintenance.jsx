import React from 'react';
import { Link } from 'react-router-dom';

const Maintenance = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        padding: '3rem',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#00A676',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <span style={{
            fontSize: '2.5rem',
            color: 'white'
          }}>S</span>
        </div>
        
        <h1 style={{
          color: '#333',
          marginBottom: '1.5rem',
          fontSize: '1.8rem'
        }}>
          Seekon is Currently Under Maintenance
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          We're making things better for you. Our team is performing scheduled maintenance to improve your shopping experience.
        </p>
        
        <p style={{
          color: '#888',
          fontSize: '1rem',
          marginBottom: '2.5rem',
          fontStyle: 'italic'
        }}>
          Please check back in a few minutes!
        </p>
        
        {/* Optional: Add a countdown timer or refresh button */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => window.location.reload()} style={{
            backgroundColor: '#00A676',
            color: 'white',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Check Now
          </button>
          
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            ← Go to Homepage
          </Link>
        </div>
      </div>
      
      <div style={{
        marginTop: '2rem',
        color: '#999',
        fontSize: '0.9rem'
      }}>
        Maintenance Mode • Seekon E-commerce Platform
      </div>
    </div>
  );
};

export default Maintenance;