import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  Send,
  Search,
  Bell,
  Package,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  LogOut
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { mockMessages } from '../../data/mockData';

const ProviderMessaging = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    serviceType: '',
    description: '',
    price: '',
    estimatedTime: '',
    startDate: '',
    additionalNotes: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/homeservices');
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home, path: '/homeservices/dashboard' },
    { id: 'orders', label: 'Orders', icon: Package, path: '/homeservices/orders' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/homeservices/messages' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/homeservices/calendar' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/homeservices/customers' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/homeservices/settings' }
  ];

  useEffect(() => {
    // Filter messages for current provider (mock provider ID = 1)
    const providerMessages = mockMessages.filter(msg => msg.providerId === 1);
    setMessages(providerMessages);
    
    // Set first conversation as selected by default
    if (providerMessages.length > 0) {
      setSelectedConversation(providerMessages[0]);
    }
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'provider',
      read: true,
      type: 'text'
    };

    const updatedMessages = messages.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString()
        };
      }
      return conv;
    });

    setMessages(updatedMessages);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage,
      lastMessageTime: new Date().toISOString()
    });
    setNewMessage('');
  };

  const handleSendProposal = () => {
    if (!selectedConversation || !proposalData.serviceType || !proposalData.price) return;

    const proposal = {
      id: Date.now(),
      content: `Proposal for ${proposalData.serviceType}`,
      timestamp: new Date().toISOString(),
      sender: 'provider',
      read: true,
      type: 'proposal',
      proposalData: {
        ...proposalData,
        price: parseFloat(proposalData.price),
        status: 'pending' // pending, accepted, rejected
      }
    };

    const updatedMessages = messages.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, proposal],
          lastMessage: `Proposal sent: ${proposalData.serviceType}`,
          lastMessageTime: new Date().toISOString()
        };
      }
      return conv;
    });

    setMessages(updatedMessages);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, proposal],
      lastMessage: `Proposal sent: ${proposalData.serviceType}`,
      lastMessageTime: new Date().toISOString()
    });
    
    // Reset form
    setProposalData({
      serviceType: '',
      description: '',
      price: '',
      estimatedTime: '',
      startDate: '',
      additionalNotes: ''
    });
    setShowProposalForm(false);
  };

  const handleProposalResponse = (messageId, response) => {
    const updatedMessages = messages.map(conv => {
      if (conv.id === selectedConversation.id) {
        const updatedConvMessages = conv.messages.map(msg => {
          if (msg.id === messageId && msg.type === 'proposal') {
            return {
              ...msg,
              proposalData: {
                ...msg.proposalData,
                status: response
              }
            };
          }
          return msg;
        });
        return { ...conv, messages: updatedConvMessages };
      }
      return conv;
    });

    setMessages(updatedMessages);
    
    const updatedSelectedConv = {
      ...selectedConversation,
      messages: selectedConversation.messages.map(msg => {
        if (msg.id === messageId && msg.type === 'proposal') {
          return {
            ...msg,
            proposalData: {
              ...msg.proposalData,
              status: response
            }
          };
        }
        return msg;
      })
    };
    
    setSelectedConversation(updatedSelectedConv);

    // If accepted, create an order (you can integrate with your order system here)
    if (response === 'accepted') {
      console.log('Proposal accepted! Creating order...', updatedSelectedConv.messages.find(m => m.id === messageId));
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getUnreadCount = (conversation) => {
    return conversation.messages.filter(msg => !msg.read && msg.sender === 'homeowner').length;
  };

  const filteredMessages = messages.filter(msg =>
    msg.homeownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.orderType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600">Provider Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    ES
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">Elite Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={item.id === 'messages' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex h-screen">
          {/* Conversations List */}
          <div className="w-80 bg-white border-r">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Messages</h2>
                <Badge variant="secondary">{messages.length}</Badge>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Conversations */}
              <div className="space-y-2">
                {filteredMessages.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conversation.homeownerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conversation.homeownerName}</h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessageTime)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">{conversation.orderType}</p>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                          {getUnreadCount(conversation) > 0 && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              {getUnreadCount(conversation)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {selectedConversation.homeownerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation.homeownerName}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.orderType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'provider'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'provider' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderMessaging;