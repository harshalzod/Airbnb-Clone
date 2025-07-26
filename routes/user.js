const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");



router
.route("/signup")
//signupForm
.get( userController.renderSignupForm)
//signup
.post(wrapAsync(userController.signup)
);




router
.route("/login")
// login Form
.get(userController.renderLoginForm)
// login page 
.post( 
saveRedirectUrl,
 passport.authenticate("local" ,
{ failureRedirect: "/login",
   failureFlash: true
 })
 ,userController.login);


 //logout 
router.get("/logout" ,userController.logout);

module.exports = router;