(function (window, videojs) {
  'use strict';


(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
    || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
      timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

// Object.create() polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill
if (typeof Object.create != 'function') {
  Object.create = (function() {
    var Object = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      if (typeof prototype != 'object') {
        throw TypeError('Argument must be an object');
      }
      Object.prototype = prototype;
      var result = new Object();
      Object.prototype = null;
      return result;
    };
  })();
}

// forEach polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback != "function") {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}

// classList polyfill
/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
;if("document" in self&&!("classList" in document.createElement("_"))){(function(j){"use strict";if(!("Element" in j)){return}var a="classList",f="prototype",m=j.Element[f],b=Object,k=String[f].trim||function(){return this.replace(/^\s+|\s+$/g,"")},c=Array[f].indexOf||function(q){var p=0,o=this.length;for(;p<o;p++){if(p in this&&this[p]===q){return p}}return -1},n=function(o,p){this.name=o;this.code=DOMException[o];this.message=p},g=function(p,o){if(o===""){throw new n("SYNTAX_ERR","An invalid or illegal string was specified")}if(/\s/.test(o)){throw new n("INVALID_CHARACTER_ERR","String contains an invalid character")}return c.call(p,o)},d=function(s){var r=k.call(s.getAttribute("class")||""),q=r?r.split(/\s+/):[],p=0,o=q.length;for(;p<o;p++){this.push(q[p])}this._updateClassName=function(){s.setAttribute("class",this.toString())}},e=d[f]=[],i=function(){return new d(this)};n[f]=Error[f];e.item=function(o){return this[o]||null};e.contains=function(o){o+="";return g(this,o)!==-1};e.add=function(){var s=arguments,r=0,p=s.length,q,o=false;do{q=s[r]+"";if(g(this,q)===-1){this.push(q);o=true}}while(++r<p);if(o){this._updateClassName()}};e.remove=function(){var t=arguments,s=0,p=t.length,r,o=false;do{r=t[s]+"";var q=g(this,r);if(q!==-1){this.splice(q,1);o=true}}while(++s<p);if(o){this._updateClassName()}};e.toggle=function(p,q){p+="";var o=this.contains(p),r=o?q!==true&&"remove":q!==false&&"add";if(r){this[r](p)}return !o};e.toString=function(){return this.join(" ")};if(b.defineProperty){var l={get:i,enumerable:true,configurable:true};try{b.defineProperty(m,a,l)}catch(h){if(h.number===-2146823252){l.enumerable=false;b.defineProperty(m,a,l)}}}else{if(b[f].__defineGetter__){m.__defineGetter__(a,i)}}}(self))};



// Global settings
var my = {};
my.settings = {};
my.prefix = 'transcript';
my.player = this;

// Defaults
var defaults = {
  addText: 'Add',
  deleteText: 'Delete',
  editorClick: true,
  timeLineClick: true,



  autoscroll: false,
  clickArea: 'text',
  showTitle: true,
  showTrackSelector: true,
  followPlayerTrack: true,
  scrollToCenter: false,
  stopScrollWhenInUse: true,
};

/*global my*/
var utils = (function (plugin) {
  return {
    secondsToTime: function (timeInSeconds) {
      var hour = Math.floor(timeInSeconds / 3600);
      var min = Math.floor(timeInSeconds % 3600 / 60);
      var sec = Math.floor(timeInSeconds % 60);
      var ms = (timeInSeconds+"").split(".")[1];
      sec = (sec < 10) ? '0' + sec : sec;
      min = (min < 10) ? '0' + min : min;
      hour = (hour < 10) ? '0' + hour : hour;
      // if (hour > 0) {
        if (!!ms) {
          return hour + ':' + min + ':' + sec + '.' + ms;
        } else {
          return hour + ':' + min + ':' + sec + '.000';
        }
      // } else {
      //   if (!!ms) {
      //     return min + ':' + sec + '.' + ms;
      //   } else {
      //     return min + ':' + sec;
      //   }
      // }
    },
    timeToSeconds: function(time) {
      let times = time.split(":");
      let hr = Number(times[0]*3600);
      let mn = Number(times[1]*60);
      let sc = Number(times[2]);
      return hr + mn + sc;
    },
    localize: function (string) {
      return string; // TODO: do something here;
    },
    createEl: function (elementName, classSuffix) {
      classSuffix = classSuffix || '';
      var el = document.createElement(elementName);
      el.className = plugin.prefix + classSuffix;
      return el;
    },
    extend: function(obj) {
      var type = typeof obj;
      if (!(type === 'function' || type === 'object' && !!obj)) {
        return obj;
      }
      var source, prop;
      for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
          obj[prop] = source[prop];
        }
      }
      return obj;
    }
  };
}(my));

var eventEmitter = {
  handlers_: [],
  on: function on (object, eventtype, callback) {
    if (typeof callback === 'function') {
      this.handlers_.push([object, eventtype, callback]);
    } else {
      throw new TypeError('Callback is not a function.');
    }
  },
  trigger: function trigger (object, eventtype) {
    this.handlers_.forEach( function(h) {
      if (h[0] === object &&
          h[1] === eventtype) {
            h[2].apply();
      }
    });
  }
};

var scrollerProto = function(plugin) {

  var initHandlers = function (el) {
    var self = this;
    // The scroll event. We want to keep track of when the user is scrolling the transcript.
    el.addEventListener('scroll', function () {
      if (self.isAutoScrolling) {

        // If isAutoScrolling was set to true, we can set it to false and then ignore this event.
        // It wasn't the user.
        self.isAutoScrolling = false; // event handled
      } else {

        // We only care about when the user scrolls. Set userIsScrolling to true and add a nice class.
        self.userIsScrolling = true;
        el.classList.add('is-inuse');
      }
    });

    // The mouseover event.
    el.addEventListener('mouseenter', function () {
      self.mouseIsOverTranscript = true;
    });
    el.addEventListener('mouseleave', function () {
      self.mouseIsOverTranscript = false;

      // Have a small delay before deciding user as done interacting.
      setTimeout(function () {

        // Make sure the user didn't move the pointer back in.
        if (!self.mouseIsOverTranscript) {
          self.userIsScrolling = false;
          el.classList.remove('is-inuse');
        }
      }, 1000);
    });
  };

  // Init instance variables
  var init = function (element, plugin) {
    this.element = element;
    this.userIsScrolling = false;

    //default to true in case user isn't using a mouse;
    this.mouseIsOverTranscript = true;
    this.isAutoScrolling = true;
    initHandlers.call(this, this.element);
    return this;
  };

  // Easing function for smoothness.
  var easeOut = function (time, start, change, duration) {
    return start + change * Math.sin(Math.min(1, time / duration) * (Math.PI / 2));
  };

  // Animate the scrolling.
  var scrollTo = function (element, newPos, duration) {
    var startTime = Date.now();
    var startPos = element.scrollTop;
    var self = this;

    // Don't try to scroll beyond the limits. You won't get there and this will loop forever.
    newPos = Math.max(0, newPos);
    newPos = Math.min(element.scrollHeight - element.clientHeight, newPos);
    var change = newPos - startPos;

    // This inner function is called until the elements scrollTop reaches newPos.
    var updateScroll = function () {
      var now = Date.now();
      var time = now - startTime;
      self.isAutoScrolling = true;
      element.scrollTop = easeOut(time, startPos, change, duration);
      if (element.scrollTop !== newPos) {
        requestAnimationFrame(updateScroll, element);
      }
    };
    requestAnimationFrame(updateScroll, element);
  };

  // Scroll an element's parent so the element is brought into view.
  var scrollToElement = function (element) {
    if (this.canScroll()) {
      var parent = element.parentElement;
      var parentOffsetBottom = parent.offsetTop + parent.clientHeight;
      var elementOffsetBottom = element.offsetTop + element.clientHeight;
      var relTop = element.offsetTop - parent.offsetTop;
      var relBottom = (element.offsetTop + element.clientHeight) - parent.offsetTop;
      var centerPosCorrection = 0;
      var newPos;

      if (plugin.settings.scrollToCenter){
        centerPosCorrection = Math.round(parent.clientHeight/2 - element.clientHeight/2);
      }
      // If the top of the line is above the top of the parent view, were scrolling up,
      // so we want to move the top of the element downwards to match the top of the parent.
      if (relTop < parent.scrollTop + centerPosCorrection) {
        newPos = element.offsetTop - parent.offsetTop -centerPosCorrection;

      // If the bottom of the line is below the parent view, we're scrolling down, so we want the
      // bottom edge of the line to move up to meet the bottom edge of the parent.
      } else if (relBottom > (parent.scrollTop + parent.clientHeight) - centerPosCorrection) {
        newPos = elementOffsetBottom - parentOffsetBottom + centerPosCorrection;
      }

      // Don't try to scroll if we haven't set a new position.  If we didn't
      // set a new position the line is already in view (i.e. It's not above
      // or below the view)
      // And don't try to scroll when the element is already in position.
      if (newPos !== undefined && parent.scrollTop !== newPos) {
        scrollTo.call(this, parent, newPos, 400);
      }
    }
  };

  // Return whether the element is scrollable.
  var canScroll = function () {
    var el = this.element;
    return el.scrollHeight > el.offsetHeight;
  };

  // Return whether the user is interacting with the transcript.
  var inUse = function () {
    return this.userIsScrolling;
  };

  return {
    init: init,
    to : scrollToElement,
    canScroll : canScroll,
    inUse : inUse
  }
}(my);

var scroller = function(element) {
  return Object.create(scrollerProto).init(element);
};


/*global my*/
var trackList = function (plugin) {
  var activeTrack;
  return {
    get: function () {
      var validTracks = [];
      var i, track;
      my.tracks = my.player.textTracks();
      for (i = 0; i < my.tracks.length; i++) {
        track = my.tracks[i];
        if (track.kind === 'captions' || track.kind === 'subtitles') {
          validTracks.push(track);
        }
      }
      return validTracks;
    },
    active: function (tracks) {
      var i, track;
      for (i = 0; i < my.tracks.length; i++) {
        track = my.tracks[i];
        if (track.mode === 'showing') {
          activeTrack = track;
          return track;
        }
      }
      // fallback to first track
      return activeTrack || tracks[0];
    },
  };
}(my);

/*globals utils, eventEmitter, my, scrollable*/

var widget = function (plugin) {
  // var my = {};
  my.element = {};
  my.body = {};
  var on = function (event, callback) {
    eventEmitter.on(this, event, callback);
  };
  var trigger = function (event) {
    eventEmitter.trigger(this, event);
  };
  var createTitle = function () {
    var divHeader = utils.createEl('div', '-header-container');
    var header = utils.createEl('header', '-header');
    var headerInput = utils.createEl('input', '-header-input');
    headerInput.placeholder = "Type your subtitle here"
    divHeader.appendChild(header)
    divHeader.appendChild(headerInput)
    header.textContent = utils.localize('Subtitles');
    var faPlus = utils.createEl('i', ' tooltip fa fa-plus fa-1 fa-plus-header');
    var plusTooltip = utils.createEl('span', ' tooltiptext');
    plusTooltip.textContent = my.settings.addText;
    faPlus.appendChild(plusTooltip);
    divHeader.appendChild(faPlus);
    faPlus.addEventListener('click', function () {
       my.track.mode = "hidden";
       let startTime = (my.endTime + 0.1).toFixed(3);
       let endTime = (my.endTime + 0.2).toFixed(3);
       let cue = new VTTCue(startTime, endTime, headerInput.value);
       my.track.addCue(cue);
       cue = my.track.cues[my.track.cues.length-1];
       // my.startTime = cue.startTime;
       // my.endTime = cue.endTime;
       let line = createLine(cue);
       my.body.appendChild(line);
       my.track.mode = "showing";
       my.updateCueTimeline();
    })
    return divHeader;
  };
  var createSelector = function (){
    var selector = utils.createEl('select', '-selector');
      plugin.validTracks.forEach(function (track, i) {
      var option = document.createElement('option');
      option.value = i;
      option.textContent = track.label + ' (' + track.language + ')';
      selector.appendChild(option);
    });
    selector.addEventListener('change', function (e) {
      setTrack(document.querySelector('#' + plugin.prefix + '-' + plugin.player.id() + ' option:checked').value);
      trigger('trackchanged');
    });
    return selector;
  };
  var clickToSeekHandler = function (event) {
    var clickedClasses = event.target.classList;
    var clickedTime = event.target.getAttribute('data-begin') || event.target.parentElement.getAttribute('data-begin');
    if (clickedTime !== undefined && clickedTime !== null) { // can be zero
      if (clickedClasses.contains(plugin.prefix + '-line') || clickedClasses.contains(plugin.prefix + '-text')) {
        if (my.settings.editorClick) {
          plugin.player.currentTime(clickedTime);
          my.editor.setTime(clickedTime)
          // console.log(my.editor.player.currentTime(10))
        }
      }  else if (clickedClasses.contains('fa-plus')) {
        console.log('plus')
      } else if (clickedClasses.contains('fa-times')) {
        let nodes = Array.from(event.target.parentNode.parentNode.children);
        my.track.removeCue(my.track.cues.getCueById(event.target.getAttribute('cue')))
        my.track.mode = "hidden";
        if (my.track.cues.length === 0) {
          let cueLast = new VTTCue(0, 0, '');
          cueLast.id = 0;
          my.track.addCue(cueLast);
          my.track.removeCue(my.track.cues.getCueById(0))
          my.startTime = 0;
          my.endTime = 0;
        } else if (nodes.length != 1 && nodes[nodes.length - 1] === event.target.parentNode) {
          let prev = nodes[nodes.indexOf(event.target.parentNode) - 1];
          my.startTime = Number(prev.getAttribute('data-begin'));
          my.endTime = Number(prev.getAttribute('data-end'));
        } else if (nodes.length === 1) {
          my.startTime = 0;
          my.endTime = 0;
        }
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
        my.track.mode = "showing";
        my.updateCueTimeline();
      }
    }
  };
  var createLine = function (cue) {
    my.startTime = cue.startTime;
    my.endTime = cue.endTime;

    var line = utils.createEl('div', '-line');
    var timestamp = utils.createEl('input', '-timestamp start');
    var endTimestamp = utils.createEl('input', '-timestamp end');
    var text = utils.createEl('input', '-text');
    // var faPlus = utils.createEl('i', ' tooltip fa fa-plus fa-1');
    // var plusTooltip = utils.createEl('span', ' tooltiptext');
    var faTimes = utils.createEl('i', ' tooltip fa fa-times fa-1');
    var timesTooltip = utils.createEl('span', ' tooltiptext');
    let cueId = `f${(~~(Math.random()*1e8)).toString(16)}`
    faTimes.setAttribute('cue', cueId);
    timestamp.addEventListener('change', function () {
      // console.log(this.prev)
       let nodes = Array.from(this.parentNode.parentNode.children);
       
       if (this.value.match(/^\d{1,2}:\d{1,2}:\d{1,2}(\.\d{1,3})?$/)) {
        let endTime = utils.timeToSeconds(this.parentNode.querySelector(".end").value);
        let startTime = utils.timeToSeconds(this.value);

        let endTimePrev;
        if (nodes.indexOf(this.parentNode) != 0) {
          endTimePrev = utils.timeToSeconds(nodes[nodes.indexOf(this.parentNode) - 1].querySelector(".end").value);
        }
        

        if (endTime < startTime) {
          alert("Start time must be less than end time!");
          this.value = this.prev;
        } else if (endTimePrev && startTime <= endTimePrev) {
          alert("Start time must be bigger than previous end time!");
          this.value = this.prev;
        } else {
          my.track.mode = "hidden";
          cue.startTime = startTime;
          my.track.mode = "showing";
          line.setAttribute('data-begin', cue.startTime);
          if (nodes[nodes.length - 1] === this.parentNode) {
            my.startTime = cue.startTime;
          } 
          this.prev = this.value;
          my.updateCueTimeline();
        }
       } else {
        alert("Wrong input. Example: 00:10:25.123");
        this.value = this.prev;
       }
    });
    endTimestamp.addEventListener('change', function () {
      let nodes = Array.from(this.parentNode.parentNode.children);
       // console.log(this.value);
       if (this.value.match(/^\d{1,2}:\d{1,2}:\d{1,2}(\.\d{1,3})?$/)) {
        let startTime = utils.timeToSeconds(this.parentNode.querySelector(".start").value);
        let endTime = utils.timeToSeconds(this.value);

        let startTimeNext;
        if (nodes.indexOf(this.parentNode) != (nodes.length-1)) {
          startTimeNext = utils.timeToSeconds(nodes[nodes.indexOf(this.parentNode) + 1].querySelector(".start").value);
        }

        if (startTime > endTime) {
          alert("End time must be bigger than start time!");
          this.value = this.prev;
        } else if (startTimeNext && endTime >= startTimeNext) {
          alert("End time must be less than next start time!");
          this.value = this.prev;
        } else if (endTime > my.player.duration()) {
          alert("End time must be less than video duration time!");
          this.value = this.prev;
        } else {
          my.track.mode = "hidden";
          cue.endTime = endTime;
          my.track.mode = "showing";
          line.setAttribute('data-end', cue.endTime);
          if (nodes[nodes.length - 1] === this.parentNode) {
            my.endTime = cue.endTime;
          }
          this.prev = this.value;
          my.updateCueTimeline();
        }
       } else {
        alert("Wrong input. Example: 00:10:25.123");
        this.value = this.prev;
       }
    });
    line.setAttribute('data-begin', cue.startTime);
    line.setAttribute('data-end', cue.endTime);
    line.setAttribute('tabindex', my._options.tabIndex || 0);
    timestamp.value = utils.secondsToTime(cue.startTime);
    timestamp.prev = utils.secondsToTime(cue.startTime);
    endTimestamp.value = utils.secondsToTime(cue.endTime);
    endTimestamp.prev = utils.secondsToTime(cue.endTime);
    // plusTooltip.textContent = my.settings.addText;
    timesTooltip.textContent = my.settings.deleteText;
    text.value = cue.text;
    text.setAttribute('cue', cueId);
    text.addEventListener('input', function () {
       my.track.mode = "hidden";
       cue.text = this.value;
       my.track.mode = "showing";
       my.updateCueTimeline();
    })
    line.appendChild(timestamp);
    line.appendChild(endTimestamp);
    line.appendChild(faTimes);
    line.appendChild(text);
    // line.appendChild(faPlus);

    // faPlus.appendChild(plusTooltip);
    faTimes.appendChild(timesTooltip);

    my.activeCues[cueId] = cue;
    cue.id = cueId;

    return line;
  };
  
  var createTranscriptBody = function (track) {
    if (typeof track !== 'object') {
      track = plugin.player.textTracks()[track];
    }
    if (track === undefined) {
      track = plugin.player.addTextTrack("captions", "Manual");
    }

    my.track = track;
    my.activeCues = {};
    var body = utils.createEl('div', '-body');
    var line, i;
    var fragment = document.createDocumentFragment();
    // activeCues returns null when the track isn't loaded (for now?)
    if (!track.activeCues) {
      // If cues aren't loaded, set mode to hidden, wait, and try again.
      // But don't hide an active track. In that case, just wait and try again.
      if (track.mode !== 'showing') {
        track.mode = 'hidden';
      }
      window.setTimeout(function() {
        createTranscriptBody(track);
      }, 100);
    } else {
      var cues = track.cues;
      // my.cues = cues;
      for (i = 0; i < cues.length; i++) {
        line = createLine(cues[i]);
        fragment.appendChild(line);
      }
      body.innerHTML = '';
      body.appendChild(fragment);
      body.setAttribute('lang', track.language);
      body.scroll = scroller(body);
      body.addEventListener('click', clickToSeekHandler);
      my.element.replaceChild(body, my.body);
      my.body = body;
    }
  };
  var create = function (options) {
    var el = document.createElement('div');
    my._options = options;
    my.element = el;
    my.startTime = 0;
    my.endTime = 0;
    el.setAttribute('id', plugin.prefix + '-' + plugin.player.id());
    if (plugin.settings.showTitle) {
      var title = createTitle();
      el.appendChild(title);
    }
    if (plugin.settings.showTrackSelector) {
      // var selector = createSelector();
      // el.appendChild(selector);
    }
    my.body = utils.createEl('div', '-body');
    el.appendChild(my.body);
    setTrack(plugin.currentTrack);
    return this;
  };
  var setTrack = function (track, trackCreated) {
    createTranscriptBody(track, trackCreated);
  };
  var setCue = function (time) {
    var active, i, line, begin, end;
    var lines = my.body.children;
    for (i = 0; i < lines.length; i++) {
      line = lines[i];
      begin = line.getAttribute('data-begin');
      if (i < lines.length - 1) {
        end = lines[i + 1].getAttribute('data-begin');
      } else {
        end = plugin.player.duration() || Infinity;
      }
      if (time > begin && time < end) {
        if (!line.classList.contains('is-active')) { // don't update if it hasn't changed
          line.classList.add('is-active');
          if (plugin.settings.autoscroll && !(plugin.settings.stopScrollWhenInUse && my.body.scroll.inUse())) {
              my.body.scroll.to(line);
          }
        }
      } else {
        line.classList.remove('is-active');
      }
    }
  };
  var el = function () {
    return my.element;
  };
  return {
    create: create,
    setTrack: setTrack,
    setCue: setCue,
    el : el,
    on: on,
    trigger: trigger,
  };

}(my);

var transcript = function (options) {
  var editor = new Editor();
          // console.log(transcript.my.player.duration())
          editor.duration = this.duration();

      // var viewport = new Viewport( editor );
      // document.body.appendChild( viewport.dom );

      // var code = new Code( editor );
      // document.body.appendChild( code.dom );

      // var sidebar = new Sidebar( editor );
      // document.body.appendChild( sidebar.dom );
      let timelinerContainer = document.querySelector('#timeliner');
      // var controls = new Controls( editor, my );
      // timelinerContainer.appendChild( controls.dom );

      var timeline = new Timeline( editor, my );
      timelinerContainer.appendChild( timeline.dom );

      editor.signals.windowResized.dispatch();

      this.on("play", function (e) {
        editor.play();
      });

      this.on("pause", function (e) {
        editor.stop();  
      });

      // console.log(this)
      

  var updateCueTimeline = function() {
      // console.log('test')
      editor.clear();
      editor.fromJSON( {
        "config": {},
        "libraries": [],
        "includes": [],
        "effects": [
          [
            
          ]
        ],
        "animations": Array.from(my.track.cues).map(cue => [cue.text, cue.startTime, cue.endTime, 0, 0, true])
      });
  }
  my.editor = editor;
  my.updateCueTimeline = updateCueTimeline;
  editor.updateCueTimeline = updateCueTimeline;
  my.player = this;
  my.settings = videojs.mergeOptions(defaults, options);
  my.widget = widget.create(options);

  document.querySelector('.vjs-progress-control').addEventListener('click', (event) => {
    // console.log(my.player.currentTime())
    my.editor.setTime(my.player.currentTime())
  })

  var timeUpdate = function () {
    // console.log(my.player.currentTime())
    // my.editor.setTime(my.player.currentTime())
    my.widget.setCue(my.player.currentTime());
  };
  var updateTrack = function () {
    my.currentTrack = trackList.active(my.validTracks);
    my.widget.setTrack(my.currentTrack);
  };
  my.validTracks = trackList.get();
  my.currentTrack = trackList.active(my.validTracks);
  if (my.validTracks.length > 0) {
    updateTrack();
    my.player.on('timeupdate', timeUpdate);
    if (my.settings.followPlayerTrack) {
      my.player.on('captionstrackchange', updateTrack);
      my.player.on('subtitlestrackchange', updateTrack);
    }
  } else {
    throw new Error('videojs-transcript: No tracks found!');
  }


  my.updateCueTimeline();

  var transcriptContainer = document.querySelector('#transcript');
  transcriptContainer.appendChild(my.widget.el());


  return {
    editor: function () {
      return my.widget.el();
    },
    // timeliner: timelinerContainer,
    my: my,
    track: my.currentTrack
  };
};
videojs.registerPlugin('transcript', transcript);

}(window, videojs));
