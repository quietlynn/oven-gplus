/*
    Google+ Quick Mention => Mention G+ users quickly.
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
  OVEN::name org.quietmusic.project.gplus.quick_mention
  OVEN::display Google+ Quick Mention
  OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
  OVEN::optional org.quietmusic.project.gplus.keyboard
*/

(function () {
  'use strict';
  var $ = window.jQuery;
  
  var insertMention = function (node, offset, mentionDetails, contenteditable) {
    var doc = node.ownerDocument;
    
    var button = null;
    switch (contenteditable) {
      case 'plaintext-only':
        button = $('<button/>').attr({
          'contenteditable' : 'false',
          'tabindex' : -1,
          'class' : $.gplus.selectors.asClass('mentionButton'),
          'oid' : mentionDetails.id,
          'data-token-entity' : '@' + mentionDetails.id,
          'data-sbxm' : 1
        });
        button.text(mentionDetails.name);
        var prefix = $('<span/>')
          .addClass($.gplus.selectors.asClass('mentionPrefix'));
        prefix.text('+');
        button.prepend(prefix);
        break;
      default:
        button = $('<input/>').attr({
          'type' : 'button',
          'tabindex' : -1,
          'class' : $.gplus.selectors.asClass('mentionButton'),
          'oid' : mentionDetails.id,
          'data-token-entity' : '@' + mentionDetails.id,
          'data-sbxm' : 1,
          'value' : '+' + mentionDetails.name
        });
    }
    
    if (node instanceof Text) {
      var p = node.parentElement;
      var text = node.data || '';
      node.data = ' ' + text.substr(offset).trimLeft();
      p.insertBefore(button[0], node);
      
      var beforeText = null;
      if (offset > 0 || p.firstChild != node) {
        var t = doc.createTextNode(text.substr(0, offset).trimRight() + ' ');
        p.insertBefore(t, button[0]);
      }
    } else {
      if (node.lastChild != null && node.lastChild.tagName === 'BR') {
        node.removeChild(node.lastChild);
      }
      node.appendChild(button[0]);
      
      var br = doc.createElement('br');
      node.appendChild(br);
      
      var t = doc.createTextNode(' ');
      node.insertBefore(t, br);
      node = t;
    }
    
    var sel = doc.defaultView.getSelection();
    var r = doc.createRange();
    r.setStart(node, 1);
    sel.removeAllRanges();
    sel.addRange(r);
  };
  
  var scrollIntoViewIfNeeded = function (j, delta) {
    var win = $(j[0].ownerDocument.defaultView);
    var viewTop = win.scrollTop();
    var viewBottom = viewTop + win.height();
    var elemTop = j.offset().top;
    var elemBottom = elemTop + j.height();
    
    if (viewTop > elemTop) {
      j[0].scrollIntoView(true);
      win.scrollTop(win.scrollTop() - delta);
    } else if (viewBottom < elemBottom) {
      j[0].scrollIntoView(false);
      win.scrollTop(win.scrollTop() + delta);
    }
  };
  
  var insertMentionToNewComment = function (details, newComment) {
    newComment.openEditor(function (editor) {
      var scrollTo = editor;
      var win = editor[0].ownerDocument.defaultView;
      if (win != newComment[0].ownerDocument.defaultView) {
        var frame = win.frameElement;
        if (frame) {
          frame.focus();
          scrollTo = $(frame);
        }
      }
      scrollIntoViewIfNeeded(scrollTo, 200);
      
      insertMention(editor[0], 0, details, editor.attr('contenteditable'));
      newComment.removeData('ext-quick-mention-expanded');
      var submit = newComment.find('newCommentSubmit');
      var it = setInterval(function () {
        editor.doKeypress();
        if (submit.attr('aria-disabled') != 'false') {
          clearInterval(it);
        };
      }, 100);
    });
  };
  
  var extractMentionDetailsFrom = function (el) {
    var id = el.attr('oid') || el.attr('o');
    var name = el.attr('title') || el.contents().last().text() || id;
    return {
      id : id,
      name : name
    };
  };
  
  var profileLinkContextMenu = function (e) {
    if (e.shiftKey) return;
    e.stopPropagation();
    e.preventDefault();
    
    try {
    var el = $(e.currentTarget);
    var details = extractMentionDetailsFrom(el);
    var sel = window.getSelection();
    
    var node = $.gplus.wrap(sel.anchorNode || el);
    var editor = node.closest('contentEditor');
    if (editor.length === 0) {
      node = $.gplus.wrap(el);
      editor = node.find('contentEditor');
      
      if (editor.length === 0) {
        editor = $.gplus.page().find('contentEditor').filter(function (_, ed) {
          return $.gplus.wrap(ed).closest('closedNewUpdate').length === 0;
        }).last();
        
        if (editor.length > 0) node = editor;
      }
    }
    
    if (editor.length > 0) {
      scrollIntoViewIfNeeded(editor, 200);
      var frame = editor.find('iframe');
      if (frame.length > 0) {
        frame[0].focus();
        sel = frame[0].contentWindow.getSelection();
        if (sel.anchorNode) {
          node = $.gplus.wrap(sel.anchorNode);
          editor = $.gplus.wrap(frame[0].contentDocument.body);
        }
      }
    }
    
    if (editor.length === 0) {
      var newComment = node.closest('update').find('newComment');
      if (newComment.length === 0) return;
      insertMentionToNewComment(details, newComment);
    } else {
      insertMention(node[0], sel.anchorOffset, details, editor.attr('contenteditable'));
      editor.doKeypress();
    }
    } catch(e) { console.log(e.toString()); }
  };
  
  var selector = '[oid], [o]';
  
  var newCommentContextMenu = function (e) {
    if (e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    
    var newComment = $.gplus.wrap(e.currentTarget, 'newComment');
    if (newComment.data('ext-quick-mention-expanded')) return;
    newComment.data('ext-quick-mention-expanded', 'true');
    newComment.removeAttr('event-cancel-click', 1);
    var el = newComment.closest('update').find('authorInfo').find(selector);
    insertMentionToNewComment(extractMentionDetailsFrom(el), newComment);
  };
  
  $.gplus.page().dynamicSelect(selector, function (profileLink) {
    profileLink.bind('contextmenu', profileLinkContextMenu);
  });
  
  $.gplus.page().dynamicSelect('newComment', function (newComment) {
    newComment.bind('contextmenu', newCommentContextMenu);
  });
  
  if (oven.manager.has('org.quietmusic.project.gplus.keyboard')) {
    $.gplus.keyboard.registerKey('r', function () {
      var update = $.gplus.page().find('activeUpdate').first();
      if (update.length > 0) {
        var comment = update.getActiveComment();
        if (comment.length > 0) {
          comment.find('authorProfileLink').contextmenu();
        } else {
          update.find('authorInfo').find('authorProfileLink').contextmenu(); 
        }
      } else {
        return false;
      }
    }); 
  } else {
    var editorKeyDown = function (e) {
      if ((e.ctrlKey || e.shiftKey) && (e.keyCode === 10 || e.keyCode === 13)) {
        e.preventDefault();
        e.stopPropagation();
        $.gplus.wrap(e.currentTarget).closest(
            $.gplus.selectors.combine('update', 'newUpdate')
        ).find(
            $.gplus.selectors.combine('newCommentSubmit', 'shareButton')
        ).doClick();
      }
    };

    $.gplus.page().dynamicSelect('contentEditor', function (editor) {
      editor.keydown(editorKeyDown);
    });
  }
})();
