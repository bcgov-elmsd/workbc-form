
const express = require('express');
const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');
const nodemailer = require("nodemailer");

const Strings = {};
Strings.orEmpty = function( entity ) {
    return entity || "";
};

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
    
    let info = transporter.sendMail({
      from: 'Job Seeker" <donotreply@gov.bc.ca>', // sender address
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

router.post(
  "/employer",
  [
      check("employer")
      .notEmpty()
      .withMessage("Please enter employer."),
      check("jobtitle")
      .notEmpty()
      .withMessage("Please enter a job title."),
      check("positions")
      .isInt({min: 1, max: 9999})
      .withMessage("Please enter number of positions as a digit."),
      check("hrcontactname")
      .notEmpty()
      .withMessage("Please enter at least one HR Contact Name."),
      check("contactemail")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .trim()
      .normalizeEmail(),
      check("contactphone")
      .isMobilePhone(['en-CA','en-US'])
      .withMessage("Please enter a valid phone number."),
      check("rolesandresponsibilities")
      .notEmpty()
      .withMessage("Please enter roles and responsibilities."),
      check("qualifications")
      .notEmpty()
      .withMessage("Please enter qualifications."),
      check("hoursofwork")
      .notEmpty()
      .withMessage("Please enter hours of work."),
      check("hourlypay")
      .notEmpty()
      .withMessage("Please enter hourly pay."),
      check("positiontype")
      .notEmpty()
      .withMessage("Please enter position type."),
      check("catchment")
      .notEmpty()
      .withMessage("Please select at least one location."),
      check("preparedbyname")
      .notEmpty()
      .withMessage("Please enter your name."),
      check("preparedbyemail")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .trim()
      .normalizeEmail(),
      check("consent")
      .notEmpty()
      .withMessage("You must agree before submitting."),

  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    console.log(errors);
    //const errors = [];
    if (!errors.isEmpty()) {
      return res.render("employer", {
        data: req.body,
        errors: errors.mapped()
      });
    }

    const data = matchedData(req);
    console.log("Sanitized: ", data);
    console.log(data.firstname);

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
      from: 'Employer <donotreply@gov.bc.ca>', // sender address
      to: "WorkBC Hiring <WorkBCHiring@gov.bc.ca>", // list of receivers
      subject: "Employer Form", // Subject line
      text: "Plain text", // plain text body
      html: createEmployerHtml(data) // html body
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
  html += "<p>Address: "+ Strings.orEmpty(data.address) + "</p>"
  html += "<p>Address2: "+ Strings.orEmpty(data.address2) + "</p>"
  html += "<p>City: "+ Strings.orEmpty(data.city) + "</p>"
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

function createEmployerHtml(data){
  var html = "";
  html += "<h2>A Employer Form has been submitted</h2>"
  html += "<p>Employer Name: " + data.employer + "</p>"
  html += "<p>Location(s): " + data.catchment + "</p>"
  html += "<p>Job Title: "+ data.jobtitle + "</p>"
  html += "<p># of Positions: "+ data.positions + "</p>"
  html += "<p>HR Contact Name: "+ data.hrcontactname + "</p>"
  html += "<p>Contact Email: "+ Strings.orEmpty(data.contactemail)  + "</p>"
  html += "<p>Contact Phone: "+ Strings.orEmpty(data.contactphone) + "</p>"
  html += "<h3>Job Description</h3>"
  html += "<p>Role and Responsibilities: </p>"
  html += "<div>" + data.rolesandresponsibilities + "</div>"
  html += "<p>Qualifications and Education Requirements: </p>"
  html += "<div>" + data.qualifications + "</div>"
  html += "<p>Hours of Work: "+ data.hoursofwork + "</p>"
  html += "<p>Hourly rate of pay: "+ data.hourlypay + "</p>"
  html += "<p>Position Type: "+ data.positiontype + "</p>"
  html += "<p>Physical Requirement: "+ Strings.orEmpty(data.physicalrequirements)  + "</p>"
  html += "<p>COVID-19 health and safety provisions: "+ Strings.orEmpty(data.covid19health) + "</p>"
  html += "<p>Other: </p>"
  html += "<div>"+ Strings.orEmpty(data.otherjobdetails) + "</div>"
  html += "<h3>Template Prepared By</h3>"
  html += "<p>Name: "+ data.preparedbyname + "</p>"
  html += "<p>Email: "+ data.preparedbyemail + "</p>"
  html += "<h3>WorkBC Referrals</h3>"
  html += "<p>Name: "+ Strings.orEmpty(data.referral1name) + "</p>"
  html += "<p>Email: "+ Strings.orEmpty(data.referral1email) + "</p>"
  html += "<p>Name: "+ Strings.orEmpty(data.referral2name) + "</p>"
  html += "<p>Email: "+ Strings.orEmpty(data.referral2email) + "</p>"
  html += "<p>Name: "+ Strings.orEmpty(data.referral3name) + "</p>"
  html += "<p>Email: "+ Strings.orEmpty(data.referral3email) + "</p>"



  return html;
  /*
  html += "<p>"+ data. + "</p>"
  html += "<p>"+ data. ? data. : ""+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  */
}

module.exports = router
