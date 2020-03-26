
const express = require('express');
const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');
const nodemailer = require("nodemailer");

router.get('/', (req, res) => {
  res.render('index',{
    data: {},
    errors: {}
  });
});

router.get('/done', (req,res) => {
  res.render('confirmation')
});

/*
router.post('/', (req, res) => {
  res.render('index', {
    data: req.body, // { message, email }
    errors: {
      message: {
        msg: 'A message is required'
      },
      email: {
        msg: 'That email doesn‘t look right'
      }
    }
  });
});
*/

async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account

}

main().catch(console.error);

router.post(
  "/",
  [
    
    check("message")
      .isLength({ min: 1 })
      .withMessage("Message is required")
      .trim(),
    /*
      check("email")
      .isEmail(),
      .withMessage("That email doesn‘t look right")
      .bail()
      .trim()
      .normalizeEmail()
    */
      check("Name").isLength({min:3}),
  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    //const errors = [];
    if (!errors.isEmpty()) {
      return res.render("index", {
        data: req.body,
        errors: errors.mapped()
      });
    }

    const data = matchedData(req);
    console.log("Sanitized: ", data);
    // Homework: send sanitized data in an email or persist in a db
    let transporter = nodemailer.createTransport({
      host: "apps.smtp.gov.bc.ca",
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized:false
      } // true for 465, false for other ports
    });
  
    // send mail with defined transport object
    let info = transporter.sendMail({
      from: '"A ghost" <workbctest@gov.bc.ca>', // sender address
      to: "Webmaster <rafael.solorzano@gov.bc.ca>", // list of receivers
      subject: "Hello", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>" // html body
    });
  
    console.log("Message sent: %s", info.messageId);

    req.flash("success", "Thanks for the message! I‘ll be in touch :)");
    res.redirect("/done");
  }
);

module.exports = router
