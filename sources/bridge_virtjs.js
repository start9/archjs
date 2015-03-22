mergeInto( LibraryManager.library, {

    $VirtjsBridge : {

        getInputFormatStruct : function ( pointer ) {

            var format = { };

            format.depth = {{{ makeGetValue( 'pointer',  0, 'i32' ) }}};

            format.rMask = {{{ makeGetValue( 'pointer',  4, 'i32' ) }}};
            format.gMask = {{{ makeGetValue( 'pointer',  8, 'i32' ) }}};
            format.bMask = {{{ makeGetValue( 'pointer', 12, 'i32' ) }}};
            format.aMask = {{{ makeGetValue( 'pointer', 16, 'i32' ) }}};

            return format;

        },

        castPointerToData : function ( pointer, dataSize, itemSize ) {

            switch ( itemSize ) {

                case  8 : return  HEAPU8.subarray( pointer / 1, ( pointer + dataSize ) / 1 );
                case 16 : return HEAPU16.subarray( pointer / 2, ( pointer + dataSize ) / 2 );
                case 32 : return HEAPU32.subarray( pointer / 4, ( pointer + dataSize ) / 4 );

                default : throw new Error( 'Invalid pointer item length' );

            }

        }

    },

    bridge_virtjs_input_poll_inputs : function ( ) {

        Module.input.pollInputs( );

    },

    bridge_virtjs_input_get_state : function ( port, inputCode ) {

        return Module.input.getState( port, inputCode );

    },

    bridge_virtjs_timer_start : function ( ) {

        Module.timer.start( );

    },

    bridge_virtjs_timer_stop : function ( ) {

        Module.timer.stop( );

    },

    bridge_virtjs_timer_next_tick : function ( pointer ) {

        return Module.timer.nextTick( function ( ) {
            Runtime.dynCall( 'v', pointer, [ ] );
        } );

    },

    bridge_virtjs_timer_cancel_tick : function ( nextTickId ) {

        Module.timer.cancelTick( nextTickId );

    },

    bridge_virtjs_screen_set_input_size : function ( width, height, pitch ) {

        Module.screen.setInputSize( width, height, pitch );

    },

    bridge_virtjs_screen_validate_input_format__deps : [ '$VirtjsBridge' ],
    bridge_virtjs_screen_validate_input_format : function ( formatPointer ) {

        return Module.screen.validateInputFormat( VirtjsBridge.getInputFormatStruct( formatPointer ) );

    },

    bridge_virtjs_screen_set_input_format__deps : [ '$VirtjsBridge' ],
    bridge_virtjs_screen_set_input_format : function ( formatPointer ) {

        Module.screen.setInputFormat( VirtjsBridge.getInputFormatStruct( formatPointer ) );

    },

    bridge_virtjs_screen_set_input_data__deps : [ '$VirtjsBridge' ],
    bridge_virtjs_screen_set_input_data : function ( dataPointer ) {

        Module.screen.setInputData( VirtjsBridge.castPointerToData( dataPointer, Module.screen.inputHeight * Module.screen.inputPitch, Module.screen.inputFormat.depth ) );

    },

    bridge_virtjs_screen_flush_screen : function ( ) {

        Module.screen.flushScreen( );

    }

} );
