var express 	= require("express"),
    mongoose 	= require("mongoose"),
     passport 	= require("passport"),
     bodyParser = require("body-parser"),
     User		= require("./models/user"),
     LocalStrategy = require("passport-local"),
     passportLocalMongoose = require("passport-local-mongoose"),
     UserDetail = require("./models/userdetail"),
     RecUserDetail = require("./models/recuserdetails")

mongoose.connect("mongodb://localhost:27017/artist");
//app.use(express.static("public"));


var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));



app.use(require("express-session")({
    secret: "This is the login part",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req,res){
    res.render("landing");    
});

app.get("/secret", isLoggedIn, function(req,res){
	res.render("secret");
});



app.get("/register", function(req,res){
	res.render("register");
});

//Handling Sign-Up
app.post("/register", function(req, res){
		var username= req.body.username
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var artist = req.body.artist;
		var gender = req.body.gender;
		var haircolor = req.body.haircolor;
		var height = req.body.Height;

    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render('register');
                
            }
            passport.authenticate("local")(req, res, function(){
            
            	saveArtistDetails(username,firstname,lastname,artist,gender,haircolor,height);
            	res.redirect("/secret");
            });
    });
});


app.get("/registerrecruiter", function(req,res){
	res.render("registerrecruiter");
});



app.post("/registerrecruiter", function(req, res){
		var username= req.body.username
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		

    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render('register');
                
            }
            passport.authenticate("local")(req, res, function(){
            	
				saveRecruiterDetails(username,firstname,lastname);
            	res.redirect("/secret");
            });
    });
});
function saveArtistDetails(uname,fname,lname,artist,gender,haircolor,height){
	var newUser = {
    username: uname,
    type: "artist",
    details:{
    	firstname: fname,
    	lastname: lname,
    	artist: artist,
    	gender: gender,
    	haircolor: haircolor,
    	Height: height
		}
	}
	UserDetail.create(newUser, function(err,user){
		if(err){console.log(err);}
		else{
			console.log(user);
		}

	})
}

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


app.get("/forgot_password", function(req,res){
	res.render("forgot_password");
});

app.get("/profile", function(req,res){
	res.render("profile");
});

app.get("/login", function(req,res){
    res.render("login"); 
});
//login logic
app.post("/login",passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/"
}), function(req,res){
    
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("login");
}

app.listen(7000, function(){
   console.log("Server Started"); 
});