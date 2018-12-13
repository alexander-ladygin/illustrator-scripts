/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: niceSlice.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
$.toArr = function (classCollection, callback) {var arr = [], l = classCollection.length;if (l > 0) {for (var i = 0; i < l; i++) {arr.push(classCollection[i]);}}if (callback instanceof Function) return callback(arr);return arr;}
Array.prototype.removeAll = function() { var i = this.length; if (i > 0) while (i--) this[i].remove(); return this; }

var scriptName = 'NiceSlice',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    isUndo = false,
    $items = selection;

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

function ungroup (group) {
    var i = group.pageItems.length;
    if (i > 0) while (i--) group.pageItems[i].moveBefore(group);
    group.remove();
}

function getPosAnchors (anchors, xORy) {
    var arr = [], l = anchors.length;
    for (var i = 0; i < l; i++) {
        arr.push(anchors[i].anchor[xORy]);
    }
    return arr;
}

function rvbn (min, max) {
    // random value between numbers 
    return min + Math.floor(Math.random() * (max - min));
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

function niceSlice (items, userOptions) {
    var options = {
        fragments:    10,
        width:        'random',
        /*
            auto
            random
        */
        rotate:       0,
        offsetX:      10, // % of width
        offsetY:      10, // % of height
        gutter:       5,
        container:    'circle',
        /*
            square
            circle
        */
    }.extend(userOptions || {});

    options.fragments = (options.fragments > 0 ? options.fragments : 1) + 1;

    function randomWidth (maxsize) {
        var arr = [];
        for (var i = 0, j = options.fragments; i < options.fragments; i++, j--) {
            arr.push(rvbn(2, maxsize / 5));
            maxsize -= arr[i];
        }
        return arr;
    }

    function process (item) {
        var gutter = options.gutter,
            bnds = item.visibleBounds,
            $w = bnds[2] - bnds[0],
            $h = bnds[1] - bnds[3],
            isRW = (options.width === 'random');

        if (options.container === 'circle') {
            var checkSizeRect = item.parent.pathItems.rectangle(bnds[1], bnds[0], $w, $h);
                checkSizeRect.rotate(options.rotate);
            $w = checkSizeRect.visibleBounds[2] - checkSizeRect.visibleBounds[0];
            $h = checkSizeRect.visibleBounds[1] - checkSizeRect.visibleBounds[3];
            checkSizeRect.remove();
        }

        gutter = ($w / options.fragments) * (gutter / 100);

        var __w = ($w / options.fragments) - gutter + gutter / options.fragments,
            __h = $h,
            __t = bnds[1] + ($h - (bnds[1] - bnds[3])) / 2,
            __l = bnds[0] - ($w - (bnds[2] - bnds[0])) / 2,
            fragments = [],
            node, rect, group,
            evenOdd = 1;

        var gGroup = item.parent.groupItems.add();
        gGroup.move(item, ElementPlacement.PLACEBEFORE);
        try {

        if (isRW) {
            var $rWidth = randomWidth(__w * options.fragments),
                $l = 0;
        }

        for (var i = 0; i < options.fragments; i++) {
            evenOdd = (i % 2 === 0 ? -1 : 1);
            if (isRW) {
                __w = $rWidth[i] + gutter;
            }
                else {
                    __w = ((__w + gutter) * i);
                }
            group = gGroup.groupItems.add();

            // create slice item
            rect = group.pathItems.rectangle(__t - (options.offsetY / 100 * $h * evenOdd), __l + $l + (options.offsetX / 100 * $w * evenOdd), __w, __h);
            if (isRW) $l += __w + gutter;

            // item
            node = item.duplicate();
            node.top -= options.offsetY / 100 * $h * evenOdd;
            node.left += options.offsetX / 100 * $w * evenOdd;
            node.move(group, ElementPlacement.PLACEATEND);

            // clipping mask
            rect.clipping = group.clipped = true;

            fragments.push(group);
        }

        gGroup.rotate(options.rotate);
        ungroup(gGroup);

        for (var i = 0; i < options.fragments; i++) {
            fragments[i].pageItems[fragments[i].pageItems.length - 1].rotate(options.rotate * -1);
        }

        items[n].hidden = true;
        }
        catch(e){alert(e+'\n'+e.line);}

        return fragments;
    }

    var l = items.length;
    for (var n = 0; n < l; n++) {
        process(items[n]);
    }
}


var win = new Window('dialog', scriptName + copyright),
    sWidth = 120;

with (win.add('panel')) {
    alignChildren = 'fill';

    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Fragments:');
        var __fragmentsSlider = add('slider', [0, 0, sWidth, 15], 10, 1, 20);
        __fragmentsSlider.maximumSize = [1000, 15];
        __fragmentsSlider.onChanging = function (e) { __fragments.text = Math.round(this.value); }
        __fragmentsSlider.onChange = function (e) { previewStart(); }
        var __fragments = add('edittext', [0, 0, 50, 25], 10);
        __fragments.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 1, Infinity); __fragmentsSlider.value = Math.round(this.text); });
        __fragments.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Rotate:');
        var __rotateSlider = add('slider', [0, 0, sWidth + 24, 15], 0, 0, 360);
        __rotateSlider.maximumSize = [1000, 15];
        __rotateSlider.onChanging = function (e) { __rotate.text = Math.round(this.value); }
        __rotateSlider.onChange = function (e) { previewStart(); }
        var __rotate = add('edittext', [0, 0, 50, 25], 0);
        __rotate.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 0, 360); __rotateSlider.value = Math.round(this.text); });
        __rotate.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Offset X:');
        var __offsetXSlider = add('slider', [0, 0, sWidth + 15, 15], 0, -100, 100);
        __offsetXSlider.maximumSize = [1000, 15];
        __offsetXSlider.onChanging = function (e) { __offsetX.text = Math.round(this.value); }
        __offsetXSlider.onChange = function (e) { previewStart(); }
        var __offsetX = add('edittext', [0, 0, 50, 25], 0);
        __offsetX.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 100*-100, 100*100); __offsetXSlider.value = Math.round(this.text); });
        __offsetX.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Offset Y:');
        var __offsetYSlider = add('slider', [0, 0, sWidth + 15, 15], 0, -100, 100);
        __offsetYSlider.maximumSize = [1000, 15];
        __offsetYSlider.onChanging = function (e) { __offsetY.text = Math.round(this.value); }
        __offsetYSlider.onChange = function (e) { previewStart(); }
        var __offsetY = add('edittext', [0, 0, 50, 25], 0);
        __offsetY.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 100*-100, 100*100); __offsetYSlider.value = Math.round(this.text); });
        __offsetY.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Gutter:');
        var __gutterSlider = add('slider', [0, 0, sWidth + 20, 15], 0, 0, 80);
        __gutterSlider.maximumSize = [1000, 15];
        __gutterSlider.onChanging = function (e) { __gutter.text = Math.round(this.value); }
        __gutterSlider.onChange = function (e) { previewStart(); }
        var __gutter = add('edittext', [0, 0, 50, 25], 0);
        __gutter.addEventListener('keydown', function (e) { this.text = Math.round(this.text); inputNumberEvents(e, this, 0, 80); __gutterSlider.value = Math.round(this.text); });
        __gutter.addEventListener('keyup', function (e) { previewStart(); });
    }
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Container:');
        var __container = add('dropdownlist', undefined, 'Square,Circle'.split(','));
        __container.onChange = function () { previewStart(); }
        __container.selection = 0;
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
            $items.removeAll();
            win.close();
        }
            else {
                app.undo();
                startAction();
                isUndo = false;
                $items.removeAll();
                win.close();
            }
    }
}

function getData() {
    return {
        fragments: isNaN(Math.round(__fragments.text)) ? 10 : Math.round(__fragments.text),
        rotate:    isNaN(Math.round(__rotate.text)) ? 0 : Math.round(__rotate.text),
        offsetX:   isNaN(Math.round(__offsetX.text)) ? 0 : Math.round(__offsetX.text),
        offsetY:   isNaN(Math.round(__offsetY.text)) ? 0 : Math.round(__offsetY.text),
        gutter:    isNaN(Math.round(__gutter.text)) ? 5 : Math.round(__gutter.text),
        container: __container.selection.text.toLowerCase()
    };
}

function startAction() {
    niceSlice($items, getData());
}

function previewStart() {
    if (preview.value) {
        if (isUndo) app.undo();
            else isUndo = true;

        app.redraw();
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
            __fragments.text,
            __rotate.text,
            __offsetX.text,
            __offsetY.text,
            __gutter.text,
            __container.selection.index
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
            __fragments.text = __fragmentsSlider.value = parseInt($main[0]);
            __rotate.text = __rotateSlider.value = parseInt($main[1]);
            __offsetX.text = __offsetXSlider.value = parseInt($main[2]);
            __offsetY.text = __offsetYSlider.value = parseInt($main[3]);
            __gutter.text = __gutterSlider.value = parseInt($main[4]);
            __container.selection = parseInt($main[5]);
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
win.center();
win.show();