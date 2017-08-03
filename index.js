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
    secret: 'password', // this is a password. make it unique
    resave: false, // don't resave the session into memory if it hasn't changed
    saveUninitialized: true // always create a session, even if we're not storing anything in it.
  })
);

// setup morgan for logging requests
// put above other stuff to log static resources
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


app.get('/', (req, res) => {
  if (req.session.userdata === undefined ||
    req.session.userdata.length === 0)  {
    res.redirect('/login');
  } else {
    res.render('home', {
      userdata: req.session.userdata
    });
  };
});




app.get('/login', function(req, res) {
  res.render('login');
});


app.post('/login', function(req, res) {

      let credInfo = req.body;
      console.log(credInfo);

      req.checkBody('username', 'Name is required').notEmpty();
      req.checkBody('password', 'Password is required').notEmpty();

      let errors = req.validationErrors();

      if (errors) {
        // there were errors, report them
        console.log(errors);

        res.render('login', {
          errors: errors,
          credInfo: credInfo
        });
      } else {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
          if (credInfo.password === data[i].password && credInfo.username === data[i].username) {
            req.session.userdata.push(data[i]);
            res.redirect('/');
          } else {
            res.redirect('/login');
          }
        }
      }
    });

app.post('/logout', function(req,res){
  req.session.userData = [];
  res.redirect('/login')
})





  // For new users to signup
  app.get('/signup', function(req, res) {
    res.render('signup');
  });

  app.post('/signup', function(req, res) {

      let credInfo = req.body;
      data.push(credInfo);
      res.redirect('/login');
    });


    // make express listen on port 3000
    app.listen(3000);
