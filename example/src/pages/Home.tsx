import React from 'react';

const Home: React.FC = () => {
  const styles = {
    hero: {
      height: '80vh',
      background: 'linear-gradient(135deg, #0077b6 0%, #00a8cc 50%, #2a9d8f 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      textAlign: 'center' as const,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    heroOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(0, 119, 182, 0.7), rgba(42, 157, 143, 0.7))',
      animation: 'pulse 4s ease-in-out infinite',
    },
    heroContent: {
      zIndex: 1,
      maxWidth: '800px',
      animation: 'fadeInUp 1s ease-out',
    },
    heroTitle: {
      fontSize: '48px',
      marginBottom: '20px',
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      fontFamily: "'Montserrat', sans-serif",
    },
    heroSubtitle: {
      fontSize: '20px',
      marginBottom: '30px',
      opacity: 0.9,
    },
    searchBar: {
      display: 'flex',
      marginBottom: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
      borderRadius: '50px',
      overflow: 'hidden',
      maxWidth: '600px',
      margin: '0 auto 30px',
    },
    searchInput: {
      flex: 1,
      padding: '15px 20px',
      border: 'none',
      outline: 'none',
      fontSize: '16px',
      backgroundColor: '#ffffff',
    },
    searchButton: {
      padding: '15px 30px',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'transform 0.3s ease',
    },
    aiButton: {
      padding: '15px 30px',
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      marginLeft: '20px',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(0,119,182,0.4)',
      transition: 'all 0.3s ease',
    },
    section: {
      padding: '60px 30px',
      textAlign: 'center' as const,
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '36px',
      marginBottom: '20px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    sectionSubtitle: {
      fontSize: '18px',
      marginBottom: '40px',
      color: '#666',
    },
    destinationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      marginTop: '40px',
    },
    card: {
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      backgroundColor: '#ffffff',
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
    cardText: {
      color: '#666',
      lineHeight: '1.6',
    },
    steps: {
      display: 'flex',
      justifyContent: 'center',
      gap: '60px',
      marginTop: '40px',
      flexWrap: 'wrap' as const,
    },
    step: {
      textAlign: 'center' as const,
      maxWidth: '250px',
    },
    stepIcon: {
      fontSize: '64px',
      marginBottom: '15px',
    },
    stepTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    testimonials: {
      backgroundColor: '#f9f9f9',
      padding: '60px 30px',
    },
    testimonialsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    testimonialCard: {
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
      textAlign: 'left' as const,
    },
    testimonialText: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '20px',
      fontStyle: 'italic',
      lineHeight: '1.6',
    },
    testimonialAuthor: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
    },
    testimonialRole: {
      fontSize: '14px',
      color: '#0077b6',
    },
    ctaBanner: {
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      padding: '40px 30px',
      textAlign: 'center' as const,
    },
    ctaTitle: {
      fontSize: '32px',
      marginBottom: '20px',
      fontFamily: "'Montserrat', sans-serif",
    },
    ctaText: {
      fontSize: '18px',
      marginBottom: '30px',
      opacity: 0.9,
    },
    ctaButton: {
      padding: '15px 40px',
      background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
      transition: 'transform 0.3s, box-shadow 0.3s',
    },
  };

  return (
    <div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.9; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .searchButton:hover {
            transform: scale(1.05);
          }
          .aiButton:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,119,182,0.6);
          }
          .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
          }
        `}
      </style>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Discover Your Next Adventure with AI</h1>
          <p style={styles.heroSubtitle}>Let our intelligent chatbot plan your perfect trip</p>
          <div style={styles.searchBar}>
            <input type="text" placeholder="Where do you want to go?" style={styles.searchInput} />
            <button style={styles.searchButton} className="searchButton">Search</button>
          </div>
          <button style={styles.aiButton} className="aiButton">Ask AI for itinerary</button>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Destinations</h2>
        <p style={styles.sectionSubtitle}>Explore the world's most beautiful places</p>
        <div style={styles.destinationsGrid}>
          <div style={styles.card} className="card">
            <img src="https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400" alt="Paris" style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Paris, France</h3>
              <p style={styles.cardText}>The City of Light awaits with its iconic landmarks, romantic atmosphere, and world-class cuisine.</p>
            </div>
          </div>
          <div style={styles.card} className="card">
            <img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400" alt="Tokyo" style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Tokyo, Japan</h3>
              <p style={styles.cardText}>Experience the perfect blend of traditional culture and cutting-edge technology in the vibrant capital.</p>
            </div>
          </div>
          <div style={styles.card} className="card">
            <img src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400" alt="Bali" style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>Bali, Indonesia</h3>
              <p style={styles.cardText}>Relax on pristine beaches, explore ancient temples, and immerse yourself in tropical paradise.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionSubtitle}>Plan your dream trip in three simple steps</p>
        <div style={styles.steps}>
          <div style={styles.step}>
            <div style={styles.stepIcon}>🔍</div>
            <h3 style={styles.stepTitle}>Explore</h3>
            <p>Browse destinations and share your interests with our AI</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>🤖</div>
            <h3 style={styles.stepTitle}>AI Planning</h3>
            <p>Our intelligent chatbot creates personalized itineraries</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepIcon}>📅</div>
            <h3 style={styles.stepTitle}>Book & Enjoy</h3>
            <p>Save your plan and book your perfect adventure</p>
          </div>
        </div>
      </section>

      <section style={styles.testimonials}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What Travelers Say</h2>
          <p style={styles.sectionSubtitle}>Real experiences from our AI-powered travel planning</p>
          <div style={styles.testimonialsGrid}>
            <div style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"The AI chatbot helped me discover hidden gems in Paris I never would have found on my own. My trip was absolutely perfect!"</p>
              <div style={styles.testimonialAuthor}>Sarah Johnson</div>
              <div style={styles.testimonialRole}>Adventure Traveler</div>
            </div>
            <div style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"TravelMate's AI understood my preferences perfectly and created an itinerary that matched my interests. Highly recommend!"</p>
              <div style={styles.testimonialAuthor}>Mike Chen</div>
              <div style={styles.testimonialRole}>Business Traveler</div>
            </div>
            <div style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"The personalized recommendations were spot-on. The chatbot felt like a knowledgeable friend planning my trip."</p>
              <div style={styles.testimonialAuthor}>Emma Rodriguez</div>
              <div style={styles.testimonialRole}>Solo Traveler</div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.ctaBanner}>
        <h2 style={styles.ctaTitle}>Ready for Your Next Adventure?</h2>
        <p style={styles.ctaText}>Let our AI help you plan the perfect trip — Start chatting now!</p>
        <button style={styles.ctaButton} className="cta-button">Chat with AI Assistant</button>
      </section>
    </div>
  );
};

export default Home;
