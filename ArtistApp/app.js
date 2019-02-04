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
    cloudinary = require("cloudinary"),
    upload = require('./public/js/multer'),
    session = require('express-session'),
    flash = require('connect-flash')

//Cloudinary configuration
cloudinary.config({
    cloud_name: 'deuwergpo',
    api_key: '332151539923165',
    api_secret: 'HMGsmERYkU8RUoNsp_dxBgfxT_I'
});

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

app.use(express.static(__dirname + '/public'));
//for editing and updating user profile


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

//Registeration of Artist
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", upload.single("image"), async (req, res) => {
    var result = await cloudinary.v2.uploader.upload(req.file.path);
    var uid = Date.now();
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var artist = req.body.artist;
    var gender = req.body.gender;
    var haircolor = req.body.haircolor;
    var eyecolor = req.body.eyecolor;
    var shoe = req.body.shoe;
    var height = req.body.height;
    var ytlink = req.body.ytlink;
    var picture = result.secure_url;

    if(req.body.password === req.body.confirmpassword){

        User.register(new User({ uid, username: req.body.username, type: 'artist' }), req.body.password, function (err, user) {
            if (err) {
                req.flash('danger', 'Oops! Something went wrong, please try again.')
                return res.render('register');
            }
            passport.authenticate("local")(req, res, function () {
                saveArtistDetails(uid, username, firstname, lastname, artist, gender, haircolor, eyecolor, shoe, height, ytlink, picture);
                req.flash('success', 'You have successfully registered as an artist. Welcome to Be You!.')
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
        req.flash('danger', 'Password and confirm password do not match');
        res.redirect('/register');
    }
});

function saveArtistDetails(uid, uname, fname, lname, artist, gender, haircolor, eyecolor, shoe, height, ytlink, picture) {
    var newUser = {
        uid: uid,
        username: uname,
        type: "artist",
        details: {
            firstname: fname,
            lastname: lname,
            artist: artist,
            gender: gender,
            haircolor: haircolor,
            eyecolor: eyecolor,
            shoe: shoe,
            height: height,
            ytlink: ytlink,
            picture: picture
        }
    }
    UserDetail.create(newUser, function (err, user) {
        if (err) { console.log(err); }
    })
}

//Registration for recruiter
app.get("/registerrecruiter", function (req, res) {
    res.render("registerrecruiter");
});

app.post("/registerrecruiter", function (req, res) {
    var username = req.body.username
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    if(req.body.password === req.body.confirmpassword){
        User.register(new User({ username: req.body.username, type: 'recruiter' }), req.body.password, function (err, user) {
            if (err) {
                req.flash('danger', 'Error', 'Oops! Something went wrong, please try again.')
                return res.render('register');
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
        res.redirect('/registerrecruiter');
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


//Show all artists and filter artists on homepage
app.get("/homepage", isLoggedIn, function (req, res) {
    var type = req.params.artist;
    UserDetail.find({}, function (err, artists) {
        if (err) {
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists
            })
        }
    })
})

app.get("/homepage/:artist", isLoggedIn, function (req, res) {
    var type = req.params.artist;
    UserDetail.find({ 'details.artist': type }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists,
            })
        }
    })
})

//Get Profile for user
app.get("/profile/:_id", isLoggedIn, function (req, res) {
    UserDetail.findById({ "_id": req.params._id }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err)
        } else {
            res.render('profile', {
                artists: artists
            });
        }
    });
});

//Get Edit profile details for user
app.get("/edit_profile/:uid", function (req, res) {
    UserDetail.findOne({ "uid": req.params.uid }, function (err, user) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err)
        } else {
            res.render('edit_profile', { user: user });
        }
    });
});

app.post('/update_details/:uid', upload.single("image"), async (req, res) => {
    if (!req.file) {
        var new_img = req.body.existing_img;
    } else {
        var result = await cloudinary.v2.uploader.upload(req.file.path);
        var new_img = result.secure_url;
    }
    var updated = {
        firstname: req.body.FirstName,
        lastname: req.body.Lastname,
        username: req.body.Email,
        artist: req.body.Artist,
        gender: req.body.Gender,
        haircolor: req.body.Hair,
        eyecolor: req.body.Eyes,
        shoe: req.body.Shoe,
        height: req.body.Height,
        ytlink: req.body.ytlink,
        picture: new_img
    }

    UserDetail.updateOne({ 'uid': req.params.uid }, { $set: { details: updated } }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            req.flash('sucess', 'Details successfully updated!')
            res.redirect('/homepage');
        }
    })
});

app.post('/contact/:_id', function (req, res) {
    UserDetail.findById(req.params._id, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            username = artists.username;
            req.flash('success', 'Contact information successfully sent to artist.')
            res.redirect('/homepage');
        }
        var output = `
            <p>You have a new contact request</p>
            <h3>Contact Details</h3>
            <ul>
                <li>Email: ${req.body.email}</li>
                <li>FirstName: ${req.body.firstname}</li>
                <li>LastName: ${req.body.lastname}</li>
            </ul> 
            <h3>Message</h3>
            <p>${req.body.message}</p> `;

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
                subject: "Contact Request from the recruiter", // Subject line
                             // plain text body
                html: output                      // html body
            };

            // console.log(mailOptions);
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions)

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        main().catch(console.error);
    });
});


//Get Edit profile details for user
app.get("/edit_profile/:uid", isLoggedIn, function (req, res) {
    UserDetail.findOne({ "uid": req.params.uid }, function (err, user) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err)
        } else {
            res.render('edit_profile', { user: user });
        }
    });
});