import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Destination {
  id: string;
  name: string;
  subtitle: string;
  rating: string;
  bestTimeToVisit: string;
  weather: string;
  currency: string;
  language: string;
  about: string;
  highlights: {
    title: string;
    items: string[];
  }[];
  attractions: {
    id: string;
    name: string;
    image: string;
    description: string;
  }[];
  heroImage: string;
}

const destinationsData: Destination[] = [
  {
    id: '6',
    name: 'Sydney, Australia',
    subtitle: 'Where stunning harbors meet vibrant city life',
    rating: '★★★★★',
    bestTimeToVisit: 'September - November (Spring)',
    weather: 'Temperate, 17-26°C',
    currency: 'Australian Dollar (AUD)',
    language: 'English',
    about:
      "Sydney is Australia's largest and most vibrant city, famous for its stunning harbor, iconic landmarks like the Sydney Opera House and Harbour Bridge, and beautiful beaches. This cosmopolitan city offers a perfect blend of urban sophistication and natural beauty, making it a must-visit destination for travelers from around the world.",
    highlights: [
      {
        title: 'Highlights',
        items: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Royal Botanic Gardens'],
      },
      {
        title: 'Activities',
        items: ['Harbor cruises', 'Beach hopping', 'Cultural tours', 'Outdoor adventures'],
      },
    ],
    attractions: [
      {
        id: '1',
        name: 'Sydney Opera House',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        description:
          'Iconic performing arts venue and UNESCO World Heritage Site, renowned for its unique architecture.',
      },
      {
        id: '2',
        name: 'Sydney Harbour Bridge',
        image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400',
        description:
          'Massive steel arch bridge offering stunning views and adventure activities like bridge climbing.',
      },
      {
        id: '3',
        name: 'Bondi Beach',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        description:
          'Famous beach known for its golden sands, surfing culture, and coastal walking paths.',
      },
    ],
    heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
  },
  // Add more destinations here as needed
];

const DestinationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    if (id) {
      const found = destinationsData.find((dest) => dest.id === id);
      setDestination(found || null);
    }
  }, [id]);

  if (!destination) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Destination not found.</div>;
  }

  const styles = {
    hero: {
      height: '60vh',
      backgroundImage: `url(${destination.heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      textAlign: 'center' as const,
      position: 'relative' as const,
    },
    heroOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(0, 119, 182, 0.7), rgba(42, 157, 143, 0.7))',
    },
    heroContent: {
      zIndex: 1,
      maxWidth: '800px',
    },
    heroTitle: {
      fontSize: '48px',
      marginBottom: '10px',
      fontFamily: "'Montserrat', sans-serif",
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    },
    heroSubtitle: {
      fontSize: '20px',
      marginBottom: '20px',
      opacity: 0.9,
    },
    rating: {
      fontSize: '24px',
      color: '#ff6b35',
      marginBottom: '20px',
    },
    section: {
      padding: '60px 30px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    quickInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '30px',
      marginBottom: '60px',
    },
    infoCard: {
      textAlign: 'center' as const,
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    infoIcon: {
      fontSize: '48px',
      marginBottom: '15px',
    },
    infoTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    about: {
      marginBottom: '60px',
    },
    aboutTitle: {
      fontSize: '36px',
      marginBottom: '20px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    aboutText: {
      fontSize: '18px',
      lineHeight: '1.8',
      color: '#666',
      marginBottom: '30px',
    },
    highlights: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginTop: '40px',
    },
    highlightCard: {
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    highlightTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    highlightList: {
      listStyle: 'none',
      padding: 0,
    },
    highlightItem: {
      padding: '8px 0',
      borderBottom: '1px solid #f0f0f0',
      color: '#666',
    },
    attractions: {
      marginBottom: '60px',
    },
    attractionsTitle: {
      fontSize: '36px',
      marginBottom: '20px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    attractionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      marginTop: '40px',
    },
    attractionCard: {
      border: 'none',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      backgroundColor: '#ffffff',
    },
    attractionImage: {
      width: '100%',
      height: '200px',
      objectFit: 'cover' as const,
    },
    attractionContent: {
      padding: '20px',
    },
    attractionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
      fontFamily: "'Montserrat', sans-serif",
    },
    attractionText: {
      color: '#666',
      lineHeight: '1.6',
    },
    map: {
      height: '400px',
      backgroundColor: '#f9f9f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '60px',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    cta: {
      textAlign: 'center' as const,
      padding: '40px',
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
    ctaTitle: {
      fontSize: '32px',
      marginBottom: '15px',
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

  const handlePlanWithAI = () => {
    // Scroll to chatbot widget and open it if possible
    const chatWidgetToggle = document.querySelector('.chatbot-cta');
    if (chatWidgetToggle && 'click' in chatWidgetToggle) {
      (chatWidgetToggle as HTMLElement).click();
    }
  };

  return (
    <div>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{destination.name}</h1>
          <p style={styles.heroSubtitle}>{destination.subtitle}</p>
          <div style={styles.rating}>{destination.rating}</div>
        </div>
      </section>

      <div style={styles.section}>
        <section style={styles.quickInfo}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🗓️</div>
            <h3 style={styles.infoTitle}>Best Time to Visit</h3>
            <p>{destination.bestTimeToVisit}</p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🌡️</div>
            <h3 style={styles.infoTitle}>Weather</h3>
            <p>{destination.weather}</p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>💰</div>
            <h3 style={styles.infoTitle}>Currency</h3>
            <p>{destination.currency}</p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🗣️</div>
            <h3 style={styles.infoTitle}>Language</h3>
            <p>{destination.language}</p>
          </div>
        </section>

        <section style={styles.about}>
          <h2 style={styles.aboutTitle}>About {destination.name}</h2>
          <p style={styles.aboutText}>{destination.about}</p>
          <div style={styles.highlights}>
            {destination.highlights.map((highlight, index) => (
              <div key={index} style={styles.highlightCard}>
                <h3 style={styles.highlightTitle}>{highlight.title}</h3>
                <ul style={styles.highlightList}>
                  {highlight.items.map((item, idx) => (
                    <li key={idx} style={styles.highlightItem}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.attractions}>
          <h2 style={styles.attractionsTitle}>Top Attractions</h2>
          <div style={styles.attractionsGrid}>
            {destination.attractions.map((attraction) => (
              <div key={attraction.id} style={styles.attractionCard} className="attraction-card">
                <img src={attraction.image} alt={attraction.name} style={styles.attractionImage} />
                <div style={styles.attractionContent}>
                  <h3 style={styles.attractionTitle}>{attraction.name}</h3>
                  <p style={styles.attractionText}>{attraction.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.map}>
          <p style={{ fontSize: '24px', color: '#666' }}>Interactive Map Coming Soon</p>
        </section>

        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Plan Your {destination.name} Adventure with AI</h2>
          <p style={styles.ctaText}>Let our intelligent chatbot create a personalized itinerary for your {destination.name} trip</p>
          <button style={styles.ctaButton} className="chatbot-cta" onClick={handlePlanWithAI}>Start Planning with AI</button>
        </section>
      </div>
      <style>
        {`
          .attraction-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(255, 107, 53, 0.4);
          }
        `}
      </style>
    </div>
  );
};

export default DestinationDetail;
