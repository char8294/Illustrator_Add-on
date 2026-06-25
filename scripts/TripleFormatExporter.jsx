#target illustrator

/*
  Triple Format Exporter for Adobe Illustrator
  Exports the active document to AI, PDF, and PNG in one action.
*/
(function () {
    var APP_NAME = "Triple Format Exporter";

    function trim(value) {
        return String(value).replace(/^\s+|\s+$/g, "");
    }

    function stripExtension(name) {
        return String(name).replace(/\.[^\.]+$/, "");
    }

    function sanitizeFileName(name) {
        var cleaned = trim(name).replace(/[\\\/:\*\?"<>\|]/g, "_");
        cleaned = cleaned.replace(/\s+/g, " ");
        return cleaned.length ? cleaned : "Illustrator_Export";
    }

    function folderFromDocument(doc) {
        try {
            if (doc.path && doc.path.exists) {
                return doc.path;
            }
        } catch (ignored) {}

        if (Folder.myDocuments) {
            return Folder.myDocuments;
        }

        return Folder.desktop;
    }

    function decodeName(name) {
        try {
            return decodeURI(name);
        } catch (ignored) {
            return name;
        }
    }

    function defaultBaseName(doc) {
        return sanitizeFileName(stripExtension(decodeName(doc.name || "Illustrator_Export")));
    }

    function padNumber(value) {
        return value < 10 ? "0" + value : String(value);
    }

    function hasAnyExisting(files) {
        for (var i = 0; i < files.length; i += 1) {
            if (files[i].exists) {
                return true;
            }
        }
        return false;
    }

    function buildFiles(folder, baseName, overwrite) {
        var safeBase = sanitizeFileName(baseName);
        var candidate = safeBase;
        var index = 1;
        var files;

        do {
            files = [
                new File(folder.fsName + "/" + candidate + ".ai"),
                new File(folder.fsName + "/" + candidate + ".pdf"),
                new File(folder.fsName + "/" + candidate + ".png")
            ];

            if (overwrite || !hasAnyExisting(files)) {
                return {
                    baseName: candidate,
                    ai: files[0],
                    pdf: files[1],
                    png: files[2]
                };
            }

            candidate = safeBase + "_" + padNumber(index);
            index += 1;
        } while (index < 1000);

        throw new Error("Could not create a unique file name.");
    }

    function parseScale(value) {
        var scale = Number(String(value).replace(/[^0-9\.]/g, ""));
        if (isNaN(scale) || scale <= 0) {
            return 100;
        }
        if (scale > 1000) {
            return 1000;
        }
        return scale;
    }

    function makeDialog(doc) {
        var defaults = {
            folder: folderFromDocument(doc),
            baseName: defaultBaseName(doc)
        };

        var dialog = new Window("dialog", APP_NAME);
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.margins = 16;

        var title = dialog.add("statictext", undefined, "Export active Illustrator document");
        title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 14);

        var folderGroup = dialog.add("group");
        folderGroup.orientation = "row";
        folderGroup.alignChildren = ["fill", "center"];
        folderGroup.add("statictext", undefined, "Folder:");
        var folderInput = folderGroup.add("edittext", undefined, defaults.folder.fsName);
        folderInput.characters = 38;
        var browseButton = folderGroup.add("button", undefined, "Browse");

        var nameGroup = dialog.add("group");
        nameGroup.orientation = "row";
        nameGroup.alignChildren = ["fill", "center"];
        nameGroup.add("statictext", undefined, "Base name:");
        var nameInput = nameGroup.add("edittext", undefined, defaults.baseName);
        nameInput.characters = 42;

        var optionsPanel = dialog.add("panel", undefined, "Options");
        optionsPanel.orientation = "column";
        optionsPanel.alignChildren = "left";
        optionsPanel.margins = 12;

        var overwriteCheck = optionsPanel.add("checkbox", undefined, "Overwrite existing files");
        overwriteCheck.value = false;

        var pngTransparencyCheck = optionsPanel.add("checkbox", undefined, "PNG transparent background");
        pngTransparencyCheck.value = true;

        var pngArtboardCheck = optionsPanel.add("checkbox", undefined, "Clip PNG to active artboard");
        pngArtboardCheck.value = true;

        var scaleGroup = optionsPanel.add("group");
        scaleGroup.orientation = "row";
        scaleGroup.add("statictext", undefined, "PNG scale:");
        var scaleInput = scaleGroup.add("edittext", undefined, "100");
        scaleInput.characters = 6;
        scaleGroup.add("statictext", undefined, "%");

        var buttonGroup = dialog.add("group");
        buttonGroup.alignment = "right";
        var cancelButton = buttonGroup.add("button", undefined, "Cancel", { name: "cancel" });
        var exportButton = buttonGroup.add("button", undefined, "Export", { name: "ok" });

        browseButton.onClick = function () {
            var selected = Folder.selectDialog("Choose export folder", new Folder(folderInput.text));
            if (selected) {
                folderInput.text = selected.fsName;
            }
        };

        exportButton.onClick = function () {
            var folder = new Folder(folderInput.text);
            if (!folder.exists) {
                alert("Folder does not exist:\n" + folder.fsName);
                return;
            }

            if (!trim(nameInput.text).length) {
                alert("Please enter a base file name.");
                return;
            }

            dialog.close(1);
        };

        cancelButton.onClick = function () {
            dialog.close(0);
        };

        if (dialog.show() !== 1) {
            return null;
        }

        return {
            folder: new Folder(folderInput.text),
            baseName: nameInput.text,
            overwrite: overwriteCheck.value,
            pngTransparent: pngTransparencyCheck.value,
            pngClipToArtboard: pngArtboardCheck.value,
            pngScale: parseScale(scaleInput.text)
        };
    }

    function saveAi(doc, file) {
        var options = new IllustratorSaveOptions();
        options.pdfCompatible = true;
        options.compressed = true;
        options.embedICCProfile = true;
        doc.saveAs(file, options);
    }

    function savePdf(doc, file) {
        var options = new PDFSaveOptions();
        options.preserveEditability = true;
        options.generateThumbnails = true;
        options.viewAfterSaving = false;
        doc.saveAs(file, options);
    }

    function exportPng(doc, file, settings) {
        var options = new ExportOptionsPNG24();
        options.antiAliasing = true;
        options.transparency = settings.pngTransparent;
        options.artBoardClipping = settings.pngClipToArtboard;
        options.horizontalScale = settings.pngScale;
        options.verticalScale = settings.pngScale;
        doc.exportFile(file, ExportType.PNG24, options);
    }

    function exportAll(settings) {
        if (app.documents.length === 0) {
            throw new Error("No Illustrator document is open.");
        }

        var doc = app.activeDocument;
        var files = buildFiles(settings.folder, settings.baseName, settings.overwrite);
        var originalInteraction = app.userInteractionLevel;

        try {
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

            savePdf(doc, files.pdf);
            exportPng(doc, files.png, settings);
            saveAi(doc, files.ai);
        } finally {
            app.userInteractionLevel = originalInteraction;
        }

        return files;
    }

    function run() {
        try {
            if (app.documents.length === 0) {
                alert("Open an Illustrator document before exporting.");
                return "No document";
            }

            var settings = makeDialog(app.activeDocument);
            if (!settings) {
                return "Canceled";
            }

            var files = exportAll(settings);
            alert(
                "Export complete:\n\n" +
                files.ai.fsName + "\n" +
                files.pdf.fsName + "\n" +
                files.png.fsName
            );
            return "Export complete";
        } catch (error) {
            alert(APP_NAME + " failed:\n" + error.message);
            return "Error: " + error.message;
        }
    }

    $.global.TripleFormatExporter = {
        run: run,
        exportAll: exportAll
    };

    if (!$.global.TRIPLE_FORMAT_EXPORTER_NO_AUTORUN) {
        run();
    }
})();
