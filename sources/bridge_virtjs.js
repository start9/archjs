mergeInto(LibraryManager.library, {

    $VirtjsBridge: {

        audioFormat: function (n) {

            return n / 0x8000;

        },

        getHeapFromDepth: function (depth) { switch (depth) {

            default: throw new Error('Invalid depth (' + depth + ')');

            case  8: return HEAPU8;
            case 16: return HEAPU16;
            case 32: return HEAPU32;

        } },

        castPointerToData: function (pointer, heap, count) {

            var bytesPerElement = heap.BYTES_PER_ELEMENT;

            var start = pointer / heap.BYTES_PER_ELEMENT;
            var end = start + count;

            return heap.subarray(start, end);

        }

    },

    bridge_virtjs_input_poll_inputs: function () {

        Module.input.pollInputs();

    },

    bridge_virtjs_input_get_state: function (port, inputCode) {

        return Module.input.getState(port, inputCode);

    },

    bridge_virtjs_timer_start: function () {

        Module.timer.start();

    },

    bridge_virtjs_timer_stop: function () {

        Module.timer.stop();

    },

    bridge_virtjs_timer_next_tick: function (pointer) {

        return Module.timer.nextTick(function () {
            Runtime.dynCall('v', pointer, []);
        });

    },

    bridge_virtjs_timer_cancel_tick: function (nextTickId) {

        Module.timer.cancelTick(nextTickId);

    },

    bridge_virtjs_screen_set_input_size: function (width, height, pitch) {

        Module.screen.setInputSize(width, height, pitch);

    },

    bridge_virtjs_screen_validate_input_format: function (depth, rMask, gMask, bMask, aMask) {

        return Module.screen.validateInputFormat({ depth: depth, rMask: rMask, gMask: gMask, bMask: bMask, aMask: aMask });

    },

    bridge_virtjs_screen_set_input_format: function (depth, rMask, gMask, bMask, aMask) {

        Module.screen.setInputFormat({ depth: depth, rMask: rMask, gMask: gMask, bMask: bMask, aMask: aMask });

    },

    bridge_virtjs_screen_set_input_data__deps: [ '$VirtjsBridge' ],
    bridge_virtjs_screen_set_input_data: function (dataPointer) {

        var heap = VirtjsBridge.getHeapFromDepth(Module.screen.inputFormat.depth);

        Module.screen.setInputData(VirtjsBridge.castPointerToData(dataPointer, heap, Module.screen.inputHeight * Module.screen.inputPitch));

    },

    bridge_virtjs_screen_flush_screen: function () {

        Module.screen.flushScreen();

    },

    bridge_virtjs_screen_set_input_data__deps: [ '$VirtjsBridge' ],
    bridge_virtjs_audio_validate_input_format: function (sampleRate) {

        return Module.audio.validateInputFormat({ sampleRate: sampleRate, channelCount: 2, formatCallback: VirtjsBridge.audioFormat });

    },

    bridge_virtjs_screen_set_input_data__deps: [ '$VirtjsBridge' ],
    bridge_virtjs_audio_set_input_format: function (sampleRate) {

        Module.audio.setInputFormat({ sampleRate: sampleRate, channelCount: 2, formatCallback: VirtjsBridge.audioFormat });

    },

    bridge_virtjs_audio_push_sample_batch: function (samplesPointer, count) {

        Module.audio.pushSampleBatch(VirtjsBridge.castPointerToData(samplesPointer, HEAP16, count * 2));

    }

});
