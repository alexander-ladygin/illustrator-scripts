/* 

  Program version: Adobe Illustrator CS5+
  Name: harmonizer.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro
  Copyright (c) 2018

*/
var isUndo = false, isRandomOrder = false,
    win = new Window('dialog', 'Harmonize', undefined);
    win.orientation = 'column';
    win.alignChildren = 'fill';

var panel = win.add('panel', undefined, 'Harmonize setting');
    panel.orientation = 'column';
    panel.alignChildren = 'fill';
    panel.margins = 20;

var groupColumns = panel.add('group');
    groupColumns.orientation = 'row';
    groupColumns.alignChildren = 'center';
var captionColumns = groupColumns.add('statictext', undefined, 'Columns:'),
    valueColumns = groupColumns.add('edittext', [0, 0, 110, 25], 4);

var groupGutter = panel.add('group');
    groupGutter.orientation = 'row';
    groupGutter.alignChildren = ['fill', 'fill'];

var groupGutterX = groupGutter.add('group');
    groupGutterX.orientation = 'column';
    groupGutterX.alignChildren = 'left';
var captionGutterX = groupGutterX.add('statictext', undefined, 'Gutter X:'),
    valueGutterX = groupGutterX.add('edittext', [0, 0, 80, 25], 0),
    positionX = groupGutterX.add('dropdownlist', [0, 0, 80, 25], ['Left', 'Center', 'Right']);
    positionX.selection = 0;

var groupGutterY = groupGutter.add('group');
    groupGutterY.orientation = 'column';
    groupGutterY.alignChildren = 'left';
var captionGutterY = groupGutterY.add('statictext', undefined, 'Gutter Y:'),
    valueGutterY = groupGutterY.add('edittext', [0, 0, 80, 25], 0),
    positionY = groupGutterY.add('dropdownlist', [0, 0, 80, 25], ['Top', 'Middle', 'Bottom']);
    positionY.selection = 0;

var groupCheckbox = panel.add('group');
    groupCheckbox.orientation = 'row';
var toGroupCheckbox = groupCheckbox.add('checkbox', undefined, 'Group'),
    randomOrderCheckbox = groupCheckbox.add('checkbox', [0, 0, 100, 20], 'Random order');

var preview = win.add('checkbox', undefined, 'Preview');

var winButtons = win.add('group');
    winButtons.orientation = 'row';
    winButtons.alignChildren = ['fill', 'fill'];
    winButtons.margins = 0;

var ok = winButtons.add('button', undefined, 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = function (e) {
        if (preview.value && isUndo) app.undo();
        if (randomOrderCheckbox.value) randomOrder();
        startAction();
        if (toGroupCheckbox.value) toGroupItems();
        isUndo = false;
        win.close();
    };
    ok.active = true;

var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

function randomOrder() {
    var items = selection,
        l = i = items.length;

    while (i--) {
        var j = Math.floor(Math.random() * l);
        items[j].zOrder(ZOrderMethod.SENDTOBACK);
    }

    isRandomOrder = false;
}

function handle_key(key, control, min){var step;if(key.shiftKey){step = 10;}else if(key.ctrlKey){step = .1}else{step = 1}switch (key.keyName){case "Up": control.text = String(Number(parseFloat(control.text))+step); break;case "Down": control.text = String(Number(parseFloat(control.text))-step);}if((control.text === 'NaN') || (control.text <= 0)){control.text = min}}
valueColumns.addEventListener('keydown', function (e) { handle_key(e, this, 1); previewStart(); });
valueGutterX.addEventListener('keydown', function (e) { handle_key(e, this, 0); previewStart(); });
valueGutterY.addEventListener('keydown', function (e) { handle_key(e, this, 0); previewStart(); });
preview.onClick = function (e) { previewStart(); };

function toGroupItems() {
    var items = selection,
        i = items.length,
        target = items[0].parent,
        __group = target.groupItems.add();

    while (i--) {
        items[i].moveToBeginning(__group);
    }

    return __group;
}

function selectionBounds (bounds) {
    bounds = (typeof bounds === 'string' && bounds.length && bounds.slice(0,1) === 'v' ? 'visibleBounds' : 'geometricBounds');

    var arr = selection, x = [],
        y = [], w = [], h = [],
        size = [[], []],
        i = arr.length;

    while (i--) {
        x.push(arr[i][bounds][0]);
        y.push(arr[i][bounds][1]);
        w.push(arr[i][bounds][2]);
        h.push(arr[i][bounds][3]);
        size[0].push(arr[i][bounds][2] - arr[i][bounds][0]);
        size[1].push(arr[i][bounds][1] - arr[i][bounds][3]);
    };

    return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h), Math.max.apply(null, size[0]), Math.max.apply(null, size[1])];
}

function startAction() {
    var items = selection,
        bounds = 'visibleBounds',
        l = items.length, __rows = 0,
        gutter = {
            x: parseFloat(valueGutterX.text),
            y: parseFloat(valueGutterY.text)
        },
        __posXValue = positionX.selection.text.toLowerCase(),
        __posYValue = positionY.selection.text.toLowerCase(),
        columns = parseInt(valueColumns.text),
        bnds = selectionBounds(bounds);

    function __align (__pos, __bnds) {
        if (__pos === 'middle') return (bnds[5] - (__bnds[1] - __bnds[3])) / 2;
            else if (__pos === 'bottom') return bnds[5] - (__bnds[1] - __bnds[3]);
            else if (__pos === 'center') return (bnds[4] - (__bnds[2] - __bnds[0])) / 2;
            else if (__pos === 'right') return bnds[4] - (__bnds[2] - __bnds[0]);
                else return 0;
    }

    for (var i = j = 0; i < l; i++, j++) {
        if (j === columns) { __rows++; j = 0; }
        items[i].left = bnds[0] + (bnds[4] + gutter.x) * j + __align(__posXValue, items[i][bounds]);
        items[i].top = bnds[1] - (bnds[5] + gutter.y) * __rows - __align(__posYValue, items[i][bounds]);
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
    valueColumns.addEventListener('change', function (e) { previewStart(); });
    valueGutterY.addEventListener('change', function (e) { previewStart(); });
    valueGutterX.addEventListener('change', function (e) { previewStart(); });
    positionX.addEventListener(   'change', function (e) { previewStart(); });
    positionY.addEventListener(   'change', function (e) { previewStart(); });


win.onClose = function () {
    if (isUndo) {
        app.undo();
        app.redraw();
        isUndo = false;
    }

    win.close();
}

win.center();
win.show();