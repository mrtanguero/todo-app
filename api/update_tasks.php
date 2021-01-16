<?php
if (file_put_contents('../todo.db', json_encode(($_POST['zadaci'])))) {
  echo 'SUCCESS';
} else {
  echo json_encode(($_POST['zadaci']));
  echo 'ZLO I NAOPAKO (vjerovatno opet đavolji permissioni)!';
}
