/**
 * Init a H5P object.
 **/
 var H5P = H5P || {};
/**
 *
 * @param object params
 *  The object defined in content.json
 * @param int contentId
 *  The nodes vid
 */
 H5P.Timeline = (function ($) {
  
  function C(options, contentId) {
    this.options = $.extend(true, {}, {
      timeline: {
        type: 'default'
      }
    }, options);
  };
  
  /**
   * Attatch the Timeline HTML to a given target.
   **/
  C.prototype.attach = function(target) {
    target[0].insertAdjacentHTML('beforeend', '<div id="my-timeline"></div>');
    //Create the timeline, yo.
    createStoryJS({
      type: 'timeline',
      width: '100%',
      height: '600',
      source: this.options,
      embed_id: 'my-timeline',
      css: H5P.getLibraryPath('TimelineJS-1.0') + '/css/timeline.css',
      js: H5P.getLibraryPath('TimelineJS-1.0') + '/js/timeline-min.js'
    });
  };
  
  return C;
 })(H5P.jQuery);