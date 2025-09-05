'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  eventId?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track page load and lifecycle events
  useEffect(() => {
    // Track page load
    trackUserBehavior('page_loaded', {
      load_time: new Date().toISOString(),
      page: 'chat_interface',
      user_agent: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      trackUserBehavior('page_visibility_changed', {
        visibility: document.hidden ? 'hidden' : 'visible',
        timestamp: new Date().toISOString(),
      });
    };

    // Track before page unload
    const handleBeforeUnload = () => {
      trackUserBehavior('page_before_unload', {
        unload_time: new Date().toISOString(),
        session_duration: Date.now() - performance.timing.navigationStart,
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: conversationId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Update conversation ID if this is the first message
      if (!conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        eventId: data.eventId,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (eventId: string, feedback: 'positive' | 'negative', comment?: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          feedback,
          comment,
          rating: feedback === 'positive' ? 5 : 1,
          category: 'ai_response_quality',
          userId: 'user_123',
        }),
      });
      
      // Track feedback submission analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: 'feedback_submitted',
          userId: 'user_123',
          data: {
            feedback_type: feedback,
            has_comment: !!comment,
            comment_length: comment?.length || 0,
            response_quality: feedback === 'positive' ? 'high' : 'low',
            user_engagement: 'high',
          },
        }),
      });
      
      // Show feedback confirmation
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Track user behavior events
  const trackUserBehavior = async (behaviorType: string, data: any = {}) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType: behaviorType,
          userId: 'user_123',
          data: {
            ...data,
            timestamp: new Date().toISOString(),
            page: 'chat_interface',
            component: 'ChatInterface',
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  };

  // Track when user starts typing
  const handleInputChange = (value: string) => {
    if (value.length > 0) {
      trackUserBehavior('user_typing', {
        input_length: value.length,
        typing_speed: 'estimated',
        has_content: true,
      });
    }
  };

  // Track when user focuses on input
  const handleInputFocus = () => {
    trackUserBehavior('input_focused', {
      focus_time: new Date().toISOString(),
      interaction_type: 'input_focus',
    });
  };

  // Track when user scrolls
  const handleScroll = () => {
    trackUserBehavior('user_scrolled', {
      scroll_time: new Date().toISOString(),
      scroll_position: 'estimated',
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Raindrop AI Chat</h1>
        <p className="text-sm opacity-90">
          Test the Raindrop tracking system with AI interactions
        </p>
        {conversationId && (
          <p className="text-xs opacity-75 mt-1">
            Conversation ID: {conversationId}
          </p>
        )}
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation to test Raindrop tracking!</p>
            <p className="text-sm mt-2">
              All interactions will be tracked and sent to your Raindrop dashboard.
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onFeedback={handleFeedback}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onInputFocus={handleInputFocus}
      />
    </div>
  );
}
