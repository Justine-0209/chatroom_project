// connection to BDD
var mysql = require('mysql');
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
const fileUpload = require('express-fileupload');
app.use(express.static('public'));
app.use(fileUpload());

// Sessions
var session = require('express-session')({
    secret: "dsafjiqewfjewof", 
    saveUninitialized: false, 
    resave: false}
);
app.use(session);

// Bodyparser - For Forms
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json());



// =====================================
// SOCKET.IO ===========================
// =====================================
var http = require('http').Server(app);
var io = require('socket.io')(http);
ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

io.use(function(socket, next){
    var handshake = socket.handshake;
    console.log(handshake.query);
    console.log("Query: ", socket.handshake.query);
    session(socket.request, socket.request.res, next);
    next();
});

io.on("connection", function(socket){
    console.log("nouvelle connexion au serveur de WS!");

    socket.on('chat_message', function (data) {
        console.log(socket.request.session);
        console.log("message envoyé !");
        message = ent.encode(data);
        var user_id = socket.request.session.user.user_id;
        var message_content = message;
        var chatroom_id = socket.handshake.query.chatroom_id;
        var message_id;

        connection.query('INSERT INTO message VALUES (NULL, ?, ?, NOW(), ? )',
            [user_id, message_content, chatroom_id],
                function (err, results, fields) {
                    if(err){
                        throw err;
                    }
                    message_id=results.insertId,
                    console.log(message_id);
                });
                
        io.emit("chat_message", {message: message, pseudo: socket.request.session.user.pseudo, picture: socket.request.session.user.picture, message_id:message_id,chatroom_id:socket.handshake.query.chatroom_id});
    });
})



// =====================================
// HOME PAGE (with login links) ========
// =====================================

// GET =================
app.get('/', function(req, res) {
    res.render('index.ejs');
});



// =====================================
// SIGNUP ==============================
// =====================================

// POST =================
app.post('/signup', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var email = req.body.email;
    var error = ""

    
    // if empty fields
    if (firstname == ""){error = "Please enter your firstname"}

    if (lastname == ""){error = "Please enter your lastname"}

    if (pseudo == ""){error = "Please enter your pseudo"}

    if (password == ""){error = "Please enter your password"}

    if (confirm_password == ""){error = "Please confirm your password"}

    if (email == ""){error = "Please enter your email"}

    // matching passwords
    if (confirm_password != password){ error = "Your passwords don't match"}

    if (error == ""){
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        var profile_picture=req.files.profile_picture;
              
        if (typeof profile_picture !=="undefined" && profile_picture){
            var picture_name=req.files.profile_picture.name;
            // Use the mv() method to place the file somewhere on your server
            profile_picture.mv('public/images/profile/'+picture_name, function(err) {
                if (err){
                    return res.status(500).send(err);
                } 
            
                connection.query('INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, ?, NOW())',
                [firstname, lastname, pseudo, password, email, picture_name],
                function (err, results, fields) {
                        if(err){throw err;}
                        res.redirect("/login");
                }); 
            });
        }
        else {
            connection.query('INSERT INTO user VALUES (NULL, ?, ?, ?, ?, ?, NULL, NOW())',
            [firstname, lastname, pseudo, password, email],
            function (err, results, fields) {
                        if(err){throw err;}
                        res.redirect("/login");
            }); 
        }
    }
    else{
        res.render('signup.ejs', {
            error:error,
            connect:"",
        });
    }
});

// GET =================
app.get('/signup', function(req, res) {
    res.render('signup.ejs', {
        error:""
    });
});



// =====================================
// LOGIN ===============================
// =====================================

// POST =================
app.post('/login', function(req, res) {
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var error = ""

    // =====================================
    // if empty fields
    if (pseudo == ""){error = "Please enter your pseudo"}

    if (password == ""){error = "Please enter your password"}

    if (error == ""){
        // =====================================
        // connection to the database
            connection.query('SELECT * FROM user WHERE pseudo=? and password=?',
            [pseudo, password],
            function (err, results, fields) {
                if (results.length>0){
                    console.log("Connected!");
                    console.log(pseudo);
                    req.session.user=results[0];
                    res.redirect("/all-chatrooms");
                }
                else{
                    res.render('login.ejs', {
                        error:"wrong password or pseudo",
                        connect:"",
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

// GET =================
app.get('/login', function(req, res) {
    res.render('login.ejs', {
        error:"",
        connect:""
    });
});



// =====================================
// LOGOUT ==============================
// =====================================

// GET =================
app.get('/logout', function(req, res) {
    req.session.user=null;
    console.log('Disconnected');
    res.redirect('/');
});



// =====================================
// CREATE CHATROOMS ====================
// =====================================

// POST =================
app.post('/create-chatroom', function(req, res) {
    var chatroom_title = req.body.chatroom_title;
    var chatroom_decription = req.body.chatroom_description;
    var master_user_id= req.session.user.user_id;
    var error = ""

    if (chatroom_title == ""){error = "Please enter a title for your chatroom"}

    if (chatroom_decription == ""){error = "Please enter a description for your chatroom"}
    if (!req.files){error = 'No files were uploaded.'}
    
   
    console.log(req.files.chatroom_picture);
    
    if (error == ""){
        console.log("1");
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        var chatroom_picture=req.files.chatroom_picture;

        if (typeof chatroom_picture !=="undefined" && chatroom_picture){
            console.log("2");
            var picture_name=req.files.chatroom_picture.name;
            // Use the mv() method to place the file somewhere on your server
            chatroom_picture.mv('public/images/chatroom/'+picture_name, function(err) {
                if (err){
                    return res.status(500).send(err);
                    console.log("3");
                }
                connection.query(
                    'INSERT INTO chatroom VALUES (NULL, ?, ?, ?, NOW(), ?)',
                    [chatroom_title, chatroom_decription, picture_name, master_user_id],
                    function (err, results, fields) {
                        console.log("/chatroom?id=" + results.insertId);
                        if(err){throw err;}
                        res.redirect("/chatroom?id=" + results.insertId);
                    }
                );   
            })
        }
        else {
            console.log("5");
            res.render('create-chatroom.ejs', {
                error:"Missing Picture",
                connect:""
            });
        }
    }
    else{
        console.log("6");
        res.render('create-chatroom.ejs', {
            error:error,
            connect:""
        });
    }
});

// GET =================
app.get('/create-chatroom', function(req, res) {
    res.render('create-chatroom.ejs', {
        connect:"Log out",
        pseudo:req.session.user.pseudo,
        message:req.session.user.message_content,
        error:""
    });
});



// =====================================
// ALL CHATROOMS =======================
// =====================================

// GET =================
app.get('/all-chatrooms', function(req, res) {

    console.log(req.session.user.pseudo)

    connection.query(
        'SELECT * FROM chatroom',
        function (err, results, fields) {
            if (results.length>0){
                res.render('all-chatrooms.ejs', {
                    connect:"Log out",
                    results:results,
                    pseudo:req.session.user.pseudo,
                    master_user_id:req.session.user.user_id
                });
            }
            else{ res.render('create-chatroom.ejs')}
            if (err) {throw err;}   
        });
    });


    
// =====================================
// DELETE CHATROOM =====================
// =====================================

// GET =================
app.get('/delete-chatroom', function(req, res) {
    connection.query(
        'DELETE FROM chatroom WHERE chatroom_id=?',
        [req.query.id],
        function (err, results, fields) {
            console.log(results)
            if (results.length>0){
                res.render('all-chatrooms.ejs', {
                    connect:"Log out",
                    results:results,
                    pseudo:req.session.user.pseudo,
                });
            }
            else{ res.render('all-chatroom.ejs')}
            if (err) {throw err;}   
        });
    res.redirect('/all-chatrooms');
});




// =====================================
// CHATROOM ============================
// =====================================

// GET =================
app.get('/chatroom', function(req, res) {
    console.log(req.session.user.pseudo)
    console.log(req.query.id)

    var user_id=req.session.user.user_id;

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
                connection.query(
                    'SELECT * FROM message JOIN user ON message.user_id=user.user_id WHERE chatroom_id=? ORDER BY message_id',
                    [req.query.id],
                    function (err, results2, fields) {
                        console.log(results2)
                        if (err) {throw err;}
                        else{
                            res.render('chatroom.ejs', {
                                results:results2,
                                chatroom_title:chatroom_title,
                                connect:"Log out",
                                pseudo:req.session.user.pseudo,
                                chatroom_id:req.query.id,
                                message_id:results[0].message_id,
                                user_id:user_id
                            });
                        }
                    });
                }
            }   
    );
});   



// =====================================
// DELETE MESSAGE ======================
// =====================================

// GET =================
app.get('/delete-message', function(req, res) {
    connection.query(
        'DELETE FROM message WHERE message_id=?',
        [req.query.id],
        function (err, results, fields) {
            if (err) {throw err;}   
        });
    res.redirect('/chatroom?id='+req.query.id_chatroom );
});



// =====================================
// PROFILE PAGE ========================
// =====================================

// GET =================
app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.session.user.pseudo)
    var pseudo = req.session.user.pseudo;

    connection.query(
        'SELECT * FROM user WHERE pseudo=?',
        [pseudo],
        function (err, results, fields) {
        console.log(results)
        if (results.length>0){
            res.render('profile.ejs', {
                connect:"Log out",
                results:results,
                pseudo:req.session.user.pseudo,
                user:req.session.user.user_id
            });
        }
        else{ res.render('profile.ejs')}
        if (err) {throw err;}   
});
});



// =====================================
// EDIT PROFILE ========================
// =====================================

// POST =================
app.post('/edit-profile', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pseudo = req.body.pseudo;
    var password = req.body.password;
    var confirm_password = req.body.confirm_password;
    var email = req.body.email;
    var error = ""

    var user_id = req.session.user.user_id;


    if (firstname == ""){ error = "Please enter your firstname"}

    if (lastname == ""){ error = "Please enter your lastname"}

    if (pseudo == ""){error = "Please enter your pseudo"}

    if (password == ""){error = "Please enter your password"}

    if (confirm_password == ""){error = "Please confirm your password"}

    if (email == ""){error = "Please enter your email"}

    if (error == ""){
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        var edit_profile_picture=req.files.edit_profile_picture;
                    
        
        if (typeof edit_profile_picture !=="undefined" && edit_profile_picture){
            var picture_name=req.files.edit_profile_picture.name;
            // Use the mv() method to place the file somewhere on your server
            edit_profile_picture.mv('public/images/profile/'+picture_name, function(err) {
                if (err){
                    return res.status(500).send(err);
                }
            connection.query(
                'UPDATE user SET firstname=?, lastname=?, pseudo=?, password=?, email=?, picture=? WHERE user_id=?',
                [firstname, lastname, pseudo, password, email, picture_name, user_id],
                function (err, results, fields) {
                    if(err){throw err;}
                    res.redirect("/profile");
                }); 
            });
        }
        else {
            connection.query(
                'UPDATE user SET firstname=?, lastname=?, pseudo=?, password=?, email=? WHERE user_id=?',
                [firstname, lastname, pseudo, password, email, user_id],
                function (err, results, fields) {
                    if(err){throw err;}
                    res.redirect("/profile");
                });
        }
    }
    else{
        res.render('profile.ejs', {
            error:error
        });
    }
});

// GET =================
app.get('/edit-profile', isLoggedIn, function(req, res) {
    console.log(req.session.user.pseudo)
    var user_id = req.session.user.user_id;

    connection.query(
        'SELECT * FROM user WHERE user_id=?',
        [user_id],
        function (err, results, fields) {
        console.log(results)
        if (results.length>0){
            res.render('edit-profile.ejs', {
                connect:"Log out",
                error:"",
                results:results,
                pseudo:req.session.user.pseudo,
                user:req.session.user.user_id
            });
        }
        else{ res.render('profile.ejs')}
        if (err) {throw err;}
    });
});



// =====================================
// INVITATIONS =========================
// =====================================

// GET =================
app.get('/invitations', function(req, res) {
    res.render('invitations.ejs', {
        connect:"Log out",
        pseudo:req.session.user.pseudo
    });
});






http.listen(3000, function(){
  console.log('listening on *:3000');
});


//=======================================
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.session.user!=null)
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
