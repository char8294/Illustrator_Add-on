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
        var path;

        if (!global.__adobe_cep__) {
            return "";
        }

        path = String(global.__adobe_cep__.getSystemPath(pathType) || "");

        try {
            path = decodeURI(path);
        } catch (ignored) {}

        path = path.replace(/\\/g, "/");
        path = path.replace(/^file:\/\//i, "");
        path = path.replace(/^localhost\//i, "");
        path = path.replace(/^\/([A-Za-z]:\/)/, "$1");
        path = path.replace(/^file:\//i, "");

        return path;
    };

    global.SystemPath = SystemPath;
    global.CSInterface = CSInterface;
})(window);
