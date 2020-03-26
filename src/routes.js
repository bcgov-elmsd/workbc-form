
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

    req.flash("success", "Request has been submitted");
    res.redirect("/done");
  }
);

module.exports = router
