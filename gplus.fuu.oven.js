/*
    Google+ Fuu => Reply posts in one click.
    Copyright (C) 2013 Jingqin Lynn
    
    Includes Japansese translation of UI text.
    Copyright (C) 2012 +Cless Jiang <https://plus.google.com/114649741876253367865>
    
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
  OVEN::name org.quietmusic.project.gplus.fuu
  OVEN::display Google+ Fuu
  OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
  OVEN::optional org.quietmusic.project.gplus.keyboard
*/

(function () {
  'use strict';
  var $ = window.jQuery;
  
  var getSetting = function() {
    var settings = null;
    var settingStr = localStorage.getItem('fuu_settings');
    if (settingStr) {
      settings = JSON.parse(settingStr);
    } else {
      settings = {
        'selected' : 0,
        'list' : [
          {
            'type' : 'text',
            'value' : null //We'll fix this in getLocale.
          }
        ]
      };
    }
    return settings;
  };
  var saveSettings = function() {
    localStorage.setItem('fuu_settings', JSON.stringify(settings));
    $('.ext-fuu-button').attr('title', settings.list[settings.selected].value);
    menu.html('');
    buildMenu();
  };
  
  var getLocale = function(settings) {
    var lang = {
      'en': {
        'fuuButtonText' : 'Fuu',
        'fuuDefaultValue' : 'Fuu',
        'add' : 'Add',
        'edit' : 'Edit',
        'delete' : 'Delete',
        'input_reply_value' : 'Please input the $0 of the reply:',
        'empty_toggle_html' : '(Leave empty to toggle HTML)',
        'edit_prompt' : 'Please input the index of the item to edit:',
        'delete_prompt' : 'Please input the index of the item to delete:',
        'zero_based' : '(starting from 0)',
        'delete_confirm' : 'Are you sure to delete this item?',
        'delete_last' : 'The last item cannot be deleted.',
        'html' : 'HTML code',
        'text' : 'text',
        'already_fuued' : 'Do you really want to reply the post again?',
        'alert_range': 'Please input an integer from $0 to $1 inclusive.'
      },
      'zh-hans': {
        'fuuButtonText' : '呼',
        'fuuDefaultValue' : '呼',
        'add' : '添加',
        'edit' : '编辑',
        'delete' : '删除',
        'input_reply_value' : '请输入自动回复的 $0 ：',
        'empty_toggle_html' : '（留空切换是否使用 HTML）',
        'edit_prompt' : '请输入要编辑的选项编号',
        'delete_prompt' : '请输入要删除的选项编号',
        'zero_based' : '(从0开始)',
        'delete_confirm' : '确定要删除这个选项吗？',
        'delete_last' : '这已经是最后一个选项了，所以不能删除的说。',
        'html' : 'HTML 代码',
        'text' : '文本',
        'already_fuued' : '这个贴子已经呼过了呢。还要继续吗？',
        'alert_range': '请输入一个 $0 到 $1 之间的整数！'
      },
      'zh-hant': {
        'fuuButtonText' : '呼',
        'fuuDefaultValue' : '呼',
        'add' : '添加',
        'edit' : '編輯',
        'delete' : '刪除',
        'input_reply_value' : '請輸入要回复的 $0 ：',
        'empty_toggle_html' : '（留空切換是否使用 HTML）',
        'edit_prompt' : '請輸入要編輯的選項編號:',
        'delete_prompt' : '請輸入要刪除的選項編號:',
        'zero_based' : '(從0開始)',
        'delete_confirm' : '確定要刪除這個選項嗎？',
        'delete_last' : '這已經是最後一個選項了，所以不能刪除的说。',
        'html' : 'HTML 代码',
        'text' : '文本',
        'already_fuued' : '這個貼子已經呼過了呢。還要繼續嗎？',
        'alert_range': '請輸入一個 $0 到 $1 之間的整數！'
      },
      'ja': {
        'fuuButtonText' : 'ふぅ',
        'fuuDefaultValue' : 'ふぅ',
        'add' : '追加',
        'edit' : '編集',
        'delete' : '削除',
        'input_reply_value' : '自動コメントの $0 を入力してください：',
        'empty_toggle_html' : '（空にしてＨＴＭＬを使うかどうか切り替える）',
        'edit_prompt' : '編集したい項目番号を入力してください',
        'delete_prompt' : '削除したい項目番号を入力してください',
        'zero_based' : '(0から)',
        'delete_confirm' : 'この項目を削除してよろしいですか？',
        'delete_last' : 'この項目は最後の項目です、削除できませんにゃ☆～',
        'html' : 'HTML コード',
        'text' : 'テキスト',
        'already_fuued' : 'この投稿にはすでにコメントしたの、もう一回コメントしますか？',
        'alert_range': ' $0 から $1 までの間の整数を入力してください！'
      }
    };
    //alias for languages
    lang['zh-cn'] = lang['zh-hans'];
    lang['zh-sg'] = lang['zh-hans'];
    lang['zh-tw'] = lang['zh-hant'];
    lang['zh-hk'] = lang['zh-hant'];
    lang['zh'] = lang['zh-hans']; //fallback
    lang[''] = lang['en']; //general fallback
    
    var langCode = settings.lang || $.gplus.lang();
    var loc = lang[langCode];
    if (!loc) {
      loc = lang[langCode.substr(0,2)];
      if (!loc) {
        loc = lang[''];
      }
    }
    //Fix default rule
    if (!settings.list[0].value) settings.list[0].value = loc['fuuDefaultValue'];
    return loc;
  };

  var onFuuClick = function (e) {
    if (!e) e = event;
    var button = $(e.target);
    if (button.attr('data-ext-fuu-ed')) {
      if (confirm(loc['already_fuued'])) {
        button.attr('data-ext-fuu-ed', 'false');
      } else {
        return;
      }
    }
    var bar = button.parent();
    
    var update = $.gplus.wrap(button.parentsUntil($.gplus.selectors.update).last());
    var fuuComplete = function() {
      update.stopDynamicSelect(handler);
      button.attr('data-ext-fuu-ed', 'true');
    };
    update.find('newComment').openEditor(function (ed) {
      ed.doClick().doKeypress();
      var fuuItem = settings.list[settings.selected];
      switch (fuuItem.type) {
        case 'html':
          ed.html(fuuItem.value);
          break;
        case 'text':
          ed.text(fuuItem.value);
          break;
      }
      
      // Activate the submit button.
      ed.doClick().doKeypress();

      var submit = update.find('newCommentSubmit');
      
      var it = setInterval(function () {
        ed.doClick().doKeypress();
        if (submit.attr('aria-disabled') !== 'true') {
          clearInterval(it);
        };
        submit.doClick();
      }, 100);
    });
  };
  
  //Menu
  var createCmd = function (label) {
    var cmd = $('<menuitem/>');
    cmd.attr('label', label);
    cmd.css('cursor', 'pointer');
    cmd.click(fuuMenuClick);
    menu.append(cmd);
    return cmd;
  };
  var buildMenu = function () {
    for(var i = 0; i < settings.list.length; i++) {
      var label = settings.selected == i ? '[*]' : '[ ]'
      label += settings.list[i].value;
      var cmd = createCmd(label);
      cmd.attr('data-fuu-index', i.toString());
    }
    
    var cmdAdd = createCmd('[+]' + loc['add']);
    cmdAdd.attr('data-fuu-action', 'add');
    var cmdEdit = createCmd('[%]' + loc['edit']);
    cmdEdit.attr('data-fuu-action', 'edit');
    var cmdDelete = createCmd('[X]' + loc['delete']);
    cmdDelete.attr('data-fuu-action', 'delete');
  };
  
  var fuuMenuClick = function (e) {
    if (!e) e = event;
    if (typeof(document.body.contextMenu) == 'undefined') {
      menu.hide();
      mask.hide();
    }
    var action = e.target.getAttribute('data-fuu-action');
    if (action) {
      switch(action) {
        case 'add':
          var fuu = inputFuu();
          if (!fuu) return;
          settings.list.push(fuu);
          settings.selected = settings.list.length - 1;
        break;
        case 'edit':
          var input = prompt(loc['edit_prompt'] + loc['zero_based'], '0');
          if (!input) return;
          var i = parseInt(input);
          if (isNaN(i) || i < 0 || i >= settings.list.length) {
            alert(loc['alert_range'].replace('$0', '0').replace('$1', settings.list.length - 1));
            return;
          }
          var fuu = inputFuu(settings.list[i]);
          if (!fuu) return;
          settings.list[i] = fuu;
          settings.selected = i;
        break;
        case 'delete':
          var input = prompt(loc['delete_prompt'] + loc['zero_based'], '0');
          if (!input) return;
          var i = parseInt(input);
          if (isNaN(i) || i < 0 || i >= settings.list.length) {
            alert(loc['alert_range'].replace('$0', '0').replace('$1', settings.list.length - 1));
            return;
          }
          if (settings.list.length == 1) {
            alert(loc['delete_last']);
            return;
          }
          if (!confirm(loc['delete_confirm'] + '\r\n' + settings.list[i].value)) {
            return;
          }
          if (settings.selected == i) {
            settings.selected = 0;
          } else if (settings.selected > i) {
            settings.selected--;
          }
          for(var j = i; j < settings.list.length - 1; j++) {
            settings.list[j] = settings.list[j+1];
          }
          settings.list.pop();
        break;
      }
      saveSettings();
    } else {
      var fuuIndex = parseInt(e.target.getAttribute('data-fuu-index'));
      settings.selected = fuuIndex;
      saveSettings();
      if (menuOrigin) {
        $(menuOrigin).doClick();
      }
    }
  };
  
  var menu = $('<menu/>');
  menu.attr('type', 'context').attr('id', 'ext-fuu-menu').css({
    'position' : 'absolute',
    'display' : 'none',
    'padding' : '0',
    'margin' :'0',
    'backgroundColor' : '#FBFBFB',
    'borderStyle' : 'solid',
    'borderColor' : '#E3E3E3',
    'z-index': '10000',
  });
  var menuOrigin = null;
  menu[0].addEventListener('show', function(e) {
    if (!e) e = event;
    menuOrigin = e.explicitOriginalTarget.parentElement;
  });
  menu.appendTo(document.body);
  
  //Polyfill HTML5 context menu.
  var mask = $('<div/>').css({
    'position' : 'fixed',
    'width' : '100%',
    'height' : '100%',
    'left' : '0',
    'top' : '0',
    'display' : 'none',
    'z-index' : '9999'
  }).click(function() {
    menu.hide();
    mask.hide();
  }).appendTo(document.body);
  var showFuuMenu = function (e) {
    if (!e) e = event;
    e.preventDefault();
    menuOrigin = e.target;
    var button = $(e.target);
    var pos = button.offset();
    menu.show();
    menu.offset({
      top: pos.top + button[0].offsetHeight,
      left: pos.left
    });
    $('menuitem', menu).each(function(_, cmd) {
      cmd = $(cmd);
      cmd.text(cmd.attr('label'));
      cmd.css('display', 'block');
    });
    mask.show();
  };
  
  var inputFuu = function (fuu) {
    if (!fuu) fuu = { 'value' : loc['fuuDefaultValue'], 'type' : 'text' };
    var result = null;
    do {
      result = window.prompt(
        loc['input_reply_value'].replace('$0', loc[fuu.type]) + '\r\n' + loc['empty_toggle_html'],
        fuu.value);
      if (result == null) return null;
      if (result.length > 0) break;
      fuu.type = (fuu.type == 'text') ? 'html' : 'text';
    } while(true);
    fuu.value = result;
    
    return fuu;
  };
  
  //Init
  var settings = getSetting();
  var loc = getLocale(settings);
  buildMenu();
  //Add "Fuu" button to the update toolbar.
  $(document.body).dynamicSelect($.gplus.selectors.updateToolBar, function(bar) {
    bar = $(bar);
    if (bar.attr('data-ext-fuu')) return;
    var button = $('<div/>');
    button.attr('role', 'button').attr('class', 'Dg ext-fuu-button')
    button.attr('style', 'text-align: center; font-weight: bold;');
    button.attr('title', settings.list[settings.selected].value).text(loc['fuuButtonText']);
    var newComment = $.gplus.wrap(bar).find('newComment');
    if (newComment .length > 0) {
      newComment.before(button);
    } else {
      bar.append(button);
    }
    button.click(onFuuClick);
    
    var domButton = button[0];
    if (typeof(domButton.contextMenu) == 'undefined') {
      button.on('contextmenu', showFuuMenu);
    } else {
      domButton.contextMenu = menu[0];
      button.attr('contextmenu', 'ext-fuu-menu');
    }
    bar.attr('data-ext-fuu', 'buttonInserted');
  });

  if (oven.manager.has('org.quietmusic.project.gplus.keyboard')) {
    $.gplus.keyboard.registerKey('f', function () {
      var update = $.gplus.page().find('activeUpdate').first();
      if (update.length > 0) { 
        update.find('.ext-fuu-button').click();
      } else {
        return false;
      }
    });
    $.gplus.keyboard.addManual('Post', 'f', loc['fuuButtonText']);
  }
})();
