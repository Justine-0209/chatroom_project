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
const fileUpload = require('express-fileupload');
const app = express()
app.use(express.static('public'));
app.use(fileUpload());

// Sessions
var session = require('express-session')({
    secret: "dsafjiqewfjewof", 
    saveUninitialized: false, 
    resave: false}
);
app.use(session);

// Socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);
ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

io.use(function(socket, next) {
    session(socket.request, socket.request.res, next);
});

io.on("connection", function(socket){
    console.log("nouvelle connexion au serveur de WS!");

    socket.on('chat_message', function (data) {
        console.log(socket.request.session);
        message = ent.encode(data);
        var user_id = socket.request.session.user.user_id;
        var message_content = message;
        connection.query('INSERT INTO message VALUES (NULL, ?, ?, NOW(), NULL )',
            [user_id, message_content],
                function (err, results, fields) {
                    if(err){
                        throw err;
                    }
                });
        io.emit("chat_message", {message: message, pseudo: socket.request.session.user.pseudo});
    });
})



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
                function (err, results, fields) {
                    if(err){
                        throw err;
                    }
                    res.redirect("/all-chatrooms");
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
                       req.session.user=results[0];
                       res.redirect("/all-chatrooms");
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

// create chatroom page
app.post('/create-chatroom', function(req, res) {
    var chatroom_title = req.body.chatroom_title;
    var chatroom_decription = req.body.chatroom_description;
    var pseudo = req.body.guest;
    var master_user_id= req.session.user.user_id;
    var error = ""

    var picture_name=req.files.chatroom_picture.name;
    var chatroom_picture=req.files.chatroom_picture;

    if (chatroom_title == ""){
        error = "Please enter a title for your chatroom"
    }

    if (pseudo == ""){
        error = "Please enter a guest pseudo"
    }

    if (!req.files){
        error = 'No files were uploaded.'
    }
   
    console.log(req.files.chatroom_picture);
    
    if (error == ""){
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        let chatroom_picture = req.files.chatroom_picture;
            
        // Use the mv() method to place the file somewhere on your server
        chatroom_picture.mv('public/images/chatroom/'+picture_name, function(err) {
            if (err){
                return res.status(500).send(err);
            }
            connection.query(
                'INSERT INTO chatroom VALUES (NULL, ?, ?, ?, NOW(), ?)',
                [chatroom_title, chatroom_decription, picture_name, master_user_id],
                function (err, results, fields) {
                    if(err){throw err;}
                    res.redirect("/chatroom?id=" + results.insertId);
                }
            );   
        })
    }
    else{
        res.render('create-chatroom.ejs', {error:error});
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
        req.session.user=null;
        console.log('Disconnected');
        res.redirect('/');
    });

    // =====================================
    // ALL CHATROOMS =======================
    // =====================================
    // show all the chatrooms
    app.get('/all-chatrooms', function(req, res) {

        console.log(req.session.user.pseudo)
        console.log(req.session.user.chatroom_id)

        connection.query(
            'SELECT * FROM chatroom',
            function (err, results, fields) {
                console.log(results)
                if (results.length>0){
                    res.render('all-chatrooms.ejs', {
                        connect:"Log out",
                        results:results,
                        pseudo:req.session.user.pseudo
                    });
                }
                else{ res.send('no result')}
                if (err) {throw err;}   
            });
        });

    // =====================================
    // CREATE CHATROOMS ====================
    // =====================================
    // show all the chatrooms
    app.get('/create-chatroom', function(req, res) {
        res.render('create-chatroom.ejs', {
            connect:"Log out",
            pseudo:req.session.user.pseudo,
            message:req.session.user.message_content,
        });
    });

    // =====================================
    // CHATROOMS ===========================
    // =====================================
    // show all the chatrooms
    app.get('/chatroom', function(req, res) {
        // render the page and pass in any flash data if it exists
        
        console.log(req.session.user.pseudo)
        console.log(req.query.id)

        connection.query(
            'SELECT * FROM chatroom WHERE chatroom_id=?',
            [req.query.id],
            function (err, results, fields) {
                console.log(results)
                if (results.length>0){
                    chatroom_title=results[0].title;
                }
                if (err) {throw err;}
                else{
                    console.log(chatroom_title)
                    res.render('chatroom.ejs', {
                        connect:"Log out",
                        chatroom_title:chatroom_title,
                        pseudo:req.session.user.pseudo
                    });
                }   

                //select from
                
            });
        });

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
