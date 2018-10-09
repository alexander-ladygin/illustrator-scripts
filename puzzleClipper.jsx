/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: puzzleClipper.jsx;
  Copyright (c) 2018

*/
#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var items = selection,
    i = items.length - 1,
    target = selection[i],
    isGroup = false;

if (i > 0) {
    if (i === 1 && selection[0].typename === 'GroupItem') {
        items = selection[0].pageItems;
        i = items.length;
        isGroup = selection[0];
    }

    while (i--) {
        // create and move to group
        var group = activeDocument.groupItems.add();
        group.move((isGroup ? target : items[i]), ElementPlacement[(isGroup ? 'PLACEBEFORE' : 'PLACEAFTER')]);

        // duplicate target object and move items
        target.duplicate().moveToBeginning(group);
        items[i].moveToBeginning(group);

        // set properties
        group.clipped = true;
        if (!isGroup) items[i].clipping = true;
    }

    if (isGroup) isGroup.remove();
    target.remove();
}
