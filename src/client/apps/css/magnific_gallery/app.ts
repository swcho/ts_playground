
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

// https://codepen.io/mican/pen/awxmpY

// import * as $ from 'jquery';
import './style.sass';

// $(document.body).html(require('./content.ruby.haml'));

/*
$('.gallery-link').magnificPopup
  type: 'image'
  closeOnContentClick: true
  closeBtnInside: false
  mainClass: 'mfp-with-zoom mfp-img-mobile'
  image:
    verticalFit: true
    titleSrc: (item) ->
      item.el.find('figcaption').text() || item.el.attr('title')
  zoom:
    enabled: true
    # duration: 300
  gallery:
    enabled: true
    navigateByImgClick: false
    tCounter: ''
  disableOn: ->
    return false if $(window).width() < 640
    return true
 */

/*
* decaffeinate suggestions:
* DS102: Remove unnecessary code created because of implicit returns
* Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
*/
$('.gallery-link')['magnificPopup']({
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: false,
    mainClass: 'mfp-with-zoom mfp-img-mobile',
    image: {
        verticalFit: true,
        titleSrc(item) {
            return item.el.find('figcaption').text() || item.el.attr('title');
        }
    },
    zoom: {
        enabled: true
    },
    // duration: 300
    gallery: {
        enabled: true,
        navigateByImgClick: false,
        tCounter: ''
    },
    disableOn() {
        if ($(window).width() < 640) { return false; }
        return true;
    }
});
