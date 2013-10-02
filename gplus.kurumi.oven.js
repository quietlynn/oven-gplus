/*
OVEN::name org.quietmusic.project.gplus.kurumi
OVEN::display Google+ Kurumi
OVEN::require jquery.gplus https://github.com/quietlynn/oven-gplus/raw/master/jquery.gplus.oven.js
*/

$.gplus.page().dynamicSelect('img[oid]', function (ele) {
  ele.attr('src', 'https://lh5.googleusercontent.com/-PyOtMq2phZQ/AAAAAAAAAAI/AAAAAAAA2no/qj9XSjZ_Qm8/s81-c-k-no/photo.jpg');
});
