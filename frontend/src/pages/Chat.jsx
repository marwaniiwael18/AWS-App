import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { useSkill } from '../contexts/SkillContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Chat = () => {
  const { user } = useAuth();
  const { matchId } = useParams();
  const { matches, loading } = useSkill();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Find the current match
    const match = matches.find(m => m.id === matchId);
    setCurrentMatch(match);
    
    // Load messages for this match
    loadMessages(matchId);
  }, [matchId, matches]);

  const loadMessages = async (matchId) => {
    // Mock messages - in real app, this would fetch from API
    const mockMessages = [
      {
        id: 1,
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        content: 'Hi! I saw your profile and would love to learn React from you!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isOwn: false,
      },
      {
        id: 2,
        senderId: user?.sub || 'current-user',
        senderName: 'You',
        content: 'Hi Sarah! I\'d be happy to help you learn React. Are you completely new to it?',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isOwn: true,
      },
      {
        id: 3,
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        content: 'I have some basic JavaScript knowledge but haven\'t worked with React before. I can teach you Spanish in exchange!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isOwn: false,
      },
      {
        id: 4,
        senderId: user?.sub || 'current-user',
        senderName: 'You',
        content: 'Perfect! That sounds like a great exchange. When would be a good time for you to start?',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isOwn: true,
      },
    ];
    
    setMessages(mockMessages);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      senderId: user?.sub || 'current-user',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That sounds great! Let's set up a time to meet.",
        "I'm excited to get started!",
        "Thank you for being so helpful!",
        "Looking forward to our skill exchange session.",
      ];
      
      const response = {
        id: messages.length + 2,
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        isOwn: false,
      };
      
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentMatch?.otherUser?.name || 'Sarah Johnson'}
                </h1>
                <p className="text-sm text-gray-500">
                  Skills: Python, Spanish
                </p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn ? 'text-primary-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-900">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn-primary"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Remember to be respectful and follow our community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat; 