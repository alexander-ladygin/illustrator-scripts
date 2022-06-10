/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CS5+
  Name: griddder.jsx;

  Copyright (c) 2018
  www.ladyginpro.ru

*/

$.errorMessage = function (err) {alert(err + '\n' + err.line);};
function LA(obj, callback, reverse) {if (!callback) {if (obj instanceof Array) {return obj;}else {var arr = $.getArr(obj);if (arr === obj) {if ($.isColor(obj)) {return obj;}else {return [obj];}}return arr;}}else if (callback instanceof Function) {var arr = $.getArr(obj);if (arr === obj) {arr = [obj];}if (reverse) {var i = arr.length;while (i--) callback(arr[i], i, arr);}else {for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);}return arr;}}
$.each = function (object, callback, reverse) {try {if (object && object.length) {var l = object.length;if (!reverse) for (var i = 0; i < l; i++) callback(object[i], i, object);else while (l--) callback(object[l], l, object);}return $;}catch (e) {$.errorMessage('$.each() - error: ' + e);}};
Object.prototype.each = function (callback, reverse) {if (this.length) $.each(this, callback, reverse);return this;};
Object.prototype.getChildsByFilter = function (filterCallback, returnFirst) {filterCallback = filterCallback instanceof Function ? filterCallback : function () { return true; };var arr = [], items = LA(this),l = items.length;for (var i = 0; i < l; i++) {if (items[i].typename === 'GroupItem') {arr = arr.concat(LA(items[i].pageItems).getChildsByFilter(filterCallback));}else if (filterCallback(items[i])) {arr.push(items[i]);if (returnFirst) return arr;}}return arr;};
$.isArr = function (a) {if ((!a)|| (typeof a === 'string')|| (a.typename === 'Document')|| (a.typename === 'Layer')|| (a.typename === 'PathItem')|| (a.typename === 'GroupItem')|| (a.typename === 'PageItem')|| (a.typename === 'CompoundPathItem')|| (a.typename === 'TextFrame')|| (a.typename === 'TextRange')|| (a.typename === 'GraphItem')|| (a.typename === 'Document')|| (a.typename === 'Artboard')|| (a.typename === 'LegacyTextItem')|| (a.typename === 'NoNNativeItem')|| (a.typename === 'Pattern')|| (a.typename === 'PlacedItem')|| (a.typename === 'PluginItem')|| (a.typename === 'RasterItem')|| (a.typename === 'MeshItem')|| (a.typename === 'SymbolItem')) {return false;}else if (!a.typename && !(a instanceof Array)) {return false;}else {return true;}};
$.getArr = function (obj, attr, value, exclude) {var arr = [];function checkExclude (item) {if (exclude !== undefined) {var j = exclude.length;while (j--) if (exclude[j] === item) return true;}return false;}if ($.isArr(obj)) {for (var i = 0; i < obj.length; i++) {if (!checkExclude(obj[i])) {if (attr) {if (value !== undefined) {arr.push(obj[i][attr][value]);}else {arr.push(obj[i][attr]);}}else {arr.push(obj[i]);}}}return arr;}else if (attr) {return obj[attr];}else {return obj;}};
$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};
$.appName = {indesign: (BridgeTalk.appName.toLowerCase() === 'indesign'),photoshop: (BridgeTalk.appName.toLowerCase() === 'photoshop'),illustrator: (BridgeTalk.appName.toLowerCase() === 'illustrator')};
$.color = function (a, v) {if (a) {if (typeof a === 'string') {a = a.toLowerCase();}}else {return undefined;}if ((a === 'hex') && $.appName.illustrator) {if (!v) {return new RGBColor();}else {if (v === 'random') return $.color('rgb', v);else return $.hexToColor(v, 'RGB');}}else if ((a === 'cmyk') || (a === 'cmykcolor')) {var c = new CMYKColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}c.cyan = parseInt(b[0]);c.magenta = parseInt(b[1]);c.yellow = parseInt(b[2]);c.black = parseInt(b[3]);}return c;}else if ((a === 'rgb') || (a === 'rgbcolor') || ((a === 'hex') && $.appName.photoshop)) {var c = new RGBColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLowerCase() === 'random') {b = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];}else {for (var i = 0; i < b.length; i++) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}}if ($.appName.photoshop) {if (a !== 'hex' || (typeof v === 'string' && v.toLowerCase() === 'random')) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}else {c.hexValue = b[0];}}else if ($.appName.illustrator) {c.red = parseInt(b[0]);c.green = parseInt(b[1]);c.blue = parseInt(b[2]);}}return c;}else if ((a === 'gray') || (a === 'grayscale') || (a === 'grayscale') || (a === 'graycolor')) {var c = new GrayColor(), b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLowerCase() === 'random') {b = Math.floor(Math.random() * 100);}c.gray = parseInt(b[0] || b);}return c;}else if ((a === 'lab') || (a === 'labcolor')) {var c = new LabColor(), value, b = [];if (v) {b = b.concat(v);if (typeof v === 'string' && v.toLowerCase() === 'random') {b = [Math.floor(Math.random() * 100), Math.floor(-128 + Math.random() * 256), Math.floor(-128 + Math.random() * 256)];}else {for (var i = 0; i < b.length; i++) {if (i === 0) {if (b[i] === 'random') {b[i] = Math.floor(Math.random() * 100);}}else {if (b[i] === 'random') {b[i] = Math.floor(-128 + Math.random() * 256);}}}}c.l = parseInt(b[0]);c.a = parseInt(b[1]);c.b = parseInt(b[2]);}return c;}else if ((a === 'spot') || (a === 'spotcolor')) {var c = new SpotColor(), b = [];if (v) {b = b.concat(v);c.tint = parseInt(b[1]);}return c;}else if ((a === 'gradient') || (a === 'Gradient') || (a === 'GradientColor')) {var c = app.activeDocument.gradients.add(), g = new GradientColor(), b = [];if (v) {b = b.concat(v);for (var i = 0; i < b.length; i++) {c.gradientStops[i].color = $.color(b[i][0], b[i][1]);}g.gradient = c;}return g;}else if ((a === 'no') || (a === 'nocolor')) {return new NoColor();}};
$.toHex = function (color, hash) {if (color.typename !== 'RGBColor' && $.appName.illustrator) {color = $.convertColor(color, 'RGB');}return (hash ? '#' : '') + to(color.red) + to(color.green) + to(color.blue);function to(val) {var hex = val.toString(16);return hex.length === 1 ? '0' + hex : hex;}};
$.hexToColor = function (color, type) {color = color.toLowerCase();color = correct(color);function correct(a) {var l, b = '000000';if (a[0] === '#') {a = a.slice(1);}l = a.length;a = a + b.slice(l);return a;}return $.convertColor($.color('rgb', [parseInt((gc(color)).slice(0, 2), 16), parseInt((gc(color)).slice(2, 4), 16), parseInt((gc(color)).slice(4, 6), 16)]), type || 'rgb');function gc(h) {return (h.slice(0, 1) === '#') ? h.slice(1, 7) : h;}};
$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};
$.getColorValues = function (color) {if (color === undefined) {return undefined;}else if (color.typename === 'CMYKColor') {return [color.cyan, color.magenta, color.yellow, color.black];}else if (color.typename === 'RGBColor') {return [color.red, color.green, color.blue];}else if (color.typename === 'LabColor') {return [color.l, color.a, color.b];}else if (color.typename === 'SpotColor') {return [color.spotl, color.tint];}else if (color.typename === 'GrayColor') {return [color.gray];}else if (color.typename === 'NoColor') {return undefined;}else if (color.typename === 'GradientColor') {var colors = [], gradients = color.gradient.gradientStops;for (var i = 0; i < gradients.length; i++) {colors = colors.concat(gradients[i].color.getColorValues());}return colors;}};
CMYKColor.prototype.getColorValues = function () {return $.getColorValues(this);};
RGBColor.prototype.getColorValues = function () {return $.getColorValues(this);};
GrayColor.prototype.getColorValues = function () {return $.getColorValues(this);};
LabColor.prototype.getColorValues = function () {return $.getColorValues(this);};
NoColor.prototype.getColorValues = function () {return $.getColorValues(this);};
$.getUnits = function (val, def) {try {return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};
$.convertUnits = function (obj, b) {if (obj === undefined) {return obj;}if (b === undefined) {b = 'px';}if (typeof obj === 'number') {obj = obj + 'px';}if (typeof obj === 'string') {var unit = $.getUnits(obj),val = parseFloat(obj);if (unit && !isNaN(val)) {obj = val;}else if (!isNaN(val)) {obj = val; unit = 'px';}}if ($.appName.illustrator) {if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {obj = parseFloat(obj) / 2.83464566929134;}else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {obj = parseFloat(obj) / (2.83464566929134 * 10);}else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {obj = parseFloat(obj) / 72;}else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134;}else if ((unit === 'mm') && (b === 'cm')) {obj = parseFloat(obj) * 10;}else if ((unit === 'mm') && (b === 'in')) {obj = parseFloat(obj) / 25.4;}else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 2.83464566929134 * 10;}else if ((unit === 'cm') && (b === 'mm')) {obj = parseFloat(obj) / 10;}else if ((unit === 'cm') && (b === 'in')) {obj = parseFloat(obj) * 2.54;}else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {obj = parseFloat(obj) * 72;}else if ((unit === 'in') && (b === 'mm')) {obj = parseFloat(obj) * 25.4;}else if ((unit === 'in') && (b === 'cm')) {obj = parseFloat(obj) * 25.4;}return parseFloat(obj);}else if ($.appName.photoshop) {return parseFloat(obj);}};
String.prototype.getUnits = function () {try {var str = this.slice(-2),u = ['px', 'pt', 'mm', 'cm', 'in', 'pc'];for (var i = 0; i < u.length; i++) {if (str === u[i]) {return u[i];}}return false;}catch (e) {$.errorMessage('check units: " ' + e + ' "');}};
String.prototype.convertUnits = function (b) {return $.convertUnits(this.toString(), b);};
String.prototype.hexEncode = function () {var s = unescape(encodeURIComponent(this)), h = '';for (var i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16);return h;};
String.prototype.hexDecode = function () {var s = '';for (var i = 0; i < this.length; i += 2) s += String.fromCharCode(parseInt(this.substr(i, 2), 16));return decodeURIComponent(escape(s));};
Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};
Object.prototype.getNearby = function (prevOrNext) {var parent = this.parent,items = parent.pageItems,l = items.length;prevOrNext = prevOrNext || 'next';for (var i = 0; i < l; i++) {if (items[i] === this) {return (((prevOrNext === 'next') && (i + 1 < l)) ? items[i + 1] : (((prevOrNext === 'prev') && (i - 1 >= 0)) ? items[i - 1] : undefined));}}}
function parseMargin (value, ifErrReturnValue) {value = (typeof value === 'string' ? value.split(' ') : (value instanceof Array ? value : ''));if (!value.length) return ifErrReturnValue !== undefined ? ifErrReturnValue : [0, 0, 0, 0];if (value.length === 2) {value[2] = value[0];value[3] = value[1];}else if (value.length < 4) {var val = value[value.length - 1];for (var i = value.length; i < 4; i++) {value[i] = val;}}for (var i = 0; i < value.length; i++) {value[i] = $.convertUnits(value[i], 'px');}return value;}
function getBounds (items, bounds) {bounds = bounds || 'geometricBounds'; bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;var l = items.length, x = [], y = [], w = [], h = [];for (var i = 0; i < l; i++) {x.push(items[i][bounds][0]);y.push(items[i][bounds][1]);w.push(items[i][bounds][2]);h.push(items[i][bounds][3]);};return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];}
Object.prototype.align = function (preset, userOptions) {var obj = LA(this),options = {bounds: 'geometric',margin: '0 0 0 0',artboard: activeDocument.artboards.getActiveArtboardIndex(),object: {node: undefined,offset: 'outline',bounds: 'geometric'},}.extend(userOptions || {}, true);function process(item, obj_length) {var rect = activeDocument.artboards[options.artboard].artboardRect,m = options.margin, distance = 0,gb = item.geometricBounds, vb = item.visibleBounds,w = item.width / 2, h = item.height / 2,offset = options.object.offset.slice(0, 1).toLowerCase();if (options.bounds.slice(0, 1).toLowerCase() === 'v') {distance = vb[2] - gb[2];}if (!options.object || !options.object.node) {if (preset === 'top') {item.position = [item.position[0], rect[1] - distance - m[0]];}else if (preset === 'right') {item.position = [rect[2] - (w * 2) - distance - m[1], item.position[1]];}else if (preset === 'bottom') {item.position = [item.position[0], rect[3] + (h * 2) + distance + m[2]];}else if (preset === 'left') {item.position = [rect[0] + distance + m[3], item.position[1]];}else if (preset === 'vcenter') {item.position = [item.position[0], (rect[3] + rect[1]) / 2 + h];}else if (preset === 'hcenter') {item.position = [(rect[2] + rect[0]) / 2 - w, item.position[1]];}else if (preset === 'topleft') {item.position = [rect[0] + distance + m[3], rect[1] - distance - m[0]];}else if (preset === 'topcenter') {item.position = [(rect[2] + rect[0]) / 2 - w, rect[1] - distance - m[0]];}else if (preset === 'topright') {item.position = [rect[2] - (w * 2) - distance - m[1], rect[1] - distance - m[0]];}else if (preset === 'middleright') {item.position = [rect[2] - (w * 2) - distance - m[2], (rect[3] + rect[1]) / 2 + h];}else if (preset === 'bottomright') {item.position = [rect[2] - (w * 2) - distance - m[1], rect[3] + (h * 2) + distance + m[2]];}else if (preset === 'bottomcenter') {item.position = [(rect[2] + rect[0]) / 2 - w, rect[3] + (h * 2) + distance + m[2]];}else if (preset === 'bottomleft') {item.position = [rect[0] + distance + m[3], rect[3] + (h * 2) + distance + m[2]];}else if (preset === 'middleleft') {item.position = [rect[0] + distance + m[3], (rect[3] + rect[1]) / 2 + h];}else if (preset === 'center') {item.position = [(rect[2] + rect[0]) / 2 - w, (rect[3] + rect[1]) / 2 + h];}}else {if ((obj_length === 1) || (options.object.node === 'current') || (item !== options.object.node)) {var obn = options.object.node;if (!obn.typename && obn instanceof Array) {var b = bgeo = getBounds(obn, 'geometricBounds');if (options.object.bounds.slice(0, 1).toLowerCase() === 'v') {b = getBounds(obn, 'visibleBounds');bgeo[2] = b[2] - b[0];}var objt = b[1], objl = b[0],objw = b[2] - b[0], objh = b[1] - b[3],node_distance = 0, distance_count, ow = w, oh = h, count = -2;}else if (options.object.node.typename !== 'Artboard') {if (options.object.node === 'current') {var obn = item;}var b = bgeo = obn.geometricBounds,objt = obn.top, objl = obn.left,objw = obn.width, objh = obn.height,node_distance = 0, distance_count, ow = w, oh = h, count = -2;if (options.object.bounds.slice(0, 1).toLowerCase() === 'v') {b = obn.visibleBounds;}}else {var b = bgeo = obn.artboardRect,objt = b[1], objl = b[0],objw = b[2] - b[0], objh = -b[3],node_distance = 0, ow = w, oh = h, count = -2;}if (offset === 'i') {var ow = 0, oh = 0, count = 2;}else {for (var i = 0; i < m.length; i++) {m[i] = -m[i];}}if (offset !== 'i') {distance_count = -distance;}function getpos() {return {top: b[1] + distance + node_distance - m[0] - (oh * count),right: b[2] + distance + node_distance - m[1] - (ow * count),bottom: b[3] - distance - node_distance + m[2] + (oh * count),left: b[0] - distance - node_distance + m[3] + (ow * count)}}if (preset === 'top') {item.position = [item.position[0], getpos().top];}else if (preset === 'right') {offset === 'i' ? ow = w : ow = 0;item.position = [getpos().right, item.position[1]];}else if (preset === 'bottom') {offset === 'i' ? oh = h : oh = 0;item.position = [item.position[0], getpos().bottom];}else if (preset === 'left') {item.position = [getpos().left, item.position[1]];}else if (preset === 'vcenter') {item.position = [item.position[0], bgeo[1] - (objh / 2) + h];}else if (preset === 'hcenter') {item.position = [bgeo[0] + (objw / 2) - w, item.position[1]];}else if (preset === 'topleft') {item.position = [getpos().left, getpos().top];}else if (preset === 'topcenter') {item.position = [bgeo[0] + (objw / 2) - w, getpos().top];}else if (preset === 'topright') {offset === 'i' ? ow = w : ow = 0;item.position = [getpos().right, getpos().top];}else if (preset === 'middleright') {offset === 'i' ? ow = w : ow = 0;item.position = [getpos().right, bgeo[1] - (objh / 2) + h];}else if (preset === 'bottomright') {offset === 'i' ? ow = w : ow = 0;offset === 'i' ? oh = h : oh = 0;item.position = [getpos().right, getpos().bottom];}else if (preset === 'bottomcenter') {offset === 'i' ? oh = h : oh = 0;item.position = [bgeo[0] + (objw / 2) - w, getpos().bottom];}else if (preset === 'bottomleft') {offset === 'i' ? oh = h : oh = 0;item.position = [getpos().left, getpos().bottom];}else if (preset === 'middleleft') {item.position = [getpos().left, bgeo[1] - (objh / 2) + h];}else if (preset === 'center') {item.position = [bgeo[0] + (objw / 2) - w, bgeo[1] - (objh / 2) + h];}}}}options.margin = parseMargin(options.margin);for (var i = 0; i < obj.length; i++) {process(obj[i], obj.length);}return this;};
Object.prototype.appendTo = function (relativeObject, elementPlacement) {var obj = LA(this), i = obj.length;if (typeof elementPlacement === 'string' && elementPlacement.length) {switch (elementPlacement.toLowerCase()) {case 'inside': elementPlacement = 'INSIDE'; break;case 'begin': elementPlacement = 'PLACEATBEGINNING'; break;case 'end': elementPlacement = 'PLACEATEND'; break;case 'before': elementPlacement = 'PLACEBEFORE'; break;case 'after': elementPlacement = 'PLACEAFTER'; break;default: elementPlacement = '';}}while (i--) {if (obj[i].parent !== relativeObject && obj[i] !== relativeObject) {if (!elementPlacement) obj[i].moveToBeginning(relativeObject);else obj[i].move(relativeObject, ElementPlacement[elementPlacement]);}}return this;};
Object.prototype.group = function (options) {var obj = LA(this),g = obj[0].parent.groupItems.add();this.appendTo(g);return g;};
Object.prototype.ungroup = function () {var arr = [], obj = LA(this);for (var i = 0; i < obj.length; i++) {if (obj[i].typename === 'GroupItem') {var j = obj[i].pageItems.length;while (j--) {arr = arr.concat(obj[i].pageItems[0]);obj[i].pageItems[0].moveBefore(obj[i]);}obj[i].remove();}else {arr = arr.concat(obj[i]);}}return arr;};
Object.prototype.getExactSize = function (property, bounds) {bounds = bounds || 'geometricBounds';bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;var values = [],item = this,bounds = item[bounds],propertyArr = property.replace(/ /g, '').split(','),i = propertyArr.length;if (bounds) {while (i--) {if (propertyArr[i] === 'width') values.push(bounds[2] - bounds[0]);if (propertyArr[i] === 'height') values.push(bounds[1] - bounds[3]);}}return values.length === 1 ? values[0] : values;};


var scriptName = 'Griddder',
    copyright = ' \u00A9 www.ladyginpro.ru',
    settingFile = {
        name: scriptName + '__setting.json',
        folder: Folder.myDocuments + '/LA_AI_Scripts/'
    },
    $margins = '0',
    $cropMarksColor = {
        type: 'CMYKColor',
        values: [0, 0, 0, 100]
    };

function checkEffects() {
    var testPath = activeDocument.pathItems.add(),
        value = (testPath.applyEffect instanceof Function);

    testPath.remove();
    return value;
}

var effectsEnabled = checkEffects();

Object.prototype.griddder = function (userOptions) {
    try {
        var options = {
            columns: 1,
            rows: 1,
            gutter: {
                columns: 0,
                rows: 0
            },
            group: 'only_cropmarks',
            align: 'center',
            bounds: 'visible',
            fitToArtboard: false,
            margin: '0mm 0mm 0mm 0mm',
            cropMarks: {
                size: 5,
                offset: 0,
                position: 'relative',
                enabled: false,
                attr: {
                    strokeWidth: 1,
                    strokeColor: {
                        type: 'cmyk',
                        values: [100, 100, 100, 100]
                    }
                }
            }
        }.extend(userOptions || {}, true);

        options.align = options.align.toLowerCase();
        // convert units
        options.gutter.rows = $.convertUnits(options.gutter.rows, 'px');
        options.gutter.columns = $.convertUnits(options.gutter.columns, 'px');
        options.cropMarks.size = $.convertUnits(options.cropMarks.size, 'px');
        options.cropMarks.offset = $.convertUnits(options.cropMarks.offset, 'px');
        options.cropMarks.attr.strokeWidth = $.convertUnits(options.cropMarks.attr.strokeWidth, 'px');


        var groupItems,
            cropMarksGroup,
            items = LA(this),
            collection = [],
            marksCollection = [],
            columns = options.columns,
            rows = options.rows,
            gutter = options.gutter,
            align = options.align,
            fitToArtboard = options.fitToArtboard,
            bounds = options.bounds,
            art = activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()],
            margin = parseMargin(options.margin),
            marksPos = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? options.cropMarks.offset : 0),
            marksPoscolumns = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? gutter.rows / 2 : 0),
            marksPosrows = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? options.cropMarks.offset + gutter.columns : 0);


        if (!columns && !rows && !fitToArtboard) return this;

        function createCropMark(coords) {
            var mark = cropMarksGroup.pathItems.add();
            mark.setEntirePath(coords);
            mark.filled = false;
            mark.strokeColor = $.color(options.cropMarks.attr.strokeColor.type, options.cropMarks.attr.strokeColor.values);
            mark.strokeWidth = options.cropMarks.attr.strokeWidth;
            marksCollection.push(mark);
        }

        function getItemMask(obj) {
            var itemMask = obj.getChildsByFilter(function (mask) { return mask.clipping; }, true);
            return itemMask.length ? itemMask[0] : obj;
        }


        items.each(function (item, counter, arr) {


            var itemMask = getItemMask(item),
                itemSize = {
                    width: itemMask.getExactSize('width', bounds) + gutter.columns,
                    height: itemMask.getExactSize('height', bounds) + gutter.rows
                },
                itemBounds = itemMask[bounds + 'Bounds'],
                artSize = {
                    width: (art.artboardRect[2] - art.artboardRect[0]) - margin[1] - margin[3],
                    height: (-(art.artboardRect[3] - art.artboardRect[1])) - margin[0] - margin[2]
                },
                isRotate = false,
                group = item.group();
            cropMarksGroup = options.cropMarks.enabled && options.group !== 'none' ? group.groupItems.add() : group;

            if (fitToArtboard) {
                // landscape
                var landscape = {
                    columns: Math.floor(artSize.width / itemSize.width),
                    rows: Math.floor(artSize.height / itemSize.height)
                };
                landscape.columns = (itemSize.width * landscape.columns) > artSize.width ? landscape.columns - 1 : landscape.columns;
                landscape.rows = (itemSize.height * landscape.rows) > artSize.height ? landscape.rows - 1 : landscape.rows;

                // portrait
                var portrait = {
                    columns: Math.floor(artSize.width / itemSize.height),
                    rows: Math.floor(artSize.height / itemSize.width)
                };


                portrait.columns = (itemSize.height * portrait.columns) > artSize.width ? portrait.columns - 1 : portrait.columns;
                portrait.rows = (itemSize.width * portrait.rows) > artSize.height ? portrait.rows - 1 : portrait.rows;


                if (portrait.columns * portrait.rows > landscape.columns * landscape.rows) {
                    isRotate = true;
                    columns = portrait.columns;
                    rows = portrait.rows;
                }
                else {
                    columns = landscape.columns;
                    rows = landscape.rows;
                }
            }

            if (isRotate) {
                group.rotate(90);
                var w = itemSize.width;
                itemSize.width = itemSize.height;
                itemSize.height = w;
            }

            var useEffects = (effectsEnabled && __useEffect.value);

            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < rows; j++) {
                    var s = (!i && !j ? item : (!effectsEnabled || !__useEffect.value ? item.duplicate() : item)),
                        bnds = getItemMask(s)[bounds + 'Bounds'];

                    collection.push(s);

                    if (!effectsEnabled || !__useEffect.value) {
                        s.left += (itemSize.width * i);
                        s.top -= (itemSize.height * j);
                    } else if (effectsEnabled && __useEffect.value) {
                        bnds = [
                            bnds[0] + (itemSize.width * i),
                            bnds[1] - (itemSize.height * j),
                            bnds[2] + (itemSize.width * i),
                            bnds[3] - (itemSize.height * j)
                        ];
                    }


                    // columns
                    if ((options.cropMarks.enabled || (effectsEnabled && __useEffect.value)) && !i) {
                        // first
                        if (gutter.rows || !j) createCropMark([
                            [bnds[0] - (!useEffects ? options.cropMarks.offset : 0), bnds[1] + (!j ? marksPos : 0)],
                            [bnds[0] - (!useEffects ? options.cropMarks.size : 0) - (!useEffects ? options.cropMarks.offset : 0), bnds[1] + (!j ? marksPos : 0)]
                        ]);
                        createCropMark([
                            [bnds[0] - (!useEffects ? options.cropMarks.offset : 0), bnds[3] + (j === rows - 1 ? -marksPos : 0)],
                            [bnds[0] - (!useEffects ? options.cropMarks.size : 0) - (!useEffects ? options.cropMarks.offset : 0), bnds[3] + (j === rows - 1 ? -marksPos : 0)]
                        ]);
                        // last
                        if (gutter.rows || !j) createCropMark([
                            [bnds[0] + itemSize.width * columns - gutter.rows + (!useEffects ? options.cropMarks.offset : 0), bnds[1] + (!j ? marksPos : 0)],
                            [bnds[0] + (!useEffects ? options.cropMarks.size : 0) + itemSize.width * columns - gutter.rows + (!useEffects ? options.cropMarks.offset : 0), bnds[1] + (!j ? marksPos : 0)]
                        ]);
                        // lastEnd
                        createCropMark([
                            [bnds[0] + itemSize.width * columns - gutter.rows + (!useEffects ? options.cropMarks.offset : 0), bnds[3] + (j === rows - 1 ? -marksPos : 0)],
                            [bnds[0] + (!useEffects ? options.cropMarks.size : 0) + itemSize.width * columns - gutter.rows + (!useEffects ? options.cropMarks.offset : 0), bnds[3] + (j === rows - 1 ? -marksPos : 0)]
                        ]);
                    }
                    // rows
                    if ((options.cropMarks.enabled || (effectsEnabled && __useEffect.value)) && !j) {
                        // first
                        if (gutter.columns || !i) createCropMark([
                            [bnds[0] + (!i ? -marksPos : 0), bnds[1] + gutter.columns + (!useEffects ? options.cropMarks.offset : 0) - gutter.columns],
                            [bnds[0] + (!i ? -marksPos : 0), bnds[1] + gutter.columns + (!useEffects ? options.cropMarks.size : 0) + (!useEffects ? options.cropMarks.offset : 0) - gutter.columns]
                        ]);
                        createCropMark([
                            [bnds[2] + (i === columns - 1 ? marksPos : 0), bnds[1] + gutter.columns + (!useEffects ? options.cropMarks.offset : 0) - gutter.columns],
                            [bnds[2] + (i === columns - 1 ? marksPos : 0), bnds[1] + gutter.columns + (!useEffects ? options.cropMarks.size : 0) + (!useEffects ? options.cropMarks.offset : 0) - gutter.columns]
                        ]);
                        // last
                        if (gutter.columns || !i) createCropMark([
                            [bnds[0] + (!i ? -marksPos : 0), bnds[1] - itemSize.height * rows - (!useEffects ? options.cropMarks.offset : 0) + gutter.columns],
                            [bnds[0] + (!i ? -marksPos : 0), bnds[1] - itemSize.height * rows - (!useEffects ? options.cropMarks.size : 0) - (!useEffects ? options.cropMarks.offset : 0) + gutter.columns]
                        ]);
                        // lastEnd
                        createCropMark([
                            [bnds[2] + (i === columns - 1 ? marksPos : 0), bnds[1] - itemSize.height * rows - (!useEffects ? options.cropMarks.offset : 0) + gutter.columns],
                            [bnds[2] + (i === columns - 1 ? marksPos : 0), bnds[1] - itemSize.height * rows - (!useEffects ? options.cropMarks.size : 0) - (!useEffects ? options.cropMarks.offset : 0) + gutter.columns]
                        ]);
                    }
                }
            }

            if (effectsEnabled && __useEffect.value) {
                var createGroup = true;
                if (columns > 1) {
                    item.applyEffect('<LiveEffect name="Adobe Transform"><Dict data="B transformPatterns 0 B transformObjects 1 R scaleV_Percent 100 R scaleH_Percent 100 R scaleH_Factor 1 R scaleV_Factor 1 R rotate_Degrees 0 R moveV_Pts 0 R moveH_Pts ' + itemSize.width + ' R rotate_Radians 0 I numCopies ' + (columns - 1) + ' I pinPoint 4 B randomize 0 B reflectX 0 B reflectY 0 B scaleLines 0"/></LiveEffect>');
                } else {
                    createGroup = false;
                }

                if (rows > 1) {
                    var itemGroup = item;
                    if (createGroup) {
                        itemGroup = activeDocument.groupItems.add();
                        itemGroup.moveBefore(item, ElementPlacement.PLACEBEFORE);
                        item.moveToBeginning(itemGroup);
                    }
                    itemGroup.applyEffect('<LiveEffect name="Adobe Transform"><Dict data="B transformPatterns 0 B transformObjects 1 R scaleV_Percent 100 R scaleH_Percent 100 R scaleH_Factor 1 R scaleV_Factor 1 R rotate_Degrees 0 R moveV_Pts ' + -itemSize.height + ' R moveH_Pts 0 R rotate_Radians 0 I numCopies ' + (rows - 1) + ' I pinPoint 4 B randomize 0 B reflectX 0 B reflectY 0 B scaleLines 0"/></LiveEffect>');
                }
            }

            if (fitToArtboard && !(effectsEnabled && __useEffect.value)) {
                group.align('center', {
                    bounds: 'visible'
                });
            } else if (!fitToArtboard && typeof options.align === 'string' && options.align.toLowerCase() !== 'none') {
                group.align(options.align);
            }

            if (effectsEnabled && __useEffect.value) {
                group.align(fitToArtboard ? 'center' : options.align);

                if (!options.cropMarks.enabled) {
                    marksCollection.each(function (item) {
                        item.remove();
                    });
                }
            }

            if (options.group === 'items_and_cropmarks_singly') {
                if (options.cropMarks.enabled) {
                    cropMarksGroup.moveBefore(group);
                }
            } else if (options.cropMarks.enabled && options.group === 'only_items') {
                cropMarksGroup.moveBefore(group);
                cropMarksGroup.ungroup();
            } else if ((options.group === 'none') || (options.group === 'only_cropmarks')) {
                group.ungroup();
            }

        }, true);


        return {
            options: options,
            group: groupItems,
            items: collection,
            marks: marksCollection
        };
    }
    catch (e) {
        $.errorMessage('griddder() - error: ' + e);
    }
};

function inputNumberEvents (ev, _input, min, max, callback){
    var step,
        _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0,1) : '#none#'),
        _value = parseFloat(_input.text),
        units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');

    min = (min === undefined ? 0 : min);
    max = (max === undefined ? Infinity : max);
    step = (ev.shiftKey ? 10 : (ev.ctrlKey ? .1 : 1));

    if (isNaN(_value)) {
        _input.text = min;
    }
        else {
            _value = ( ((_dir === 'u')) ? _value + step : (((_dir === 'd')) ? _value - step : false) );
            if (_value !== false) {
                _value = (_value <= min ? min : (_value >= max ? max : _value))
                _input.text = _value;
                if (callback instanceof Function) callback(ev, _value, _input, min, max, units);
                    else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
            }
                else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
        }
}

function doubleGutters (ev, _value, items) {
    if (ev.altKey && ((ev.keyName === 'Left') || (ev.keyName === 'Right'))) {
        doubleValues(_value, items);
    }
}

function doubleValues (val, items) {
    var i = items.length;
    while (i--) {
        items[i].text = val;
    }
}

var win = new Window('dialog', scriptName + copyright),
    globalGroup = win.add('group');
    globalGroup.orientation = 'column';
    globalGroup.alignChildren = ['fill', 'fill'];

    with (globalGroup.add('panel')) {
        orientation = 'column';
        alignChildren = ['fill', 'fill'];

        with (add('group')) {
            orientation = 'row';
            alignChildren = 'fill';

            with (add('group')) {
                orientation = 'column';
                alignChildren = 'left';
                var inputSize = [0, 0, 75, 25];

                with (add('group')) {
                    orientation = 'row';
                    alignChildren = ['fill', 'fill'];

                    with (add('group')) {
                        orientation = 'column';
                        alignChildren = 'fill';
                        add('statictext', undefined, 'Columns');
                        var __columns = add('edittext', inputSize, 4);
                        __columns.addEventListener('keydown', function(e) { inputNumberEvents(e, __columns, 1, Infinity); doubleGutters(e, this.text, [__columns, __rows]); });
                    }
                    with (add('group')) {
                        orientation = 'column';
                        alignChildren = 'fill';
                        add('statictext', undefined, 'Gutter Cols:');
                        var __columns_gutter = add('edittext', inputSize, '0 px');
                        __columns_gutter.addEventListener('keydown', function(e) { inputNumberEvents(e, __columns_gutter, 0, Infinity); doubleGutters(e, this.text, [__columns_gutter, __rows_gutter]); });
                    }
                }
                with (add('group')) {
                    orientation = 'row';
                    alignChildren = ['fill', 'fill'];

                    with (add('group')) {
                        orientation = 'column';
                        alignChildren = 'fill';
                        add('statictext', undefined, 'Rows:');
                        var __rows = add('edittext', inputSize, 4);
                        __rows.addEventListener('keydown', function(e) { inputNumberEvents(e, __rows, 1, Infinity); doubleGutters(e, this.text, [__columns, __rows]); });
                    }
                    with (add('group')) {
                        orientation = 'column';
                        alignChildren = 'fill';
                        add('statictext', undefined, 'Gutter Rows:');
                        var __rows_gutter = add('edittext', inputSize, '0 px');
                        __rows_gutter.addEventListener('keydown', function(e) { inputNumberEvents(e, __rows_gutter, 0, Infinity); doubleGutters(e, this.text, [__columns_gutter, __rows_gutter]); });
                    }
                }
            }
            with (add('group')) {
                orientation = 'column';
                alignChildren = ['fill', 'fill'];

                with (add('group')) {
                    orientation = 'row';
                    add('statictext', undefined, 'Align:');
                    var __align = add('dropdownlist', [0, 0, 105, 25], 'None,Center,Top Left,Top Center,Top right,Middle Right,Bottom Right,Bottom Center,Bottom Left,Middle Left'.split(','));
                    __align.selection = 0;
                }
                with (add('group')) {
                    orientation = 'row';
                    add('statictext', undefined, 'Bounds:');
                    var __bounds = add('dropdownlist', [0, 0, 90, 25], 'Geometric,Visible'.split(','));
                    __bounds.selection = 0;
                }
                with (add('group')) {
                    orientation = 'row';
                    add('statictext', undefined, 'Group:');
                    var __group = add('dropdownlist', [0, 0, 100, 25], 'None,Only Items,Only CropMarks,Items and CropMarks,Items and CropMarks Singly'.split(','));
                    __group.selection = 0;
                }
            }
        }
    }

    with (globalGroup.add('panel')) {
        orientation = 'column';
        alignChildren = 'left';

        with (add('group')) {
            orientation = 'row';

            var __CMEnabled = add('checkbox', [0, 0, 160, 25], 'Crop marks enabled');
            __CMEnabled.value = false;
            __CMEnabled.onClick = function() {
                cmGroup.enabled = this.value;
            }

            var __useEffect = add('checkbox', undefined, 'Use transform effect?');
            __useEffect.enabled = effectsEnabled;
        }

        with (cmGroup = add('group')) {
            orientation = 'column';
            alignChildren = 'fill';
            enabled = false;

            with (add('group')) {
                orientation = 'row';
                alignChildren = 'fill';

                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Size:');
                    var __cmSize = add('edittext', [0, 0, 65, 25], '5 mm');
                    __cmSize.addEventListener('keydown', function(e) { inputNumberEvents(e, this, 0, Infinity); });
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Weight:');
                    var __cmWeight = add('edittext', [0, 0, 65, 25], '1 pt');
                    __cmWeight.addEventListener('keydown', function(e) { inputNumberEvents(e, this, 0.001, Infinity); });
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Offset:');
                    var __cmOffset = add('edittext', [0, 0, 65, 25], '0 mm');
                    __cmOffset.addEventListener('keydown', function(e) { inputNumberEvents(e, this, 0, Infinity); });
                }
                with (add('group')) {
                    orientation = 'column';
                    alignChildren = 'fill';
                    add('statictext', undefined, 'Position:');
                    var __cmPosition = add('dropdownlist', [0, 0, 90, 25], 'Absolute,Relative'.split(','));
                    __cmPosition.selection = 0;
                }
            }
            with (add('group')) {
                orientation = 'row';
                alignChildren = 'fill';

                var __cmColorType = add('dropdownlist', [0, 0, 170, 25], 'Color type: CMYK Color,Color type: RGB Color'.split(','));
                __cmColorType.selection = 0;
                __cmColorType.addEventListener('change', function (e) {
                    var newColorType = this.selection.text.replace('Color type: ', '').replace(/ /g, '');
                    $cropMarksColor.values = $.convertColor($.color($cropMarksColor.type, $cropMarksColor.values), newColorType).getColorValues();
                    $cropMarksColor.type = newColorType;
                });
                var __cmColorButton = add('button', [0, 0, 135, 25], 'Choose color..');
                __cmColorButton.onClick = function() {
                    var $cropMarksColorNew = app.showColorPicker($.color($cropMarksColor.type, $cropMarksColor.values));
                    $cropMarksColor.type = $cropMarksColorNew.typename;
                    $cropMarksColor.values = $cropMarksColorNew.getColorValues();
                }
            }
        }
    }

with (globalGroup.add('group')) {
    margins = 0;
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var marginsButton = add('button', undefined, 'margins');
        marginsButton.onClick = function() {
            $margins = prompt('Enter the margin - top right bottom left. Units mm, px. Separator space', $margins).toLowerCase();
        }
    
    var fitToArtButton = add('button', undefined, 'Fit on artboard');
        fitToArtButton.helpTip = 'Fit to artboard';
        fitToArtButton.onClick = function (e) {
            startAction(true);
        };
}

with (globalGroup.add('group')) {
    margins = 0;
    orientation = 'row';
    alignChildren = ['fill', 'fill'];

    var cancel = add('button', undefined, 'Cancel');
        cancel.helpTip = 'Press Esc to Close';
        cancel.onClick = function () { win.close(); }
    
    var ok = add('button', undefined, 'OK');
        ok.helpTip = 'Press Enter to Run';
        ok.onClick = function (e) {
            startAction();
        };
        ok.active = true;
}

    function getData ($fitArtboard) {
        return {
            columns: __columns.text,
            rows: __rows.text,
            gutter: {
                columns: __columns_gutter.text,
                rows: __rows_gutter.text,
            },
            group: __group.selection.text.replace(/ /g, '_').toLowerCase(),
            align: __align.selection.text.replace(/ /g, ''),
            bounds: __bounds.selection.text.toLowerCase(),
            fitToArtboard: !!$fitArtboard,
            margin: $margins,
            cropMarks: {
                size: __cmSize.text,
                offset: __cmOffset.text,
                position: __cmPosition.selection.text.toLowerCase(),
                enabled: __CMEnabled.value,
                attr: {
                    strokeWidth: __cmWeight.text,
                    strokeColor: {
                        type: $cropMarksColor.type,
                        values: $cropMarksColor.values
                    }
                }
            }
        };
    }

    function startAction ($fitArtboard) {
        selection.griddder(getData($fitArtboard));
        win.close();
    }

    function saveSettings() {
        var $file = new File(settingFile.folder + settingFile.name),
            data = [
                __columns.text,
                __rows.text,
                __columns_gutter.text,
                __rows_gutter.text,
                __align.selection.index,
                __bounds.selection.index,
                __group.selection.index,
                __CMEnabled.value,
                __cmSize.text,
                __cmWeight.text,
                __cmOffset.text,
                __cmPosition.selection.index,
                __useEffect.value
            ].toString() + '\n' + $cropMarksColor.type + '\n' + $cropMarksColor.values.toString() + '\n' + $margins;
    
        $file.open('w');
        $file.write(data);
        $file.close();
    }

    function loadSettings() {
        var $file = File(settingFile.folder + settingFile.name);
        if ($file.exists) {
            try {
                $file.open('r');
                var data = $file.read().split('\n'),
                    $main = data[0].split(','),
                    $cmColorType = data[1],
                    $cmColorValues = data[2].split(','),
                    $mrgns = data[3];
                __columns.text = $main[0];
                __rows.text = $main[1];
                __columns_gutter.text = $main[2];
                __rows_gutter.text = $main[3];
                __align.selection = parseInt($main[4]);
                __bounds.selection = parseInt($main[5]);
                __group.selection = parseInt($main[6]);
                __CMEnabled.value = ($main[7] === 'true');
                __cmSize.text = $main[8];
                __cmWeight.text = $main[9];
                __cmOffset.text = $main[10];
                __cmPosition.selection = parseInt($main[11]);
                __useEffect.value = ($main[12] === 'true');

                $cropMarksColor.type = $cmColorType;
                $cropMarksColor.values = $cmColorValues;
                $margins = $mrgns;
                cmGroup.enabled = __CMEnabled.value;
            } catch (e) {}
            $file.close();
        }
    }

win.onClose = function() {
    saveSettings();
    return true;
}

function checkSettingFolder() {
    var $folder = new Folder(settingFile.folder);
    if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();
win.center();
win.show();