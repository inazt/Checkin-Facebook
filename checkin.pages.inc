<?php

/**
 * Choose photos.
 */
function checkin_choose_photos() {
  drupal_add_css(drupal_get_path('module', 'checkin') . '/css/checkin.css');
  drupal_add_js(array('checkin' =>  array('path' => base_path().drupal_get_path('module', 'checkin'))), 'setting');
  // Check login.
  //echo(print_r($_REQUEST, 1). print_r($_SERVER, 1));

  $me = checkin_facebook_login();
  $apiKey = variable_get('checkin_app_api_key', ''); 
  $facebook = checkin_facebook();
  $session = $facebook->getSession(); 
  $json_session = json_encode($session);
  drupal_add_js(drupal_get_path('module', 'checkin') . '/checkin.js');
  $output = <<<FBJS
    <script type="text/javascript"> 

    (function($) {
        $('body').append($('<div id="fb-root"></div>'));
        var e = document.createElement('script');
        e.async = true;
        e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
        document.getElementById('fb-root').appendChild(e);
      })(jQuery);
    
    $(document).ready(function() {
      set_state(1); 
      loading = img.clone().attr({src: Drupal.settings.checkin.path +'/images/loading.gif'});
      $('#fb-albums').addClass('active');

      update_review_photo();
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
    <div class='checkin-header'><a href='/checkin' id='logo'>เช็คอินที่เที่ยวเหนือ</a></div>
    <div class='every-page-item selected-photos'>จำนวนรูปที่เลือก<span id='total-review-photos'></span></div>
    <div class="tab-nav-wrapper">
      <ul class="tab-nav">
        <li class='show-all-albums-wrap'> 
          <button class="show-all-albums" >กลับไปอัลบั้ม</button>
        </li>
        <li class='go-review-button-wrap'>
          <button class="go-review-button">ขั้นตอนต่อไป</button>
        </li> 
        <li class='back-all-albums-wrap'>
          <button class="show-all-albums">เลือกรูปเพิ่ม</button>
        </li>  
        <li class='go-checkin-wrap'>
          <button class="go-checkin">เช็คอิน</button>
        </li>             

      </ul>  
    </div>
    <div style='clear:left'></div> 
    <div id='select-photos' class='tab-el active'>
      <div id='fb-albums' class= 'tab-child'>
        <h3 class='first-page-item choose-album'>เลือกอัลบัม</h3>
        <div id='album_content'></div>
      </div>
      <div id='fb-photos' class='tab-child'>
        <h3 class='choose-photo'>เลือกรูป</h3>
        <div id='album-photos'></div>
      </div> 
    </div>
 
    <div id='review-photos' class='tab-el' >
      <h3 class='review-photo-for-send'>รูปทั้งหมดที่ต้องการส่ง</h3>
    </div>
    
    <div id='server-result' class='tab-el'></div>
    <div class="tab-nav-wrapper">
      <ul class="tab-nav">
        <li class='show-all-albums-wrap'> 
          <button class="show-all-albums" >กลับไปอัลบั้ม</button>
        </li>
        <li class='go-review-button-wrap'>
          <button class="go-review-button">ขั้นตอนต่อไป</button>
        </li>     
        <li class='back-all-albums-wrap'>
          <button class="show-all-albums">เลือกรูปเพิ่ม</button>
        </li>
        <li class='go-checkin-wrap'>
          <button class="go-checkin">เช็คอิน</button>
        </li> 

      </ul>     
    </div>
FBJS;
  
  return $output;
}
