/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: createArtboardsFromTheSelection.jsx;

  Copyright (c) 2018
  www.ladyginpro.ru

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};
function inputNumberEvents (ev, _input, min, max, callback){
    var step,
        _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0,1) : '#none#'),
        _value = parseFloat(_input.text),
        units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');

    min = (min === undefined ? 0 : min);
    max = (max === undefined ? Infinity : max);
    step = (ev.shiftKey ? 10 : (ev.ctrlKey ? .1 : 1));

    if (isNaN(_value)) {
        _input.text = min;
    }
        else {
            _value = ( ((_dir === 'u')) ? _value + step : (((_dir === 'd')) ? _value - step : false) );
            if (_value !== false) {
                _value = (_value <= min ? min : (_value >= max ? max : _value))
                _input.text = _value;
                if (callback instanceof Function) callback(ev, _value, _input, min, max, units);
                    else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
            }
                else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
        }
}
function doubleValues (ev, __value, items) {
    if (ev.altKey && ((ev.keyName === 'Left') || (ev.keyName === 'Right'))) {
        var i = items.length;
        if (i > 0) while (i--) items[i].text = __value;
    }
}


var scriptName = 'CAFTS',
    copyright = ' \u00A9 www.ladyginpro.ru',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    };

var win = new Window('dialog', 'Create artboard from the selection \u00A9 www.ladyginpro.ru');
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

var panel = win.add('panel', undefined, 'Selection bounds:');
    panel.orientation = 'column';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = 20;

var eachSel = panel.add('radiobutton', undefined, 'Each in the selection'),
    selBnds = panel.add('radiobutton', undefined, 'Only selection bounds'),
    __itemName = panel.add('checkbox', undefined, 'Set name from element');
    __itemName.value = true;
    eachSel.value = true;
    eachSel.onClick = function() { __itemName.enabled = true; }
    selBnds.onClick = function() { __itemName.value = __itemName.enabled = false; }

with (panel.add('group')) {
    orientation = 'column';
    alignChildren = 'fill';

    with (add('group')) {
        orientation = 'row';

        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';
            add('statictext', undefined, 'Bleed Top:');
            var bleedTop = add('edittext', [0, 0, 80, 25], '0 px');
            bleedTop.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedTop, bleedBottom])); });
        }
        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';
            add('statictext', undefined, 'Bleed Right:');
            var bleedRight = add('edittext', [0, 0, 80, 25], '0 px');
            bleedRight.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedRight, bleedLeft])); });
        }
    }
    with (add('group')) {
        orientation = 'row';

        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';
            add('statictext', undefined, 'Bleed Bottom:');
            var bleedBottom = add('edittext', [0, 0, 80, 25], '0 px');
            bleedBottom.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedTop, bleedBottom])); });
        }
        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';
            add('statictext', undefined, 'Bleed Left:');
            var bleedLeft = add('edittext', [0, 0, 80, 25], '0 px');
            bleedLeft.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedRight, bleedLeft])); });
        }
    }
}

var panel = win.add('panel', undefined, 'Item bounds:');
    panel.orientation = 'row';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = 20;

var bndsVis = panel.add('radiobutton', undefined, 'Vsiible'),
    bndsGeo = panel.add('radiobutton', undefined, 'Geometric');
    bndsVis.value = true;

var winButtons = win.add('group');
    winButtons.alignChildren = ['fill', 'fill'];
    winButtons.margins = [0, 0, 0, 0];

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

    var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

function startAction() {
    var items = selection,
        i = items.length,
        $bounds = [],
        bleed = [
            $.convertUnits(bleedLeft.text, 'px'),
            $.convertUnits(bleedTop.text, 'px'),
            $.convertUnits(bleedRight.text, 'px'),
            $.convertUnits(bleedBottom.text, 'px')
        ],
        bounds = (bndsVis.value ? 'visible' : 'geometric') + 'Bounds';

    if (eachSel.value) {
        while (i--) {
            $bounds = [
                items[i][bounds][0] - bleed[0],
                items[i][bounds][1] + bleed[1],
                items[i][bounds][2] + bleed[2],
                items[i][bounds][3] - bleed[3]
            ];
            if (__itemName.value && items[i].name) activeDocument.artboards.add($bounds).name = items[i].name;
                else activeDocument.artboards.add($bounds);
        }
    }
        else {
            var x = [], y = [],
                w = [], h = [];
            while (i--) {
                x.push(items[i][bounds][0]);
                y.push(items[i][bounds][1]);
                w.push(items[i][bounds][2]);
                h.push(items[i][bounds][3]);
            };
            activeDocument.artboards.add([
                Math.min.apply(null, x) - bleed[0],
                Math.max.apply(null, y) + bleed[1],
                Math.max.apply(null, w) + bleed[2],
                Math.min.apply(null, h) - bleed[3]
            ]);
        }
    
    win.close();
}


function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            eachSel.value,
            selBnds.value,
            __itemName.value,
            bndsVis.value,
            bndsGeo.value,
            bleedTop.text,
            bleedRight.text,
            bleedBottom.text,
            bleedLeft.text
        ].toString();

    $file.open('w');
    $file.write(data);
    $file.close();
}

function loadSettings() {
    var $file = File(settingFile.folder + settingFile.name);
    if ($file.exists) {
        try {
            $file.open('r');
            var data = $file.read().split('\n'),
                $main = data[0].split(',');
            eachSel.value = ($main[0] === 'true');
            selBnds.value = ($main[1] === 'true');
            __itemName.value = ($main[2] === 'true');
            bndsVis.value = ($main[3] === 'true');
            bndsGeo.value = ($main[4] === 'true');
            bleedTop.text = $main[5];
            bleedRight.text = $main[6];
            bleedBottom.text = $main[7];
            bleedLeft.text = $main[8];

            __itemName.enabled = selBnds.value;
            __itemName.value = __itemName.enabled = !selBnds.value;
        } catch (e) {}
        $file.close();
    }
}

win.onClose = function () {
    saveSettings();
    return true;
}

function checkSettingFolder() {
    var $folder = new Folder(settingFile.folder);
    if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();
win.center();
win.show();