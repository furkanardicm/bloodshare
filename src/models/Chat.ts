import { Schema, model, models } from 'mongoose';

const chatSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    content: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

const Chat = models.Chat || model('Chat', chatSchema);

export default Chat; 