const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const fetch = require('node-fetch'); // Ensure this is installed and required

async function userSignInController(req, res) {
  try {
    // Check if it's a Google sign-in request
    if (req.body.token) {
      const { token } = req.body;

      if (!token) {
        throw new Error("Token is required.");
      }

      // Verify Google token
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const googleUser = await response.json();

      if (!googleUser || googleUser.error) {
        throw new Error("Google token verification failed.");
      }

      const { email, name } = googleUser;

      let user = await userModel.findOne({ email });
      if (!user) {
        // Create a new user if not found
        user = new userModel({
          email,
          fullname: name,
          password: '', // Google users do not have a password in your system
          role: 'GENERAL'
        });
        await user.save();
      }

      // Generate JWT token for the user
      const tokenData = {
        _id: user._id,
        email: user.email,
      };

      const jwtToken = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' });
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      };

      res.cookie("token", jwtToken, cookieOptions).status(200).json({
        message: "Login successfully.",
        token: jwtToken,
        success: true,
        error: false,
      });

      return;
    }

    // Handle traditional email/password sign-in
    const { email, password } = req.body;

    if (!email) {
      throw new Error("Please provide email.");
    }
    if (!password) {
      throw new Error("Please provide password.");
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error("User not found.");
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (checkPassword) {
      const tokenData = {
        _id: user._id,
        email: user.email,
      };

      const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      };

      res.cookie("token", token, cookieOptions).status(200).json({
        message: "Login successfully.",
        token: token,
        success: true,
        error: false,
      });

    } else {
      throw new Error("Incorrect password.");
    }

  } catch (err) {
    console.error("Sign-in error:", err);
    res.status(400).json({
      message: err.message,
      error: true,
      success: false,
    });
  }
}

module.exports = userSignInController;
