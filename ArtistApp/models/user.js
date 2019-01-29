var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserShema = new mongoose.Schema({
    uid : String,
    username: String,
    password: String,
    type: String
    
});

UserShema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserShema);