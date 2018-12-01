/* 

  Program version: Adobe Illustrator CS5+
  Name: artboardItemsMoveToNewLayer.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladygin.pro

*/
Object.prototype.removeItemsWithArray = function (items) {var obj = [];for (var i = 0; i < this.length; i++) {if (!check(this[i])) {obj.push(this[i]);}}function check(e) {for (var j = 0; j < items.length; j++) {if (e === items[j]) {return true;}}return false;}return obj;};
Object.prototype.emptyLayers = function () {var arr = [];function check(layers) {var obj = [];for (var i = 0; i < layers.length; i++) {if (!layers[i].layers.length && !layers[i].pageItems.length) { obj.push(layers[i]); continue;} var subLayers = layers[i].subLayers(),emptySubLayers = layers[i].emptySubLayers(),count = subLayers.removeItemsWithArray(emptySubLayers).length;if (!count && !layers[i].pageItems.length) {obj = obj.concat(layers[i]);}}return obj;}var doc = this;for (var i = 0; i < doc.length; i++) {arr = arr.concat(check(doc[i].layers));}return arr;};
Object.prototype.subLayers = function (level) {var arr = [], count = 0;if (level !== undefined) {level = level - 1;}function subLayers(layer) {var obj = [], sub = layer.layers;for (var j = 0; j < sub.length; j++) {obj = obj.concat(sub[j]);if ((level === undefined) || (sub[j].layers.length > 0 && count < level)) {obj = obj.concat(subLayers(sub[j], count++));count--;}}return obj;}var obj = this;for (var j = 0; j < obj.length; j++) {arr = arr.concat(subLayers(obj[j]));}return arr;};
Object.prototype.emptySubLayers = function (level) {var arr = [], obj = this;function process(sub) {var sub_arr = [];sub = sub.subLayers(level).reverse();for (var i = 0; i < sub.length; i++) {if (sub[i].pageItems.length > 0) {var parents = sub[i].pageItems[0].getAllParents();parents.pop();sub_arr = sub_arr.concat(parents);}}return sub.removeItemsWithArray(sub_arr).reverse();}for (var i = 0; i < obj.length; i++) {arr = arr.concat(process(obj[i]));}return arr;};
Array.prototype.remove = function(){var i = this.length; if (i > 0) while (i--) this[i].remove();}

var scriptName = 'AIMTNL',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    };

if (app.documents.length) {
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


    function __artboardItemsMoveToNewLayer (__artNumbers) {
        var arts = activeDocument.artboards,
            l = __artNumbers.length;

        selection = null;

        function __move (items, __index) {
            var layer = activeDocument.layers.add(),
                j = items.length;

            if (layerNameCheckbox.value) layer.name = arts[__index].name;

            if (j > 0) while (j--) {
                items[j].moveToBeginning(layer);
            }
        }

        for (var i = 0; i < l; i++) {
            activeDocument.artboards.setActiveArtboardIndex(__artNumbers[i]);
            activeDocument.selectObjectsOnActiveArtboard();
            __move(selection, __artNumbers[i]);
            selection = null;
        }
    }

    var selectionBak = selection;

    var win = new Window('dialog', 'Artboards items move to new layer \u00A9 www.ladygin.pro', undefined);
        win.orientation = 'column';
        win.alignChildren = ['fill', 'fill'];

    var panel = win.add('panel', undefined, 'Artboards:');
        panel.orientation = 'column';
        panel.alignChildren = ['fill', 'fill'];
        panel.margins = 20;

    var groupRadio = panel.add('group');
        groupRadio.orientation = 'row';

    var allArtboardsRadio = groupRadio.add('radiobutton', undefined, 'All'),
        customArtboardsRadio = groupRadio.add('radiobutton', undefined, 'Custom');
        allArtboardsRadio.value = true;
        allArtboardsRadio.onClick = function () { customArts.enabled = false; };
        customArtboardsRadio.onClick = function () { customArts.enabled = true; };

    var customArts = panel.add('edittext', undefined, activeDocument.artboards.getActiveArtboardIndex() + 1);
        customArts.enabled = false;

    var panelCheckbox = win.add('panel');
        panelCheckbox.orientation = 'column';
        panelCheckbox.alignChildren = ['fill', 'fill'];
        panelCheckbox.margins = 10;

    var removeEmptyLayersCheckbox = panelCheckbox.add('checkbox', undefined, 'Clear empty layers & sub layers'),
        layerNameCheckbox = panelCheckbox.add('checkbox', undefined, 'Layer name from the artboard name');

    var winButtons = win.add('group');
        winButtons.orientation = 'row';
        winButtons.alignChildren = ['fill', 'fill'];

    var cancel = winButtons.add('button', undefined, 'Cancel');
        cancel.helpTip = 'Press Esc to Close';
        cancel.onClick = function () { win.close(); }

    var ok = winButtons.add('button', undefined, 'OK');
        ok.helpTip = 'Press Enter to Run';
        ok.onClick = startAction;
        ok.active = true;

    function startAction() {
        var __arts = [];

        __arts = getCustomNumbers((customArtboardsRadio.value ? customArts.text : ('1-' + activeDocument.artboards.length)), activeDocument.artboards);

        __artboardItemsMoveToNewLayer(__arts);

        if (removeEmptyLayersCheckbox.value) [activeDocument].emptyLayers().remove();
        // selection = selectionBak;

        win.close();
    }

    selection = null;
    function saveSettings() {
        var $file = new File(settingFile.folder + settingFile.name),
            data = [
                allArtboardsRadio.value,
                customArtboardsRadio.value,
                removeEmptyLayersCheckbox.value,
                layerNameCheckbox.value
            ].toString() + '\n' + customArts.text;
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
                    $arts = data[1];
                allArtboardsRadio.value = ($main[0] === 'true');
                customArtboardsRadio.value = ($main[1] === 'true');
                removeEmptyLayersCheckbox.value = ($main[2] === 'true');
                layerNameCheckbox.value = ($main[3] === 'true');

                customArts.text = $arts;
                customArts.enabled = customArtboardsRadio.value;
            } catch (e) {}
            $file.close();
        }
    }

    function checkSettingFolder() {
        var $folder = new Folder(settingFile.folder);
        if (!$folder.exists) $folder.create();
    }

    win.onClose = function () {
        saveSettings();
        return true;
    }

    checkSettingFolder();
    loadSettings();
    win.center();
    win.show();

}
    else {
        throw new Error('Create document!');
    }