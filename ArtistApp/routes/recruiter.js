var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("../models/user"),
    RecUserDetail = require("../models/recuserdetails"),
    nodemailer = require('nodemailer')

//Passport Init
var app = express();
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

//Registration for recruiter
router.get("/", function (req, res) {
    res.render("registerrecruiter");
});

router.post("/", function (req, res) {
    var username = req.body.username
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    if(req.body.password === req.body.confirmpassword){
        User.register(new User({ username: req.body.username, type: 'recruiter' }), req.body.password, function (err, user) {
            if (err) {
                req.flash('danger', 'Error', 'Oops! Something went wrong, please try again.')
                return res.render('registerrecruiter');
            }
            passport.authenticate("local")(req, res, function () {
                saveRecruiterDetails(username, firstname, lastname);
                req.flash('success', 'You have successfully registered as a recruiter. Welcome to Be You!.')
                res.redirect("/homepage");
            });
        });
        async function main() {

            var account = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                host: "smtp.googlemail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'beyouinfoteam@gmail.com', // generated ethereal user
                    pass: 'beyou@123' // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            var mailOptions = {
                from: '"Team BeYOU" <beyouinfoteam@gmail.com>', // sender address
                to: username, // list of receivers
                subject: "Registration Confirmed", // Subject line
                text: "User registration successful!! Welcome to Artist Management App" // plain text body
                // html body
            };

            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions)

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

    main().catch(console.error);
    } else {
        req.flash('danger', "Password and confirm password do not match.");
        res.redirect('/recruiter');
    }
});

function saveRecruiterDetails(uname, fname, lname) {
    var newUser = {
        username: uname,
        type: "recruiter",
        firstname: fname,
        lastname: lname,

    }
    RecUserDetail.create(newUser, function (err, user) {
        if (err) { console.log(err); }
        else {
            console.log(user);
        }
    })
}

module.exports = router;