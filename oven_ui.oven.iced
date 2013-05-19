###
    Oven Snippet Manager UI
    Copyright (C) 2013 Jingqin Lynn

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
    
###

###
  OVEN::name oven.ui
  OVEN::lang iced
  OVEN::require com.jquery https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
###

oven.oven ?= {}
ui = oven.oven.ui = {}

ui.addStyle = ->
  style = '''
    .ext-oven-ui-install-link {
      background-color: green !important;
      color: white !important;
    }

    .ext-oven-ui-settings {
      left: 0 !important;
      width: 100% !important;
      height: auto !important;
      bottom: 0 !important;
      text-align: center;
    }

    .ext-oven-ui-close {
      position: fixed;
      display: block;
      right: 0;
      margin: auto;
      margin-right: 10px;
      cursor: pointer;
    }

    .ext-oven-ui-notification {
      background-color: #aaa;
      color: black;
      padding: 20px;
      display: none;
    }

    .ext-oven-ui-action {
      margin: 10px 20px;
      display: inline-block;
    }

    .ext-oven-ui-snippet-list {
      overflow: auto;
      height: 80%;
      -webkit-column-width: 300px !important;
      -moz-column-width: 300px !important;
      column-width: 300px !important;
    }

    .ext-oven-ui-snippet {
      padding: 10px;
      border: #ccc 1px solid;
      margin: 10px;
      -webkit-column-break-inside: avoid !important;
      -moz-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .ext-oven-ui-snippet.disabled {
      margin-left: 20px !important;
      background-color: #aaa;
      color: #222;
    }

    .ext-oven-ui-create {
      display: none;
    }

    .ext-oven-ui-create-code {
      display: inline-block;
      width: 40%;
      min-width: 800px;
      max-height: 800px;
      padding: 20px;
      border: silver 1px solid;
      text-align: left;
      overflow-y: auto;
      background-color: rgba(255,255,255,0.25);
    }
  '''

  if typeof(GM_addStyle) == 'undefined'
    s = document.createElement('style')
    s.type = 'text/css'
    s.textContent = style
    
    document.head.appendChild s
  else
    GM_addStyle style

ui.showDialog = ->
  if not ui.dialog?
    dialog = $ '''
      <div class="sbb ext-oven-ui-settings" role="alert">
        <div class="ext-oven-ui-close">[X]</div>
        <div class="tbb">Oven ~ Google+ Userscript Framework</div>
        <div class="ext-oven-ui-notification"></div>
        <div class="ext-oven-ui-action">
          <button class="a-f-e c-b c-b-T ext-oven-ui-action-update">Update</button>
          <button class="a-f-e c-b c-b-T ext-oven-ui-action-install">Install Snippet</button>
          <button class="a-f-e c-b c-b-T ext-oven-ui-action-create">Create Snippet</button>
          <button class="a-f-e c-b c-b-T ext-oven-ui-action-panic">PANIC</button>
        </div>
        <div class="ext-oven-ui-snippet-list"></div>
        <div class="ext-oven-ui-create">
          <div class="ext-oven-ui-create-code" contenteditable="plaintext-only">
          </div>
          <p>
            <button class="a-f-e c-b c-b-T ext-oven-ui-create-test">Test</button>
          </p>
        </div>
      </div>
    '''
    $('.ext-oven-ui-create-code', dialog)[0].innerText = """
      /*
        #{''}OVEN::name example
        #{''}OVEN::display My Example Snippet
        #{''}OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
      */

      $.gplus.eachUpdate(function (update) {
        update.find('postContent').append(
          '<div style="background-color: green; color: white;">Hello, world!</div>');
      });
    """
    dialog.on 'click', '.ext-oven-ui-close', ->
      dialog.hide()

    dialog.on 'click', '.ext-oven-ui-action-update', (e) ->
      e.target.disabled = true
      $(e.target).toggleClass('c-b-da').toggleClass('c-b-E')
      await oven.manager.sync defer(), 'bypass_cache'
      ui.notify 'Update complete. Please reload the page to apply the changes.'
      e.target.disabled = false
      $(e.target).toggleClass('c-b-da').toggleClass('c-b-E')
      ui.updateSnippetList()

    dialog.on 'click', '.ext-oven-ui-action-install', ->
      url = window.prompt('Please input the url of the snippet:')
      return if not url
      await oven.manager.install null, url, defer(data), 'bypass_cache'
      oven.manager.save()
      ui.updateSnippetList()
      oven.manager.run data.name
      ui.notify "Snippet #{data.name} was installed and activated."

    dialog.on 'click', '.ext-oven-ui-action-create', (e) ->
      $('.ext-oven-ui-create-code', dialog).css 'max-height', 0.8 *dialog.height()
      $(e.target).toggleClass('c-b-da').toggleClass('c-b-T')
      $('.ext-oven-ui-snippet-list', dialog).slideToggle()
      $('.ext-oven-ui-create', dialog).slideToggle()

    dialog.on 'click', '.ext-oven-ui-create-test', ->
      code = $('.ext-oven-ui-create-code', dialog)[0].innerText
      data = oven.manager.parse null, null, code
      data.name ?= 'oven.temp.testcode'
      data.display ?= 'Test Code [added by Oven Snippet Creater]'
      if data.missing?
        await
          try
            oven.manager.install_all data.missing, defer(), 'bypass_cache'
          catch ex
            ui.notify ex.toString()
        delete data.missing
      oven.manager.add data.name, data
      oven.manager.save()
      ui.updateSnippetList()
      if oven.manager.status[data.name] != 'loaded'
        oven.manager.run data.name
        ui.notify 'Test code running.'
      else
        ui.notify 'Test code updated. Please reload this page.'

    dialog.on 'click', '.ext-oven-ui-action-panic', () ->
      return unless window.confirm "Do you really want to RESET all options?"
      oven.manager.panic()
      window.history.go(0)

    dialog.on 'click', '.ext-oven-ui-snippet-remove', (e) ->
      snip = $(e.target).closest '.ext-oven-ui-snippet'
      name = snip.attr 'data-ext-oven-ui-name'
      if name
        for s, data of oven.manager.snippets
          if data.deps.indexOf(name) >= 0
            disp = data.display ? data.name
            ui.notify(
              "This snippet cannot be removed because snippet #{disp} needs it.")
            return
        oven.manager.remove name
        oven.manager.save()
        ui.updateSnippetList()
        ui.notify 'This snippet will be uninstalled once you reload the page.'

    dialog.on 'change', '.ext-oven-ui-snippet-enabled', (e) ->
      snip = $(e.target).closest '.ext-oven-ui-snippet'
      name = snip.attr 'data-ext-oven-ui-name'
      if name
        if e.target.checked
          oven.manager.enable name
          oven.manager.run name
          data = oven.manager.snippets[name]
          disp = data.display ? data.name
          ui.notify "Snippet #{disp} is running now."
        else
          oven.manager.disable name
          ui.notify 'Changes will be applied once you reload the page.'
        oven.manager.save()
        ui.updateSnippetList()
    dialog.appendTo 'body'
    ui.dialog = dialog

  ui.updateSnippetList()
  nav = $ '[role="navigation"]'
  ui.dialog.css('top',
    nav.offset().top + nav[0].offsetHeight - document.body.scrollTop)
  
  ui.dialog.show()

ui.notify = (message) ->
  notification = ui.dialog.find('.ext-oven-ui-notification')
  notification.text message
  notification.show().fadeOut 5000

ui.updateSnippetList = ->
  list = ui.dialog.find('.ext-oven-ui-snippet-list')
  list.empty()
  for name, data of oven.manager.snippets
    continue if data.builtin or not data.name
    row = $ '<div class="ext-oven-ui-snippet"></div>'
    row.attr 'data-ext-oven-ui-name', name
    name_span = $ '<div class="ext-oven-ui-snippet-display"/>'
    name_span.text data.display ? data.name
    row.append name_span
    row.append $ '''
      <span class="ext-oven-ui-snippet-action">
        <label>
          <input type="checkbox" class="ext-oven-ui-snippet-enabled"/>
          Enable
        </label>
        <button class="ext-oven-ui-snippet-remove">Remove</button>
      </span>
    '''
    if not data.disabled
      $('.ext-oven-ui-snippet-enabled', row).attr 'checked', 'checked'
    else
      row.addClass 'disabled'
    list.append row
  
$(document).on 'contextmenu', '[role="navigation"]', (e) ->
  try
    ui.showDialog()
  catch ex
    console.log ex.toString()

  e.preventDefault()
  e.stopImmediatePropagation()
  return false

ui.processLink = (el) ->
  return if el.classList.contains 'ext-oven-ui-install-link'
  el.classList.add 'ext-oven-ui-install-link'
  el.addEventListener 'click', (e) ->
    e.preventDefault()
    e.stopImmediatePropagation()

    url = e.target.href
    await oven.manager.install null, url, defer(data), 'bypass_cache'
    return unless data
    oven.manager.save()
    oven.manager.run data.name
    ui.showDialog()
    ui.notify "Snippet #{data.name} was installed and activated."

    return false

selectors = []
selectors.push "a[href$='.oven.#{lang}']" for lang of oven.lang
selectors.push "a[href$='.oven.js']"
uni_selector = selectors.join ','

ui.watchInstallLinks = () ->
  result = document.querySelectorAll uni_selector
  if result
    for el in result
      ui.processLink el

  MutationObserver = window.MutationOvserver ? window.WebKitMutationObserver
  observer = new MutationObserver (mutations) ->
    mutations.forEach (mutation) ->
      if mutation.type == 'childList' and mutation.addedNodes
          for el in mutation.addedNodes
            if $(el).is(uni_selector)
              ui.processLink el
            if el.querySelector and (result = el.querySelectorAll(uni_selector))
              for ell in result
                ui.processLink ell

  observer.observe document,
    childList: true
    subtree: true

ui.addStyle()
ui.watchInstallLinks()
