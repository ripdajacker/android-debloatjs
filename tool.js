var button = document.getElementById('button');
var input = document.getElementById('input');
var output = document.getElementById('output');

button.onclick = function () {
  var value = input.value || '';
  value = value.trim();

  var lines = value.replace('\r', '')
  .split('\n', -1)
  .map(function (val) {
    return val.trim();
  })
  .filter(function (val) {
    return val.length > 0;
  })
  .filter(function (val) {
    return val.indexOf('package:') === 0 && val.indexOf('.apk') > 0;
  })
  .sort()
  .map(function (val) {
    var apkIndex = val.lastIndexOf('.apk=');
    var packageIndex = apkIndex + '.apk='.length;

    var path = val.substring('package:'.length, packageIndex - 1);
    var pathSegments = splitPath(path);

    return {
      'group': '/' + pathSegments[0] + '/' + pathSegments[1],
      'path': pathSegments.slice(2, pathSegments.length - 1).join('/'),
      'apk': pathSegments[pathSegments.length - 1],
      'package': val.substring(packageIndex)
    }
  });

  createUi(lines, output);
};

function splitPath(input) {
  var pathSegments = input.split('/', -1)
  .filter(function (value) {
    return value.trim().length > 0;
  });
  return pathSegments;
}

function createLine(pkg, idx) {
  return '<tr>'
      + '<td class="h5 center p1"><input data-idx="' + idx
      + '" type="checkbox"></td>'
      + '<td class="h5 regular p1">' + pkg.group + '</td>'
      + '<td class="h5 p1">' + pkg.package + '</td>'
      + '<td class="h5 p1">' + pkg.path + '</td>'
      + '<td class="h5 p1">' + pkg.apk + '</td>'
      + '</tr>'
}

function createUi(packages, element) {
  var prefix = '<table class="mt3 table-flush table-light" id="packages-input">'
      + '<thead>'
      + '<tr>'
      + '<th class="bold p2">Select</th>'
      + '<th class="bold">Group</th>'
      + '<th class="bold">Package</th>'
      + '<th class="bold">Path</th>'
      + '<th class="bold">APK</th>'
      + '</tr></thead>'
      + '<tbody>';

  var content = packages.map(createLine).join('\n');

  var suffix = '</tbody></table><hr class="mt1 mb1"/>';

  var scriptButton = '<button class="mb1" onclick="generateFinalScript()">Generate final script</button>';
  var scriptOutput = '<div id="script-output"></div>';
  element.innerHTML = prefix
      + content
      + suffix
      + scriptButton
      + scriptOutput;

  element.data = packages;
}

function generateFinalScript() {
  var scriptOutput = document.getElementById("script-output");
  var table = output.getElementsByTagName('table')[0];

  var checkboxes = [];
  var raw = table.getElementsByTagName('input');
  for (var i = 0; i < raw.length; i++) {
    var checkbox = raw[i];
    checkboxes.push(checkbox);
  }

  var value = '# This is your debloat script\n'
      + '# Run it from your phone using adb shell\n\n';

  var script = checkboxes.filter(function (box) {
    return box.checked === true;
  })
  .map(function (box) {
    var index = Number(box.getAttribute('data-idx'));
    return output.data[index];
  })
  .map(function (pkg) {
    return "pm disable " + pkg.package
  })
  .join("\n");

  value += script;

  scriptOutput.innerHTML = '<hr/><textarea cols="120" rows="20">' + value
      + '</textarea>';
}