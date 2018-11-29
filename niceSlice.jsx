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
        folder: Folder.myDocuments + '/'
    };

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
        orientation: 'x',
        fragments:    10,
        rotate:       20,
        gutter:       50
    }.extend(userOptions || {});

    var bnds = item.visibleBounds,
        isOX = (options.orientation === 'x');
        // checkSizeRect = item.parent.pathItems.rectangle(bnds[1], bnds[0], $w, $h);

    // checkSizeRect.rotate(options.rotate);

    // var pointsX = getPosAnchors(checkSizeRect.pathPoints, 0).sort(function (a, b) { return a > b; }),
    //     pointsY = getPosAnchors(checkSizeRect.pathPoints, 1).sort(function (a, b) { return a < b; });

    var __extraSize = {
            // w: (item.width <= item.height && isOX ? pointsX[2] - pointsX[0] : 0),
            // h: (item.width >= item.height && !isOX ? pointsY[0] - pointsY[2] : 0),
            w: 0,
            h: 0,
        };

    // if (__extraSize.w < 0) __extraSize.w *= -1;
    // if (__extraSize.h < 0) __extraSize.h *= -1;
    // // __extraSize.w /= 1.5;
    // // __extraSize.h /= 1.3;
    // if (isOX) __extraSize.w -= options.gutter;
    // if (!isOX) __extraSize.h += options.gutter;
    // checkSizeRect.remove();

    var __adv = 4,
        $w = bnds[2] - bnds[0],
        $h = bnds[1] - bnds[3],
        __w = $w * (!isOX ? __adv : 1) / (isOX ? options.fragments : 1) - (isOX ? options.gutter : 0) + (isOX ? options.gutter / options.fragments : 0),
        __h = $h * (isOX ? __adv : 1) / (!isOX ? options.fragments : 1) - (!isOX ? options.gutter : 0) + (!isOX ? options.gutter / options.fragments : 0),
        // __t = bnds[1] + (isOX ? ($h * __adv - $h) / 2 : 0) + (!isOX ?  + (__h + options.gutter) * 2 : 0),
        // __l = bnds[0] - (!isOX ? (($w * __adv - $w) / 2) : 0) - (isOX ? (__w + options.gutter) * 2 : 0),
        __t = bnds[1] + (isOX ? (__h - $h) / 2 : 0),
        __l = bnds[0] - (!isOX ? (__w * $w) / 2 : 0),
        fragments = [],
        rectgls = [],
        node, group;

    selection = null;

    group = item.parent.groupItems.add();
    for (var i = 0; i < options.fragments; i++) {
        // var pt = item.parent.pathItems.rectangle(__t - (!isOX ? (__h + options.gutter) * i : 0), __l + (isOX ? (__w + options.gutter) * i : 0), __w, __h);
        // pt.rotate(options.rotate, false, true, true, true);
        rectgls.push(group.pathItems.rectangle(__t - (!isOX ? (__h + options.gutter) * i : 0), __l + (isOX ? (__w + options.gutter) * i : 0), __w, __h));
    }
    group.rotate(options.rotate);
    var cmask = item.parent.pathItems.rectangle(bnds[1], bnds[0], $w, $h);
    cmask.moveToBeginning(group);
    group.clipped = true;
    cmask.clipping = true;
    // return; 
    group.selected = true;
    app.executeMenuCommand('Live Pathfinder Merge');
    app.executeMenuCommand('expandStyle');
    ungroup(selection[0]);
    rectgls = selection;
    selection = null;
    // return;

    for (var i = 0; i < options.fragments; i++) {
        selection = null;
        group = item.parent.groupItems.add();
        group.move(item, ElementPlacement.PLACEBEFORE);

        node = item.duplicate();
        node.moveToBeginning(group);
        rectgls[i].moveToBeginning(group);

        fragments.push(group);

        group.clipped = true;
        rectgls[i].clipping = true;

        // group.selected = true;
        // app.executeMenuCommand('Live Pathfinder Merge');
        // app.executeMenuCommand('expandStyle');
    }

    item.hidden = true;

    return fragments;
}


var fg = niceSlice(selection[0]);
