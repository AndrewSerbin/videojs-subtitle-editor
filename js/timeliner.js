

var Config = function () {

	var name = 'framejs-editor';

	var storage = {
	"config": {},
	"libraries": [],
	"includes": [],
	"effects": [
		[
			"backgroundColor Parameter",
			[
				"var parameters = {",
				"\tcolor: new FRAME.Parameters.Color( 'Color', 0x0000ff )",
				"};",
				"",
				"var dom = resources.get( 'dom' );",
				"",
				"function start(){}",
				"",
				"function update( progress ){",
				"\t",
				"\tdom.style.backgroundColor = '#' + ( '000000' + Math.floor( parameters.color.value ).toString( 16 ) ).slice( - 6 );",
				"",
				"}"
			]
		],
		[
			"backgroundColor Fade In",
			[
				"var dom = resources.get( 'dom' );",
				"",
				"function start(){}",
				"",
				"function update( progress ){",
				"",
				"\tdom.style.backgroundColor = 'rgb(0,' + Math.floor( progress * 255 ) + ',0)';",
				"",
				"}"
			]
		]
	],
	"animations": [
		[
			"",
			0,
			4.23,
			0,
			0,
			true
		],
		[
			"",
			5,
			13,
			1,
			1,
			true
		]
	]
};

	// if ( window.localStorage[ name ] !== undefined ) {

	// 	var data = JSON.parse( window.localStorage[ name ] );

	// 	for ( var key in data ) {

	// 		storage[ key ] = data[ key ];

	// 	}

	// }

	return {

		getKey: function ( key ) {

			return storage[ key ];

		},

		setKey: function () { // key, value, key, value ...

			// for ( var i = 0, l = arguments.length; i < l; i += 2 ) {

			// 	storage[ arguments[ i ] ] = arguments[ i + 1 ];

			// }

			// window.localStorage[ name ] = JSON.stringify( storage );

			// console.log( '[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Saved config to LocalStorage.' );

		},

		clear: function () {

			// delete window.localStorage[ name ];

		}

	};

};


var Editor = function () {

	var Signal = signals.Signal;

	this.signals = {

		editorCleared: new Signal(),

		// libraries

		libraryAdded: new Signal(),

		// includes

		includeAdded: new Signal(),
		includeSelected: new Signal(),
		includeChanged: new Signal(),
		includeRemoved: new Signal(),
		includesCleared: new Signal(),

		// effects

		effectAdded: new Signal(),
		effectRenamed: new Signal(),
		effectRemoved: new Signal(),
		effectSelected: new Signal(),
		effectCompiled: new Signal(),

		// actions

		fullscreen: new Signal(),
		exportState: new Signal(),

		// animations

		animationRenamed: new Signal(),
		animationAdded: new Signal(),
		animationModified: new Signal(),
		animationRemoved: new Signal(),
		animationSelected: new Signal(),

		// curves

		curveAdded: new Signal(),

		// events

		playingChanged: new Signal(),
		playbackRateChanged: new Signal(),
		timeChanged: new Signal(),
		timelineScaled: new Signal(),

		windowResized: new Signal()

	};

	this.config = new Config();

	this.player = new FRAME.Player();
	this.resources = new FRAME.Resources();

	this.duration = 500;

	this.libraries = [];
	this.includes = [];
	this.effects = [];
	this.timeline = new FRAME.Timeline();

	this.selected = null;

	// signals

	var scope = this;

	this.signals.animationModified.add( function () {

		scope.timeline.reset();
		scope.timeline.sort();

		try {

			scope.timeline.update( scope.player.currentTime );

		} catch ( e ) {

			console.error( e );

		}

	} );

	this.signals.effectCompiled.add( function () {

		try {

			scope.timeline.update( scope.player.currentTime );

		} catch ( e ) {

			console.error( e );

		}

	} );

	this.signals.timeChanged.add( function () {

		try {

			scope.timeline.update( scope.player.currentTime );

		} catch ( e ) {

			console.error( e );

		}

	} );

	// Animate

	var prevTime = 0;

	function animate( time ) {

		scope.player.tick( time - prevTime );

		if ( scope.player.isPlaying ) {

			scope.signals.timeChanged.dispatch( scope.player.currentTime );

		}

		prevTime = time;

		requestAnimationFrame( animate );

	}

	requestAnimationFrame( animate );

};

Editor.prototype = {

	play: function () {

		this.player.play();
		this.signals.playingChanged.dispatch( true );

	},

	stop: function () {

		this.player.pause();
		this.signals.playingChanged.dispatch( false );

	},

	speedUp: function () {

		this.player.playbackRate += 0.1;
		this.signals.playbackRateChanged.dispatch( this.player.playbackRate );

	},

	speedDown: function () {

		this.player.playbackRate -= 0.1;
		this.signals.playbackRateChanged.dispatch( this.player.playbackRate );

	},

	setTime: function ( time ) {

		// location.hash = time;

		this.player.currentTime = Math.max( 0, time );
		this.signals.timeChanged.dispatch( this.player.currentTime );

	},

	// libraries

	addLibrary: function ( url, content ) {

		var script = document.createElement( 'script' );
		script.id = 'library-' + this.libraries.length;
		script.textContent = content;
		document.head.appendChild( script );

		this.libraries.push( url );
		this.signals.libraryAdded.dispatch();

	},

	// includes

	addInclude: function ( name, source ) {

		try {
			new Function( 'resources', source )( this.resources );
		} catch ( e ) {
			console.error( e );
		}

		this.includes.push( { name: name, source: source } );
		this.signals.includeAdded.dispatch();

	},

	removeInclude: function ( include ) {

		var index = this.includes.indexOf( include );

		this.includes.splice( index, 1 );
		this.signals.includeRemoved.dispatch();

	},

	selectInclude: function ( include ) {

		this.signals.includeSelected.dispatch( include );

	},

	reloadIncludes: function () {

		var includes = this.includes;

		this.signals.includesCleared.dispatch();

		for ( var i = 0; i < includes.length; i ++ ) {

			var include = includes[ i ];

			try {
				new Function( 'resources', include.source )( this.resources );
			} catch ( e ) {
				console.error( e );
			}

		}

	},

	// effects

	addEffect: function ( effect ) {

		this.effects.push( effect );
		this.signals.effectAdded.dispatch( effect );

	},

	selectEffect: function ( effect ) {

		this.signals.effectSelected.dispatch( effect );

	},

	removeEffect: function ( effect ) {

		var index = this.effects.indexOf( effect );

		if ( index >= 0 ) {

			this.effects.splice( index, 1 );
			this.signals.effectRemoved.dispatch( effect );

		}

	},

	compileEffect: function ( effect ) {

		try {

			effect.compile( this.resources, this.player );

		} catch ( e ) {

			console.error( e );

		}

		this.signals.effectCompiled.dispatch( effect );

	},

	// Remove any effects that are not bound to any animations.

	cleanEffects: function () {

		var scope = this;
		var effects = this.effects.slice( 0 );
		var animations = this.timeline.animations;

		effects.forEach( function ( effect, i ) {

			var bound = false;

			for ( var j = 0; j < animations.length; j++ ) {

				var animation = animations[ j ];

				if ( animation.effect === effect ) {

					bound = true;
					break;

				}

			}

			if ( bound === false ) {

				scope.removeEffect( effect );

			}

		} );

	},

	// animations

	addAnimation: function ( animation ) {

		var effect = animation.effect;

		if ( effect.program === null ) {

			this.compileEffect( effect );

		}

		this.timeline.add( animation );
		this.signals.animationAdded.dispatch( animation );

	},

	selectAnimation: function ( animation ) {

		if ( this.selected === animation ) return;

		this.selected = animation;
		this.signals.animationSelected.dispatch( animation );

	},

	removeAnimation: function ( animation ) {

		this.timeline.remove( animation );
		this.signals.animationRemoved.dispatch( animation );

	},

	addCurve: function ( curve ) {

		this.timeline.curves.push( curve );
		this.signals.curveAdded.dispatch( curve );

	},

	clear: function () {

		this.libraries = [];
		this.includes = [];
		this.effects = [];

		while ( this.timeline.animations.length > 0 ) {

			this.removeAnimation( this.timeline.animations[ 0 ] );

		}

		this.signals.editorCleared.dispatch();

	},

	fromJSON: function ( json ) {

		function loadFile( url, onLoad ) {

			var request = new XMLHttpRequest();
			request.open( 'GET', url, true );
			request.addEventListener( 'load', function ( event ) {

				onLoad( event.target.response );

			} );
			request.send( null );

		}

		function loadLibraries( libraries, onLoad ) {

			var count = 0;

			function loadNext() {

				if ( count === libraries.length ) {

					onLoad();
					return;

				}

				var url = libraries[ count ++ ];

				loadFile( url, function ( content ) {

					scope.addLibrary( url, content );
					loadNext();

				} );

			}

			loadNext();

		}

		var scope = this;

		var libraries = json.libraries || [];

		loadLibraries( libraries, function () {

			var includes = json.includes;

			for ( var i = 0, l = includes.length; i < l; i ++ ) {

				var data = includes[ i ];

				var name = data[ 0 ];
				var source = data[ 1 ];

				if ( Array.isArray( source ) ) source = source.join( '\n' );

				scope.addInclude( name, source );

			}

			var effects = json.effects;

			for ( var i = 0, l = effects.length; i < l; i ++ ) {

				var data = effects[ i ];

				var name = data[ 0 ];
				var source = data[ 1 ];

				if ( Array.isArray( source ) ) source = source.join( '\n' );

				scope.addEffect( new FRAME.Effect( name, source ) );

			}

			var animations = json.animations;

			for ( var i = 0, l = animations.length; i < l; i ++ ) {

				var data = animations[ i ];

				var animation = new FRAME.Animation(
					data[ 0 ],
					data[ 1 ],
					data[ 2 ],
					data[ 3 ],
					scope.effects[ data[ 4 ] ],
					data[ 5 ]
				);

				scope.addAnimation( animation );

			}

			scope.setTime( 0 );

		} );

	},

	toJSON: function () {

		var json = {
			"config": {},
			"libraries": this.libraries.slice(),
			"includes": [],
			"effects": [],
			// "curves": [],
			"animations": []
		};

		/*
		// curves

		var curves = this.timeline.curves;

		for ( var i = 0, l = curves.length; i < l; i ++ ) {

			var curve = curves[ i ];

			if ( curve instanceof FRAME.Curves.Linear ) {

				json.curves.push( [ 'linear', curve.points ] );

			}

		}
		*/

		// includes

		var includes = this.includes;

		for ( var i = 0, l = includes.length; i < l; i ++ ) {

			var include = includes[ i ];

			var name = include.name;
			var source = include.source;

			json.includes.push( [ name, source.split( '\n' ) ] );

		}

		// effects

		var effects = this.effects;

		for ( var i = 0, l = effects.length; i < l; i ++ ) {

			var effect = effects[ i ];

			var name = effect.name;
			var source = effect.source;

			json.effects.push( [ name, source.split( '\n' ) ] );

		}

		// animations

		var animations = this.timeline.animations;

		for ( var i = 0, l = animations.length; i < l; i ++ ) {

			var animation = animations[ i ];
			var effect = animation.effect;

			/*
			var parameters = {};

			for ( var key in module.parameters ) {

				parameters[ key ] = module.parameters[ key ].value;

			}
			*/

			json.animations.push( [
				animation.name,
				animation.start,
				animation.end,
				animation.layer,
				this.effects.indexOf( animation.effect ),
				animation.enabled
			] );

		}

		return json;

	}

};



var Controls = function ( editor, my ) {

	// console.log(my)

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'controls' );

	var row = new UI.Row();
	row.setPadding( '6px' );
	container.add( row );

	// var prevButton = new UI.Button();
	// prevButton.setBackground( 'url(files/prev.svg)' );
	// prevButton.setWidth( '20px' );
	// prevButton.setHeight( '20px' );
	// prevButton.setMarginRight( '4px' );
	// prevButton.setVerticalAlign( 'middle' );
	// prevButton.onClick( function () {

	// 	editor.setTime( editor.player.currentTime - 1 );

	// } );
	// row.add( prevButton );

	var playButton = new UI.Button();
	playButton.setBackground( 'url(files/play.svg)' );
	playButton.setWidth( '20px' );
	playButton.setHeight( '20px' );
	playButton.setMarginRight( '4px' );
	playButton.setVerticalAlign( 'middle' );
	playButton.onClick( function () {

		if (editor.player.isPlaying) {
			editor.stop();	
			// my.player.pause();
		} else {
			editor.play();
			// my.player.play();
		}
		// editor.player.isPlaying ? editor.stop() : editor.play();
		// editor.player.isPlaying ? my.player.pause() : my.player.play();

	} );
	row.add( playButton );

	// var nextButton = new UI.Button();
	// nextButton.setBackground( 'url(files/next.svg)' );
	// nextButton.setWidth( '20px' );
	// nextButton.setHeight( '20px' );
	// nextButton.setMarginRight( '4px' );
	// nextButton.setVerticalAlign( 'middle' );
	// nextButton.onClick( function () {

	// 	editor.setTime( editor.player.currentTime + 1 );

	// } );
	// row.add( nextButton );

	function ignoreKeys( event ) {

		switch ( event.keyCode ) {

			case 13: case 32: event.preventDefault();

		}

	};

	// prevButton.onKeyDown( ignoreKeys );
	playButton.onKeyDown( ignoreKeys );
	// nextButton.onKeyDown( ignoreKeys );

	var timeText = new UI.Text();
	timeText.setColor( '#bbb' );
	timeText.setWidth( '60px' );
	timeText.setMarginLeft( '10px' );
	timeText.setValue( '0:00.00' );
	row.add( timeText );

	function updateTimeText( value ) {

		var minutes = Math.floor( value / 60 );
		var seconds = value % 60;
		var padding = seconds < 10 ? '0' : '';

		timeText.setValue( minutes + ':' + padding + seconds.toFixed( 2 ) );

	}

	// var playbackRateText = new UI.Text();
	// playbackRateText.setColor( '#999' );
	// playbackRateText.setMarginLeft( '8px' );
	// playbackRateText.setValue( '1.0x' );
	// row.add( playbackRateText );

	// function updatePlaybackRateText( value ) {

	// 	playbackRateText.setValue( value.toFixed( 1 ) + 'x' );

	// }

	// var fullscreenButton = new UI.Button();
	// fullscreenButton.setBackground( 'url(files/fullscreen.svg)' );
	// fullscreenButton.setWidth( '20px' );
	// fullscreenButton.setHeight( '20px' );
	// fullscreenButton.setFloat( 'right' );
	// fullscreenButton.setVerticalAlign( 'middle' );
	// fullscreenButton.onClick( function () {

	// 	editor.signals.fullscreen.dispatch();

	// } );
	// row.add( fullscreenButton );

	//

	signals.playingChanged.add( function ( isPlaying ) {

		playButton.setBackground( isPlaying ? 'url(files/pause.svg)' : 'url(files/play.svg)' )

	} );

	signals.playbackRateChanged.add( function ( value ) {

		updatePlaybackRateText( value );

	} );

	signals.timeChanged.add( function ( value ) {

		updateTimeText( value );

	} );

	return container;

};



var Timeline = function ( editor, my ) {

	var signals = editor.signals;
	var player = editor.player;

	var container = new UI.Panel();
	container.setId( 'timeline' );

	// controls

	/*
	var buttons = new UI.Div();
	buttons.setPosition( 'absolute' );
	buttons.setTop( '5px' );
	buttons.setRight( '5px' );
	controls.add( buttons );

	var button = new UI.Button();
	button.setLabel( 'ANIMATIONS' );
	button.onClick( function () {

		elements.setDisplay( '' );
		curves.setDisplay( 'none' );

	 } );
	buttons.add( button );

	var button = new UI.Button();
	button.setLabel( 'CURVES' );
	button.setMarginLeft( '4px' );
	button.onClick( function () {

		scroller.style.background = '';

		elements.setDisplay( 'none' );
		curves.setDisplay( '' );

	} );
	buttons.add( button );
	*/

	// timeline

	var keysDown = {};
	document.addEventListener( 'keydown', function ( event ) { keysDown[ event.keyCode ] = true; } );
	document.addEventListener( 'keyup',   function ( event ) { keysDown[ event.keyCode ] = false; } );

	var scale = 32;
	var prevScale = scale;

	var timeline = new UI.Panel();
	timeline.setPosition( 'absolute' );
	timeline.setTop( '0px' );
	timeline.setBottom( '0px' );
	timeline.setWidth( '100%' );
	timeline.setOverflow( 'hidden' );
	timeline.dom.addEventListener( 'wheel', function ( event ) {

		if ( event.altKey === true ) {

			event.preventDefault();

			scale = Math.max( 2, scale + ( event.deltaY / 10 ) );

			signals.timelineScaled.dispatch( scale );

		}

	} );
	container.add( timeline );

	var canvas = document.createElement( 'canvas' );
	canvas.height = 32;
	canvas.style.position = 'absolute';
	canvas.addEventListener( 'mousedown', function ( event ) {



		event.preventDefault();

		function onMouseMove( event ) {

			editor.setTime( ( event.offsetX + scroller.scrollLeft ) / scale );
			if (my.settings.timeLineClick) {
				my.player.currentTime(player.currentTime)
			}

		}

		function onMouseUp( event ) {

			onMouseMove( event );

			document.removeEventListener( 'mousemove', onMouseMove );
			document.removeEventListener( 'mouseup', onMouseUp );

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}, false );
	timeline.dom.appendChild( canvas );

	function updateMarks() {

		canvas.width = scroller.clientWidth;

		var context = canvas.getContext( '2d', { alpha: false } );

		context.fillStyle = '#555';
		context.fillRect( 0, 0, canvas.width, canvas.height );

		context.strokeStyle = '#888';
		context.beginPath();

		context.translate( - scroller.scrollLeft, 0 );

		// console.log(editor.duration)
		var duration = editor.duration;
		var width = duration * scale;
		var scale4 = scale / 4;

		for ( var i = 0.5; i <= width; i += scale ) {

			context.moveTo( i + ( scale4 * 0 ), 18 ); context.lineTo( i + ( scale4 * 0 ), 26 );

			if ( scale > 16 ) context.moveTo( i + ( scale4 * 1 ), 22 ), context.lineTo( i + ( scale4 * 1 ), 26 );
			if ( scale >  8 ) context.moveTo( i + ( scale4 * 2 ), 22 ), context.lineTo( i + ( scale4 * 2 ), 26 );
			if ( scale > 16 ) context.moveTo( i + ( scale4 * 3 ), 22 ), context.lineTo( i + ( scale4 * 3 ), 26 );

		}

		context.stroke();

		context.font = '10px Arial';
		context.fillStyle = '#888'
		context.textAlign = 'center';

		var step = Math.max( 1, Math.floor( 64 / scale ) );

		for ( var i = 0; i < duration; i += step ) {

			var minute = Math.floor( i / 60 );
			var second = Math.floor( i % 60 );

			var text = ( minute > 0 ? minute + ':' : '' ) + ( '0' + second ).slice( - 2 );

			context.fillText( text, i * scale, 13 );

		}

	}

	var scroller = document.createElement( 'div' );
	scroller.style.position = 'absolute';
	scroller.style.top = '32px';
	scroller.style.bottom = '0px';
	scroller.style.height = '70px';
	scroller.style.width = '100%';
	scroller.style.overflow = 'auto';
	scroller.addEventListener( 'scroll', function ( event ) {

		updateMarks();
		updateTimeMark();

	}, false );
	timeline.dom.appendChild( scroller );

	var elements = new Timeline.Animations( editor, my );
	scroller.appendChild( elements.dom );

	/*
	var curves = new Timeline.Curves( editor );
	curves.setDisplay( 'none' );
	scroller.appendChild( curves.dom );
	*/

	function updateContainers() {

		var width = editor.duration * scale;

		elements.setWidth( width + 'px' );
		// curves.setWidth( width + 'px' );

	}

	//

	var loopMark = document.createElement( 'div' );
	loopMark.style.position = 'absolute';
	loopMark.style.top = 0;
	loopMark.style.height = 100 + '%';
	loopMark.style.width = 0;
	loopMark.style.background = 'rgba( 255, 255, 255, 0.1 )';
	loopMark.style.pointerEvents = 'none';
	loopMark.style.display = 'none';
	timeline.dom.appendChild( loopMark );

	var timeMark = document.createElement( 'div' );
	timeMark.style.position = 'absolute';
	timeMark.style.top = '0px';
	timeMark.style.left = '-8px';
	timeMark.style.width = '16px';
	timeMark.style.height = '100%';
	timeMark.style.background = 'linear-gradient(90deg, transparent 8px, #f00 8px, #f00 9px, transparent 9px) 0% 0% / 16px 16px repeat-y';
	timeMark.style.pointerEvents = 'none';
	timeline.dom.appendChild( timeMark );

	function updateTimeMark() {

		timeMark.style.left = ( player.currentTime * scale ) - scroller.scrollLeft - 8 + 'px';

		// TODO Optimise this

		var loop = player.getLoop();

		if ( Array.isArray( loop ) ) {

			var loopStart = loop[ 0 ] * scale;
			var loopEnd = loop[ 1 ] * scale;

			loopMark.style.display = '';
			loopMark.style.left = ( loopStart - scroller.scrollLeft ) + 'px';
			loopMark.style.width = ( loopEnd - loopStart ) + 'px';

		} else {

			loopMark.style.display = 'none';

		}

	}

	// signals

	signals.timeChanged.add( function () {
		// console.log('time changed canvas')
		// if (my.settings.timeLineClick) {
		// 	my.player.currentTime(player.currentTime)
		// }
		updateTimeMark();

	} );

	signals.timelineScaled.add( function ( value ) {

		scale = value;

		scroller.scrollLeft = ( scroller.scrollLeft * value ) / prevScale;

		updateMarks();
		updateTimeMark();
		updateContainers();

		prevScale = value;

	} );

	signals.windowResized.add( function () {

		updateMarks();
		updateContainers();

	} );

	return container;

};



Timeline.Animations = function ( editor, my ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setHeight( '1%' );
	container.setBackground( 'linear-gradient(#444 1px, transparent 1px) 0% 0% / 32px 32px repeat' );

	var scale = 32;

	var Block = ( function ( animation ) {

		var scope = this;

		var dom = document.createElement( 'div' );
		dom.className = 'block';
		dom.style.position = 'absolute';
		dom.style.height = '30px';
		dom.style.margin = '10px 0 0 0';

		dom.addEventListener( 'click', function ( event ) {

			// console.log(animation)
			if(my.settings.timeLineClick) {
				my.editor.setTime(animation.start)
				my.player.currentTime(animation.start)
			}
			editor.selectAnimation( animation );

		} );

		dom.addEventListener( 'input', function ( event ) {
			let cueInput = document.querySelector("div[data-begin='" + animation.start + "']").querySelector(".transcript-text")
			cueInput.value = event.target.value;
			my.track.mode = "hidden";
			my.activeCues[cueInput.getAttribute('cue')].text = event.target.value
	        my.track.mode = "showing";
			// console.log(cueInput.getAttribute('cue'))
			// cueInput.dispatchEvent(new Event('input', { bubbles: true }))
			// this.dispatchEvent(new Event('click', { bubbles: true }));
		} );
		// dom.addEventListener( 'mousedown', function ( event ) {

		// 	var movementX = 0;
		// 	var movementY = 0;

		// 	function onMouseMove( event ) {

		// 		movementX = event.movementX | event.webkitMovementX | event.mozMovementX | 0;

		// 		animation.start += movementX / scale;
		// 		animation.end += movementX / scale;

		// 		if ( animation.start < 0 ) {

		// 			var offset = - animation.start;

		// 			animation.start += offset;
		// 			animation.end += offset;

		// 		}

		// 		movementY += event.movementY | event.webkitMovementY | event.mozMovementY | 0;

		// 		if ( movementY >= 30 ) {

		// 			animation.layer = animation.layer + 1;
		// 			movementY = 0;

		// 		}

		// 		if ( movementY <= -30 ) {

		// 			animation.layer = Math.max( 0, animation.layer - 1 );
		// 			movementY = 0;

		// 		}

		// 		signals.animationModified.dispatch( animation );

		// 	}

		// 	function onMouseUp( event ) {

		// 		document.removeEventListener( 'mousemove', onMouseMove );
		// 		document.removeEventListener( 'mouseup', onMouseUp );

		// 	}

		// 	document.addEventListener( 'mousemove', onMouseMove, false );
		// 	document.addEventListener( 'mouseup', onMouseUp, false );

		// }, false );

		var resizeLeft = document.createElement( 'div' );
		resizeLeft.style.position = 'absolute';
		resizeLeft.style.width = '6px';
		resizeLeft.style.height = '30px';
		resizeLeft.style.cursor = 'w-resize';
		resizeLeft.addEventListener( 'mousedown', function ( event ) {
			console.log('res left')

			event.stopPropagation();

			var movementX = 0;

			function onMouseMove( event ) {

				movementX = event.movementX | event.webkitMovementX | event.mozMovementX | 0;

				animation.start += movementX / scale;

				signals.animationModified.dispatch( animation );

			}

			function onMouseUp( event ) {

				if ( Math.abs( movementX ) < 2 ) {

					editor.selectAnimation( animation );

				}

				document.removeEventListener( 'mousemove', onMouseMove );
				document.removeEventListener( 'mouseup', onMouseUp );

			}

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

		}, false );
		// dom.appendChild( resizeLeft );

		var name = document.createElement( 'div' );
		name.className = 'name';
		dom.appendChild( name );

		var resizeRight = document.createElement( 'div' );
		resizeRight.style.position = 'absolute';
		resizeRight.style.right = '0px';
		resizeRight.style.top = '0px';
		resizeRight.style.width = '6px';
		resizeRight.style.height = '30px';
		resizeRight.style.cursor = 'e-resize';
		resizeRight.addEventListener( 'mousedown', function ( event ) {

			event.stopPropagation();

			var movementX = 0;

			function onMouseMove( event ) {

				movementX = event.movementX | event.webkitMovementX | event.mozMovementX | 0;

				animation.end += movementX / scale;

				signals.animationModified.dispatch( animation );

			}

			function onMouseUp( event ) {

				if ( Math.abs( movementX ) < 2 ) {

					editor.selectAnimation( animation );

				}

				document.removeEventListener( 'mousemove', onMouseMove );
				document.removeEventListener( 'mouseup', onMouseUp );

			}

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

		}, false );
		// dom.appendChild( resizeRight );

		//

		function getAnimation() {

			return animation;

		}

		function select() {

			dom.classList.add( 'selected' );

		}

		function deselect() {

			dom.classList.remove( 'selected' );

		}

		function update() {

			animation.enabled === false ? dom.classList.add( 'disabled' ) : dom.classList.remove( 'disabled' );

			dom.style.left = ( animation.start * scale ) + 'px';
			dom.style.top = ( animation.layer * 32 ) + 'px';
			dom.style.width = ( ( animation.end - animation.start ) * scale - 2 ) + 'px';
			// console.log(animation)

			// name.innerHTML = animation.name + ' <span style="opacity:0.5">' + animation.effect.name + '</span>';
			name.innerHTML = '<input style="width:100%;height:23px;" value="' + animation.name + '">';

		}

		update();

		return {
			dom: dom,
			getAnimation: getAnimation,
			select: select,
			deselect: deselect,
			update: update
		};

	} );

	// container.dom.addEventListener( 'dblclick', function ( event ) {

	// 	var start = event.offsetX / scale;
	// 	var end = start + 2;
	// 	var layer = Math.floor( event.offsetY / 32 );

	// 	var effect = new FRAME.Effect( 'Effect' );
	// 	editor.addEffect( effect );

	// 	var animation = new FRAME.Animation( 'Animation', start, end, layer, effect );
	// 	editor.addAnimation( animation );

	// } );

	// signals

	var blocks = {};
	var selected = null;

	signals.animationAdded.add( function ( animation ) {

		var block = new Block( animation );
		container.dom.appendChild( block.dom );

		blocks[ animation.id ] = block;

	} );

	signals.animationModified.add( function ( animation ) {

		blocks[ animation.id ].update();

	} );

	signals.animationSelected.add( function ( animation ) {

		if ( blocks[ selected ] !== undefined ) {

			blocks[ selected ].deselect();

		}

		if ( animation === null ) return;

		selected = animation.id;
		blocks[ selected ].select();

	} );

	signals.animationRemoved.add( function ( animation ) {

			var block = blocks[ animation.id ];
			container.dom.removeChild( block.dom );

			delete blocks[ animation.id ];

	} );

	signals.timelineScaled.add( function ( value ) {

		scale = value;

		for ( var key in blocks ) {

			blocks[ key ].update();

		}

	} );

	signals.animationRenamed.add( function ( animation ) {

		blocks[ animation.id ].update();

	} );

	signals.effectRenamed.add( function ( effect ) {

		for ( var key in blocks ) {

			var block = blocks[ key ];

			if ( block.getAnimation().effect === effect ) {

				block.update();

			}

		}

	} );

	return container;

};



Timeline.Curves = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	var selected = null;
	var scale = 32;

	var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
	svg.style.position = 'fixed';
	svg.setAttribute( 'width', 2048 );
	svg.setAttribute( 'height', 128 );
	container.dom.appendChild( svg );

	var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
	path.setAttribute( 'style', 'stroke: #444444; stroke-width: 1px; fill: none;' );
	path.setAttribute( 'd', 'M 0 64 2048 65');
	svg.appendChild( path );

	var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
	path.setAttribute( 'style', 'stroke: #00ff00; stroke-width: 1px; fill: none;' );
	svg.appendChild( path );

	function drawCurve() {

		/*
		var curve = selected;
		var drawing = '';

		for ( var i = 0; i <= 2048; i ++ ) {

			curve.update( i / scale );

			drawing += ( i === 0 ? 'M' : 'L' ) + i + ' ' + ( ( 1 - curve.value ) * 64 ) + ' ';

		}

		path.setAttribute( 'd', drawing );
		*/

	}

	// signals

	signals.curveAdded.add( function ( curve ) {

		if ( curve instanceof FRAME.Curves.Saw ) {

			selected = curve;

			drawCurve();

		}

	} );

	signals.timelineScaled.add( function ( value ) {

		scale = value;

		drawCurve();

	} );

	return container;

};



var FRAME = {

	VERSION: 4,

	Player: function () {

		var audio = null;

		var isPlaying = false;

		var currentTime = 0;
		var playbackRate = 1;

		var loop = null;

		return {
			get isPlaying() {
				return isPlaying;
			},
			get currentTime() {
				if ( audio ) return audio.currentTime;
				return currentTime;
			},
			set currentTime( value ) {
				if ( audio ) audio.currentTime = value;
				currentTime = value;
			},
			get playbackRate() {
				if ( audio ) return audio.playbackRate;
				return playbackRate;
			},
			set playbackRate( value ) {
				playbackRate = value;
				if ( audio ) audio.playbackRate = value;
			},
			getAudio: function () {
				return audio;
			},
			setAudio: function ( value ) {
				if ( audio ) audio.pause();
				if ( value ) {
					value.currentTime = currentTime;
					if ( isPlaying ) value.play();
				}
				audio = value;
			},
			getLoop: function () {
				return loop;
			},
			setLoop: function ( value ) {
				loop = value;
			},
			play: function () {
				if ( audio ) audio.play();
				isPlaying = true;
			},
			pause: function () {
				if ( audio ) audio.pause();
				isPlaying = false;
			},
			tick: function ( delta ) {
				if ( audio ) {
					currentTime = audio.currentTime;
				} else if ( isPlaying ) {
					currentTime += ( delta / 1000 ) * playbackRate;
				}
				if ( loop ) {
					if ( currentTime > loop[ 1 ] ) currentTime = loop[ 0 ];
				}
			}

		}

	},

	Resources: function () {

		var resources = {};

		return {

			get: function ( name ) {

				return resources[ name ];

			},

			set: function ( name, resource ) {

				resources[ name ] = resource;

			}

		}

	},

	//

	/*
	Curves: {

		Linear: function ( points ) {

			function linear( p0, p1, t0, t1, t ) {

				return ( p1 - p0 ) * ( ( t - t0 ) / ( t1 - t0 ) ) + p0;

			}

			this.points = points;
			this.value = 0;

			this.update = function ( time ) {

				if ( time <= points[ 0 ] ) {

					this.value = points[ 1 ];

				} else if ( time >= points[ points.length - 2 ] ) {

					this.value = points[ points.length - 1 ];

				} else {

					for ( var i = 0, l = points.length; i < l; i += 2 ) {

						if ( time < points[ i + 2 ] ) {

							this.value = linear( points[ i + 1 ], points[ i + 3 ], points[ i ], points[ i + 2 ], time );
							break;

						}

					}

				}

			};

		},

		Sin: function () {

			var frequency = 10;

			this.value = 0;

			this.update = function ( time ) {

				this.value = Math.sin( time * frequency );

			};

		},

		Saw: function ( frequency, offset, min, max ) {

			var delta = max - min;

			this.frequency = frequency;
			this.offset = offset;
			this.min = min;
			this.max = max;
			this.value = 0;

			this.update = function ( time ) {

				this.value = ( ( ( time - offset ) % frequency ) / frequency ) * delta + min;

			};

		}

	},
	*/

	Parameters: {

		Boolean: function ( name, value ) {
			this.name = name;
			this.value = value !== undefined ? value : true;
		},

		Color: function ( name, value ) {
			this.name = name;
			this.value = value !== undefined ? value : 0xffffff;
		},

		Float: function ( name, value, min, max ) {
			this.name = name;
			this.value = value || 0.0;
			this.min = min !== undefined ? min : - Infinity;
			this.max = max !== undefined ? max : Infinity;
		},

		Integer: function ( name, value, min, max ) {
			this.name = name;
			this.value = value || 0;
			this.min = min !== undefined ? min : - Infinity;
			this.max = max !== undefined ? max : Infinity;
		},

		String: function ( name, value ) {
			this.name = name;
			this.value = value !== undefined ? value : '';
		},

		Vector2: function ( name, value ) {
			this.name = name;
			this.value = value !== undefined ? value : [ 0, 0 ];
		},

		Vector3: function ( name, value ) {
			this.name = name;
			this.value = value !== undefined ? value : [ 0, 0, 0 ];
		}

	},

	Effect: function ( name, source ) {

		this.name = name;
		this.source = source || 'var parameters = {\n\tvalue: new FRAME.Parameters.Float( \'Value\', 1.0 )\n};\n\nfunction start(){}\n\nfunction end(){}\n\nfunction update( progress ){}';
		this.program = null;
		this.compile = function ( resources, player ) {

			this.program = ( new Function( 'resources, player, parameters, start, end, update', this.source + '\nreturn { parameters: parameters, start: start, end: end, update: update };' ) )( resources, player );

		};

	},

	Animation: function () {

		var id = 0;

		return function ( name, start, end, layer, effect, enabled ) {

			if ( enabled === undefined ) enabled = true; // TODO remove this

			this.id = id ++;
			this.name = name;
			this.start = start;
			this.end = end;
			this.layer = layer;
			this.effect = effect;
			this.enabled = enabled;

		};

	}(),

	Timeline: function () {

		var includes = [];
		var effects = [];

		var animations = [];
		var curves = [];

		var active = [];

		var next = 0, prevtime = 0;

		function layerSort( a, b ) { return a.layer - b.layer; }
		function startSort( a, b ) { return a.start === b.start ? layerSort( a, b ) : a.start - b.start; }

		function loadFile( url, onLoad ) {

			var request = new XMLHttpRequest();
			request.open( 'GET', url, true );
			request.addEventListener( 'load', function ( event ) {

				onLoad( event.target.response );

			} );
			request.send( null );

		}

		return {

			animations: animations,
			curves: curves,

			load: function ( url, onLoad ) {

				var scope = this;

				loadFile( url, function ( text ) {

					scope.parse( JSON.parse( text ), onLoad );

				} );

			},

			loadLibraries: function ( libraries, onLoad ) {

				var count = 0;

				function loadNext() {

					if ( count === libraries.length ) {

						onLoad();
						return;

					}

					var url = libraries[ count ++ ];

					loadFile( url, function ( content ) {

						var script = document.createElement( 'script' );
						script.id = 'library-' + count;
						script.textContent = '( function () { ' + content + '} )()';
						document.head.appendChild( script );

						loadNext();

					} );


				}

				loadNext();

			},

			parse: function ( json, onLoad ) {

				var scope = this;

				var libraries = json.libraries || [];

				this.loadLibraries( libraries, function () {

					// Includes

					for ( var i = 0; i < json.includes.length; i ++ ) {

						var data = json.includes[ i ];
						var name = data[ 0 ];
						var source = data[ 1 ];

						if ( Array.isArray( source ) ) source = source.join( '\n' );

						includes.push( new FRAME.Effect( name, source ) );

					}

					// Effects

					for ( var i = 0; i < json.effects.length; i ++ ) {

						var data = json.effects[ i ];

						var name = data[ 0 ];
						var source = data[ 1 ];

						if ( Array.isArray( source ) ) source = source.join( '\n' );

						effects.push( new FRAME.Effect( name, source ) );

					}

					for ( var i = 0; i < json.animations.length; i ++ ) {

						var data = json.animations[ i ];

						var animation = new FRAME.Animation(
							data[ 0 ],
							data[ 1 ],
							data[ 2 ],
							data[ 3 ],
							effects[ data[ 4 ] ],
							data[ 5 ]
						);

						animations.push( animation );

					}

					scope.sort();

					if ( onLoad ) onLoad();

				} );

			},

			compile: function ( resources, player ) {

				var animations = this.animations;

				for ( var i = 0, l = includes.length; i < l; i++ ) {

					var include = includes[ i ];

					if ( include.program === null ) {

						include.compile( resources, player );

					}

				}

				for ( var i = 0, l = animations.length; i < l; i ++ ) {

					var animation = animations[ i ];

					if ( animation.effect.program === null ) {

						animation.effect.compile( resources, player );

					}

				}

			},

			add: function ( animation ) {

				animations.push( animation );
				this.sort();

			},

			remove: function ( animation ) {

				var i = animations.indexOf( animation );

				if ( i !== -1 ) {

					animations.splice( i, 1 );

				}

			},

			sort: function () {

				animations.sort( startSort );

			},

			update: function ( time ) {

				if ( prevtime > time ) {

					this.reset();

				}

				var animation;

				// add to active

				while ( animations[ next ] ) {

					animation = animations[ next ];

					if ( animation.enabled ) {

						if ( animation.start > time ) break;

						if ( animation.end > time ) {

							if ( animation.effect.program.start ) {

								animation.effect.program.start();

							}

							active.push( animation );

						}

					}

					next ++;

				}

				// remove from active

				var i = 0;

				while ( active[ i ] ) {

					animation = active[ i ];

					if ( animation.start > time || animation.end < time ) {

						if ( animation.effect.program.end ) {

							animation.effect.program.end();

						}

						active.splice( i, 1 );

						continue;

					}

					i ++;

				}

				/*
				// update curves

				for ( var i = 0, l = curves.length; i < l; i ++ ) {

					curves[ i ].update( time, time - prevtime );

				}
				*/

				// render

				active.sort( layerSort );

				for ( var i = 0, l = active.length; i < l; i ++ ) {

					animation = active[ i ];
					animation.effect.program.update( ( time - animation.start ) / ( animation.end - animation.start ), time - prevtime );

				}

				prevtime = time;

			},

			reset: function () {

				while ( active.length ) {

					var animation = active.pop();
					var program = animation.effect.program;

					if ( program.end ) program.end();

				}

				next = 0;

			}

		};

	},

	// DEPRECATED

	getDOM: function () {

		console.error( 'FRAME.getDOM() has been removed.' );
		return document.createElement( 'div' );

	},

	setDOM: function ( value ) {

		console.error( 'FRAME.setDOM() has been removed.' );

	},

	addResource: function () {

		console.error( 'FRAME.addResource() has been removed.' );

	},

	getResource: function () {

		console.error( 'FRAME.getResource() has been removed.' );

	}

};


/*

 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 0.7.4 - Build: 252 (2012/02/24 10:30 PM)
*/
(function(h){function g(a,b,c,d,e){this._listener=b;this._isOnce=c;this.context=d;this._signal=a;this._priority=e||0}function f(a,b){if(typeof a!=="function")throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}",b));}var e={VERSION:"0.7.4"};g.prototype={active:!0,params:null,execute:function(a){var b;this.active&&this._listener&&(a=this.params?this.params.concat(a):a,b=this._listener.apply(this.context,a),this._isOnce&&this.detach());return b},detach:function(){return this.isBound()?
this._signal.remove(this._listener,this.context):null},isBound:function(){return!!this._signal&&!!this._listener},getListener:function(){return this._listener},_destroy:function(){delete this._signal;delete this._listener;delete this.context},isOnce:function(){return this._isOnce},toString:function(){return"[SignalBinding isOnce:"+this._isOnce+", isBound:"+this.isBound()+", active:"+this.active+"]"}};e.Signal=function(){this._bindings=[];this._prevParams=null};e.Signal.prototype={memorize:!1,_shouldPropagate:!0,
active:!0,_registerListener:function(a,b,c,d){var e=this._indexOfListener(a,c);if(e!==-1){if(a=this._bindings[e],a.isOnce()!==b)throw Error("You cannot add"+(b?"":"Once")+"() then add"+(!b?"":"Once")+"() the same listener without removing the relationship first.");}else a=new g(this,a,b,c,d),this._addBinding(a);this.memorize&&this._prevParams&&a.execute(this._prevParams);return a},_addBinding:function(a){var b=this._bindings.length;do--b;while(this._bindings[b]&&a._priority<=this._bindings[b]._priority);
this._bindings.splice(b+1,0,a)},_indexOfListener:function(a,b){for(var c=this._bindings.length,d;c--;)if(d=this._bindings[c],d._listener===a&&d.context===b)return c;return-1},has:function(a,b){return this._indexOfListener(a,b)!==-1},add:function(a,b,c){f(a,"add");return this._registerListener(a,!1,b,c)},addOnce:function(a,b,c){f(a,"addOnce");return this._registerListener(a,!0,b,c)},remove:function(a,b){f(a,"remove");var c=this._indexOfListener(a,b);c!==-1&&(this._bindings[c]._destroy(),this._bindings.splice(c,
1));return a},removeAll:function(){for(var a=this._bindings.length;a--;)this._bindings[a]._destroy();this._bindings.length=0},getNumListeners:function(){return this._bindings.length},halt:function(){this._shouldPropagate=!1},dispatch:function(a){if(this.active){var b=Array.prototype.slice.call(arguments),c=this._bindings.length,d;if(this.memorize)this._prevParams=b;if(c){d=this._bindings.slice();this._shouldPropagate=!0;do c--;while(d[c]&&this._shouldPropagate&&d[c].execute(b)!==!1)}}},forget:function(){this._prevParams=
null},dispose:function(){this.removeAll();delete this._bindings;delete this._prevParams},toString:function(){return"[Signal active:"+this.active+" numListeners:"+this.getNumListeners()+"]"}};typeof define==="function"&&define.amd?define(e):typeof module!=="undefined"&&module.exports?module.exports=e:h.signals=e})(this);


var UI = {};

UI.Element = function ( dom ) {

	this.dom = dom;

};

UI.Element.prototype = {

	add: function () {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var argument = arguments[ i ];

			if ( argument instanceof UI.Element ) {

				this.dom.appendChild( argument.dom );

			} else {

				console.error( 'UI.Element:', argument, 'is not an instance of UI.Element.' );

			}

		}

		return this;

	},

	remove: function () {

		for ( var i = 0; i < arguments.length; i ++ ) {

			var argument = arguments[ i ];

			if ( argument instanceof UI.Element ) {

				this.dom.removeChild( argument.dom );

			} else {

				console.error( 'UI.Element:', argument, 'is not an instance of UI.Element.' );

			}

		}

		return this;

	},

	clear: function () {

		while ( this.dom.children.length ) {

			this.dom.removeChild( this.dom.lastChild );

		}

	},

	setId: function ( id ) {

		this.dom.id = id;

		return this;

	},

	setClass: function ( name ) {

		this.dom.className = name;

		return this;

	},

	setStyle: function ( style, array ) {

		for ( var i = 0; i < array.length; i ++ ) {

			this.dom.style[ style ] = array[ i ];

		}

		return this;

	},

	setDisabled: function ( value ) {

		this.dom.disabled = value;

		return this;

	},

	setTextContent: function ( value ) {

		this.dom.textContent = value;

		return this;

	}

};

// properties

var properties = [
	'position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'display', 'float', 'overflow',
	'border', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor',
	'margin', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom',
	'padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
	'color', 'background', 'backgroundColor', 'opacity', 'verticalAlign',
	'fontSize', 'fontWeight', 'textAlign', 'textDecoration', 'textTransform', 'cursor', 'zIndex'
];

properties.forEach( function ( property ) {

	var method = 'set' + property.substr( 0, 1 ).toUpperCase() + property.substr( 1, property.length );

	UI.Element.prototype[ method ] = function () {

		this.setStyle( property, arguments );

		return this;

	};

} );

// events

var events = [ 'KeyUp', 'KeyDown', 'MouseOver', 'MouseOut', 'Click', 'DblClick', 'Change' ];

events.forEach( function ( event ) {

	var method = 'on' + event;

	UI.Element.prototype[ method ] = function ( callback ) {

		this.dom.addEventListener( event.toLowerCase(), callback.bind( this ), false );

		return this;

	};

} );

// Span

UI.Span = function () {

	UI.Element.call( this );

	this.dom = document.createElement( 'span' );

	return this;

};

UI.Span.prototype = Object.create( UI.Element.prototype );
UI.Span.prototype.constructor = UI.Span;

// Div

UI.Div = function () {

	UI.Element.call( this );

	this.dom = document.createElement( 'div' );

	return this;

};

UI.Div.prototype = Object.create( UI.Element.prototype );
UI.Div.prototype.constructor = UI.Div;

// Row

UI.Row = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Row';

	this.dom = dom;

	return this;

};

UI.Row.prototype = Object.create( UI.Element.prototype );
UI.Row.prototype.constructor = UI.Row;

// Panel

UI.Panel = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'div' );
	dom.className = 'Panel';

	this.dom = dom;

	return this;

};

UI.Panel.prototype = Object.create( UI.Element.prototype );
UI.Panel.prototype.constructor = UI.Panel;

// Text

UI.Text = function ( text ) {

	UI.Element.call( this );

	var dom = document.createElement( 'span' );
	dom.className = 'Text';
	dom.style.cursor = 'default';
	dom.style.display = 'inline-block';
	dom.style.verticalAlign = 'middle';

	this.dom = dom;
	this.setValue( text );

	return this;

};

UI.Text.prototype = Object.create( UI.Element.prototype );
UI.Text.prototype.constructor = UI.Text;

UI.Text.prototype.getValue = function () {

	return this.dom.textContent;

};

UI.Text.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.textContent = value;

	}

	return this;

};


// Input

UI.Input = function ( text ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Input';
	dom.style.padding = '2px';
	dom.style.border = '1px solid transparent';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.dom = dom;
	this.setValue( text );

	return this;

};

UI.Input.prototype = Object.create( UI.Element.prototype );
UI.Input.prototype.constructor = UI.Input;

UI.Input.prototype.getValue = function () {

	return this.dom.value;

};

UI.Input.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};


// TextArea

UI.TextArea = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'textarea' );
	dom.className = 'TextArea';
	dom.style.padding = '2px';
	dom.spellcheck = false;

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 9 ) {

			event.preventDefault();

			var cursor = dom.selectionStart;

			dom.value = dom.value.substring( 0, cursor ) + '\t' + dom.value.substring( cursor );
			dom.selectionStart = cursor + 1;
			dom.selectionEnd = dom.selectionStart;

		}

	}, false );

	this.dom = dom;

	return this;

};

UI.TextArea.prototype = Object.create( UI.Element.prototype );
UI.TextArea.prototype.constructor = UI.TextArea;

UI.TextArea.prototype.getValue = function () {

	return this.dom.value;

};

UI.TextArea.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};


// Select

UI.Select = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'select' );
	dom.className = 'Select';
	dom.style.padding = '2px';

	this.dom = dom;

	return this;

};

UI.Select.prototype = Object.create( UI.Element.prototype );
UI.Select.prototype.constructor = UI.Select;

UI.Select.prototype.setMultiple = function ( boolean ) {

	this.dom.multiple = boolean;

	return this;

};

UI.Select.prototype.setOptions = function ( options ) {

	var selected = this.dom.value;

	while ( this.dom.children.length > 0 ) {

		this.dom.removeChild( this.dom.firstChild );

	}

	for ( var key in options ) {

		var option = document.createElement( 'option' );
		option.value = key;
		option.innerHTML = options[ key ];
		this.dom.appendChild( option );

	}

	this.dom.value = selected;

	return this;

};

UI.Select.prototype.getValue = function () {

	return this.dom.value;

};

UI.Select.prototype.setValue = function ( value ) {

	value = String( value );

	if ( this.dom.value !== value ) {

		this.dom.value = value;

	}

	return this;

};

// Checkbox

UI.Checkbox = function ( boolean ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Checkbox';
	dom.type = 'checkbox';

	this.dom = dom;
	this.setValue( boolean );

	return this;

};

UI.Checkbox.prototype = Object.create( UI.Element.prototype );
UI.Checkbox.prototype.constructor = UI.Checkbox;

UI.Checkbox.prototype.getValue = function () {

	return this.dom.checked;

};

UI.Checkbox.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		this.dom.checked = value;

	}

	return this;

};


// Color

UI.Color = function () {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Color';
	dom.style.width = '64px';
	dom.style.height = '17px';
	dom.style.border = '0px';
	dom.style.padding = '2px';
	dom.style.backgroundColor = 'transparent';

	try {

		dom.type = 'color';
		dom.value = '#ffffff';

	} catch ( exception ) {}

	this.dom = dom;

	return this;

};

UI.Color.prototype = Object.create( UI.Element.prototype );
UI.Color.prototype.constructor = UI.Color;

UI.Color.prototype.getValue = function () {

	return this.dom.value;

};

UI.Color.prototype.getHexValue = function () {

	return parseInt( this.dom.value.substr( 1 ), 16 );

};

UI.Color.prototype.setValue = function ( value ) {

	this.dom.value = value;

	return this;

};

UI.Color.prototype.setHexValue = function ( hex ) {

	this.dom.value = '#' + ( '000000' + hex.toString( 16 ) ).slice( - 6 );

	return this;

};


// Number

UI.Number = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0.00';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

		if ( event.keyCode === 13 ) dom.blur();

	}, false );

	this.value = 0;

	this.min = - Infinity;
	this.max = Infinity;

	this.precision = 2;
	this.step = 1;
	this.unit = '';

	this.dom = dom;

	this.setValue( number );

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	var distance = 0;
	var onMouseDownValue = 0;

	var pointer = [ 0, 0 ];
	var prevPointer = [ 0, 0 ];

	function onMouseDown( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = scope.value;

		prevPointer = [ event.clientX, event.clientY ];

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		var currentValue = scope.value;

		pointer = [ event.clientX, event.clientY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
		value = Math.min( scope.max, Math.max( scope.min, value ) );

		if ( currentValue !== value ) {

			scope.setValue( value );
			dom.dispatchEvent( changeEvent );

		}

		prevPointer = [ event.clientX, event.clientY ];

	}

	function onMouseUp( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	}

	function onChange( event ) {

		scope.setValue( dom.value );

	}

	function onFocus( event ) {

		dom.style.backgroundColor = '';
		dom.style.cursor = '';

	}

	function onBlur( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.cursor = 'col-resize';

	}

	onBlur();

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Number.prototype = Object.create( UI.Element.prototype );
UI.Number.prototype.constructor = UI.Number;

UI.Number.prototype.getValue = function () {

	return this.value;

};

UI.Number.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		value = parseFloat( value );

		if ( value < this.min ) value = this.min;
		if ( value > this.max ) value = this.max;

		this.value = value;
		this.dom.value = value.toFixed( this.precision );

		if ( this.unit !== '' ) this.dom.value += ' ' + this.unit;

	}

	return this;

};

UI.Number.prototype.setPrecision = function ( precision ) {

	this.precision = precision;

	return this;

};

UI.Number.prototype.setStep = function ( step ) {

	this.step = step;

	return this;

};

UI.Number.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};

UI.Number.prototype.setUnit = function ( unit ) {

	this.unit = unit;

	return this;

};

// Integer

UI.Integer = function ( number ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'input' );
	dom.className = 'Number';
	dom.value = '0';

	dom.addEventListener( 'keydown', function ( event ) {

		event.stopPropagation();

	}, false );

	this.value = 0;

	this.min = - Infinity;
	this.max = Infinity;

	this.step = 1;

	this.dom = dom;

	this.setValue( number );

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	var distance = 0;
	var onMouseDownValue = 0;

	var pointer = [ 0, 0 ];
	var prevPointer = [ 0, 0 ];

	function onMouseDown( event ) {

		event.preventDefault();

		distance = 0;

		onMouseDownValue = scope.value;

		prevPointer = [ event.clientX, event.clientY ];

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		var currentValue = scope.value;

		pointer = [ event.clientX, event.clientY ];

		distance += ( pointer[ 0 ] - prevPointer[ 0 ] ) - ( pointer[ 1 ] - prevPointer[ 1 ] );

		var value = onMouseDownValue + ( distance / ( event.shiftKey ? 5 : 50 ) ) * scope.step;
		value = Math.min( scope.max, Math.max( scope.min, value ) ) | 0;

		if ( currentValue !== value ) {

			scope.setValue( value );
			dom.dispatchEvent( changeEvent );

		}

		prevPointer = [ event.clientX, event.clientY ];

	}

	function onMouseUp( event ) {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		if ( Math.abs( distance ) < 2 ) {

			dom.focus();
			dom.select();

		}

	}

	function onChange( event ) {

		scope.setValue( dom.value );

	}

	function onFocus( event ) {

		dom.style.backgroundColor = '';
		dom.style.cursor = '';

	}

	function onBlur( event ) {

		dom.style.backgroundColor = 'transparent';
		dom.style.cursor = 'col-resize';

	}

	onBlur();

	dom.addEventListener( 'mousedown', onMouseDown, false );
	dom.addEventListener( 'change', onChange, false );
	dom.addEventListener( 'focus', onFocus, false );
	dom.addEventListener( 'blur', onBlur, false );

	return this;

};

UI.Integer.prototype = Object.create( UI.Element.prototype );
UI.Integer.prototype.constructor = UI.Integer;

UI.Integer.prototype.getValue = function () {

	return this.value;

};

UI.Integer.prototype.setValue = function ( value ) {

	if ( value !== undefined ) {

		value = parseInt( value );

		this.value = value;
		this.dom.value = value;

	}

	return this;

};

UI.Integer.prototype.setStep = function ( step ) {

	this.step = parseInt( step );

	return this;

};

UI.Integer.prototype.setRange = function ( min, max ) {

	this.min = min;
	this.max = max;

	return this;

};


// Break

UI.Break = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'br' );
	dom.className = 'Break';

	this.dom = dom;

	return this;

};

UI.Break.prototype = Object.create( UI.Element.prototype );
UI.Break.prototype.constructor = UI.Break;


// HorizontalRule

UI.HorizontalRule = function () {

	UI.Element.call( this );

	var dom = document.createElement( 'hr' );
	dom.className = 'HorizontalRule';

	this.dom = dom;

	return this;

};

UI.HorizontalRule.prototype = Object.create( UI.Element.prototype );
UI.HorizontalRule.prototype.constructor = UI.HorizontalRule;


// Button

UI.Button = function ( value ) {

	UI.Element.call( this );

	var dom = document.createElement( 'button' );
	dom.className = 'Button';

	this.dom = dom;
	this.dom.textContent = value || '';

	return this;

};

UI.Button.prototype = Object.create( UI.Element.prototype );
UI.Button.prototype.constructor = UI.Button;

UI.Button.prototype.setLabel = function ( value ) {

	this.dom.textContent = value;

	return this;

};


// Modal

UI.Modal = function ( value ) {

	var scope = this;

	var dom = document.createElement( 'div' );

	dom.style.position = 'absolute';
	dom.style.width = '100%';
	dom.style.height = '100%';
	dom.style.backgroundColor = 'rgba(0,0,0,0.5)';
	dom.style.display = 'none';
	dom.style.alignItems = 'center';
	dom.style.justifyContent = 'center';
	dom.addEventListener( 'click', function ( event ) {

		scope.hide();

	} );

	this.dom = dom;

	this.container = new UI.Panel();
	this.container.dom.style.width = '200px';
	this.container.dom.style.padding = '20px';
	this.container.dom.style.backgroundColor = '#ffffff';
	this.container.dom.style.boxShadow = '0px 5px 10px rgba(0,0,0,0.5)';

	this.add( this.container );

	return this;

};

UI.Modal.prototype = Object.create( UI.Element.prototype );
UI.Modal.prototype.constructor = UI.Modal;

UI.Modal.prototype.show = function ( content ) {

	this.container.clear();
	this.container.add( content );

	this.dom.style.display = 'flex';

	return this;

};

UI.Modal.prototype.hide = function () {

	this.dom.style.display = 'none';

	return this;

};
