var mongoose = require("mongoose");
var RecUserDetail = {
    username: String,
    type: String,
    firstname: String,
    lastname: String
}

var RecUserDetailSchema = new mongoose.Schema(RecUserDetail);

module.exports = mongoose.model("RecUserDetail",RecUserDetailSchema);