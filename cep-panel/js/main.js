(function () {
    "use strict";

    var cs = new CSInterface();
    var exportButton = document.getElementById("exportButton");
    var statusText = document.getElementById("statusText");

    function setStatus(message, isError) {
        statusText.textContent = message;
        statusText.className = isError ? "status error" : "status";
    }

    function escapeForExtendScript(value) {
        return String(value)
            .replace(/\\/g, "/")
            .replace(/"/g, '\\"');
    }

    function runExporter() {
        var extensionRoot = cs.getSystemPath(SystemPath.EXTENSION);

        if (!extensionRoot) {
            setStatus("CEP runtime is not available.", true);
            return;
        }

        var exporterPath = escapeForExtendScript(extensionRoot + "/jsx/TripleFormatExporter.jsx");
        var script =
            'try {' +
            '$.global.TRIPLE_FORMAT_EXPORTER_NO_AUTORUN = true;' +
            '$.evalFile(new File("' + exporterPath + '"));' +
            '$.global.TRIPLE_FORMAT_EXPORTER_NO_AUTORUN = false;' +
            'TripleFormatExporter.run();' +
            '} catch (e) {' +
            'alert("Triple Format Exporter failed:\\n" + e.message);' +
            '"Error: " + e.message;' +
            '}';

        exportButton.disabled = true;
        setStatus("Opening export dialog...", false);

        cs.evalScript(script, function (result) {
            exportButton.disabled = false;
            var failed = /^Error:/i.test(result || "");
            setStatus(result || "Done", failed);
        });
    }

    exportButton.addEventListener("click", runExporter);
})();
