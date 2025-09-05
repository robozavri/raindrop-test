'use client';

import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  eventId?: string;
}

interface ChatMessageProps {
  message: Message;
  onFeedback: (eventId: string, feedback: 'positive' | 'negative', comment?: string) => void;
}

export default function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [comment, setComment] = useState('');

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    if (message.eventId) {
      onFeedback(message.eventId, feedback, comment);
      setShowFeedback(false);
      setComment('');
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
        
        {message.role === 'assistant' && message.eventId && (
          <div className="mt-2">
            {!showFeedback ? (
              <button
                onClick={() => setShowFeedback(true)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Rate this response
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleFeedback('positive')}
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                  >
                    👍 Good
                  </button>
                  <button
                    onClick={() => handleFeedback('negative')}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                  >
                    👎 Bad
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs px-2 py-1 border rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
