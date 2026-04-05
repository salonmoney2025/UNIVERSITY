'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send, Plus, Search, Settings, MoreVertical, Paperclip,
  Smile, Phone, Video, X, Clock, CheckCheck, Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_BASE = 'http://localhost:5000/api/v1';
const WS_BASE = 'ws://localhost:5000/ws';

export default function MessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const token = localStorage.getItem('access_token');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/messaging/conversations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    }
  });

  // Fetch messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await fetch(
        `${API_BASE}/messaging/messages/?conversation_id=${selectedConversation}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return res.json();
    },
    enabled: !!selectedConversation
  });

  // Fetch online users
  const { data: presenceData } = useQuery({
    queryKey: ['presence'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/messaging/presence/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.json();
    },
    refetchInterval: 30000
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`${API_BASE}/messaging/messages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          content,
          reply_to_id: replyingTo?.id
        })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageInput('');
      setReplyingTo(null);
    }
  });

  // Setup WebSocket connection
  useEffect(() => {
    if (!token || !selectedConversation) return;

    const wsUrl = `${WS_BASE}/chat/${selectedConversation}/?token=${token}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      setWs(websocket);
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onclose = () => {
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, [selectedConversation, token]);

  const handleWebSocketMessage = (data) => {
    const messageType = data.type;

    switch (messageType) {
      case 'message':
        queryClient.invalidateQueries(['messages']);
        break;
      case 'user_typing':
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.id === data.user.id)) {
            return [...prev, data.user];
          }
          return prev;
        });
        break;
      case 'user_stopped_typing':
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.user_id));
        break;
      case 'message_read':
        queryClient.invalidateQueries(['messages']);
        break;
      case 'user_join':
        queryClient.invalidateQueries(['conversations']);
        break;
      case 'user_leave':
        queryClient.invalidateQueries(['conversations']);
        break;
      default:
        break;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleTyping = useCallback((isTyping) => {
    if (!ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'typing',
      is_typing: isTyping
    }));

    if (isTyping) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  }, [ws, isConnected]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    handleTyping(e.target.value.length > 0);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (presenceData) {
      setOnlineUsers(presenceData);
    }
  }, [presenceData]);

  const filteredConversations = conversations?.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedConvData = conversations?.find((c) => c.id === selectedConversation);

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar - Conversations List */}
      <div className="w-72 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewConversation(!showNewConversation)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConversation;
              const isOnline = onlineUsers.some((u) =>
                conv.participants?.some((p) => p.id === u.user?.id)
              );

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conv.participant?.avatar} />
                        <AvatarFallback>
                          {conv.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conv.name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conv.last_message_at &&
                            formatDistanceToNow(new Date(conv.last_message_at), {
                              addSuffix: false
                            })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message?.content}
                      </p>
                      {conv.unread_count > 0 && (
                        <Badge className="mt-1 bg-blue-500">
                          {conv.unread_count} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConvData?.avatar} />
                  <AvatarFallback>
                    {selectedConvData?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedConvData?.name}
                  </h2>
                  {isConnected && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Connected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video className="w-5 h-5" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messagesLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-gray-500">No messages yet. Start the conversation!</div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender.id === parseInt(localStorage.getItem('user_id'));
                  const showAvatar =
                    !isOwn &&
                    (idx === 0 ||
                      messages[idx - 1]?.sender.id !== msg.sender.id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwn && (
                        <div className="flex-shrink-0">
                          {showAvatar ? (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={msg.sender.avatar} />
                              <AvatarFallback>
                                {msg.sender.first_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8" />
                          )}
                        </div>
                      )}

                      <div className={`max-w-xs ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isOwn && showAvatar && (
                          <p className="text-xs text-gray-500 mb-1">
                            {msg.sender.first_name} {msg.sender.last_name}
                          </p>
                        )}

                        {msg.reply_to && (
                          <div className="mb-2 text-xs bg-white p-2 rounded border-l-2 border-gray-300">
                            <p className="font-medium text-gray-600">
                              {msg.reply_to.sender.first_name}
                            </p>
                            <p className="text-gray-600 truncate">
                              {msg.reply_to.content}
                            </p>
                          </div>
                        )}

                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          {msg.is_edited && (
                            <p className="text-xs mt-1 opacity-70">(edited)</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {isOwn && (
                            <div>
                              {msg.read_by_count > 0 ? (
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Check className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {typingUsers.length > 0 && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {typingUsers[0].first_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-6 py-3 bg-blue-50 border-l-4 border-blue-500 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Replying to <span className="font-medium">{replyingTo.sender.first_name}</span>
                  </p>
                  <p className="text-sm text-gray-600 truncate">{replyingTo.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>

                <div className="flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    className="rounded-full"
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  <Smile className="w-5 h-5" />
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim()}
                  className="flex-shrink-0 bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select a conversation to start
              </h2>
              <p className="text-gray-500">Choose from your existing conversations or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
