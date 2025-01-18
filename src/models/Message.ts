import { Schema, model, models } from 'mongoose';

// Mesaj okuma durumu enum'ı
export enum ReadStatus {
  UNREAD = 'UNREAD',           // Kimse okumadı
  SENDER_READ = 'SENDER_READ', // Sadece gönderen okudu
  RECEIVER_READ = 'RECEIVER_READ', // Sadece alıcı okudu
  ALL_READ = 'ALL_READ'        // Herkes okudu
}

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readStatus: {
    type: String,
    enum: Object.values(ReadStatus),
    default: ReadStatus.UNREAD
  },
  deletedFor: [{
    type: Schema.Types.ObjectId,
    ref: 'users'
  }],
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Message = models.messages || model('messages', messageSchema);

export default Message; 