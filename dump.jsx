var opts = new IllustratorSaveOptions();
var props = [];
for (var p in opts) {
    props.push(p);
}
var f = new File(Folder.desktop + "/props.txt");
f.open("w");
f.write(props.join(","));
f.close();
