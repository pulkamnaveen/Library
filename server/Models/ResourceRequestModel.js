const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      authors: { type: [String], required: true },
      resourceType: {
        type: String,
        required: true,
        enum: ['Book', 'Journal', 'Article', 'Report', 'Thesis', 'Other']
      },
      publisherOrJournal: { type: String, default: '', trim: true },
      year: { type: Number, min: 1000, max: new Date().getFullYear() },
      doi: { type: String, default: '', trim: true },
      url: { type: String, default: '', trim: true },
      description: { type: String, required: true, trim: true },
      priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
      },
      reasonForRequest: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
      },
      requestedById: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      },
      requestedByName: {
        type: String,
        required: true,
        trim: true
      },
      fulfilledByResourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        default: null
      },
      fulfilledAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: {
        createdAt: 'createdTime',
        updatedAt: 'modifiedTime',
      }
    }
  );

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema);