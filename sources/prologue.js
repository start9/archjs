(function (root, factory) {

    if (typeof define === 'function' && define.amd) {

        define([], factory);

    } else if (typeof exports === 'object') {

        module.exports = factory();

    } else {

        if (!root.Archjs)
            root.Archjs = { byName: {} };

        root.Archjs.byName['@(ENGINE_NAME)'] = factory(root.$, root._);

    }

}(this, function () {

    var instanciateEmscripten = (function (Module) {
