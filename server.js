const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


//Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');


// Use the router
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT,()=>{
    console.log("app is running on 3000 port");
});