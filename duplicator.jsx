/* 

  Program version: Adobe Illustrator CS5+
  Name: duplicator.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/
function setFN() {
    $.errorMessage = function (err) {alert(err + '\n' + err.line);};
    $.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
    $.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};
    function LA(obj, callback, reverse) {if (!callback) {if (obj instanceof Array) {return obj;}else {var arr = $.getArr(obj);if (arr === obj) {if ($.isColor(obj)) {return obj;}else {return [obj];}}return arr;}}else if (callback instanceof Function) {var arr = $.getArr(obj);if (arr === obj) {arr = [obj];}if (reverse) {var i = arr.length;while (i--) callback(arr[i], i, arr);}else {for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);}return arr;}}
    $.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};
    $.isArr = function (a) {if ((!a)|| (typeof a === 'string')|| (a.typename === 'Document')|| (a.typename === 'Layer')|| (a.typename === 'PathItem')|| (a.typename === 'GroupItem')|| (a.typename === 'PageItem')|| (a.typename === 'CompoundPathItem')|| (a.typename === 'TextFrame')|| (a.typename === 'TextRange')|| (a.typename === 'GraphItem')|| (a.typename === 'Document')|| (a.typename === 'Artboard')|| (a.typename === 'LegacyTextItem')|| (a.typename === 'NoNNativeItem')|| (a.typename === 'Pattern')|| (a.typename === 'PlacedItem')|| (a.typename === 'PluginItem')|| (a.typename === 'RasterItem')|| (a.typename === 'MeshItem')|| (a.typename === 'SymbolItem')) {return false;}else if (!a.typename && !(a instanceof Array)) {return false;}else {return true;}};
    $.getArr = function (obj, attr, value, exclude) {var arr = [];function checkExclude (item) {if (exclude !== undefined) {var j = exclude.length;while (j--) if (exclude[j] === item) return true;}return false;}if ($.isArr(obj)) {for (var i = 0; i < obj.length; i++) {if (!checkExclude(obj[i])) {if (attr) {if (value !== undefined) {arr.push(obj[i][attr][value]);}else {arr.push(obj[i][attr]);}}else {arr.push(obj[i]);}}}return arr;}else if (attr) {return obj[attr];}else {return obj;}};
    $.each = function (object, callback, reverse) {try {if (object && object.length) {var l = object.length;if (!reverse) for (var i = 0; i < l; i++) callback(object[i], i, object);else while (l--) callback(object[l], l, object);}return $;}catch (e) {$.errorMessage('$.each() - error: ' + e);}};
    Object.prototype.each = function (callback, reverse) {if (this.length) $.each(this, callback, reverse);return this;};
    Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
    Object.prototype.comparingArrays = function (arr) {var check = 0;if (this.length !== arr.length) {return false;}for (var i = 0; i < arr.length; i++) {if (this[i] === arr[i]) {check++;}}if (check === arr.length) {return true;}else {return false;}};
    Object.prototype.getBounds = function (bounds) {bounds = bounds || 'geometricBounds';bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;if (this.typename === 'Artboard') {return this.artboardRect;}else if (this[0] && this[0].comparingArrays(selection)) {return selection.getBounds(bounds);}else if (this instanceof Array && !(this instanceof Object)) {return this;}else {var arr = LA(this), x = [],y = [], w = [], h = [];for (var i = 0; i < arr.length; i++) {x.push(arr[i][bounds][0]);y.push(arr[i][bounds][1]);w.push(arr[i][bounds][2]);h.push(arr[i][bounds][3]);};return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];}};
    String.prototype.btSend = function (__appName) {var BT = new BridgeTalk;BT.body = this;BT.target = __appName || app.name.toLowerCase().replace('adobe ', '');BT.onError = function (err) { alert('Error: ' + err.body); };BT.send();return BT;}
    Object.prototype.stringify = function (startSeparator, type) {startSeparator = startSeparator || ['{', '}'];var str = startSeparator[0], separator = '';for (var i in this) {if (this[i] instanceof Object && typeof this[i] === 'object') {if (this[i] instanceof Array) {str += separator + '"' + i + '":' + this[i].stringify(['[', ']'], 'array');}else {str += separator + '"' + i + '":' + this[i].stringify(null, 'object');}}else if (!(this[i] instanceof Function)) {if (type === 'array') {str += separator + '"' + this[i] + '"';}else {str += separator + '"' + i + '":"' + this[i] + '"';}}separator = ',';}return str + startSeparator[1];};
    Object.prototype.stepArepeat = function (userOptions) {
        try {
            var options = {
                direction: 'middleright',
                position: 'relative',
                bounds: 'visible',
                eachSelection: false,
                ghostCopies: false,
                copies: 0,
                spacing: {
                    x: '0 px',
                    y: '0 px'
                }
            }.extend(userOptions || {}, true);

            options.eachSelection = (options.eachSelection === 'true');
            options.ghostCopies = (options.ghostCopies === 'true');

            // convert units
            options.spacing.x = $.convertUnits(options.spacing.x, 'px');
            options.spacing.y = $.convertUnits(options.spacing.y, 'px');
            options.bounds = options.bounds.toLowerCase().replace('bounds', '') + 'Bounds';
            options.copies = isNaN(parseInt(options.copies)) ? 0 : parseInt(options.copies);
            options.position = options.position.slice(0, 1).toLowerCase();

            var collection = [],
                items = LA(this),
                $gBounds = items.getBounds(options.bounds);

            function moveItem(item, offsetX, offsetY) {
                item.left += offsetX;
                item.top += offsetY;
                return item;
            }

            function beforeMoveitem(item, counter) {
                var iBounds = (options.position === 'r' ? (options.eachSelection ? item[options.bounds] : $gBounds) : [0, 0, 0, 0]),
                    offsetX = iBounds[2] - iBounds[0] + options.spacing.x,
                    offsetY = iBounds[1] - iBounds[3] + options.spacing.y;

                if (options.direction === 'topleft') {
                    return moveItem(item, offsetX * -1, offsetY);
                }
                else if (options.direction === 'topcenter') {
                    return moveItem(item, 0, offsetY);
                }
                else if (options.direction === 'topright') {
                    return moveItem(item, offsetX, offsetY);
                }
                else if (options.direction === 'middleright') {
                    return moveItem(item, offsetX, 0);
                }
                else if (options.direction === 'bottomright') {
                    return moveItem(item, offsetX, offsetY * -1);
                }
                else if (options.direction === 'bottomcenter') {
                    return moveItem(item, 0, offsetY * -1);
                }
                else if (options.direction === 'bottomleft') {
                    return moveItem(item, offsetX * -1, offsetY * -1);
                }
                else if (options.direction === 'middleleft') {
                    return moveItem(item, offsetX * -1, 0);
                }
                else if (options.direction === 'center') {
                    return moveItem(item, 0, 0);
                }
            }

            items.each(function (item, i, arr) {

                var l = options.copies;

                if (l) for (var j = 1; j < l + 1; j++) {
                    if (!options.ghostCopies) {
                        var copyItem = item.duplicate();
                        copyItem.selected = false;
                        collection.push(copyItem);
                    }
                    beforeMoveitem(item, j);
                }
                else beforeMoveitem(item, 1);

            });

            return this;
        }
        catch (e) {
            $.errorMessage('stepArepeat() - error: ' + e);
        }
    };
}
setFN();

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
function doubleGutters (ev, _value, items) {
    if (ev.altKey && ((ev.keyName === 'Left') || (ev.keyName === 'Right'))) {
        var i = items.length;
        if (i > 0) while (i--) items[i].text = _value;
    }
}

var scriptName = 'Duplicator',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
    },
    $winLocation = [0, 0],
    $size = {
        win: {
            value: 'max',
            max: [232, 410],
            mim: [232, 325],
            mid: [232, 265],
            min: [232, 190],
        },
        button: [0, 0, 40, 40],
    };

var win = new Window('palette', scriptName + copyright);
    win.alignChildren = 'fill';
    win.addEventListener('mousedown', function (e) {
        if (e.button === 2) {
            $size.win.value = ($size.win.value === 'max' ? 'mim' : ($size.win.value === 'mim' ? 'mid' : ($size.win.value === 'mid' ? 'min' : 'max')));
            win.size = $size.win[$size.win.value];
            win.update();
        }
    });

with (win.add('panel')) {
    orientation = 'column';
    alignChildren = 'center';

    with (add('group')) {
        orientation = 'row';
        var topleft = add('button', $size.button, '\u2196');
            topleft.onClick = function() { runScript('topleft'); }
        var topcenter = add('button', $size.button, '\u2191');
            topcenter.onClick = function() { runScript('topcenter'); }
        var topright = add('button', $size.button, '\u2197');
            topright.onClick = function() { runScript('topright'); }
    }
    with (add('group')) {
        orientation = 'row';
        var middleleft = add('button', $size.button, '\u2190');
            middleleft.onClick = function() { runScript('middleleft'); }
        var center = add('button', $size.button, '\u27F3');
            center.onClick = function() { runScript('center'); }
        var middleright = add('button', $size.button, '\u2192');
            middleright.onClick = function() { runScript('middleright'); }
    }
    with (add('group')) {
        orientation = 'row';
        var bottomleft = add('button', $size.button, '\u2199');
            bottomleft.onClick = function() { runScript('bottomleft'); }
        var bottomcenter = add('button', $size.button, '\u2193');
            bottomcenter.onClick = function() { runScript('bottomcenter'); }
        var bottomright = add('button', $size.button, '\u2198');
            bottomright.onClick = function() { runScript('bottomright'); }
    }
}
with (win.add('panel')) {
    orientation = 'column';
    alignChildren = 'fill';

    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        with (add('group')) {
            orientation = 'column';
            alignChildren = 'fill';

            add('statictext', undefined, 'Copies:');
            var __copies = add('edittext', undefined, 0);
            __copies.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); });
        }
        with (add('group')) {
            orientation = 'column';
            alignChildren = 'fill';

            add('statictext', undefined, 'Gutter X:');
            var __gutterX = add('edittext', undefined, '0 px');
            __gutterX.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleGutters(e, this.text, [__gutterX, __gutterY]); });
        }
        with (add('group')) {
            orientation = 'column';
            alignChildren = 'fill';

            add('statictext', undefined, 'Gutter Y:');
            var __gutterY = add('edittext', undefined, '0 px');
            __gutterY.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, Infinity); doubleGutters(e, this.text, [__gutterX, __gutterY]); });
        }
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var __eachSelection = add('checkbox', undefined, 'Apply for each elements');
        __eachSelection.value = false;
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var __ghostCopies = add('checkbox', undefined, 'Ghost copies (skip steps)');
        __ghostCopies.value = false;
    }
    var __bounds = add('dropdownlist', undefined, 'Bounds: Geometric,Bounds: Visible'.split(',')),
        __position = add('dropdownlist', undefined, 'Position: Relative,Position: Absolute'.split(','));
    __bounds.selection = __position.selection = 0;
}

function getData (direction) {
    return {
        direction: direction,
        position: __position.selection.text.replace('Position: ', '').toLowerCase(),
        bounds: __bounds.selection.text.replace('Bounds: ', '').toLowerCase(),
        eachSelection: __eachSelection.value,
        ghostCopies: __ghostCopies.value,
        copies: parseInt(__copies.text),
        spacing: {
            x: __gutterX.text,
            y: __gutterY.text
        }
    }.stringify();
}

function runScript (direction) {
    (setFN.toString() + '\nsetFN();' + '\nselection.stepArepeat(' + getData(direction) + ')').btSend();
}

function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __position.selection.index,
            __bounds.selection.index,
            __eachSelection.value,
            __ghostCopies.value,
            __copies.text,
            __gutterX.text,
            __gutterY.text,
            $size.win.value
        ].toString() + '\n' + win.location.toString();

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
                $main = data[0].split(','),
                $location = data[1].split(',');
            __position.selection.index = parseInt($main[0]);
            __bounds.selection.index = parseInt($main[1]);
            __eachSelection.value = ($main[2] === 'true');
            __ghostCopies.value = ($main[3] === 'true');
            __copies.text = $main[4];
            __gutterX.text = $main[5];
            __gutterY.text = $main[6];
            $size.win.value = $main[7];

            $winLocation = $location;
        } catch (e) {}
        $file.close();
    }
}

win.onClose = function() {
    saveSettings();
    return true;
}

loadSettings();
// win.minimumSize = $size.win.min;
// win.maximumSize = $size.win.max;
// win.size = $size.win[$size.win.value];
win.update();
win.center();
win.show();