<?php
    $postdata = file_get_contents("php://input");
    $location = $_SERVER['DOCUMENT_ROOT'] . '/bethsartisanpies/admin/data/site-data.json';
    if (is_writable($location)) {
        file_put_contents($location, $postdata);
        echo 'File written';
    }
    else {
        http_response_code(403);
        echo $location . ' not writable';
    }
?>