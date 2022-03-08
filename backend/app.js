const express = require("express");
const app = express();
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload")
const cors=require("cors")

// this is to solve same port problem
app.use(
    cors({
        origin:"http://localhost:3000",
        // methods:['GET','POST','DELETE','PUT'],
        credentials:true,
    })
)


const errorMiddleware = require("./middleware/error");

app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

// Routes imports
const post = require("./routes/postRoute");
const user= require("./routes/userRoute");


app.use("/api/v1",post);
app.use("/api/v1",user);

// Middleware for error
app.use(errorMiddleware);
module.exports=app