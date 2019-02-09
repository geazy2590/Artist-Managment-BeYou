var express = require("express"),
    router = express.Router(),
    nodemailer = require('nodemailer')

router.post('/:_id', function (req, res) {
    UserDetail.findById(req.params._id, function (err, artists) {
        if (err) {
            req.flash('danger', 'Oops! Something went wrong, please try again. ')
            console.log(err);
        } else {
            username = artists.username;
            req.flash('success', 'Contact information successfully sent to artist.')
            res.redirect('/homepage');
        }
        var output = `
            <p>You have a new contact request</p>
            <h3>Contact Details</h3>
            <ul>
                <li>Email: ${req.body.email}</li>
                <li>FirstName: ${req.body.firstname}</li>
                <li>LastName: ${req.body.lastname}</li>
            </ul> 
            <h3>Message</h3>
            <p>${req.body.message}</p> `;

        async function main() {

            var account = await nodemailer.createTestAccount();

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                host: "smtp.googlemail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: 'beyouinfoteam@gmail.com', // generated ethereal user
                pass: 'beyou@123' // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            var mailOptions = {
                from: '"Team BeYOU" <beyouinfoteam@gmail.com>', // sender address
                to: username, // list of receivers
                subject: "Contact Request from the recruiter", // Subject line
                             // plain text body
                html: output                      // html body
            };

            // console.log(mailOptions);
            // send mail with defined transport object
            let info = await transporter.sendMail(mailOptions)

            console.log("Message sent: %s", info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        main().catch(console.error);
    });
});

module.exports = router;