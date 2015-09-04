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
        type: 'default',
        defaultZoomLevel: 0,
        language: 'en'
      }
    }, options);

    // Need to create the URL for all H5P.Images
    if (this.options.timeline.date !== undefined) {
      var dates = this.options.timeline.date;
      for(var i=0; i<dates.length; i++) {
        if (dates[i].asset.thumbnail !== undefined) {
          dates[i].asset.thumbnail = H5P.getPath(dates[i].asset.thumbnail.path, contentId);
        }
      }
    }

    // Check if eras are legal - if not, remove them!
    for (var i=this.options.timeline.era.length-1; i >= 0; i--) {
      if(this.options.timeline.era[i].startDate === undefined || this.options.timeline.era[i].endDate === undefined) {
        this.options.timeline.era.splice(i,1);
      }
    }
  };

  /**
   * Attatch the Timeline HTML to a given target.
   **/
  C.prototype.attach = function ($container) {
    $container.addClass('h5p-timeline');
    $container.append($('<div>', {id: 'h5p-timeline'}));

    // Need to set this to make timeline behave correctly:
    window.jQuery = $;

    createStoryJS({
      type: 'timeline',
      width: '100%',
      height: '600',
      source: this.options,
      lang: this.options.timeline.language,
      start_zoom_adjust: this.options.timeline.defaultZoomLevel,
      embed_id: 'h5p-timeline'
    });
  };

  return C;
 })(H5P.jQuery);
