
const express = require('express');
const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');
const nodemailer = require("nodemailer");

router.get('/', (req, res) => {
  res.render('index')
});

router.get('/jobseeker',(req,res) =>{
  res.render('jobseeker',{
    data: {},
    errors: {}
  }); 
})

router.get('/employer',(req,res) =>{
  res.render('employer',{
    data: {},
    errors: {}
  }); 
})


router.get('/done', (req,res) => {
  res.render('confirmation')
});

router.get('/about',(req,res) =>{
  res.render('about')
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


router.post(
  "/jobseeker",
  [
      check("firstname")
      .notEmpty()
      .withMessage("Please enter your first name."),
      check("lastname")
      .notEmpty()
      .withMessage("Please enter your last name."),
      check("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .bail()
      .trim()
      .normalizeEmail(),
      check("postal")
      .isPostalCode("CA")
      .trim()
      .withMessage("Please enter a valid Postal Code."),
      check("phone")
      .isMobilePhone(['en-CA','en-US'])
      .withMessage("Please enter a valid phone number.")
  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    console.log(errors);
    //const errors = [];
    if (!errors.isEmpty()) {
      return res.render("jobseeker", {
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
    /*
    let info = transporter.sendMail({
      from: '"A ghost" <workbctest@gov.bc.ca>', // sender address
      to: "Webmaster <rafael.solorzano@gov.bc.ca>", // list of receivers
      subject: "Hello", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>" // html body
    });
    */
  
    //console.log("Message sent: %s", info.messageId);

    req.flash("success", "Form has been submitted");
    res.redirect("/done");
  }
);

module.exports = router
