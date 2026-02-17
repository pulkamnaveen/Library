const exp=require('express');
const userApp=exp.Router();
const User = require('../Models/UserModel');
const expressAsyncHandler = require('express-async-handler');
const ResourceRequest = require('../Models/ResourceRequestModel');
const authenticate = require('../middleware/authenticate');

userApp.post(
    '/register',
    expressAsyncHandler(async (req, res) => {
      const { password, name, email, role } = req.body;
      // Auto-generate userId from email if not provided
      const userId = req.body.userId || email.split('@')[0] + '_' + Date.now().toString(36);
  
      if (!password || !name || !email) {
        res.status(400).send({ message: 'All fields are required' });
        return;
      }
  
      const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
  
      if (existingUser) {
        res.status(400).send({ message: 'User with given email already exists' });
        return;
      }

      let validRole = ['user', 'student', 'faculty', 'admin'].includes(role) ? role : 'user';

      // Admin signup requires a secret code
      if (validRole === 'admin') {
        const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ADMIN2024';
        if (req.body.adminCode !== ADMIN_SECRET) {
          return res.status(403).send({ message: 'Invalid admin authorization code' });
        }
      }

      const newUser = new User({ userId, password, name, email, role: validRole });
      const dbRes = await newUser.save();
  
      const token = dbRes.generateJWT();
  
      res.status(201).send({
        message: 'User created successfully',
        payload: {
          _id: dbRes._id,
          userId: dbRes.userId,
          name: dbRes.name,
          email: dbRes.email,
          role: dbRes.role,
          token
        }
      });
    })
  );

userApp.post(
    '/login',
    expressAsyncHandler(async (req, res) => {
      const { userId, email, password } = req.body;
  
      // Allow login by email or userId
      const query = email ? { email } : { userId };
      const user = await User.findOne(query);
      if (!user) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
  
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).send({ message: 'Invalid credentials' });
      }
  
      const token = user.generateJWT();
      const { _id, name, role } = user;
  
      res.status(200).send({
        message: 'Login successful',
        token,
        user: {
          _id,
          userId: user.userId,
          name,
          email: user.email,
          role
        }
      });
    })
  );

// Verify token and return user info (used by admin app)
userApp.get(
    '/verify',
    authenticate,
    expressAsyncHandler(async (req, res) => {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({
        message: 'Token valid',
        user: {
          _id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    })
  );
  

//   
userApp.post(
    '/resource-request',
    authenticate,
    expressAsyncHandler(async (req, res) => {
      const {
        title,
        authors,
        resourceType,
        publisherOrJournal,
        year,
        doi,
        url,
        description,
        priority,
        reasonForRequest,
        requestedById,
        requestedByName
      } = req.body;
  
      const newRequest = new ResourceRequest({
        title,
        authors,
        resourceType,
        publisherOrJournal,
        year,
        doi,
        url,
        description,
        priority,
        reasonForRequest,
        requestedById,
        requestedByName
      });
  
      await newRequest.save();
  
      res.status(201).send({
        message: 'Resource request submitted successfully',
        payload: newRequest
      });
    })
  );

  // GET: Fetch all resource requests by user
  userApp.get(
    '/resource-request/:userId',
    authenticate,
    expressAsyncHandler(async (req, res) => {
      const { userId } = req.params;
  
      const requests = await ResourceRequest.find({ requestedById: userId }).sort({ createdTime: -1 });
  
      res.status(200).send({
        message: 'Fetched all resource requests by user successfully',
        payload: requests
      });
    })
  );

module.exports=userApp;
