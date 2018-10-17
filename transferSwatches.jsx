/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: transferSwatches.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/
#include './libraries/AI_PS_Library.js';
var win = new Window('dialog', 'Transfer swatches', undefined);
win.orientation = 'column';
win.alignChildren = ['fill', 'fill'];

panel = win.add('panel', undefined, 'Please select a document!');
var winDocs = panel.add('dropdownlist', [0, 0, 180, 30], $.getArr(app.documents, 'name', undefined, [activeDocument])),
    winReplace = panel.add('checkbox', [0, 0, 180, 15], 'Replace the same by name:');

winDocs.selection = 0;

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


function startAction () {
    app.documents[winDocs.selection].transferSwatches({
        replace: winReplace.value
    });
    win.close();
}