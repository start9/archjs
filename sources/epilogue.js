
        return { Module : Module, FS : FS, Runtime : Runtime };

    } );

    if ( ! self.Archjs )
        self.Archjs = { byName : { } };

    var Engine = self.Archjs.byName[ '@(ENGINE_NAME)' ] = function ( options ) {

        var devices = options.devices;

        this._defaultFileName = options.defaultFileName || '@(ENGINE_ROM_NAME)';

        this._emscripten = instanciateEmscripten( );

        this._emscripten.print = function ( message ) { console.log( message ); };
        this._emscripten.printErr = function ( message ) { console.error( message ); };

        this.screen = this._emscripten.Module.screen = devices.screen;
        this.timer = this._emscripten.Module.timer = devices.timer;
        this.input = this._emscripten.Module.input = devices.input;

        this._lastCreatedFile = null;

        this._frontendStart = this._emscripten.Module.cwrap( 'frontend_start', null, [ ] );
        this._frontendStatus = this._emscripten.Module.cwrap( 'frontend_status', 'number', [ ] );
        this._frontendStop = this._emscripten.Module.cwrap( 'frontend_stop', null, [ ] );

        this._frontendLoadGame = this._emscripten.Module.cwrap( 'frontend_load_game', 'number', [ 'number' ] );
        this._frontendUnloadGame = this._emscripten.Module.cwrap( 'frontend_unload_game', 'number', [ ] );

        this._frontendGetState = this._emscripten.Module.cwrap( 'frontend_get_state', 'number', [ 'number', 'number' ] );
        this._frontendSetState = this._emscripten.Module.cwrap( 'frontend_set_state', 'number', [ 'number', 'number' ] );
        this._frontendResetState = this._emscripten.Module.cwrap( 'frontend_reset_state', 'number', [ ] );

        this._emscripten.Module.callMain( [ ] );

    };

    Engine.inputMap = { };

    // These values come from the libretro header

    Engine.inputMap.LEFT = 6;
    Engine.inputMap.RIGHT = 7;
    Engine.inputMap.UP = 4;
    Engine.inputMap.DOWN = 5;

    Engine.inputMap.A = 8;
    Engine.inputMap.B = 0;

    Engine.inputMap.SELECT = 2;
    Engine.inputMap.START = 3;

    Engine.prototype.loadArrayBuffer = function ( arrayBuffer, options ) {

        if ( ! this.stop( ) )
            throw new Error( 'Cannot stop the engine to load a new game' );

        if ( typeof options === 'undefined' )
            options = { };

        var autoStart = options.autoStart;
        var initialState = options.initialState;

        if ( typeof autoStart === 'undefined' )
            autoStart = true;

        if ( this._lastCreatedFile ) {
            this._frontendUnloadGame( );
            this._emscripten.FS.unlink( this._lastCreatedFile );
        }

        this._lastCreatedFile = '/' + ( options.fileName || this._defaultFileName );

        var stackPointer = this._emscripten.Runtime.stackSave( );

        var gamePathPointer = this._emscripten.Module.allocate( this._emscripten.Module.intArrayFromString( this._lastCreatedFile ), 'i8', this._emscripten.Module.ALLOC_STACK );
        this._emscripten.FS.writeFile( this._lastCreatedFile, new Uint8Array( arrayBuffer ), { encoding : 'binary' } );

        var result = this._frontendLoadGame( gamePathPointer );

        this._emscripten.Runtime.stackRestore( stackPointer );

        if ( result < 0 )
            throw new Error( 'Game load failed - the emulator returned ' + result );

        if ( initialState )
            this.setState( initialState );

        if ( autoStart ) {
            this.start( );
        }

    };

    Engine.prototype.resetState = function ( ) {

        var result = this._frontendResetState( );

        if ( result < 0 )
            throw new Error( 'Cannot reset state at this time - the emulator returned ' + result );

        return this;

    };

    Engine.prototype.setState = function ( arrayBuffer ) {

        if ( ! arrayBuffer )
            return this.resetState( );

        var stackPointer = this._emscripten.Runtime.stackSave( );

        var emdata = this._emscripten.Module.allocate( new Uint8Array( arrayBuffer ), 'i8', this._emscripten.Module.ALLOC_STACK );
        var result = this._frontendSetState( emdata, arrayBuffer.byteLength );

        this._emscripten.Runtime.stackRestore( stackPointer );

        if ( result < 0 )
            throw new Error( 'Cannot set state at this time - the emulator returned ' + result );

        return this;

    };

    Engine.prototype.getState = function ( ) {

        var stackPointer = this._emscripten.Runtime.stackSave( );

        var emDataPtr = this._emscripten.Module.allocate( [ 0 ], '*', this._emscripten.Module.ALLOC_STACK );
        var emSizePtr = this._emscripten.Module.allocate( [ 0 ], 'i32', this._emscripten.Module.ALLOC_STACK );

        var result = this._frontendGetState( emDataPtr, emSizePtr );

        var emdata = this._emscripten.Module.getValue( emDataPtr, '*' );
        var emsize = this._emscripten.Module.getValue( emSizePtr, 'i32' );

        console.log( emdata.toString( 16 ), emsize );

        this._emscripten.Runtime.stackRestore( stackPointer );

        if ( result < 0 )
            throw new Error( 'Cannot get state at this time - the emulator returned ' + result );

        return this._emscripten.Module.HEAPU8.buffer.slice( emdata, emdata + emsize );

    };

    Engine.prototype.start = function ( ) {

        this._frontendStart( );

        return this;

    };

    Engine.prototype.isRunning = function ( ) {

        return Boolean( this._frontendStatus( ) );

    };

    Engine.prototype.stop = function ( ) {

        this._frontendStop( );

        return this;

    };

} )( self );
