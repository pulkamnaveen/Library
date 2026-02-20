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

const allowedOrigins = parseOrigins(process.env.CORS_ORIGINS);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
}))
app.use(helmet());
app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production' && !process.env.DBURL) {
    throw new Error('DBURL is required in production');
}

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be set in production');
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