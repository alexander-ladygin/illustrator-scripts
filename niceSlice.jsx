/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: niceSlice.jsx;

  Copyright (c) 2018
  www.ladygin.pro

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
$.toArr = function (classCollection, callback) {var arr = [], l = classCollection.length;if (l > 0) {for (var i = 0; i < l; i++) {arr.push(classCollection[i]);}}if (callback instanceof Function) return callback(arr);return arr;}

var scriptName = 'NiceSlice',
    copyright = ' \u00A9 www.ladygin.pro',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    $items = selection;

function ungroup (group) {
    var i = group.pageItems.length;
    if (i > 0) while (i--) group.pageItems[i].moveBefore(group);
    group.remove();
}

function getPosAnchors (anchors, xORy) {
    var arr = [], l = anchors.length;
    for (var i = 0; i < l; i++) {
        arr.push(anchors[i].anchor[xORy]);
    }
    return arr;
}

function niceSlice (item, userOptions) {
    var options = {
        fragments:    10,
        rotate:       20,
        offsetX:      0,
        offsetY:      20,
        gutter:       5,
        randomWidth:  80,
    }.extend(userOptions || {});

    var bnds = item.visibleBounds,
        $w = bnds[2] - bnds[0],
        $h = bnds[1] - bnds[3],
        checkSizeRect = item.parent.pathItems.rectangle(bnds[1], bnds[0], $w, $h);

    checkSizeRect.rotate(options.rotate);
    $w = checkSizeRect.visibleBounds[2] - checkSizeRect.visibleBounds[0];
    $h = checkSizeRect.visibleBounds[1] - checkSizeRect.visibleBounds[3];
    checkSizeRect.remove();

    var __w = $w / options.fragments - options.gutter + options.gutter / options.fragments,
        __h = $h,
        __t = bnds[1] + ($h - (bnds[1] - bnds[3])) / 2,
        __l = bnds[0] - ($w - (bnds[2] - bnds[0])) / 2,
        fragments = [],
        node, group;

    selection = null;

    var gGroup = item.parent.groupItems.add();
    gGroup.move(item, ElementPlacement.PLACEBEFORE);

    for (var i = 0; i < options.fragments; i++) {
        group = gGroup.groupItems.add();

        node = group.pathItems.rectangle(__t, __l + ((__w + options.gutter) * i), __w, __h);
        fragments.push(group);
    }
    gGroup.rotate(options.rotate);
    ungroup(gGroup);

    for (var i = 0; i < options.fragments; i++) {

        item.duplicate().move(fragments[i], ElementPlacement.PLACEATEND);
        fragments[i].clipped = true;
        fragments[i].pageItems[0].clipping = true;

        fragments[i].top -= options.offsetY * (i % 2 === 0 ? -1 : 1);
        fragments[i].left += options.offsetX * (i % 2 === 0 ? -1 : 1);
    }

    item.remove();

    return fragments;
}


var win = new Window('dialog', scriptName + copyright);

with (win.add('panel')) {
    with (add('group')) {
        orientation = 'row';
        alignChildren = 'fill';

        add('statictext', undefined, 'Fragments:');
        var __fragmentsSlider = add('slider', undefined, 10, 1, 20);
        __fragmentsSlider.maximumSize = [1000, 15];
        var __fragments = add('edittext', [0, 0, 50, 25], '10');
    }
}

selection = null;
win.center();
win.show();