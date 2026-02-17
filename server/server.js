const exp=require('express');
const app =exp();
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();


const userApp=require('./APIs/userAPI')
const adminApp=require('./APIs/adminAPI')
const resourceApp=require('./APIs/resourceAPI')
const discussionApp=require('./APIs/discussionAPI')


const cors=require('cors')
app.use(cors())

const port=process.env.PORT || 4000;

app.use(exp.json())

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