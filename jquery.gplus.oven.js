/*
    jQuery Google+ plugin
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
  OVEN::name jquery.gplus
  OVEN::display jQuery Google+ Plugin
  OVEN::require com.jquery https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
*/

(function () {
  'use strict';
  if (window.jQuery.gplus) return;
  var $ = window.jQuery;
  
  // XPath plugin
  (function ($) {
    var xpathTypes = {
      'any': XPathResult.ANY_TYPE,
      'number': XPathResult.NUMBER_TYPE,
      'string': XPathResult.STRING_TYPE,
      'boolean': XPathResult.BOOLEAN_TYPE,
      'iterator': XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
      'ordered_iterator': XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      'snapshot': XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
      'ordered_snapshot': XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      'single': XPathResult.ANY_UNORDERED_NODE_TYPE,
      'first' : XPathResult.FIRST_ORDERED_NODE_TYPE,
    };
    var iterateXPathResult = function (callback) {
      var node;
      var i = 0;
      while (node = this.iterateNext()) {
        callback(i, node);
        i++;
      }
    };
    
    $.xpath = function jQueryXPathPlugin(expr, opt_context, opt_type, opt_nsResolver) {
      if(typeof(opt_type) != 'number') {
        if(!opt_type) opt_type = 'any';
        opt_type = xpathTypes[opt_type];
      }
      var result = document.evaluate(expr, opt_context || document,
        opt_nsResolver || null, opt_type, null);
      
      switch (result.resultType) {
        case XPathResult.NUMBER_TYPE:
            return result.numberValue;
        case XPathResult.STRING_TYPE:
            return result.stringValue;
        case XPathResult.BOOLEAN_TYPE:
            return result.booleanValue;
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
        case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
          var nodes = [];
          var node = null;
          while (node = result.iterateNext()) {
            nodes.push(node);
          }
          return $(nodes);
          return result;
        case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
        case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
          var nodes = [];
          var node = null;
          for (var i = 0; i < result.snapshotLength; i++) {
            nodes.push(result.snapshotItem(i));
          }
          return $(nodes);
        case XPathResult.ANY_UNORDERED_NODE_TYPE:
        case XPathResult.FIRST_ORDERED_NODE_TYPE:
          return $(result.singleNodeValue);
        default:
          return result;
      }
      result.each = eachResult;
      return result;
    };
    
    $.fn.xpath = function jQueryXPathPlugin(expr, opt_type, opt_nsResolver) {
      return $.xpath(expr, this[0], opt_type, opt_nsResolver);
    }
  })($);
  
  // Dynamic selection plugin. Selects nodes matching the selector that are present or added later.
  (function ($) {
    $.fn.dynamicSelect = function (selector, callback) {
      var foreach = function (_, e) { callback(e); };
      $(selector, this).each(foreach);
      var handler = function (e) {
        if(!e) e = event;
        if(e.target instanceof Element) {
          if($(e.target).is(selector)) callback(e.target);
          $(selector, e.target).each(foreach);
        }
      };
      for(var i = 0; i < this.length; i++) {
        this[i].addEventListener('DOMNodeInserted', handler, false);
      }
      return handler;
    };
    $.fn.stopDynamicSelect = function (handler) {
      for(var i = 0; i < this.length; i++) {
        this[i].removeEventListener('DOMNodeInserted', handler, false);
      }
    };
    
    if ($.xpath) {
      $.fn.dynamicXPath = function (expr, callback, opt_type, opt_nsResolver) {
        var foreach = function (_, e) { callback(e); };
        this.xpath(expr, opt_type, opt_nsResolver).each(foreach);
        var handler = function (e) {
          if(!e) e = event;

          $.xpath(expr, e.target, opt_type, opt_nsResolver).each(foreach);
        };
        for(var i = 0; i < this.length; i++) {
          this[i].addEventListener('DOMNodeInserted', handler, false);
        }
        return handler;
      };
      $.fn.stopDynamicXPath = $.fn.stopDynamicSelect;
    }
  })($);
  
  // Events simulation plugin
  $.fn.doClick = function () {
    return this.each(function (_, target) {
      var doc = target.ownerDocument;
      var evt;
      evt = doc.createEvent('MouseEvents');
      evt.initEvent('mousedown', true, true);
      target.dispatchEvent(evt);
      evt = doc.createEvent('MouseEvents');
      evt.initEvent('click', true, true);
      target.dispatchEvent(evt);
      evt = doc.createEvent('MouseEvents');
      evt.initEvent('mouseup', true, true);
      target.dispatchEvent(evt);
    });
  };
  $.fn.doKeypress = function (keychar) {
    if (!keychar) keychar = 'e';
    return this.each(function (_, target) {
      var evt = target.ownerDocument.createEvent('KeyboardEvent');
      evt.initEvent('keypress', true, true, window, 0, 0, 0, 0, 0,
        keychar.charCodeAt(0));
      target.dispatchEvent(evt);
    });
  };
  $.fn.doKeydown = function (keycode) {
    if (!keycode) keycode = 69;
    return this.each(function (_, target) {
      var evt = target.ownerDocument.createEvent('KeyboardEvent');
      evt.initEvent('keydown', true, true, window, 0, 0, 0, 0, keycode, 0);
      target.dispatchEvent(evt);
    });
  };
  
  // Mine-click plugin (handles left+right click)
  (function ($) {
    
    var handleEventCancel = function (e, name) {
      var j = $(e.target);
      var cancel = j.attr(name);
      if (cancel) {
        cancel--;
        if (cancel <= 0) {
          j.removeAttr(name);
        } else {
          j.attr(cancel);
        }
        e.stopImmediatePropagation();
        return true;
      }
      return false;
    };
    
    var mineMousedownHandler = function(e) {
      var target = $(e.target);
      if (e.button == 0) {
        target.data('mouse-button-left', 'down');
        target.removeAttr('event-cancel-click');
      } else if (e.button == 2) {
        target.data('mouse-button-right', 'down');
        target.removeAttr('event-cancel-contextmenu');
      }
      if (target.data('mouse-button-left') && target.data('mouse-button-right')) {
        var oldEvent = target.data('mineclick-trigger-event');
        if (oldEvent != e.originalEvent) {
          target.attr('event-cancel-contextmenu', 1);
          target.attr('event-cancel-click', 1);
          target.data('mineclick-trigger-event', e.originalEvent);
          target.trigger('mineclick');
        }
      }
    };
    
    var mineMouseupHandler = function (e) {
      var target = $(e.target);
      if (e.button == 0) {
        target.removeData('mouse-button-left');
      } else if (e.button == 2) {
        target.removeData('mouse-button-right');
      }
    };
    
    var mineMouseleaveHandler = function (e) {
      $.removeData(e.target, 'mouse-button-left');
      $.removeData(e.target, 'mouse-button-right');
    };
    
    var mineMouseClickHandler = function (e) {
      if (handleEventCancel(e, 'event-cancel-click')) return false;
    };
    
    var mineContextmenuHandler = function (e) {
      if (handleEventCancel(e, 'event-cancel-contextmenu')) return false;
    };
    
    var bindMineHandlers = function (j) {
      j.mousedown(mineMousedownHandler)
        .mouseup(mineMouseupHandler)
        .mouseleave(mineMouseleaveHandler)
        .click(mineMouseClickHandler)
        .bind("contextmenu", mineContextmenuHandler);
      
      j.data('mineclick', 'handler-attached');
    };
    
    $.fn.mineclick = function (a, b) {
      if (arguments.length == 0) return this.trigger('mineclick');
      
      var handler = null;
      var eventData = null;
      if (b != null) {
        handler = b;
        eventData = a;
      } else {
        handler = a;
      }
      
      if (!this.data('mineclick')) {
        bindMineHandlers(this);
      } else {
        this.each(function (_, el) {
          el = $(el);
          if (!el.data('mineclick')) {
            bindMineHandlers(el);
          }
        });
      }
      
      return this.on('mineclick', null, eventData, handler);
    };
  })($);
  $.gplus = {
    lang : function () {
      var langCode = null;
      
      //Parse query string to get language code
      var queryStringMatch = location.toString().match(/[\?&]hl=([a-zA-Z\-]+)/);
      if(queryStringMatch) {
        langCode = queryStringMatch[1];
      } else {
        //Parse HTML tag. ('<html lang="xx-YY">')
        var htmlLang = document.documentElement.getAttribute("lang");
        //Get browser language.
        var browserLang = window.navigator.language;
        if(browserLang && browserLang.indexOf(htmlLang) == 0) {
          //If there is no conflict, the browser language should be more detailed.
          langCode = browserLang;
        } else {
          //If there is a conflict, the HTML 'lang' attribute has advantage.
          langCode = htmlLang;
        }
        //Not able to find the language code.
        if(!langCode) langCode = '';
      }
      return langCode.toLowerCase();
    },
    isInFrame : function () {
      return window.top !== window.self;
    },
    expandStyle : function (style) {
      if (typeof(style) == 'string') return style;
      var styleArray = ['{'];
      for (var prop in style) {
        var value = style[prop];
        if (!Array.isArray(value)) value = [value];
        
        for (var i in value) {
          styleArray.push('  ' + prop + ' : ' + value[i] + ';');
        }
      }
      styleArray.push('}');
      return styleArray.join('\n');
    },
    addStyle : function (rules) {
      if (typeof(rules) == 'object') {
        var rulesArray = [];
        for (var selector in rules) {
          rulesArray.push(selector + ' ' + $.gplus.expandStyle(rules[selector]));
        }
        rules = rulesArray;
      }
      if (Array.isArray(rules)) {
        rules = rules.join('\n');
      }
      
      if (typeof(GM_addStyle) == 'undefined') {
        var s = document.createElement('style');
        s.type = 'text/css';
        s.textContent = rules;
        
        document.head.appendChild(s);
        return s;
      } else {
        return GM_addStyle(rules);
      }
    },
    page : function () {
      return $('body').extend($.gplus.extensions.common);
    },
    eachUpdate : function (callback) {
      var doCallback = function (update) {
        callback($.gplus.wrap(update, 'update'));
      };
      if (this instanceof jQuery) {
        return $(select.update, this).each(function(_, update) {
          doCallback(update);
        });
      } else {
        return $('body').dynamicSelect($.gplus.selectors.update, doCallback);
      }
    },
    wrap : function (element, name) {
      if (!(element instanceof jQuery)) {
        element = $(element);
      }
      element.extend($.gplus.extensions.common);
      if ($.gplus.extensions[name]) {
        element = element.extend($.gplus.extensions[name]);
        element.data('gplusExtension', name);
      }
      return element;
    },
    selectors : {
      combine : function (args) {
        var p = [];
        for (var selector in arguments) {
          selector = arguments[selector];
          p.push($.gplus.selectors[selector] || selector);
        }
        return p.join(', ');
      },
      tree : function (args) {
        var p = [' '];
        for (var selector in arguments) {
          selector = arguments[selector];
          selector = $.gplus.selectors[selector] || selector;
          var parts = selector.split(',')
          for (var i = 0; i < p.length; i++) {
            var first = null;
            for (var a in parts) {
              if (first == null) {
                first = p[i] + parts[a].trim() + ' ';
              } else {
                c.push(p[i] + parts[a].trim() + ' ');
              }
            }
            p[i] = first;
          }
        }
        return p.join(',').trim();
      },
      asClass : function (name) {
        return $.gplus.selectors[name].replace(/\./g, ' ').trim();
      },
      update : '.Yp.yt',
      stream : 'div[guidedhelpid="streamcontent"]',
      refreshButton : '.JFd',
      navBar : '.rw.Uc',
      commentArea : '.DL',
      newComment : '.bj.Tt',
      comment : '.tk.nv',
      dateTime : '.Vg',
      postDateTime : '.Du.TK',
      sharingContainer : '.Cca',
      postContent : '.Hs .Is',
      commentContent : '.mQ .Is',
      sharingContent : '.Cca .Hs .Is',
      content : '.Is',
      contentWrapper : '.Hs',
      postContentWrapper : '.Hs.zm',
      postContentWrapperWrapper: '.Gs',
      post : '.Gs',
      mainPost : '.Gs.Aca',
      sharedPost : '.Gs.mca',
      postAndToolbarWrapper : '.hi',
      unexpandedContainer : '.Hs:not([style="max-height: none;"]), .Hs.rz',
      expandedContainer : '.Hs[style="max-height: none;"]',
      postToggleButton : '.d-s.cj',
      postExpandButton : '.d-s.cj.bn',
      postCollapseButton : '.d-s.cj.Fs',
      commentToggleButton : '.d-s.Po',
      commentExpandButton : '.d-s.Po.Gp',
      commentCollapseButton : '.d-s.Po.Fp',
      toggleButton : '.d-s.cj, .d-s.Po', // postToggleButton + commentToggleButton
      originalPostLink : '.pg',
      authorInfo : '.Ir',
      originalAuthorInfo : '.vA',
      anyAuthorInfo : '.Ir, .vA', // authorInfo + originalAuthorInfo
      proflinkWrapper : '.proflinkWrapper',
      newCommentOpener : '.Dt.wu',
      contentEditor : '.df',
      newCommentSubmit : '.b-c-Ba',
      newCommentCancel: '.b-c-R',
      shareButton: '[guidedhelpid="sharebutton"]',
      updateToolBar : '.Qg',
      whiteBarInToolbar : 'DEPRECATED',
      profileNameContainer : 'DEPRECATED',
      mediaArea : '.Nf',
      sharedPhoto : '.Bk',
      sharedExternalLink : '.ot-anchor',
      sharedWebpageTitle : '.zg',
      albumTitle : '.Ep',
      sharedAlbumTitle : '.Ep',
      morePhotos : '.No',
      sharedPhotoLink : '.lb.Tr',
      photoInfo : '.gd.Mk', // ??
      mainArea : '.I9', // ?
      mediaImage : '.kq.Wc',
      postPreview : '.HZ.Zh',
      addPhotoToEventText : '.QV', // ??
      eventText : '.Cv',
      eventDetails : '.Bv',
      eventTitle : '.Cv',
      mentionButton : '.gk',
      mentionPrefix : '.uP',
      newUpdate : '[guidedhelpid="sharebox"]',
      closedNewUpdate : '[guidedhelpid="sharebox_launcher"]',
      plusOne : '[g\\:entity]',
      postPlusOne : '[g\\:entity^="buzz:"]',
      commentPlusOne : '.EE',
      activeUpdate: '.tk',
      notificationButton: '#gbgs1',
      sharePost: '.Ut',
      updateMenuOpener: '.if',
      updateMenu: '.YH',
      updateMenuReady: '.d-r',
      updateMenuMute: '.G3',
      unmute: '.Z2',
      postEditCancel: '.b-c-U',
      notificationFrameWrapper: '#gbwc',
      authorProfileLink: '.Cu.Tb',
      activityButton: '.LK',
      flipCardButton: '.cu',
      clearNotification: '.MCa',
      notificationCard: '.Mra'
    },
    attrs : {
      userId : 'oid'
    },
    extensions : {
      common : {
        baseFind : jQuery.fn.find,
        find : function (selector) {
          var result = null;
          if (this.hooks && this.hooks[selector]) {
            return this.hooks[selector]();
          } else if ($.gplus.selectors[selector]) {
            result = this.baseFind($.gplus.selectors[selector]);
          } else {
            result = this.baseFind(selector);
          }
          return $.gplus.wrap(result, selector);
        },
        eachElement : function (callback) {
          var extName = this.data('gplusExtension');
          return this.each(function (i, e) {
            callback($.gplus.wrap(e, extName));
          });
        },
        baseDynamicSelect : jQuery.fn.dynamicSelect,
        dynamicSelect : function (selector, callback) {
          var rawSelector = selector;
          if (this.hooks && this.hooks[selector]) {
            return this.hooks[selector]();
          } else if ($.gplus.selectors[selector]) {
            selector = $.gplus.selectors[selector];
          }
          return this.baseDynamicSelect(selector, function (e) {
            callback($.gplus.wrap(e, rawSelector));
          });
        },
        baseIs : jQuery.fn.is,
        is : function (selector) {
          if ($.gplus.selectors[selector]) {
            selector = $.gplus.selectors[selector];
          }
          return this.baseIs(selector);
        },
        baseClosest : jQuery.fn.closest,
        closest : function (selector) {
          var rawSelector = selector;
          if ($.gplus.selectors[selector]) {
            selector = $.gplus.selectors[selector];
          }
          return $.gplus.wrap(this.baseClosest(selector), rawSelector);
        },
        baseFirst : jQuery.fn.first,
        first : function () {
          return $.gplus.wrap(this.baseFirst(), this.data('gplusExtension'));
        }
      },
      stream : {
        eachUpdate : null // We'll do this later.
      },
      update : {
        plusOne : function () {
          this.find('postPlusOne').doClick();
          return this;
        },
        getActiveComment : function () {
          return $.gplus.wrap(document.activeElement).closest('comment');
        },
        share : function () {
          this.find('sharePost').doClick();
          return this;
        },
        openMenu : function (opt_callback) {
          if (opt_callback) {
            var that = this;
            var handler = this.dynamicSelect('updateMenu', function (menu) {
              that.stopDynamicSelect(handler);
              // TODO: Use MutationObserver.
              var it = setInterval(function () {
                if (menu.is('updateMenuReady')) {
                  clearInterval(it);
                  opt_callback(menu);
                }
              }, 100)
            });
          }
          
          this.find('updateMenuOpener').doClick();
          return this;
        },
        mute : function () {
          this.openMenu(function (menu) {
            menu.find('updateMenuMute').doClick();
          })
        },
        unmute: function () {
          this.find('unmute').doClick();
        },
        toggleMute: function () {
          var unmute = this.find('unmute');
          if (unmute.length > 0) {
            unmute.doClick();
          } else {
            this.mute();
          }
          return this;
        }
      },
      post : {
        isMainPost : function () {
          return this.is(mainPost);
        },
        expand : function () {
          this.find('postExpandButton').doClick();
          return this;
        }
      },
      activeUpdate : 'update',
      newComment : {
        openEditor : function (opt_callback) {
          var opener = this.find($.gplus.selectors.newCommentOpener);
          
          if (opt_callback) {
            var update = $.gplus.wrap(opener).closest('update');
            
            var editorFound = function (ed) {
              if (ed[0].children.length == 0) {
                // G+ no longer adds a <br> to the element. Workaround follows:
                var it = setInterval(function () {
                  if (ed.attr('contenteditable')) {
                    clearInterval(it);
                    update.stopDynamicSelect(handler);
                    opt_callback(ed);
                  }
                }, 100);
              } else if (ed[0].children[0].tagName == 'DIV') {
                if (callback) callback();
                var fHandler = ed.dynamicSelect('iframe', function (frame) {
                  $(ed).stopDynamicSelect(fHandler);
                  //The content in the frame is changing, and DOMNodeInserted won't work.
                  //Use setInterval as a workaround.
                  var it = setInterval(function () {
                    var body = $(frame[0].contentDocument.body);
                    if (body.hasClass('editable')) {
                      clearInterval(it);
                      editorFound(body);
                    }
                  }, 100);
                });
              } else {
                update.stopDynamicSelect(handler);
                opt_callback(ed);
              }
            };
            
            var handler = update.dynamicSelect('contentEditor', editorFound);
          }
          opener.doClick();
          return this;
        }
      },
      comment : {
        expand : function (callback) {
          this.find('commentExpandButton').doClick();
          return this;
        },
        collapse : function (callback) {
          this.find('commentCollapseButton').doClick();
          return this;
        },
        plusOne : function () {
          this.find('commentPlusOne').doClick();
          return this;
        }
      },
      mention : {
        userName : function () {
          return $('a', this).text();
        },
        userId : function () {
          return this.xpath('.//@' + $.gplus.attrs.userId, 'string');
        }
      },
      content : {
        
      },
      dateTime : {
        raw : function () {
          return this.attr('title');
        },
        publishDate : function () {
          return new Date(this.raw());
        },
        editDate : function () {
          var match = this.raw().match(/\(([^\)]+)\)/);
          if (!match) return null;
          return new Date(match[1]);
        }
      },
      authorInfo : {
        userId : function () {
          return this.xpath('.//@' + $.gplus.attrs.userId, 'string');
        }
      },
      postDateTime : 'dateTime',
      postContent : 'content',
      commentContent : 'content',
      mainPost : 'post',
      sharedPost : 'post',
      originalAuthorInfo : 'authorInfo'
    }
  };
      
  $.gplus.extensions.stream.eachUpdate = $.gplus.eachUpdate;
  
  for (var name in $.gplus.extensions) {
    var ext = $.gplus.extensions[name];
    if (typeof(ext) == 'string') {
      ext = $.gplus.extensions[name] = $.gplus.extensions[ext];
      name = ext;
    }
    if (ext.extend) {
      ext = $.gplus.extensions[name] = Object.create($.gplus.extensions[ext.extend], ext);
    }
  }
})();
