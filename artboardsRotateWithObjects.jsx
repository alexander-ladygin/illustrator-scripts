/* 

  Program version: Adobe Illustrator CS5+
  Name: artboardsRotateWithObjects.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro
          Sergey Osokin, email: hi@sergosokin.ru

  Copyright (c) 2018

*/

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var scriptName = 'ARWO',
    scriptVersion = '1.1';

try {
    if (documents.length > 0) {
        var doc = app.activeDocument,
            currArt = doc.artboards[doc.artboards.getActiveArtboardIndex()],
            currArtNum = doc.artboards.getActiveArtboardIndex() + 1,
            lockedItems = new Array(),
            hiddenItems = new Array();

        // Create Main Window
        var dlg = new Window('dialog', scriptName + ' ver.' + scriptVersion, undefined);
        dlg.orientation = 'column';
        dlg.alignChildren = ['fill', 'fill'];

        // Target radiobutton
        var slctTarget = dlg.add('panel', undefined, 'What to rotate?');
        slctTarget.orientation = 'column';
        slctTarget.alignChildren = 'left';
        slctTarget.margins = 20;
        var currArtRadio = slctTarget.add('radiobutton', undefined, 'Active Artboard #' + currArtNum),
            allArtRadio = slctTarget.add('radiobutton', undefined, 'All ' + doc.artboards.length + ' Artboards');
        currArtRadio.value = true;

        // Angle radiobutton
        var slctAngle = dlg.add('panel', undefined, 'Rotation angle:');
        slctAngle.orientation = 'row';
        slctAngle.alignChildren = ['fill', 'fill'];
        slctAngle.margins = 20;
        var cwAngle = slctAngle.add('radiobutton', undefined, '90 CW'),
            ccwAngle = slctAngle.add('radiobutton', undefined, '90 CCW');
        cwAngle.value = true;

        // Buttons
        var btns = dlg.add('group');
        btns.alignChildren = ['fill', 'fill'];
        btns.margins = [0, 10, 0, 0];
        var ok = btns.add('button', undefined, 'OK', {name: 'ok'});
        ok.helpTip = 'Press Enter to Run';
        ok.active = true;
        ok.onClick = okClick;
        var cancel = btns.add('button', undefined, 'Cancel', {name: 'cancel'});
        cancel.helpTip = 'Press Esc to Close';
        cancel.onClick = function () { dlg.close(); }

        dlg.center();
        dlg.show();

        //Start
        function okClick() {
            // Saving information about locked & hidden pageItems
            saveItemsState();
            // Rotate active artboard or all artboards in document
            if (currArtRadio.value == true) {
                rotateArt(currArt);
            } else {
                for (var i = 0; i < doc.artboards.length; i++) {
                    doc.artboards.setActiveArtboardIndex(i);
                    rotateArt(doc.artboards[i]);
                }
            }
            // Restoring locked & hidden pageItems
            restoreItemsState();
            dlg.close();
        }
    } else {
        throw new Error(scriptName + '\nPlease open a document before running this script.');
    }
} catch (e) {
    showError(e);
}

// Save information about locked & hidden pageItems
function saveItemsState() {
    for (var i = 0; i < doc.pageItems.length; i++) {
        var currItem = doc.pageItems[i];
        if (currItem.locked == true) {
            lockedItems.push(i);
            currItem.locked = false;
        }
        if (currItem.hidden == true) {
            hiddenItems.push(i);
            currItem.hidden = false;
        }
    }
}

// Restoring locked & hidden pageItems
function restoreItemsState() {
    for (var i = 0; i < lockedItems.length; i++) {
        var index = lockedItems[i];
        doc.pageItems[index].locked = true;
    }
    for (var j = 0; j < hiddenItems.length; j++) {
        var index = hiddenItems[j];
        doc.pageItems[index].hidden = true;
    }
}

// Main function for rotate artboard
function rotateArt(board) {
    var artRect = board.artboardRect,
        artWidth = artRect[2] - artRect[0],
        artHeight = -(artRect[3] - artRect[1]);
    deselect();
    doc.selectObjectsOnActiveArtboard();

    // Rotate artboard
    var newArtRect = [
        artRect[0] + artWidth / 2 - (artHeight / 2),
        artRect[1] - artHeight / 2 + (artWidth / 2),
        artRect[2] - artWidth / 2 + (artHeight / 2),
        artRect[3] + artHeight / 2 - (artWidth / 2)
    ];
    board.artboardRect = newArtRect;

    // Rotate objects
    for (var k = 0; k < selection.length; k++) {
        var bnds = selection[k].geometricBounds,
            top = bnds[1] - artRect[1],
            right = bnds[2] - artRect[2],
            left = bnds[0] - artRect[0],
            bottom = bnds[3] - artRect[3];
        // selection[k].rotate(90);
        if (cwAngle.value == true) {
            // rotate 90 CW
            selection[k].rotate(-90);
            selection[k].left = newArtRect[0] + bottom;
            selection[k].top = newArtRect[1] - left;
        } else {
            // rotate 90 CCW
            selection[k].rotate(90);
            selection[k].left = newArtRect[0] - top;
            selection[k].top = newArtRect[1] + right;
        }
    }
    deselect();
}

function deselect() {
    activeDocument.selection = null;
}

function showError(err) {
    if (confirm(scriptName + ': an unknown error has occurred.\n' +
        'Would you like to see more information?', true, 'Unknown Error')) {
        alert(err + ': on line ' + err.line, 'Script Error', true);
    }
}