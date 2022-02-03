const nodeMailer =require("nodemailer");

const sendEmail = async(options)=>{
    // const transporter = nodeMailer.createTransport({
    //     host:"smtp.gmail.com",
    //     port:465,
    //     service:"gmail",
    //     auth:{
    //         user:"testmailuseless808@gmail.com",
    //         pass:"mohithkumar808",
    //     },

    // });

    // const mailOptions={
    //     form:"testmailuseless808@gmail.com",
    //     to:"murugan28aug@gmail.com",
    //     subject:"hiiiiii",
    //     text:"heloooooooooo",
    // };
    const transporter = nodeMailer.createTransport({
        host:process.env.SMPT_HOST,
        port:process.env.SMPT_PORT,
        service:process.env.SMPT_MAIL,
        auth:{
            user:process.env.SMPT_MAIL,
            pass:process.env.SMPT_PASSWORD,
        },

    });

    const mailOptions={
        form:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    };
     
    await transporter.sendMail(mailOptions)
};
module.exports=sendEmail;