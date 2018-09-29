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
    panel.margins = 20;

    var bufferRadio = panel.add('radiobutton', undefined, 'Object in buffer'),
        currentRadio = panel.add('radiobutton', undefined, 'Top object'),
        randomRadio = panel.add('radiobutton', undefined, 'All in group (random)');

var panelCheckboxes = win.add('panel');
    panelCheckboxes.orientation = 'column';
    panelCheckboxes.alignChildren = ['fill', 'fill'];
    panelCheckboxes.margins = 20;

    var copyWHCheckbox = panelCheckboxes.add('checkbox', undefined, 'Copy Width & Height'),
        saveOriginalCheckbox = panelCheckboxes.add('checkbox', undefined, 'Save original element');

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

    win.center();
    win.show();



function startAction() {
    if (selection.length) {
        
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
                    node[__fn]((item.height <= item.width ? item.width : item.height), {
                            constrain: true,
                            anchor: 'center'
                        })
                        .align('center', {
                            object: {
                                node: item
                            }
                        });
                }
                    else {
                        node.attr({
                            width: item.width,
                            height: item.height
                        })
                        .align('center', {
                            object: {
                                node: item
                            }
                        });
                    }

                if (item.fillColor) selection[0].fill(item.fillColor);
                if (!saveOriginalCheckbox.value) item.remove();
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
                            node[__fn]((item.height >= item.width ? item.width : item.height), {
                                    constrain: true,
                                    anchor: 'center'
                                })
                                .align('center', {
                                    object: {
                                        node: item
                                    }
                                });
                        }
                            else {
                                node.attr({
                                    width: item.width,
                                    height: item.height
                                })
                                .align('center', {
                                    object: {
                                        node: item
                                    }
                                });
                            }

                        if (item.fillColor) node.fill(item.fillColor);
                        if (!saveOriginalCheckbox.value) item.remove();
                    }
                });
            }

    }

    win.close();
}