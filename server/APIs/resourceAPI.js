const exp = require('express');
const resourceApp = exp.Router();
const Resource = require('../Models/ResourceModel');
const expressAsyncHandler = require('express-async-handler');
const authenticate = require('../middleware/authenticate');

// GET: All resources
resourceApp.get(
  '/all',
  expressAsyncHandler(async (req, res) => {
    const resources = await Resource.find();
    res.status(200).send({
      message: 'All resources fetched successfully',
      payload: resources
    });
  })
);

// GET: Resource stats for admin dashboard
resourceApp.get(
  '/stats',
  expressAsyncHandler(async (req, res) => {
    const totalResources = await Resource.countDocuments();
    const activeResources = await Resource.countDocuments({ isActive: true });
    const categories = await Resource.distinct('category');
    const recentResources = await Resource.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category resourceType createdAt authorName');
    const popularResources = await Resource.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title category resourceType');

    res.status(200).send({
      message: 'Stats fetched successfully',
      payload: {
        totalResources,
        activeResources,
        categoryCount: categories.length,
        recentResources,
        popularResources
      }
    });
  })
);

// GET: Search resources
resourceApp.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { q, category, resourceType, publisher, author } = req.query;

    const filter = { isActive: true };

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { title: regex },
        { abstract: regex },
        { content: regex },
        { keywords: regex },
        { authorName: regex }
      ];
    }
    if (category) filter.category = category;
    if (resourceType) filter.resourceType = resourceType;
    if (publisher) filter.publisher = publisher;
    if (author) filter.authorName = new RegExp(author, 'i');

    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.status(200).send({
      message: 'Search results',
      payload: resources
    });
  })
);

// GET: Public resources (for all users)
resourceApp.get(
  '/public',
  expressAsyncHandler(async (req, res) => {
    const resources = await Resource.find({ 
      access: { $in: ['Public'] }, 
      isActive: true 
    });
    res.status(200).send({
      message: 'Public resources fetched successfully',
      payload: resources
    });
  })
);

// GET /student - Same as public (for backward compatibility)
resourceApp.get(
  '/student',
  expressAsyncHandler(async (req, res) => {
    const resources = await Resource.find({ 
      access: { $in: ['Public'] }, 
      isActive: true 
    });
    res.status(200).send({
      message: 'Resources fetched successfully',
      payload: resources
    });
  })
);

// GET /faculty - Same as public (for backward compatibility)
resourceApp.get(
  '/faculty',
  expressAsyncHandler(async (req, res) => {
    const resources = await Resource.find({ 
      access: { $in: ['Public'] }, 
      isActive: true 
    });
    res.status(200).send({
      message: 'Resources fetched successfully',
      payload: resources
    });
  })
);


// Get resource by ID
resourceApp.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).send({ message: 'Resource not found' });
    }

    res.status(200).send({ message: 'Resource found', payload: resource });
  })
);


module.exports = resourceApp;
