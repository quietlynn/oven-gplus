###
    Google+ Image Download => Download images quickly.
    Copyright (C) 2014 Jingqin Lynn

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
  OVEN::name org.quietmusic.project.gplus.image_download
  OVEN::lang iced
  OVEN::display Google+ Image Download
  OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
  OVEN::optional org.quietmusic.project.gplus.keyboard
###

imageDownload = (update) ->
  mediaArea = update.find 'mediaArea'
  mediaArea.find('img').each (_, img) ->
    segments = img.src.split '/'
    i = segments.length - 2
    size = segments[i]
    if size.match(/^w\d+-h\d+$/) != null
      segments[i] = 's0-d'
      window.open segments.join '/'

$.gplus.eachUpdate (update) ->
  update.addMenuItem 'Download image', 'ext-image-download-menuitem', () ->
    imageDownload(update);

if oven.manager.has 'org.quietmusic.project.gplus.keyboard'
  $.gplus.keyboard.registerKey 'd', () ->
    update = $.gplus.page().find('activeUpdate').first()
    return false if update.length == 0
    imageDownload(update);
    return undefined

  $.gplus.keyboard.addManual 'Post', 'd', 'Download the image(s) in this post'
