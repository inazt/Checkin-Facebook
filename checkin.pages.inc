<?php

/**
 * Choose photos.
 */
function checkin_choose_photos() {
  // Check login.
  $me = checkin_facebook_login();
  $apiKey = variable_get('checkin_app_api_key', ''); 
  $facebook = checkin_facebook();
  $session = $facebook->getSession(); 
  $json_session = json_encode($session);
  drupal_add_js(drupal_get_path('module', 'checkin') . '/fb.nat.js');
  $output = <<<FBJS
    <script type="text/javascript"> 

    (function() {
        $('body').append($('<div id="fb-root"></div>'))
        var e = document.createElement('script'); e.async = true;
        e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
      }());

    $(document).ready(function() { 
      $('#All-Albums').hide();
      $('#fb-photos').hide();
      $('#page-title').hide();
    });

    window.fbAsyncInit = function() {
        FB.init({
          appId  : '$apiKey',
          status : true, // check login status
          cookie : true, // enable cookies to allow the server to access the session
          session: $json_session, 
          xfbml  : true  // parse XFBML
        });

        getAlbums();
    };
    
    
    </script> 

    
    <div id='fb-albums'>
      <h1>Select Albums</h1>
    </div>
    <div id='fb-photos'>
      <h1>Choose Photos</h1>
    </div>
    <div id='All-Albums'>
      <button>Show All Albums</button> 
    </div>

    <div id='review-photos'></div>
      <button id='send-photo'>Send!</button>
    <div id='server-result'></div>

FBJS;
  
  return $output;
}
