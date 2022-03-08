const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");
const cloudinary = require("cloudinary");

// register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
  
    const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{folder:"avatars",width:150,crop:"scale"})

    const{name,email,password}=req.body;
    const user = await User.create({
        name,
        email,
        password, 
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        } 
    });
    sendToken(user,201,res);

}) ;
    // Login user
    exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
        const{email,password}=req.body;

        // checking if user given credentials
        if(!email || !password){
        
            return next(new ErrorHandler("please enter email and password",400))
        }
        const user=await User.findOne({email}).select("+password");
        if(!user){
            return next(new ErrorHandler("invalid email or password",401));

        }

        const isPasswordMatched =await user.comparePassword(password);
       
        if(!isPasswordMatched){
            return next(new ErrorHandler("invalid email or password",401));

        }
     sendToken(user,200,res);
    }); 

// Logout user
exports.logout=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })
    res.status(200).json({
        succes:true,
        message:"Logged out",
    })
})

// forgot password
exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found",404));
    }

    // get ResetPassword token
    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    // const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message=`Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email,Please ignore it.`;

    try {
       
        await sendEmail({
            email:user.email,
            subject:`Your password recovery`,
            message,
        });

        res.status(200).json({
            succes:true,
            message:`Email sent to ${user.email} successfully`,
        });

    } catch (error) {
        user.getResetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500))
    }

})

// reset password
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{
    // creating hast token
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });
  
    if(!user){
        return next(new ErrorHandler("reset password is invalid ro expired",400))
    }
   
    if(req.body.password !==req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400))
    }
    user.password=req.body.password
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();

    sendToken(user,200,res)
})

// get user details
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id);

    res.status(200).json({
        succes :true,
        user
    })
})


// update your password
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect",400));

    }
    if(req.body.newPassword!==req.body.confirmPassword){
        return next(new ErrorHandler("password doesn't match",400));

    }
    user.password=req.body.newPassword;
    user.save()

    sendToken(user,200,res);


})

// update user profile

exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
 
    const newUserData={
        name:req.body.name,
        email:req.body.email,

    };
  
    // coudinary images update here
    if(req.body.avatar!==""){
        const user = await User.findById(req.user.id);

        const imageid=user.avatar.public_id;

     
        await cloudinary.v2.uploader.destroy(imageid);

        const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{folder:"avatars",width:150,crop:"scale"});
       
        newUserData.avatar={
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    }
    

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{new:true,runValidators:true,useFindAndModify:false,})

    res.status(200).json({
        success:true,
        message:"user profile updated"
    })
})

// get any user details
exports.getSingleUser= catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`user does not exist with id : ${req.params.id}`))
    }
    res.status(200).json({
        succes:true,
        user,
    })
})


// update user Role

exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
    const testuser = await User.findById(req.params.id)
    
    let updatedRoleAdmin=testuser.role.admin;
    let updatedRoleUser=testuser.role.user;

    if(req.body.role==="admin"){
        if(!testuser.role.admin.includes(req.params.groupId)){
           testuser.role.admin.push(req.params.groupId)
           updatedRoleAdmin=testuser.role.admin;
        }
        if(!testuser.role.user.includes(req.params.groupId)){
        
            testuser.role.user.push(req.params.groupId)
            updatedRoleUser=testuser.role.user;
            
          }
    }
    if(req.body.role==="user"){
        if(!testuser.role.user.includes(req.params.groupId)){
        
          testuser.role.user.push(req.params.groupId)
          updatedRoleUser=testuser.role.user;
          
        }
        if(testuser.role.admin.includes(req.params.groupId)){
            updatedRoleAdmin=  testuser.role.admin.filter((rev)=>rev!==req.params.groupId)
          
         }
    }

    const newUserData={
        name:testuser.name,
        email:testuser.email,
        role:{
            admin:updatedRoleAdmin,
            user:updatedRoleUser
        }
    };
    // const newUserData={
    //     name:req.body.name,
    //     email:req.body.email,
    //     role:{
    //         admin:req.body.role.admin,
    //         user:req.body.role.user
    //     }
    // };
    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{new:true,runValidators:true,useFindAndModify:false,})
    if(!user){
        return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        message:"user role updated"
    })
})

// Delete User
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
    const testuser = await User.findById(req.params.id)
    
    let updatedRoleAdmin=testuser.role.admin;
    let updatedRoleUser=testuser.role.user;


    if(testuser.role.admin.includes(req.params.groupId)){
        updatedRoleAdmin=  testuser.role.admin.filter((rev)=>rev!==req.params.groupId)
      
     }
    if(testuser.role.user.includes(req.params.groupId)){
        updatedRoleUser=  testuser.role.user.filter((rev)=>rev!==req.params.groupId)
      
     }

    const newUserData={
        name:testuser.name,
        email:testuser.email,
        role:{
            admin:updatedRoleAdmin,
            user:updatedRoleUser
        }
    };

    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{new:true,runValidators:true,useFindAndModify:false,})
    if(!user){
        return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`))
    }

   
    res.status(200).json({
        success:true,
        message:"user removed"
    })
})


// // Delete User
// exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
//     const user = await User.findById(req.params.id);


//     if(!user){
//         return next(new ErrorHandler(`user does not exist with id: ${req.params.id}`))
//     }

//     const imageId=user.avatar.public_id;
//     await cloudinary.v2.uploader.destroy(imageId);

//     await user.remove();
//     res.status(200).json({
//         succes:true,
//         message:"user deleted"
//     })
// })