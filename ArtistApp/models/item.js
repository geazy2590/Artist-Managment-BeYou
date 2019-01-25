var mongoose = require("mongoose");
var fs = require("fs");
var multer = require("multer");

var ItemSchema = new mongoose.Schema(
    { img: 
        { data: Buffer, contentType: String }
    }
  );
  module.exports = mongoose.model('images',ItemSchema);