import React from 'react';

const Footer: React.FC = () => {
  const styles = {
    footer: {
      backgroundColor: '#2a2a2a',
      color: '#ffffff',
      padding: '40px 30px 20px',
      textAlign: 'center' as const,
      marginTop: 'auto',
      borderTop: '1px solid #444',
    },
    links: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginBottom: '20px',
      flexWrap: 'wrap' as const,
    },
    link: {
      color: '#cccccc',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'color 0.3s',
      cursor: 'pointer',
    },
    socialIcons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '20px',
    },
    icon: {
      width: '40px',
      height: '40px',
      backgroundColor: '#0077b6',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'transform 0.3s, background-color 0.3s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    copyright: {
      fontSize: '13px',
      color: '#888',
      borderTop: '1px solid #444',
      paddingTop: '20px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.links}>
        <button style={styles.link}>About</button>
        <button style={styles.link}>Contact</button>
        <button style={styles.link}>Privacy</button>
        <button style={styles.link}>Terms</button>
      </div>
      <div style={styles.socialIcons}>
        <button style={styles.icon} title="Facebook">📘</button>
        <button style={styles.icon} title="Twitter">🐦</button>
        <button style={styles.icon} title="Instagram">📷</button>
        <button style={styles.icon} title="LinkedIn">💼</button>
      </div>
      <div style={styles.copyright}>
        © {new Date().getFullYear()} TravelMate. All rights reserved. Powered by AI.
      </div>
      <style>
        {`
          .footer-link:hover {
            color: #0077b6 !important;
          }
          .social-icon:hover {
            transform: translateY(-3px);
            background-color: #005f87 !important;
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
