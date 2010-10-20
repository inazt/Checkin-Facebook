  var current_jid, check_job_timer;
  var review_photos = { } 

  var div = $('<div />');
  var img = $('<img />'); 
  var loading = $('<img />').attr({src: 'http://together.in.th/facebox/loading.gif'});

  Photo = {

    Album: { 
      getAlbums: function(owner_id) {
        var getAlbumsFql = 'SELECT aid, object_id, name, cover_pid, size, link, visible, description, created ' + 
                           'FROM album WHERE owner = {0}';
        var getAlbumPhotoFql = 'SELECT aid, pid, src, src_small, src_big, link, caption FROM photo WHERE pid ' +  
                               'IN (SELECT cover_pid FROM album WHERE owner = {0})';
        var albums = FB.Data.query(getAlbumsFql, owner_id);
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

function job_status() {
  service_path = "/checkin/qr/job/" + current_jid + "/status";
  $.getJSON(service_path, {}, function (data) {
    if (data.status == true) {
      var output = '<ul>';
      $(data.data).each(function (i, item) {
        console.log(i, item);
        var pub = $('<div />') 
        pub.html('Publish').addClass('publish-button');
        var img_section  = $('<img />') 
        img_section.attr({src: item.path, pid: item.pid, info: item.content, title: item.title});
        var div_section = $('<div />') 
        div_section.addClass('review-item').append(img_section).append(pub);
        $('#server-result').append(div_section);

        output += '\
        <li> \
          <img src="' + item.path + '" />\
            <h2>' + item.title + '</h2>\
            <p>' + item.content + '</p>\
        </li> \
       ';
     });
     output += '</ul>';
     //$('body').append($(output));
     clearInterval(check_job_timer);
    } //end if
  }); //end getJson
}

function getAlbums() {  
  var data = Photo.Album.getAlbums(FB.getSession().uid);
  $('#fb-albums').append(loading);
  FB.Data.waitOn([data.album, data.a_photo], function(args) {
    console.log(data, (data.album.value)[0], (data.a_photo.value)[0]);
    FB.Array.forEach(data.a_photo.value , function(album) {
      var aid = album.aid;
      var div_section = $('<div />') 
      div_section.addClass('div-album');
      var img_section = $('<img />') 
      img_section.attr({src: album.src, id: album.aid, class: 'album_cover', aid: aid});
      var cover_section = div_section.append(img_section);
      $('#fb-albums').append(cover_section);
    })
  loading.remove();
  })
} /// getPhotos

/***  Show All Photos In Album ***/
function showAlbum(aid) {
  var photos = Photo.Album.getPhotos(aid);  
  var album_content = $('<div />') 
  album_content.attr({id: 'album_content'}); 
  var div_img ;
  $('#fb-photos').append(loading);
  photos.wait(function(photo) {
    FB.Array.forEach(photos.value, function(photo) {
      var photo = $('<img />').attr({src: photo.src, class: 'fb-picture', object_id: photo.object_id, pid: photo.pid, alt: photo.caption});
      //console.log(photo);
      div_img = $('<div />') 
      div_img.addClass('fb-picture-div');
      div_img.append(photo);
      $(album_content).append(div_img);
    })
    loading.remove();
    $('#fb-photos').append(album_content);
  })
} //end showAllbum(id)



$('.album_cover').live('click', function(e) {
  //console.log(this.id);
  //$(this).parent('div').hide();
  $('#fb-albums').hide();       
  $('#fb-photos').show();
  showAlbum(this.id);
  $('#All-Albums').show('fast');
})

$('.fb-picture').live('click', function(e) {
  var photo = Photo.get($(this).attr('pid'));
  var self = this;
  photo.wait(function(photo) {
    var img_section = $('<img />') 
    img_section.attr({src: self.src}); 
    if(review_photos[photo[0].pid] == undefined) {
      review_photos[photo[0].pid] = 'src_big='+photo[0].src_big+"&"+'src_small='+self.src;
      var picture = $('<img />'); 
      picture.attr({src: self.src, class: 'fb-photo-review', id: photo[0].pid } );
      jQuery('#review-photos').append(picture);
    }
  })
})

$('#All-Albums').live('click', function(e) { 
  $('#All-Albums').hide();
  $('#fb-photos').hide();
  $('#fb-albums').show();
  $('#album_content').remove();
  $( 'html, body' ).animate( { scrollTop: 0 }, 'fast' );
})

$('.fb-photo-review').live('click', function(e) {
  var self = $(this);
  var rid = self.attr('id');

  delete(review_photos[rid]);
  self.remove(); })

$('.publish-button').live('click', function(e) {
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
 }) 
  //console.log(data.data[img_id], data.data[img_id]['photo'], data.data[img_id]['message'])
}) 
  $('#send-photo').live('click', function(e) {
    var waiting = loading.clone();
    jQuery('#server-result').append(waiting);
    jQuery('#fb-photos').hide();
    jQuery('#fb-albums').hide();
    jQuery('#review-photos').hide();
    jQuery.post('/checkin/save', review_photos, function(resp) {
/*
      data = JSON.parse(resp);
      $.each(data.data, function(i, v) {
        console.log(i, v);
        var pub = $('<div />') 
        pub.html('Publish').addClass('publish-button');
        var img_section  = $('<img />') 
        img_section.attr({src: v['photo'], pid: i});
        var div_section = $('<div />') 
        div_section.addClass('review-item').append(img_section).append(pub);
        $('#server-result').append(div_section);
        
      })
*/
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

