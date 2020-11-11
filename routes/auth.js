const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/User.model');
const { Mongoose } = require('mongoose');

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.post('/signup', (req, res) => {
  const { username, password } = req.body;
  //hash the password
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashPassword = bcrypt.hashSync(password, salt);
  if (username === '' || password === '') {
    res.render('auth/signup', 
    { 
      errorMessage: 'Indicate username and password'
    });
    return;
  }
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.render('auth/signup', 
    { 
      errorMessage: `Password needs to have at least 6 characteres and must contain at least
      one number and one uppercase letter.
      `
    });
    return;
  }
  User.findOne({'username': username})
    .then((user) => {
      if(user) { // user !== undefined
        res.render('auth/signup', {
          errorMessage: 'The username already exists'
        });
        return;
      }
      User.create({ username, password: hashPassword})
        .then(() => {
          res.redirect('/');
        })
        .catch((error) => {
          if (error.code === 11000) {
            res.status(500).
            render('auth/signup', {
              errorMessage: 'Username needs to be unique'
            })
          }
         // console.log('error', error);
        /*  res.render('auth/signup', {
            errorMessage: error
          })*/
        })
    });
});

module.exports = router;