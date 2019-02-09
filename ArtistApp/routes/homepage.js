var express = require("express"),
    router = express.Router(),
    UserDetail = require("../models/userdetail"),
    RecUserDetail = require("../models/recuserdetails")

//Show all artists and filter artists on homepage
router.get("/", function (req, res) {
    var type = req.params.artist;
    UserDetail.find({}, function (err, artists) {
        if (err) {
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists
            })
        }
    })
})

router.get("/:artist", function (req, res) {
    var type = req.params.artist;
    UserDetail.find({ 'details.artist': type }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            res.render('homepage', {
                artists: artists,
            })
        }
    })
})

module.exports = router;