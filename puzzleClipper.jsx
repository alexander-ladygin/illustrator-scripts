/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: puzzleClipper.jsx;
  Copyright (c) 2018

*/
#target illustrator
#include './libraries/AI_PS_Library.js';
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var length = selection.length - 1;
    target = selection[length];

selection.each(function (item, i) {
    if (i !== length) {
        var group = item.group();
        target.duplicate(item, ElementPlacement.PLACEAFTER);
        group.clipped = true;
        item.clipping = true;
    }
        else {
            target.remove();
        }
});
