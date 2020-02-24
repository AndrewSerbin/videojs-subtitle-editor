/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Examples = function ( editor ) {

	var container = new UI.Panel();
	container.setClass( 'menu' );

	var title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Examples' );
	container.add( title );

	var options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	// Examples

	var items = [
		{ title: 'HTML Colors', file: 'html_colors.json' },
		{ title: 'HTML Loop', file: 'html_loop.json' },
		{ title: 'Three.js Cube', file: 'threejs_cube.json' },
		{ title: 'Three.js Shaders', file: 'threejs_shaders.json' }
	];

	for ( var i = 0; i < items.length; i ++ ) {

		( function ( i ) {

			var item = items[ i ];

			var option = new UI.Row();
			option.setClass( 'option' );
			option.setTextContent( item.title );
			option.onClick( function () {

				if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

					// var request = new XMLHttpRequest();
					// request.open( 'GET', 'http://localhost:8080/' + item.file, true );
					// request.addEventListener( 'load', function ( event ) {

						editor.clear();
						editor.fromJSON( {
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
});

					// }, false );
					// request.send( null );

				}

			} );
			options.add( option );

		} )( i )

	}

	return container;

};
