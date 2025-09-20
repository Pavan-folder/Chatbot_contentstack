import React from 'react';
import { Link } from 'react-router-dom';

const Destinations: React.FC = () => {
  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '40px',
    },
    title: {
      fontSize: '42px',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    subtitle: {
      fontSize: '18px',
      color: '#666',
      marginBottom: '30px',
    },
    filters: {
      display: 'flex',
      gap: '20px',
      marginBottom: '40px',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    },
    select: {
      padding: '12px 16px',
      border: '2px solid #e0e0e0',
      borderRadius: '25px',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'border-color 0.3s',
      minWidth: '150px',
    },
    searchInput: {
      padding: '12px 20px',
      border: '2px solid #e0e0e0',
      borderRadius: '25px',
      fontSize: '14px',
      flex: 1,
      maxWidth: '400px',
      transition: 'border-color 0.3s',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
    },
    card: {
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    },
    cardImage: {
      width: '100%',
      height: '250px',
      objectFit: 'cover' as const,
    },
    cardContent: {
      padding: '20px',
    },
    cardTitle: {
      fontSize: '24px',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    cardTags: {
      display: 'flex',
      gap: '8px',
      marginBottom: '15px',
      flexWrap: 'wrap' as const,
    },
    tag: {
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
    },
    viewDetails: {
      display: 'inline-block',
      color: '#0077b6',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'color 0.3s',
    },
    chatbotCTA: {
      marginTop: '15px',
      padding: '10px 15px',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'transform 0.3s, box-shadow 0.3s',
      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
    },
  };

  const destinations = [

    { id: 2, name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', tags: ['Culture', 'Technology', 'Adventure'], description: 'Blend of traditional culture and cutting-edge innovation.' },
    { id: 3, name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400', tags: ['Nature', 'Relaxation', 'Spirituality'], description: 'Tropical paradise with beautiful beaches and ancient temples.' },
    { id: 4, name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', tags: ['City', 'Entertainment', 'Diversity'], description: 'The city that never sleeps, full of energy and culture.' },
    { id: 5, name: 'Rome, Italy', image: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400', tags: ['History', 'Food', 'Architecture'], description: 'Eternal city with ancient ruins and delicious cuisine.' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Destinations</h1>
        <p style={styles.subtitle}>Discover amazing places around the world with AI-powered travel planning</p>
      </div>
      <div style={styles.filters}>
        <select style={styles.select}>
          <option>All Regions</option>
          <option>Europe</option>
          <option>Asia</option>
          <option>America</option>
          <option>Australia</option>
        </select>
        <select style={styles.select}>
          <option>All Interests</option>
          <option>Food & Cuisine</option>
          <option>History & Culture</option>
          <option>Nature & Outdoors</option>
          <option>Adventure & Sports</option>
          <option>Relaxation & Wellness</option>
        </select>
        <input type="text" placeholder="Search destinations..." style={styles.searchInput} />
      </div>
      <div style={styles.grid}>
        {destinations.map(dest => (
          <div key={dest.id} style={styles.card} className="card">
            <img src={dest.image} alt={dest.name} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{dest.name}</h3>
              <p style={{ color: '#666', marginBottom: '15px', lineHeight: '1.6' }}>{dest.description}</p>
              <div style={styles.cardTags}>
                {dest.tags.map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>
              <Link to={`/destination/${dest.id}`} style={styles.viewDetails}>View Details →</Link>
              <br />
              <button style={styles.chatbotCTA} className="chatbot-cta">Plan with AI</button>
            </div>
          </div>
        ))}
      </div>
      <style>
        {`
          .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .select:focus, .searchInput:focus {
            outline: none;
            border-color: #0077b6;
          }
          .viewDetails:hover {
            color: #005f87;
          }
          .chatbot-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
          }
        `}
      </style>
    </div>
  );
};

export default Destinations;
