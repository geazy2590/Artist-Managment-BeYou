var mongoose = require("mongoose");
var UserDetail = {
    username: String,
    type: String,
    details:{
    	firstname: String,
    	lastname: String,
    	artist: String,
    	gender: String,
    	haircolor: String,
		Height: Number
		}
}
var UserDetailShema = new mongoose.Schema(UserDetail);

module.exports = mongoose.model("ArtistDetail",UserDetailShema);