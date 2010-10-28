  var current_jid, check_job_timer, current_state;
  var review_photos = { } 
  var album_detail = { }
  var div = $('<div />');
  var img = $('<img />'); 
  var p = $('<p />');
  var i = $('<i />');
  var li = $('<li />');
  var h3 = $('<h3 />');
  var span = $('<span />');
  var loading ;

  Photo = {
    Album: { 
      getAlbums: function(owner_id) {
        var getAlbumsFql = 'SELECT aid, object_id, name, cover_pid, size, link, visible, description, created, modified ' + 
                           'FROM album WHERE owner = {0}';
        var getAlbumPhotoFql = 'SELECT aid, pid, src, src_small, src_big, link, caption FROM photo WHERE pid ' +  
                               'IN (SELECT cover_pid FROM album WHERE owner = {0}) ORDER BY modified DESC';
        var albums = FB.Data.query(getAlbumsFql, owner_id);

        //a_photos = album_photos
        var a_photos = FB.Data.query(getAlbumPhotoFql, owner_id);

        return {album: albums, a_photo: a_photos};
      },
      getPhotos: function(aid) {
        var getPhotosFql = 'SELECT pid, object_id, src, src_small, src_big, link, created FROM photo ' + 
                           'WHERE aid = {0}';

        var photos = FB.Data.query(getPhotosFql, aid);

        return photos;
      }
    }, 
    get: function(pid) {
      var getPhotoFql = 'SELECT src, src_small, src_big, link, created FROM photo WHERE pid = {0}';
      var photo = FB.Data.query(getPhotoFql, pid);

      return photo;
    }, 
    graph: function(object_id) {

      return 'https://graph.facebook.com/'+object_id+'/picture?access_token='+FB._session['access_token']; 
    }
  }

function repaint() {
  $('.fb-picture-div').removeClass('hover');  
  $.each(review_photos, function(k, v) {
    var selector = "img[pid|='" +k + "']";
    $(selector).parent('div').addClass('hover');
  });
}

function job_status() {
  service_path = "/checkin/qr/job/" + current_jid + "/status";
  $.getJSON(service_path, {}, function (server_data) {
    $.each(server_data, function(k, data) {
      //if (data.status == true) {
        var output = '<ul>';
        $(data.data).each(function (i, item) {
          var pub = div.clone().html('Publish').addClass('publish-button');
          if (item.title == 'null') {
            pub.html('Decode failed');
          }
          var img_section  = img.clone().attr({src: item.path, pid: item.pid, info: item.content, title: item.title});
          var div_section = div.clone().addClass('server-item').append(img_section).append(pub);
          var div_info = div.clone().addClass('place-info').html(item.title + ':' +item.content);
          div_section.append(div_info);
          $('#server-result').show().append(div_section);
          output += '\
          <li> \
            <img src="' + item.path + '" />\
              <h2>' + item.title + '</h2>\
              <p>' + item.content + '</p>\
          </li> \
          ';
        }); // end each
        output += '</ul>';
        /*     
        $('body').append($(output));
        */
        clearInterval(check_job_timer);
      //} //end if
    }) //end each
  }); //end getJson
}

function getAlbums() {  
  var data = Photo.Album.getAlbums(FB.getSession().uid);
  $('#fb-albums').append(loading);

  FB.Data.waitOn([data.album, data.a_photo], function(args) {
    FB.Array.forEach(data.album.value , function(detail) {
      album_detail[detail.aid] = detail;
    })

    FB.Array.forEach(data.a_photo.value , function(album) {
      var aid = album.aid;
      //console.log(album, album.src, album.src_big, album.src_small);
      var detail = album_detail[aid];
      var div_section = li.clone().addClass('fb-album'); 
      var img_section = div.clone().addClass('fb-thumb').append(img.clone().attr({src: album.src, id: album.aid, class: 'album_cover', aid: aid}));
      var cover_section = div_section.append(img_section);

      var div_detail = 	div.clone().addClass('fb-album-detail').append(h3.clone().html(detail.name));
      div_detail.append(p.clone().html( 'จำนวน ' + detail.size +' รูป' ));
      cover_section.append(div_detail);
      $('#fb-albums').append(cover_section);
    })
  loading.remove();
  })
  //FB.Canvas.setSize();
} /// getPhotos

/***  Show All Photos In Album ***/
function showAlbum(aid) {
  var photos = Photo.Album.getPhotos(aid);  
  var album_content = $('#album_content');
  var div_img ;
  var album_name = album_detail[aid].name;
  
  //album_content.append(h3.clone().html(album_name).addClass('album-name'));
  $('.album_name').html(album_name);
  $('#fb-photos').append(loading);
  photos.wait(function(photo) {
    FB.Array.forEach(photos.value, function(photo) {
      var photo = img.clone().addClass('fb-picture').attr({src: photo.src, object_id: photo.object_id, pid: photo.pid, alt: photo.caption});
      div_img = div.clone().addClass('fb-picture-div');
      div_img.append(photo);
      album_content.append(div_img);
    })
    loading.remove();
    $('#album-photos').append(album_content);
    if ( $('div .hover').size() == 0 ) {
      repaint();
    }
    $( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
    FB.Canvas.setSize();
  })
} //end showAllbum(id)

function update_review_photo(operand) {
  operand = 1;
  $('#total-review-photos').html(' ('+ $("#review-photos img.fb-photo-review").size()+' รูป)');
}

function remove_review_photo(pid) { 
  delete(review_photos[pid]);
  var selector = '#review-photos img#' +pid
  $(selector).parent('div').hide('slow', function() { $(this).remove() })
}

 
$('.li-show-all-albums').live('click', function(e) { 
  $('#li-show-all-albums').hide();
  $('.second-page-item').hide();
  $('#fb-photos').hide();
  $('#fb-albums').show();
  $('#album_content').html('');
  //$('#album_content div.fb-picture-div').remove()
  $('#review-photos').hide();
  $('#select-photos').show();
  $( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
})

$('.go-review-button').live('click', function(e) {
  $('#review-photos').show();
  $('#fb-photos').hide();
  $('fb-albums').hide();

})


// Click for choose album
$('li.fb-album').live('click', function(e) {
  var self = $(this);
  var curr_img = (self.children('.fb-thumb').children('img'));
  //$('#tab-nav li a[href="#fb-photos"]').click();
  $('#li-show-all-albums').show();
  $('#fb-albums').hide();
  $('#fb-photos').show();
   
  $('.second-page-item').show();
  FB.Canvas.setSize({height: 0});
  
  showAlbum(curr_img.attr('id'));
})

$('.fb-picture-div').live('click', function(e) {
  //console.log('i do');
  var self = $(this);
  self= self.children('img')  
  var self_photo = self;
  var photos = Photo.get($(self).attr('pid'));

  self.parent('div').toggleClass('hover');

  photos.wait(function(photo) {
    var img_section = img.clone().attr({src: self.src}); 
    var pid = photo[0].pid;
    if(review_photos[pid] == undefined) {
      review_photos[pid] = 'src_big='+photo[0].src_big+"&"+'src_small='+self.get(0).src;
      var picture = img.clone().attr({src: self_photo.attr('src'), id: pid } ).addClass('fb-photo-review');
      var pic_containner = div.clone().addClass('review-photo').append(picture).append(img.clone().addClass('delete').attr({src: Drupal.settings.checkin.path +'/images/delete.png'}));
      
      $('#review-photos').append(pic_containner);
    }
    else {
      remove_review_photo(pid);
    }
      update_review_photo();
  }) //end wait
})

$('.delete').live('click', function(e) {
  var self = $(this);
  var rid = self.siblings('img').attr('id');
  remove_review_photo(rid);
  update_review_photo();  

}) 

$('.publish-button').live('click', function(e) {
  FB.Canvas.setSize({height: 500});
  var self = $(this);
  var img = $(self.siblings('img'));
  var img_id = img.attr('pid');
  var img_info = img.attr('info');
  var img_title = img.attr('title');
  var img_src = window.location.protocol + '//' + location.host+'/'+img.attr('src');

  var publish = getUIOption(img_src, img_info, img_title); 
  FB.ui(publish, function(response) {
     if (response && response.post_id) {
       img.parent('div').fadeOut('slow').remove();
       //console.log(response);
     } else {
       //console.log(response);
       alert('Post was not published.');
     }
 }) // FB.ui 
}) // pubish.click 
$('.go-checkin').live('click', function(e) {
  var waiting = loading.clone();
  $('#server-result').append(waiting);
  $('#fb-photos').hide();
  $('#fb-albums').hide();
  $('#review-photos').hide()
  $('#server-result').show()
  $.post('/checkin/save', review_photos, function(resp) {
    resp = JSON.parse(resp);
    current_jid = resp.jid;
    check_job_timer = setInterval(job_status, 2000);
    waiting.remove();
  })
})

function getUIOption(img_src, img_info, img_title) {
  var publish = {
    method: 'stream.publish',
    message: 'This place is god damn coooool!!!!',
    attachment: {
      name: img_title,
      caption: 'This is Caption',
      description: (
          img_info
      ),
      href: 'http://gonorth.opendream.in.th/',
      media: [
        {
          type: 'image',
          href: 'http://together.in.th/',
          src: img_src 
        }
      ]
    },
    action_links: [
      { text: 'nazt?', href: 'http://together.in.th/' }
    ],
    user_prompt_message: 'Share your thoughts about PPic'
    };
  return publish;
}

