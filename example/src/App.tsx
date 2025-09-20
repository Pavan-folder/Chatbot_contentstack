import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import AmazonStyleWidget from './components/AmazonStyleWidget.tsx';
import Home from './pages/Home.tsx';
import Destinations from './pages/Destinations.tsx';
import DestinationDetail from './pages/DestinationDetail.tsx';
import Profile from './pages/Profile.tsx';

const App = () => {
  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100vh',
      fontFamily: "'Inter', 'Open Sans', sans-serif",
      backgroundColor: '#f5f5f5',
    },
    main: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '0',
    },
  };

  return (
    <div style={styles.app}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', 'Open Sans', sans-serif;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Montserrat', 'Poppins', sans-serif;
          }
          @media (max-width: 768px) {
            .main {
              flex-direction: column;
            }
            .content {
              flex: 1;
            }
            .sidebar {
              flex: none;
              height: 400px;
              border-left: none;
              border-top: 1px solid #e0e0e0;
            }
          }
        `}
      </style>
      <Navbar />
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default App;
