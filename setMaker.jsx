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
    },
    gprops = {
        sets: 0,
        width: 0,
        height: 0,
    },
    wSize = {
        mode: 'max',
        min: [240, 460],
        max: [400, 400]
    };

var isUndo = false,
    win = new Window('dialog', scriptName + copyright);
    win.orientation = 'column';
    win.alignChildren = 'fill';

var globalGroup = win.add('group');
    globalGroup.orientation = 'row';
    globalGroup.margins = 0;

with (panelLeft = globalGroup.add('panel', undefined, scriptName + ' setting')) {
    orientation = 'column';
    alignChildren = 'fill';
    margins = [20, 20, 20, 5];

    with (add('group')) {
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
    
    var checkboxSize = add('checkbox', undefined,'Set the size of elements');
        checkboxSize.onClick = function (e) {
            valueGroup.enabled = this.value;
            previewStart();
        };
        checkboxSize.value = false;
    
    with (valueGroup = add('group')) {
        enabled = false;
        orientation = 'row';
        alignChildren = 'left';
    
        add('statictext', undefined, 'Items size:');
        var valueSize = add('edittext', [0, 0, 100, 25], '80 px');
    }

    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';

            var captionGutterX = add('statictext', undefined, 'Gutter Cols:'),
                valueGutterX = add('edittext', [0, 0, 80, 25], 0),
                positionX = add('dropdownlist', [0, 0, 80, 25], ['Left', 'Center', 'Right']);
                positionX.selection = 1;
        }

        with (add('group')) {
            orientation = 'column';
            alignChildren = 'left';

            var captionGutterY = add('statictext', undefined, 'Gutter Rows:'),
                valueGutterY = add('edittext', [0, 0, 80, 25], 0),
                positionY = add('dropdownlist', [0, 0, 80, 25], ['Top', 'Middle', 'Bottom']);
                positionY.selection = 1;
        }
    }

    with (add('group')) {
        orientation = 'row';

        var toGroupCheckbox = add('checkbox', undefined, 'Group'),
            randomOrderCheckbox = add('checkbox', [0, 0, 100, 20], 'Random order');
            randomOrderCheckbox.onClick = previewStart;
    }

    with (add('group')) {
        orientation = 'row';

        var sortByPosition = add('checkbox', undefined, 'Sort by Y'),
            reverseOrder = add('checkbox', undefined, 'Reverse order');
            sortByPosition.onClick = reverseOrder.onClick = previewStart;
    }

    var groupSets = add('checkbox', undefined, 'Group sets each separately');
        groupSets.onClick = function() { previewStart(); }
        groupSets.value = false;

    var createArtPerSet = add('checkbox', undefined, 'Create artboards per set');
        createArtPerSet.onClick = function() {
            panelRight.enabled = this.value;
            wSize.mode = this.value ? 'max' : 'min';
            // win.size = wSize[wSize.mode];
        }
        createArtPerSet.value = false;
}



with (panelRight = globalGroup.add('panel', undefined, 'Artboards setting')) {
    enabled = false;
    orientation = 'column';
    alignChildren = 'fill';
    margins = [20, 20, 20, 25];

    var chArtAutoSize = add('checkbox', undefined, 'Auto size (by set size)');
    chArtAutoSize.onClick = function (e) { artSizeGroup.enabled = !this.value; artBleedGroup.enabled = this.value;  previewStart(); }
    chArtAutoSize.value = true;

    with (artSizeGroup = add('group')) {
        enabled = false;
        orientation = 'row';
        alignChildren = 'fill';

        with (add('group')) {
            orientation = 'row';
            alignChildren = 'left';
            add('statictext', [0, 0, 20, 25], 'W:');
            var etArtWidth = add('edittext', [0, 0, 82, 25], '100 px');
            etArtWidth.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 10, Infinity); doubleValues(e, this.text, [etArtWidth, etArtHeight]); previewStart(); });
        }
        with (add('group')) {
            orientation = 'row';
            alignChildren = 'left';
            add('statictext', [0, 0, 20, 25], 'H:');
            var etArtHeight = add('edittext', [0, 0, 82, 25], '100 px');
            etArtHeight.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 10, Infinity); doubleValues(e, this.text, [etArtWidth, etArtHeight]); previewStart(); });
        }
    }

    with (artBleedGroup = add('group')) {
        orientation = 'column';
        alignChildren = 'fill';

        with (add('group')) {
            orientation = 'row';

            with (add('group')) {
                orientation = 'column';
                alignChildren = 'left';
                add('statictext', undefined, 'Bleed Top:');
                var bleedTop = add('edittext', [0, 0, 112, 25], '0 px');
                bleedTop.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedTop, bleedBottom])); previewStart(); });
            }
            with (add('group')) {
                orientation = 'column';
                alignChildren = 'left';
                add('statictext', undefined, 'Bleed Right:');
                var bleedRight = add('edittext', [0, 0, 112, 25], '0 px');
                bleedRight.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedRight, bleedLeft])); previewStart(); });
            }
        }
        with (add('group')) {
            orientation = 'row';

            with (add('group')) {
                orientation = 'column';
                alignChildren = 'left';
                add('statictext', undefined, 'Bleed Bottom:');
                var bleedBottom = add('edittext', [0, 0, 112, 25], '0 px');
                bleedBottom.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedTop, bleedBottom])); previewStart(); });
            }
            with (add('group')) {
                orientation = 'column';
                alignChildren = 'left';
                add('statictext', undefined, 'Bleed Left:');
                var bleedLeft = add('edittext', [0, 0, 112, 25], '0 px');
                bleedLeft.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleValues(e, this.text, (e.shiftKey ? [bleedTop, bleedRight, bleedBottom, bleedLeft] : [bleedRight, bleedLeft])); previewStart(); });
            }
        }
    }

    var chEnableSetName = add('checkbox', undefined, 'Set name on artboard');
    chEnableSetName.onClick = function (e) { artNameGroup.enabled = etArtName.enabled = this.value; }
    chEnableSetName.value = true;
    var etArtName = add('edittext', [0, 0, 180, 25], 'setMaker');

    with (artNameGroup = add('group')) {
        orientation = 'column';
        alignChildren = 'left';

        with (add('group')) {
            orientation = 'row';
            add('statictext', undefined, 'Prefix:');
            var etArtNamePrefix = add('edittext', [0, 0, 185, 25], 'LA_');
        }
        with (add('group')) {
            orientation = 'row';
            add('statictext', undefined, 'Suffix:');
            var etArtNameSuffix = add('edittext', [0, 0, 185, 25], '_www.ladygin.pro');
        }
    }
}

with (winButtons = win.add('group')) {
    margins = 0;
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var preview = add('checkbox', undefined, 'Preview');

    var cancel = add('button', undefined, 'Cancel');
        cancel.helpTip = 'Press Esc to Close';
        cancel.onClick = function () { win.close(); }

    var ok = add('button', undefined, 'OK');
        ok.helpTip = 'Press Enter to Run';
        ok.onClick = function (e) {
            if (preview.value && isUndo) { isUndo = false; }
                else { startAction(); isUndo = false; }
            toGroupItems();
            win.close();
        };
        ok.active = true;
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


function __ungroup ($groups) {
    var i = $groups.length;
    if (i > 0) while (i--) {
        var j = $groups[i].pageItems.length;
        if (j > 0) while (j--) {
            while (j--) $groups[i].pageItems[j].moveBefore($groups[i]);
        }
        $parent.remove();
    }
}

function createArtboard (set, prevSet, removeOldArtboards) {
    try {
        var sBnds = set.geometricBounds,
            $name = etArtNamePrefix.text + etArtName.text + etArtNameSuffix.text,
            csBnds = {
                w: (sBnds[2] - sBnds[0]),
                h: -(sBnds[3] - sBnds[1]),
                cx: sBnds[0] + (sBnds[2] - sBnds[0]) / 2,
                cy: sBnds[1] - (-(sBnds[3] - sBnds[1])) / 2,
            };

        if (prevSet && (set.pageItems.length < (gprops.total))) {
            csBnds.w = prevSet.geometricBounds[2] - prevSet.geometricBounds[0];
            csBnds.h = -(prevSet.geometricBounds[3] - prevSet.geometricBounds[1]);
        }

        var artOfSet = activeDocument.artboards.add(chArtAutoSize.value ? [
                sBnds[0] - gprops.art.bleed.left,
                sBnds[1] + gprops.art.bleed.top,
                sBnds[2] + gprops.art.bleed.right,
                sBnds[3] - gprops.art.bleed.bottom
            ] : [
                sBnds[0] - (gprops.art.width - csBnds.w) / 2,
                sBnds[1] + (gprops.art.height - csBnds.h) / 2,
                sBnds[0] + gprops.art.width - (gprops.art.width - csBnds.w) / 2,
                sBnds[1] - (gprops.art.height - (gprops.art.height - csBnds.h) / 2)
            ]);

        if (chEnableSetName.value) artOfSet.name = set.name = $name;

        if (removeOldArtboards) activeDocument.artboards[0].remove();
    }
        catch (err) {}
}

function toGroupItems() {
    var items = selection,
        l = items.length,
        target = items[0].parent,
        globalGroup = (toGroupCheckbox.value ? target.groupItems.add() : target),
        columns = parseInt(valueColumns.text),
        rows = parseInt(valueColumns.text),
        total = columns * rows,
        $group = globalGroup.groupItems.add(),
        groups = [$group];

    for (var i = 0, j = 1; i < l; i++) {
        if (i === total * j) {
            $group = globalGroup.groupItems.add(); $group.move(globalGroup, ElementPlacement.PLACEATEND);
            groups.push($group);
            j++;
        }
        items[i].move($group, ElementPlacement.PLACEATEND);
    }

    if (createArtPerSet.value) {
        var j = l = groups.length, al = activeDocument.artboards.length;
        if (al > 1) while (al-- > 1) activeDocument.artboards[al].remove();
        if (j > 0) while (j--) createArtboard(groups[j], j > 0 ? groups[j - 1] : false, j === l - 1);
    }
    if (!groupSets.value) __ungroup(groups);
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
        $art = {
            width: $.convertUnits(etArtWidth.text, 'px'),
            height: $.convertUnits(etArtHeight.text, 'px'),
            bleed: {
                top: $.convertUnits(bleedTop.text, 'px'),
                right: $.convertUnits(bleedRight.text, 'px'),
                bottom: $.convertUnits(bleedBottom.text, 'px'),
                left: $.convertUnits(bleedLeft.text, 'px'),
            }
        },
        artOffsetX = ($art.width - ((bnds[4] + gutter.x) * columns - gutter.x)) * 2,
        artOffsetY = ($art.height - ((bnds[5] + gutter.y) * rows - gutter.y)) * 2,
        offsetX = (chArtAutoSize.value ? ($art.bleed.left + $art.bleed.right) : (artOffsetX < 0 ? artOffsetX * -1 : artOffsetX)),
        offsetY = (chArtAutoSize.value ? ($art.bleed.top + $art.bleed.left) : (artOffsetY < 0 ? artOffsetY * -1 : artOffsetY)),
        total = columns * rows;

    bnds[0] -= (artOffsetX / 2 + (gutter.x * 1.75));
    bnds[2] -= (artOffsetX / 2 + (gutter.x * 1.75));
    bnds[1] += (artOffsetY / 2 + (gutter.y * 1.75));
    bnds[3] += (artOffsetY / 2 + (gutter.y * 1.75));

    gprops = {
        sets: Math.round(l / columns * rows),
        total: columns * rows,
        width: (bnds[4] + gutter.x) * columns - gutter.x + offsetX,
        height: (bnds[5] + gutter.y) * rows - gutter.y + offsetY,
        art: $art,
        offset: {
            x: offsetX,
            y: offsetY,
        }
    };

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
            items[i].left = bnds[0] + (sc >= 1 ? ((offsetX / 2 + bnds[4]) * sc - 1) : 0) + (bnds[4] + gutter.x) * (x + (columns * (sc - 1))) + __align(__posXValue, items[i][bounds]);
            items[i].top = bnds[1] - (sr >= 1 ? ((offsetY / 2 + bnds[5]) * sr - 1) : 0) - (bnds[5] + gutter.y) * (y + (rows * (sr - 1))) - __align(__posYValue, items[i][bounds]);
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
                groupSets.value,
                chArtAutoSize.value,
                etArtWidth.text,
                etArtHeight.text,
                bleedTop.text,
                bleedRight.text,
                bleedBottom.text,
                bleedLeft.text,
                chEnableSetName.value,
                createArtPerSet.value,
                valueRows.text,
            ].toString() + '\n' + etArtName.text + '\n' + etArtNamePrefix.text + '\n' + etArtNameSuffix.text + '\n' + wSize.mode;
    
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
                    $names = data[1];
                    $prefix = data[2];
                    $suffix = data[3];
                    $wSizeMode = data[4];
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
                chArtAutoSize.value = ($main[12] === 'true');
                etArtWidth.text = $main[13];
                etArtHeight.text = $main[14];
                bleedTop.text = $main[15];
                bleedRight.text = $main[16];
                bleedBottom.text = $main[17];
                bleedLeft.text = $main[18];
                chEnableSetName.value = ($main[19] === 'true');
                createArtPerSet.value = ($main[20] === 'true');
                valueRows.text = $main[21];

                etArtName.text = $names;
                etArtNamePrefix.text = $prefix;
                etArtNameSuffix.text = $suffix;

                panelRight.enabled = createArtPerSet.value;
                valueGroup.enabled = checkboxSize.value;
                artSizeGroup.enabled = !chArtAutoSize.value;
                artBleedGroup.enabled = chArtAutoSize.value;
                artNameGroup.enabled = etArtName.enabled = chEnableSetName.value;

                wSize.mode = $wSizeMode || 'max';
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