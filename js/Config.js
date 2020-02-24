/**
 * @author mrdoob / http://mrdoob.com/
 */

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
