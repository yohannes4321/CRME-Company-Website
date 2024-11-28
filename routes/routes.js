const express = require('express');
const router = express.Router();
const userDetail = require('../controllers/userDetail');
const authToken = require("../controllers/middleware/authtoken");
const userSignUpController = require("../controllers/userSignUp");
const userSignInController = require("../controllers/userSignin");
const userLogout = require('../controllers/userLogout');
const ForgetPassword = require('../controllers/ForgetPassword');
const resetPassword = require('../controllers/resetpassword');


router.post("/signup", userSignUpController);
router.post("/signin", userSignInController);
router.get("/user_details", authToken, userDetail);
router.get("/user_logout",userLogout)
router.get('/all_user',authToken,Alluser)
router.post("/forgot_password",ForgetPassword)
//reset password
router.post("/reset_password",resetPassword)
module.exports = router;
