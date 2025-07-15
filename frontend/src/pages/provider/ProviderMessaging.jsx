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
  LogOut,
  Menu,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { mockMessages } from '../../data/mockData';
import { STANDARD_PROVIDER_SIDEBAR, handleStandardLogout } from '../../constants/providerSidebarConfig';
import apiService from '../../services/api';

const ProviderMessaging = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState({
    serviceType: '',
    description: '',
    price: '',
    estimatedTime: '',
    startDate: '',
    additionalNotes: ''
  });

  const handleLogout = () => {
    handleStandardLogout(navigate);
  };

  const sidebarItems = STANDARD_PROVIDER_SIDEBAR;

  useEffect(() => {
    loadMessages();
    
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    window.scrollTo(0, 0);
    
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const messageThreads = await apiService.getMessageThreads();
      
      // Format message threads for display
      const formattedThreads = messageThreads.map(thread => ({
        id: thread.id,
        customerName: thread.homeowner_name,
        serviceType: thread.service_type,
        lastMessage: thread.last_message,
        lastMessageTime: thread.last_message_time,
        unreadCount: thread.unread_count || 0,
        status: thread.status || 'active',
        orderId: thread.order_id
      }));
      
      setMessages(formattedThreads);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim() || !selectedConversation) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const newMessage = {
        thread_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'provider',
        content: messageContent,
        timestamp: new Date().toISOString()
      };

      await apiService.sendMessage(newMessage);
      
      // Reload messages to get updated conversation
      await loadMessages();
      setNewMessage('');
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    if (isMobileView) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      sendMessage(newMessage);
    }
  };

  const filteredMessages = messages.filter(msg => 
    (msg.homeownerName && msg.homeownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (msg.orderType && msg.orderType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendProposal = () => {
    if (selectedConversation) {
      const proposalMessage = {
        id: Date.now(),
        sender: 'provider',
        content: `Service Proposal:
📋 Service: ${proposalData.serviceType}
💰 Price: $${proposalData.price}
⏱️ Estimated Time: ${proposalData.estimatedTime}
📅 Start Date: ${proposalData.startDate}
📝 Description: ${proposalData.description}
${proposalData.additionalNotes ? `\n📄 Additional Notes: ${proposalData.additionalNotes}` : ''}`,
        timestamp: new Date().toISOString(),
        read: true,
        isProposal: true
      };

      const updatedMessages = messages.map(msg => {
        if (msg.id === selectedConversation.id) {
          return {
            ...msg,
            messages: [...msg.messages, proposalMessage]
          };
        }
        return msg;
      });

      setMessages(updatedMessages);
      setShowProposalForm(false);
      setProposalData({
        serviceType: '',
        description: '',
        price: '',
        estimatedTime: '',
        startDate: '',
        additionalNotes: ''
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {isMobileView && showChat ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              )}
              <h1 className="text-2xl font-bold text-blue-600">Doord.</h1>
              <span className="text-sm text-gray-600 hidden sm:inline">for Merchants</span>
            </div>
            
            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  ES
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === 'messages' ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                ))}
                <hr className="my-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-64 bg-white shadow-sm">
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
        <div className="flex-1 flex flex-col">
          {/* Mobile: Show either user list or chat */}
          {isMobileView ? (
            <>
              {!showChat ? (
                /* User List for Mobile */
                <div className="flex-1 p-4">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left">Messages</h2>
                    <p className="text-gray-600 text-left">Connect with your customers</p>
                  </div>

                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* User List */}
                  <div className="space-y-3">
                    {filteredMessages.map((conversation) => (
                      <Card 
                        key={conversation.id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleConversationSelect(conversation)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {conversation.homeownerName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                  {conversation.homeownerName}
                                </h3>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  {new Date(conversation.lastMessageTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mb-1">
                                {conversation.orderType}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage 
                                  ? conversation.lastMessage.split(' ').slice(0, 6).join(' ') + (conversation.lastMessage.split(' ').length > 6 ? '...' : '')
                                  : 'No messages yet'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="bg-blue-600 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat View for Mobile */
                <div className="flex-1 flex flex-col">
                  {selectedConversation && (
                    <>
                      {/* Chat Header */}
                      <div className="bg-white border-b p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {selectedConversation.homeownerName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedConversation.homeownerName}</h3>
                              <p className="text-sm text-gray-600">{selectedConversation.orderType}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedConversation.messages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'provider' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'provider' 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="bg-white border-t p-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowProposalForm(true)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button onClick={handleSendMessage} size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Desktop View */
            <div className="flex-1 flex">
              {/* Conversations List */}
              <div className="w-80 bg-white border-r">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-left">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto">
                  {filteredMessages.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {conversation.homeownerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.homeownerName}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.lastMessageTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.orderType}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="bg-blue-600">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-white border-b p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {selectedConversation.homeownerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">{selectedConversation.homeownerName}</h3>
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
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'provider' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'provider' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'provider' 
                                ? 'text-blue-100' 
                                : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="bg-white border-t p-4">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowProposalForm(true)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Proposal Form Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Send Proposal</span>
                <Button variant="ghost" size="sm" onClick={() => setShowProposalForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <Input
                  value={proposalData.serviceType}
                  onChange={(e) => setProposalData({...proposalData, serviceType: e.target.value})}
                  placeholder="e.g., Plumbing, Electrical, Cleaning"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <Input
                  type="number"
                  value={proposalData.price}
                  onChange={(e) => setProposalData({...proposalData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <Input
                  value={proposalData.estimatedTime}
                  onChange={(e) => setProposalData({...proposalData, estimatedTime: e.target.value})}
                  placeholder="e.g., 2-3 hours"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={proposalData.startDate}
                  onChange={(e) => setProposalData({...proposalData, startDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={proposalData.description}
                  onChange={(e) => setProposalData({...proposalData, description: e.target.value})}
                  placeholder="Describe the service you'll provide..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                <Textarea
                  value={proposalData.additionalNotes}
                  onChange={(e) => setProposalData({...proposalData, additionalNotes: e.target.value})}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSendProposal}
                  className="flex-1"
                  disabled={!proposalData.serviceType || !proposalData.price || !proposalData.description}
                >
                  Send Proposal
                </Button>
                <Button variant="outline" onClick={() => setShowProposalForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProviderMessaging;