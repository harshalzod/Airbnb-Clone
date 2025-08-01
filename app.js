if (process.env.NODE_ENV != "production") {
require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
//const { listingSchema , reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingsRouter = require("./routes/listing.js");
//const review = require("./models/review.js"); 
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))



// Session store config
const store = MongoStore.create({


  mongoUrl: dbUrl,
  crypto: {
       secret:process.env.SECRET,
    },
   touchAfter: 24 * 3600,
});
store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE",err);
});



//sessions
  const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
     cookie: {                //bgjo
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
   
};


// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });



app.use(session(sessionOptions));
app.use(flash());


// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Flash & current user middleware — only once
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
       res.locals.currUser = req.user;
   
    next();
});



app.use("/listings" , listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.all('/{*any}',(req, res, next) => {      /* '/{*any}' */
  next(new ExpressError(404,"page not found!"));
});

app.use((err, req , res , next)=> {

  let {statusCode=500 ,message="Something went wrong"} = err;
  //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message});
});

/* sever */
app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
