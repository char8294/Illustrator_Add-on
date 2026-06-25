(function (global) {
    "use strict";

    var SystemPath = {
        EXTENSION: "extension"
    };

    function CSInterface() {}

    CSInterface.prototype.evalScript = function (script, callback) {
        if (!global.__adobe_cep__) {
            if (callback) {
                callback("ERROR: CEP runtime is not available.");
            }
            return;
        }

        global.__adobe_cep__.evalScript(script, callback || function () {});
    };

    CSInterface.prototype.getSystemPath = function (pathType) {
        if (!global.__adobe_cep__) {
            return "";
        }

        return global.__adobe_cep__.getSystemPath(pathType);
    };

    global.SystemPath = SystemPath;
    global.CSInterface = CSInterface;
})(window);
