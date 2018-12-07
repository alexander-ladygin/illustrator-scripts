/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: bigBang.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
$.getBounds = function (arr, bounds) {bounds = bounds || 'geometricBounds';bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;var x = [], y = [], w = [], h = [];for (var i = 0; i < arr.length; i++) {x.push(arr[i][bounds][0]);y.push(arr[i][bounds][1]);w.push(arr[i][bounds][2]);h.push(arr[i][bounds][3]);};return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];};
$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};


var scriptName = 'bigBang',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    isUndo = false,
    $count = selection.length;


function bigBang (items, userOptions) {
    try {
    var options = {
        offset: 100,
        delta: 100,
        keyObject: 0,
        isKeyObject: false,
    }.extend(userOptions || {});

    options.offset = $.convertUnits(options.offset, 'px');

    var delta = options.delta / 100,
        BNDS = 'geometricBounds',
        gbnds = (options.isKeyObject ? selection[options.keyObject][BNDS] : $.getBounds(selection, BNDS)),
    // var gbnds = $.getBounds(selection),
        x1 = gbnds[0] + (gbnds[2] - gbnds[0]) / 2,
        y1 = gbnds[1] - (gbnds[1] - gbnds[3]) / 2;

    var normalizePreview = activeDocument.pathItems.add();
    normalizePreview.remove();

    function elementShift (item) {
        var ibnds = item[BNDS],
            $w = (ibnds[2] - ibnds[0]) / 2,
            $h = (ibnds[1] - ibnds[3]) / 2,
            x2 = ibnds[0] + $w,
            y2 = ibnds[1] - $h,
            u = Math.atan2(y1 - y2, x1 - x2),
            d = (Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)) + options.offset) * delta;

        var cos = Math.cos(u) * d,
            sin = Math.sin(u) * d,
            x3 = x1 + (cos < 0 ? cos * -1 : cos) * (x2 > x1 ? 1 : -1),
            y3 = y1 + (sin > 0 ? sin * -1 : sin) * (y2 > y1 ? -1 : 1);

        item.position = [x3 - $w, y3 + $h];
    }

    var l = items.length;
    for (var i = 0; i < l; i++) {
        if (options.isKeyObject && i === options.keyObject) continue;
        elementShift(items[i]);
    }

    return items;
    }catch(e) {
        alert(e + '\n' + e.line);
    }
}


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
            _value = ( ((_dir === 'u') || (_dir === 'r')) ? _value + step : (((_dir === 'd') || (_dir === 'l')) ? _value - step : false) );
            if (_value !== false) {
                _value = (_value <= min ? min : (_value >= max ? max : _value))
                _input.text = _value;
                if (callback instanceof Function) callback(_value, _input, min, max, units);
                    else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
            }
                else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
        }
}

var win = new Window('dialog', scriptName + copyright);
with (panel = win.add('panel', undefined, 'Offset')) {
    alignChildren = ['fill', 'bottom'];

    with (add('group')) {
        orientation = 'row';

        // add('statictext', [0, 0, 80, 25], 'Offset:').justify = 'center';
        var __offsetSlider = add('slider', [0, 0, 250, 15], 0, -300, 300),
            __offset = add('edittext', [0, 0, 50, 25], '0 px');
        __offsetSlider.onChanging = function (e) {
            var units = (',px,pt,mm,cm,in,'.indexOf(__offset.text.length > 2 ? (',' + __offset.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? __offset.text.replace(/ /g, '').slice(-2) : '')
            __offset.text = Math.round(this.value) + (units ? ' ' + units : '');
        }
        __offsetSlider.onChange = function (e) { previewStart(); }
        __offset.addEventListener('keydown', function (e) { inputNumberEvents(e, this, Infinity, Infinity); __offsetSlider.value = Math.round(this.text); });
        __offset.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';

        var __isKeyObject = add('checkbox', undefined, 'Key object'),
            __keyObject = add('slider', [0, 0, 170, 15], 1, 1, $count);
            __keyObjectTitle = add('statictext', [0, 0, 40, 25], 1);
        __keyObjectTitle.justify = 'center';
        __keyObject.enabled = __keyObjectTitle.enabled = __isKeyObject.value;
        __isKeyObject.onClick = function (e) { __keyObject.enabled = __keyObjectTitle.enabled = Math.round(this.value); previewStart(); }
        __keyObject.onChanging = function (e) { __keyObjectTitle.text = Math.round(this.value); }
        __keyObject.onChange = function (e) { previewStart(); }
    }
    with (add('group')) {
        orientation = 'row';

        add('statictext', undefined, 'Delta:');
        var __deltaSlider = add('slider', [0, 0, 180, 15], 0, -100, 100),
            __delta = add('edittext', [0, 0, 50, 25], 0);
        __deltaSlider.onChanging = function (e) { __delta.text = Math.round(this.value) }
        __deltaSlider.onChange = function (e) { previewStart(); }
        __delta.addEventListener('keydown', function (e) { inputNumberEvents(e, this, Infinity, Infinity); __deltaSlider.value = Math.round(this.text); });
        __delta.addEventListener('keyup', function (e) { previewStart(); });
    }
}
with (win.add('group')) {
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var preview = add('checkbox', undefined, 'Preview'),
        cancelBtn = add('button', undefined, 'Cancel'),
        applyBtn = add('button', undefined, 'OK');

    preview.onClick = function() { previewStart(); }
    cancelBtn.onClick = function() { win.close(); }
    applyBtn.onClick = function() {
        if (preview.value && isUndo) {
            isUndo = false;
            win.close();
        }
            else {
                app.undo();
                startAction();
                isUndo = false;
                win.close();
            }
    }
}

function getData() {
    return {
        offset: __offset.text,
        delta: parseFloat(__delta.value),
        isKeyObject: __isKeyObject.value,
        keyObject: Math.round(__keyObject.value) - 1,
    };
}


function startAction() {
    bigBang(selection, getData());
}

function previewStart() {
    if (preview.value) {
        if (isUndo) app.undo();
            else isUndo = true;

        startAction();
        app.redraw();
    }
        else if (isUndo) {
            app.undo();
            app.redraw();
            isUndo = false;
        }
}

win.onClose = function () {
    if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
    }

    saveSettings();
    return true;
}

function saveSettings() {
    try{
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __offsetSlider.value,
            __offset.text,
            __isKeyObject.value,
            __deltaSlider.value,
            __delta.text
        ].toString();

    $file.open('w');
    $file.write(data);
    $file.close();
    }catch(e){$.errorMessage(e);}
}

function loadSettings() {
    var $file = File(settingFile.folder + settingFile.name);
    if ($file.exists) {
        try {
            $file.open('r');
            var data = $file.read().split('\n'),
                $main = data[0].split(',');
            __offsetSlider.value = parseInt($main[0]);
            __offset.text = $main[1];
            __isKeyObject.value = ($main[3] === 'true');
            __deltaSlider.value = parseInt($main[4]);
            __delta.text = $main[5];

            __keyObject.enabled = __keyObjectTitle.enabled = __isKeyObject.value;
        } catch (e) {}
        $file.close();
    }
}

function checkSettingFolder() {
    var $folder = new Folder(settingFile.folder);
    if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();

win.center();
win.show();