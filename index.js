// connection to BDD
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port : '8889',
  user     : 'root',
  password : 'root',
  database : 'chatroom'
});
connection.connect();

// Express
const express = require('express')
const app = express()
app.use(express.static('public'));

// Sessions
var session = require('express-session')({
    secret: "dsafjiqewfjewof", 
    saveUninitialized: false, 
    resave: false}
);

// Socket.io
var http = require('http').Server(app);

// Bodyparser - For Forms
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json());

// signup page
app.post('/signup', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var email = req.body.email;
    var error = ""
    var connect = ""

    // =====================================
    // if empty fields

    if (firstname == ""){
        error = "Please enter your firstname"
    }

    if (lastname == ""){
        error = "Please enter your lastname"
    }

    if (pseudo == ""){
        error = "Please enter your pseudo"
    }

    if (password == ""){
        error = "Please enter your password"
    }

    if (confirm_password == ""){
        error = "Please confirm your password"
    }

    if (email == ""){
        error = "Please enter your email"
    }

    // =====================================
    // matching passwords

    if (confirm_password != password){
        error = "Your passwords don't match"
    }

    if (error == ""){
        // =====================================
        // connection to the database
            connect:"";
            connection.query('INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, NULL, NOW())',
            [firstname, lastname, pseudo, password, email],
                function (err, results, fields) {
                    if(err){
                        throw err;
                    }
                    res.redirect("/");
                });      
    }
    else{
        res.render('signup.ejs', {
            error:error
        });
    }
});

// login page
app.post('/login', function(req, res) {
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var error = ""
    var connect = ""

    // =====================================
    // if empty fields
    if (pseudo == ""){
        error = "Please enter your pseudo"
    }

    if (password == ""){
        error = "Please enter your password"
    }

    if (error == ""){
        // =====================================
        // connection to the database
            connection.query('SELECT * FROM user WHERE pseudo=? and password=?',
            [pseudo, password],
                function (err, results, fields) {
                    if (results.length>0){
                       console.log("Connected!");
                       app.use(session);
                       res.redirect("/");
                       connect:"";
                    }
                    else{
                        res.render('login.ejs', {
                            error:"wrong password or pseudo"
                        });
                    }
                    if (err) {
                        throw err;}
                    
                });      
    }
    else{
        res.render('login.ejs', {
            error:error
        });
    }
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            error:"",
            connect:""
        });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {
            error:"",
            connect:""
        });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
