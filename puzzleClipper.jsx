/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: duplicateMoveToMask.js;
  Copyright (c) 2018

*/
#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
$.each = function (object, callback, reverse) {try {if (object && object.length) {var l = object.length;if (!reverse) for (var i = 0; i < l; i++) callback(object[i], i, object);else while (l--) callback(object[l], l, object);}return $;}catch (e) {$.errorMessage('$.each() - error: ' + e);}};Object.prototype.each = function (callback, reverse) {if (this.length) $.each(this, callback, reverse);return this;};$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};function LA(obj, callback, reverse) {if (!callback) {if (obj instanceof Array) {return obj;}else {var arr = $.getArr(obj);if (arr === obj) {if ($.isColor(obj)) {return obj;}else {return [obj];}}return arr;}}else if (callback instanceof Function) {var arr = $.getArr(obj);if (arr === obj) {arr = [obj];}if (reverse) {var i = arr.length;while (i--) callback(arr[i], i, arr);}else {for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);}return arr;}}$.isArr = function (a) {if ((!a)|| (typeof a === 'string')|| (a.typename === 'Document')|| (a.typename === 'Layer')|| (a.typename === 'PathItem')|| (a.typename === 'GroupItem')|| (a.typename === 'PageItem')|| (a.typename === 'CompoundPathItem')|| (a.typename === 'TextFrame')|| (a.typename === 'TextRange')|| (a.typename === 'GraphItem')|| (a.typename === 'Document')|| (a.typename === 'Artboard')|| (a.typename === 'LegacyTextItem')|| (a.typename === 'NoNNativeItem')|| (a.typename === 'Pattern')|| (a.typename === 'PlacedItem')|| (a.typename === 'PluginItem')|| (a.typename === 'RasterItem')|| (a.typename === 'SymbolItem ')) {return false;}else if (!a.typename && !(a instanceof Array)) {return false;}else {return true;}};$.getArr = function (obj, attr, value) {var arr = [];if ($.isArr(obj)) {for (var i = 0; i < obj.length; i++) {if (attr) {if (value !== undefined) {arr.push(obj[i][attr][value]);}else {arr.push(obj[i][attr]);}}else {arr.push(obj[i]);}}return arr;}else if (attr) {return obj[attr];}else {return obj;}};Object.prototype.group = function() {var obj = LA(this),g = obj[0].parent.groupItems.add();this.appendTo(g);return g;};Object.prototype.appendTo = function (placement) {var obj = LA(this), i = obj.length;while (i--) {if (obj[i].parent !== placement && obj[i] !== placement) {obj[i].moveToBeginning(placement);}}return this;};

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
