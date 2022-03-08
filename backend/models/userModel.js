const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto=require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[2,"Name should have atleast 2 characters"]
    },
    email:{
        type:String,
        required:[true,"Please enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minLength:[4,"Password should be atleast 4 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    role:{
        admin:{
            type:[String],
            default:[]}, //here string is the group id
        user:{
            type:[String],
            default:[]} //here string is the group id
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})

// JWT Token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE,})
};

// compare password
userSchema.methods.comparePassword=async function(enteredPassword){
    // console.log( await bcrypt.compare(enteredPassword,this.password))
    return await bcrypt.compare(enteredPassword,this.password)

}

// generating password reset token
userSchema.methods.getResetPasswordToken=function (){
    // generating token
    const resetToken=crypto.randomBytes(20).toString("hex");

    // hashing and adding resetPasswordtokens to userschema
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
}; 

module.exports= mongoose.model("User",userSchema)