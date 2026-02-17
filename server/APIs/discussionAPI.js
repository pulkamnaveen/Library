const exp = require('express');
const discussionApp = exp.Router();
const Discussion = require('../Models/DiscussionModel');
const expressAsyncHandler = require('express-async-handler');
const authenticate = require('../middleware/authenticate');

// GET: All active discussions
discussionApp.get(
  '/all',
  expressAsyncHandler(async (req, res) => {
    const discussions = await Discussion.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).send({ message: 'Discussions fetched', payload: discussions });
  })
);

// POST: Create a new discussion (auth required)
discussionApp.post(
  '/create',
  authenticate,
  expressAsyncHandler(async (req, res) => {
    const { title, content, category, authorId, authorName } = req.body;

    if (!title || !content) {
      return res.status(400).send({ message: 'Title and content are required' });
    }

    const discussion = await Discussion.create({
      title,
      content,
      category: category || 'General',
      authorId,
      authorName,
    });

    res.status(201).send({ message: 'Discussion created', payload: discussion });
  })
);

// POST: Add a reply to a discussion (auth required)
discussionApp.post(
  '/:id/reply',
  authenticate,
  expressAsyncHandler(async (req, res) => {
    const { content, authorId, authorName } = req.body;

    if (!content) {
      return res.status(400).send({ message: 'Reply content is required' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ message: 'Discussion not found' });
    }

    discussion.replies.push({ content, authorId, authorName });
    await discussion.save();

    res.status(201).send({ message: 'Reply added', payload: discussion });
  })
);

// DELETE: Soft delete a discussion
discussionApp.put(
  '/delete/:id',
  authenticate,
  expressAsyncHandler(async (req, res) => {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!discussion) {
      return res.status(404).send({ message: 'Discussion not found' });
    }

    res.status(200).send({ message: 'Discussion deleted', payload: discussion });
  })
);

module.exports = discussionApp;
