const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const { validationResult } = require('express-validator');
const { validateSignup, validateLogin }  = require('./../validation/validateUser');

//signup api
router.post("/signup",validateSignup,async(req,res)=>{

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({ errors: errorMessages });
  }

    try{
    const data = req.body;

    if (data.role === "admin") {
        // Check if an admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        
        if (existingAdmin) {
          return res.status(400).json({ error: "Admin already exists. Only one admin allowed." });
        }
    }
    const newUser = new User(data);
    //save the person to the database
    const response = await newUser.save();
    console.log('data saved');
    //generate token
    const payload ={
        id:response.id,
    }
    const token = generateToken(payload);

    res.status(200).json({response:response,token:token});
    }catch(err){
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists.` });
    }
    console.log(err);
    res.status(500).json({error:"Internel server error"});
    }
});

//login api authenticate
router.post("/login",validateLogin,async(req,resp)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return resp.status(400).json({ errors: errorMessages });
  }

    try{
      const{aadharCardNumber,password} = req.body;
      //find the user by email
      const user = await User.findOne({aadharCardNumber:aadharCardNumber});
      //check user exists or not
      if(!user || !(await user.comparePassword(password))){
          resp.json({error:"Invalid username and password"})
      }
      //generate token
      const payload ={
          id:user.id,
      }
      const token = generateToken(payload);
      resp.status(200).json({token});
    }catch(err){
      console.log(err);
      resp.json({error:"Internel server error"});
    }
     
  });

//profile api
router.get("/profile",jwtAuthMiddleware,async(req,res)=>{
    try{
     const userData = req.user;
     const userId = userData.id;
     const user = await User.findById(userId);
     res.json({user});
    }catch(err){
     console.log(err);
     res.json({error:"Internel server error"});
    }
  
});

//user change password
router.put('/profile/password',jwtAuthMiddleware, async(req,res)=>{
    try{
     const userId = req.user.id; //extract the id from the token
     const {currentPassword,newPassword} = req.body;

     const user = await User.findById(userId);
     
     //check user exists or not
     if(!(await user.comparePassword(currentPassword))){
         res.json({error:"Invalid password"})
     }
     //update user password
     user.password = newPassword;
     user.save();

     console.log('password updated');
     res.status(200).json({message:"Password updated"});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internel server error"});
    }
})

//export the router
module.exports = router;