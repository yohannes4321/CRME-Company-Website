const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const ForgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if the user exists in the database
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist", success: false, error: true });
        }

        // Create JWT token for password reset
        const tokenData = { _id: user._id, email: user.email };
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' }); // 1-day expiration

        // Configure nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  // Gmail address stored in .env
                pass: process.env.EMAIL_PASS,  // Gmail app-specific password stored in .env
            }
        });

        // Define the mail options
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Sender's email
            to: email,                     // Recipient's email
            subject: 'ShopEasy Reset Your Password',
            text: `Click the following link to reset your password: https://mern-eccomerce-website-1-etxt.onrender.com/reset_password/${user._id}/${token}`
        };

        // Send the email using nodemailer
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Failed to send email to:", mailOptions.to);
                console.log("Generated token:", token);
                console.error("Email send error:", error);

                return res.status(500).json({ message: "Error: Email not sent", success: false, error: true });
            } else {
                console.log("Email sent successfully:", info.response);
                return res.status(200).json({ message: "Email sent successfully", success: true, error: false });
            }
        });
        
    } catch (error) {
        console.error("An error occurred during the password reset process:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false, error: true });
    }
};

module.exports = ForgetPassword;