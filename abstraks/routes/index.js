const express = require('express');
const router = express.Router();
const User = require('../models/user');
const mid = require('../middleware');


// GET register route
router.get('/register', mid.loggedOut, (req, res, next) => {
  res.json({message: 'Hello World'});
});

// POST register route
router.post('/register', (req, res, next) => {
  try {
    if(req.body.email &&
      req.body.name &&
      req.body.password &&
      req.body.confirmPassword) {
  
      // confirms if user has typed in the password twice
      if(req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.status(400).json({message: err.message});
        return next(err);
      }
  
      // create object with form input that 
      // is stored inside the database
      var userData = {
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      };
  
      // user schema's 'create' method to insert document into mongo
      User.create(userData, (error, user) =>{
        if(error) {
          var err = new Error('Something went wrong while creating a new user.');
          res.json({message: error.message});
          return next(error);
        } else {
          // confirms and allows user to access profile page
          // user's information stored in an id and kept only on the server
          // allows user to access profile page. 
          // user_id holds all the information for a single logged in user
          req.session.userId = user._id;
          res.status(201)
          res.json({message: 'You are registered.'});
          console.log(req.body.name);
          // return res.redirect('/api/profile');
        }
      });
  
    } else {
      var err = new Error('All fields required!');
      err.status = 400;
      res.status(400).json({message: err.message});
      return next(err);
    }
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// GET login
router.get('/login', mid.loggedOut, function (req, res, next) {
  res.json({message: 'GET login'});
});

// POST login route
router.post('/login', mid.loggedOut, (req, res, next) => {
  try {
    // checking to make sure email and 
    // password are coming through the request
    if(req.body.email && req.body.password) {
      // the authenticate method from the user model
      User.authenticate(req.body.email, req.body.password, function(error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          res.status(401).json({message: err.message});
          return next(err);
        } else {
          // user's information stored in an id and kept only on the server
          // allows user to access profile page. 
          // user_id holds all the information for a single logged in user
          req.session.userId = user._id;
          res.status(200);
          res.json({message: 'You have logged in.'});
          // return res.redirect('/api/profile');
        }
  
      }); // remove or update with passport implementation
    } else {
      var err = new Error('Email and password are required.');
      err.status = 401;
      res.status(401).json({message: err.message});
      return next(err);
    }
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// GET profile route

// when a user logs in and uses their session 
// id, it's stored as a session variable
// if there is no user id in the session then the user cannot be lgged in
router.get('/profile', mid.requiresLogin, (req, res, next) => {
  try {
    if( ! req.session.userId) {
      var err = new Error('You are not authorized to view this page.');
      err.status = 403;
      return next(err);
    }

    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        var err = new Error('Something went wrong while retrieving your profile.');
        res.status(400).json({message: err.message});
        return next(error);
      } else {
        // if there is a user id stored, run a query agaisnt 
        // the database to retrieve the user's information
        res.status(200)
        res.json({message: 'Welcome back to your profile.'});
        // return res.redirect('/api/profile');
      }

    });
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// GET logout route
router.get('/logout', (res, req, next) => {
  try {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          var err = new Error('Something went wrong while logging out of your profile.');
          res.status(400).json({message: err.message});
          return next(err);
        } else {
          res.status(204)
          res.json({message: 'You have logged out.'});
          // return res.redirect('/api/register');
        }
      });
    }
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

module.exports = router;