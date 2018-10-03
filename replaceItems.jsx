/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: replaceItems.jsx;
  Copyright (c) 2018

*/

#include './libraries/AI_PS_Library.js';
var win = new Window('dialog', 'Replace items', undefined);
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
        randomValueUnit = groupValue.add('statictext', undefined, '%');

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
        copyColorsCheckbox = panelCheckboxes.add('checkbox', undefined, 'Copy colors from element');

    bufferRadio.value = true;
    copyWHCheckbox.value = false;
    saveOriginalCheckbox.value = false;

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

function startAction() {
    if (selection.length) {
        panel.enabled = groupValue.enabled = panelCheckboxes.enabled = ok.enabled = cancel.enabled = false;

        progressBarCounter = progressBar.maxvalue / selection.length;

        var __ratio = !isNaN(parseFloat(randomValue.text)) ? parseFloat(randomValue.text) / 100 : 1;

        if (bufferRadio.value) {
            var items = selection,
                collection = [];

            items.each(function (item, i) {
                selection = null;
                app.paste();

                selection.appendTo(item, 'after');
                collection.push(selection[0]);

                var node = selection[0],
                    __fn = 'Width';

                if (node.height >= node.width) __fn = 'Height';

                if (!copyWHCheckbox.value) {
                    node[__fn]((item.height <= item.width ? item.width : item.height) * __ratio, {
                            constrain: true,
                            anchor: 'center'
                        })
                        node.left = item.left - (node.width - item.width) / 2;
                        node.top = item.top + (node.height - item.height) / 2;
                }
                    else {
                        node.attr({
                            width: item.width,
                            height: item.height
                        })
                        node.left = item.left - (node.width - item.width) / 2;
                        node.top = item.top + (node.height - item.height) / 2;
                    }

                if (copyColorsCheckbox.value && item.fillColor) selection[0].fill(item.fillColor);
                if (!saveOriginalCheckbox.value) item.remove();

                progressBar.value += progressBarCounter;
                win.update();
            });

            selection = collection;
        }
            else {
                var items = selection,
                    nodes = (currentRadio.value ? selection[0] : selection[0].pageItems),
                    length = nodes.length;

                function getNode() {
                    return (currentRadio.value ? nodes : nodes[ Math.floor(Math.random() * length) ]);
                }
                
                items.each(function (item, i) {
                    if (i) {
                        var node = getNode().duplicate(item, ElementPlacement.PLACEBEFORE),
                            __fn = 'Width';

                        if (node.height >= node.width) __fn = 'Height';

                        if (!copyWHCheckbox.value) {
                            node[__fn]((item.height >= item.width ? item.width : item.height) * __ratio, {
                                    constrain: true,
                                    anchor: 'center'
                                });
                            node.left = item.left - (node.width - item.width) / 2;
                            node.top = item.top + (node.height - item.height) / 2;
                        }
                            else {
                                node.attr({
                                    width: item.width,
                                    height: item.height
                                })
                                node.left = item.left - (node.width - item.width) / 2;
                                node.top = item.top + (node.height - item.height) / 2;
                            }

                        if (copyColorsCheckbox.value && item.fillColor) node.fill(item.fillColor);
                        if (!saveOriginalCheckbox.value) item.remove();

                        progressBar.value += progressBarCounter;
                        win.update();
                    }
                });
            }

    }

    win.close();
}