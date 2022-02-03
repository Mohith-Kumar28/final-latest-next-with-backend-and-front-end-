const express = require("express");
const app = express();
const cookieParser=require("cookie-parser")

const errorMiddleware = require("./middleware/error");

app.use(express.json())
app.use(cookieParser())
// Routes imports
const post = require("./routes/postRoute");
const user= require("./routes/userRoute");

app.use("/api/v1",post);
app.use("/api/v1",user);

// Middleware for error
app.use(errorMiddleware);
module.exports=app