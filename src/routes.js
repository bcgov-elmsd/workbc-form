
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
      .withMessage("Please enter a valid phone number."),
      check("consent")
      .notEmpty()
      .withMessage("You must agree before submitting."),
      check("catchment")
      .notEmpty()
      .withMessage("Please select at least one region.")
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
    console.log(data.firstname);

    

    // Homework: send sanitized data in an email or persist in a db
    let transporter = nodemailer.createTransport({
      host: "apps.smtp.gov.bc.ca",
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized:false
      } // true for 465, false for other ports
    });
  
    var htmlMessage = "";
    htmlMessage += "<p>" + data.firstname + "</p>";

    // send mail with defined transport object
    
    let info = transporter.sendMail({
      from: '"Job Seeker" <donotreply@gov.bc.ca>', // sender address
      to: "WorkBC Jobs <WorkBCJobs@gov.bc.ca>", // list of receivers
      subject: "Job Seeker Form", // Subject line
      text: "Plain text", // plain text body
      html: createJobSeekerHtml(data) // html body
    });
    
    
  
    console.log("Message sent: %s", info.messageId);

    req.flash("success", "Form has been submitted");
    res.redirect("/done");
  }
);

function createJobSeekerHtml(data){
  var html = "";
  html += "<h2>A Job Seeker Form has been submitted</h2>"
  html += "<p>First Name: " + data.firstname + "</p>"
  html += "<p>Middle Name: " + data.middlename ? data.middlename : "" + "</p>"
  html += "<p>Last Name: "+ data.lastname + "</p>"
  html += "<p>Phone: "+ data.phone + "</p>"
  html += "<p>Email: "+ data.email + "</p>"
  html += "<p>Address: "+ data.address ? data.address : "" + "</p>"
  html += "<p>Address2: "+ data.address2? data.address2 : "" + "</p>"
  html += "<p>City: "+ data.city ? data.city : "" + "</p>"
  html += "<p>Postal Code: "+ data.postal + "</p>"
  html += "<p>Region(s) available to work: "+ data.catchment + "</p>"
  return html;
  /*
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  */
}

module.exports = router
