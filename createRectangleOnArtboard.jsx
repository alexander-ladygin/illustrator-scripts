/* 

  Program version: Adobe Illustrator CS5+
  Name: createRectangleOnArtboard.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2019
  www.ladygin.pro

*/

var scriptName = 'CROA',
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


    function createRectangleOnArtboard (__artNumbers) {
      if (__artNumbers && __artNumbers.length) {
        var l = __artNumbers.length;

        for (var i = 0; i < l; i++) {
          var rect = activeDocument.artboards[__artNumbers[i]].artboardRect,
            shape = activeDocument.activeLayer.pathItems.rectangle(rect[1], rect[0], rect[2] - rect[0], rect[1] - rect[3]);
          
          shape.fillColor = activeDocument.defaultFillColor;
        }
      }
    }

    var win = new Window('dialog', 'Rectangle On Art \u00A9 www.ladygin.pro', undefined);
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

        createRectangleOnArtboard(__arts);

        win.close();
    }

    selection = null;
    function saveSettings() {
        var $file = new File(settingFile.folder + settingFile.name),
            data = [
                allArtboardsRadio.value,
                customArtboardsRadio.value
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