/* 

  Program version: Adobe Illustrator CS5+
  Name: minusOffset.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
$.getUnits = function (val, def) {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);};

var scriptName = 'minusOffset',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
    },
    firstItemName = '__' + scriptName + '__firstName',
    $nesting = 1000;

function getLiveOffsetProps() {
    return '<LiveEffect name="Adobe Offset Path"><Dict data="R mlim ' +
        parseFloat(__miterlimit.text) + ' R ofst ' +
        $.convertUnits(__offset.text, 'px') + ' I jntp ' +
        __joins.selection.index +
        ' "/></LiveEffect>';
}

function liveOffset (item) {
    item.applyEffect(getLiveOffsetProps());
    app.executeMenuCommand('expandStyle');
    return item;
}

function __group (items, placement) {
    var i = items.length;
    if (i > 0) {
        var $group = activeDocument.groupItems.add();
        $group.moveBefore(placement);
        while (i--) items[i].moveToBeginning($group);
        return $group;
    }
}

function __ungroup ($group) {
    var i = $group.pageItems.length;
    if (i > 0) while (i--) $group.pageItems[i].moveBefore($group);
    $group.remove();
}

function minusOffset (topItem, items, nestingLevel) {
    var l = items.length,
        removeCollection = [];

    if (l > (!nestingLevel ? 1 : 0)) {
        selection = null;
        if (!nestingLevel) progressBarCounter = progressBar.maxvalue / l;

        for (var i = (!nestingLevel ? 1 : 0); i < l; i++) {
            if (__inGroups.value && (nestingLevel < $nesting) && items[i].typename === 'GroupItem') {
                if (items[i].pageItems.length) minusOffset(topItem, items[i].pageItems, nestingLevel + 1);
            }
                else {
                    var firstItem = liveOffset(topItem.duplicate());
                    firstItem.name = firstItemName;

                    __group([items[i], firstItem], items[i]).selected = true;
                    app.executeMenuCommand('Live Pathfinder Minus Back');
                    app.executeMenuCommand('expandStyle');
                    try {
                        selection[0].pageItems.getByName(firstItemName).remove();
                        removeCollection.push(selection[0]);
                    }
                        catch (e) {
                            if (selection[0] && selection[0].typename === 'GroupItem') __ungroup(selection[0]);
                        }
                    selection = null;
                }

            if (!nestingLevel) {
                progressBar.value += progressBarCounter;
                win.update();
            }
        }
        var j = removeCollection.length;
        if (j > 0) while (j--) removeCollection[j].remove();
    }

    return topItem;
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
    win.orientation = 'column';
    win.alignChildren = 'fill';

win.addEventListener('keydown', function (e) {
    if (e.keyName.toLowerCase() === 'enter') {
        startAction();
    }
});

with (globalGroup = win.add('group')) {
    orientation = 'column';
    alignChildren = 'fill';

    with (add('panel')) {
        orientation = 'column';
        alignChildren = 'left';

        with (add('group')) {
            add('statictext', undefined, 'Offset:');
            var __offset = add('edittext', [0, 0, 90, 25], '10 px');
            __offset.active = true;
            __offset.addEventListener('keydown', function (e) { inputNumberEvents(e, this, -Infinity, Infinity) });
        }
        with (add('group')) {
            add('statictext', undefined, 'Joins:');
            var __joins = add('dropdownlist', [0, 0, 97, 25], 'Round,Bevel,Miter'.split(','));
            __joins.selection = 2;
        }
        with (add('group')) {
            add('statictext', undefined, 'Miter limit:');
            var __miterlimit = add('edittext', [0, 0, 70, 25], 4);
            __miterlimit.addEventListener('keydown', function (e) { inputNumberEvents(e, this, -Infinity, Infinity) });
        }
        var __inGroups = add('checkbox', undefined, 'Each in the group');
        __inGroups.onClick = function() { nestingUIGroup.enabled = this.value; }
        __inGroups.value = false;
        with (nestingUIGroup = add('group')) {
            enabled = false;
            add('statictext', undefined, 'Group nesting:');
            var __groupNesting = add('edittext', [0, 0, 45, 25], '1000');
            __groupNesting.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 1, Infinity) });
        }
    }
    with (add('group')) {
        var cancel = add('button', undefined, 'Cancel');
            cancel.helpTip = 'Press Esc to Close';
            cancel.onClick = function () { win.close(); }
        
        var ok = add('button', undefined, 'Run');
            ok.helpTip = 'Press Enter to Run';
            ok.onClick = startAction;
            // ok.active = true;
    }
}
var progressBar = win.add('progressbar'),
    progressBarCounter = 100;
    progressBar.value = progressBar.minvalue = 0;
    progressBar.maxvalue = progressBarCounter;
    progressBar.maximumSize = [1000, 5];

function startAction() {
    $nesting = parseInt(__groupNesting.text) || 1000;
    globalGroup.enabled = false;
    try{
    minusOffset(selection[0], selection, 0);
    }catch(err){alert(err + '\n' + err.line);}
    win.close();
}

function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __offset.text,
            __miterlimit.text,
            __joins.selection.index,
            __inGroups.value,
            __groupNesting.text
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
            __offset.text = $main[0];
            __miterlimit.text = $main[1];
            __joins.selection.index = parseInt($main[2]);
            __inGroups.value = ($main[3] === 'true');
            __groupNesting.text = $main[4];

            nestingUIGroup.enabled = __inGroups.value;
        } catch (e) {}
        $file.close();
    }
}

win.onClose = function(){
    saveSettings();
}

loadSettings();
win.center();
win.show();