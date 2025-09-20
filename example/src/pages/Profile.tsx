import React from 'react';

const Profile: React.FC = () => {
  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '30px',
      marginBottom: '60px',
      padding: '40px',
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    avatar: {
      width: '100px',
      height: '100px',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '40px',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: '32px',
      marginBottom: '5px',
      fontFamily: "'Montserrat', sans-serif",
    },
    userEmail: {
      fontSize: '18px',
      opacity: 0.9,
    },
    userStats: {
      display: 'flex',
      gap: '30px',
      marginTop: '15px',
    },
    stat: {
      textAlign: 'center' as const,
    },
    statNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.8,
    },
    section: {
      marginBottom: '60px',
    },
    sectionTitle: {
      fontSize: '28px',
      marginBottom: '30px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    itinerariesList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '30px',
    },
    itineraryCard: {
      padding: '25px',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s',
      border: '1px solid #f0f0f0',
    },
    itineraryTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    itineraryDesc: {
      color: '#666',
      marginBottom: '15px',
      lineHeight: '1.6',
    },
    itineraryMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      color: '#888',
    },
    favoritesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
    },
    favoriteCard: {
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      backgroundColor: '#ffffff',
    },
    favoriteImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover' as const,
    },
    favoriteContent: {
      padding: '20px',
    },
    favoriteTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    favoriteDesc: {
      color: '#666',
      lineHeight: '1.6',
    },
    settings: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
    },
    settingItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '25px',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    },
    settingLabel: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
    },
    toggle: {
      width: '60px',
      height: '30px',
      backgroundColor: '#e0e0e0',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    toggleActive: {
      backgroundColor: '#0077b6',
    },
    toggleButton: {
      width: '24px',
      height: '24px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '3px',
      left: '3px',
      transition: 'left 0.3s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    toggleButtonActive: {
      left: '33px',
    },
    chatbotCTA: {
      textAlign: 'center' as const,
      padding: '40px',
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      marginTop: '40px',
    },
    ctaTitle: {
      fontSize: '28px',
      marginBottom: '15px',
      fontFamily: "'Montserrat', sans-serif",
    },
    ctaText: {
      fontSize: '16px',
      marginBottom: '25px',
      opacity: 0.9,
    },
    ctaButton: {
      padding: '12px 30px',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.avatar}>👤</div>
        <div style={styles.userInfo}>
          <h1 style={styles.userName}>Alex Johnson</h1>
          <p style={styles.userEmail}>alex.johnson@example.com</p>
          <div style={styles.userStats}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>12</div>
              <div style={styles.statLabel}>Trips Planned</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>8</div>
              <div style={styles.statLabel}>Destinations</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>24</div>
              <div style={styles.statLabel}>AI Chats</div>
            </div>
          </div>
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>My AI-Planned Itineraries</h2>
        <div style={styles.itinerariesList}>
          <div style={styles.itineraryCard} className="itinerary-card">
            <h3 style={styles.itineraryTitle}>Paris Romantic Getaway</h3>
            <p style={styles.itineraryDesc}>A 5-day journey through the City of Light, featuring the Eiffel Tower, Louvre Museum, and Seine River cruise.</p>
            <div style={styles.itineraryMeta}>
              <span>Paris, France</span>
              <span>5 days • Created with AI</span>
            </div>
          </div>
          <div style={styles.itineraryCard} className="itinerary-card">
            <h3 style={styles.itineraryTitle}>Tokyo Cultural Explorer</h3>
            <p style={styles.itineraryDesc}>7 days discovering traditional temples, bustling markets, and cutting-edge districts in Japan's capital.</p>
            <div style={styles.itineraryMeta}>
              <span>Tokyo, Japan</span>
              <span>7 days • Created with AI</span>
            </div>
          </div>
          <div style={styles.itineraryCard} className="itinerary-card">
            <h3 style={styles.itineraryTitle}>Bali Wellness Retreat</h3>
            <p style={styles.itineraryDesc}>10 days of relaxation, yoga, and exploration in tropical paradise with personalized wellness activities.</p>
            <div style={styles.itineraryMeta}>
              <span>Bali, Indonesia</span>
              <span>10 days • Created with AI</span>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Favorite Destinations</h2>
        <div style={styles.favoritesGrid}>
          <div style={styles.favoriteCard} className="favorite-card">
            <img src="https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400" alt="Paris" style={styles.favoriteImage} />
            <div style={styles.favoriteContent}>
              <h3 style={styles.favoriteTitle}>Paris, France</h3>
              <p style={styles.favoriteDesc}>The romantic capital with iconic landmarks and world-class cuisine.</p>
            </div>
          </div>
          <div style={styles.favoriteCard} className="favorite-card">
            <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" alt="Tokyo" style={styles.favoriteImage} />
            <div style={styles.favoriteContent}>
              <h3 style={styles.favoriteTitle}>Tokyo, Japan</h3>
              <p style={styles.favoriteDesc}>A fascinating blend of tradition and modernity in Asia's largest city.</p>
            </div>
          </div>
          <div style={styles.favoriteCard} className="favorite-card">
            <img src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400" alt="Bali" style={styles.favoriteImage} />
            <div style={styles.favoriteContent}>
              <h3 style={styles.favoriteTitle}>Bali, Indonesia</h3>
              <p style={styles.favoriteDesc}>Tropical paradise offering beaches, temples, and spiritual experiences.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Travel Preferences</h2>
        <div style={styles.settings}>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Adventure Activities</span>
            <div style={{...styles.toggle, ...styles.toggleActive}}>
              <div style={{...styles.toggleButton, ...styles.toggleButtonActive}}></div>
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Cultural Experiences</span>
            <div style={{...styles.toggle, ...styles.toggleActive}}>
              <div style={{...styles.toggleButton, ...styles.toggleButtonActive}}></div>
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Food & Cuisine</span>
            <div style={{...styles.toggle, ...styles.toggleActive}}>
              <div style={{...styles.toggleButton, ...styles.toggleButtonActive}}></div>
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Relaxation & Wellness</span>
            <div style={styles.toggle}>
              <div style={styles.toggleButton}></div>
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Email Notifications</span>
            <div style={{...styles.toggle, ...styles.toggleActive}}>
              <div style={{...styles.toggleButton, ...styles.toggleButtonActive}}></div>
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Dark Mode</span>
            <div style={styles.toggle}>
              <div style={styles.toggleButton}></div>
            </div>
          </div>
        </div>
      </section>

      <div style={styles.chatbotCTA}>
        <h2 style={styles.ctaTitle}>Need Help Planning Your Next Trip?</h2>
        <p style={styles.ctaText}>Chat with our AI assistant to create personalized itineraries based on your preferences</p>
        <button style={styles.ctaButton} className="cta-button">Start New Chat</button>
      </div>

      <style>
        {`
          .itinerary-card:hover, .favorite-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
          }
        `}
      </style>
    </div>
  );
};

export default Profile;
