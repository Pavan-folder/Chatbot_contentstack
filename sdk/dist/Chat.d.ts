import React from 'react';
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}
export interface ChatProps {
    apiUrl: string;
    provider?: 'openai' | 'groq' | 'anthropic';
    apiKey?: string;
}
declare const Chat: React.FC<ChatProps>;
export default Chat;
