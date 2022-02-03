const express=require("express");
const { getAllPosts,createGroup,getGroupList,createPost,getAllData,updatePost, getPostDetails, deletePost, updateGroupName,getAllUser, createPostReview, getPostReviews, deleteReview } = require("../controllers/postController");

const { isAuthenticatedUser,authorizedRoles } = require("../middleware/auth");

const router=express.Router();

router.route("/:groupId/admin/updateGroupName").put(isAuthenticatedUser,authorizedRoles("admin"),updateGroupName);
router.route("/get/groupList").get(isAuthenticatedUser,getGroupList);

// this is a big that anyone can access all data(will fix it later)
router.route("/get/getAllData").get(isAuthenticatedUser,getAllData);


router.route("/:groupId/posts").get(isAuthenticatedUser,authorizedRoles("user"),getAllPosts);


router.route("/:groupId/admin/post/new").post(isAuthenticatedUser,authorizedRoles("admin"),createPost);
router.route("/:groupId/admin/post/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updatePost).delete(isAuthenticatedUser,authorizedRoles("admin"),deletePost);
router.route("/:groupId/post/:id").get(isAuthenticatedUser,getPostDetails)
router.route("/group/new").post(isAuthenticatedUser,createGroup);
router.route("/:groupId/getAllUser").get(isAuthenticatedUser,authorizedRoles("user"),getAllUser)

router.route("/:groupId/review").put(isAuthenticatedUser,createPostReview)
router.route("/:groupId/reviews").get(getPostReviews).delete(isAuthenticatedUser,deleteReview)
module.exports=router