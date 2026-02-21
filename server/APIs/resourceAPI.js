const exp = require('express');
const resourceApp = exp.Router();
const Resource = require('../Models/ResourceModel');
const expressAsyncHandler = require('express-async-handler');

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
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(5)
      .select('title category resourceType downloadCount');

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

// GET: Search resources (paginated)
resourceApp.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { q, category, resourceType, publisher, author, page = 1, limit = 12 } = req.query;

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

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Resource.countDocuments(filter)
    ]);

    res.status(200).send({
      message: 'Search results',
      payload: resources,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  })
);

// GET: Public resources (paginated)
resourceApp.get(
  '/public',
  expressAsyncHandler(async (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const filter = { access: { $in: ['Public'] }, isActive: true };

    const [resources, total] = await Promise.all([
      Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Resource.countDocuments(filter)
    ]);

    res.status(200).send({
      message: 'Public resources fetched successfully',
      payload: resources,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) }
    });
  })
);

// POST: Track a download
resourceApp.post(
  '/:id/download',
  expressAsyncHandler(async (req, res) => {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    res.status(200).send({ message: 'Download tracked' });
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
