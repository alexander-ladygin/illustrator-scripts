/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: createArtboardsFromTheSelection.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

var win = new Window('dialog', 'Create artboard from the selection \u00A9 www.ladygin.pro');
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

var panel = win.add('panel', undefined, 'Selection bounds:');
    panel.orientation = 'column';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = 20;

var eachSel = panel.add('radiobutton', undefined, 'Each in the selection'),
    selBnds = panel.add('radiobutton', undefined, 'Only selection bounds'),
    __itemName = panel.add('checkbox', undefined, 'Set name from element');
    __itemName.value = true;
    eachSel.value = true;
    eachSel.onClick = function() { __itemName.enabled = true; }
    selBnds.onClick = function() { __itemName.value = __itemName.enabled = false; }

var panel = win.add('panel', undefined, 'Item bounds:');
    panel.orientation = 'row';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = 20;

var bndsVis = panel.add('radiobutton', undefined, 'Vsiible'),
    bndsGeo = panel.add('radiobutton', undefined, 'Geometric');
    bndsVis.value = true;

var winButtons = win.add('group');
    winButtons.alignChildren = 'center';
    winButtons.margins = [0, 0, 0, 0];

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

    var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;


function startAction() {
    var items = selection,
        i = items.length,
        bounds = (bndsVis.value ? 'visible' : 'geometric') + 'Bounds';

    if (eachSel.value) {
        while (i--) {
            if (__itemName.value && items[i].name) activeDocument.artboards.add(items[i][bounds]).name = items[i].name;
                else activeDocument.artboards.add(items[i][bounds]);
        }
    }
        else {
            var x = [], y = [],
                w = [], h = [];
            while (i--) {
                x.push(items[i][bounds][0]);
                y.push(items[i][bounds][1]);
                w.push(items[i][bounds][2]);
                h.push(items[i][bounds][3]);
            };
            activeDocument.artboards.add([Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)]);
        }
    
    win.close();
}

win.center();
win.show();