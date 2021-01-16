<?php
if (file_put_contents('../db/todo.db', json_encode(($_POST['zadaci'])))) {
  echo 'Uspješan upis u bazu';
} else {
  echo 'Nešto nije bilo u redu sa upisom u bazu...';
}
