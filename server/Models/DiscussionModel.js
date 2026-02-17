const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true, trim: true },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['General', 'Computer Science', 'Physics', 'Mathematics', 'Biology', 'Engineering', 'Economics', 'Other'],
    default: 'General'
  },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true, trim: true },
  replies: [replySchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
