<?php

/**
 * Choose photos.
 */
function checkin_choose_photos() {
  drupal_add_css(drupal_get_path('module', 'checkin') . '/css/checkin.css');
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
      $('#fb-albums').addClass('active');
      //$('#page-title').hide();
    });

    window.fbAsyncInit = function() {
        FB.init({
          appId  : '$apiKey',
          status : true, // check login status
          cookie : true, // enable cookies to allow the server to access the session
          session: $json_session, 
          xfbml  : true  // parse XFBML
        });

        FB.Canvas.setAutoResize();
        getAlbums();
    };
    </script> 
    <ul id="tab-nav">
      <li> 
        <a href="#select-photos">Select Photos</a>
      </li>
      <li> 
        <a href="#review-photos">Review</a>
      </li>
    </ul>

    <div id='total-review-photos'></div> 
    
    <div id='select-photos' class='tab-el active'>
      <ul id='fb-albums' class= 'tab-child'>
        <h1></h1>
      </ul>
      <ul id='fb-photos' class='tab-child'>
        <div id='show-all-albums'>
          <button>แสดงทุกอัลบัม</button> 
        </div>
        <h1></h1>
      </ul>
    </div>

    <div id='review-photos' class='tab-el' >
      <button id='send-photo'>Send!</button>
    </div>
    <div id='server-result' class='tab-el'></div>

FBJS;
  
  return $output;
}
