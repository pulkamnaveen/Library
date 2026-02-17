const exp = require('express');
const adminApp = exp.Router();
const Resource = require('../Models/ResourceModel');
const expressAsyncHandler = require('express-async-handler');
const ResourceRequest = require('../Models/ResourceRequestModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

adminApp.post(
  '/add',
  upload.single('pdf'),
  expressAsyncHandler(async (req, res) => {
    console.log('[Admin Add] Request received');
    console.log('[Admin Add] Body:', req.body);
    console.log('[Admin Add] File:', req.file);
    
    const {
      title,
      abstract,
      content,
      keywords,
      authorName,
      category,
      resourceType,
      publisher,
      access,
      fileUrl,
      requestId
    } = req.body;

    console.log('[Admin Add] Title:', title);
    console.log('[Admin Add] Access:', access);

    if (!title) {
      console.error('[Admin Add] Missing title');
      return res.status(400).send({ message: 'Title is required' });
    }

    let parsedAccess = [];
    try {
      parsedAccess = typeof access === 'string' ? JSON.parse(access) : access;
      console.log('[Admin Add] Parsed access:', parsedAccess);
    } catch (e) {
      console.error('[Admin Add] Access parse error:', e);
      return res.status(400).send({ message: 'Invalid access format' });
    }

    if (!Array.isArray(parsedAccess) || parsedAccess.length === 0) {
      console.error('[Admin Add] Invalid access array:', parsedAccess);
      return res.status(400).send({ message: 'Access must be a non-empty array' });
    }

    const allowedAccess = ['Public'];
    const isValidAccess = parsedAccess.every((role) => allowedAccess.includes(role));

    if (!isValidAccess) {
      console.error('[Admin Add] Invalid access values:', parsedAccess);
      return res.status(400).send({ message: 'Invalid access values provided' });
    }

    let parsedKeywords = [];
    try {
      parsedKeywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
    } catch (e) {
      parsedKeywords = [];
    }

    const newResource = {
      title,
      abstract,
      content,
      keywords: parsedKeywords,
      authorName,
      category,
      resourceType,
      publisher,
      access: ['Public'],
      fileUrl: fileUrl || ''
    };

    if (req.file) {
      newResource.filePath = req.file.path;
      newResource.fileUrl = `/uploads/${req.file.filename}`;
    }

    console.log('[Admin Add] Creating resource:', newResource);
    const dbRes = await Resource.create(newResource);
    console.log('[Admin Add] Resource created with ID:', dbRes._id);

    if (requestId) {
      try {
        await ResourceRequest.findByIdAndUpdate(requestId, {
          fulfilledByResourceId: dbRes._id,
          fulfilledAt: new Date(),
          status: 'Approved'
        });
      } catch (e) {
        console.error('Failed to update request:', e);
      }
    }

    console.log('[Admin Add] Sending success response');
    res.status(201).send({
      message: 'Resource added successfully',
      payload: dbRes,
    });
  })
);

adminApp.put(
    '/resource/:id',
    upload.single('pdf'),
    expressAsyncHandler(async (req, res) => {
        const resourceId = req.params.id;
        const {
          title,
          abstract,
          content,
          keywords,
          authorName,
          category,
          resourceType,
          publisher,
          access,
          fileUrl
        } = req.body;

        const updatedData = {
          title,
          abstract,
          content,
          authorName,
          category,
          resourceType,
          publisher,
        };

        // Parse keywords if it's a string
        if (keywords) {
          try {
            updatedData.keywords = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;
          } catch (e) {
            updatedData.keywords = [];
          }
        }

        updatedData.access = ['Public'];

        // Handle file upload
        if (req.file) {
          updatedData.filePath = req.file.path;
          updatedData.fileUrl = `/uploads/${req.file.filename}`;
        } else if (fileUrl) {
          updatedData.fileUrl = fileUrl;
        }

        const updatedResource = await Resource.findByIdAndUpdate(
            resourceId,
            updatedData,
            { new: true }
        );

        if (!updatedResource) {
            res.status(404).send({ message: 'Resource not found' });
            return;
        }

        res.status(200).send({
            message: 'Resource updated successfully',
            payload: updatedResource,
        });
    })
);

adminApp.put(
  '/delete/:id',
  expressAsyncHandler(async (req, res) => {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
          return res.status(400).send({ message: 'isActive status must be provided' });
      }

      const updatedRes = await Resource.findByIdAndUpdate(
          id,
          { isActive, dateModified: new Date() },
          { new: true }
      );

      if (!updatedRes) {
          return res.status(404).send({ message: 'Resource not found' });
      }

      res.status(200).send({
          message: `Resource ${isActive ? 'restored' : 'soft-deleted'} successfully`,
          payload: updatedRes
      });
  })
);

adminApp.get(
    '/resource-requests',
    expressAsyncHandler(async (req, res) => {
      const allRequests = await ResourceRequest.find().sort({ createdTime: -1 });
      res.status(200).send({
        message: 'All resource requests fetched successfully',
        payload: allRequests
      });
    })
  );

adminApp.put(
    '/resource-requests/:id',
    expressAsyncHandler(async (req, res) => {
      const { status } = req.body;
      const validStatuses = ['Pending', 'Approved', 'Rejected'];
  
      if (!validStatuses.includes(status)) {
        return res.status(400).send({ message: 'Invalid status value' });
      }
  
      const updatedRequest = await ResourceRequest.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      if (!updatedRequest) {
        return res.status(404).send({ message: 'Resource request not found' });
      }
  
      res.status(200).send({
        message: 'Status updated successfully',
        payload: updatedRequest,
      });
    })
  );

module.exports = adminApp;