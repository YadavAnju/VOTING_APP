const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Candidate = require('./../models/candidate');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');

//check admin role for candidate
const checkAdminRole = async (userId)=>{
    try{
       const user = await User.findById(userId);
       console.log(user.role)
       if(user.role === 'admin'){
        return true;
       }else{
        return false;
       }
    }catch(err){
        return false;
    }
}

//add candidate
router.post("/",jwtAuthMiddleware,async(req,res)=>{
    try{
    if(! await checkAdminRole(req.user.id))
    return res.status(403).json({message: 'user does not have admin role'});

    const data = req.body;
    //create candidate
    const newCandidate = new Candidate(data);
    //save the candidate to the database
    const response = await newCandidate.save();
    console.log('candidate data saved');

    res.status(200).json({response:response});
    }catch(err){
    console.log(err);
    res.status(500).json({error:"Internel server error"});
    }
});


//updtae candidate
router.put('/:candidateId', jwtAuthMiddleware,async(req,res)=>{
    try{
     if(!checkAdminRole(req.user.id))
        return res.status(403).json({message: 'user does not have admin role'});

     const candidateId = req.params.candidateId; //extract the id from url parameter
     const updatePersonData = req.body;

     const response = await Candidate.findByIdAndUpdate(candidateId,updatePersonData,{
        new:true, //return the updated document
        runValidators: true //run mongoose validation
     })

     if(!response)
        return res.status(404).json({error: 'Candidate not found'});
     
     console.log('candidate data updated');
     res.status(200).json({response});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internel server error"});
    }
})

//delete candidate
router.delete('/:candidateId',jwtAuthMiddleware, async(req,res)=>{
    try{
     if(!checkAdminRole(req.user.id))
        return res.status(403).json({message: 'user does not have admin role'});

     const candidateId = req.params.candidateId; //extract the id from url parameter

     const response = await Candidate.findByIdAndDelete(candidateId);

     if(!response)
        return res.status(404).json({error: 'Candidate not found'});
     
     console.log('candidate deleted');
     res.status(200).json({response});

    }catch(err){
        console.log(err);
        res.status(500).json({error:"Internel server error"});
    }
})

//candidate list 
router.get("/list", async(req,res)=>{
  try{
    const candidates = await Candidate.find();
    res.status(200).json({
        message: 'Candidates fetched successfully',
        data: candidates
      });

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Internel server error"});
  }

});
//starting voting
router.post("/vote/:candidateId",jwtAuthMiddleware, async(req,res)=>{
  //no admin can vote
  //user can only vote once
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try{
    const candidate = await Candidate.findById(candidateId);
    if(!candidate){
        return res.status(404).json({error: 'Candidate not found'});
    }

    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({error: 'User not found'});
    }
    //check user vote
    if(user.isVoted){
        return res.status(400).json({error: 'You have already voted'}); 
    }
    //check admin role
    if(user.role === 'admin'){
        return res.status(403).json({error: 'Admin is not allowed to vote'}); 
    }

    //update the candidate document to record the vote
    candidate.votes.push({user: userId})
    candidate.voteCount++;
    await candidate.save();

    //update the user document
    user.isVoted = true;
    await user.save();

    return res.status(200).json({error: 'Vote recorded successfully'}); 

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Internel server error"});
  }

});

//vote count
router.get("/vote/count",async(req,res)=>{
  try{
    //candidate get and sort them by votecount in des. order
    const candidate = await Candidate.find().sort({voteCount: 'desc'});

    //map the candidate to only return name and votecount
    const voteRecord = candidate.map((data)=> {
        return{
            party: data.party,
            count: data.voteCount
        }
    });

    return res.status(200).json(voteRecord);

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Internel server error"});
  }
});

//export the router
module.exports = router;