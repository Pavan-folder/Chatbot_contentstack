import React from 'react';
import EnhancedChatbotWidgetWorking from './components/EnhancedChatbotWidgetWorking';

function AppWorking() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chatbot with Enhanced Scrolling</h1>
        <p>This version includes advanced scrolling features like:</p>
        <ul>
          <li>Smart auto-scroll (only scrolls if user is at bottom)</li>
          <li>Scroll to top/bottom buttons</li>
          <li>Smooth scrolling animations</li>
          <li>Scroll position preservation</li>
          <li>Enhanced message display</li>
        </ul>
      </header>
      <main>
        <p>Try the enhanced chatbot widget in the bottom right corner!</p>
        <p>The chatbot now works like professional chat applications with:</p>
        <ul>
          <li>Real-time streaming responses</li>
          <li>Advanced scroll management</li>
          <li>Better user experience</li>
          <li>Responsive design</li>
        </ul>
      </main>
      <EnhancedChatbotWidgetWorking />
    </div>
  );
}

export default AppWorking;
