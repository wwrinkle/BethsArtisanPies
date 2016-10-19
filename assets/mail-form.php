<?php 
    require 'PHPMailer-master/PHPMailerAutoload.php';
    date_default_timezone_set('America/Chicago');
    $data = json_decode(file_get_contents( 'php://input'));
    
    $mail = new PHPMailer;                             

    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = [User Name];
    $mail->Password = [Password];
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    $mail->setFrom('orders@bethsartisanpies.com', "Beth's Artisan Pies Online Order");
    $site_data = json_decode(file_get_contents("../data/site-data.json"));
    $mail->addAddress($site_data->contact->email);

    $mail->isHTML(true);

    $mail->Subject = "Beth's Artisan Pies Online Order";

    $mail->Body    = '<table style="width:100%;">' .
        '<tr><td><b>Name:</b></td><td>' . $data->name . '</td></tr>' .
        '<tr><td><b>Email:</b></td><td>' . $data->email . '</td></tr>' .
        '<tr><td><b>Phone:</b></td><td>' . $data->phone . '</td></tr>' .
        '<tr><td valign="top"><b>Message:</b></td><td>' . $data->message . '</td></tr></table>';

    if(!$mail->send()) {
        http_response_code(400);
        echo 'Message could not be sent.';
        echo 'Mailer Error: ' . $mail->ErrorInfo;
    } else {
        http_response_code(200);
        echo 'Message has been sent';
    }
?>