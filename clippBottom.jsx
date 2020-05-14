//  script.name = Bottomclipper.jsx;
//  script.required = at least two paths selected, BOTTOM path is the clipping mask;
//  script.parent = Herman van Boeijen, www.nimbling.com // 22-12-2014;
//  *** LIMITED TO A SINGLE STROKE AND/OR FILL OF THE CLIPPING OBJECT***
//  Big thanks to CarlosCanto and MuppetMark on the Adobe Illustrator Scripting Forums
// special modification for bundling with the TrimMasks.jsx script by Sergey Osokin (https://github.com/creold/illustrator-scripts#trimmasks)

function start (sel, count, mask) {
    if (count) {
        if(activeDocument.activeLayer.locked || !activeDocument.activeLayer.visible){
            alert('Please select objects on an unlocked and visible layer!');
        } else {
            if (mask.typename === 'GroupItem' && mask.clipped) {
                for (i = count - 2; i >= 0; i--) {
                    sel[i].move (mask, ElementPlacement.PLACEATBEGINNING);
                }
                return;
            }

            if (mask.typename === 'CompoundPathItem') {
                mask = sel[count - 1].pathItems[0];
            }

            for (i = count - 1 ; i >= 0; i--) {
                sel[i].move(sel[count - 1], ElementPlacement.PLACEAFTER);
            }

            app.executeMenuCommand('makeMask');

            if (mask.typename === 'CompoundPathItem') {
                mask = mask.pageItems[0].pathItems[0];
            }
        }
    }
}

if (!app.documents.length) {
    alert('You must open at least one document.');
} else if (selection.length <= 1) {
    alert('Please select two or more objects!');
} else {
    var sel = activeDocument.selection,
        clipObjOriginal = sel[sel.length - 1],
        clipObj = clipObjOriginal.duplicate(clipObjOriginal, ElementPlacement.PLACEBEFORE);

    clipObjOriginal.selected = false;

    start(selection, selection.length, clipObj);
}