var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var UserShema = new mongoose.Schema({
    username: String,
    password: String
});

UserShema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserShema);