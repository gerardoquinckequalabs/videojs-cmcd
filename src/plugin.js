import videojs from 'video.js';
import { version as VERSION } from '../package.json';

import CMCDObject from './cmcd';
import logRenditionChange from './utils';

// Default options for the plugin.
const defaults = {};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class Cmcd {

  /**
   * Create a Cmcd plugin instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(options) {
    this.options = videojs.mergeOptions(defaults, options);

    this.ready(() => {
      this.addClass('vjs-cmcd');
      const player = window.player = this;
      const vhs = window.vhs = player.tech().vhs;
      const cmcdAttributes = new CMCDObject();

      logRenditionChange();

      player.on('waiting', () => {
        videojs.log('player is waiting');
      });

      player.on('dispose', () => {
        videojs.log('player will dispose');
      });

      player.on('play', () => {
        videojs.log('player play');
      });

      player.on('playing', () => {
        videojs.log('player playing');
      });

      player.on('pause', () => {
        videojs.log('player paused');
      });

      player.on('loadedmetadata', () => {
        videojs.log('player loadedmetadata'); // may be used for first
      });

      player.on('durationchange', () => {
        videojs.log('player durationchange'); // may be used for first
      });

      vhs.xhr.beforeRequest = function (options) {
        cmcdAttributes.reset();

        try {
          console.log('Options URI', options.uri);
          const media = vhs.playlists.media();
          cmcdAttributes.setMtpFromBandWidth(vhs.systemBandwidth);
          cmcdAttributes.setBrFromBandWidth(media.attributes.BANDWIDTH);
          cmcdAttributes.setStFromDuration(player.duration());
  
          const currentIndex = media.segments.findIndex(s => s.resolvedUri === options.uri);
          if (currentIndex >= 0) {
            cmcdAttributes.setDFromSeconds(media.segments[currentIndex].duration);
            if (currentIndex < media.segments.length - 1) {
              cmcdAttributes.setNor(media.segments[currentIndex + 1].uri);
            }
          }
        } catch (e) {
          console.log(e)
        }

        options.uri += '?' + cmcdAttributes.queryString();  // TODO, won't work if there is already a query string in uri
        return options;
      };
    });
  }
}

// Define default values for the plugin's `state` object here.
// Cmcd.defaultState = {};

// Include the version number.
Cmcd.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('cmcd', Cmcd);

export default Cmcd;
