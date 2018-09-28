/* 

  Program version: Adobe Illustrator CS5+
  Name: artboardItemsMoveToNewLayer.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro
  Copyright (c) 2018

*/

// move selection
    var arts = activeDocument.artboards,
        selectionBak = selection,
        l = arts.length;

    selection = null;

    function __move (items) {
        var layer = activeDocument.layers.add(),
            j = items.length;

        while (j--) {
            items[j].moveToBeginning(layer);
        }
    }

    for (var i = 0; i < l; i++) {
        activeDocument.artboards.setActiveArtboardIndex(i);
        activeDocument.selectObjectsOnActiveArtboard();
        __move(selection);
        selection = null;
    }

// remove empty layers and sublayers
    function removeEmptyLayers (layers) {
        var n = layers.length,
            isEmpty = true;
        
        while (n--) {
            if (layers[n].layers.length) isEmpty = removeEmptyLayers(layers[n].layers);
            if (isEmpty && !layers[n].pageItems.length) layers[n].remove();
        }

        return isEmpty;
    }

    removeEmptyLayers(activeDocument.layers);

// restore selection
    selection = selectionBak;