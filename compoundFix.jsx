/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: compoundFix.jsx;

  Copyright (c) 2018
  www.ladyginpro.ru

*/
if (app.executeMenuCommand instanceof Function) {
    if (activeDocument.compoundPathItems.length) {
        var win = new Window('dialog', 'CompoundFix \u00A9 www.ladyginpro.ru', undefined);
            win.orientation = 'column';
            win.alignChildren = ['fill', 'fill'];

        var globalGroup = win.add('group'),
            panel = globalGroup.add('panel');
            panel.orientation = 'column';
            panel.alignChildren = 'fill';
            panel.margins = 20;

        var radioSelection = panel.add('radiobutton', undefined, 'Selection'),
            radioAll = panel.add('radiobutton', undefined, 'All Compounds');
        radioAll.value = true;

        var winButtons = globalGroup.add('group');
            winButtons.orientation = 'column';
            winButtons.alignChildren = 'fill';

        var cancel = winButtons.add('button', [0, 0, 30, 25], 'Cancel');
            cancel.helpTip = 'Press Esc to Close';
            cancel.onClick = function () { win.close(); }

        var ok = winButtons.add('button', undefined, 'Run fix');
            ok.helpTip = 'Press Enter to Run';
            ok.onClick = compoundFixAction;
            ok.active = true;

        var progressBar = win.add('progressbar', [0, 0, 110, 5]),
            progressBarCounter = 100;
            progressBar.value = 0;
            progressBar.minvalue = 0;
            progressBar.maxvalue = progressBarCounter;

        function compoundFixAction() {
            globalGroup.enabled = false;
            function __ungroup (__items) {
                var l = __items.length;
                for (var i = 0; i < l; i++) {
                    if (__items[i].typename === 'GroupItem') {
                        var j = __items[i].pageItems.length;
                        while (j--) {
                            __items[i].pageItems[0].locked = __items[i].pageItems[0].hidden = false;
                            __items[i].pageItems[0].moveBefore(__items[i]);
                        }
                        __items[i].remove();
                    }
                }
            }

            function compoundFix (item, isHidden, isLocked) {
                if (isHidden) item.hidden = false;
                if (isLocked) item.locked = false;

                selection = [item];
                app.executeMenuCommand('noCompoundPath');
                __ungroup(selection);
                app.executeMenuCommand('compoundPath');

                if (isHidden) selection[0].hidden = true;
                if (isLocked) selection[0].locked = true;
                selection = null;
            }

            function compoundPathItemsNormalize (items) {
                var i = items.length;
                progressBarCounter /= i;
                while (i--) {
                    if (items[i].typename === 'GroupItem') {
                        compoundPathItemsNormalize(items[i].pageItems);
                    }
                        else if (items[i].typename === 'CompoundPathItem') {
                            compoundFix(items[i], radioAll.value ? items[i].hidden : false, radioAll.value ? items[i].locked : false);
                        }
                    progressBar.value += progressBarCounter;
                    win.update();
                }
            }

            var selectionBak = selection;
            compoundPathItemsNormalize(radioSelection.value ? selection : activeDocument.compoundPathItems);
            selection = selectionBak;
            win.close();
        }

        win.center();
        win.show();
    }
        else {
            alert('Compound path items looks fine ;)');
        }
}
    else {
        alert('This version of illustrator is not supported!');
    }