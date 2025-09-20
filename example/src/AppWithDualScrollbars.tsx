import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import TravelMateChatbotFixed from './components/TravelMateChatbotFixed.tsx';
import Home from './pages/Home.tsx';
import Destinations from './pages/Destinations.tsx';
import DestinationDetail from './pages/DestinationDetail.tsx';
import Profile from './pages/Profile.tsx';

const AppWithDualScrollbars = () => {
  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: '100vh',
      fontFamily: "'Inter', 'Open Sans', sans-serif",
      backgroundColor: '#f5f5f5',
      position: 'relative' as const,
    },
    main: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '0',
      maxHeight: 'calc(100vh - 120px)', // Account for navbar and footer
      scrollBehavior: 'smooth' as const,
    },
    content: {
      minHeight: '100%',
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
            overflow: hidden; /* Prevent body scrolling */
          }

          h1, h2, h3, h4, h5, h6 {
            font-family: 'Montserrat', 'Poppins', sans-serif;
          }

          /* Main website scrollbar */
          .main-scroll {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            scroll-behavior: smooth;
          }

          .main-scroll::-webkit-scrollbar {
            width: 12px;
            background: #f1f5f9;
          }

          .main-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 6px;
            border: 1px solid #ffffff;
          }

          .main-scroll::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            border-radius: 6px;
            border: 2px solid #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .main-scroll::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #475569 0%, #334155 100%);
          }

          .main-scroll::-webkit-scrollbar-corner {
            background: #e2e8f0;
          }

          /* Firefox main scrollbar */
          .main-scroll {
            scrollbar-width: auto;
            scrollbar-color: #64748b #e2e8f0;
          }

          @media (max-width: 768px) {
            .main-scroll {
              max-height: calc(100vh - 100px);
            }
          }
        `}
      </style>
      <Navbar />
      <main className="main-scroll" style={styles.main}>
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destination/:id" element={<DestinationDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <TravelMateChatbotFixed />
    </div>
  );
};

export default AppWithDualScrollbars;
