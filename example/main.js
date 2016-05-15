var AudiojsAudio        = Audiojs.extra.AudiojsAudio;
var KeyboardInput       = Virtjs.devices.inputs.KeyboardInput;
var WebGLScreen         = Virtjs.devices.screens.WebGLScreen;
var AnimationFrameTimer = Virtjs.devices.timers.AnimationFrameTimer;
var fetchArrayBuffer    = Virtjs.utils.DataUtils.fetchArrayBuffer;

function listenShortcuts(engine) {

    var state = null;

    window.addEventListener('keydown', function (e) {

        if (e.keyCode !== 112 && e.keyCode !== 113)
            return ;

        e.preventDefault();

        if (e.keyCode === 112) {
            state = engine.getState();
        } else if (e.keyCode === 113) {
            state && engine.setState(state);
        }

    });

}

function run(arrayBuffer, { fileName }) {

    var meter = new FPSMeter({ });
    var Engine = Archjs.byName[ENGINE];

    var canvas = document.querySelector('#screen');

    var screen = new WebGLScreen({ canvas });
    screen.setOutputSize(canvas.width, canvas.height);

    var input = new KeyboardInput({ codeMap: Engine.codeMap });

    var timer = new AnimationFrameTimer();

    timer.start(function () {
        meter.tickStart();
    }, function () {
        meter.tick();
    });

    var audio = new AudiojsAudio();

    var engine = new Engine({ devices: {
        screen, timer, input, audio
    } });

    engine.loadArrayBuffer(arrayBuffer, { fileName });

    listenShortcuts(engine);

}

function load(what, fileName) {

    return fetchArrayBuffer(what).then(function (arrayBuffer) {

        document.querySelector('#selector').style.display = 'none';
        document.querySelector('#overlay').style.display = 'none';

        return run(arrayBuffer, fileName);

    });

}

if (GAMEPATH) {

    load(GAMEPATH, GAMEPATH.substr(GAMEPATH.lastIndexOf('/') + 1));

} else {

    var selector = document.querySelector('#selector');

    selector.addEventListener('change', function () {
        load(selector.files[0], selector.files[0].name);
    });

}
