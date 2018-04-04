var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  port : '8889',
  user     : 'root',
  password : 'root',
  database : 'chatroom'
});

connection.connect();

const express = require('express')
const app = express()
app.use(express.static('public'));

// =====================================

var http = require('http').Server(app);
var bodyParser = require('body-parser');

// Add this line below
app.use(bodyParser.urlencoded({ extended: false })) 

app.use(bodyParser.json());

app.post('/signup', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var email = req.body.email;
    var error = ""

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

            connection.query('INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, NULL, NOW())',
            [firstname, lastname, pseudo, password, email],
                function (error, results, fields) {
                    if(error){
                        throw error;
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

app.post('/login', function(req, res) {
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var error = ""


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
                function (error, results, fields) {
                    if (results){
                       console.log("Connected!");
                    }
                    if (error) {
                        throw error;}
                    res.redirect("/");
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
            error:""
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
            error:""
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
