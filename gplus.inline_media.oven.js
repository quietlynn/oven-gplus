/*
    Google+ Inline Media => Reduce rich-media noise.
    Copyright (C) 2013 Jingqin Lynn
    
    Includes jQuery
    Copyright 2011, John Resig
    Dual licensed under the MIT or GPL Version 2 licenses.
    http://jquery.org/license

    Includes Sizzle.js
    http://sizzlejs.com/
    Copyright 2011, The Dojo Foundation
    Released under the MIT, BSD, and GPL Licenses.
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/*
  OVEN::name org.quietmusic.project.gplus.inline_media
  OVEN::display Google+ Inline Media
  OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
  OVEN::optional org.quietmusic.project.gplus.keyboard
*/

(function () {
  'use strict';
  var $ = window.jQuery;
  
  var styles = {
    '.ext-inline-media-panel' : {
      'background-color' : 'white',
      'z-index' : '999999',
      'position' : 'absolute',
      'border-color' : '#aaf',
      'border-width' : '5px',
      'border-style' : 'solid',
      'overflow' : 'hidden'
    },
    '.ext-inline-media-link' : {
      'background-color' : '#8DB600',
      'color' : 'white'
    }
  };
  
  styles[$.gplus.selectors.tree('.ext-inline-media-panel', 'photoInfo')] = {
    'display' : 'none !important'
  };
  styles[$.gplus.selectors.tree('.ext-inline-media-panel', 'sharedPhoto')] = {
    'position' : 'static !important',
    'margin' : '0 !important'
  };
  styles[$.gplus.selectors.tree('.ext-inline-media-panel', 'sharedPhoto', 'mediaImage')] = {
    'position' : 'static !important'
  };
  styles[$.gplus.selectors.mainArea] = {
    'z-index' : [ 'initial !important', '-moz-initial !important' ]
  };
  styles[$.gplus.selectors.postAndToolbarWrapper] = {
    'position' : 'static !important'
  };
  
  $.gplus.addStyle(styles);
  
  $.gplus.page().dynamicSelect('hangoutsOnAir', function (hangout) {
    hangout.innerHTML = '<a>Hangouts On Air</a>';
  });
  
  var decorateLink = function (a, url, title) {
    if (title == '[EventImage]') title = '[Event ' + a.text() + ']';
    
    a.attr('href', url)
      .attr('target', '_blank')
      .addClass('ext-inline-media-link')
      .text(title);
    
    a.mouseenter(function () { mediaArea.show(); })
      .mouseleave(function (e) { 
        if (mediaArea.hasClass('ext-inline-media-panel')) {
          mediaArea.hide(); 
        }
      }).mineclick(function () {
        mediaArea.toggleClass('ext-inline-media-panel');
      });
  };

  var insertLink = function (body) {
    if (body.closest('*[data-ext-inline-media]').length > 0) return;
    var update = body.closest('update');
    var mediaArea = update.find('.ext-inline-media-area');
    var url = mediaArea.attr('data-inline-media-url');
    var title = mediaArea.attr('data-inline-media-title');
    
    var a = null;
    $('a', body).each(function(_, anchor) {
      if(anchor.href == url) a = anchor;
    });
    if (a == null) return;
    $('.ext-inline-media-temp-link', update).remove();
    a = $(a);
    decorateLink(a, url, title);
  };
  
  $.gplus.page().dynamicSelect(
      $.gplus.selectors.combine('mediaArea', 'eventDetails'), 
      function (mediaArea) {
    
    //Don't inline media in post preview.
    if (mediaArea.closest('postPreview').length > 0) return;
    var url = null;
    var title = null;
    
    mediaArea.find('sharedPhoto').eachElement(function (photo) {
      var anchor = photo.find('sharedPhotoLink');
      if (anchor.length == 0) {
        anchor = photo.closest('a');
        if (anchor.length == 0) return;
        // Add photos to events.
        mediaArea = anchor;
        title = '[EventImage]';
      } else {
        title = '[Image]';
      }
      url = anchor[0].href;
    });
    
    
    if (url == null) {
      mediaArea.find('sharedExternalLink').eachElement(function (externalLink) {
        url = url || externalLink[0].href;
        title = externalLink.text();
      });
    }
    
    var albumTitle = mediaArea.find('albumTitle');
    if (albumTitle.length > 0) {
      title = albumTitle.first().text();
      if (albumTitle.is('sharedAlbumTitle')) {
        url = albumTitle[0].href;
      }
      
      albumTitle.hide();
    }
    
    if (url == null) {
      mediaArea.find('eventTitle').eachElement(function (eventTitle) {
        title = '[Event ' + eventTitle.text() + ']';
        url = eventTitle[0].href;
      });
    }
    
    if (url != null) {
      var parts = url.match(/^(\w+):(\/\/)?([^\/]+)/);
      var scheme = parts ? parts[1] : '';
      var domain = parts ? parts[3] : '<Invalid>';
      
      switch (title) {
        case null:
          title = ((scheme == 'http' || scheme == 'https') ? '' : scheme + ':') + '[' + domain + ']';
          break;
        case '[Image]':
          if (domain != 'plus.google.com') title = '[Image ' + domain + ']';
          break;
        case '[EventImage]':
          break;
        default:
          if (title[0] != '[') title += ' [' + domain + ']';
          break;
      }
      
      var post = mediaArea.closest('post');
      var wrapper = post.find('postContentWrapperWrapper');
      if (wrapper.length == 0) return;

      var a = $('<a/>');
      decorateLink(a, url, title);
      a.addClass('ext-inline-media-temp-link');
      wrapper.last().append(a);

      mediaArea
        .addClass('ext-inline-media-area')
        .addClass('ext-inline-media-panel')
        .hide();
      mediaArea.attr('data-inline-media-url', url);
      mediaArea.attr('data-inline-media-title', title);
      post.dynamicSelect(
          $.gplus.selectors.combine('postContent', 'addPhotoToEventText', 'eventText'),
          insertLink);
    }
  });

  if (oven.manager.has('org.quietmusic.project.gplus.keyboard')) {
    $.gplus.keyboard.registerKey('i', function () {
      var update = $.gplus.page().find('activeUpdate').first();
      if (update.length > 0) { 
        var mediaArea = update.find('.ext-inline-media-area');
        mediaArea.toggleClass('ext-inline-media-panel');
        if (mediaArea.is('.ext-inline-media-panel')) {
          mediaArea.hide();
        } else {
          mediaArea.show();
        }
      } else {
        return false;
      }
    });
    $.gplus.keyboard.addManual('Post', 'i', 'Toggle inline media area');
  }
})();
