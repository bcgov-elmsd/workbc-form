
const express = require('express');
const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');
const nodemailer = require("nodemailer");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const Strings = {};
Strings.orEmpty = function (entity) {
  return entity || "";
};

router.get('/', (req, res) => {
  res.render('index')
});

router.get('/jobseeker', csrfProtection, (req, res) => {
  res.render('jobseeker', {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  });
})

router.get('/employer', csrfProtection, (req, res) => {
  res.render('employer', {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  });
})


router.get('/jobseekerdone', (req, res) => {
  res.render('jobseekerconfirmation')
});

router.get('/employerdone', (req, res) => {
  res.render('employerconfirmation')
});

router.get('/about', (req, res) => {
  res.render('about')
});



router.post(
  "/jobseeker", csrfProtection,
  [
    check("firstname")
      .notEmpty()
      .withMessage("Please enter your first name."),
    check("middlename")
      .optional(),
    check("address")
      .optional(),
    check("address2")
      .optional(),
    check("lastname")
      .notEmpty()
      .withMessage("Please enter your last name."),
      check("phone")
      .isMobilePhone(['en-CA', 'en-US'])
      .withMessage("Please enter a valid phone number."),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .bail()
      .trim()
      .normalizeEmail(),
    check("city")
      .notEmpty()
      .withMessage("Please enter a city."),
    check("postal")
      .isPostalCode("CA")
      .trim()
      .withMessage("Please enter a valid Postal Code."),
    check("legalworkingage")
      .isIn(["Yes", "No"])
      .withMessage("Please answer."),
    check("eligibletowork")
      .isIn(["Yes", "No"])
      .withMessage("Please answer."),
    check("volunteer")
      .optional(),
    check("neighbouringcommunities")
      .optional(),
    check("certificates")
      .optional(),
    check("owncar")
      .optional(),
    check("worknights")
      .optional(),
    check("consent")
      .notEmpty()
      .withMessage("You must agree before submitting."),
    /*
    check("catchment")
    .notEmpty()
    .withMessage("Please select at least one region.")
    */
  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    //console.log(errors);
    //const errors = [];
    if (!errors.isEmpty()) {
      return res.render("jobseeker", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    }

    const data = matchedData(req);
    console.log("Sanitized: ", data);

    
    try {
      let transporter = nodemailer.createTransport({
        host: "apps.smtp.gov.bc.ca",
        port: 25,
        secure: false,
        tls: {
          rejectUnauthorized: false
        }
      });
      let message = {
        from: 'Job Seeker <donotreply@gov.bc.ca>', // sender address
        to: "WorkBC Jobs <WorkBCJobs@gov.bc.ca>", // list of receivers
        subject: "Job Seeker Form", // Subject line
        text: "Plain text", // plain text body
        html: createJobSeekerHtml(data) // html body
      }
      let info = transporter.sendMail(message, (error, info) => {
        if (error) {
          req.flash("error", "An error occured while submitting the form, please try again. If the error persists please try again later.");
          return res.render("jobseeker", {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
          });
        } else {
          console.log("Message sent: %s", info.messageId);
          req.flash("success", "Form has been submitted");
          res.redirect("/jobseekerdone");
        }
      })
    } catch (error) {

    }
        
    
    //sendMail(data);
    //req.flash("success", "Form has been submitted");
    //res.redirect("/done");

  }
);

router.post(
  "/employer", csrfProtection,
  [
    check("morethan1position")
      .optional(),
    check("employer")
      .notEmpty()
      .withMessage("Please enter employer."),
    check("jobtitle")
      .notEmpty()
      .withMessage("Please enter a job title."),
    check("positions")
      .isInt({ min: 1, max: 9999 })
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
      .isMobilePhone(['en-CA', 'en-US'])
      .withMessage("Please enter a valid phone number."),
    check("workschedule")
      .optional(),
    check("hourlypay")
      .optional(),
    check("positiontype")
      .isIn(["0","Temporary full time", "Temporary part time", "Permanent full time", "Permanent part time"])
      .optional(),
    check("otherjobdetails")
      .notEmpty()
      .withMessage("Please enter instructions."),
    check("rolesandresponsibilities")
      .notEmpty()
      .withMessage("Please enter roles and responsibilities."),
    check("qualifications")
      .notEmpty()
      .withMessage("Please enter qualifications."),
    check("catchment")
      .notEmpty()
      .withMessage("Please select at least one location."),
  /*
  check("preparedbyname")
    .notEmpty()
    .withMessage("Please enter your name."),
  check("preparedbyemail")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .trim()
    .normalizeEmail(),
  */
    check("consent")
      .notEmpty()
      .withMessage("You must agree before submitting."),

  ],
  (req, res) => {
    //console.log(req.body);
    const errors = validationResult(req);
    //console.log(errors);
    //const errors = [];
    if (!errors.isEmpty()) {
      return res.render("employer", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    }

    const data = matchedData(req);
    console.log("Sanitized: ", data);

    try {
      let transporter = nodemailer.createTransport({
        host: "apps.smtp.gov.bc.ca",
        port: 25,
        secure: false,
        tls: {
          rejectUnauthorized: false
        } // true for 465, false for other ports
      });

      // send mail with defined transport object
      let message = {
        from: 'Employer <donotreply@gov.bc.ca>', // sender address
        to: "WorkBC Hiring <WorkBCHiring@gov.bc.ca>", // list of receivers
        subject: "Employer Form", // Subject line
        text: "Plain text", // plain text body
        html: createEmployerHtml(data) // html body
      };
      let info = transporter.sendMail(message, (error, info) => {
        if (error) {
          req.flash("error", "An error occured while submitting the form, please try again. If the error persists please try again later.");
          return res.render("employer", {
            data: req.body,
            errors: errors.mapped(),
            csrfToken: req.csrfToken()
          });
        } else {
          console.log("Message sent: %s", info.messageId);
          req.flash("success", "Form has been submitted");
          res.redirect("/employerdone");
        }
      });
    } catch (error) {

    }

    //req.flash("success", "Form has been submitted");
    //res.redirect("/done");
  }
);

function createJobSeekerHtml(data) {
  var html = "";
  html += "<h2>A Job Seeker Form has been submitted</h2>"
  //html += "<p>Salutation: " + data.salutation + ".</p>"
  html += "<p>First Name: " + data.firstname + "</p>"
  html += "<p>Middle Name: " + Strings.orEmpty(data.middlename) + "</p>"
  html += "<p>Last Name: " + data.lastname + "</p>"
  html += "<p>Phone: " + data.phone + "</p>"
  html += "<p>Email: " + data.email + "</p>"
  html += "<p>Address: " + Strings.orEmpty(data.address) + "</p>"
  html += "<p>Address2: " + Strings.orEmpty(data.address2) + "</p>"
  html += "<p>City: " + Strings.orEmpty(data.city) + "</p>"
  html += "<p>Postal Code: " + data.postal + "</p>"
  html += "<p>Legal working age: " + data.legalworkingage + "</p>"
  html += "<p>Eligible to work in Canada: " + data.eligibletowork + "</p>"
  html += "<p>Willing to work in neighbouring communities: " + Strings.orEmpty(data.neighbouringcommunities) + "</p>"
  html += "<p>Willing to volunteer:  " + Strings.orEmpty(data.volunteer) + "</p>"
  html += "<p>Skills/Abilities/Certifications: " + Strings.orEmpty(data.certificate) + "</p>"
  //html += "<p>Able to lift up to 40 pounds: " + Strings.orEmpty(data.upto40pounds) + "</p>"
  //html += "<p>Able to lift more than 40 pounds: " + Strings.orEmpty(data.morethan40pounds) + "</p>"
  //html += "<p>Have driver's license: "+ Strings.orEmpty(data.driverslicense) +"</p>"
  //html += "<p>Driver's license type: "+ Strings.orEmpty(data.driverslicensekind) + "</p>"
  html += "<p>Own car or have access to vehicle: " + Strings.orEmpty(data.owncar) + "</p>"
  html += "<p>Willing to work nights: " + Strings.orEmpty(data.worknights) + "</p>"
  //html += "<p>Start work immediatly: "+ Strings.orEmpty(data.startimmediatly) +"</p>"
  //html += "<p>Industries with experience: "+ Strings.orEmpty(data.experienceindustries) +"</p>"
  //html += "<p>Ready, willing, and able to work in industry in which you don't have experience: "+ Strings.orEmpty(data.workinunrelatedindustry) +"</p>"
  //html += "<p>"+ data.consent +"</p>"

  //html += "<p>Region(s) available to work: " + data.catchment + "</p>"
  return html;
  /*
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  html += "<p>"+ "</p>"
  */
}

function createEmployerHtml(data) {
  var html = "";
  html += "<h2>A Employer Form has been submitted</h2>"
  html += "<p>Employer Name: " + data.employer + "</p>"
  html += "<p>Location(s): " + data.catchment + "</p>"
  html += "<p>Job Title: " + data.jobtitle + "</p>"
  html += "<p># of Positions: " + data.positions + "</p>"
  html += "<p>HR Contact Name: " + data.hrcontactname + "</p>"
  html += "<p>Contact Email: " + Strings.orEmpty(data.contactemail) + "</p>"
  html += "<p>Contact Phone: " + Strings.orEmpty(data.contactphone) + "</p>"
  html += "<h3>Job Description</h3>"
  html += "<p>Role and Responsibilities: </p>"
  html += "<div>" + data.rolesandresponsibilities + "</div>"
  html += "<p>Qualifications and Education Requirements: </p>"
  html += "<div>" + data.qualifications + "</div>"
  html += "<p>Work Schedule: " + data.workschedule + "</p>"
  html += "<p>Hourly rate of pay: " + data.hourlypay + "</p>"
  html += "<p>Position Type: " + data.positiontype + "</p>"
  //html += "<p>Physical Requirement: " + Strings.orEmpty(data.physicalrequirements) + "</p>"
  //html += "<p>COVID-19 health and safety provisions: " + Strings.orEmpty(data.covid19health) + "</p>"
  html += "<p>Instructions for Submitting Applicants Referrals: </p>"
  html += "<div>" + Strings.orEmpty(data.otherjobdetails) + "</div>"
  /*
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
  */


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
