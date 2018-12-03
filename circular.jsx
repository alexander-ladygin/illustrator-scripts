/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: circular.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
$.getBounds = function (arr, bounds) {bounds = bounds || 'geometricBounds';bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;var x = [], y = [], w = [], h = [];for (var i = 0; i < arr.length; i++) {x.push(arr[i][bounds][0]);y.push(arr[i][bounds][1]);w.push(arr[i][bounds][2]);h.push(arr[i][bounds][3]);};return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];};
$.toArr = function (classCollection, callback) {var arr = [], l = classCollection.length;if (l > 0) {for (var i = 0; i < l; i++) {arr.push(classCollection[i]);}}if (callback instanceof Function) return callback(arr);return arr;}
$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};

var isUndo = false,
    scriptName = 'Circular',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    $items = selection;

function ungroup (group) {
    var i = group.pageItems.length;
    if (i > 0) while (i--) group.pageItems[i].moveBefore(group);
    group.remove();
}

function circular (userOptions) {
    var options = {
        copies: 7,
        offset: 200,
        angleStart: 0,
        angleEnd:  360,
        notCopies: true,
        resetItem: true,
        bounds: 'visible',
        direction: 'down',
        isRotateItem: false,
        rotateItemAngle: 45,
        position: 'relative',
        counterclockwise: false,
    }.extend(userOptions || {});

    var CCW = !options.counterclockwise ? -1 : 1,
        TFP = options.direction.toUpperCase().replace('UP', 'TOP').replace('DOWN', 'BOTTOM');
    options.bounds = (options.bounds.slice(0,1).toLowerCase() === 'v' ? 'visibleBounds' : 'geometricBounds');
    options.direction = options.direction.toLowerCase().slice(0,1);
    options.copies = (options.copies > 0 ? options.copies : 1);
    options.offset = $.convertUnits(options.offset, 'px');

    var sbnds = $.getBounds($items, options.bounds),
        cpos = {
            x: sbnds[0] + (sbnds[2] - sbnds[0]) / 2,
            y: sbnds[1] - (sbnds[1] - sbnds[3]) / 2,
        };

    if (options.notCopies) {
        var items = $items, l = items.length,
            aVal = (options.angleEnd - options.angleStart) / (l > 1 ? (options.angleEnd >= 350 ? l : l - 1) : l);
            // aVal = (options.angleEnd - options.angleStart) / (l - 1 > 0 ? l - 1 : l);

        for (var i = 0; i < l; i++) {
            toRotate(items[i], options.angleStart + aVal * i, cpos);
        }
    }
        else {
            var items = $items, l = items.length,
                aVal = (options.angleEnd - options.angleStart) / options.copies;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < options.copies; j++) {
                    toRotate(items[i], options.angleStart + aVal * j);
                }
                // items[i].remove();
            }
        }

    function toRotate (item, angle, $pos) {
        angle *= CCW;

        var $offset = options.offset,
            bnds = item[options.bounds],
            $w = bnds[2] - bnds[0],
            $h = bnds[1] - bnds[3];

        if (options.position.toLowerCase().slice(0,1) === 'r') $offset += ($w >= $h ? $w : $h);

        // align center
        if (options.notCopies) {
            item.position = [$pos.x - $w / 2, $pos.y + $h / 2];
            bnds = item[options.bounds];
        }

        var centerPointSize = 0,
            $group = item.parent.groupItems.add(),
            node = (options.notCopies ? item : item.duplicate($group, ElementPlacement.INSIDE)),
            centerPoint = $group.pathItems.ellipse(bnds[1] - $h / 2 + centerPointSize / 2, bnds[0] + $w / 2 - centerPointSize / 2, centerPointSize, centerPointSize);

        // move items
        $group.moveBefore(item);
        if (options.notCopies) node.moveToBeginning($group);

        // set $offset
        // node.position = [node.position[0], node.position[1] - $offset];
        if (options.direction === 'u') node.top -= $offset;
            else if (options.direction === 'r') node.left -= $offset;
            else if (options.direction === 'd') node.top += $offset;
            else if (options.direction === 'l') node.left += $offset;

        // rotate item
        $group.rotate(angle, true, true, true, true, Transformation[TFP]);
    
        // reset rotate from the item
        if (options.resetItem) node.rotate(angle * -1, true, true, true, true, Transformation.CENTER);
        // rotate only item
        if (options.isRotateItem) node.rotate((__randomRotate.value ? Math.floor(Math.random() * 360) : options.rotateItemAngle * CCW), true, true, true, true, Transformation.CENTER);
    
        centerPoint.remove();
        ungroup($group);

        return item;
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

function normalizeAngle (val, item, min, max) {
    if (item === __startAngle) {
        if (val > parseFloat(__endAngle.text)) { __endAngleSlider.value = __endAngle.text = ((val + 1) >= max ? max : val + 1); }
    }
        else if (item === __endAngle) {
            if (val < parseFloat(__startAngle.text)) { __startAngleSlider.value = __startAngle.text = ((val - 1) <= min ? min - 1 : val - 1); }
        }
}

var win = new Window('dialog', scriptName + copyright);
win.alignChildren = 'fill';

with (panel = win.add('panel')) {
    alignChildren = ['fill', 'bottom'];

    with (add('group')) {
        orientation = 'row';

        add('statictext', [0, 0, 80, 25], 'Start angle:').justify = 'center';
        var __startAngleSlider = add('slider', [0, 0, 150, 15], 0, 0, 359),
            __startAngle = add('edittext', [0, 0, 40, 25], 0);
        __startAngleSlider.onChanging = function (e) { __startAngle.text = Math.round(this.value); normalizeAngle(Math.round(this.value), __startAngle, 1, 360); }
        __startAngleSlider.onChange = function (e) { previewStart(); }
        __startAngle.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, 359); __startAngleSlider.value = Math.round(this.text); });
        __startAngle.addEventListener('keyup', function (e) { normalizeAngle(this.value, __startAngle, 1, 360); previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';

        var __isEndAngle = add('checkbox', [0, 0, 80, 25], 'End angle:'),
            __endAngleSlider = add('slider', [0, 0, 150, 15], 360, 1, 360),
            __endAngle = add('edittext', [0, 0, 40, 25], 360);
        __endAngleSlider.onChanging = function (e) { __endAngle.text = Math.round(this.value); normalizeAngle(Math.round(this.value), __endAngle, 1, 360); }
        __endAngleSlider.onChange = function (e) { previewStart(); }
        __endAngle.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 1, 360); __endAngleSlider.value = Math.round(this.text); });
        __endAngle.addEventListener('keyup', function (e) { normalizeAngle(this.value, __endAngle, 1, 360); previewStart(); });

        __isEndAngle.onClick = function () { __endAngleSlider.enabled = __endAngle.enabled = this.value; previewStart(); }
        __endAngleSlider.enabled = __endAngle.enabled = false;
    }
    with (add('group')) {
        orientation = 'row';

        var __isRotateItem = add('checkbox', undefined, 'Rotate each items'),
            __randomRotate = add('checkbox', undefined, 'Random R each items');

        __isRotateItem.onClick = function () {
            __randomRotate.enabled = this.value;
            __rotateItemSlider.enabled = __rotateItemAngle.enabled = (this.value && __randomRotate.value ? false : this.value);
            previewStart();
        }
        __randomRotate.onClick = function () { __rotateItemSlider.enabled = __rotateItemAngle.enabled = !this.value; previewStart(); }
    }
    with (add('group')) {
        var __rotateItemSlider = add('slider', [0, 0, 240, 15], 360, 0, 360),
            __rotateItemAngle = add('edittext', [0, 0, 40, 25], 360);

        __rotateItemSlider.onChanging = function (e) { __rotateItemAngle.text = Math.round(this.value); normalizeAngle(Math.round(this.value), __rotateItemAngle, 0, 360); }
        __rotateItemSlider.onChange = function (e) { previewStart(); }
        __rotateItemAngle.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, 360); __rotateItemSlider.value = Math.round(this.text); });
        __rotateItemAngle.addEventListener('keyup', function (e) { previewStart(); });
        __rotateItemSlider.enabled = __rotateItemAngle.enabled = false;
    }

    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        add('statictext', undefined, 'Offset:');
        var __offset = add('edittext', [0, 0, 80, 25], '0 px'),
            __direction = add('dropdownlist', undefined, 'Direction: Up,Direction: Right,Direction: Down,Direction: Left'.split(','));
        __direction.selection = 0;
        __offset.addEventListener('keydown', function (e) { inputNumberEvents(e, this, -Infinity, Infinity); });
        __offset.addEventListener('keyup', function (e) { previewStart(); });
        __direction.onChange = function () { previewStart(); }
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var __pos = add('dropdownlist', [0, 0, 90, 25], 'Position: Absolute,Position: Relative'.split(','));
        __pos.selection = 1;
        __pos.onChange = function () { previewStart(); }
        var __bounds = add('dropdownlist', [0, 0, 90, 25], 'Bounds: Geometric,Bounds: Visible'.split(','));
        __bounds.selection = 0;
        __bounds.onChange = function () { previewStart(); }
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'left';

        var __counterClockwise = add('checkbox', undefined, 'Counter Clockwise');
        __counterClockwise.onClick = function () { previewStart(); }
        var __notRotate = add('checkbox', undefined, 'Reset rotate from item');
        __notRotate.onClick = function () { previewStart(); }
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'left';

        var __copiesEnabled = add('checkbox', undefined, 'Copies enabled');
        __copiesEnabled.onClick = function () { __copies.enabled = this.value; previewStart(); }
        var __copies = add('edittext', [0, 0, 170, 25], 1);
        __copies.enabled = false;
        __copies.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 1, Infinity); this.text = parseInt(this.text); });
        __copies.addEventListener('keyup', function (e) { previewStart(); });
        __copies.onChange = function () { if (isNaN(parseInt(this.text))) this.text = 1; }
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
        copies: parseInt(__copies.text),
        offset: __offset.text,
        angleStart: parseInt(__startAngle.text),
        angleEnd:  (!__isEndAngle.value ? 360 : parseInt(__endAngle.text)),
        notCopies: !__copiesEnabled.value,
        resetItem: __notRotate.value,
        bounds: __bounds.selection.text.toLowerCase().replace('bounds: ', ''),
        direction: __direction.selection.text.toLowerCase().replace('direction: ', ''),
        position: __pos.selection.text.toLowerCase().replace('position: ', ''),
        counterclockwise: __counterClockwise.value,
        isRotateItem: __isRotateItem.value,
        rotateItemAngle: __rotateItemSlider.value,
    };
}


function startAction() {
    circular(getData());
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

    selection = $items;
    saveSettings();
    return true;
}

function saveSettings() {
    try{
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __startAngleSlider.value,
            __startAngle.text,
            __isEndAngle.value,
            __endAngleSlider.value,
            __endAngle.text,
            __offset.text,
            __direction.selection.index,
            __pos.selection.index,
            __bounds.selection.index,
            __counterClockwise.value,
            __notRotate.value,
            __copiesEnabled.value,
            __copies.text,
            __isRotateItem.value,
            __rotateItemSlider.value,
            __rotateItemAngle.text,
            __randomRotate.value
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
            __startAngleSlider.value = parseInt($main[0]);
            __startAngle.text = $main[1];
            __isEndAngle.value = ($main[2] === 'true');
            __endAngleSlider.value = parseInt($main[3]);
            __endAngle.text =  $main[4];
            __offset.text =  $main[5];
            __direction.selection.index = parseInt($main[6]);
            __pos.selection.index = parseInt($main[7]);
            __bounds.selection.index = parseInt($main[8])
            __counterClockwise.value = ($main[9] === 'true');
            __notRotate.value = ($main[10] === 'true');
            __copiesEnabled.value = ($main[11] === 'true');
            __copies.text = $main[12];
            __isRotateItem.value = ($main[13] === 'true');
            __rotateItemSlider.value = parseInt($main[14]);
            __rotateItemAngle.text = $main[15];
            __randomRotate.value = ($main[16] === 'true');

            __copies.enabled = __copiesEnabled.value;
            __endAngleSlider.enabled = __endAngle.enabled = __isEndAngle.value;
            __randomRotate.enabled = __isRotateItem.value;
            __rotateItemSlider.enabled = __rotateItemAngle.enabled = (__isRotateItem.value && __randomRotate.value ? false : __isRotateItem.value);
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

selection = null;
app.redraw();

win.center();
win.show();