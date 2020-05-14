/* 

  Program version: Adobe Illustrator CS5+
  Name: randomus.js;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/

var scriptName = 'Randomus',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    };

var __attr = {
        width: 120,
        height: 25,
        panelMargins: [10, 20, 10, 20]
    },
    isCompound = false,
    isUndo = true,
    undoCount = 0,
    swatchDisabled = false,
    $selection = selection,
    win = new Window('dialog', scriptName + ' \u00A9 www.ladygin.pro', undefined);
    win.orientation = 'column';
    win.alignChildren = 'fill',
    undoOriginal = {
        scale: 0,
        rotate: 0,
        opacity: 0,
        position: 0,
    };

function compoundFixAction ($items) {
    function __ungroup (__items) {
        var l = __items.length;
        for (var i = 0; i < l; i++) {
            if (__items[i].typename === 'GroupItem') {
                var j = __items[i].pageItems.length;
                while (j--) { __items[i].pageItems[0].moveBefore(__items[i]); }
                __items[i].remove();
            }
        }
    }

    function compoundFix (item) {
        selection = [item];
        app.executeMenuCommand('noCompoundPath');
        __ungroup(selection);
        app.executeMenuCommand('compoundPath');
        selection = null;
    }

    function compoundPathItemsNormalize (items) {
        var i = items.length;
        while (i--) {
            if (items[i].typename === 'GroupItem') {
                compoundPathItemsNormalize(items[i].pageItems);
            }
                else if (items[i].typename === 'CompoundPathItem') {
                    compoundFix(items[i]);
                }
        }
    }
    compoundPathItemsNormalize($items);
    selection = $selection;
}

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
    __ScaleOriginal = __ScaleGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height], 'Use original'),
    __Scale = __ScaleGroup.add('button', [0, 0, __attr.width, __attr.height], 'Scale');

    __ScaleMin.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0); });
    __ScaleMax.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 0); });

var __RotateMinMaxGroup = __RotateGroup.add('group');
    __RotateMinMaxGroup.orientation = 'row';

var __RotateMin = __RotateMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '0'),
    __RotateMax = __RotateMinMaxGroup.add('edittext', [0, 0, __attr.width / 2.03, __attr.height], '360'),
    __RotateEach = __RotateGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height / 1.5], 'Each items'),
    __RotateOriginal = __RotateGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height], 'Use original'),
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
    __OpacityOriginal = __OpacityGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height], 'Use original'),
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
    __PositionOriginal = __PositionGroup.add('checkbox', [0, 0, __attr.width / 1.2, __attr.height], 'Use original'),
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


var __activeSwatches = activeDocument.swatches.getSelected();

function __action (callback) {
    undoCount += 1;
    reset.enabled = true;
    undoButton.enabled = true;
    callback();
    app.redraw();
}

function undoUseOriginal (value, prop) {
    if (undoCount && value && undoOriginal[prop]) {
        app.undo();
        undoCount--;
        undoOriginal[prop]--;
        reset.enabled = !!undoCount;
        undoButton.enabled = !!undoCount;
    } else if (value && !undoOriginal[prop]) {
        undoOriginal[prop]++;
    }
}

function getChildren() {
    var __arr = [], i = $selection.length;
    while (i--) {
        if ($selection[i].typename === 'GroupItem') __arr = __arr.concat($selection[i].children());
            else __arr.push($selection[i]);
    }
    return __arr;
}


    __FillColor.onClick = function() {
        __action(function() {
            $selection.fill((!__fillStrokeColorAll.value ? 'random' : $.color($.getColorMode('shortname'), 'random')));
            __FillSwatches.enabled = true;
        });
    };
    __FillSwatches.onClick = function() {
        __action(function() {
            var activeSws = activeDocument.swatches.getSelected();
            __activeSwatches = (activeSws.length ? activeSws : (__activeSwatches.length ? __activeSwatches : []));

            if (!__fillStrokeSwatchesAll.value) {
                $selection.fill('swatches', undefined, __activeSwatches);
            }
                else {
                    var __swatchesLength = __activeSwatches.length;
        
                    if (__swatchesLength < 2) {
                        __swatches = activeDocument.swatches;
                        __swatchesLength = __swatches.length;
                        __FillSwatches.enabled = false;
                    }

                    $selection.fill(__swatches[Math.floor(Math.random() * __swatchesLength)].color);
                }
        });
    };
    __StrokeColor.onClick = function() {
        __action(function() {
            $selection.strokecolor((!__fillStrokeColorAll.value ? 'random' : $.color($.getColorMode('shortname'), 'random')));
            __StrokeSwatches.enabled = true;
        });
    };
    __StrokeSwatches.onClick = function() {
        __action(function() {
            var activeSws = activeDocument.swatches.getSelected();
            __activeSwatches = (activeSws.length ? activeSws : (__activeSwatches.length ? __activeSwatches : []));

            if (!__fillStrokeSwatchesAll.value) $selection.strokecolor('swatches');
                else {
                    var __swatchesLength = __activeSwatches.length;
        
                    if (__swatchesLength < 2) {
                        __swatches = activeDocument.swatches;
                        __swatchesLength = __swatches.length;
                        __StrokeSwatches.enabled = false;
                    }

                    $selection.strokecolor(__swatches[Math.floor(Math.random() * __swatchesLength)].color);
                }
        });
    };
    __Scale.onClick = function() {
        undoUseOriginal(__ScaleOriginal.value, 'scale');
        var __value = [parseFloat(__ScaleMin.text), parseFloat(__ScaleMax.text)];
        __action(function() {
            if (__ScaleEach.value) getChildren().scale('random', __value);
                else $selection.scale('random', __value);
        });
    };
    __Rotate.onClick = function() {
        undoUseOriginal(__RotateOriginal.value, 'rotate');
        var __value = [parseFloat(__RotateMin.text), parseFloat(__RotateMax.text)];
        __action(function() {
            if (__RotateEach.value) getChildren().rotation('random', __value);
                else $selection.rotation('random', __value);
        });
    };
    __Opacity.onClick = function() {
        undoUseOriginal(__OpacityOriginal.value, 'opacity');
        var __value = [parseFloat(__OpacityMin.text), parseFloat(__OpacityMax.text)];
        __action(function() {
            if (__OpacityEach.value) getChildren().Opacity('random', __value);
                else $selection.Opacity('random', __value);
        });
    };
    __PositionX.onClick = function() {
        undoUseOriginal(__PositionOriginal.value, 'position');
        __action(function() {
            if (__PositionEach.value) getChildren().left(__PositionXvalue.text, 'random');
                else $selection.left(__PositionXvalue.text, 'random');
        });
    };
    __PositionY.onClick = function() {
        undoUseOriginal(__PositionOriginal.value, 'position');
        __action(function() {
            if (__PositionEach.value) getChildren().top(__PositionYvalue.text, 'random');
                else $selection.top(__PositionYvalue.text, 'random');
        });
    };

function checkCompound (items) {
    var i = item.length;
    while (i-- > -1) {
        if (item[i].typename === 'CompoundPathItem') {
            isCompound = true;
            return isCompound;
        } else if (item[i].typename === 'GroupItem') {
            checkCompound(item[i].pageItems);
        }
    }
    return isCompound;
}

var buttonSize = [0, 0, 150, 30],
    winButtons = win.add('group');
    winButtons.orientation = 'row';
    winButtons.alignChildren = 'center';
    winButtons.margins = 0;

var winButtons2 = win.add('group');
    winButtons2.orientation = 'row';
    winButtons2.alignChildren = 'center';
    winButtons2.margins = 0;

var fixCompoundButton = winButtons.add('button', [0, 0, 150, 30], 'Fix compounds');
    fixCompoundButton.helpTip = 'Normalize compound path items, remove groups - only path items';
    fixCompoundButton.enabled = isCompound;
    fixCompoundButton.onClick = function () {
        compoundFixAction($selection);
        fixCompoundButton.enabled = false;
        app.redraw();
    };

var undoButton = winButtons.add('button', [0, 0, 65, 30], 'Undo');
    undoButton.helpTip = 'Undo';
    undoButton.enabled = false;
    undoButton.onClick = function () { __undoAction(); }

var reset = winButtons.add('button', [0, 0, 75, 30], 'Reset');
    reset.helpTip = 'Reset script result';
    reset.enabled = false;
    reset.onClick = function () { __resetAction(); }

var cancel = winButtons2.add('button', buttonSize, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

var ok = winButtons2.add('button', buttonSize, 'OK');
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
        reset.enabled = !!undoCount;
        undoButton.enabled = !!undoCount;
    }
}

function __undoAction() {
    if (isUndo && undoCount) {
        app.undo();
        undoCount--;
        app.redraw();
        reset.enabled = !!undoCount;
        undoButton.enabled = !!undoCount;
    }
}

win.onClose = function() {
    __resetAction();
    saveSettings();
    return true;
}

function LA(obj, callback, reverse) {if (!callback) {if (obj instanceof Array) {return obj;}else {var arr = $.getArr(obj);if (arr === obj) {if ($.isColor(obj)) {return obj;}else {return [obj];}}return arr;}}else if (callback instanceof Function) {var arr = $.getArr(obj);if (arr === obj) {arr = [obj];}if (reverse) {var i = arr.length;while (i--) callback(arr[i], i, arr);}else {for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);}return arr;}}$.errorMessage = function (err) {alert(err + '\n' + err.line);};$.appName = {indesign: (BridgeTalk.appName.toLowerCase() === 'indesign'),photoshop: (BridgeTalk.appName.toLowerCase() === 'photoshop'),illustrator: (BridgeTalk.appName.toLowerCase() === 'illustrator')};$.color = function (a, v) {if (a) {if (typeof a === 'string') {a = a.toLocaleLowerCase();}}else {return undefined;}if ((a === 'hex') && $.appName.illustrator) {if (!v) {return new RGBColor();}else {if (v === 'random') return $.color('rgb', v);else return $.hexToColor(v, 'RGB');}}else if ((a === 'cmyk') || (a === 'cmykcolor')) {var c = new CMYKColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}c.cyan = parseInt(b[0]);c.magenta = parseInt(b[1]);c.yellow = parseInt(b[2]);c.black = parseInt(b[3]);}return c;}else if ((a === 'rgb') || (a === 'rgbcolor') || ((a === 'hex') && $.appName.photoshop)) {var c = new RGBColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}if ($.appName.photoshop) {if (a !== 'hex' || (typeof v === 'string' && v.toLocaleLowerCase() === 'random')) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}else {c.hexValue = b[0];}}else if ($.appName.illustrator) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}}return c;}else if ((a === 'gray') || (a === 'grayscale') || (a === 'grayscale') || (a === 'graycolor')) {var c = new GrayColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = Math.floor(Math.random() * 100);}c.gray = parseInt(b[0] || b);}return c;}else if ((a === 'lab') || (a === 'labcolor')) {var c = new LabColor(), value, b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(-128 + Math.random() * 256), Math.floor(-128 + Math.random() * 256)];}else {for (var i = 0; i < b.length; i++) {if (i === 0) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}else {if (b[i] === 'random') {b[i] = Math.floor(-128 + Math.random() * 256);}}}}c.l = parseInt(b[0]);c.a = parseInt(b[1]);c.b = parseInt(b[2]);}return c;}else if ((a === 'spot') || (a === 'spotcolor')) {var c = new SpotColor(), b = [];if (v) {b = b.concat(v);c.tint = parseInt(b[1]);}return c;}else if ((a === 'gradient') || (a === 'Gradient') || (a === 'GradientColor')) {var c = app.activeDocument.gradients.add(), g = new GradientColor(), b = [];if (v) {b = b.concat(v);for (var i = 0; i < b.length; i++) {c.gradientStops[i].color = $.color(b[i][0], b[i][1]);}g.gradient = c;}return g;}else if ((a === 'no') || (a === 'nocolor')) {return new NoColor();}};$.convertColor = function (color, type) {type = type.toLocaleLowerCase();if (color.typename === 'RGBColor') {if (type.slice(0, 3) === 'rgb') {return color;}else if (type.slice(0, 4) === 'cmyk') {return $.color('cmyk', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 3) === 'lab') {return $.color('lab', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'gray') {return $.color('gray', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));}else if (type.toLocaleLowerCase() === 'hex') {return $.toHex(color);}}else if (color.typename === 'CMYKColor') {if (type.slice(0, 3) === 'rgb') {return $.color('rgb', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'cmyk') {return color;}else if (type.slice(0, 3) === 'lab') {return $.color('lab', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'gray') {return $.color('gray', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));}else if (type.toLocaleLowerCase() === 'hex') {return $.toHex(color);}}else if (color.typename === 'LabColor') {if (type.slice(0, 3) === 'rgb') {return $.color('rgb', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'cmyk') {return $.color('cmyk', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 3) === 'lab') {return color;}else if (type.slice(0, 4) === 'gray') {return $.color('gray', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));}else if (type.toLocaleLowerCase() === 'hex') {return $.toHex(color);}}else if (color.typename === 'GrayColor') {if (type.slice(0, 3) === 'rgb') {return $.color('rgb', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'cmyk') {return $.color('cmyk', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 3) === 'lab') {return $.color('lab', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));}else if (type.slice(0, 4) === 'gray') {return color;}else if (type.toLocaleLowerCase() === 'hex') {return $.toHex(color);}}else if (color.typename === 'SpotColor') {return $.convertColor(color.spot.color, type);}else if (type.toLocaleLowerCase() === 'hex') {return $.toHex(color);}else if (!color.typename && typeof color === 'string') {return $.hexToColor(color, type);}};$.toHex = function (color, hash) {if (color.typename !== 'RGBColor' && $.appName.illustrator) {color = $.convertColor(color, 'RGB');}return (hash ? '#' : '') + to(color.red) + to(color.green) + to(color.blue);function to(val) {var hex = val.toString(16);return hex.length === 1 ? '0' + hex : hex;}};$.hexToColor = function (color, type) {color = color.toLocaleLowerCase();color = correct(color);function correct(a) {var l, b = '000000';if (a[0] === '#') {a = a.slice(1);}l = a.length;a = a + b.slice(l);return a;}return $.convertColor($.color('rgb', [parseInt((gc(color)).slice(0, 2), 16), parseInt((gc(color)).slice(2, 4), 16), parseInt((gc(color)).slice(4, 6), 16)]), type || 'rgb');function gc(h) {return (h.slice(0, 1) === '#') ? h.slice(1, 7) : h;}};$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};$.getColorValues = function (color) {if (color === undefined) {return undefined;}else if (color.typename === 'CMYKColor') {return [color.cyan, color.magenta, color.yellow, color.black];}else if (color.typename === 'RGBColor') {return [color.red, color.green, color.blue];}else if (color.typename === 'LabColor') {return [color.l, color.a, color.b];}else if (color.typename === 'SpotColor') {return [color.spotl, color.tint];}else if (color.typename === 'GrayColor') {return [color.gray];}else if (color.typename === 'NoColor') {return undefined;}else if (color.typename === 'GradientColor') {var colors = [], gradients = color.gradient.gradientStops;for (var i = 0; i < gradients.length; i++) {colors = colors.concat(gradients[i].color.getColorValues());}return colors;}};CMYKColor.prototype.getColorValues = function () {return $.getColorValues(this);};RGBColor.prototype.getColorValues = function () {return $.getColorValues(this);};GrayColor.prototype.getColorValues = function () {return $.getColorValues(this);};LabColor.prototype.getColorValues = function () {return $.getColorValues(this);};NoColor.prototype.getColorValues = function () {return $.getColorValues(this);};$.isArr = function (a) {if ((!a)|| (typeof a === 'string')|| (a.typename === 'Document')|| (a.typename === 'Layer')|| (a.typename === 'PathItem')|| (a.typename === 'GroupItem')|| (a.typename === 'PageItem')|| (a.typename === 'CompoundPathItem')|| (a.typename === 'TextFrame')|| (a.typename === 'TextRange')|| (a.typename === 'GraphItem')|| (a.typename === 'Document')|| (a.typename === 'Artboard')|| (a.typename === 'LegacyTextItem')|| (a.typename === 'NoNNativeItem')|| (a.typename === 'Pattern')|| (a.typename === 'PlacedItem')|| (a.typename === 'PluginItem')|| (a.typename === 'RasterItem')|| (a.typename === 'MeshItem')|| (a.typename === 'SymbolItem')) {return false;}else if (!a.typename && !(a instanceof Array)) {return false;}else {return true;}};$.getArr = function (obj, attr, value, exclude) {var arr = [];function checkExclude (item) {if (exclude !== undefined) {var j = exclude.length;while (j--) if (exclude[j] === item) return true;}return false;}if ($.isArr(obj)) {for (var i = 0; i < obj.length; i++) {if (!checkExclude(obj[i])) {if (attr) {if (value !== undefined) {arr.push(obj[i][attr][value]);}else {arr.push(obj[i][attr]);}}else {arr.push(obj[i]);}}}return arr;}else if (attr) {return obj[attr];}else {return obj;}};$.getUnits = function (val, def) {try {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if ($.appName.illustrator) {if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);}else if ($.appName.photoshop) {return parseFloat(obj);}};$.getColorMode = function (shortname) { return activeDocument.colorMode(shortname); };Object.prototype.colorMode = function (type) {var backup = {doc: app.activeDocument};function set(doc) {doc.activate();if (typeof type === 'string') {type = type.toLocaleLowerCase();if ((type === 'cmyk') || (type === 'rgb')) {try {$.command('doc-color-' + type);}catch (e) {$.errorMessage('Error "Document color type" message: ' + e);}}}}var obj = LA(this),names = [];for (var i = 0; i < obj.length; i++) {if (type === 'shortname') {var mode = obj[i].documentColorSpace.toString();if (type === 'shortname') mode = mode.replace('DocumentColorSpace.', '');names.push(mode);}else {set(obj[i]);}}if (type || type === 'shortname') {if (names.length === 1) return names[0];return names;}backup.doc.activate();return this;};String.prototype.getUnits = function () {try {var str = this.slice(-2),u = ['px', 'pt', 'mm', 'cm', 'in', 'pc'];for (var i = 0; i < u.length; i++) {if (str === u[i]) {return u[i];}}return false;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};Object.prototype.removeItemsWithArray = function (items) {var obj = [], items = LA(items);for (var i = 0; i < this.length; i++) {if (!check(this[i])) {obj.push(this[i]);}}function check(e) {for (var j = 0; j < items.length; j++) {if (e === items[j]) {return true;}}return false;}return obj;};Object.prototype.getAllParents = function () {function get(obj) {var arr = [];if (obj.parent.typename !== 'Application') {for (var i = 0; ; i++) {arr.push(obj.parent);if (obj.parent.parent.typename === 'Application') {return arr;}else {obj = obj.parent;}if (i === 1000) {break;}}}else {return obj;}}var obj = LA(this), _arr = [];for (var i = 0; i < obj.length; i++) {_arr = _arr.concat(get(obj[i]));}return _arr;};Object.prototype.subLayers = function (level) {var arr = [], count = 0;if (level !== undefined) {level = level - 1;}function subLayers(layer) {var obj = [], sub = layer.layers;for (var j = 0; j < sub.length; j++) {obj = obj.concat(sub[j]);if ((level === undefined) || (sub[j].layers.length > 0 && count < level)) {obj = obj.concat(subLayers(sub[j], count++));count--;}}return obj;}var obj = LA(this);for (var j = 0; j < obj.length; j++) {arr = arr.concat(subLayers(obj[j]));}return arr;};Object.prototype.emptySubLayers = function (level) {var arr = [], obj = LA(this);function process(sub) {var sub_arr = [];sub = sub.subLayers(level).reverse();for (var i = 0; i < sub.length; i++) {if (sub[i].pageItems.length > 0) {var parents = sub[i].pageItems[0].getAllParents();parents.pop();sub_arr = sub_arr.concat(parents);}}return sub.removeItemsWithArray(sub_arr).reverse();}for (var i = 0; i < obj.length; i++) {arr = arr.concat(process(obj[i]));}return arr;};Object.prototype.children = function (type, level) {var arr = [], obj = this, count = 0;function get(i, n) {var c;if (i.typename !== 'CompoundPathItem') {c = i.pageItems;}else {c = LA(i.pathItems);}if (!c || !c.length) {return undefined;}for (var j = 0; j < c.length; j++) {if (n === undefined) {arr = arr.concat(c[j]);}else if (c[j].typename === n) {arr = arr.concat(c[j]);}if ((level === undefined) || (count < level)) {if (c[j].typename === 'GroupItem') {get(c[j], n, count++);count--;}else if (n === 'PathItem' && c[j].typename === 'CompoundPathItem') {var items = LA(c[j].pathItems);if (items.length !== 0) {arr = arr.concat(items);}}}}}function process(e, t) {if (!$.isArr(t)) {for (var i = 0; i < e.length; i++) {get(e[i], t);}}else {for (var i = 0; i < e.length; i++) {for (var j = 0; j < t.length; j++) {get(e[i], t[j]);}}}return arr;}obj = LA(this);if (typeof type !== 'object' && !isNaN(parseInt(type))) {level = parseInt(type);type = undefined;}if ((this.typename === 'Layers') || (this.typename === 'Layer')) {obj = obj.concat(this.subLayers(level).removeItemsWithArray(this.emptySubLayers(level)));}return process(obj, type);};Object.prototype.scale = function (w, h, t_obj, t_fillpatt, t_fillgrad, t_strokepatt) {scale = [w || 100, h || w];t_obj = (typeof t_obj === 'boolean' ? t_obj : true);t_fillpatt = (typeof t_fillpatt === 'boolean' ? t_fillpatt : true);t_fillgrad = (typeof t_fillgrad === 'boolean' ? t_fillgrad : true);t_strokepatt = (typeof t_strokepatt === 'boolean' ? t_strokepatt : true);function toScale(item, size) {var random_value = 10 + Math.floor(Math.random() * 170);if ((size[0] === 'random') && (size[1] instanceof Array)) {var _value = size[1][0] + Math.floor(Math.random() * (size[1][1] - size[1][0]));size = [_value, _value];}else if ((size[0] === 'random') && (size[2] !== 'random')) {size = [random_value, random_value];}else if ((size[0] === 'random') && (size[2] === 'random')) {size = [10 + Math.floor(Math.random() * 170), 10 + Math.floor(Math.random() * 170)];}item.resize(size[0], size[1] || size[0], t_obj, t_fillpatt, t_fillgrad, t_strokepatt);}var obj = LA(this);for (var i = 0; i < obj.length; i++) {toScale(obj[i], scale);}return this;};Object.prototype.rotation = function (degMin, degMax, t_obj, t_fillpatt, t_fillgrad, t_strokepatt) {__value = degMin;if ((degMin !== 'random') && (degMax === undefined)) __value = [degMin];else if (((degMin === 'random') && (degMax instanceof Array)) || ((typeof degMin === 'number') && (typeof degMax === 'number'))) __value = [degMin, degMax];t_obj = (typeof t_obj === 'boolean' ? t_obj : true);t_fillpatt = (typeof t_fillpatt === 'boolean' ? t_fillpatt : true);t_fillgrad = (typeof t_fillgrad === 'boolean' ? t_fillgrad : true);t_strokepatt = (typeof t_strokepatt === 'boolean' ? t_strokepatt : true);function toRotate(item, _val) {var $value = [],random_value = Math.floor(Math.random() * 360);if (_val.length === 1 && typeof _val[0] === 'number') {$value = [_val[0]];}if ((_val[0] === 'random') && (_val[1] instanceof Array)) {var $value = _val[1][0] + Math.floor(Math.random() * (_val[1][1] - _val[1][0]));$value = [$value];}else if ((typeof _val[0] === 'number') && (typeof _val[1] === 'number')) {var $value = _val[0] + Math.floor(Math.random() * (_val[1] - _val[0]));$value = [$value];}else if (_val[0] === 'random') {$value = [random_value];}item.rotate($value[0], t_obj, t_fillpatt, t_fillgrad, t_strokepatt);}var obj = LA(this);for (var i = 0; i < obj.length; i++) {toRotate(obj[i], __value);}return this;};Object.prototype.fill = function (type, values, sws) {var obj = LA(this),swatches = sws || activeDocument.swatches.getSelected(),swatchesLength = swatches.length;if (!swatchesLength) {swatches = activeDocument.swatches;swatchesLength = swatches.length;}for (var i = 0; i < obj.length; i++) {if ((obj[i].typename === 'GroupItem') || (obj[i].typename === 'CompoundPathItem')) {obj[i].children().fill(type, values);}else {if (obj[i].fillColor && !obj[i].clipping && !obj[i].guides) {if (type === 'random') {obj[i].fillColor = $.color($.getColorMode('shortname'), 'random');}else if ((type === 'darken') || (type === 'lighten')) {obj[i].fillColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].fillColor, values);}else if (type === 'swatches') {obj[i].fillColor = swatches[Math.floor(Math.random() * swatchesLength)].color;}else if ($.isColor(type)) {if (obj[i].fillColor) obj[i].fillColor = type;}else {type === false ? obj[i].filled = false : obj[i].fillColor = $.color(type, values);}}else if (obj[i].textRange) {if (type === 'random') {obj[i].textRange.characterAttributes.fillColor = $.color($.getColorMode('shortname'), 'random');}else if ((type === 'darken') || (type === 'lighten')) {obj[i].fillColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].fillColor, values);}else if (type === 'swatches') {var __clr = swatches[Math.floor(Math.random() * swatchesLength)].color;if (__clr.typename !== 'GradientColor' && __clr.typename !== 'NoColor') obj[i].textRange.characterAttributes.fillColor = __clr;else obj[i].fill('random');}else if ($.isColor(type)) {obj[i].textRange.characterAttributes.fillColor = type;}else {type === false ? obj[i].textRange.characterAttributes.filled = false : obj[i].textRange.characterAttributes.fillColor = $.color(type, values);}}}}return this;};Object.prototype.strokecolor = function (type, values) {var obj = LA(this),swatches = activeDocument.swatches.getSelected(),swatchesLength = swatches.length;if (!swatchesLength) {swatches = activeDocument.swatches;swatchesLength = swatches.length;}for (var i = 0; i < obj.length; i++) {if ((obj[i].typename === 'GroupItem') || (obj[i].typename === 'CompoundPathItem')) {obj[i].children().strokecolor(type, values);}else {if (obj[i].strokeColor && !obj[i].clipping && !obj[i].guides) {if (type === 'random') {obj[i].strokeColor = $.color($.getColorMode('shortname'), 'random');}else if ((type === 'darken') || (type === 'lighten')) {obj[i].strokeColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].strokeColor, values);}else if (type === 'swatches') {obj[i].strokeColor = swatches[Math.floor(Math.random() * swatchesLength)].color;}else if ($.isColor(type)) {if (obj[i].strokeColor) obj[i].strokeColor = type;}else {type === false ? obj[i].stroked = false : obj[i].strokeColor = $.color(type, values);}}else if (obj[i].textRange) {if (type === 'random') {obj[i].textRange.characterAttributes.strokeColor = $.color($.getColorMode('shortname'), 'random');}else if ((type === 'darken') || (type === 'lighten')) {obj[i].strokeColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].strokeColor, values);}else if (type === 'swatches') {var __clr = swatches[Math.floor(Math.random() * swatchesLength)].color;if (__clr.typename !== 'GradientColor' && __clr.typename !== 'NoColor') obj[i].strokeColor = __clr;else obj[i].strokecolor('random');}else if ($.isColor(type)) {obj[i].textRange.characterAttributes.strokeColor = type;}else {type === false ? obj[i].textRange.characterAttributes.stroked = false : obj[i].textRange.characterAttributes.strokeColor = $.color(type, values);}}}}return this;};Object.prototype.Opacity = function (value, __randomValues) {__randomValues = (__randomValues instanceof Array && __randomValues.length > 1 ? __randomValues : [5, 95]);function set(item, val) {val === 'random' ? val = Math.floor(__randomValues[0] + Math.random() * (__randomValues[1] - __randomValues[0])) : val = parseFloat(val) || item.opacity;arr.push(val);item.opacity = val;}var obj = LA(this), arr = [];for (var i = 0; i < obj.length; i++) {set(obj[i], value);}if (value === undefined) {if (arr.length === 1) {return arr[0];}else {return arr;}}else {return this;}};Object.prototype.top = function (e, t) {return LA(LA_Position(this, e, 'top', t));};Object.prototype.right = function (e, t) {return LA(LA_Position(this, e, 'right', t));};Object.prototype.bottom = function (e, t) {return LA(LA_Position(this, e, 'bottom', t));};Object.prototype.left = function (e, t) {return LA(LA_Position(this, e, 'left', t));};function LA_Position(el, _value, position, to) {var arr = [], toSize = false, count = 1, str = ['+', '-'];if (el === undefined) {return el;}if (!$.isArr(el)) {if (_value === undefined) {return get(el, _value);}else {get(el, _value);return el;}}else {if (_value === undefined) {for (var i = 0; i < el.length; i++) {arr = arr.concat(get(el[i]), _value);}return arr;}else {for (var i = 0; i < el.length; i++) {if (to === 'random') {get(el[i], Math.floor(Math.random() * $.convertUnits(_value, 'px')) + _value.getUnits() + str[Math.floor(Math.random() * str.length)]);count++;}else {get(el[i], _value);if (to === true) {count++;}}}return el;}}function get(i, val) {if (val === undefined) {return set(i, undefined, '=');}else if (typeof val === 'string') {val = val.replace(/ /g, '');if (!isNaN(parseInt(val))) {var Char = val[val.length - 1];if ((Char === '+') || (Char === '-')) {val = Char + val.slice(0, -1);toSize = true;}switch (val.slice(0, 1)) {case '-':set(i, $.convertUnits(val, 'px'), '-');break;case '+':set(i, $.convertUnits(val, 'px'), '+');break;case val.slice(0, 1):set(i, $.convertUnits(val, 'px'), '=');break;}}}else if (typeof val === 'number') {set(i, val, '=');}else {$.errorMessage('SyntaxError: Unexpected token "' + val + '"');return false;}}function set(item, value, events) {toSize === false ? size = [0, 0] : size = [item.width, item.height];switch (position) {case 'top':t(size[1]);return item.top;break;case 'right':value = value * - 1;r(size[0] * -1);return item.left + item.width;break;case 'bottom':value = value * - 1;b(size[1] * -1);return item.top + item.height;break;case 'left':l(size[0]);return item.left;break;}function t(h) {if (events === '=') {item.top = parseFloat(value) || parseFloat(item.top);}else {item.top = parseFloat(item.top) + parseFloat(value);}}function r(w) {if (events === '=') {item.left = parseFloat(value) || parseFloat(item.left);}else {item.left = parseFloat(item.left) + (parseFloat(value) + parseFloat(w));}}function b(h) {if (events === '=') {item.top = parseFloat(value) || parseFloat(item.top);}else {item.top = parseFloat(item.top) + (parseFloat(value) - parseFloat(h));}}function l(w) {if (events === '=') {item.left = parseFloat(value) || parseFloat(item.left);}else {item.left = parseFloat(item.left) + parseFloat(value);}}}}


function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            __fillStrokeColorAll.value,
            __fillStrokeSwatchesAll.value,
            __ScaleEach.value,
            __RotateEach.value,
            __OpacityEach.value,
            __PositionEach.value,
            __ScaleMin.text,
            __ScaleMax.text,
            __RotateMin.text,
            __RotateMax.text,
            __OpacityMin.text,
            __OpacityMax.text,
            __PositionXvalue.text,
            __PositionYvalue.text,
            __ScaleOriginal.value,
            __RotateOriginal.value,
            __OpacityOriginal.value,
            __PositionOriginal.value
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
            __fillStrokeColorAll.value = ($main[0] === 'true');
            __fillStrokeSwatchesAll.value = ($main[1] === 'true');
            __ScaleEach.value = ($main[2] === 'true');
            __RotateEach.value = ($main[3] === 'true');
            __OpacityEach.value = ($main[4] === 'true');
            __PositionEach.value = ($main[5] === 'true');
            __ScaleMin.text = $main[6];
            __ScaleMax.text = $main[7];
            __RotateMin.text = $main[8];
            __RotateMax.text = $main[9];
            __OpacityMin.text = $main[10];
            __OpacityMax.text = $main[11];
            __PositionXvalue.text = $main[12];
            __PositionYvalue.text = $main[13];
            __ScaleOriginal.value = $main[14];
            __RotateOriginal.value = $main[15];
            __OpacityOriginal.value = $main[16];
            __PositionOriginal.value = $main[17];
        } catch (e) {}
        $file.close();
    }
}

if (selection.length) {
    function checkSettingFolder() {
        var $folder = new Folder(settingFile.folder);
        if (!$folder.exists) $folder.create();
    }
    checkSettingFolder();
    loadSettings();
    win.center();
    win.show();
}
    else {
        alert('Please select object!');
    }