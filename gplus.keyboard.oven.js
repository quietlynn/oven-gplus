/*
    Google+ Keyboard Shortcuts
    Copyright (C) 2012 Jingqin Lynn
    
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
  OVEN::name org.quietmusic.project.gplus.keyboard
  OVEN::display Google+ Keyboard Shortcuts
  OVEN::version 0.1
  OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
*/

(function() {
  'use strict';
  var $ = window.jQuery;
  
  var keyStrForCodes = {
    "8": "backspace",
    "9": "tab",
    "13": "enter",
    "16": "shift",
    "17": "ctrl",
    "18": "alt",
    "19": "pausebreak",
    "20": "caps",
    "27": "esc",
    "33": "pageup",
    "34": "pagedown",
    "35": "end",
    "36": "home",
    "37": "left",
    "38": "up",
    "39": "right",
    "40": "down",
    "45": "insert",
    "46": "delete",
    "48": "0",
    "49": "1",
    "50": "2",
    "51": "3",
    "52": "4",
    "53": "5",
    "54": "6",
    "55": "7",
    "56": "8",
    "57": "9",
    "59": ";",
    "61": "=",
    "65": "a",
    "66": "b",
    "67": "c",
    "68": "d",
    "69": "e",
    "70": "f",
    "71": "g",
    "72": "h",
    "73": "i",
    "74": "j",
    "75": "k",
    "76": "l",
    "77": "m",
    "78": "n",
    "79": "o",
    "80": "p",
    "81": "q",
    "82": "r",
    "83": "s",
    "84": "t",
    "85": "u",
    "86": "v",
    "87": "w",
    "88": "x",
    "89": "y",
    "90": "z",
    "91": "leftwindow",
    "92": "rightwindow",
    "93": "select",
    "96": "num0",
    "97": "num1",
    "98": "num2",
    "99": "num3",
    "100": "num4",
    "101": "num5",
    "102": "num6",
    "103": "num7",
    "104": "num8",
    "105": "num9",
    "106": "num*",
    "107": "num+",
    "109": "num-",
    "110": "num.",
    "111": "num/",
    "112": "f1",
    "113": "f2",
    "114": "f3",
    "115": "f4",
    "116": "f5",
    "117": "f6",
    "118": "f7",
    "119": "f8",
    "120": "f9",
    "121": "f10",
    "122": "f11",
    "123": "f12",
    "144": "numlock",
    "145": "scrolllock",
    "186": ";",
    "187": "=",
    "188": ",",
    "189": "-",
    "190": ".",
    "191": "/",
    "192": "`",
    "219": "[",
    "220": "\\",
    "221": "]",
    "222": "'"
  };
  
  var makeMap = function (from, to) {
    var map = {};
    for (var i = 0; i < from.length; i++) {
      map[from.charCodeAt(i)] = to.charAt(i);
    }
    return map;
  };
  
  var shiftTransform = makeMap(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}:\"<>?\\',
    'abcdefghijklmnopqrstuvwxyz`1234567890-=[];\',./|'
  );
  
  var getKeyStr = function (e) {
    var keyStr = null;
    
    keyStr = keyStrForCodes[e.keyCode.toString()];
    if (!keyStr) {
      // Percent encoding.
      keyStr = '%' + e.keyCode.toString(16);
    }
    
    if (e.shiftKey) keyStr = 'shift+' + keyStr;
    if (e.ctrlKey) keyStr = 'ctrl+' + keyStr;
    if (e.altKey) keyStr = 'alt+' + keyStr;
    if (e.metaKey) keyStr = 'meta+' + keyStr;
    
    return keyStr;
  };
      
  var keyMap = {};
  var mode = 'normal';
  var nextFunc = null;
  // When this key is pressed in seq mode, the sequence breaks at once.
  var breakKey = 'esc';
  
  var man = {};
  
  $.gplus.keyboard = $.gplus.keyboard || {};
  
  $.gplus.keyboard.registerKey = function (keyStr, h) {
    keyStr = $.gplus.keyboard.keyStrC14n(keyStr);
    var handlers = keyMap[keyStr];
    if (handlers) {
      handlers.push(h);
    } else {
      keyMap[keyStr] = [ h ];
    }
  };
  
  $.gplus.keyboard.addManual = function (cat, key, description) {
    var result = man[cat];
    if (!result) {
      result = man[cat] = [];
    }
    result.push({
      key: key,
      description: description
    });
  };
  
  $.gplus.keyboard.keyStrC14n = function (keyStr) {
    var plus = keyStr.lastIndexOf('+', keyStr.length - 2);
    
    if (keyStr.length > 1 && plus < keyStr.length - 2) {
      if (keyStr.charAt(plus + 1) === '%') {
        var hex = keyStr.substr(plus + 2);
        if (hex) {
          var keyName = keyStrForCodes[parseInt(hex, 16).toString()];
          if (keyName) {
            keyStr = keyStr.substr(0, plus + 1) + keyName;
          }
        }
      }
    } else {
      var result = shiftTransform[keyStr.charCodeAt(keyStr.length - 1)];
      if (result) {
        keyStr = 'shift+' + keyStr.substr(0, keyStr.length - 1) + result;
      }
    }
    
    return keyStr.toLowerCase();
  };
  
  $(document).keydown(function (e) {
    // No shortcut keys in textboxes.
    if ($(e.target).closest('[contenteditable], input, textarea').length > 0) {
      return;
    }
    
    if (e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
      // Drop modifer keys
      return;
    }
    
    var keyStr = getKeyStr(e);
    
    var result = false;
    
    switch (mode) {
      case 'normal':
        var handlers = keyMap[keyStr];
        if (handlers) {
          for (var i = 0; i < handlers.length; i++) {
            result = handlers[i]();
            if (result !== false) break; 
          }
        }
        break;
      case 'seq':
        if (!!nextFunc) {
          if (keyStr === breakKey) {
            nextFunc(null); // Notify the waiting function.
            result = true; // Eat this key
          } else {
            result = nextFunc(keyStr);
          }
          mode = 'normal';
        }
        break;
    }
    if (result !== false) {
      e.stopImmediatePropagation();
      e.preventDefault();

      // Firefox does not cancel keypress event on preventDefault()
      // A dirty way to detect Firefox.
      if (!!window.mozRequestAnimationFrame) {
        var once = false;
        var handler = e.target.addEventListener("keypress", function (ee) {
          if (once) return;
          once = true;
          ee.stopImmediatePropagation();
          ee.preventDefault();
          console.log('prevent');
          e.target.removeEventListener("keypress", handler, false);
          return false;
        }, false);
      }
      
      // Enter sequence mode to wait for more keys.
      if (typeof result === 'function') {
        mode = 'seq';
        nextFunc = result;
      }
    }
  });
  
  // Fix focus lost when Notification or Share post iframe is closed.
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  
  $.gplus.page().dynamicSelect('notificationFrameWrapper', function (w) {
    new MutationObserver(function() {
      if (!w.is('notificationFrameWrapperShown')) {
        window.focus();
        if (document.activeElement == w.find('iframe')[0]) {
          var scroll = document.documentElement.scrollTop;
          document.body.focus();
          document.documentElement.scrollTop = scroll;
        }
      } else {
        e.find('iframe').contentWindow.focus();
      }
    }).observe(w[0], {
      attributes: true,
      childList: false,
      characterData: false
    });
  });

  if ($.gplus.page().find('clearNotification').length > 0) {
    // We are in the notification frame.
    $.gplus.keyboard.registerKey('?', function () {
      // TODO: Show help in the notification frame.
    });

    $.gplus.keyboard.addManual('Global', '?', 'Open shortcut help');

    $.gplus.keyboard.registerKey(';', function () {
      $.gplus.page().find('clearNotification').doClick();
    });

    $.gplus.keyboard.addManual('Global', ';', 'Mark all notifications as read');

    // Navigation among cards.
    var handler = $.gplus.page().dynamicSelect('notificationCard', function (cards) {
      $.gplus.page().stopDynamicSelect(handler);
      cards.first().addClass('ext-keyboard-active-card');
    });

    $.gplus.keyboard.registerKey('j', function () {
      var card = $('.ext-keyboard-active-card');
      if (card.length == 0) card = $.gplus.page.find('notificationCard').first();
      var nextCard = card.next();
      if (nextCard.length > 0) {
        card.removeClass('ext-keyboard-active-card');
        nextCard.addClass('ext-keyboard-active-card');
      }
    });

    $.gplus.keyboard.registerKey('j', function () {
      var card = $('.ext-keyboard-active-card');
      if (card.length == 0) card = $.gplus.page.find('notificationCard').first();
      var nextCard = card.next();
      if (nextCard.length > 0) {
        card.removeClass('ext-keyboard-active-card');
        nextCard.addClass('ext-keyboard-active-card');
      }
    });

    return;
  }
  
  // Manual for G+ builtin
  $.gplus.keyboard.addManual('Global', '/', 'Search');
  $.gplus.keyboard.addManual('Global', '?', 'Open shortcut help');
  $.gplus.keyboard.addManual('Global', '←', 'List of pages (Enter opens selected page)');
  $.gplus.keyboard.addManual('Global', '→', 'Page content');
  $.gplus.keyboard.addManual('Global', '@', 'Send feedback');
  $.gplus.keyboard.addManual('Navigation', 'j', 'Next post');
  $.gplus.keyboard.addManual('Navigation', 'k', 'Previous post');
  $.gplus.keyboard.addManual('Navigation', 'n', 'Next comment on current post');
  $.gplus.keyboard.addManual('Navigation', 'p', 'Previous comment on current post');
  $.gplus.keyboard.addManual('Navigation', 'l', 'Load new posts and go to the top');
  $.gplus.keyboard.addManual('Post', 'o', 'Expand/collapse current post');
  $.gplus.keyboard.addManual('Post', 'v', 'View attachment');
  $.gplus.keyboard.addManual('Post', 'r', 'Reply current post');
  $.gplus.keyboard.addManual('Global', 'Esc', 'Close popups');
  
  // Global Shortcuts
  
  // help(?)
  
  $.gplus.addStyle({
    '.ext-keyboard-custom-manual': {
      'left': '0 !important',
      'top': '10% !important',
      'width': '100% !important',
      'height': 'auto !important',
      'bottom': '0 !important',
    },
    '.ext-keyboard-custom-manual .ext-keyboard-custom-manual-columns': {
      '-webkit-column-width': '300px !important',
      '-moz-column-width': '300px !important',
      'column-width': '300px !important',
    },
    '.ext-keyboard-custom-manual-columns table': {
      '-webkit-column-break-inside': 'avoid !important',
      '-moz-break-inside': 'avoid !important', // Not supported by Firefox, but added for the future.
      'break-inside': 'avoid !important'
    },
    '.sUc': {
      'width': 'auto !important'
    }
  });
  
  $.gplus.keyboard.registerKey('?', function () {
    var dialog = $('<div class="qUc ext-keyboard-custom-manual" role="alert"><div class="MId">Keyboard shortcuts</div></div>');
    var columns = $('<div class="ext-keyboard-custom-manual-columns"/>');
    dialog.append(columns);
    
    for (var catName in man) {
      var page = man[catName];
      var category = $('<table class="tUc"><tbody><tr><th></th><th class="uUc">{{catName}}</th></tr></tbody></table>');
      category.find('.uUc').text(catName);
      for (var i = 0; i < page.length; i++) {
        var entry = page[i];
        var item = $('<tr><td class="sUc">{{entry.key}}</td><td class="rUc">{{entry.description}}</td></tr><tr>');
        item.find('.sUc').text(entry.key);
        item.find('.rUc').text(entry.description);
        category.append(item);
      }
      columns.append(category);
    }
    dialog.appendTo('body');
    // Press any key to dismiss.
    return function () {
      dialog.remove();
    };
  });
  
  var gotoTop = function () {
    var page = $.gplus.page();
    /* Not working :
    var i = page.find('update').index(page.find('activeUpdate'));
    for (; i >= 0; i--) {
      var evt = page[0].ownerDocument.createEvent('KeyboardEvent');
      evt.initEvent('keydown', true, true, window, 0, 0, 0, 0, 75, 0);
      document.dispatchEvent(evt);
    }
    */
    page.find('navBar').doClick();
  };

  // Make 'l' work at all time (not only when new posts are available).
  $.gplus.keyboard.registerKey('l', function () {
    gotoTop();
    $.gplus.page().find('refreshButton').doClick();
  });

  // new post(;)
  $.gplus.keyboard.registerKey(';', function () {
    // This function won't work unless the document is scrolled to the top.
    if ($('.gb_gbsh').length > 0) {
      gotoTop();
      setTimeout(function () {
        $($.gplus.selectors.navShareButton).doClick();
      }, 200);
    } else {
      $($.gplus.selectors.navShareButton).doClick();
    }
  });
  
  $.gplus.keyboard.addManual('Global', ';', 'Compose a new post');
  
  // Notification
  $.gplus.keyboard.registerKey('N', function () {
    $.gplus.page().find('notificationButton').doClick();
  });
  
  $.gplus.keyboard.addManual('Global', 'N', 'Open notifications');
  
  // Go
  $.gplus.keyboard.registerKey('g', function () {
    // Wait for the next key to decide where to go.
    return function (dest) {
      switch (dest) {
        case 'g': // Go to top
          gotoTop();
          break;
        case 'h': // Home
          $('[navid="1"] a').doClick();
          break;
        case 'c': // Circles
          $('[navid="2"] a').doClick();
          break;
        case 'o': // phOtos
          $('[navid="3"] a').doClick();
          break;
        case 'm': // gaMes
          $('[navid="4"] a').doClick();
          break;
        case 'a': // hAngout
          $('[navid="5"] a').doClick();
          break;
        case 'x': // eXplore
          $('[navid="6"] a').doClick();
          break;
        case 's': // pageS
          $('[navid="7"] a').doClick();
          break;
        case 'u': // commUnities
          $('[navid="8"] a').doClick();
          break;
        case 'l': // Local
          $('[navid="9"] a').doClick();
          break;
        case 'e': // Events
          $('[navid="10"] a').doClick();
          break;
        case 'p': // Profile
          $('[navid="11"] a').doClick();
          break;
        
        default:
          return false;
      }
    }
  });
  
  $.gplus.keyboard.addManual('Goto', 'gg', 'top of the current page');
  $.gplus.keyboard.addManual('Navigation', 'gg', 'First post');
  $.gplus.keyboard.addManual('Goto', 'gh', 'Home');
  $.gplus.keyboard.addManual('Goto', 'gc', 'Circles');
  $.gplus.keyboard.addManual('Goto', 'go', 'phOtos');
  $.gplus.keyboard.addManual('Goto', 'ga', 'hAngout');
  $.gplus.keyboard.addManual('Goto', 'gx', 'eXplore');
  $.gplus.keyboard.addManual('Goto', 'gs', 'pageS');
  $.gplus.keyboard.addManual('Goto', 'gu', 'commUnities');
  $.gplus.keyboard.addManual('Goto', 'gl', 'Local');
  $.gplus.keyboard.addManual('Goto', 'ge', 'Events');
  $.gplus.keyboard.addManual('Goto', 'gp', 'Profile');
  
  // Applies to the current update or comment.
  
  // +1
  var plusOne = function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      var comment = update.getActiveComment();
      if (comment.length > 0) {
        comment.plusOne();
      } else {
        update.plusOne();
      }
    }
  };    
  // +, =, Numpad+ are all accepted.
  $.gplus.keyboard.registerKey('+', plusOne);
  $.gplus.keyboard.registerKey('=', plusOne);
  $.gplus.keyboard.registerKey('num+', plusOne);
  
  $.gplus.keyboard.addManual('Post', '+', '+1 current post');
  
  // Share this post
  var shareThisPost = function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      update.share();
    }
  };
  // "S" as in Google Reader. RIP Google Reader.
  $.gplus.keyboard.registerKey('S', shareThisPost);
  
  $.gplus.keyboard.addManual('Post', 'S', 'Share current post');
  
  // Mute
  $.gplus.keyboard.registerKey('m', function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      update.toggleMute();
    }
  });
  
  $.gplus.keyboard.addManual('Post', 'm', 'Mute current post');

  // Activity
  $.gplus.keyboard.registerKey('a', function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      var flip = update.find('flipCardButton');
      var hidden = flip.closest('[aria-hidden]');
      if (flip && hidden.attr('aria-hidden') === 'false') {
        flip.doClick();
      } else {
        update.find('activityButton').doClick();
      }
    }
  });
  
  $.gplus.keyboard.addManual('Post', 'a', 'Show/hide activity on this post');

  // auThor
  $.gplus.keyboard.registerKey('t', function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      var comment = update.getActiveComment();
      if (comment.length > 0) {
        comment.find('a[oid]').first().doClick();
      } else {
        update.find('a[oid]').first().doClick();
      }
    }
  });
  
  $.gplus.keyboard.addManual('Post', 't', 'Visit the author of this post/comment');

  $.gplus.keyboard.registerKey('u', function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) {
      update.focus().doKeypress('j');
      setTimeout(function () {
        update.doKeypress('k');
      }, 1000);
    }
  });
  $.gplus.keyboard.addManual('Post', 'u', 'Set focus on the parent post');

  $.gplus.keyboard.registerKey('e', function () {
    var update = $.gplus.page().find('activeUpdate').first();
    if (update.length > 0) { 
      var comment = update.getActiveComment();
      if (comment.length > 0) {
        comment.edit();
      } else {
        update.edit();
      }
    }
  });
  $.gplus.keyboard.addManual('Post', 'e', 'Edit post/comment');

  // Enable n,p in Notification frame. (G+ bug?)
  // TODO: Handle comment expansion.
  if (document.body.classList.contains('u0b')) {
    var navComment = function (direction) {
      var update = $.gplus.page().find('activeUpdate').first();
      if (update.length > 0) {
        var comment = update.getActiveComment();
        if (comment.length == 0) {
          comment = update.find('comment').first();
        } else {
          var nextComment;
          if (direction == 'next') {
            nextComment = comment.next();
          } else {
            nextComment = comment.prev();
          }
          if (nextComment.length > 0) {
            comment = nextComment;
          }
        }
        comment.focus();
        comment.find('button, [role="button"]').show();
      }
    }
    $.gplus.keyboard.registerKey('n', function () {
      navComment('next');
    });
    $.gplus.keyboard.registerKey('p', function () {
      navComment('prev');
    });
  }
  // Shortcut keys in G+ editor (not open for registration).
  
  // Ctrl+Enter = Submit
  // Shift+Enter = Submit
  var editorKeyDown = function (e) {
    if ((e.ctrlKey || e.shiftKey) && (e.keyCode === 10 || e.keyCode === 13)) {
      e.preventDefault();
      e.stopPropagation();
      var update = $.gplus.wrap(e.currentTarget).closest(
          $.gplus.selectors.combine('update', 'newUpdate')
      );
      if (update.length > 0) {
        if (update.is('newUpdate')) {
          update.find($.gplus.selectors.combine('newUpdateSubmit',
                                                'postEditSubmit')).doClick();
        } else {
          update.find('newCommentSubmit').doClick();
        }
      }
    } else if (e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      var update = $.gplus.wrap(e.currentTarget).closest(
        $.gplus.selectors.combine('update', 'newUpdate'));
      
      var cancel = update.find('postEditCancel');
      if (cancel.length > 0) {
        cancel.doClick();
      } else {
        var id = update.find(
            $.gplus.selectors.combine('newCommentSubmit', 'shareButton')
          )[0].id.replace('.post', '.cancel');
        jQuery(document.getElementById(id)).doClick();
      }
    }
  };
  
  $.gplus.keyboard.addManual('Editor', 'Ctrl+Enter', 'Submit post/reply');
  $.gplus.keyboard.addManual('Editor', 'Esc', 'Cancel post/reply');
  
  $.gplus.page().dynamicSelect('contentEditor', function (editor) {
    editor.keydown(editorKeyDown);
  });
})();
