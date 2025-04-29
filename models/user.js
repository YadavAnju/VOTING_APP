const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    name:{
       type:String,
       required:true
    },
    age:{
      type:Number,
      required:true
    },
    email:{
        type:String,
        unique:true,
    },
    mobile:String,
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter','admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }
});

UserSchema.pre('save', async function(next){
    const user = this;
    if (!user.isModified('password')) return next();
    try{
       //hash password generate
       const salt = await bcrypt.genSalt(10);  //10 is rendom number for hashing
       const hashedPassword = await bcrypt.hash(user.password, salt);
       user.password = hashedPassword;
       next();
    }catch(err){
       next(err);
    }
   });
   
   UserSchema.methods.comparePassword =  async function(password){
       try{
       const isMatch = await bcrypt.compare(password,this.password);
       return isMatch;
       }catch(err){
        throw err;
       }
   }
   
module.exports = mongoose.model('users',UserSchema);
