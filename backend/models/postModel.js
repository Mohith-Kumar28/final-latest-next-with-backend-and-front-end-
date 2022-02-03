const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    groupName: {
        type:String,
        required:[true,"Please enter Group Name"],
      
    },
    user: {
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
    },
    post:[
        {
            name:{
                type:String,
                required:[true,"Please enter post Name"],
                trim:true
            },
            description:{
                type:String,
                required:[true,"Please enter post Description"]
            },
            ratings:{
                type:Number,
                default:0
            },
            images:[{
                public_id:{
                    type:String,
                    required:true,
                },
                url:{
                    type:String,
                    required:true
                }
            }],
            category:{
                type:String,
                required:[true,"Please enter post Category"]
            },
            numberOfReviews:{
                type:Number,
                default:0
            },
            reviews:[
                {
                    user: {
                        type:mongoose.Schema.ObjectId,
                        ref:"User",
                        required:true
                    },
                    name:{
                        type:String,
                        required:true,
                    },
                    rating:{
                        type:Number,
                        required:true,
                    },
                    comment:{
                        type:String,
                        required:true
                    }
                }
            ],
            user: {
               type:mongoose.Schema.ObjectId,
               ref:"User",
               required:true
           },
            createdAt:{
                type:Date,
                default:Date.now
            }

        }
    ]

})

module.exports = mongoose.model("PostGroupSchema",postSchema);