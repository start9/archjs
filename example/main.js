import { KeyboardInput }       from 'virtjs/devices/inputs/KeyboardInput';
import { WebGLScreen }         from 'virtjs/devices/screens/WebGLScreen';
import { AnimationFrameTimer } from 'virtjs/devices/timers/AnimationFrameTimer';
import { fetchArrayBuffer }    from 'virtjs/utils/DataUtils';

function listenShortcuts( engine ) {

    var state = null;

    window.addEventListener( 'keydown', e => {

        if ( e.keyCode !== 112 && e.keyCode !== 113 )
            return ;

        e.preventDefault( );

        if ( e.keyCode === 112 ) {
            state = engine.getState( );
        } else if ( e.keyCode === 113 ) {
            state && engine.setState( state );
        }

    } );

}

function run( arrayBuffer, { fileName } ) {

    var meter = new FPSMeter( { } );
    var Engine = Archjs.byName[ ENGINE ];

    var canvas = document.querySelector( '#screen' );

    var screen = new WebGLScreen( { canvas } );
    screen.setOutputSize( canvas.width, canvas.height );

    var input = new KeyboardInput( { inputMap : Engine.inputMap } );

    var timer = new AnimationFrameTimer( );
    timer.start( ( ) => { meter.tickStart( ); window.x = 1; }, ( ) => { meter.tick( ); window.x = 0; } );

    var engine = new Engine( { devices : {
        screen, timer, input
    } } );

    engine.loadArrayBuffer( arrayBuffer, { fileName } );

    listenShortcuts( engine );

}

function load( what, fileName ) {

    return fetchArrayBuffer( what ).then( arrayBuffer => {

        document.querySelector( '#selector' ).style.display = 'none';
        document.querySelector( '#overlay' ).style.display = 'none';

        return run( arrayBuffer, fileName );

    } );

}

export function main( ) {

    if ( GAMEPATH ) {

        load( GAMEPATH, GAMEPATH.substr( GAMEPATH.lastIndexOf( '/' ) + 1 ) );

    } else {

        var selector = document.querySelector( '#selector' );
        selector.onchange = ( ) => { load( selector.files[ 0 ], selector.files[ 0 ].name ); };

    }

}
