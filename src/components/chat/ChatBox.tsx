import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatBoxProps {
  receiverId: string;
  receiverName: string;
  receiverImage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBox({ receiverId, receiverName, receiverImage, isOpen, onClose }: ChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Mesajlar yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        // Sadece seçili kullanıcıyla olan mesajları filtrele
        const filteredMessages = data.filter((message: Message) =>
          (message.sender._id === receiverId && message.receiver._id === session?.user?.id) ||
          (message.sender._id === session?.user?.id && message.receiver._id === receiverId)
        );
        setMessages(filteredMessages);
      } catch (error) {
        console.error('Mesaj yükleme hatası:', error);
      }
    };

    if (isOpen && session?.user) {
      fetchMessages();
      // Her 5 saniyede bir mesajları güncelle
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, session, receiverId]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mesaj gönder
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          receiverId
        })
      });

      if (!response.ok) {
        throw new Error('Mesaj gönderilemedi');
      }

      const savedMessage = await response.json();
      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 flex flex-col shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
      <div className="p-3 bg-primary text-primary-foreground flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={receiverImage} />
            <AvatarFallback>{receiverName[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{receiverName}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <span className="sr-only">Kapat</span>
          ×
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message._id}
              className={cn(
                'flex',
                message.sender._id === session?.user?.id ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-2',
                  message.sender._id === session?.user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-3 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1"
          />
          <Button type="submit" size="sm">
            Gönder
          </Button>
        </div>
      </form>
    </Card>
  );
} 