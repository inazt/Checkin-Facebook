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
      $('#li-show-all-albums').hide();  
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
      <li id='li-show-all-albums'> 
        <a id="show-all-albums" >แสดงอัลบัมทั้งหมด</a>
      </li>
      <li> 
        <a href='#review-photos'>จำนวนรูปที่เลือก<span id='total-review-photos'></span></a>
      </li>
    </ul>
    <div style='clear:left'></div> 
    <div id='select-photos' class='tab-el active'>
      <div id='fb-albums' class= 'tab-child'>
        <h3>เลือกอัลบัม</h3>
      </div>
      <div id='fb-photos' class='tab-child'>
        <div id='album-photos'></div>
      </div>
    </div>
 
    <div id='review-photos' class='tab-el' >
      <button id='send-photo'>Send!</button>
    </div>
    <div id='server-result' class='tab-el'></div>

FBJS;
  
  return $output;
}
