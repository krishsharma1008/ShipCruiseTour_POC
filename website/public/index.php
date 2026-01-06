<?php

// echo ' HELLO ';
// echo $_SERVER['REDIRECT_URL'];
// echo '<pre>'; echo var_dump($_SERVER); echo'</pre>';

// define("ROOT_PATH",dirname(__DIR__));

// Define DS if not already defined (will be checked again in autoLoad.php)
if (!defined('DS')) {
    define("DS", DIRECTORY_SEPARATOR);
}
require_once(dirname(__DIR__) . DS . 'public' . DS . 'autoLoad.php');

// new app();

