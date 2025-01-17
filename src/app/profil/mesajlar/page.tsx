'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/loading";
import { Search, Send, ArrowLeft, MoreVertical, Edit2, Trash2, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarColor } from "@/lib/utils";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
  };
  receiver: {
    _id: string;
    name: string;
    image?: string;
  };
  readStatus: 'UNREAD' | 'SENDER_READ' | 'RECEIVER_READ' | 'ALL_READ';
  isEdited: boolean;
  createdAt: string;
  deletedFor: string[];
}

interface Conversation {
  userId: string;
  name: string;
  image?: string;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

// Tarih formatlama fonksiyonları
function formatMessageDate(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return 'Bugün';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Dün';
  } else {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const date = new Date(message.createdAt);
    const key = formatMessageDate(date);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(message);
  });
  
  return groups;
}

function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteForAll, setDeleteForAll] = useState(false);
  const userId = searchParams?.get('userId') || null;

  // URL'den gelen userId'yi selectedUserId'ye ata
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  // Scroll ref'i ekle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom fonksiyonu
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  // Mesajlar değiştiğinde veya yeni bir sohbet seçildiğinde scroll'u en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated') {
      fetchMessages();
    }
  }, [status]);

  const fetchMessages = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/messages', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Mesajlar yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      
      setMessages(data);

      const conversationsMap = new Map<string, Conversation>();
      
      data.forEach((message: Message) => {
        const otherUser = message.sender._id === session?.user?.id ? message.receiver : message.sender;
        const existingConversation = conversationsMap.get(otherUser._id);
        
        if (!existingConversation) {
          conversationsMap.set(otherUser._id, {
            userId: otherUser._id,
            name: otherUser.name,
            image: otherUser.image,
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt
            },
            unreadCount: message.sender._id !== session?.user?.id && 
              message.readStatus === 'UNREAD' ? 1 : 0
          });
        } else {
          const messageDate = new Date(message.createdAt);
          const lastMessageDate = new Date(existingConversation.lastMessage?.createdAt || '');
          
          if (messageDate > lastMessageDate) {
            existingConversation.lastMessage = {
              content: message.content,
              createdAt: message.createdAt
            };
          }
          
          if (message.sender._id !== session?.user?.id && message.readStatus === 'UNREAD') {
            existingConversation.unreadCount++;
          }
        }
      });

      setConversations(Array.from(conversationsMap.values()));
      setLoading(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      });
      setLoading(false);
    }
  };

  // Mesaj gönderme fonksiyonunu güncelle
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId || sendingMessage) return;

    if (newMessage.length > 500) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Mesaj uzunluğu 500 karakteri geçemez."
      });
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: selectedUserId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Mesaj gönderilemedi');
      }

      const savedMessage = await response.json();
      
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      scrollToBottom();

      setConversations(prev => {
        const updated = [...prev];
        const index = updated.findIndex(c => c.userId === selectedUserId);
        
        if (index > -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: {
              content: savedMessage.content,
              createdAt: savedMessage.createdAt
            }
          };
        }
        return updated;
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Konuşma güncelleme fonksiyonunu optimize et
  const updateConversation = useCallback((message: Message) => {
    setConversations(prev => {
      const updated = [...prev];
      const conversationIndex = updated.findIndex(c => c.userId === (
        message.sender._id === session?.user?.id ? message.receiver._id : message.sender._id
      ));

      if (conversationIndex > -1) {
        updated[conversationIndex] = {
          ...updated[conversationIndex],
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt
          },
          unreadCount: message.sender._id !== session?.user?.id ? 
            updated[conversationIndex].unreadCount + 1 : 
            updated[conversationIndex].unreadCount
        };
      }
      return updated;
    });
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchAndUpdateMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) throw new Error('Mesajlar yüklenirken bir hata oluştu');
        
        const data = await response.json();
        
        // Seçili konuşmanın mesajlarını güncelle
        if (selectedUserId) {
          const conversationMessages = data.filter((message: Message) => 
            (message.sender._id === selectedUserId && message.receiver._id === session.user.id) ||
            (message.sender._id === session.user.id && message.receiver._id === selectedUserId)
          );
          
          const hasNewMessage = conversationMessages.length > messages.length;
          const lastMessage = hasNewMessage ? conversationMessages[conversationMessages.length - 1] : null;
          const shouldScroll = hasNewMessage && lastMessage?.sender._id !== session.user.id;
          
            setMessages(conversationMessages);
          if (shouldScroll) {
              scrollToBottom();
          }
        }

        // Konuşma listesini güncelle
        const conversationsMap = new Map<string, Conversation>();
        
        data.forEach((message: Message) => {
          const otherUser = message.sender._id === session.user.id ? message.receiver : message.sender;
          const existingConversation = conversationsMap.get(otherUser._id);
          
          if (!existingConversation) {
            conversationsMap.set(otherUser._id, {
              userId: otherUser._id,
              name: otherUser.name,
              image: otherUser.image,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt
              },
              unreadCount: message.sender._id !== session.user.id && 
                message.readStatus === 'UNREAD' ? 1 : 0
            });
          } else {
            const messageDate = new Date(message.createdAt);
            const lastMessageDate = new Date(existingConversation.lastMessage?.createdAt || '');
            
            if (messageDate > lastMessageDate) {
              existingConversation.lastMessage = {
                content: message.content,
                createdAt: message.createdAt
              };
            }
            
            if (message.sender._id !== session.user.id && message.readStatus === 'UNREAD') {
              existingConversation.unreadCount++;
            }
          }
        });
        
        setConversations(Array.from(conversationsMap.values()));
      } catch (error) {
        console.error('Mesajlar yüklenirken bir hata oluştu:', error);
      }
    };

    // İlk yükleme
    fetchAndUpdateMessages();

    // Her 5 saniyede bir güncelle
    const interval = setInterval(fetchAndUpdateMessages, 5000);

    return () => clearInterval(interval);
  }, [session?.user?.id, selectedUserId, messages.length]);

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId);
    
    // Seçilen kullanıcının okunmamış mesajlarını filtrele
    const unreadMessages = messages.filter(
      m => m.sender._id === userId && m.readStatus === 'UNREAD'
    );

    if (unreadMessages.length > 0) {
      try {
        // Okunmamış mesajları okundu olarak işaretle
        const response = await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageIds: unreadMessages.map((m: Message) => m._id)
          })
        });

        if (response.ok) {
          // Mesajları güncelle
          setMessages(prevMessages =>
            prevMessages.map(m => {
              if (m.sender._id === userId && m.readStatus === 'UNREAD') {
                return { ...m, readStatus: 'ALL_READ' };
              }
              return m;
            })
          );

          // Konuşma listesini güncelle
          setConversations(prevConversations =>
            prevConversations.map(conv => {
              if (conv.userId === userId) {
                return { ...conv, unreadCount: 0 };
              }
              return conv;
            })
          );
        }
      } catch (error) {
        console.error('Mesajlar okundu olarak işaretlenirken hata:', error);
      }
    }
  };

  const handleEdit = async () => {
    if (!selectedMessage || !editContent.trim()) return;

    try {
      const response = await fetch(`/api/messages/${selectedMessage._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        fetchMessages();
        setSelectedMessage(null);
        setEditContent('');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;

    // 5 dakika kontrolü
    const messageDate = new Date(selectedMessage.createdAt);
    const now = new Date();
    const diffInMinutes = (now.getTime() - messageDate.getTime()) / (1000 * 60);
    
    if (deleteForAll && diffInMinutes > 5) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "5 dakikadan eski mesajlar herkes için silinemez."
      });
      return;
    }

    try {
      const response = await fetch(`/api/messages/${selectedMessage._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteForAll }),
      });

      if (response.ok) {
        fetchMessages();
        setShowDeleteDialog(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : 'Bir hata oluştu'
      });
    }
  };

  // Mesajları seçili kullanıcıya göre filtrele
  const filteredMessages = useMemo(() => {
    if (!selectedUserId || !session?.user?.id) return [];
    return messages.filter(message => 
      (message.sender._id === selectedUserId && message.receiver._id === session.user.id) ||
      (message.sender._id === session.user.id && message.receiver._id === selectedUserId)
    );
  }, [messages, selectedUserId, session?.user?.id]);

  // Konuşmaları ara
  const filteredConversations = useMemo(() => {
    return conversations
      .sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || 0);
        const dateB = new Date(b.lastMessage?.createdAt || 0);
        return dateB.getTime() - dateA.getTime(); // En son mesaj en üstte
      })
      .filter(conversation => {
        if (!conversation.name) return false;
        const searchTermLower = searchTerm.toLowerCase();
        return conversation.name.toLowerCase().includes(searchTermLower);
      });
  }, [conversations, searchTerm]);

  if (loading) {
    return <LoadingSpinner centered size="lg" />;
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-120px)] max-h-[900px]">
        {/* Konuşma Listesi */}
        <Card className={`md:col-span-1 border dark:border-gray-800 ${selectedUserId ? 'hidden md:block' : 'block'} h-full bg-card dark:bg-[rgb(22,22,22)]`}>
          <CardHeader className="pb-4">
            <CardTitle>Mesajlar</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                className="pl-8 focus-visible:ring-0 focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-120px)] overflow-y-auto">
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {searchTerm ? 'Kullanıcı bulunamadı.' : 'Henüz mesajınız bulunmuyor.'}
                </p>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.userId}
                    className={`p-3 rounded-lg cursor-pointer border dark:border-gray-800 hover:bg-accent/50 ${
                      selectedUserId === conversation.userId ? 'bg-accent/50 dark:bg-accent/50' : ''
                    }`}
                    onClick={() => handleUserSelect(conversation.userId)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800 shadow-inner">
                          <AvatarImage src={conversation.image} />
                          <AvatarFallback 
                            className={`text-base bg-gradient-to-br ${getAvatarColor(conversation.userId).bg} ${getAvatarColor(conversation.userId).text} shadow-inner`}
                          >
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs p-0"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conversation.name}</p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mesajlar */}
        <Card className={`md:col-span-2 border dark:border-gray-800 ${selectedUserId ? 'block' : 'hidden md:block'} h-full flex flex-col bg-card dark:bg-[rgb(22,22,22)]`}>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>
              {selectedUserId ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {conversations.find(c => c.userId === selectedUserId)?.name}
                </div>
              ) : (
                <span className="hidden md:block">Mesajlar</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col h-[calc(100%-80px)]">
            <div className="flex-1 flex flex-col">
              {!selectedUserId && !userId ? (
                <p className="text-muted-foreground text-center py-4">
                  Mesajlaşmak istediğiniz kişiyi seçin.
                </p>
              ) : (
                <>
                  <div className="space-y-4 flex-1 h-[calc(100vh-300px)] md:h-[calc(100%-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent pr-4 bg-card dark:bg-[rgb(22,22,22)]">
                    {Object.entries(groupMessagesByDate(filteredMessages)).map(([date, dateMessages]) => (
                      <div key={date} className="space-y-4">
                        <div className="flex items-center gap-4 my-4">
                          <div className="h-[1px] flex-1 bg-border"></div>
                          <span className="text-xs font-medium text-muted-foreground px-2">{date}</span>
                          <div className="h-[1px] flex-1 bg-border"></div>
                        </div>
                        {dateMessages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex items-start gap-2 ${
                              message.sender._id === session?.user?.id
                                ? 'justify-end'
                                : 'justify-start'
                            } px-2 md:px-4`}
                          >
                            {message.sender._id !== session?.user?.id && (
                              <Avatar className="hidden md:flex w-8 h-8 md:w-10 md:h-10 ring-2 ring-white dark:ring-gray-800 shadow-inner">
                                <AvatarImage src={message.sender.image} />
                                <AvatarFallback 
                                  className={`text-sm md:text-base bg-gradient-to-br ${getAvatarColor(message.sender._id).bg} ${getAvatarColor(message.sender._id).text} shadow-inner`}
                                >
                                  {message.sender.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`group relative max-w-[85%] md:max-w-[65%] ${
                                message.sender._id === session?.user?.id
                                  ? 'bg-primary text-primary-foreground rounded-bl-2xl rounded-br-2xl rounded-tl-2xl rounded-tr-sm after:absolute after:right-[-10px] after:top-0 after:border-t-[12px] after:border-r-[12px] after:border-b-0 after:border-l-0 after:border-t-primary after:border-r-transparent'
                                  : 'bg-muted dark:bg-[rgb(28,28,28)] rounded-bl-2xl rounded-br-2xl rounded-tr-2xl rounded-tl-sm after:absolute after:left-[-10px] after:top-0 after:border-t-[12px] after:border-l-[12px] after:border-b-0 after:border-r-0 after:border-t-muted dark:after:border-t-[rgb(28,28,28)] after:border-l-transparent'
                              } px-3 py-2`}
                            >
                              {message.sender._id === session?.user?.id && (
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 [&[data-state=open]]:!opacity-100">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-auto w-auto p-0 bg-transparent hover:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                      >
                                        <MoreVertical className="h-4 w-4 text-white" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem 
                                        className="flex items-center py-2 px-3 cursor-pointer"
                                        onClick={() => {
                                          setSelectedMessage(message);
                                          setEditContent(message.content);
                                        }}
                                      >
                                        <Edit2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                        <span className="text-sm">Düzenle</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="flex items-center py-2 px-3 text-destructive cursor-pointer"
                                        onClick={() => {
                                          setSelectedMessage(message);
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                        <span className="text-sm">Sil</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <p className={`text-[10px] md:text-sm font-medium ${
                                  message.sender._id === session?.user?.id
                                    ? 'text-primary-foreground/90 dark:text-primary-foreground/80'
                                    : 'text-foreground/90 dark:text-foreground/80'
                                }`}>
                                  {message.sender._id === session?.user?.id ? 'Sen' : message.sender.name}
                                </p>
                                <p className={`text-sm md:text-base leading-relaxed ${
                                  message.sender._id === session?.user?.id
                                    ? 'text-primary-foreground dark:text-primary-foreground/90'
                                    : 'text-foreground dark:text-foreground/90'
                                }`}>
                                  {message.content}
                                </p>
                                <div className="flex items-center justify-between text-[10px] md:text-xs mt-1">
                                  <span className={
                                    message.sender._id === session?.user?.id
                                      ? 'text-primary-foreground/70 dark:text-primary-foreground/60'
                                      : 'text-foreground/70 dark:text-foreground/60'
                                  }>
                                    {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {message.isEdited && (
                                      <span className={
                                        message.sender._id === session?.user?.id
                                          ? 'text-primary-foreground/70 dark:text-primary-foreground/60'
                                          : 'text-foreground/70 dark:text-foreground/60'
                                      }>
                                        (düzenlendi)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {message.sender._id === session?.user?.id && (
                              <Avatar className="hidden md:flex w-8 h-8 md:w-10 md:h-10 ring-2 ring-white dark:ring-gray-800 shadow-inner">
                                <AvatarImage src={session.user.image || undefined} />
                                <AvatarFallback 
                                  className={`text-sm md:text-base bg-gradient-to-br ${getAvatarColor(session.user.id).bg} ${getAvatarColor(session.user.id).text} shadow-inner`}
                                >
                                  {session.user.name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* Scroll için referans div */}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2 mt-4 sticky bottom-0 bg-background dark:bg-[rgb(22,22,22)] border-t dark:border-[rgb(28,28,28)] p-2">
                    <Input
                      type="text"
                      placeholder="Mesajınızı yazın..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 focus-visible:ring-0 focus:ring-0"
                      maxLength={500}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendingMessage}
                      className="focus-visible:ring-0 focus:ring-0"
                    >
                      {sendingMessage ? (
                        <LoadingSpinner size="md" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedMessage && !showDeleteDialog} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mesajı Düzenle</DialogTitle>
            </DialogHeader>
            <Input
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mt-4"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                İptal
              </Button>
              <Button onClick={handleEdit}>
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setSelectedMessage(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mesajı Sil</DialogTitle>
              <DialogDescription>
                Bu mesajı silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="deleteForAll"
                checked={deleteForAll}
                onChange={(e) => setDeleteForAll(e.target.checked)}
              />
              <label htmlFor="deleteForAll">Herkes için sil</label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowDeleteDialog(false);
                setSelectedMessage(null);
              }}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner centered size="lg" />}>
      <MessagesContent />
    </Suspense>
  );
} 