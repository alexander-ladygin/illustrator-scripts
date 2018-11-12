/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CS6+
  Name: optimizero.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/
var scriptName = 'Optimizero',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/'
    };

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
$.command = function (command) {try {app.executeMenuCommand(command);return $;}catch (e) {$.errorMessage('Command is " ' + command + ' " error: ' + e);}};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('Object.extend() - error: ' + e);}};
Object.prototype.getAllParents = function () {function get(obj) {var arr = [];if (obj.parent.typename !== 'Application') {for (var i = 0; ; i++) {arr.push(obj.parent);if (obj.parent.parent.typename === 'Application') {return arr;}else {obj = obj.parent;}if (i === 1000) {break;}}}else {return obj;}}return get(this);};
Object.prototype.removeItemsWithArray = function (items) {var obj = [];for (var i = 0; i < this.length; i++) {if (!check(this[i])) {obj.push(this[i]);}}function check(e) {for (var j = 0; j < items.length; j++) {if (e === items[j]) {return true;}}return false;}return obj;};
Object.prototype.emptyLayers = function () {var arr = [];function check(layers) {var obj = [];for (var i = 0; i < layers.length; i++) {var subLayers = layers[i].subLayers(),emptySubLayers = layers[i].emptySubLayers(),count = subLayers.removeItemsWithArray(emptySubLayers).length;if (!count && !layers[i].pageItems.length) {obj = obj.concat(layers[i]);}}return obj;}var doc = this.typename === 'Document' ? [this] : this;for (var i = 0; i < doc.length; i++) {arr = arr.concat(check(doc[i].layers));}return arr;};
Object.prototype.subLayers = function (level) {var arr = [], count = 0;if (level !== undefined) {level = level - 1;}function __subLayers(layer) {var obj = [], sub = layer.layers;for (var j = 0; j < sub.length; j++) {obj = obj.concat(sub[j]);if ((level === undefined) || (sub[j].layers.length > 0 && count < level)) {obj = obj.concat(__subLayers(sub[j], count++));count--;}}return obj;}var obj = this.typename === 'Document' ? [this] : this;for (var j = 0; j < obj.length; j++) {arr = arr.concat(__subLayers(obj[j]));}return arr;};
Object.prototype.emptySubLayers = function (level) {var arr = [], obj = this.typename === 'Document' ? [this] : this;function process(sub) {var sub_arr = [];sub = sub.subLayers(level).reverse();for (var i = 0; i < sub.length; i++) {if (sub[i].pageItems.length > 0) {var parents = sub[i].pageItems[0].getAllParents();parents.pop();sub_arr = sub_arr.concat(parents);}}return sub.removeItemsWithArray(sub_arr).reverse();}for (var i = 0; i < obj.length; i++) {arr = arr.concat(process(obj[i]));}return arr;};
Array.prototype.__remove = function(){var i = this.length; if (i > 0) while (i--) this[i].remove();}

function optimizero (userOptions) {
    var options = {
        hidden:                true,
        ghost:                 true,
        rasterEmbed:           true,
        expandStyle:           true,
        removeEmptyLayers:     true,
        locked:                'unlock',
        /*
            unlock
            remove
        */
        guides:                'newlayer',
        /*
            newlayer
            remove
        */
        openPaths:             'join',
        /*
            skip
            join
            remove
        */
    }.extend(userOptions || {});

    var layerGuides = activeDocument.layers.add(),
        guidesCollection = [];
    layerGuides.name = scriptName + '_guides';
    options.guides = (typeof options.guides === 'string' ? options.guides.toLowerCase() : 'newlayer');

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
    }
    function layersOptimize (layers) {
        var n = layers.length;
        if (n > 0) while (n--) {
            if (options.hidden && !layers[n].visible) {
                layers[n].visible = true;
                layers[n].remove();
                continue;
            }
                else if (options.locked && layers[n].locked) {
                    layers[n].locked = false;
                    if (!(options.locked !== 'remove')) {
                        layers[n].remove();
                        continue;
                    }
                }
            layersOptimize(layers[n].layers);
        }
    }
    function itemsOptimize (items, $progress) {
        try {
            var i = items.length;
            if (!$progress) progressBarCounter = progressBar.maxvalue * 0.8 / i;

            while (i--) {
                if (options.guides && items[i].guides) {
                    guidesCollection.push(items[i]);
                }
                    else if (options.hidden && items[i].hidden) {
                        items[i].hidden = true;
                        items[i].remove();
                    }
                    else if (options.locked && items[i].locked) {
                        if (options.locked !== 'remove') items[i].locked = false;
                            else items[i].remove();
                    }
                    else if (items[i].typename === 'SymbolItem') {
                        items[i].breakLink();
                    }
                    else if (options.ghost && items[i].typename.indexOf('PathItem') > -1) {
                        try {
                            var __items = (items[i].typename === 'CompoundPathItem' ? items[i].pathItems[0] : items[i]);
                            if (!__items.stroked && !__items.filled && !__items.guides &&
                                !(__items.clipping && __items.parent.clipped)
                            ) {
                                items[i].remove();
                            }
                                else if (!items[i].closed && items[i].pathPoints && items[i].pathPoints.length > 2) {
                                    switch (options.openPaths.toLowerCase().replace(/ /g, '')) {
                                        case 'join' : items[i].closed = true; break;
                                        case 'remove' : items[i].remove(); break;
                                    }
                                }
                        }catch (e) {}
                    }
                    else if (options.rasterEmbed && items[i].typename === 'PlacedItem') {
                        items[i].embed();
                    }
                    else if (items[i].typename === 'GroupItems') {
                        itemsOptimize(items[i].pageItems, true);
                    }

                if (!$progress) { progressBar.value += progressBarCounter; win.update(); }
            }
        }
            catch(err) {
                $.errorMessage(err);
            }
    }


    selection = null;
    if (options.expandStyle) $.command('selectall').command('expandStyle');
    compoundFixAction(activeDocument.compoundPathItems);
    selection = null;
    layersOptimize(activeDocument.layers);
    itemsOptimize(activeDocument.pageItems);
    var i = guidesCollection.length;
    if (i > 0) while (i--) { options.guides !== 'remove' ? guidesCollection[i].moveToBeginning(layerGuides) : guidesCollection[i].remove(); }
    if (options.emptyLayers) {
        activeDocument.emptyLayers().__remove();
        progressBar.value += progressBar.maxvalue * 0.2;
        win.update();
    }
    selection = null;
}


var win = new Window('dialog', scriptName + copyright);
win.alignChildren = 'fill';


with (globalGroup = win.add('group')) {
    orientation = 'column';
    alignChildren = 'fill';

    with (panel = add('panel')) {
        alignChildren = 'fill';

        var checkHidden = add('checkbox', undefined, 'Remove Hidden items');
        checkHidden.value = true;
        var checkGhost = add('checkbox', undefined, 'Remove Ghost items');
        checkGhost.value = true;
        var checkRemoveEmptyLayers = add('checkbox', undefined, 'Remove empty layers');
        checkRemoveEmptyLayers.value = true;
        var checkRasterEmbed = add('checkbox', undefined, 'Embed rester items');
        checkRasterEmbed.value = true;
        var checkExpandStyle = add('checkbox', undefined, 'Expand items (styles)');
        checkExpandStyle.helpTip = 'Expand brushes, symbols, effects ...';
        checkExpandStyle.value = true;
        var dlistLocked = add('dropdownlist', undefined, 'Locked items: Unlock,Locked items: Remove'.split(','));
        dlistLocked.selection = 0;
        var dlistOpenPaths = add('dropdownlist', undefined, 'Open paths: Join,Open paths: Remove,Open paths: Skip'.split(','));
        dlistOpenPaths.selection = 0;
        var dlistGuides = add('dropdownlist', undefined, 'Guides: Remove,Guides: Move to new layer'.split(','));
        dlistGuides.selection = 1;
    }

    with (add('group')) {
        orientation = 'row';
        alignChildren = ['fill', 'fill'];

        var cancel = add('button', undefined, 'Cancel');
            cancel.helpTip = 'Press Esc to Close';
            cancel.onClick = function () { win.close(); }
        
        var ok = add('button', [0, 0, 100, 30], 'Optimize');
            ok.helpTip = 'Press Enter to Run';
            ok.onClick = startAction;
            ok.active = true;
    }
}

var progressBar = win.add('progressbar'),
    progressBarCounter = 100;
    progressBar.value = 0;
    progressBar.minvalue = 0;
    progressBar.maxvalue = progressBarCounter;
    progressBar.maximumSize = [1000, 5];



function startAction() {
    try {
        globalGroup.enabled = false;

        optimizero({
            hidden: checkHidden.value,
            locked: dlistLocked.selection.text.toLowerCase().replace(/ /g, '').replace('lockeditems:', ''),
            ghost: checkGhost.value,
            rasterEmbed: checkRasterEmbed.value,
            expandStyle: checkExpandStyle.value,
            guides: dlistGuides.selection.text.toLowerCase().replace(/ /g, '').replace('guides:', ''),
            removeEmptyLayers: checkRemoveEmptyLayers.value,
            openPaths: dlistOpenPaths.selection.text.toLowerCase().replace(/ /g, '').replace('openpaths:', ''),
        });
    }
        catch(err) 
            {$.errorMessage(err);
        }

    win.close();
}


function saveSettings() {
    var $file = new File(settingFile.folder + settingFile.name),
        data = [
            checkHidden.value,
            dlistLocked.selection.index,
            checkGhost.value,
            dlistGuides.selection.index,
            checkRemoveEmptyLayers.value,
            checkRasterEmbed.value,
            checkExpandStyle.value,
            dlistOpenPaths.selection.index
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
                checkHidden.value = ($main[0] === 'true');
                dlistLocked.selection = parseInt($main[1]);
                checkGhost.value = ($main[2] === 'true');
                dlistGuides.selection = parseInt($main[3]);
                checkRemoveEmptyLayers.value = ($main[4] === 'true');
                checkRasterEmbed.value = ($main[5] === 'true');
                checkExpandStyle.value = ($main[6] === 'true');
                dlistOpenPaths.selection = parseInt($main[7]);
        } catch (e) {}
        $file.close();
    }
}

win.onClose = function() {
    saveSettings();
    return true;
}

loadSettings();
win.center();
win.show();