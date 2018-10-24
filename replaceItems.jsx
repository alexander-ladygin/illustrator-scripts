/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: replaceItems.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/
var win = new Window('dialog', 'Replace items \u00A9 www.ladygin.pro', undefined);
    win.orientation = 'column';
    win.alignChildren = ['fill', 'fill'];

var panel = win.add('panel', undefined, 'What to replace?');
    panel.orientation = 'column';
    panel.alignChildren = ['fill', 'fill'];
    panel.margins = [20, 30, 20, 20];

    var bufferRadio = panel.add('radiobutton', undefined, 'Object in buffer'),
        currentRadio = panel.add('radiobutton', undefined, 'Top object'),
        randomRadio = panel.add('radiobutton', undefined, 'All in group (random)'),
        groupValue = panel.add('group'),
        randomValue = groupValue.add('edittext', undefined, '100'),
        randomValueUnit = groupValue.add('statictext', undefined, '%'),
        elementsInGroupCheckbox = panel.add('checkbox', undefined, 'Replace items in a group?');

    groupValue.orientation = 'row';
    groupValue.margins = 0;
    groupValue.alignChildren = ['fill', 'fill'];
    randomValue.minimumSize = [120, undefined];

var panelCheckboxes = win.add('panel');
    panelCheckboxes.orientation = 'column';
    panelCheckboxes.alignChildren = ['fill', 'fill'];
    panelCheckboxes.margins = 20;

    var copyWHCheckbox = panelCheckboxes.add('checkbox', undefined, 'Copy Width & Height'),
        saveOriginalCheckbox = panelCheckboxes.add('checkbox', undefined, 'Save original element'),
        copyColorsCheckbox = panelCheckboxes.add('checkbox', undefined, 'Copy colors from element'),
        randomRotateCheckbox = panelCheckboxes.add('checkbox', undefined, 'Random element rotation'),
        symbolByRPCheckbox = panelCheckboxes.add('checkbox', [0, 0, 100, 40], 'Align symbols by\nregistration point');

    bufferRadio.value = true;
    copyWHCheckbox.value = false;
    saveOriginalCheckbox.value = false;

    var winButtons = win.add('group');
    winButtons.alignChildren = ['fill', 'fill'];
    winButtons.margins = [0, 0, 0, 0];

    var cancel = winButtons.add('button', undefined, 'Cancel');
    cancel.helpTip = 'Press Esc to Close';
    cancel.onClick = function () { win.close(); }

    var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
    ok.helpTip = 'Press Enter to Run';
    ok.onClick = startAction;
    ok.active = true;

    var progressBar = win.add('progressbar', [0, 0, 110, 5]),
        progressBarCounter = 100;
    progressBar.value = 0;
    progressBar.minvalue = 0;
    progressBar.maxvalue = progressBarCounter;

    copyWHCheckbox.onClick = function (e) {
        groupValue.enabled = !copyWHCheckbox.value;
    }

    win.center();
    win.show();

function randomRotation (item) {
    item.rotate(Math.floor(Math.random() * 360), true, true, true, true, Transformation.CENTER);
}

function getSymbolPositionByRegistrationPoint (item) {
    var bakupSymbol = item.symbol,
        newSymbol = activeDocument.symbols.add(item, SymbolRegistrationPoint.SYMBOLTOPLEFTPOINT);

    // replace symbol
    item.symbol = newSymbol;

    // set position
    var position = [
            item.left,
            item.top
        ];

    // restore symbol
    item.symbol = bakupSymbol;
    newSymbol.remove();
    
    return position;
}

function startAction() {
    if (selection.length) {
        panel.enabled = groupValue.enabled = panelCheckboxes.enabled = ok.enabled = cancel.enabled = false;

        var __ratio = !isNaN(parseFloat(randomValue.text)) ? parseFloat(randomValue.text) / 100 : 1,
            items = (!elementsInGroupCheckbox.value ? selection : selection[selection.length - 1].pageItems),
            nodes = (currentRadio.value ? selection[0] : (bufferRadio.value ? [] : selection[0].pageItems)),
            length = nodes.length,
            i = items.length;

        progressBarCounter = progressBar.maxvalue / i;

        if (bufferRadio.value) {
            selection = null;
            app.paste();
            nodes = selection[0];
            selection = null;
        }

        function getNode() {
            return ((currentRadio.value || bufferRadio.value) ? nodes : nodes[ Math.floor(Math.random() * length) ]);
        }

        while (i--) {
            if (currentRadio.value && !i) break;
            var item = items[i],
                node = getNode().duplicate(item, ElementPlacement.PLACEBEFORE),
                __fn = 'height',
                __fnReverse = 'width';

            if (node.height >= node.width) {
                __fn = 'width';
                __fnReverse = 'height';
            }

            if (randomRotateCheckbox.value) randomRotation(node);

            if (!copyWHCheckbox.value) {
                var __size = (item.height >= item.width ? item.width : item.height) * __ratio,
                    precent = __size * 100 / node[__fn] / 100;

                node[__fn] = __size;
                node[__fnReverse] *= precent;
            }
                else {
                    node.width = item.width;
                    node.height = item.height;
                }

            node.left = item.left - (node.width - item.width) / 2;
            node.top = item.top + (node.height - item.height) / 2;

            if (symbolByRPCheckbox.value && node.typename === 'SymbolItem') {
                var __pos = getSymbolPositionByRegistrationPoint(node);
                node.left += (item.left + item.width / 2) - __pos[0];
                node.top += (item.top - item.height / 2) - __pos[1];
            }

            if (copyColorsCheckbox.value && item.fillColor) node.fill(item.fillColor);
            if (!saveOriginalCheckbox.value) item.remove();

            progressBar.value += progressBarCounter;
            win.update();
        }

        if (bufferRadio.value) nodes.remove();

    }

    win.close();
}