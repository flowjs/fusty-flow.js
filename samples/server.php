<?php
echo json_encode([
    'success' => true,
    'files' => $_FILES,
    'get' => $_GET,
    'post' => $_POST,
    //optional
    'resumableTotalSize' => isset($_FILES['file']) ? $_FILES['file']['size'] : $_GET['resumableTotalSize'],
    'resumableIdentifier' => isset($_FILES['file']) ? $_FILES['file']['name'] . '-' . $_FILES['file']['size']
        : $_GET['resumableIdentifier'],
    'resumableFilename' => isset($_FILES['file']) ? $_FILES['file']['name'] : $_GET['resumableFilename'],
    'resumableRelativePath' => isset($_FILES['file']) ? $_FILES['file']['tmp_name'] : $_GET['resumableRelativePath'],
]);