var win = new Window('dialog', 'Create artboard from the selection');
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

var panel = win.add('panel', undefined, 'Selection bounds:');
    panel.orientation = 'column';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = 20;

var eachSel = panel.add('radiobutton', undefined, 'Each in the selection'),
    selBnds = panel.add('radiobutton', undefined, 'Only selection bounds');
    eachSel.value = true;

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

    var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }


function startAction() {
    var items = selection,
        i = items.length,
        bounds = (bndsVis.value ? 'visible' : 'geometric') + 'Bounds';

    if (eachSel.value) {
        while (i--) activeDocument.artboards.add(items[i][bounds]);
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