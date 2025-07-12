import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  FaceSmileIcon
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
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        content: 'Hi! I saw your profile and would love to learn React from you! 🚀',
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
        content: 'I have some basic JavaScript knowledge but haven\'t worked with React before. I can teach you Spanish in exchange! 🇪🇸',
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
      {
        id: 5,
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        content: 'How about this weekend? I\'m free Saturday afternoon.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        isOwn: false,
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
        "That sounds great! Let's set up a time to meet. 📅",
        "I'm excited to get started! 🎉",
        "Thank you for being so helpful! 🙏",
        "Looking forward to our skill exchange session. ✨",
        "Perfect! I'll prepare some materials for our session. 📚",
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
    }, 1500);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
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
      <div className="max-w-4xl mx-auto bg-white shadow-xl min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/matches"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                {isOnline && (
                  <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentMatch?.otherUser?.name || 'Sarah Johnson'}
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                  {isOnline ? 'Active now' : 'Last seen 2h ago'} • Skills: React, Spanish
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <InformationCircleIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Date separator */}
          <div className="flex justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-500 shadow-sm">
              {formatDate(messages[0]?.timestamp)}
            </span>
          </div>

          {messages.map((message, index) => {
            const showAvatar = index === 0 || messages[index - 1]?.isOwn !== message.isOwn;
            const showTime = index === messages.length - 1 || 
                           messages[index + 1]?.isOwn !== message.isOwn ||
                           new Date(messages[index + 1]?.timestamp) - new Date(message.timestamp) > 5 * 60 * 1000;

            return (
              <div key={message.id}>
                <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                  {!message.isOwn && showAvatar && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-auto">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${message.isOwn ? 'mr-3' : !showAvatar ? 'ml-11' : ''}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.isOwn
                          ? 'bg-blue-600 text-white rounded-br-lg'
                          : 'bg-white text-gray-900 shadow-sm border border-gray-200 rounded-bl-lg'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    
                    {showTime && (
                      <p className={`text-xs mt-1 ${message.isOwn ? 'text-right text-gray-500' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start mt-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <UserIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-lg shadow-sm border border-gray-200 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={sendMessage} className="flex items-end space-x-3">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaceSmileIcon className="h-6 w-6" />
              </button>
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`p-3 rounded-full transition-colors ${
                newMessage.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
          
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">
              Remember to be respectful and follow our community guidelines.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 