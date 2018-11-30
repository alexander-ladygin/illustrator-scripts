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

var scriptName = 'Circular',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
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
        anchor: 'bottom',
        position: 'relative',
        counterclockwise: false,
    }.extend(userOptions || {});

    var TFP = options.anchor.toUpperCase();
    options.bounds = (options.bounds.slice(0,1).toLowerCase() === 'v' ? 'visibleBounds' : 'geometricBounds');
    options.anchor = options.anchor.toLowerCase().slice(0,1);
    options.copies = (options.copies > 0 ? options.copies : 1);

    var sbnds = $.getBounds(selection, options.bounds),
        cpos = {
            x: sbnds[0] + (sbnds[2] - sbnds[0]) / 2,
            y: sbnds[1] - (sbnds[1] - sbnds[3]) / 2,
        };

    if (options.notCopies) {
        var l = $items.length,
            aVal = (options.angleEnd - options.angleStart) / (l > 1 ? (options.angleEnd >= 350 ? l : l - 1) : l);
            // aVal = (options.angleEnd - options.angleStart) / (l - 1 > 0 ? l - 1 : l);

        for (var i = 0; i < l; i++) {
            toRotate($items[i], aVal * i, cpos);
        }
    }
        else {
            var $items = selection, l = $items.length,
                aVal = (options.angleEnd - options.angleStart) / options.copies;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < options.copies; j++) {
                    toRotate($items[i], aVal * j);
                }
                $items[i].remove();
            }
        }

    function toRotate (item, angle, $pos) {
        angle *= !options.counterclockwise ? -1 : 1;

        var offset = options.offset,
            bnds = item[options.bounds],
            $w = bnds[2] - bnds[0],
            $h = bnds[1] - bnds[3];

        if (options.position.toLowerCase().slice(0,1) === 'r') offset += (((options.anchor === 'l') || (options.anchor === 'r')) ? $w : $h);

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

        // set offset
        // node.position = [node.position[0], node.position[1] - offset];
        switch (options.anchor) {
            case 't' : node.position = [node.position[0], node.position[1] - offset]; break;
            case 'r' : node.position = [node.position[0] - offset, node.position[1]]; break;
            case 'b' : node.position = [node.position[0], node.position[1] + offset]; break;
            case 'l' : node.position = [node.position[0] + offset, node.position[1]]; break;
        }

        // rotate item
        $group.rotate(angle, true, true, true, true, Transformation[TFP]);
    
        // reset rotate from the item
        if (options.resetItem) node.rotate(angle * -1, true, true, true, true, Transformation.CENTER);
    
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

var win = new Window('dialog', scriptName + copyright);
win.alignChildren = 'fill';

with (panel = win.add('panel')) {
    alignChildren = ['fill', 'bottom'];

    with (add('group')) {
        orientation = 'row';

        add('statictext', [0, 0, 80, 25], 'Start angle:').justify = 'center';
        var __startAngleSlider = add('slider', [0, 0, 100, 15], 0, 0, 360),
            __startAngle = add('edittext', [0, 0, 40, 25], 0);
        __startAngleSlider.onChanging = function (e) { __startAngle.text = Math.round(this.value); }
        __startAngle.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, 360); __startAngleSlider.value = Math.round(this.text); });
    }
    with (add('group')) {
        orientation = 'row';

        var __isEndAngle = add('checkbox', [0, 0, 80, 25], 'End angle:'),
            __endAngleSlider = add('slider', [0, 0, 100, 15], 0, 0, 360),
            __endAngle = add('edittext', [0, 0, 40, 25], 0);
        __endAngleSlider.onChanging = function (e) { __endAngle.text = Math.round(this.value); }
        __endAngle.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0, 360); __endAngleSlider.value = Math.round(this.text); });

        __isEndAngle.onClick = function () { __endAngleSlider.enabled = __endAngle.enabled = this.value; }
        __endAngleSlider.enabled = __endAngle.enabled = false;
    }

    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        add('statictext', undefined, 'Offset:');
        var __offset = add('edittext', [0, 0, 80, 25], '0 px'),
            __anchor = add('dropdownlist', undefined, 'Anchor: Top,Anchor: Right,Anchor: Bottom,Anchor: Left'.split(','));
        __anchor.selection = 0;
        __offset.addEventListener('keydown', function (e) { inputNumberEvents(e, this, -Infinity, Infinity) });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'bottom'];

        var __counterClockwise = add('checkbox', undefined, 'Counter Clockwise'),
            __bounds = add('dropdownlist', [0, 0, 90, 25], 'Bounds: Geometric,Bounds: Visible'.split(','));
        __bounds.selection = 0;
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var __anchor = add('dropdownlist', [0, 0, 90, 25], 'Anchor: Top,Anchor: Right,Anchor: Bottom,Anchor: Left'.split(','));
        __anchor.selection = 0;

        var __pos = add('dropdownlist', [0, 0, 90, 25], 'Position: Absolute,Position: Relative'.split(','));
        __pos.selection = 0;
    }
}

with (win.add('group')) {
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var preview = add('checkbox', undefined, 'Preview'),
        cancel = add('button', undefined, 'Cancel'),
        apply = add('button', undefined, 'Ok');

    cancel.onClick = function() { win.close(); }
    apply.onClick = function() {
        circular(getData());
    }
}

function getData() {
    return {
        copies: 0,
        offset: __offset.text,
        angleStart: parseInt(__startAngle.text),
        angleEnd:  (!__isEndAngle.value ? 360 : parseInt(__endAngle.text)),
        notCopies: true,
        resetItem: false,
        bounds: __bounds.selection.text.toLowerCase.replace('bounds: ', ''),
        anchor: __anchor.selection.text.toLowerCase.replace('anchor: ', ''),
        position: __pos.selection.text.toLowerCase.replace('position: ', ''),
        counterclockwise: __counterClockwise.value,
    };
}

win.center();
win.show();