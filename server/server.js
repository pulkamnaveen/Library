const exp=require('express');
const app =exp();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


const userApp=require('./APIs/userAPI')
const adminApp=require('./APIs/adminAPI')
const resourceApp=require('./APIs/resourceAPI')
const discussionApp=require('./APIs/discussionAPI')


const cors=require('cors')
const parseOrigins = (value) => {
    if (!value) return [];
    return value.split(',').map((origin) => origin.trim()).filter(Boolean);
};

const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5178',
    'http://localhost:5179',
    'https://library-1-ckoo.onrender.com',
    'https://library-2-n63j.onrender.com',
];
const envOrigins = parseOrigins(process.env.CORS_ORIGINS);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes('*')) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
}))
app.use(helmet());
app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production' && !process.env.DBURL) {
    console.warn('WARNING: DBURL is not set in production');
}

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    console.warn('WARNING: CORS_ORIGINS is not set — allowing all origins');
}

const port=process.env.PORT || 4000;

const apiLimiter = rateLimit({
    windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.API_RATE_LIMIT_MAX || 500),
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
});

app.use(exp.json({ limit: '1mb' }))
app.use('/api', apiLimiter);

app.use('/uploads', exp.static(path.join(__dirname, 'uploads')))

app.use('/api/user',userApp)
app.use('/api/admin',adminApp)
app.use('/api/resource',resourceApp)
app.use('/api/discussion',discussionApp)

mongoose.connect(process.env.DBURL)
.then(()=>{
    app.listen(port,()=> console.log(`Server listening on port ${port}`))
})
.catch(err=>{
    console.error("DB connection error:", err);
})

app.use((err,req,res,next)=>{
    res.send({message:err.message})
})