var express = require("express"),
    router = express.Router(),
    UserDetail = require("../models/userdetail"),
    upload = require('../helpers/multer'),
    cloudinary = require('../helpers/cloudinary').cloudinary

//Get Edit profile details for user
router.get("/:uid", function (req, res) {
    UserDetail.findOne({ "uid": req.params.uid }, function (err, user) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err)
        } else {
            res.render('edit_profile', { user: user });
        }
    });
});

router.post('/:uid', upload.single("image"), async (req, res) => {
    if (!req.file) {
        var new_img = req.body.existing_img;
    } else {
        var result = await cloudinary.v2.uploader.upload(req.file.path);
        var new_img = result.secure_url;
    }
    var updated = {
        firstname: req.body.FirstName,
        lastname: req.body.Lastname,
        username: req.body.Email,
        artist: req.body.Artist,
        gender: req.body.Gender,
        haircolor: req.body.Hair,
        eyecolor: req.body.Eyes,
        shoe: req.body.Shoe,
        height: req.body.Height,
        ytlink: req.body.ytlink,
        picture: new_img
    }

    UserDetail.updateOne({ 'uid': req.params.uid }, { $set: { details: updated } }, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            req.flash('sucess', 'Details successfully updated!')
            res.redirect('/homepage');
        }
    })
});

module.exports = router;