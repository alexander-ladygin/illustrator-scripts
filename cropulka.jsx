/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: cropulka.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var lockedItems = [],
    hiddenItems = [],
    __offset = 0.2,
    docResolution = '' + activeDocument.rasterEffectSettings.resolution;

function getCustomNumbers ($str, items, returnItems) {
    var __num = $str.replace(/ /g, '').replace(/[^-0-9^,]/gim,'').split(','),
        $maxItems = items.length,
        l = __num.length,
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

    for (var j = 0; j < l; j++) {
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

function saveLockedHiddenItems (items, childsName) {
    var li = [], hi = [],
        n = items.length;

    while (n--) {
        if (items[n][childsName] && items[n][childsName].length) {
            saveLockedHiddenItems(items[n][childsName], childsName);
        }
            else {
                if (items[n].locked) {
                    li.push(items[n]);
                    items[n].locked = false;
                }
                if (items[n].typename === 'Layer' && !items[n].visible) {
                    hi.push(items[n]);
                    items[n].visible = true;
                }
                    else if (items[n].typename !== 'Layer' && items[n].hidden) {
                        hi.push(items[n]);
                        items[n].hidden = false;
                    }
            }
    }

    lockedItems = lockedItems.concat(li);
    hiddenItems = hiddenItems.concat(hi);
}

function restoreLockedHiddenItems() {
    var i = lockedItems.length,
        j = hiddenItems.length;

    while (i--) lockedItems[i].locked = true;
    while (j--) {
        if (hiddenItems[j].typename === 'Layer') hiddenItems[j].visible = false;
            else hiddenItems[j].hidden = true;
    }
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

var win = new Window('dialog', 'Cropulka \u00A9 www.ladygin.pro', undefined);
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];
    
    var globalGroup = win.add('group');
    globalGroup.orientation = 'column';
    globalGroup.margins = 0;
    globalGroup.alignChildren = ['fill', 'fill'];

var panel = globalGroup.add('panel', undefined, 'Artboards');
    panel.orientation = 'column';
    panel.alignChildren = 'fill';
    panel.margins = 20;

var topItemCheckbox = { value: false };
// var topItemCheckbox = panel.add('checkbox', undefined, 'Top item in selection');
//     topItemCheckbox.onClick = function () {
//         groupRadio.enabled = !topItemCheckbox.value;
//         customArts.enabled = (!topItemCheckbox.value ? customArtboardsRadio.value : false);
//     }

var groupRadio = panel.add('group');
    groupRadio.orientation = 'row';

var activeArtboardRadio = groupRadio.add('radiobutton', undefined, 'Active'),
    allArtboardsRadio = groupRadio.add('radiobutton', undefined, 'All'),
    customArtboardsRadio = groupRadio.add('radiobutton', undefined, 'Custom');
    activeArtboardRadio.value = true;
    activeArtboardRadio.onClick = function () { customArts.enabled = false; };
    allArtboardsRadio.onClick = function () { customArts.enabled = false; };
    customArtboardsRadio.onClick = function () { customArts.enabled = true; };

var customArts = panel.add('edittext', undefined, activeDocument.artboards.getActiveArtboardIndex() + 1);
    customArts.enabled = false;

var extraPanel = globalGroup.add('panel', undefined, 'Items: Raster, Placed, Mesh');
    extraPanel.orientation = 'column';
    extraPanel.alignChildren = 'fill';
    extraPanel.margins = [20, 20, 20, 10];

var isRPM = extraPanel.add('checkbox', undefined, 'Enabled crop items');
    isRPM.value = true;
    isRPM.onClick = function (e) {
        RPMGroup.enabled = isRPM.value;
        resGroup.enabled = (maskRPM.value ? false : isRPM.value);
    }

var RPMGroup = extraPanel.add('group');
    RPMGroup.orientation = 'row';

var cropRPM = RPMGroup.add('radiobutton', undefined, 'Crop'),
    maskRPM = RPMGroup.add('radiobutton', undefined, 'Clipping mask');
    cropRPM.value = true;

    cropRPM.onClick = function () { resGroup.enabled = true; }
    maskRPM.onClick = function () { resGroup.enabled = false; }

var resGroup = extraPanel.add('group');
    resGroup.orientation = 'row';

var resolutionList = resGroup.add('dropdownlist', [0, 0, 120, 25], ['Screen (72 ppi)', 'Medium (150 ppi)', 'High (300 ppi)', 'Use Document Raster Effects Resolution', 'Other']),
    resolutionValue = resGroup.add('edittext', [0, 0, 40, 25], docResolution);
    resolutionList.selection = 3;
    resolutionValue.enabled = false;

    function resListItemClick (item) {
        if (item.index === resolutionList.items.length - 1) {
            resolutionValue.enabled = true;
        }
            else {
                resolutionValue.text = (item.index === resolutionList.items.length - 2 ? docResolution : item.text.replace(/[^0-9]/gim,''));
                resolutionValue.enabled = false;
            }
    }
    resolutionList.onChange = function (e) {
        resListItemClick(this.selection);
    }
    resolutionValue.addEventListener('keydown', function (e) { inputNumberEvents(e, this, 16, 5000); });

var includeHLI = globalGroup.add('checkbox', undefined, 'Include hidden & locked items');
    includeHLI.value = true;

var winButtons = globalGroup.add('group');
    winButtons.orientation = 'row';
    winButtons.alignChildren = ['fill', 'fill'];

var cancel = winButtons.add('button', [0, 0, 30, 25], 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

var ok = winButtons.add('button', undefined, 'Run Crop');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

var progressBar = win.add('progressbar', [0, 0, 110, 5]),
    progressBarCounter = 1000;
    progressBar.value = 0;
    progressBar.minvalue = 0;
    progressBar.maxvalue = progressBarCounter;

Object.prototype.extend = function (userObject, deep) {
    for (var key in userObject) {
        if (this.hasOwnProperty(key)) {
            if (deep
                && this[key] instanceof Object
                && !(this[key] instanceof Array)
                && userObject[key] instanceof Object
                && !(userObject[key] instanceof Array)
            ) {
                this[key].extend(userObject[key], deep);
            }
            else this[key] = userObject[key];
        }
    }
    return this;
};
Object.prototype.toRaster = function (userOptions) {
    var options = new RasterizeOptions(),
    userOptions = userOptions || {};
    var rect = userOptions.rect || undefined;

    options.antiAliasingMethod = (typeof userOptions.antiAliasingMethod === 'string' ? AntiAliasingMethod[userOptions.antiAliasingMethod.toUpperCase()] : AntiAliasingMethod.ARTOPTIMIZED);
    options.extend(userOptions || {}, {
        padding: .0,
        resolution: 72,
        transparency: false,
        clippingMask: false,
        includeLayers: false,
        backgroundBlack: false,
        convertSpotColors: false,
        convertTextToOutlines: false,
    });

    return activeDocument.rasterize(this, rect, options);
};

function cropArtboard (artboardIndex, __progressCounter) {
    try{
    var art, rect, items, topObject,
        isTopObject = (typeof artboardIndex == 'number' ? false : true);

    if (!isTopObject) {
        art = activeDocument.artboards[artboardIndex];
        rect = art.artboardRect;

        selection = null;
        activeDocument.artboards.setActiveArtboardIndex(artboardIndex);
        activeDocument.selectObjectsOnActiveArtboard();

        items = selection;
    }
        else if (topObject && topObject.length) {
            topObject = artboardIndex[0];
            items = artboardIndex;
        }
            else {
                return;
            }


    var target = items[0].parent,
        rectangle = target.pathItems.rectangle(rect[1], rect[0], rect[2] - rect[0], rect[1] - rect[3]),
        rectangleBounds = rectangle.geometricBounds,
        counterLocal = {
            items: 0,
            image: 0,
        };
        rectangle.opacity = 0;

    // check position item on artboard
    function checkPosition ($item, coords) {
        return (
            ($item.visibleBounds[0] >= coords[0] - __offset) &&
            ($item.visibleBounds[1] <= coords[1] + __offset) &&
            ($item.visibleBounds[2] <= coords[2] + __offset) &&
            ($item.visibleBounds[3] >= coords[3] - __offset)
        );
    }
    function isOutside ($item, coords) {
        return (
            ($item.visibleBounds[0] > coords[2] + __offset) ||
            ($item.visibleBounds[1] < coords[3] - __offset) ||
            ($item.visibleBounds[2] < coords[0] - __offset) ||
            ($item.visibleBounds[3] > coords[1] + __offset)
        );
    }

    // raster and mesh
    function getRasterRect (item, __rect) {
        selection = null;
    
        var bnds = item.geometricBounds,
            __target = item.parent,
            __maskRect = __target.pathItems.rectangle(__rect[1], __rect[0], __rect[2] - __rect[0], __rect[1] - __rect[3]),
            __maskItem = __target.pathItems.add(),
            __maskGroup = __target.groupItems.add();
        __maskRect.opacity = 0;
    
        __maskItem.setEntirePath([
            [bnds[0], bnds[1]],
            [bnds[2], bnds[1]],
            [bnds[2], bnds[3]],
            [bnds[0], bnds[3]]
        ]);
        __maskItem.filled = true;
        __maskItem.closed = true;
    
        __maskItem.moveToBeginning(__maskGroup);
        __maskRect.moveToBeginning(__maskGroup);
    
        __maskGroup.selected = true;
        app.executeMenuCommand('Live Pathfinder Crop');
        app.executeMenuCommand('expandStyle');
    
        var data = selection[0].geometricBounds;

        if (maskRPM.value) {
            ungroupResult(selection);
            return selection[0];
        }
            else {
                selection[0].remove();
                return data;
            }
    }
    
    function cropImageAndMesh (imageMesh, __rect, ignoreCoordinates, notCount) {
        var j = imageMesh.length;
    
        while (j--) {
            if (imageMesh[j].typename === 'GroupItem') {
                cropImageAndMesh(imageMesh[j].pageItems, __rect, true, true);
            }
                else if (
                    !(/* ignoreCoordinates && */ checkPosition(imageMesh[j], __rect)) &&
                    ((imageMesh[j].typename === 'PlacedItem')
                    || (imageMesh[j].typename === 'RasterItem')
                    || (imageMesh[j].typename === 'MeshItem'))
                ) {
                    var $rect = getRasterRect(imageMesh[j], __rect),
                        blendMode = imageMesh[j].blendingMode;

                    if (maskRPM.value) {
                        var CMGroup = $rect.parent.groupItems.add();
                        CMGroup.moveBefore(imageMesh[j]);
                        imageMesh[j].moveToBeginning(CMGroup);
                        $rect.moveToBeginning(CMGroup);
                        CMGroup.clipped = true;
                        $rect.clipping = true;
                    }
                        else {
                            imageMesh[j].toRaster({
                                resolution: 300,
                                rect: $rect,
                                transparency: true
                            }).blendingMode = blendMode;
                        }
                }

            if (!notCount) {
                progressBar.value += counterLocal.image;
                win.update();
            }
        }
    }

    // other items
    function cropProcessBefore (__items, ignoreCoordinates, notCount) {
        var i = __items.length;
        while (i--) {
            if (isOutside(__items[i], rect)) {
                __items[i].remove();
            }
                else if (
                    !(/* ignoreCoordinates && */ checkPosition(__items[i], rect))
                    && (
                        (__items[i].typename !== 'PlacedItem') &&
                        (__items[i].typename !== 'RasterItem') &&
                        (__items[i].typename !== 'MeshItem')
                    )
                ) {
                    if (__items[i].typename === 'GroupItem') {
                        cropProcessBefore(__items[i].pageItems, true, true);
                    }
                        else if (!__items[i].guides) {
                            cropProcess(__items[i]);
                        }
                }

            if (!notCount) {
                progressBar.value += counterLocal.items;
                win.update();
            }
        }
    }

    function ungroupResult (__items) {
        var l = __items.length;
        
        for (var i = 0; i < l; i++) {
            if (__items[i].typename === 'GroupItem') {
                var j = __items[i].pageItems.length;
                while (j--) { __items[i].pageItems[0].moveBefore(__items[i]); }
                __items[i].remove();
            } 
        }
    }

    function cropProcess (item) {
        var __target = item.parent,
            __group = __target.groupItems.add(),
            __rectangle = rectangle.duplicate();

        __group.move(item, ElementPlacement.PLACEAFTER);
        item.moveToBeginning(__group);
        __rectangle.moveToBeginning(__group);
        __rectangle.filled = true;
        __rectangle.stroked = false;
        __rectangle.clipping = true;
        __group.clipped = true;

        selection = null;
        __group.selected = true;
    
        app.executeMenuCommand('Live Pathfinder Crop');
        app.executeMenuCommand('expandStyle');

        // ungroup
        ungroupResult(selection);
    }

    // run crop items
    counterLocal.items = __progressCounter / items.length;
    cropProcessBefore(items);

    // run crop image and mesh

    if (isRPM.value) {
        if (!isTopObject) {
            selection = null;
            activeDocument.selectObjectsOnActiveArtboard();
            counterLocal.image = __progressCounter / selection.length;
            cropImageAndMesh(selection, rectangleBounds);
        }
            else {
                cropImageAndMesh(items, rectangleBounds);
                topObject.remove();
            }
    }

    rectangle.remove();
    }catch(err) {alert(err + '\n' + err.line);}
}

function startAction() {
    var __arts = activeDocument.artboards,
        __artsLength = __arts.length,
        __indexs = [],
        progressBarCounter = progressBar.maxvalue,
        progressBarCounterExtra = (isRPM.value ? 2 : 1);

    if (!topItemCheckbox.value) {
        if (activeArtboardRadio.value) {
            __indexs.push(__arts.getActiveArtboardIndex());
        }
            else {
                __indexs = __indexs.concat(getCustomNumbers( (allArtboardsRadio.value ? ('1-' + __artsLength) : customArts.text), __arts));
            }
    
        progressBarCounter /= __indexs.length;
    }
        else {
            progressBarCounter /= selection.length;
        }

    globalGroup.enabled = false;

    if (includeHLI.value) {
        saveLockedHiddenItems(activeDocument.layers, 'layers');
        saveLockedHiddenItems(activeDocument.pageItems, 'pageItems');
    }

    if (!topItemCheckbox.value) {
        for (var x = 0; x < __indexs.length; x++) {
            cropArtboard(__indexs[x], progressBarCounter / progressBarCounterExtra);
        }
    }
        else {
            cropArtboard(selection, progressBarCounter / progressBarCounterExtra);
        }

    if (includeHLI.value) {
        restoreLockedHiddenItems();
    }

    win.close();
}

selection = null;
app.redraw();
win.center();
win.show();