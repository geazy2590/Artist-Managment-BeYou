//Initializing npm packages
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    cookieParser = require('cookie-parser'),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    nodemailer = require('nodemailer'),
    passportLocalMongoose = require("passport-local-mongoose"),
    UserDetail = require("./models/userdetail"),
    RecUserDetail = require("./models/recuserdetails"),
    upload = require('./helpers/multer'),
    session = require('express-session'),
    flash = require('connect-flash')

mongoose.connect("mongodb://localhost:27017/artist");
var db = mongoose.connection;

//Check connection to mongo
db.once('open', function () {
    console.log('Connected to mongodb');
});

//Initialization of express, cookie-parser and body-parser
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + '/'));

//Express session middleware
app.use(require("express-session")({
    key: 'user_sid',
    secret: "This is the login part",
    resave: true,
    rolling: true,
    saveUninitialized: false,
    cookie: { maxAge: new Date(Date.now() + (60 * 1000 * 10)) }
}));

//Passport initialization
app.use(passport.initialize());
app.use(passport.session());

//Storing current user details
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.messages = require('express-messages')(req, res);
    next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Server port
app.listen(7000, function () {
    console.log("Server Started");
});

//Landing page
app.get("/", function (req, res) {
    res.render('landing');
});


//Registeration routes
let register = require('./routes/registration');
app.use('/register', register)

//Homepage routes
let homepage = require('./routes/homepage');
app.use('/homepage', homepage)

//Profile routes
let profile = require('./routes/profile');
app.use('/profile', profile)

//contact form
let contact = require('./routes/contact');
app.use('/contact', contact)

//Passport login authentication
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/homepage',
        failureRedirect: '/',
        failureFlash: true,
        successFlash: 'You have successfully logged in!',
    }));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

//Logout
app.get("/logout", function (req, res) {
    req.logout();
    req.flash('success', 'You have logged out successfully!')
    res.redirect("/");
});