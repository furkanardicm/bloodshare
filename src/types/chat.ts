export interface Message {
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
  readStatus: 'UNREAD' | 'READ' | 'SENDER_READ' | 'RECEIVER_READ' | 'ALL_READ';
  isEdited: boolean;
  createdAt: string;
  deletedFor: string[];
}

export interface Chat {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
} 