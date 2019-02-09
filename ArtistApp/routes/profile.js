var express = require("express"),
    router = express.Router(),
    UserDetail = require("../models/userdetail"),
    upload = require('../helpers/multer'),
    cloudinary = require('../helpers/cloudinary').cloudinary

//Get Profile for user
router.get("/:_id", function (req, res) {
    UserDetail.findById({ "_id": req.params._id }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err)
        } else {
            res.render('profile', {
                artists: artists
            });
        }
    });
});

module.exports = router;