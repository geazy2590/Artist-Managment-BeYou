//Initializing npm packages
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    flash = require('express-flash-notification'),
    cookieParser = require('cookie-parser'),
    User = require("./models/user"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    UserDetail = require("./models/userdetail"),
    RecUserDetail = require("./models/recuserdetails"),
    cloudinary = require("cloudinary"),
    upload = require('./public/js/multer')
    
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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//Express session
app.use(require("express-session")({
    secret: "This is the login part",
    resave: false,
    saveUninitialized: false
}));

//Flash notifications
app.use(flash(app));

//Passport initialization
app.use(passport.initialize());
app.use(passport.session());

//Storing current user details
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
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
    
    User.register(new User({ uid, username: req.body.username, type: 'artist' }), req.body.password, function (err, user) {
        if (err) {
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function () {
            saveArtistDetails(uid, username, firstname, lastname, artist, gender, haircolor, eyecolor, shoe, height, ytlink, picture);
            res.redirect("/homepage");
        });
    });
});

function saveArtistDetails(uid, uname, fname, lname, artist, gender, haircolor, eyecolor, shoe, height, ytlink, picture) {
    var newUser = {
        uid : uid,
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
        else {
            // console.log(user);
        }
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


    User.register(new User({ username: req.body.username, type: 'recruiter' }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function () {
            saveRecruiterDetails(username, firstname, lastname);
            res.redirect("/homepage");
        });
    });
});

function saveRecruiterDetails(uname,fname,lname){
	var newUser = {
    username: uname,
    type: "recruiter",
    firstname: fname,
    lastname: lname,
		
	}
	RecUserDetail.create(newUser, function(err,user){
		if(err){console.log(err);}
		else{
			console.log(user);
		}

	})
}

//Passport login authentication
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/homepage',
        failureRedirect: '/login',
        failureFlash: 'Invalid username or password.'                           
}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("login");
};

//Logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


//Show all artists and filter artists on homepage
app.get("/homepage", isLoggedIn, function(req, res){
    var type = req.params.artist;
    UserDetail.find({}, function(err, artists){
        if(err) {
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists
            })
        }
    })
})

app.get("/homepage/:artist", isLoggedIn, function(req, res){
    var type = req.params.artist;
    UserDetail.find({'details.artist': type}, function(err, artists){
        if(err) {
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists
            })
        }
    })
})

//Get Profile for user
app.get("/profile/:_id", function (req, res) {
    UserDetail.findById({"_id": req.params._id}, function (err, artists) {
        if(err){
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
    UserDetail.findOne({"uid": req.params.uid}, function(err, user){
        if(err){
            console.log(err)
        } else {
            res.render('edit_profile', { user: user });
        }
    });
});

app.post('/update_details/:uid', function(req, res){
    var updated = { 
        firstname: req.body.FirstName,
        lastname: req.body.LastName,
        username: req.body.Email,
        haircolor: req.body.Hair,
        eyecolor: req.body.Eyes,
        shoe: req.body.Shoe,
        height: req.body.Height,
        ytlink: req.body.ytlink
    }
    UserDetail.updateOne({'uid': req.params.uid}, {$set: {details: updated}}, function(err, artists){
        if(err){
            console.log(err);
        } else {    
            res.render("profile", { artists : artists});
        }
    })
});

//Forgot Password redirection
app.get("/forgot_password", function (req, res) {
    res.render("forgot_password");
});


app.post('/upload', (req, res, next) => {
  const upload = multer({ storage }).single('name-of-input-key')
  upload(req, res, function(err) {
    if (err) {
      return res.send(err)
    }
    res.json(req.file)
  })
})
