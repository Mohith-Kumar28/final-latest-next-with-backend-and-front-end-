const express = require("express");
const{registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getSingleUser, updateUserRole, deleteUser}=require("../controllers/userController");
const { isAuthenticatedUser, authorizedRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/me").get(isAuthenticatedUser,getUserDetails);
router.route("/password/update").put(isAuthenticatedUser,updatePassword);
router.route("/me/update").put(isAuthenticatedUser,updateProfile);
router.route("/user/:id").get(isAuthenticatedUser,getSingleUser);
router.route("/:groupId/user/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateUserRole).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteUser);
module.exports=router;