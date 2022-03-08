
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("./catchAsyncErrors");
const jwt= require("jsonwebtoken");
const User=require("../models/userModel")

exports.isAuthenticatedUser=catchAsyncErrors(async(req,res,next)=>{
    const {token}=req.cookies;
   
    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401))
    }
    const decodedData = jwt.verify(token,process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);
    next();
});

exports.authorizedRoles=(userRole)=>{
    return(req,res,next)=>{
       
        // console.log(req.user.role.admin);
        // console.log(req.user.role.admin.includes(req.params.groupId));
        if(userRole=="admin"){
        if(!req.user.role.admin.includes(req.params.groupId)){
          
          return next (new ErrorHandler("u are not admin in this group",403))
        }}
        if(userRole=="user"){
        if(!req.user.role.user.includes(req.params.groupId)){
            // console.log("helooow test");
          return next (new ErrorHandler("u are not user in this group",403))
        }}
        next()
    }
}