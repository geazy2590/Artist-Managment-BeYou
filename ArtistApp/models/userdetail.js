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
		eyecolor: String,
		shoe: String,
		height: Number,
		ytlink: String
		}
}
var UserDetailShema = new mongoose.Schema(UserDetail);

module.exports = mongoose.model("ArtistDetail",UserDetailShema);