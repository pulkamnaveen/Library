const exp=require('express');
const userApp=exp.Router();
const User = require('../Models/UserModel');
const expressAsyncHandler = require('express-async-handler');
const ResourceRequest = require('../Models/ResourceRequestModel');
const authenticate = require('../middleware/authenticate');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@digitallibrary.local';

  if (!transporter) {
    console.log('[Password Reset] SMTP not configured. Reset link:', resetUrl);
    return;
  }

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: 'Digital Library Password Reset',
    html: `
      <p>You requested a password reset for your Digital Library account.</p>
      <p>Click the link below to reset your password (valid for 15 minutes):</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};

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

      let validRole = ['user', 'admin'].includes(role) ? role : 'user';

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

userApp.post(
  '/forgot-password',
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).send({
        message: 'If this email is registered, a password reset link has been sent.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientBase = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5178';
    const resetUrl = `${clientBase}/reset-password/${resetToken}`;
    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

    if (!smtpConfigured && process.env.NODE_ENV !== 'production') {
      return res.status(200).send({
        message: 'Email service is not configured. Use the reset link below (development mode).',
        resetUrl
      });
    }

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      return res.status(200).send({
        message: 'If this email is registered, a password reset link has been sent.'
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).send({ message: 'Unable to send reset email. Please try again.' });
    }
  })
);

userApp.post(
  '/reset-password/:token',
  expressAsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).send({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send({ message: 'Reset link is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    );

    res.status(200).send({ message: 'Password reset successful. Please log in with your new password.' });
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
