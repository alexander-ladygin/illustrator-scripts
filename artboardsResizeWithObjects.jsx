/* 

  Program version: Adobe Illustrator CS5+
  Name: artboardResizeWithObjects.js;

  Author: Alexander Ladygin, email: i@ladygin.pro
  Thanks for refactoring and testing - Sergey Osokin, email: hi@sergosokin.ru

  Copyright (c) 2018
  www.ladygin.pro

*/

#target illustrator;

var lockedItems = [],
    hiddenItems = [];

function getDocUnit() {
    var unit = activeDocument.rulerUnits.toString().replace('RulerUnits.', '');
    switch (unit) {
        case 'Points' : ;
        case 'Pixels' : unit = 'px'; break;
        case 'Millimeters' : unit = 'mm'; break;
        case 'Centimeters' : unit = 'cm'; break;
        case 'Inches' : unit = 'in'; break;
    }

     return unit;
}

function convertUnits (value, newUnit) {
    var unit = ((typeof value === 'string' && 'pt,px,mm,cm,in'.indexOf(value.slice(-2)) > -1) ? value.slice(-2) : getDocUnit());

    if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'mm')) {
        value = parseFloat(value) / 2.83464566929134;
    }
        else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'cm')) {
            value = parseFloat(value) / (2.83464566929134 * 10);
        }
        else if (((unit === 'px') || (unit === 'pt')) && (newUnit === 'in')) {
            value = parseFloat(value) / 72;
        }
        else if ((unit === 'mm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
            value = parseFloat(value) * 2.83464566929134;
        }
        else if ((unit === 'mm') && (newUnit === 'cm')) {
            value = parseFloat(value) * 10;
        }
        else if ((unit === 'mm') && (newUnit === 'in')) {
            value = parseFloat(value) / 25.4;
        }
        else if ((unit === 'cm') && ((newUnit === 'px') || (newUnit === 'pt'))) {
            value = parseFloat(value) * 2.83464566929134 * 10;
        }
        else if ((unit === 'cm') && (newUnit === 'mm')) {
            value = parseFloat(value) / 10;
        }
        else if ((unit === 'cm') && (newUnit === 'in')) {
            value = parseFloat(value) * 2.54;
        }
        else if ((unit === 'in') && ((newUnit === 'px') || (newUnit === 'pt'))) {
            value = parseFloat(value) * 72;
        }
        else if ((unit === 'in') && (newUnit === 'mm')) {
            value = parseFloat(value) * 25.4;
        }
        else if ((unit === 'in') && (newUnit === 'cm')) {
            value = parseFloat(value) * 25.4;
        }

    return parseFloat(value);
}

function getArtboardValues (__index) {
    var art = activeDocument.artboards[((typeof __index === 'number' && __index > -1 && __index < activeDocument.artboards.length) ? __index : activeDocument.artboards.getActiveArtboardIndex())],
        rect = art.artboardRect;
    return {
        art: art,
        width: rect[2] - rect[0],
        height: -(rect[3] - rect[1])
    };
}

function saveItemsState() {
    for (var i = 0; i < activeDocument.pageItems.length; i++) {
        var currItem = activeDocument.pageItems[i];
        if (currItem.locked == true) {
            lockedItems.push(i);
            currItem.locked = false;
        }
        if (currItem.hidden == true) {
            hiddenItems.push(i);
            currItem.hidden = false;
        }
    }
}

function restoreItemsState() {
    for (var i = 0; i < lockedItems.length; i++) {
        var index = lockedItems[i];
        activeDocument.pageItems[index].locked = true;
    }
    for (var j = 0; j < hiddenItems.length; j++) {
        var index = hiddenItems[j];
        activeDocument.pageItems[index].hidden = true;
    }
}

function resizeArtboardWithObjects (__size, __mode, __artNum) {
    if (__size !== 0) {
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        var selectionBak = selection,
            __art = getArtboardValues(__artNum),
            art = getArtboardValues(__artNum).art,
            rect = art.artboardRect,
            artSize = {
                width: __art.width,
                height: __art.height,
            };

        selection = null;

        function getResizeValue (value) {
            var result = value;

            if (typeof value === 'number') {
                result = (convertUnits(value + getDocUnit(), 'px') / artSize[__mode]);
            }
                else if (typeof value === 'string' && value.length) {
                    if (value[value.length-1] === '%') {
                        result = parseFloat(value) / 100;
                    }
                }
                    else {
                        result = null;
                    }

            return result;
        }

        var resizeValue = getResizeValue(__size);

        if (resizeValue !== null) {
            activeDocument.selectObjectsOnActiveArtboard();

            var items = selection,
                i = j = selection.length;

            art.artboardRect = [
                rect[0], rect[1],
                rect[0] + artSize.width * resizeValue,
                rect[1] - artSize.height * resizeValue
            ];
            
            while (i--) {
                items[i].resize(resizeValue * 100, resizeValue * 100, true, true, true, true, resizeValue * 100, Transformation.TOPLEFT);
                items[i].top *= resizeValue;
                items[i].left *= resizeValue;
            }
        }

        selection = selectionBak;
    }
}

var win = new Window('dialog', 'Resize artboard with objects', undefined);
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

    panel = win.add('panel', undefined, 'Resize artboard:');
    panel.orientation = 'column';
    panel.alignChildren = ['fill', 'fill'];

    var winScale = panel.add('radiobutton', undefined, 'New scale factor'),
        winWidth = panel.add('radiobutton', undefined, 'New artboard width'),
        winHeight = panel.add('radiobutton', undefined, 'New artboard height');
    winWidth.value = true;

    var artGroup = win.add('panel');
    artGroup.orientation = 'column';
    artGroup.alignChildren = ['fill', 'fill'];

    var winArtActive = artGroup.add('radiobutton', undefined, 'Only active artboard'),
        winArtAll = artGroup.add('radiobutton', undefined, 'All artboards'),
        winArtCustom = artGroup.add('radiobutton', undefined, 'Custom artboards'),
        winArtNum = artGroup.add('edittext', undefined, activeDocument.artboards.getActiveArtboardIndex() + 1);
    winArtActive.value = true;
    winArtNum.enabled = false;

    var optGroup = win.add('panel');
    optGroup.orientation = 'column';
    optGroup.alignChildren = ['fill', 'fill'];

    var winAllItems = optGroup.add('checkbox', undefined, 'Include hidden & locked items');
    winAllItems.value = false;

    var editGroup = win.add('panel');
        editGroup.orientation = 'row';
        editGroup.alignChildren = ['fill', 'fill'];

    var winValue = editGroup.add('edittext', undefined, Math.round(convertUnits(getArtboardValues().width + 'px', getDocUnit()))),
        winUnit = editGroup.add('statictext', undefined, getDocUnit());
    winValue.minimumSize = [120, undefined];
    winValue.active = true;

    var winButtons = win.add('group');
    winButtons.alignChildren = 'center';
    winButtons.margins = [0, 0, 0, 0];

    var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }


// events
    winScale.onClick = function (e) { winUnit.text = '%'; };
    winWidth.onClick = winHeight.onClick = function (e) { winUnit.text = getDocUnit(); };

    winArtCustom.onClick = function (e) { winArtNum.enabled = true; };
    winArtActive.onClick = winArtAll.onClick = function (e) { winArtNum.enabled = false; };


function getCustomNumbers ($str, items, returnItems) {
    var __num = $str.replace(/ /g, '').replace(/[^-0-9^,]/gim,'').split(','),
        $maxItems = items.length,
        j = __num.length,
        arr = [];
    
    function getNumbersBetweenMinMax (min, max) {
        var numbers = [];
        for (var n = min; n <= max; n++) {
            if (n < $maxItems) {
                numbers.push(returnItems ? items[n] : n);
            }
        }
        return numbers;
    }
    
    while (j--) {
        if (__num[j].indexOf('-') > -1) {
            var values = __num[j].split('-'),
                min = parseInt(values[0]),
                max = parseInt(values[1]);
    
            if (!isNaN(min) && !isNaN(max)) arr = arr.concat(getNumbersBetweenMinMax(min - 1, max - 1));
        }
            else {
                var __val = parseInt(__num[j]);
                if (!isNaN(__val) && __val <= $maxItems) {
                    arr.push(returnItems ? items[__val - 1] : __val - 1);
                }
            }
    }
    
    return arr;
    }


function startAction() {
    var $size = (winScale.value ? parseInt(winValue.text) + '%' : parseInt(winValue.text)) || 0,
        $mode = (winHeight.value ? 'height' : 'width');

    if (winAllItems.value) {
        saveItemsState();
    }
    if (winArtActive.value) {
        resizeArtboardWithObjects($size, $mode);
    }
        else if (winArtAll.value) {
            var i = activeDocument.artboards.length;
            while (i--) {
                activeDocument.artboards.setActiveArtboardIndex(i);
                resizeArtboardWithObjects($size, $mode, i);
            }
        }
            else {
                var arr = getCustomNumbers(winArtNum.text, activeDocument.artboards),
                    i = arr.length;
                while (i--) {
                    activeDocument.artboards.setActiveArtboardIndex(arr[i]);
                    resizeArtboardWithObjects($size, $mode, arr[i]);
                }
            }
    if (winAllItems.value) {
        restoreItemsState();
    }

    win.close();
}

// open window
    win.center();
    win.show();