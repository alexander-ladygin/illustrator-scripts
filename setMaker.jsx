/* 

  Program version: Adobe Illustrator CS5+
  Name: setMaker.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};

var scriptName = 'SetMaker',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
    };

    var isUndo = false,
    win = new Window('dialog', scriptName + copyright);
    win.orientation = 'column';
    win.alignChildren = 'fill';

var panel = win.add('panel', undefined, scriptName + ' setting');
    panel.orientation = 'column';
    panel.alignChildren = 'fill';
    panel.margins = 20;

with (panel.add('group')) {
    orientation = 'row';
    alignChildren = 'left';

    with (add('group')) {
        orientation = 'column';
        alignChildren = 'left';
        add('statictext', undefined, 'Columns:');
        var valueColumns = add('edittext', [0, 0, 82, 25], 4);
    }
    with (add('group')) {
        orientation = 'column';
        alignChildren = 'left';
        add('statictext', undefined, 'Rows:');
        var valueRows = add('edittext', [0, 0, 82, 25], 4);
    }
}

var checkboxSize = panel.add('checkbox', undefined,'Set the size of elements');
    checkboxSize.onClick = function (e) {
        valueGroup.enabled = this.value;
        previewStart();
    };
    checkboxSize.value = false;

with (valueGroup = panel.add('group')) {
    enabled = false;
    orientation = 'row';
    alignChildren = 'left';

    add('statictext', undefined, 'Items size:');
    var valueSize = add('edittext', [0, 0, 100, 25], '80 px');
}

var groupGutter = panel.add('group');
    groupGutter.orientation = 'row';
    groupGutter.alignChildren = ['fill', 'fill'];

var groupGutterX = groupGutter.add('group');
    groupGutterX.orientation = 'column';
    groupGutterX.alignChildren = 'left';
var captionGutterX = groupGutterX.add('statictext', undefined, 'Gutter Cols:'),
    valueGutterX = groupGutterX.add('edittext', [0, 0, 80, 25], 0),
    positionX = groupGutterX.add('dropdownlist', [0, 0, 80, 25], ['Left', 'Center', 'Right']);
    positionX.selection = 1;

var groupGutterY = groupGutter.add('group');
    groupGutterY.orientation = 'column';
    groupGutterY.alignChildren = 'left';
var captionGutterY = groupGutterY.add('statictext', undefined, 'Gutter Rows:'),
    valueGutterY = groupGutterY.add('edittext', [0, 0, 80, 25], 0),
    positionY = groupGutterY.add('dropdownlist', [0, 0, 80, 25], ['Top', 'Middle', 'Bottom']);
    positionY.selection = 1;

var groupCheckbox = panel.add('group');
    groupCheckbox.orientation = 'row';
var toGroupCheckbox = groupCheckbox.add('checkbox', undefined, 'Group'),
    randomOrderCheckbox = groupCheckbox.add('checkbox', [0, 0, 100, 20], 'Random order');
    randomOrderCheckbox.onClick = previewStart;

var sortReverseGroup = panel.add('group');
    groupCheckbox.orientation = 'row';
var sortByPosition = sortReverseGroup.add('checkbox', undefined, 'Sort by Y'),
    reverseOrder = sortReverseGroup.add('checkbox', undefined, 'Reverse order');
    sortByPosition.onClick = reverseOrder.onClick = previewStart;

with (win.add('group')) {
    orientation = 'row';
    alignChildren = 'center';

    var preview = add('checkbox', undefined, 'Preview'),
        groupSets = add('checkbox', undefined, 'Group sets');
        groupSets.onClick = function() { previewStart(); }
    groupSets.value = false;
    groupSets.hide();
}

var winButtons = win.add('group');
    winButtons.orientation = 'row';
    winButtons.alignChildren = ['fill', 'fill'];
    winButtons.margins = 0;

var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

var ok = winButtons.add('button', undefined, 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = function (e) {
        if (preview.value && isUndo) app.undo();
        startAction();
        if (toGroupCheckbox.value || groupSets.value) toGroupItems();
        isUndo = false;
        win.close();
    };
    ok.active = true;

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
valueColumns.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 1, Infinity); previewStart(); });
valueRows.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 1, Infinity); previewStart(); });
valueSize.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); previewStart(); });
valueGutterX.addEventListener('keydown', function (e) {
    if (e.altKey && ((e.keyName === 'Right') || (e.keyName === 'Left'))) { valueGutterY.text = this.text; }
        else inputNumberEvents(e, this, 0, Infinity);
    previewStart();
});
valueGutterY.addEventListener('keydown', function (e) {
    if (e.altKey && ((e.keyName === 'Right') || (e.keyName === 'Left'))) { valueGutterX.text = this.text; }
        else inputNumberEvents(e, this, 0, Infinity);
    previewStart();
});
preview.onClick = function (e) { previewStart(); };

function toGroupItems() {
    var items = selection,
        i = items.length,
        target = items[0].parent,
        globalGroup = (toGroupCheckbox.value ? target.groupItems.add() : target),
        columns = parseInt(valueColumns.text),
        rows = parseInt(valueColumns.text),
        total = columns * rows,
        $group = (groupSets.value ? globalGroup.groupItems.add() : 0);

    for (var i = 0, j = 1; i < l; i++) {
        if (groupSets.value) {
            if (i === total * j) { j++; $group = globalGroup.groupItems.add(); }
            items[i].moveToBeginning($group);
        }
            else {
                items[i].moveToBeginning(globalGroup);
            }
    }
}

function selectionBounds (bounds, setWidthHeight, itemsize) {
    bounds = (typeof bounds === 'string' && bounds.length && bounds.slice(0,1) === 'v' ? 'visibleBounds' : 'geometricBounds');

    var arr = selection, x = [],
        y = [], w = [], h = [],
        size = [[], []],
        i = arr.length;

    while (i--) {
        if (setWidthHeight && itemsize) {
            var mode = (arr[i].width > arr[i].height ? 'width' : 'height'),
                percent = itemsize * 100 / arr[i][mode] / 100;
            arr[i][mode] = itemsize;
            arr[i][mode === 'width' ? 'height' : 'width'] *= percent;
        }
        x.push(arr[i][bounds][0]);
        y.push(arr[i][bounds][1]);
        w.push(arr[i][bounds][2]);
        h.push(arr[i][bounds][3]);
        size[0].push(arr[i][bounds][2] - arr[i][bounds][0]);
        size[1].push(arr[i][bounds][1] - arr[i][bounds][3]);
    };

    return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h), Math.max.apply(null, size[0]), Math.max.apply(null, size[1])];
}

Array.prototype.randomArray = function() {
    var ix = this.length, ti, $i;
    while (0 !== ix) {
        $i = Math.floor(Math.random() * ix);
        ix -= 1; ti = this[ix];
        this[ix] = this[$i];
        this[$i] = ti;
    }
    return this;
}

function startAction() {
    var bounds = 'visibleBounds',
        items = (sortByPosition.value ? selection.sort(function (a, b) {
            return a[bounds][1] <= b[bounds][1];
        }) : selection);
    if (randomOrderCheckbox.value) items.randomArray();
    if (reverseOrder.value) items.reverse();
    var l = items.length,
        gutter = {
            x: parseFloat(valueGutterX.text),
            y: parseFloat(valueGutterY.text)
        },
        __posXValue = positionX.selection.text.toLowerCase(),
        __posYValue = positionY.selection.text.toLowerCase(),
        columns = parseInt(valueColumns.text),
        rows = parseInt(valueRows.text),
        bnds = selectionBounds(bounds, checkboxSize.value, $.convertUnits(valueSize.text, 'px') || 0),
        total = columns * rows;

    function __align (__pos, __bnds) {
        if (__pos === 'middle') return (bnds[5] - (__bnds[1] - __bnds[3])) / 2;
            else if (__pos === 'bottom') return bnds[5] - (__bnds[1] - __bnds[3]);
            else if (__pos === 'center') return (bnds[4] - (__bnds[2] - __bnds[0])) / 2;
            else if (__pos === 'right') return bnds[4] - (__bnds[2] - __bnds[0]);
                else return 0;
    }

    if (l > 1) {
        for (var i = j = y = x = 0, sc = __sc = sr = 1; i < l; i++, x++) {
            if (x === columns) { y++; x = 0; }
            if (i === total * __sc) { __sc++; sc++; y = 0; }
            if (sc === columns) { sr++; x = 0; sc = 1; }
            items[i].left = bnds[0] + (sc >= 1 ? (bnds[4] * sc - 1) : 0) + (bnds[4] + gutter.x) * (x + (columns * (sc - 1))) + __align(__posXValue, items[i][bounds]);
            items[i].top = bnds[1] - (sr >= 1 ? (bnds[5] * sr - 1) : 0) - (bnds[5] + gutter.y) * (y + (rows * (sr - 1))) - __align(__posYValue, items[i][bounds]);
        }
    }
        else {
            isUndo = false;
        }
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

// preview
    valueSize.addEventListener(   'change', function (e) { previewStart(); });
    valueColumns.addEventListener('change', function (e) { previewStart(); });
    valueGutterY.addEventListener('change', function (e) { previewStart(); });
    valueGutterX.addEventListener('change', function (e) { previewStart(); });
    positionX.addEventListener(   'change', function (e) { previewStart(); });
    positionY.addEventListener(   'change', function (e) { previewStart(); });


    function saveSettings() {
        var $file = new File(settingFile.folder + settingFile.name),
            data = [
                valueColumns.text,
                valueGutterX.text,
                positionX.selection.index,
                valueGutterY.text,
                positionY.selection.index,
                toGroupCheckbox.value,
                randomOrderCheckbox.value,
                sortByPosition.value,
                reverseOrder.value,
                valueSize.text,
                checkboxSize.value,
                groupSets.value
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
                valueColumns.text = $main[0];
                valueGutterX.text = $main[1];
                positionX.selection = parseInt($main[2]);
                valueGutterY.text = $main[3];
                positionY.selection = parseInt($main[4]);
                toGroupCheckbox.value = ($main[5] === 'true');
                randomOrderCheckbox.value = ($main[6] === 'true');
                sortByPosition.value = ($main[7] === 'true');
                reverseOrder.value = ($main[8] === 'true');
                valueSize.text = $main[9];
                checkboxSize.value = ($main[10] === 'true');
                groupSets.value = ($main[11] === 'true');

                valueGroup.enabled = checkboxSize.value;
            } catch (e) {}
            $file.close();
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

loadSettings();
win.center();
win.show();