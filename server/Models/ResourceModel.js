const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    abstract: String,
    content: String,
    keywords: [String],
    authorName: String,
    category: {
      type: String,
      enum: [
        'Computer Science',
        'Environmental Science',
        'Physics',
        'Economics',
        'Healthcare',
        'Biology',
        'Mathematics',
        'Engineering',
        'Electronics',
        'Mechanical',
        'Civil',
        'Chemistry',
        'Other'
      ]
    },
    resourceType: {
      type: String,
      enum: ['Research Paper', 'Book', 'Textbook', 'Thesis', 'Conference Paper', 'Article', 'Journal', 'Report', 'Other']
    },
    publisher: {
      type: String,
      enum: ['IEEE', 'Springer', 'Elsevier', 'Nature', 'Science', 'ACM', 'Wiley', 'MIT Press', 'Other']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    access: {
      type: [String],
      enum: ['Public'],
      default: ['Public'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'At least one access level must be selected.'
      }
    },
    filePath: {
      type: String,
      default: null
    },
    fileUrl: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
