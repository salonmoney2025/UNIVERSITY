'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog'
import {
  MessageSquare, Send, Search, Plus, MoreVertical,
  Paperclip, Smile, Check, CheckCheck, Circle
} from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
}

interface Message {
  id: string
  sender: User
  content: string
  file?: string
  file_type?: string
  is_edited: boolean
  is_deleted: boolean
  reactions: Record<string, number>
  reply_to?: string
  created_at: string
  read_by_count: number
  is_read: boolean
}

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  participants_count: number
  last_message?: Message
  last_message_at?: string
  unread_count: number
  is_archived: boolean
  created_at: string
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true)
      }
      fetchConversations()
    }, 3000)

    return () => clearInterval(interval)
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messaging/conversations/')
      setConversations(response.data.results || response.data)
      if (loading) setLoading(false)
    } catch (error: any) {
      if (loading) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load conversations',
        })
        setLoading(false)
      }
    }
  }

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      const response = await api.get(`/messaging/conversations/${conversationId}/messages/`)
      setMessages(response.data.results || response.data)

      // Mark messages as read
      if (!silent) {
        await api.post(`/messaging/conversations/${conversationId}/mark_read/`)
      }
    } catch (error: any) {
      if (!silent) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load messages',
        })
      }
    }
  }

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await fetchMessages(conversation.id)
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    setSending(true)
    try {
      const response = await api.post(`/messaging/conversations/${selectedConversation.id}/send_message/`, {
        content: messageText,
      })

      setMessages([...messages, response.data])
      setMessageText('')
      scrollToBottom()

      // Refresh conversations to update last message
      fetchConversations()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getInitials = (user: User) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.last_message?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-120px)]">
      <div className="flex gap-4 h-full">
        {/* Conversations Sidebar */}
        <Card className="w-full md:w-96 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              <Button size="icon" variant="outline" onClick={() => setShowNewChatDialog(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowNewChatDialog(true)}
                  >
                    Start a Conversation
                  </Button>
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-accent' : ''
                      }`}
                    >
                      <Avatar>
                        <AvatarFallback>{conv.name?.[0]?.toUpperCase() || 'C'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm truncate">
                            {conv.name || `Conversation ${conv.id.slice(0, 8)}`}
                          </h4>
                          {conv.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conv.last_message_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message?.content || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <Badge variant="default" className="ml-2">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Messages Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversation.name?.[0]?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConversation.name || `Conversation ${selectedConversation.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        <span>{selectedConversation.participants_count} participants</span>
                      </div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isCurrentUser = message.sender.id === 'current-user-id' // Replace with actual current user ID
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          } rounded-lg p-3`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">
                                {message.sender.first_name} {message.sender.last_name}
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            <span className="text-xs opacity-70">
                              {formatTime(message.created_at)}
                            </span>
                            {isCurrentUser && (
                              message.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex items-end gap-2">
                  <Button size="icon" variant="ghost" className="shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="resize-none"
                    />
                  </div>
                  <Button size="icon" variant="ghost" className="shrink-0">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Search for users to start a new conversation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Search users by name or email..." />
            <div className="text-center text-sm text-muted-foreground py-4">
              User search functionality to be implemented
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowNewChatDialog(false)}>
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
