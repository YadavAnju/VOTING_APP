const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next) => {
    //fetch authorization from req headers
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({error: 'Token not found'});
    
     const token = authHeader.split(' ')[1];
     if(!token) return res.status(401).json({error: 'Unauthorized'});
     
     try{
      //verify the jwt token
      const user = jwt.verify(token, process.env.JWT_SECRET);
      //attach user info to req. object
      req.user = user;
      next();
     }catch(err){
        console.log(err);
        res.status(401).json({error:"Invalid Token"});
     }

}

//generate jwt token
const generateToken = (userdata) =>{
    return jwt.sign(userdata,process.env.JWT_SECRET,{expiresIn:30000})
}

module.exports = {jwtAuthMiddleware,generateToken};