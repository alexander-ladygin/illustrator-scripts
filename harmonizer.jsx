/* 

  Program version: Adobe Illustrator CS5+
  Name: harmonizer.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/

var scriptName = 'Harmonizer',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    };

var isUndo = false,
    win = new Window('dialog', scriptName + ' \u00A9 www.ladygin.pro', undefined);
    win.orientation = 'column';
    win.alignChildren = 'fill';

var panel = win.add('panel', undefined, 'Harmonizer setting');
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
    positionX.selection = 1;

var groupGutterY = groupGutter.add('group');
    groupGutterY.orientation = 'column';
    groupGutterY.alignChildren = 'left';
var captionGutterY = groupGutterY.add('statictext', undefined, 'Gutter Y:'),
    valueGutterY = groupGutterY.add('edittext', [0, 0, 80, 25], 0),
    positionY = groupGutterY.add('dropdownlist', [0, 0, 80, 25], ['Top', 'Middle', 'Bottom']);
    positionY.selection = 1;

var groupCheckbox = panel.add('group');
    groupCheckbox.orientation = 'row';
var toGroupCheckbox = groupCheckbox.add('checkbox', undefined, 'Group'),
    randomOrderCheckbox = groupCheckbox.add('checkbox', [0, 0, 100, 20], 'Random order');
    randomOrderCheckbox.onClick = previewStart;

// var sortReverseGroup = panel.add('group');
    // groupCheckbox.orientation = 'row';

with (panel.add('group')) {
    orientation = 'column';
    alignChildren = ['fill', 'fill'];

    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        add('statictext', undefined, 'Sort items by:');
        var reverseOrder = add('checkbox', undefined, 'Reverse order');
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var sortByY = add('radiobutton', undefined, 'Y'),
            sortByX = add('radiobutton', undefined, 'X'),
            sortByS = add('radiobutton', undefined, 'S'),
            sortByW = add('radiobutton', undefined, 'W'),
            sortByH = add('radiobutton', undefined, 'H');
        sortByY.helpTip = 'Sort by Top to Bottom';
        sortByX.helpTip = 'Sort by Left to Right';
        sortByS.helpTip = 'Sort by Size (width + height) max to min';
        sortByW.helpTip = 'Sort by Width max to min';
        sortByH.helpTip = 'Sort by Height min to max';
    }
}


sortByY.onClick = sortByX.onClick = sortByW.onClick = sortByH.onClick = sortByS.onClick = reverseOrder.onClick = previewStart;

var preview = win.add('checkbox', undefined, 'Preview');

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
        if (toGroupCheckbox.value) toGroupItems();
        isUndo = false;
        win.close();
    };
    ok.active = true;

function handle_key(key, control, min){var step;if(key.shiftKey){step = 10;}else if(key.ctrlKey){step = .1}else{step = 1}switch (key.keyName){case "Up": control.text = String(Number(parseFloat(control.text))+step); break;case "Down": control.text = String(Number(parseFloat(control.text))-step);}if((control.text === 'NaN') || (control.text <= 0)){control.text = min}}
valueColumns.addEventListener('keydown', function (e) { handle_key(e, this, 1); previewStart(); });
valueGutterX.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.keyName === 'Right') { valueGutterY.text = this.text; }
        else handle_key(e, this, 0);
    previewStart();
});
valueGutterY.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.keyName === 'Left') { valueGutterX.text = this.text; }
        else handle_key(e, this, 0);
    previewStart();
});
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
        items = (sortByY.value ? selection.sort(function (a, b) {
                    return a[bounds][1] <= b[bounds][1];
                }) : (sortByX.value ? selection.sort(function (a, b) {
                    return a[bounds][0] >= b[bounds][0];
                }) : (sortByS.value ? selection.sort(function (a, b) {
                    return a.width + a.height <= b.width + b.height;
                }) : (sortByW.value ? selection.sort(function (a, b) {
                    return a.width <= b.width;
                }) : (sortByH.value ? selection.sort(function (a, b) {
                    return a.height <= b.height;
                }) : selection)))));
    if (randomOrderCheckbox.value) items.randomArray();
    if (reverseOrder.value) items.reverse();
    var l = items.length, __rows = 0,
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

    if (l > 1) {
        for (var i = j = 0; i < l; i++, j++) {
            if (j === columns) { __rows++; j = 0; }
            items[i].left = bnds[0] + (bnds[4] + gutter.x) * j + __align(__posXValue, items[i][bounds]);
            items[i].top = bnds[1] - (bnds[5] + gutter.y) * __rows - __align(__posYValue, items[i][bounds]);
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
                sortByY.value,
                reverseOrder.value,
                sortByX.value,
                sortByW.value,
                sortByH.value,
                sortByS.value
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
                sortByY.value = ($main[7] === 'true');
                reverseOrder.value = ($main[8] === 'true');
                sortByX.value = ($main[9] === 'true');
                sortByW.value = ($main[10] === 'true');
                sortByH.value = ($main[11] === 'true');
                sortByS.value = ($main[12] === 'true');
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

function checkSettingFolder() {
    var $folder = new Folder(settingFile.folder);
    if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();
win.center();
win.show();