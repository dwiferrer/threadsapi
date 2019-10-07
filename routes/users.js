var express = require('express');
const bodyParser = require("body-parser");
var User = require("../models/user");
//const cookieParser = require("cookie-parser")
const passport = require('passport')
const authenticate = require('../authenticate')

var router = express.Router();
router.use(bodyParser.json())

router.get('/signup', (req, res, next) => {
  //res.send('respond with a resource');
  res.render("signup")
});

router.post("/signup", (req, res, next) => {
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.json({err:err})
    }
    else{
      if(req.body.firstname)
       user.firstname = req.body.firstname
      if(req.body.lastname)
       user.lastname = req.body.lastname
      user.save((err, user) => {
        if (err){
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.json({err:err})
          return
        }
        passport.authenticate('local')(req, res, () => {
          res.redirect("/users/login")
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({success: true, status:"Registration Success"})
        })
      })
    }
  })
});

router.get("/login", (req, res) => {
  res.render("login");
})
.post("/login", passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id })
  res.cookie("myCookie", token)
  res.statusCode = 200;
  res.redirect("/threads");
  //res.setHeader("Content-Type", "application/json");
  //res.json({success: true, token: token, status:"You are succesfully logged in"});
});

router.get("/logout", authenticate.verifyUser, (req, res)=>{
  // if (req.session) {
  //   req.session.destroy()
  //   res.clearCookie('session-test', { path: '/', domain: 'localhost' })
  //   res.redirect('/')
  // }
  // else {
  //     var err = new Error('You are not logged in!')
  //     err.status = 403
  //     return next(err)
  // }
  res.clearCookie("myCookie")
  res.redirect("/users/login")
});

module.exports = router;