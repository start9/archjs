
        return { Module : Module, FS : FS, Runtime : Runtime };

    });

    if (! self.Archjs)
        self.Archjs = { byName : { } };

    var Engine = self.Archjs.byName['@(ENGINE_NAME)'] = function (options) {

        var devices = options.devices;

        this.defaultFileName = options.defaultFileName || '@(ENGINE_ROM_NAME)';

        this.emscripten = instanciateEmscripten();

        this.emscripten.print = function (message) { console.log(message); };
        this.emscripten.printErr = function (message) { console.error(message); };

        this.screen = this.emscripten.Module.screen = devices.screen;
        this.timer = this.emscripten.Module.timer = devices.timer;
        this.input = this.emscripten.Module.input = devices.input;
        this.audio = this.emscripten.Module.audio = devices.audio;

        this.lastCreatedFile = null;

        this.frontendStart = this.emscripten.Module.cwrap('frontend_start', null, []);
        this.frontendStatus = this.emscripten.Module.cwrap('frontend_status', 'number', []);
        this.frontendStop = this.emscripten.Module.cwrap('frontend_stop', null, []);

        this.frontendLoadGame = this.emscripten.Module.cwrap('frontend_load_game', 'number', [ 'number' ]);
        this.frontendUnloadGame = this.emscripten.Module.cwrap('frontend_unload_game', 'number', []);

        this.frontendGetState = this.emscripten.Module.cwrap('frontend_get_state', 'number', [ 'number', 'number' ]);
        this.frontendSetState = this.emscripten.Module.cwrap('frontend_set_state', 'number', [ 'number', 'number' ]);
        this.frontendResetState = this.emscripten.Module.cwrap('frontend_reset_state', 'number', []);

        this.emscripten.Module.callMain([]);

    };

    Engine.codeMap = { };

    // These values come from the libretro header

    Engine.codeMap.LEFT = 6;
    Engine.codeMap.RIGHT = 7;
    Engine.codeMap.UP = 4;
    Engine.codeMap.DOWN = 5;

    Engine.codeMap.A = 8;
    Engine.codeMap.B = 0;

    Engine.codeMap.L = 10;
    Engine.codeMap.R = 11;

    Engine.codeMap.SELECT = 2;
    Engine.codeMap.START = 3;

    Engine.prototype.loadArrayBuffer = function (arrayBuffer, options) {

        if (!this.stop())
            throw new Error('Cannot stop the engine to load a new game');

        if (typeof options === 'undefined')
            options = { };

        var autoStart = options.autoStart;
        var initialState = options.initialState;

        if (typeof autoStart === 'undefined')
            autoStart = true;

        if (this.lastCreatedFile) {
            this.frontendUnloadGame();
            this.emscripten.FS.unlink(this.lastCreatedFile);
        }

        this.lastCreatedFile = '/' + (options.fileName || this.defaultFileName);

        var stackPointer = this.emscripten.Runtime.stackSave();

        var gamePathPointer = this.emscripten.Module.allocate(this.emscripten.Module.intArrayFromString(this.lastCreatedFile), 'i8', this.emscripten.Module.ALLOC_STACK);
        this.emscripten.FS.writeFile(this.lastCreatedFile, new Uint8Array(arrayBuffer), { encoding : 'binary' });

        var result = this.frontendLoadGame(gamePathPointer);

        this.emscripten.Runtime.stackRestore(stackPointer);

        if (result < 0)
            throw new Error('Game load failed - the emulator returned ' + result);

        if (initialState)
            this.setState(initialState);

        if (autoStart) {
            this.start();
        }

    };

    Engine.prototype.resetState = function () {

        var result = this.frontendResetState();

        if (result < 0)
            throw new Error('Cannot reset state at this time - the emulator returned ' + result);

        return this;

    };

    Engine.prototype.setState = function (arrayBuffer) {

        if (!arrayBuffer)
            return this.resetState();

        var stackPointer = this.emscripten.Runtime.stackSave();

        var emdata = this.emscripten.Module.allocate(new Uint8Array(arrayBuffer), 'i8', this.emscripten.Module.ALLOC_STACK);
        var result = this.frontendSetState(emdata, arrayBuffer.byteLength);

        this.emscripten.Runtime.stackRestore(stackPointer);

        if (result < 0)
            throw new Error('Cannot set state at this time - the emulator returned ' + result);

        return this;

    };

    Engine.prototype.getState = function () {

        var stackPointer = this.emscripten.Runtime.stackSave();

        var emDataPtr = this.emscripten.Module.allocate([ 0 ], '*', this.emscripten.Module.ALLOC_STACK);
        var emSizePtr = this.emscripten.Module.allocate([ 0 ], 'i32', this.emscripten.Module.ALLOC_STACK);

        var result = this.frontendGetState(emDataPtr, emSizePtr);

        var emdata = this.emscripten.Module.getValue(emDataPtr, '*');
        var emsize = this.emscripten.Module.getValue(emSizePtr, 'i32');

        this.emscripten.Runtime.stackRestore(stackPointer);

        if (result < 0)
            throw new Error('Cannot get state at this time - the emulator returned ' + result);

        return this.emscripten.Module.HEAPU8.buffer.slice(emdata, emdata + emsize);

    };

    Engine.prototype.start = function () {

        this.frontendStart();

        return this;

    };

    Engine.prototype.isRunning = function () {

        return Boolean(this.frontendStatus());

    };

    Engine.prototype.stop = function () {

        this.frontendStop();

        return this;

    };

})(self);
