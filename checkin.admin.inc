<?php

/**
 * Settings form.
 */
function checkin_settings_form() {
  $form['checkin_app_api_key'] = array(
    '#type' => 'textfield',
    '#title' => t('API key'),
    '#description' => t('Enter API Key from <a href="http://www.facebook.com/developers/apps.php">your application</a>'),
    '#default_value' => variable_get('checkin_app_api_key', ''),
  );
  $form['checkin_app_secret_key'] = array(
    '#type' => 'textfield',
    '#title' => t('Application secret'),
    '#description' => t('Enter application secret key from <a href="http://www.facebook.com/developers/apps.php">your application</a>'),
    '#default_value' => variable_get('checkin_app_secret_key', ''),
  );
  $form['checkin_image_path_directory'] = array(
    '#type' => 'textfield',
    '#title' => t('Image path directory'),
    '#description' => t('Enter image path directory.'),
    '#default_value' => variable_get('checkin_image_path_directory', CHECKIN_DEFAULT_IMAGE_PATH),
  );
  $form['checkin_qrdecode_service_url'] = array(
    '#type' => 'textfield',
    '#title' => t('QR service URL'),
    '#description' => t('Enter service url.'),
    '#default_value' => variable_get('checkin_qrdecode_service_url', 'http://203.151.20.185/decode/'),
  );
  $form['min_supporters'] = array(
    '#type' => 'textfield',
    '#title' => t('Minimum user to verify custom place'),
    '#description' => t('Enter minimum verifyer:'),
    '#default_value' => variable_get('min_supporters', 5),
  
  );
  return system_settings_form($form);
}

/**
 * Overview manage places.
 */
function checkin_places_overview() {

  $rows = array();
  $result = db_query("SELECT nid FROM {node} WHERE type = 'places' ORDER BY created DESC");
  while ($row = db_fetch_object($result)) {
    $node = node_load($row->nid);
    $rows[] = array(
      $row->nid,
      $node->title,
      l(t('Edit'), 'node/'. $node->nid .'/edit'),
      l(t('Delete'), 'node/'. $node->nid .'/delete'),
    );
  }
  
  $headers = array(
    'Node ID',
    'Place name',
    'Edit', 
    'Delete',
  );
  
  $options = array('query' => array('destination' => $_GET['q']));
  
  if (empty($rows)) {
    $rows[] = array(
      array(
        'colspan' => count($headers),
        'data' => t('There are no places yet. <a href="!url">Add new place</a>.', array('!url' => url('node/add/places', $options))),
      ),
    );
  }
  
  $output = l(t('Add new place'), 'node/add/places', $options);
  $output .= theme('table', $headers, $rows);
  
  return $output;
}

/**
 * Overview manage checkin.
 */
function checkin_checkin_overview() {

  $rows = array();
  $result = db_query("SELECT * FROM {checkin} ORDER BY status_updated DESC");
  while ($row = db_fetch_object($result)) {
    $node = node_load($row->nid);
    $rows[] = array(
      $row->nid,
      $node->title,
      l(t('Edit'), 'node/'. $node->nid .'/edit'),
      l(t('Delete'), 'node/'. $node->nid .'/delete'),
    );
  }
  
  $headers = array(
    'Node ID',
    'Place name',
    'Edit', 
    'Delete',
  );
  
  $options = array('query' => array('destination' => $_GET['q']));
  
  if (empty($rows)) {
    $rows[] = array(
      array(
        'colspan' => count($headers),
        'data' => t('There are no places yet. <a href="!url">Add new place</a>.', array('!url' => url('node/add/places', $options))),
      ),
    );
  }
  
  $output = l(t('Add new place'), 'node/add/places', $options);
  $output .= theme('table', $headers, $rows);
  
  return $output;
}
