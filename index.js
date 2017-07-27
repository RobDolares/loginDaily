const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const data = require('./userdata');
const morgan = require('morgan');
const expressValidator = require('express-validator');
const session = require('express-session');

const app = express();

// tell express to use handlebars
app.engine('handlebars', handlebars());
app.set('views', './views');
app.set('view engine', 'handlebars');

// configure session support middleware with express-session
app.use(
  session({
    secret: '${data}', // this is a password. make it unique
    resave: false, // don't resave the session into memory if it hasn't changed
    saveUninitialized: true // always create a session, even if we're not storing anything in it.
  })
);

// setup morgan for logging requests
// // put this above other stuff in the hope that it will log static resources
app.use(morgan('dev'));

// tell express how to serve static files
app.use(express.static('public'));

//tell express to use the bodyParser middleware to parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// add express-validator middleware. This adds the checkBody() and presumably
// other methods to the req.
app.use(expressValidator());

// this middleware creates a default session
app.use((req, res, next) => {

  if (!req.session.userdata) {

    req.session.userdata = [];
  }
  console.log(req.session);

  next();
});



app.get('/', function(req, res) {
  if(req.session.userdata === undefined ||
  req.session.userdata == 0){
  res.redirect('/login');
} else {
  res.render('home');
};
});



// configure the webroot
app.get('/', function(req, res) {
  res.render('home')
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {

  let credInfo = req.body;

  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();

    if (errors) {
    // there were errors, report them
      console.log(errors);

      res.render('login', {

      errors: errors,
      credInfo:credInfo

    });
  } else {
    req.session.userdata.push(credInfo);
    // now that I've added the food item to the array, redirect to the homepage
    res.redirect('/');
  }
});







//For new users


app.post('/signup', function(req, res) {
  // get the food item details from the posted body data
  let userCred = req.body;

  // validate the user's data
  req.checkBody('username', 'Name is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  // get all errors from our validation that we just did as an array
  let errors = req.validationErrors();

  if (errors) {
    // there were errors, report them
    console.log(errors);

    res.render('login', { errors: errors, userCred: userCred });
  } else {
    // there were no errors. save the userCred item

    // store the food item in our array of userData
    req.session.userdata.push(userCred);

    // now that I've added the food item to the array, redirect to the homepage
    res.redirect('/');
  }
});


// make express listen on port 3000
app.listen(3000);
