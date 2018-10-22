/* 

  Program version: Adobe Illustrator CS5+
  Name: randomus.js;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/
#include './libraries/AI_PS_Library.js';

var __attr = {
        width: 120,
        height: 25,
        panelMargins: [10, 20, 10, 20]
    },
    isUndo = true,
    undoCount = 0,
    win = new Window('dialog', 'Randomus \u00A9 www.ladygin.pro', undefined);
    win.orientation = 'column';
    win.alignChildren = 'fill';

function rvbn (min, max) {
    // random value between numbers 
    return min + Math.floor(Math.random() * (max - min));
}

function inputNumberEvents (ev, _input, min, max, callback){
    var step,
        _dir = ev.keyName.toLowerCase().slice(0,1),
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
            }
        }
}

var group1 = win.add('group'),
    group2 = win.add('group'),
    group3 = win.add('group');

    group1.orientation = group2.orientation = 'row';

var __fillStrokeColorPanel = group1.add('panel', undefined, 'Fill or Stroke color:'),
    __fillStrokeColorAll = __fillStrokeColorPanel.add('checkbox', [0, 0, __attr.width, __attr.height / 1.5], 'For all items'),
    __FillColor = __fillStrokeColorPanel.add('button', [0, 0, __attr.width, __attr.height], 'Fill Color'),
    __StrokeColor = __fillStrokeColorPanel.add('button', [0, 0, __attr.width, __attr.height], 'Stroke Color');
    __fillStrokeColorPanel.margins = __attr.panelMargins;

var __fillStrokeSwatchesPanel = group1.add('panel', undefined, 'Fill or Stroke swatches:'),
    __fillStrokeSwatchesAll = __fillStrokeSwatchesPanel.add('checkbox', [0, 0, __attr.width, __attr.height / 1.5], 'For all items'),
    __FillSwatches = __fillStrokeSwatchesPanel.add('button', [0, 0, __attr.width, __attr.height], 'Fill Swatches'),
    __StrokeSwatches = __fillStrokeSwatchesPanel.add('button', [0, 0, __attr.width, __attr.height], 'Stroke Swatches');
    __fillStrokeSwatchesPanel.margins = __attr.panelMargins;

var __ScaleGroup = group2.add('panel', undefined, 'Scale:'),
    __RotateGroup = group2.add('panel', undefined, 'Rotate:');
    __ScaleGroup.orientation = __RotateGroup.orientation = 'column';
    __ScaleGroup.margins = __RotateGroup.margins = __attr.panelMargins;

var __ScaleMinMaxGroup = __ScaleGroup.add('group');
    __ScaleMinMaxGroup.orientation = 'row';

var __ScaleMin = __ScaleMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '50'),
    __ScaleMax = __ScaleMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '150'),
    __ScaleEach = __ScaleGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height / 1.5], 'Each items'),
    __Scale = __ScaleGroup.add('button', [0, 0, __attr.width, __attr.height], 'Scale');

    __ScaleMin.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0); });
    __ScaleMax.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0); });

var __RotateMinMaxGroup = __RotateGroup.add('group');
    __RotateMinMaxGroup.orientation = 'row';

var __RotateMin = __RotateMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '0'),
    __RotateMax = __RotateMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '360'),
    __RotateEach = __RotateGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height / 1.5], 'Each items'),
    __Rotate = __RotateGroup.add('button', [0, 0, __attr.width, __attr.height], 'Rotate');

    function checkRotateValues (val, item, min, max) {
        if (item === __RotateMin) {
            if (val >= parseFloat(__RotateMax.text)) { __RotateMax.text = ((val + 1) >= max ? max + 1 : val + 1); }
        }
            else if (item === __RotateMax) {
                if (val <= parseFloat(__RotateMin.text)) { __RotateMin.text = ((val - 1) < min ? min - 1 : val - 1); }
            }

    }
    __RotateMin.addEventListener('keydown', function (e) { inputNumberEvents(e, __RotateMin, 0, 359, checkRotateValues); });
    __RotateMax.addEventListener('keydown', function (e) { inputNumberEvents(e, __RotateMax, 1, 360, checkRotateValues); });


var __OpacityGroup = group3.add('panel', undefined, 'Opacity:'),
    __PositionGroup = group3.add('panel', undefined, 'Position:');
    __OpacityGroup.orientation = __PositionGroup.orientation = 'column';
    __OpacityGroup.margins = __PositionGroup.margins = __attr.panelMargins;

var __OpacityMinMaxGroup = __OpacityGroup.add('group');
    __OpacityMinMaxGroup.orientation = 'row';

var __OpacityMin = __OpacityMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '0'),
    __OpacityMax = __OpacityMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '100'),
    __OpacityEach = __OpacityGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height / 1.5], 'Each items'),
    __Opacity = __OpacityGroup.add('button', [0, 0, __attr.width, __attr.height], 'Opacity');

    function checkOpacityValues (val, item, min, max) {
        if (item === __OpacityMin) {
            if (val >= parseFloat(__OpacityMax.text)) { __OpacityMax.text = ((val + 1) >= max ? max + 1 : val + 1); }
        }
            else if (item === __OpacityMax) {
                if (val <= parseFloat(__OpacityMin.text)) { __OpacityMin.text = ((val - 1) < min ? min - 1 : val - 1); }
            }

    }
    __OpacityMin.addEventListener('keydown', function (e) { inputNumberEvents(e, __OpacityMin, 0, 359, checkOpacityValues); });
    __OpacityMax.addEventListener('keydown', function (e) { inputNumberEvents(e, __OpacityMax, 1, 360, checkOpacityValues); });

var __PositionMinMaxGroup = __PositionGroup.add('group');
    __PositionMinMaxGroup.orientation = 'row';

var __PositionEach = __PositionGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height / 1.5], 'Each items'),
    __PositionXvalue = __PositionMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '10 px'),
    __PositionYvalue = __PositionMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '10 px');

    function addUnitsPos (val, item, min, max, units) {
        item.text = item.text + ' ' + units;
    }
    __PositionXvalue.addEventListener('keydown', function (e) { inputNumberEvents(e, __PositionXvalue, 0, Infinity, addUnitsPos); });
    __PositionYvalue.addEventListener('keydown', function (e) { inputNumberEvents(e, __PositionYvalue, 0, Infinity, addUnitsPos); });

var __PositionXYGroup = __PositionGroup.add('group');
    __PositionXYGroup.orientation = 'row';

var __PositionX = __PositionXYGroup.add('button', [0, 0, __attr.width / 2.03, __attr.height], 'X');
    __PositionY = __PositionXYGroup.add('button', [0, 0, __attr.width / 2.03, __attr.height], 'Y');


function __action (callback) {
    undoCount += 1;
    callback();
    app.redraw();
}

function getChildren() {
    var __arr = [], i = selection.length;
    while (i--) {
        if (selection[i].typename === 'GroupItem') __arr = __arr.concat(selection[i].children());
            else __arr.push(selection[i]);
    }
    return __arr;
}


    __FillColor.onClick = function() {
        __action(function() {
            selection.fill((!__fillStrokeColorAll.value ? 'random' : $.color($.getColorMode('shortname'), 'random')));
        });
    };
    __FillSwatches.onClick = function() {
        __action(function() {
            if (!__fillStrokeSwatchesAll.value) selection.fill('swatches');
                else {
                    var __swatches = activeDocument.swatches.getSelected(),
                        __swatchesLength = __swatches.length;
        
                    if (__swatchesLength < 2) {
                        __swatches = activeDocument.swatches;
                        __swatchesLength = __swatches.length;
                    }

                    selection.fill(__swatches[Math.floor(Math.random() * __swatchesLength)].color);
                }
        });
    };
    __StrokeColor.onClick = function() {
        __action(function() {
            selection.strokecolor((!__fillStrokeColorAll.value ? 'random' : $.color($.getColorMode('shortname'), 'random')));
        });
    };
    __StrokeSwatches.onClick = function() {
        __action(function() {
            if (!__fillStrokeSwatchesAll.value) selection.strokecolor('swatches');
                else {
                    var __swatches = activeDocument.swatches.getSelected(),
                        __swatchesLength = __swatches.length;
        
                    if (__swatchesLength < 2) {
                        __swatches = activeDocument.swatches;
                        __swatchesLength = __swatches.length;
                    }

                    selection.strokecolor(__swatches[Math.floor(Math.random() * __swatchesLength)].color);
                }
        });
    };
    __Scale.onClick = function() {
        var __value = [parseFloat(__ScaleMin.text), parseFloat(__ScaleMax.text)];
        __action(function() {
            if (__ScaleEach.value) getChildren().scale('random', __value);
                else selection.scale('random', __value);
        });
    };
    __Rotate.onClick = function() {
        var __value = [parseFloat(__RotateMin.text), parseFloat(__RotateMax.text)];
        __action(function() {
            if (__RotateEach.value) getChildren().rotation('random', __value);
                else selection.rotation('random', __value);
        });
    };
    __Opacity.onClick = function() {
        var __value = [parseFloat(__OpacityMin.text), parseFloat(__OpacityMax.text)];
        __action(function() {
            if (__OpacityEach.value) getChildren().Opacity('random', __value);
                else selection.Opacity('random', __value);
        });
    };
    __PositionX.onClick = function() {
        __action(function() {
            if (__PositionEach.value) getChildren().left(__PositionXvalue.text, 'random');
                else selection.left(__PositionXvalue.text, 'random');
        });
    };
    __PositionY.onClick = function() {
        __action(function() {
            if (__PositionEach.value) getChildren().top(__PositionYvalue.text, 'random');
                else selection.top(__PositionYvalue.text, 'random');
        });
    };

var winButtons = win.add('group');
    winButtons.orientation = 'row';
    winButtons.alignChildren = ['fill', 'fill'];
    winButtons.margins = 0;

var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

var reset = winButtons.add('button', undefined, 'Reset');
    reset.helpTip = 'Reset script result';
    reset.onClick = function () { __resetAction(); }

var ok = winButtons.add('button', undefined, 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = function (e) {
        isUndo = false;
        win.close();
    };
    ok.active = true;


function __resetAction() {
    if (isUndo && undoCount) {
        while (undoCount--) app.undo();
        app.redraw();
        undoCount = 0;
    }
}

win.onClose = function() {
    __resetAction();
}

if (selection.length) {
    win.center();
    win.show();
}
    else {
        alert('Please select object!');
    }