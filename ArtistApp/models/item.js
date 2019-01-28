var mongoose = require("mongoose");
var fs = require("fs");
var multer = require("multer");

var ItemSchema = new mongoose.Schema(
    { img: 
        { data: Buffer, contentType: String }
    }
  );

  app.use(multer({ dest: '/uploads',
    rename: function (fieldname, filename) {
      return filename;
    },
   }));

  module.exports = mongoose.model('images',ItemSchema);