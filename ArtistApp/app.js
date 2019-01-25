var express 	= require("express"),
    mongoose 	= require("mongoose"),
     passport 	= require("passport"),
     bodyParser = require("body-parser"),
     User		= require("./models/user"),
     LocalStrategy = require("passport-local"),
     passportLocalMongoose = require("passport-local-mongoose"),
     UserDetail = require("./models/userdetail"),
     RecUserDetail = require("./models/recuserdetails"),
     fs=require('fs'),
     multer=require('multer');


mongoose.connect("mongodb://localhost:27017/test");

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

    User.register(new User({username: req.body.username,  type : 'artist'}), req.body.password, function(err, user){
            if(err){
                console.log(err);
                return res.render('register');
                
            }
            passport.authenticate("local")(req, res, function(){
            
            	saveArtistDetails(username,firstname,lastname,artist,gender,haircolor,height);
            	res.redirect("/add_item");
            });
    });
});

// passport.use(new LocalStrategy(function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) return done(err);
//       if (!user) return done(null, false, { message: 'Incorrect username.' });
//       user.comparePassword(password, function(err, isMatch) {
//         if (isMatch) {
//           return done(null, user);
//         } else {
//           return done(null, false, { message: 'Incorrect password.' });
//         }
//       });
//     });
//   }));

app.get("/registerrecruiter", function(req,res){
	res.render("registerrecruiter");
});




app.post("/registerrecruiter", function(req, res){
		var username= req.body.username
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		

    User.register(new User({username: req.body.username,  type : 'recruiter'}), req.body.password, function(err, user){
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

var schema=new mongoose.Schema({
    item:String
});

var model1= mongoose.model('todomod',schema);

var storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.jpg')
    }
})

var upload = multer({ storage: storage });

app.get('/add_item',isLoggedIn, function(request,response){
    response.render('add_item.ejs');
});

app.post('/add_item',upload.single('uploaded_file'),function(req,res){
    console.log(req.body);
    console.log(req.file);
    let db_data = {
        item : req.file.path
    };
    
    model1(db_data ).save(function(err,data){
            if(err) throw err
            res.json(data);
    })
});

app.get("/forgot_password", function(req,res){
	res.render("forgot_password");
});

app.get("/profile", function(req,res){
	res.render("profile");
});

app.get("/login", function(req,res){
    res.render("login"); 
});


//login logic  requireArtist(),
app.post("/login", passport.authenticate("local",
{
    // res.redirect("/");
    // successRedirect: "/secret",
    failureRedirect: "/"

}), function(req,res){
    if(req.user.type == 'artist'){
        res.redirect("/add_item");
    }
    else{
        res.redirect("/secret");
    }
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
};

app.get("/edit_profile", function(req,res){
	res.render("edit_profile");
});

app.listen(7000, function(){
   console.log("Server Started"); 
});