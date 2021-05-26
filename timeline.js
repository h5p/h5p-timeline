/* global TimelineJS */
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
    var self = this;
    var i;
    this.options = $.extend(true, {}, {
      timeline: {
        type: 'default',
        defaultZoomLevel: 0,
        language: 'en',
        height: 600
      }
    }, options);

    // Need to create the URL for all H5P.Images
    if (this.options.timeline.date !== undefined) {
      var dates = this.options.timeline.date;
      for(i=0; i<dates.length; i++) {
        if (dates[i].asset.thumbnail !== undefined) {
          dates[i].asset.thumbnail = H5P.getPath(dates[i].asset.thumbnail.path, contentId);
        }
      }
    }

    // Check if eras are legal - if not, remove them!
    if (this.options.timeline.era !== undefined) {
      for (i=this.options.timeline.era.length-1; i >= 0; i--) {
        if(this.options.timeline.era[i].startDate === undefined || this.options.timeline.era[i].endDate === undefined) {
          this.options.timeline.era.splice(i,1);
        }
      }
    }

    /**
     * Set background image
     * @method setBackgroundImage
     * @param  {Object}           image Image object as part of H5P content jeson
     */
    self.setBackgroundImage = function (image) {
      // Need to wait for timelinejs to be finished
      setTimeout(function () {
        var $slider = self.$container.find('.vco-slider');
        if ($slider.length !== 0) {
          $slider.css('background-image', 'url(' + H5P.getPath(image.path, contentId) + ')');
        }
        else {
          self.setBackgroundImage(image);
        }
      }, 200);
    };

    self.on('enterFullScreen', function () {
      self.$container.css('height', '100%');
      $(window).trigger('resize');
    });

    self.on('exitFullScreen', function () {
      self.$container.css('height', self.options.timeline.height + 'px');
      $(window).trigger('resize');
    });
  }

  /**
   * Check if data provided is valid.
   * @method validate
   * @return {boolean} Valid or not
   */
  C.prototype.validate = function () {
    if (this.options.timeline.date === undefined || this.options.timeline.date.length === 0) {
      return false;
    }

    for (var i = 0; i < this.options.timeline.date.length; i++) {
      var element = this.options.timeline.date[i];
      if (element.startDate === undefined || element.headline === undefined) {
        return false;
      }
    }

    return true;
  };

  /**
   * Attatch the Timeline HTML to a given target.
   **/
  C.prototype.attach = function ($container) {
    var self = this;

    self.$container = $container;
    $container.addClass('h5p-timeline').css('height', self.options.timeline.height + 'px');
    $container.append($('<div>', {id: 'h5p-timeline'}));

    // Need to set this to make timeline behave correctly:
    window.jQuery = $;

    if (self.validate()) {
      // Load library.json - need to inform TimelineJS which version it is
      $.getJSON(self.getLibraryFilePath('library.json'), function (data) {

        var datas = {
          "title": {
            "text": {
              "headline": self.options.timeline.headline,
              "text": self.options.timeline.text
            }
          },
          "events": [],
          "eras": []
        };

        if (self.options.timeline.asset !== undefined && self.options.timeline.asset.media) {
          datas.title.media = {
            "url": self.options.timeline.asset.media,
            "caption": self.options.timeline.asset.caption,
            "credit": self.options.timeline.asset.credit,
            "thumbnail": self.options.timeline.asset.thumbnail
          };
        }

        // convert date to TimelineJS3
        self.options.timeline.date && self.options.timeline.date.forEach(function (event2) {
          var event3 = {
            "text": {
              "headline": event2.headline,
              "text": event2.text
            }
          };
          if (event2.asset !== undefined && event2.asset.media) {
            event3.media = {
              "url": event2.asset.media,
              "caption": event2.asset.caption,
              "credit": event2.asset.credit
            };
          }
          var startDateRegexResult = event2.startDate.match(/^(?<year>-?\d{1,})(,(?<month>1[012]|[0]?[1-9])(,(?<day>[12][0-9]|3[01]|[0]?[1-9]))?)?$/);
          if (startDateRegexResult) {
            event3.start_date = {
              "month": startDateRegexResult.groups.month,
              "day": startDateRegexResult.groups.day,
              "year": startDateRegexResult.groups.year
            };

            var endDateRegexResult = event2.endDate && event2.endDate.match(/^(?<year>-?\d{1,})(,(?<month>1[012]|[0]?[1-9])(,(?<day>[12][0-9]|3[01]|[0]?[1-9]))?)?$/);
            if (endDateRegexResult) {
              event3.end_date = {
                "month": endDateRegexResult.groups.month,
                "day": endDateRegexResult.groups.day,
                "year": endDateRegexResult.groups.year
              };
            }

            event3.group = event2.tag;

            datas.events.push(event3);
          }
        });

        // convert eras to TimelineJS3
        self.options.timeline.era && self.options.timeline.era.forEach(function (era2) {
          var era3 = {
            "text": {
              "headline": era2.headline,
              "text": era2.text
            }
          };
        
          var startDateRegexResult = era2.startDate.match(/^(?<year>-?\d{1,})(,(?<month>1[012]|[0]?[1-9])(,(?<day>[12][0-9]|3[01]|[0]?[1-9]))?)?$/);
          if (startDateRegexResult) {
            era3.start_date = {
              "month": startDateRegexResult.groups.month,
              "day": startDateRegexResult.groups.day,
              "year": startDateRegexResult.groups.year
            };

            var endDateRegexResult = era2.endDate && era2.endDate.match(/^(?<year>-?\d{1,})(,(?<month>1[012]|[0]?[1-9])(,(?<day>[12][0-9]|3[01]|[0]?[1-9]))?)?$/);
            if (endDateRegexResult) {
              era3.end_date = {
                "month": endDateRegexResult.groups.month,
                "day": endDateRegexResult.groups.day,
                "year": endDateRegexResult.groups.year
              };
            }

            datas.eras.push(era3);
          }
        });

        var config = {
          width: '100%',
          height: '100%',
          language: self.options.timeline.language,
          scale_factor: 1 / 3 * Math.pow(2, self.options.timeline.defaultZoomLevel)
        };

        // clean undefined

        datas = $.extend(true, {}, datas);

        delete datas.title.media;

        new TimelineJS('h5p-timeline', datas, config, data.preloadedDependencies[0].majorVersion, data.preloadedDependencies[0].minorVersion);

        // Add background image if any:
        if (self.options.timeline.backgroundImage !== undefined) {
          self.setBackgroundImage(self.options.timeline.backgroundImage);
        }
      });
    }
    else {
      $container.append($('<div>', {
        html: 'Missing mandatory data - not able to draw the timeline. Please open this H5P in the editor, and make the necessary changes.',
        'class': 'h5p-timeline-data-not-valid'
      }));
    }
  };

  return C;
 })(H5P.jQuery);
