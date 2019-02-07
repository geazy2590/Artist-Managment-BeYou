var express = require("express"),
    upload = require('../helpers/multer'),
    cloudinary = require('../helpers/cloudinary').cloudinary,
    router = express.Router(),
    UserDetail = require("../models/userdetail"),
    RecUserDetail = require("../models/recuserdetails"),
    nodemailer = require('nodemailer')
    
//Registration of Artist
router.get("/register", function (req, res) {
    res.render("register");
});

router.post("/register", upload.single("image"), async (req, res) => {
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
router.get("/registerrecruiter", function (req, res) {
    res.render("registerrecruiter");
});

router.post("/registerrecruiter", function (req, res) {
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

module.exports = router;