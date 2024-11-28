const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const userSignUpController = async (req, res) => {
    try {
      const { email, password, fullname } = req.body;
  
      if (!email) throw new Error("Please provide an email");
      if (!password) throw new Error("Please provide a password");
      if (!fullname) throw new Error("Please provide a name");
  
      const user = await userModel.findOne({ email });
      if (user) throw new Error("User is already registered");
  
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);
      if (!hashPassword) throw new Error("Password hashing failed");
  
      const payload = {
        ...req.body,
        role: "GENERAL",
        password: hashPassword,
      };
  
      const newUser = new userModel(payload);
      const savedUser = await newUser.save();
  
      return res.status(201).json({
        success: true,
        message: "User is Successfully Registered",
        user: savedUser,
      });
    } catch (err) {
      return res.status(400).json({
        error: true,
        success: false,
        message: err.message,
      });
    }
  };
  

module.exports = userSignUpController;
