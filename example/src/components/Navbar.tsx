import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const styles = {
    navbar: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 1000,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '70px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logoIcon: {
      fontSize: '28px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#0077b6',
      textDecoration: 'none',
      fontFamily: "'Montserrat', sans-serif",
    },
    navLinks: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center',
    },
    link: {
      textDecoration: 'none',
      color: '#333',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'color 0.3s, transform 0.2s',
      padding: '5px 10px',
      borderRadius: '4px',
    },
    ctaButton: {
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
    },
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={{ ...styles.logoContainer, textDecoration: 'none' }}>
        <span style={styles.logoIcon}>✈️</span>
        <span style={styles.logo}>TravelMate</span>
      </Link>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/destinations" style={styles.link}>Destinations</Link>
        <Link to="/tours" style={styles.link}>Tours</Link>
        <Link to="/profile" style={styles.link}>Profile</Link>
        <button style={styles.ctaButton}>Plan with AI</button>
      </div>
      <style>
        {`
          .navbar-link:hover {
            color: #0077b6 !important;
            transform: translateY(-2px);
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
