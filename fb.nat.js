  var current_jid, check_job_timer;
  var review_photos = { } 
  var album_detail = { }
  var div = $('<div />');
  var img = $('<img />'); 
  var p = $('<p />');
  var i = $('<i />');
  var li = $('<li />');
  var h3 = $('<h3 />');
  var span = $('<span />');
  var loading = img.clone().attr({src: 'http://together.in.th/facebox/loading.gif'});

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
          var img_section  = img.clone().attr({src: item.path, pid: item.pid, info: item.content, title: item.title});
          var div_section = div.clone().addClass('server-item').append(img_section).append(pub);
          $('#server-result').addClass('active').append(div_section);
          output += '\
          <li> \
            <img src="' + item.path + '" />\
              <h2>' + item.title + '</h2>\
              <p>' + item.content + '</p>\
          </li> \
          ';
        }); // end each
        output += '</ul>';
        //$('body').append($(output));
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
      //var img_section = span.clone().css({display: 'block', 'background-image': 'url("' +album.src+'")', width: '164px', height: '120px', 'background-repeat': 'no-repeat', 'background-position': 'center 25%', 'background-color': '#EEE'})
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
  var album_content = div.clone().attr({id: 'album_content'}); 
  var div_img ;
  var album_name = album_detail[aid].name;

  album_content.append(h3.clone().html(album_name));
  $('#fb-photos').append(loading);
  photos.wait(function(photo) {
    FB.Array.forEach(photos.value, function(photo) {
      var photo = img.clone().addClass('fb-picture').attr({src: photo.src, object_id: photo.object_id, pid: photo.pid, alt: photo.caption});
      div_img = div.clone().addClass('fb-picture-div');
      div_img.append(photo);
      $(album_content).append(div_img);
    })
    loading.remove();
    $('#fb-photos h1').after(album_content);

    if ( $('div .hover').size() == 0 ) {
      repaint();
    }
    $( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
    FB.Canvas.setSize();
  })
} //end showAllbum(id)


// Click for choose album
$('li.fb-album').live('click', function(e) {
  var self = $(this);
  var curr_img = (self.children('.fb-thumb').children('img'));
  //$('#tab-nav li a[href="#fb-photos"]').click();
  $('#fb-albums').hide();
  $('#fb-photos').show();
  FB.Canvas.setSize({height: 0});
  showAlbum(curr_img.attr('id'));
})
function update_review_photo(operand) {
  operand = 1;
  $('#tab-nav li a[href="#review-photos"]').html('Review ('+ $("#review-photos img").size()+')');
}

$('.fb-picture-div').live('click', function(e) {
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
      $('#send-photo').before(picture);
    }
    else {
      remove_review_photo(pid);
    }
      update_review_photo();
  }) //end wait
})
/*
$('.fb-picture').live('click', function(e) {
  var photos = Photo.get($(this).attr('pid'));
  var self = $(this);

  self.parent('div').toggleClass('hover');

  photos.wait(function(photo) {
    var img_section = img.clone().attr({src: self.src}); 
    var pid = photo[0].pid;
    if(review_photos[pid] == undefined) {
      review_photos[pid] = 'src_big='+photo[0].src_big+"&"+'src_small='+self.src;
      var picture = img.clone().attr({src: self.attr('src'), id: pid } ).addClass('fb-photo-review');
      $('#send-photo').before(picture);
    }
    else {
      remove_review_photo(pid);
    }
      update_review_photo();
  }) //end wait
})
*/ 
function remove_review_photo(pid) {
  delete(review_photos[pid]);
  var selector = '#review-photos img#' +pid
  $(selector).remove()
}
$('#show-all-albums').live('click', function(e) { 
/*  $('#All-Albums').addClass('hidden');
  $('#fb-photos').addClass('hidden');
  $('#fb-albums').show();
*/
  $('#fb-photos').hide();
  $('#fb-albums').show(); 
  $('#album_content').remove();
  $( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
})

$('.fb-photo-review').live('click', function(e) {
  var self = $(this);
  var rid = self.attr('id');
  delete(review_photos[rid]);
  self.remove(); 
  update_review_photo();
  //$('#tab-nav li a[href="#fb-photos"]').click();
})

$('#tab-nav li a').live('click', function(e) {
  var self = $(this);
  var current_id = self.attr('href');
  $(current_id).addClass('active');
  FB.Canvas.setSize({height: 500});
  e.preventDefault();
})

$('.publish-button').live('click', function(e) {
  FB.Canvas.setSize({height: 500});
  var self = $(this);
  var img = $(self.siblings('img'));
  var img_id = img.attr('pid');
  var img_info = img.attr('info');
  var img_title = img.attr('title');
  var img_src = window.location.protocol + '//' + location.host+'/'+img.attr('src');
  console.log('img_src =', img_src);
  console.log('img_info', img_info);
  console.log(img);

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

  $('#tab-nav li a').live('click', function(e) {
    console.log(this);
    var self = $(this);
    $('.tab-el').removeClass('active');
    $(self.attr('href')).addClass('active');
  })

  $('#send-photo').live('click', function(e) {
    var waiting = loading.clone();
    $('#server-result').append(waiting);
    $('#fb-photos').hide();
    $('#fb-albums').hide();
    $('#review-photos').removeClass('active');
    $('#server-result').addClass('active');
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

