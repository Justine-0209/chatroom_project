<?php
    $title='Inscription';
    session_start();

    ini_set("display_errors",1);
    include("../db.php");




    //var_dump($movie);        

    $error = "";
    //print_r($_POST);
    

      //traiter le form
    if (!empty($_POST)){
            $pseudo = $_POST["pseudo"];
            $password = $_POST["password"];
            $confirm_password = $_POST["confirm_password"];
            $email = $_POST["email"];
    
            // Doublon pseudo 
            $sql = "SELECT * FROM users
            WHERE pseudo = :pseudo";

            $stmt = $dbh -> prepare($sql);
            $stmt -> execute([":pseudo" => $pseudo,]); //on la remplace ensuite dans $id.
            $user = $stmt -> fetch();

            if (empty($user)){
            $error = "";
            } //si le username est libre -> c'est bon

            else {
                $error = 'ce pseudo existe déjà';
            }

            // Doublon email
            $sql = "SELECT * FROM users
            WHERE email = :email";

            $stmt = $dbh -> prepare($sql);
            $stmt -> execute([":email" => $email,]);
            $user = $stmt -> fetch();

            if (empty($user)){
            $error = "";
            } //si le mail est libre -> c'est bon

            else {
                $error = 'cet email est déjà utilisé fucker';
            }


            //valide les données
                //nom renseigné ?
            if (empty($pseudo)){
                $error = "veuillez renseigner un pseudo";
            }
    
            if (empty($password)){
                $error = "veuillez renseigner un mot de passe";
            }
    
            if (empty($confirm_password)){
                $error = "veuillez confirmer votre mot de passe";
            }

            if ( $_POST['confirm_password'] != $_POST['password'] ) {
                
            $error = '<span style="color:red; font-weight:normal;">Les 2 mots de passe sont différents! </span>';
           }

            if (empty($_POST['email']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {     
                         $error = 'Veuillez saisir une adresse e-mail valide.';
            }

    
            //si les données sont valides
            if ($error == ""){
                //ajout dans la bdd
                /*
                INSERT INTO booking 
                VALUES 
                (NULL, 'guillaume', '2018-01-01', 12, '0634444444', 'près de la fenêtre svp', NOW())
                */
                $sql = "INSERT INTO users 
                        VALUES (NULL, :pseudo, :password, 
                        :confirm_password, :email, NOW())";
    
                $stmt = $dbh->prepare($sql);
                $stmt -> execute([
                    ":pseudo" => $pseudo,
                    ":password" => $password, 
                    ":confirm_password" =>$confirm_password,
                    ":email" =>$email,
                ]);
                $_SESSION["isConnected"]= true;
                echo header("Location: ../index.php");
    
                //afficher un message de succès
                //redirige
            }}

?>









<!DOCTYPE html>
<html lang="fr">
    <head>
        <title><?php echo $title; ?></title>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="../css/bootstrap/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">
        <link rel="stylesheet" href="../css/styles.css" >
    </head>
    
    <body>
        <?php include('../layer/header.php');?>

        <!-- afficher le formulaire --> 
        <form class="form" method="post" action="register.php">

        <label>Pseudo</label>
        <input type="username" name="pseudo">

        <label>Email</label>
        <input type="email" name="email">

        <label>Mot de passe</label>
        <input type="password" name="password" />

        <label>Confirmation mot de passe</label>
        <input type="password" name="confirm_password" />

        <div class="boutonForm">
            <button>Je m'inscris !</button>
        </div>
<?php echo $error ?>
    </form>

        
        <?php include'../layer/footer.php';?>
    </body>
</html>