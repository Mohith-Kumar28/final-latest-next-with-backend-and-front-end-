const { find } = require("../models/postModel");
const PostGroupSchema = require("../models/postModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
const User=require("../models/userModel");
const cloudinary = require("cloudinary");

// Create Group
exports.createGroup = catchAsyncErrors(async(req,res,next)=>{
    req.body.user=req.user.id;
    const group = await PostGroupSchema.create(req.body);

    res.status(200).json({
        success:true,
        group
    });
});
// update Group Name
exports.updateGroupName = catchAsyncErrors(async(req,res,next)=>{
    requestedName=req.body.groupName;
    const group = await PostGroupSchema.findByIdAndUpdate(req.params.groupId,{groupName:requestedName},{next:true});
    
    // console.log(req.body.groupName);
    res.status(200).json({
        success:true,
        group
    });
});
// Get group list
exports.getGroupList = catchAsyncErrors(async(req,res,next)=>{
const data=await PostGroupSchema.find();
// PostGroupSchema.find((err,data)=>{
    //  if(err){
    //      res.status(500).send(err)
    //  }
    //  else{
         let groups = []
         data.map((groupData)=>{
             const groupInfo ={
                 id:groupData._id,
                 name:groupData.groupName
             }
            //  here i added role includes 
             if(req.user.role.user.includes(groupData._id)){
             groups.push(groupInfo)
            }
         })
         res.status(200).send(groups)
    //  }
  
//  })
})

// Create New Post
exports.createPost =catchAsyncErrors(async(req,res)=>{

  
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "posts",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;

    req.body.user=req.user.id;
  const newPost=req.body
 const post=await PostGroupSchema.findByIdAndUpdate(
      {_id : req.params.groupId},
      {$push: {post : req.body}},
  )

  res.status(200).json({
    success:true,
    //  thisPost
     newPost
})
  
})
// exports.createPost =(req,res)=>{
//     req.body.user=req.user.id;
//   const newPost=req.body
//   PostGroupSchema.findByIdAndUpdate(
//       {_id : req.params.groupId},
//       {$push: {post : req.body}},
//       (err,data)=>{
//           if(err){
//               console.log('error saving message...')
            
//               req.status(500).send(err)
//           }else{
//               res.status(201).send(data)
//           }
//       }
//   )
// }

// Get all data including group names and posts
exports.getAllData = catchAsyncErrors(async(req,res)=>{
  
    const allData= await PostGroupSchema.find();
    res.status(200).json({
        success:true,
         allData
    })
    
})

// Get all posts of current group id(mentioned in query)
exports.getAllPosts = catchAsyncErrors(async(req,res,next)=>{
    // return next(new ErrorHandler("test error",505));
   const id = req.params.groupId
   const resultPerPage=4;

   const posts= await PostGroupSchema.findById({_id:id});

  let postCount=0;
  posts.post.forEach(element => {
      postCount=postCount+1
  });

//    testPost=posts.post.find(post=>post.name="second")


   const apiFeatures = new ApiFeatures(await PostGroupSchema.findById({_id:id}),req.query).search().filter();
//    const apiFeatures = new ApiFeatures(await PostGroupSchema.findById({_id:id}),req.query).filter().pagignation(resultPerPage);
//    const apiFeatures = new ApiFeatures(await PostGroupSchema.findById({_id:id}),req.query).search().filter();

  let testposts=await apiFeatures.query.post;
  let filteredPostsCount=testposts.length;
//   console.log(filteredPostsCount);
  apiFeatures.pagignation(resultPerPage);

   finalPosts=await apiFeatures.query;
   res.status(200).json({
       success:true,
        // posts:posts.post
        postCount,
        resultPerPage,
        posts:finalPosts,
        filteredPostsCount
        // testPost
   })
   
})

// Update Post --Admin
exports.updatePost = catchAsyncErrors(async(req,res,next)=>{
    const group=await PostGroupSchema.findById({_id:req.params.groupId});
    
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    let post = group.post.find((rev)=>rev.id.toString() === req.params.id.toString());
    if(!post){
        return next(new ErrorHandler("Post not found",404));
    }
    post.name=req.body.name;
    post.category=req.body.category;
    post.description=req.body.description;
    post.images=req.body.images;
  
    
  
    await group.save({validateBeforeSave:false});
    return res.status(200).json({
        success:true,
        post
    })
    
   
})

// Get Post details
exports.getPostDetails = catchAsyncErrors(async(req,res,next)=>{
    const group=await PostGroupSchema.findById({_id:req.params.groupId});
  
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    const post = group.post.find((rev)=>rev.id.toString() === req.params.id.toString());
    
    if(!post){
        return next(new ErrorHandler("Post not found",404));
    }
   
    return res.status(200).json({
        success:true,
        post
    })
    
   
})

// Delete Post
exports.deletePost = catchAsyncErrors(async(req,res,next)=>{
    let group=await PostGroupSchema.findById(req.params.groupId);
    
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    const postExist= group.post.find((rev)=>rev.id.toString() === req.params.id.toString());
    
    if(!postExist){
        return next(new ErrorHandler("Post not found",404));
    }
    const deleteUpdatedPost = group.post.filter((rev)=>rev.id.toString() !== req.params.id.toString());
    // console.log(post);
//    group.posts=post;
await PostGroupSchema.findByIdAndUpdate(req.params.groupId,{post:deleteUpdatedPost},{next:true});

//    await group.save({validateBeforeSave:false});
    // await PostGroupSchema.findById(req.params.groupId).updateMany(post,{$set:{post}});
    return res.status(200).json({
        success:true,
        message:"post deleted",
        

    })
})

// get all users(admin)
exports.getAllUser=catchAsyncErrors(async(req,res,next)=>{
    
    const user=await User.find();
    userList= user.filter((rev)=>rev.role.user.includes(req.params.groupId))
    
    res.status(200).json({
        succes:true,
        userList,
    })

})


// creating new review or update the review
exports.createPostReview=catchAsyncErrors(async(req,res,next)=>{
    const {rating,comment,postId}=req.body;

    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };
    const group=await PostGroupSchema.findById({_id:req.params.groupId});
  
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    const post = group.post.find((rev)=>rev.id.toString() === postId.toString());
    
    if(!post){
        return next(new ErrorHandler("Post not found",404));
    }
    const isReviewed=post.reviews.find(
        (rev)=>rev.user.toString()===req.user._id.toString()
    );
   
    if(isReviewed){
      post.reviews.forEach(rev=>{
          if(rev.user.toString()===req.user._id.toString()){
              rev.rating=rating,
              rev.comment=comment
          }

      })
    }
    else{
        post.reviews.push(review);
       
        post.numberOfReviews=post.reviews.length
    }
    let avg=0;

    post.reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    post.ratings=avg/post.reviews.length;
    //  console.log(post.ratings)
    await group.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        message:"rating updated"
    })
})

// get all post reviews of a post
exports.getPostReviews=catchAsyncErrors(async(req,res,next)=>{
    const group=await PostGroupSchema.findById({_id:req.params.groupId});
  
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    const post = group.post.find((rev)=>rev.id.toString() === req.query.id.toString());
    
    if(!post){
        return next(new ErrorHandler("Post not found",404));
    }
    res.status(200).json({
        succes:true,
        reviews:post.reviews,
    })
})


// delete review of a post
exports.deleteReview=catchAsyncErrors(async(req,res,next)=>{
    const group=await PostGroupSchema.findById({_id:req.params.groupId});
  
    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }
    const post = group.post.find((rev)=>rev.id.toString() === req.query.postId.toString());
    
    if(!post){
        return next(new ErrorHandler("Post not found",404));
    }
   
    const reviews = post.reviews.filter((rev)=>rev._id.toString()!==req.query.id.toString())

    
    let avg=0;
    
    reviews.forEach((rev)=>{
        avg+=rev.rating;
    })
    const ratings=avg/reviews.length;
    
    const numberOfReviews=reviews.length;
    // console.log({post,reviews,ratings,numberOfReviews})
    // await PostGroupSchema.findByIdAndUpdate(req.params.groupId,{post:deleteUpdatedPost},{next:true});
    // await PostGroupSchema.findByIdAndUpdate(req.params.groupId,{reviews:{reviews,ratings,numberOfReviews}},{new:true,runValidators:true,useFindAndModify:false})
    post.reviews=reviews;
    post.ratings=ratings;
    post.numberOfReviews=numberOfReviews;
    await group.save({validateBeforeSave:false});
    // await post.findByIdAndUpdate(req.query.postId,{reviews,ratings,numberOfReviews},{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        succes:true,
        reviews:post.reviews,
    })
})