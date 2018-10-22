/*
    Created by Alexander Ladygin
    ---   www.ladygin.pro   ---
    --- copyright 2015-2018  ---
*/



// global start


// error message
$.errorMessage = function (message) {
    // lascripts.log(message);
    alert(message);
};
$.appName = {
    indesign: (BridgeTalk.appName.toLowerCase() === 'indesign'),
    photoshop: (BridgeTalk.appName.toLowerCase() === 'photoshop'),
    illustrator: (BridgeTalk.appName.toLowerCase() === 'illustrator')
};


// constant's and variable's
$.guides = {};
$.artboards = {};
$.documents = {};
$.canvasSize = 16383;

function __shadeBlendConvert(percent, from, to) {
  if (
    typeof percent != 'number' ||
    percent < -1 ||
    percent > 1 ||
    typeof from != 'string' ||
    (from[0] != 'r' && from[0] != '#') ||
    (to && typeof to != 'string')
  )
    return null; //ErrorCheck

  function pSBCr(d){
    var l = d.length,
      RGB = {};
    if (l > 9) {
      d = d.split(',');
      if (d.length < 3 || d.length > 4) return null; //ErrorCheck
      (RGB[0] = i(d[0].split('(')[1])),
        (RGB[1] = i(d[1])),
        (RGB[2] = i(d[2])),
        (RGB[3] = d[3] ? parseFloat(d[3]) : -1);
    } else {
      if (l == 8 || l == 6 || l < 4) return null; //ErrorCheck
      if (l < 6)
        d =
          '#' +
          d[1] +
          d[1] +
          d[2] +
          d[2] +
          d[3] +
          d[3] +
          (l > 4 ? d[4] + '' + d[4] : ''); //3 or 4 digit
      (d = i(d.slice(1), 16)),
        (RGB[0] = (d >> 16) & 255),
        (RGB[1] = (d >> 8) & 255),
        (RGB[2] = d & 255),
        (RGB[3] = -1);
      if (l == 9 || l == 5)
        (RGB[3] = r(RGB[2] / 255 * 10000) / 10000),
          (RGB[2] = RGB[1]),
          (RGB[1] = RGB[0]),
          (RGB[0] = (d >> 24) & 255);
    }
    return RGB;
  };

  var i = parseInt,
    r = Math.round,
    h = from.length > 9,
    h =
      (typeof to == 'string'
        ? (to.length > 9 ? true : (to == 'c' ? !h : false))
        : h),
    b = percent < 0,
    percent = (b ? percent * -1 : percent),
    to = (to && to != 'c' ? to : (b ? '#000' : '#FFF')),
    f = pSBCr(from),
    t = pSBCr(to);
  if (!f || !t) return null; //ErrorCheck
  if (h)
    return (
      'rgb' +
      (f[3] > -1 || t[3] > -1 ? 'a(' : '(') +
      r((t[0] - f[0]) * percent + f[0]) +
      ',' +
      r((t[1] - f[1]) * percent + f[1]) +
      ',' +
      r((t[2] - f[2]) * percent + f[2]) +
      (f[3] < 0 && t[3] < 0
        ? ')'
        : ',' +
          (f[3] > -1 && t[3] > -1
            ? (r(((t[3] - f[3]) * percent + f[3]) * 10000) / 10000)
            : (t[3] < 0 ? f[3] : t[3])) +
          ')')
    );
  else
    return (
      '#' +
      (
        0x100000000 +
        r((t[0] - f[0]) * percent + f[0]) * 0x1000000 +
        r((t[1] - f[1]) * percent + f[1]) * 0x10000 +
        r((t[2] - f[2]) * percent + f[2]) * 0x100 +
        (f[3] > -1 && t[3] > -1
          ? r(((t[3] - f[3]) * percent + f[3]) * 255)
          : (t[3] > -1 ? r(t[3] * 255) : (f[3] > -1 ? r(f[3] * 255) : 255)))
      )
        .toString(16)
        .slice(1, f[3] > -1 || (t[3] > -1 ? undefined : -2))
    );
}


// Object
Object.prototype.objectParser = function () {
    try {
        for (var i in this) {
            if (!(this[i] instanceof Function)) {
                if (this[i] === 'true') this[i] = true;
                else if (this[i] === 'false') this[i] = false;
                else if (!isNaN(parseFloat(this[i]))) this[i] = parseFloat(this[i]);
            }
        }
        return this;
    }
    catch (e) {
        $.errorMessage('Object.prototype.objectParser() - error: ' + e);
    }
};
Object.prototype.extend = function (userObject, deep) {
    try {
        for (var key in userObject) {
            if (this.hasOwnProperty(key)) {
                if (deep
                    && this[key] instanceof Object
                    && !(this[key] instanceof Array)
                    && userObject[key] instanceof Object
                    && !(userObject[key] instanceof Array)
                ) {
                    this[key].extend(userObject[key], deep);
                }
                else this[key] = userObject[key];
            }
        }
        return this;
    }
    catch (e) {
        $.errorMessage('$.objectParser() - error: ' + e);
    }
};
Object.prototype.stringify = function (startSeparator, type) {
    // Example:
    // obj = {
    //     one: true,
    //     two: false,
    //     three: {
    //         four: false,
    //         five: true
    //     }
    // }
    // result:
    // return "{"one":true,"two":false,"three":{"four":false,"five":true}}" => [ String ]

    startSeparator = startSeparator || ['{', '}'];
    var str = startSeparator[0], separator = '';

    for (var i in this) {
        if (this[i] instanceof Object && typeof this[i] === 'object') {
            if (this[i] instanceof Array) {
                str += separator + '"' + i + '":' + jsonStringify(this[i], ['[', ']'], 'array');
            }
            else {
                str += separator + '"' + i + '":' + jsonStringify(this[i], null, 'object');
            }
        }
        else if (!(this[i] instanceof Function)) {
            if (type === 'array') {
                str += separator + '"' + this[i] + '"';
            }
            else {
                str += separator + '"' + i + '":"' + this[i] + '"';
            }
        }
        separator = ',';
    }

    return str + startSeparator[1];
};
Object.prototype.parseVal = function (value) {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        arr.push(parser(this[i]));
    }
    return arr;
    function parser(obj) {
        if (isNaN(parseInt(obj))) {
            return NaN;
        }
        else if (!value) {
            return parseInt(obj);
        }
        else {
            return parseFloat(obj).toFixed(value);
        }
    }
};
Object.prototype.comparingArrays = function (arr) {
    var check = 0;
    if (this.length !== arr.length) {
        return false;
    }
    for (var i = 0; i < arr.length; i++) {
        if (this[i] === arr[i]) {
            check++;
        }
    }
    if (check === arr.length) {
        return true;
    }
    else {
        return false;
    }
};
Object.prototype.clearCloneWithArray = function () {
    var l = this.length;
    for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            if (this[i] === this[j]) {
                this.splice(j, 1);
                i--;
                l = this.length;
            }
        }
    }
    return this;
};
Object.prototype.removeItemsWithArray = function (items) {
    var obj = [], items = LA(items);
    for (var i = 0; i < this.length; i++) {
        if (!check(this[i])) {
            obj.push(this[i]);
        }
    }
    function check(e) {
        for (var j = 0; j < items.length; j++) {
            if (e === items[j]) {
                return true;
            }
        }
        return false;
    }
    return obj;
};
Object.prototype.sameItems = function (items) {
    var obj = [], items = LA(items);
    for (var i = 0; i < this.length; i++) {
        if (check(this[i])) {
            obj.push(this[i]);
        }
    }
    function check(e) {
        for (var j = 0; j < items.length; j++) {
            if (e === items[j]) {
                return true;
            }
        }
        return false;
    }
    return obj;
};
Object.prototype.checkObjPrototypes = function (obj) {
    for (var i in this) {
        if (!(this[i] instanceof Function)) {
            for (var j in obj) {
                if (this[i] instanceof Object && !(this[i] instanceof Array) && obj[i] instanceof Object && !(obj[i] instanceof Array)) {
                    this[i].checkObjPrototypes(obj[i]);
                }
                if (!(obj[j] instanceof Function)) {
                    if (this[j] === undefined) {
                        this[j] = obj[j];
                    }
                }
            }
        }
    }
    return this;
};
Object.prototype.each = function (callback, reverse) {
    if (this.length) $.each(this, callback, reverse);
    return this;
};
Object.prototype.filter = function (callback) {
    callback = callback instanceof Function ? callback : function () { return true; };
    var arr = [], items = LA(this),
        l = items.length;

    for (var i = 0; i < l; i++) {
        if (callback(items[i], i, items)) arr.push(items[i]);
    }

    return arr;
};


// global
$.objectStringify = function (object) {
    try {
        return object instanceof Object && (object instanceof Array) ? object.stringify() : object;
    }
    catch (e) {
        $.errorMessage('$.objectParser() - error: ' + e);
    }
};
$.objectParser = function (object) {
    try {
        return object instanceof Object && (object instanceof Array) ? object.objectParser() : object;
    }
    catch (e) {
        $.errorMessage('$.objectParser() - error: ' + e);
    }
};
$.attr = function (object, userAttributes) {
    try {
        if (object && userAttributes) {
            userAttributes.objectParser();

            object instanceof Array ? setArr(object) : setProp(object);

            function setArr(arr) {
                var l = arr.length;
                while (l--) {
                    if (arr[i] instanceof Array) setArr(arr[i]);
                    else if (arr[i] instanceof Object) arr[i].extend(userAttributes, true);
                }
                return arr;
            }
        }

        return object;
    }
    catch (e) {
        $.errorMessage('$.attr() - error: ' + e);
    }
};
$.each = function (object, callback, reverse) {
    try {
        if (object && object.length) {
            var l = object.length;

            if (!reverse) for (var i = 0; i < l; i++) callback(object[i], i, object);
            else while (l--) callback(object[l], l, object);
        }

        return $;
    }
    catch (e) {
        $.errorMessage('$.each() - error: ' + e);
    }
};
$.getUnits = function (val, def) {
    try {
        return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;
    }
    catch (e) {
        $.errorMessage('check units: " ' + e + ' "');
    }
};
$.convertUnits = function (obj, b) {
    if (obj === undefined) {
        return obj;
    }
    if (b === undefined) {
        b = 'px';
    }
    if (typeof obj === 'number') {
        obj = obj + 'px';
    }
    if (typeof obj === 'string') {
        var unit = $.getUnits(obj),
            val = parseFloat(obj);
        if (unit && !isNaN(val)) {
            obj = val;
        }
        else if (!isNaN(val)) {
            obj = val; unit = 'px';
        }
    }
    if ($.appName.illustrator) {
        if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {
            obj = parseFloat(obj) / 2.83464566929134;
        }
        else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {
            obj = parseFloat(obj) / (2.83464566929134 * 10);
        }
        else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {
            obj = parseFloat(obj) / 72;
        }
        else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {
            obj = parseFloat(obj) * 2.83464566929134;
        }
        else if ((unit === 'mm') && (b === 'cm')) {
            obj = parseFloat(obj) * 10;
        }
        else if ((unit === 'mm') && (b === 'in')) {
            obj = parseFloat(obj) / 25.4;
        }
        else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {
            obj = parseFloat(obj) * 2.83464566929134 * 10;
        }
        else if ((unit === 'cm') && (b === 'mm')) {
            obj = parseFloat(obj) / 10;
        }
        else if ((unit === 'cm') && (b === 'in')) {
            obj = parseFloat(obj) * 2.54;
        }
        else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {
            obj = parseFloat(obj) * 72;
        }
        else if ((unit === 'in') && (b === 'mm')) {
            obj = parseFloat(obj) * 25.4;
        }
        else if ((unit === 'in') && (b === 'cm')) {
            obj = parseFloat(obj) * 25.4;
        }
        return parseFloat(obj);
    }
    else if ($.appName.photoshop) {
        return parseFloat(obj);
    }
};


// String prototypes
String.prototype.getUnits = function () {
    try {
        var str = this.slice(-2),
            u = ['px', 'pt', 'mm', 'cm', 'in', 'pc'];
        for (var i = 0; i < u.length; i++) {
            if (str === u[i]) {
                return u[i];
            }
        }
        return false;
    }
    catch (e) {
        $.errorMessage('check units: " ' + e + ' "');
    }
};
String.prototype.convertUnits = function (b) {
    return $.convertUnits(this.toString(), b);
};
String.prototype.hexEncode = function () {
    var s = unescape(encodeURIComponent(this)), h = '';
    for (var i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16);
    return h;
};
String.prototype.hexDecode = function () {
    var s = '';
    for (var i = 0; i < this.length; i += 2) s += String.fromCharCode(parseInt(this.substr(i, 2), 16));
    return decodeURIComponent(escape(s));
};


// application
app.forceQuit = function () {
    $.documents.close('not');
    app.quit();
};


// documents
$.documents.close = function (save_options, options) {
    try {
        // documentsDontClose => [Document] || [Array]

        var options = {
            not: [],
            document: null
        }.extend(options || {}, true);

        if (app.documents.length) {
            save_options = (typeof save_options === 'string' && save_options.length ? save_options : 'PROMPTTOSAVECHANGES').toLowerCase();

            if ((save_options.slice(0, 1) === 'n') || (save_options.slice(0, 1) === 'd')) save_options = 'DONOTSAVECHANGES';
            else if (save_options.slice(0, 1) === 's') save_options = 'SAVECHANGES';
            else save_options = 'PROMPTTOSAVECHANGES';

            options.not = (options.not.typename === 'Document' ? [options.not] : options.not.typename === 'Documents' ? options.not : options.not);
            var l = options.not.length;

            if (!options.documents) {
                $.each(app.documents, function (doc) {

                    var check = true;
                    for (var j = 0; j < l; j++) { if (doc === options.not[j]) check = false; }
                    if (check) doc.close(SaveOptions[save_options.toUpperCase()]);

                }, true);
            }
            else {
                options.document.close(SaveOptions[save_options.toUpperCase()]);
            }
        }
        else $.errorMessage('Documents not found!');

        return $.documents;
    }
    catch (e) {
        $.errorMessage('$.documents.close() - error: ' + e);
    }
};
$.documents.closeOther = function (save_options, documentsDontClose) {
    try {
        if (app.documents.length) {
            documentsDontClose = documentsDontClose instanceof Array ? documentsDontClose.concat([app.activeDocument]) : [app.activeDocument];
            return $.documents.close(save_options || 'prompt', {
                not: documentsDontClose
            });
        }
        else $.errorMessage('Documents not found!');

        return $.documents;
    }
    catch (e) {
        $.errorMessage('$.documents.closeOther() - error: ' + e);
    }
};
$.documents.forceCloseOther = function (documentsDontClose) {
    try {
        if (app.documents.length) {
            documentsDontClose = documentsDontClose instanceof Array ? documentsDontClose.concat([app.activeDocument]) : [app.activeDocument];
            return $.documents.close('not', {
                not: documentsDontClose
            });
        }
        else $.errorMessage('Documents not found!');

        return $.documents;
    }
    catch (e) {
        $.errorMessage('$.documents.closeOther() - error: ' + e);
    }
};
$.documents.parent = function () { return $; };


// guides
$.guides.add = function (direction, position, unit, _artOrDoc, guideScale) {
    try {
        if ($.appName.photoshop) {
            _artOrDoc = _artOrDoc && _artOrDoc.typename === 'Document' ? _artOrDoc : activeDocument;
            return direction && typeof position === 'number' ? _artOrDoc.guides.add(Direction[direction.toUpperCase()], UnitValue(position, unit || 'px')) : null;
        }
        else if ($.appName.illustrator) {
            var art = _artOrDoc || $.artboards.getActive(),
                rect = art.artboardRect, coords,
                artSize = $.artboards.getSize(art),
                topLeft = Math.ceil(-$.canvasSize / 2),
                center = $.artboards.getCenter(art);

            if (guideScale && typeof guideScale === 'number') coords = rect;
            else coords = [
                topLeft + center[0],
                -topLeft + center[1],
                -((topLeft + center[0]) - artSize[0]),
                -((-topLeft + center[1]) - artSize[1])
            ];

            position = $.convertUnits(position, 'px');

            direction = direction || 'vertical';
            direction = typeof direction === 'string' && direction.length ? direction.toLowerCase().slice(0, 1) : 'v';
            var guide = activeDocument.pathItems.add();
            guide.guides = true;
            if (direction === 'v') {
                guide.setEntirePath([
                    [rect[0] + position, coords[1]],
                    [rect[0] + position, coords[3]]
                ]);
            }
            else {
                guide.setEntirePath([
                    [coords[0], rect[1] - position],
                    [coords[2], rect[1] - position]
                ]);
            }

            if (guideScale && typeof guideScale === 'number') {
                guide.scale(guideScale);
            }

            return guide;
        }
        else if ($.appName.indesign) {
            _artOrDoc = _artOrDoc || app.activeDocument;
            _artOrDoc.guides.add(undefined, {
                guideType: GuideTypeOptions.RULER,
                location: $.convertUnits(position, 'px'),
                orientation: HorizontalOrVertical[direction]
            });
        }
    }
    catch (e) {
        $.errorMessage('$.guides.add() - error: ' + e);
    }
};
$.guides.clear = function (document) {
    try {
        if ($.appName.photoshop) {
            try {
                var desc = new ActionDescriptor();
                ref = new ActionReference();
                ref.putEnumerated(charIDToTypeID('Gd  '), charIDToTypeID('Ordn'), charIDToTypeID('Al  '));
                desc.putReference(charIDToTypeID("null"), ref);
                executeAction(charIDToTypeID('Dlt '), desc, DialogModes.NO);
            }
            catch (err) {
                if (activeDocument) app.activeDocument.guides.removeAll();
            }
        }
        else if ($.appName.illustrator) {
            document = document || app.activeDocument;
            var p = document.pathItems, i = p.length;
            while (i--) p[i].guides ? p[i].remove() : '';
        }

        return $.guides;
    }
    catch (e) {
        $.errorMessage('$.guides.clear() - error: ' + e);
    }
};
$.guides.addCenter = function (direction) {
    try {
        if (typeof direction === 'string') direction = direction.replace(/ /g, '').split(',');
        else return false;

        if (app.documents.length) {
            if ($.appName.photoshop) {
                var i = direction.length;
                while (i--) $.guides.add(direction[i].toUpperCase(), parseFloat(activeDocument[direction[i].toLowerCase().slice(0, 1) === 'h' ? 'height' : 'width'] / 2));
            }
            else if ($.appName.illustrator) {
                var i = direction.length, center = $.artboards.getCenter();
                while (i--) {
                    $.guides.add(direction[i], direction[i].toLowerCase().slice(0, 1) === 'v' ? center[0] : -center[1]);
                }
            }
        }
        return $.guides;
    }
    catch (e) {
        $.errorMessage('$.addCenterGuide() - error: ' + e);
    }
};
$.guides.margin = function (value) {
    try {
        $.guides.columns({
            amount: 1,
            unit: $.getUnits(value).split(' ')[0],
            direction: ',',
            margin: value,
            position: 'center'
        });
    }
    catch (e) {
        $.errorMessage('$.guides.margin() - error: ' + e);
    }
};
$.guides.columns = function (userOptions, callback) {
    try {
        var options = {
            gutter: 0,
            amount: 0,
            size: false,
            unit: 'px',
            start: 0,
            offset: 0,
            overstep: false,
            margin: '0',
            direction: 'vertical',
            docSize: 'auto',
            position: 'left',
            showColumns: false,
            gutterStart: false,
            gutterCenter: false,
            guideScale: false
        }.extend(userOptions || {}, true);

        if (app.documents.length) {

            if (options.direction.replace(/ /g, '').split(',').length > 1) {
                options.direction = 'vertical';
                $.guides.columns(options, callback);
                options.direction = 'horizontal';
                return $.guides.columns(options, callback);
            }

            if ($.appName.photoshop) app.preferences.rulerUnits = $.getRulerUnits(options.unit);

            options.direction = options.direction.toLowerCase();
            options.size = $.convertUnits(options.size, options.unit);
            options.gutter = $.convertUnits(options.gutter, options.unit);
            options.amount = typeof options.amount === 'number' && options.amount > 0 ? options.amount : 'auto';
            options.offset = typeof options.offset === 'number' && options.offset > 0 ? options.offset : 0;
            options.margin = options.margin.toString().split(' ');
            if (options.margin.length === 2) {
                options.margin[2] = options.margin[0];
                options.margin[3] = options.margin[1];
            }
            else if (options.margin.length < 4) {
                var val = options.margin[options.margin.length - 1];
                for (var i = options.margin.length; i < 4; i++) {
                    options.margin[i] = val;
                }
            }
            for (var i = 0; i < options.margin.length; i++) {
                options.margin[i] = $.convertUnits(options.margin[i], 'px');
            }

            var guides_path, guides_layer, guides_group, guides_path_collection = [], guides_collection = [],
                sizeProp, reverseSizeProp, docSize, unit, size, _aiVertical = 1,
                pos = options.position.toLowerCase().slice(0, 1),
                margin = (options.direction.slice(0, 1).toLowerCase() === 'v' ? [options.margin[3], options.margin[1]] : [options.margin[0], options.margin[2]]);

            if ($.appName.photoshop) {
                sizeProp = options.direction.slice(0, 1).toLowerCase() === 'v' ? 'width' : 'height';
                reverseSizeProp = sizeProp === 'width' ? 'height' : 'width';
                docSize = options.docSize === 'auto' ? app.activeDocument[sizeProp] : new UnitValue(options.docSize, options.unit),
                    docSize = options.overstep ? docSize : parseFloat(docSize) - options.start;
                docSize = parseFloat(docSize) - margin[0] - margin[1];
                unit = options.unit;
            }
            else if ($.appName.illustrator) {
                sizeProp = options.direction.slice(0, 1).toLowerCase() === 'v' ? 0 : 1;
                reverseSizeProp = !sizeProp ? 1 : 0;
                docSize = options.docSize === 'auto' ? $.artboards.getSize(null, true)[sizeProp] : $.convertUnits(options.docSize, options.unit);
                docSize = options.overstep ? docSize : docSize - options.start;
                docSize = parseFloat(docSize) - margin[0] - margin[1];
                unit = options.unit, rect = $.artboards.getActive().artboardRect;
            }

            size = (typeof options.size === 'number' ? options.size + options.gutter : !1) || parseFloat(docSize) / options.amount + options.gutter / options.amount;
            // size = (typeof options.size === 'number' ? options.size + options.gutter : !1) || parseFloat(docSize) / (options.amount * (options.gutter > 0 ? options.gutter / 2 : 1));

            var l = (options.amount === 'auto' ? Math.floor(docSize / size) : options.amount),
                centerOffset = (pos === 'c' ? ((parseFloat(docSize) - size * l + options.gutter + margin[0] + margin[1]) / 2) + (options.start / 2) : options.start + ((pos === 't') || (pos === 'l') ? margin[0] : 0)),
                _reverse = ((pos === 'r') || (pos === 'b')) ? -1 : 1,
                rightStart = _reverse < 0 ? parseFloat(docSize) + margin[1] : 0;


            if (options.showColumns && $.appName.illustrator) {
                // layer
                guides_layer = activeDocument.layers.add();
                guides_layer.name = 'guides_columns';
                // group
                guides_group = guides_layer.groupItems.add();
                guides_group.name = 'guides_columns';
            }

            if (margin[0]) {
                guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset - margin[0]), unit, null, options.guideScale));
                guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset), unit, null, options.guideScale));
            }

            if (margin[1]) {
                guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * l - options.gutter) * _reverse, unit, null, options.guideScale));
                guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * l - options.gutter + margin[1]) * _reverse, unit, null, options.guideScale));
            }


            for (var i = 0; i <= l; i++) {
                if (options.gutter) {
                    // column
                    if (i < l) guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, unit, null, options.guideScale));
                    // gutter
                    if (i && i <= l) guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * i - options.gutter) * _reverse, unit, null, options.guideScale));

                    // gutter center
                    if (options.gutterCenter && i && i < l) guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * i - options.gutter / 2) * _reverse, unit, null, options.guideScale));

                    // gutter start
                    if (options.gutterStart && (!i || (i === l))) guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * i - options.gutter / 2) * _reverse, unit, null, options.guideScale));

                    // columns debug
                    if (options.showColumns && i < l) {
                        if ($.appName.photoshop) {
                            guides_path_collection.push($.path.addSubPath([
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, 0],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * (i + 1) - options.gutter) * _reverse, 0],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * (i + 1) - options.gutter) * _reverse, parseFloat(activeDocument[reverseSizeProp])],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, parseFloat(activeDocument[reverseSizeProp])]
                            ]));
                        }
                        else if ($.appName.illustrator) {
                            guides_path = guides_group.pathItems.add();
                            guides_path_collection.push(guides_path);
                            guides_path.name = 'guides_columns';
                            guides_path.setEntirePath([
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, rect[1]],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * (i + 1) - options.gutter) * _reverse, rect[1]],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * (i + 1) - options.gutter) * _reverse, rect[3]],
                                [parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, rect[3]]
                            ]);
                            guides_path.opacity = 50;
                            guides_path.closed = true;
                            guides_path.fillColor = $.color('hex', '00c8ff');
                        }
                    }
                }
                else {
                    guides_collection.push($.guides.add(options.direction, parseFloat(rightStart) + (options.offset + centerOffset + size * i) * _reverse, unit, null, options.guideScale));
                }
            }

            if (options.showColumns && $.appName.photoshop) {
                // layer
                guides_layer = activeDocument.artLayers.add();
                guides_layer.name = 'guides_columns';
                guides_layer.fillOpacity = 50;
                // path
                guides_path = app.activeDocument.pathItems.add($.path.getUniquePathName('guides_columns', '_'), guides_path_collection);
                guides_path.makeSelection();
                app.activeDocument.selection.fill($.color('hex', '00c8ff'));
                app.activeDocument.selection.deselect();
            }

            if (callback instanceof Function) callback({
                guides: guides_collection,
                options: options,
                showColumns: {
                    layer: guides_layer,
                    group: guides_group,
                    items: guides_path_collection
                }
            });

            if (options.showColumns) guides_layer.locked = true;

        }

        return $.guides;
    }
    catch (e) {
        $.errorMessage('$.guides.columns() - error: ' + e);
    }
};
$.guides.rows = function (userOptions, callback) {
    userOptions = userOptions || {};
    userOptions.direction = 'horizontal';
    return $.guides.columns(userOptions, callback);
};
$.guides.susy = function (options) {
    try {
        options = options || {};
        this.unit = options.unit || 'px';
        this.columns = options.columns || 12;
        this.gutters = options.gutters || 1 / 6;
        this.container = options.container || 1280;
        this.debug = {
            image: 'hide',
            color: '#00c8ff',
            opacity: 50
        }.extend(options.debug || {}, true).objectParser();
        this.guttersCenter = typeof options.guttersCenter === 'boolean' ? options.guttersCenter : false;
        this.direction = options.direction || 'vertical'.toUpperCase();
        this.position = options.position || {
            start: (($.appName.illustrator ? $.artboards.getSize()[0] : $.appName.photoshop ? parseFloat(app.activeDocument.width) : 0) - parseFloat(this.container)) / 2
        };
        this.size = {};

        this.create = function () {
            try {
                var self = this, value, susy_layer, rect,
                    show_columns_path, show_columns_collection = [];
                self.size.columns = self.container / self.columns;
                self.size.gutters = self.size.columns * self.gutters;
                self.size.columns = self.size.columns - self.size.gutters;
                if ($.appName.illustrator) rect = $.artboards.getActive().artboardRect;

                if (self.debug.image && self.debug.image === 'show' && $.appName.illustrator) {
                    // layer
                    susy_layer = activeDocument.layers.add();
                    susy_layer.name = 'susy_columns';
                }

                for (var i = 0; i < self.columns + 1; i++) {
                    if (i) $.guides.add(self.direction, self.position.start + ((self.size.columns + self.size.gutters) * i - self.size.gutters / 2), self.unit);
                    if (i < self.columns) $.guides.add(self.direction, self.position.start + ((self.size.columns + self.size.gutters) * i + self.size.gutters / 2), self.unit);
                    if (!i || i === self.columns) $.guides.add(self.direction, self.position.start + ((self.size.columns + self.size.gutters) * i), self.unit);
                    if (self.guttersCenter && (i || i !== self.columns)) $.guides.add(self.direction, self.position.start + ((self.size.columns + self.size.gutters) * i), self.unit);

                    if (self.debug.image && self.debug.image === 'show' && i < self.columns) {
                        if ($.appName.photoshop) {
                            show_columns_collection.push($.path.addSubPath([
                                [self.position.start + ((self.size.columns + self.size.gutters) * i + self.size.gutters / 2), 0],
                                [self.position.start + ((self.size.columns + self.size.gutters) * (i + 1) - self.size.gutters / 2), 0],
                                [self.position.start + ((self.size.columns + self.size.gutters) * (i + 1) - self.size.gutters / 2), parseFloat(activeDocument.height)],
                                [self.position.start + ((self.size.columns + self.size.gutters) * i + self.size.gutters / 2), parseFloat(activeDocument.height)]
                            ]));
                        }
                        else if ($.appName.illustrator) {
                            show_columns_path = susy_layer.pathItems.add();
                            show_columns_collection.push(show_columns_path);
                            show_columns_path.name = 'susy_columns';
                            show_columns_path.opacity = self.debug.opacity;
                            show_columns_path.fillColor = $.color('hex', self.debug.color);
                            show_columns_path.setEntirePath([
                                [self.position.start + ((self.size.columns + self.size.gutters) * i + self.size.gutters / 2), rect[1]],
                                [self.position.start + ((self.size.columns + self.size.gutters) * (i + 1) - self.size.gutters / 2), rect[1]],
                                [self.position.start + ((self.size.columns + self.size.gutters) * (i + 1) - self.size.gutters / 2), rect[3]],
                                [self.position.start + ((self.size.columns + self.size.gutters) * i + self.size.gutters / 2), rect[3]]
                            ]);
                        }
                    }
                }

                if (susy_layer && $.appName.illustrator) susy_layer.locked = true;

                if (self.debug.image && self.debug.image === 'show' && $.appName.photoshop) {
                    // layer
                    var guides_layer = activeDocument.artLayers.add();
                    guides_layer.name = 'susy_columns';
                    guides_layer.fillOpacity = self.debug.opacity;
                    // path
                    show_columns_path = app.activeDocument.pathItems.add($.path.getUniquePathName('susy_columns'), show_columns_collection);
                    show_columns_path.makeSelection();
                    app.activeDocument.selection.fill($.color('hex', self.debug.color));
                    app.activeDocument.selection.deselect();
                }

                return self;

            }
            catch (e) {
                $.errorMessage('susyGrid.create() - error: ' + e);
            }
        };

        this.create();
    }
    catch (e) {
        $.errorMessage('$.guides.susy() - error: ' + e);
    }
};
$.guides.show = function (value) {
    value = value || false;
    if ($.appName.illustrator) {
        var guides = app.activeDocument.pathItems, i = guides.length;
        while (i--) if (guides[i].guides) guides[i].hidden = value;
    }
    return $.guides;
};
$.guides.hide = function () { return $.guides.show(true); };
$.guides.toogleVisibility = function () {
    if ($.appName.photoshop) {
        var desc = new ActionDescriptor(),
            ref = new ActionReference();
        ref.putEnumerated(app.charIDToTypeID('Mn  '), app.charIDToTypeID('MnIt'), app.charIDToTypeID('Tgld'));
        desc.putReference(app.charIDToTypeID('null'), ref);
        return executeAction(app.charIDToTypeID('slct'), desc, DialogModes.NO);
    }
    else if ($.appName.illustrator) {
        app.executeMenuCommand('showguide');
    }
    return $.guides;
};
// susy grid    ### deprecated
var susyGrid = function () { $.errorMessage('Please rename "susyGrid(options)" to "$.guides.susy(options)"!'); };
$.guides.bootstrap = function (preset, showColumns) {
    try {
        switch (preset.toLowerCase()) {
            case 'extra-large': preset = 'xl';
            case 'xl':
                $.guides.columns({
                    size: 65,
                    amount: 12,
                    gutter: 30,
                    gutterStart: true,
                    position: 'center',
                    showColumns: showColumns
                }, function (data) {
                    columnsCallback(data, 'Bootstrap_grid[ Extra-large ]');
                });
                break;
            case 'large': preset = 'lg';
            case 'lg':
                $.guides.columns({
                    size: 50,
                    amount: 12,
                    gutter: 30,
                    gutterStart: true,
                    position: 'center',
                    showColumns: showColumns
                }, function (data) {
                    columnsCallback(data, 'Bootstrap_grid[ Large ]');
                });
                break;
            case 'medium': preset = 'md';
            case 'md':
                $.guides.columns({
                    size: 30,
                    amount: 12,
                    gutter: 30,
                    gutterStart: true,
                    position: 'center',
                    showColumns: showColumns
                }, function (data) {
                    columnsCallback(data, 'Bootstrap_grid[ Medium ]');
                });
                break;
            case 'small': preset = 'sm';
            case 'sm':
                $.guides.columns({
                    size: 15,
                    amount: 12,
                    gutter: 30,
                    gutterStart: true,
                    position: 'center',
                    showColumns: showColumns
                }, function (data) {
                    columnsCallback(data, 'Bootstrap_grid[ Small ]');
                });
                break;
        }

        function columnsCallback(data, name) {
            if (data.showColumns.layer) {
                data.showColumns.layer.name = name;
                if ($.appName.illustrator) {
                    data.showColumns.group.name = name;
                    data.showColumns.layer.zIndex('last');
                }
            }
        }

        return $.guides;
    }
    catch (e) {
        $.errorMessage('$.guides.bootstrap() - error: ' + e);
    }
};
$.guides.parent = function () { return $; };


// color
$.color = function (a, v) {
    if (a) {
        if (typeof a === 'string') {
            a = a.toLocaleLowerCase();
        }
    }
    else {
        return undefined;
    }
    if ((a === 'hex') && $.appName.illustrator) {
        if (!v) {
            return new RGBColor();
        }
        else {
            if (v === 'random') return $.color('rgb', v);
            else return $.hexToColor(v, 'RGB');
        }
    }
    else if ((a === 'cmyk') || (a === 'cmykcolor')) {
        var c = new CMYKColor(), b = [];
        if (v) {
            b = b.concat(v);
            if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {
                b = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
            }
            else {
                for (var i = 0; i < b.length; i++) {
                    if (b[i] === 'random') {
                        b[i] = Math.floor(Math.random() * 100);
                    }
                }
            }
            c.cyan = parseInt(b[0]);
            c.magenta = parseInt(b[1]);
            c.yellow = parseInt(b[2]);
            c.black = parseInt(b[3]);
        }
        return c;
    }
    else if ((a === 'rgb') || (a === 'rgbcolor') || ((a === 'hex') && $.appName.photoshop)) {
        var c = new RGBColor(), b = [];
        if (v) {
            b = b.concat(v);
            if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {
                b = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
            }
            else {
                for (var i = 0; i < b.length; i++) {
                    if (b[i] === 'random') {
                        b[i] = Math.floor(Math.random() * 100);
                    }
                }
            }
            if ($.appName.photoshop) {
                if (a !== 'hex' || (typeof v === 'string' && v.toLocaleLowerCase() === 'random')) {
                    c.red = parseInt(b[0]);
                    c.green = parseInt(b[1]);
                    c.blue = parseInt(b[2]);
                }
                else {
                    c.hexValue = b[0];
                }
            }
            else if ($.appName.illustrator) {
                c.red = parseInt(b[0]);
                c.green = parseInt(b[1]);
                c.blue = parseInt(b[2]);
            }
        }
        return c;
    }
    else if ((a === 'gray') || (a === 'grayscale') || (a === 'grayscale') || (a === 'graycolor')) {
        var c = new GrayColor(), b = [];
        if (v) {
            b = b.concat(v);
            if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {
                b = Math.floor(Math.random() * 100);
            }
            c.gray = parseInt(b[0] || b);
        }
        return c;
    }
    else if ((a === 'lab') || (a === 'labcolor')) {
        var c = new LabColor(), value, b = [];
        if (v) {
            b = b.concat(v);
            if (typeof v === 'string' && v.toLocaleLowerCase() === 'random') {
                b = [Math.floor(Math.random() * 100), Math.floor(-128 + Math.random() * 256), Math.floor(-128 + Math.random() * 256)];
            }
            else {
                for (var i = 0; i < b.length; i++) {
                    if (i === 0) {
                        if (b[i] === 'random') {
                            b[i] = Math.floor(Math.random() * 100);
                        }
                    }
                    else {
                        if (b[i] === 'random') {
                            b[i] = Math.floor(-128 + Math.random() * 256);
                        }
                    }
                }
            }
            c.l = parseInt(b[0]);
            c.a = parseInt(b[1]);
            c.b = parseInt(b[2]);
        }
        return c;
    }
    else if ((a === 'spot') || (a === 'spotcolor')) {
        var c = new SpotColor(), b = [];
        if (v) {
            b = b.concat(v);
            c.tint = parseInt(b[1]);
        }
        return c;
    }
    else if ((a === 'gradient') || (a === 'Gradient') || (a === 'GradientColor')) {
        var c = app.activeDocument.gradients.add(), g = new GradientColor(), b = [];
        if (v) {
            b = b.concat(v);
            for (var i = 0; i < b.length; i++) {
                c.gradientStops[i].color = $.color(b[i][0], b[i][1]);
            }
            g.gradient = c;
        }
        return g;
    }
    else if ((a === 'no') || (a === 'nocolor')) {
        return new NoColor();
    }
};
$.toHex = function (color, hash) {
    if (color.typename !== 'RGBColor' && $.appName.illustrator) {
        color = $.convertColor(color, 'RGB');
    }
    return (hash ? '#' : '') + to(color.red) + to(color.green) + to(color.blue);
    function to(val) {
        var hex = val.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
};
$.hexToColor = function (color, type) {
    color = color.toLocaleLowerCase();
    color = correct(color);
    function correct(a) {
        var l, b = '000000';
        if (a[0] === '#') {
            a = a.slice(1);
        }
        l = a.length;
        a = a + b.slice(l);
        return a;
    }
    return $.convertColor($.color('rgb', [parseInt((gc(color)).slice(0, 2), 16), parseInt((gc(color)).slice(2, 4), 16), parseInt((gc(color)).slice(4, 6), 16)]), type || 'rgb');
    function gc(h) {
        return (h.slice(0, 1) === '#') ? h.slice(1, 7) : h;
    }
};
$.isColor = function (color) {
    if (
        (color.typename === 'GradientColor')
        || (color.typename === 'PatternColor')
        || (color.typename === 'CMYKColor')
        || (color.typename === 'SpotColor')
        || (color.typename === 'GrayColor')
        || (color.typename === 'LabColor')
        || (color.typename === 'RGBColor')
        || (color.typename === 'NoColor')
    ) {
        return true;
    }
    else {
        return false;
    }
};
$.getColorValues = function (color) {
    if (color === undefined) {
        return undefined;
    }
    else if (color.typename === 'CMYKColor') {
        return [color.cyan, color.magenta, color.yellow, color.black];
    }
    else if (color.typename === 'RGBColor') {
        return [color.red, color.green, color.blue];
    }
    else if (color.typename === 'LabColor') {
        return [color.l, color.a, color.b];
    }
    else if (color.typename === 'SpotColor') {
        return [color.spotl, color.tint];
    }
    else if (color.typename === 'GrayColor') {
        return [color.gray];
    }
    else if (color.typename === 'NoColor') {
        return undefined;
    }
    else if (color.typename === 'GradientColor') {
        var colors = [], gradients = color.gradient.gradientStops;
        for (var i = 0; i < gradients.length; i++) {
            colors = colors.concat(gradients[i].color.getColorValues());
        }
        return colors;
    }
};
CMYKColor.prototype.getColorValues = function () {
    return $.getColorValues(this);
};
RGBColor.prototype.getColorValues = function () {
    return $.getColorValues(this);
};
GrayColor.prototype.getColorValues = function () {
    return $.getColorValues(this);
};
LabColor.prototype.getColorValues = function () {
    return $.getColorValues(this);
};
NoColor.prototype.getColorValues = function () {
    return $.getColorValues(this);
};


// global end


// photoshop start

if ($.appName.photoshop) {


    // app
    app.quit = function () {
        executeAction(app.charIDToTypeID('quit'), undefined, DialogModes.NO);
    };


    // $
    $.getUnit = function (value) {
        try {
            value = value.toString().replace(/ /g, '');
            return value.replace(parseInt(value), '');
        }
        catch (e) {
            $.errorMessage('$.getUnit() - error: ' + e);
        }
    };
    $.getRulerUnits = function (unit, string) {
        if (!string) switch (unit.toLowerCase()) {
            case 'cm':
                return Units.CM;
            case 'in':
                return Units.INCHES;
            case 'mm':
                return Units.MM;
            case '%':
                return Units.PERCENT;
            case 'picas':
                return Units.PICAS;
            case 'points':
                return Units.POINTS;
            default:
                return Units.PIXELS;
        }
        else switch (unit.toLowerCase()) {
            case Units.CM:
                return 'cm';
            case Units.INCHES:
                return 'in';
            case Units.MM:
                return 'mm';
            case Units.PERCENT:
                return '%';
            case Units.PICAS:
                return 'picas';
            case Units.POINTS:
                return 'points';
            default:
                return 'px';
        }
    };
    $.documents.setInfo = function (userInfo, _documents, returnDocuments) {
        try {
            if (userInfo instanceof Object && !(userInfo instanceof Array)) {
                _documents = _documents || [app.activeDocument];
                userInfo.objectParser();

                $.each(_documents, function (doc) {
                    doc.info = $.attr(doc.info, userInfo);
                });
            }

            return returnDocuments ? _documents : $;
        }
        catch (e) {
            $.errorMessage('$.documents.setInfo() - error: ' + e);
        }
    };


    // path
    $.path = {};
    $.path.addPoint = function (points, item, properties) {
        try {
            if (points instanceof Array) {

                var lines = [],
                    l = points.length;

                for (var i = 0; i < l; i++) {
                    lines[i] = [];
                    lines[i] = new PathPointInfo();
                    lines[i].kind = PointKind.CORNERPOINT;
                    lines[i].anchor = points[i];
                    lines[i].leftDirection = points[i];
                    lines[i].rightDirection = points[i];
                    if (properties instanceof Object && !(properties instanceof Array)) $.attr(lines[i], properties);
                }

                return lines;
            }

            return $.path;
        }
        catch (e) {
            $.errorMessage('$.path.addPoint() - error: ' + e);
        }
    };
    $.path.addSubPath = function (points, properties) {
        try {
            if (points instanceof Array) {

                var subLines = new SubPathInfo();
                subLines.operation = ShapeOperation.SHAPEXOR;
                subLines.closed = true;
                subLines.entireSubPath = $.path.addPoint(points, subLines, properties);

                return subLines;
            }

            return $.path;
        }
        catch (e) {
            $.errorMessage('$.path.addSubPath1() - error: ' + e);
        }
    };
    $.path.getUniquePathName = function (name, prefix, suffix) {
        try {
            prefix = prefix || '';
            if (activeDocument.pathItems.getByName(name + prefix + (!suffix ? '' : suffix + 1))) {
                return $.path.getUniquePathName(name, prefix, !suffix ? 1 : suffix + 1);
            }
            return name + prefix + (suffix + 1);
        }
        catch (e) {
            return name + prefix + (isNaN((suffix + 1)) ? '' : (suffix + 1));
        }
    };


}

// photoshop end



// illustrator start

if ($.appName.illustrator) {


    // constructor - LA
    function LA(obj, callback, reverse) {
        if (!callback) {
            if (obj instanceof Array) {
                return obj;
            }
            else {
                var arr = $.getArr(obj);
                if (arr === obj) {
                    if ($.isColor(obj)) {
                        return obj;
                    }
                    else {
                        return [obj];
                    }
                }
                return arr;
            }
        }
        else if (callback instanceof Function) {
            var arr = $.getArr(obj);
            if (arr === obj) {
                arr = [obj];
            }
            if (reverse) {
                var i = arr.length;
                while (i--) callback(arr[i], i, arr);
            }
            else {
                for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);
            }
            return arr;
        }
    }


    // $
    $.command = function (command) {
        try {
            app.executeMenuCommand(command);
            return $;
        }
        catch (e) {
            $.errorMessage('Command is " ' + command + ' " error: ' + e);
        }
    };
    $.selectionSize = function (property, bounds) {
        /*
            EXAMPLE:
            $.selectionSIze('width', 'visible');
            return width value;
        */
        var bounds = $.selectionBounds(bounds),
            propertyArr = property.replace(/ /g, '').split(','),
            i = propertyArr.length;
        values = [];
        while (i--) {
            if (propertyArr[i] === 'width') values.push(bounds[2] - bounds[0]);
            if (propertyArr[i] === 'height') values.push(bounds[1] - bounds[3]);
        }
        if (values.length === 1) return values[0];
        return values;
    };
    $.unSelect = function () { app.selection = null; return $; };
    $.selectionBounds = function (bounds) { return selection.getBounds(bounds); };
    $.activeArtboard = function () { return activeDocument.getActiveArtboard(); };
    $.setColorMode = function (type) { return activeDocument.colorMode(type); };
    $.getColorMode = function (shortname) { return activeDocument.colorMode(shortname); };
    $.toggleColorMode = function () { return activeDocument.colorMode(activeDocument.colorMode('shortname').toLowerCase() === 'rgb' ? 'cmyk' : 'rgb'); };
    $.isArr = function (a) {
        if (
            (!a)
            || (typeof a === 'string')
            || (a.typename === 'Document')
            || (a.typename === 'Layer')
            || (a.typename === 'PathItem')
            || (a.typename === 'GroupItem')
            || (a.typename === 'PageItem')
            || (a.typename === 'CompoundPathItem')
            || (a.typename === 'TextFrame')
            || (a.typename === 'TextRange')
            || (a.typename === 'GraphItem')
            || (a.typename === 'Document')
            || (a.typename === 'Artboard')
            || (a.typename === 'LegacyTextItem')
            || (a.typename === 'NoNNativeItem')
            || (a.typename === 'Pattern')
            || (a.typename === 'PlacedItem')
            || (a.typename === 'PluginItem')
            || (a.typename === 'RasterItem')
            || (a.typename === 'MeshItem')
            || (a.typename === 'SymbolItem')
        ) {
            return false;
        }
        else if (!a.typename && !(a instanceof Array)) {
            return false;
        }
        else {
            return true;
        }
    };
    $.getArr = function (obj, attr, value, exclude) {
        var arr = [];
        function checkExclude (item) {
        	if (exclude !== undefined) {
	        	var j = exclude.length;
	        	while (j--) if (exclude[j] === item) return true;
        	}
        	return false;
        }

        if ($.isArr(obj)) {
            for (var i = 0; i < obj.length; i++) {
            	if (!checkExclude(obj[i])) {
	                if (attr) {
	                    if (value !== undefined) {
	                        arr.push(obj[i][attr][value]);
	                    }
	                    else {
	                        arr.push(obj[i][attr]);
	                    }
	                }
	                else {
	                    arr.push(obj[i]);
	                }
            	}
            }
            return arr;
        }
        else if (attr) {
            return obj[attr];
        }
        else {
            return obj;
        }
    };
    $.convertColor = function (color, type) {
        type = type.toLocaleLowerCase();
        if (color.typename === 'RGBColor') {
            if (type.slice(0, 3) === 'rgb') {
                return color;
            }
            else if (type.slice(0, 4) === 'cmyk') {
                return $.color('cmyk', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 3) === 'lab') {
                return $.color('lab', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'gray') {
                return $.color('gray', app.convertSampleColor(ImageColorSpace.RGB, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.toLocaleLowerCase() === 'hex') {
                return $.toHex(color);
            }
        }
        else if (color.typename === 'CMYKColor') {
            if (type.slice(0, 3) === 'rgb') {
                return $.color('rgb', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'cmyk') {
                return color;
            }
            else if (type.slice(0, 3) === 'lab') {
                return $.color('lab', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'gray') {
                return $.color('gray', app.convertSampleColor(ImageColorSpace.CMYK, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.toLocaleLowerCase() === 'hex') {
                return $.toHex(color);
            }
        }
        else if (color.typename === 'LabColor') {
            if (type.slice(0, 3) === 'rgb') {
                return $.color('rgb', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'cmyk') {
                return $.color('cmyk', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 3) === 'lab') {
                return color;
            }
            else if (type.slice(0, 4) === 'gray') {
                return $.color('gray', app.convertSampleColor(ImageColorSpace.LAB, color.getColorValues(), ImageColorSpace.GrayScale, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.toLocaleLowerCase() === 'hex') {
                return $.toHex(color);
            }
        }
        else if (color.typename === 'GrayColor') {
            if (type.slice(0, 3) === 'rgb') {
                return $.color('rgb', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.RGB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'cmyk') {
                return $.color('cmyk', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.CMYK, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 3) === 'lab') {
                return $.color('lab', app.convertSampleColor(ImageColorSpace.GrayScale, color.getColorValues(), ImageColorSpace.LAB, ColorConvertPurpose.defaultpurpose));
            }
            else if (type.slice(0, 4) === 'gray') {
                return color;
            }
            else if (type.toLocaleLowerCase() === 'hex') {
                return $.toHex(color);
            }
        }
        else if (color.typename === 'SpotColor') {
            return $.convertColor(color.spot.color, type);
        }
        else if (type.toLocaleLowerCase() === 'hex') {
            return $.toHex(color);
        }
        else if (!color.typename && typeof color === 'string') {
            return $.hexToColor(color, type);
        }
    };
    $.colorDarken = function (color, value) {
        var colorType = color.typename.replace('Color', '').toLowerCase();
        return $.hexToColor(__shadeBlendConvert(value / -100, '#' + $.convertColor(color, 'hex')), colorType);
    };
    $.colorLighten = function (color, value) {
        var colorType = color.typename.replace('Color', '').toLowerCase();
        return $.hexToColor(__shadeBlendConvert(value / 100, '#' + $.convertColor(color, 'hex')), colorType);
    };
    $.action = function (userOptions) {
        return new $.AIAction(userOptions);
    }
    $.AIAction = function (userOptions) {
        this.options = {
            name: {
                action: 'LA_Actions',
                Set: 'sets'
            },
            version: 3,
            path: '~/Desktop/la.aia',
            language: 'en'
        }.extend(userOptions || {}, true);

        // global variables
        this.events = [];


        this.actionHeader = function () {
            return [
                '/version ' + this.options.version,
                '/name [ ' + this.options.name.action.length,
                '\t' + this.options.name.action.hexEncode(),
                ']',
                '/isOpen 0',
                '/actionCount 1',
                '/action-1 {',
                '\t/name [ ' + this.options.name.Set.length + '\n\t\t' + this.options.name.Set.hexEncode() + '\n\t]',
                '\t/keyIndex 0',
                '\t/colorIndex 0',
                '\t/isOpen 0',
                '\t/eventCount ' + this.events.length
            ];
        };

        this.pushEvent = function (event) {
            if (event) this.events.push(event.join('\n'));
            return this;
        };

        this.addEvent = function (event_list) {
            var self = this;
            event_list = event_list instanceof Array && event_list.length ? event_list : event_list && typeof event_list === 'string' ? event_list.split(',') : '';
            if (event_list) {
                var list = event_list, l = list.length;
                for (var i = 0; i < l; i++) {
                    var prop = list[i].replace(/ /g, '').split('>'), n = prop.length;
                    if (n === 1 && self.event.hasOwnProperty(prop[0])) {
                        self.pushEvent(self.event[prop[0]]());
                    }
                    else {
                        var _event = self.event;
                        for (var j = 0; j < n; j++) {
                            if (_event.hasOwnProperty(prop[j])) {
                                if (j !== n - 1) _event = _event[prop[j]];
                                if (j === n - 1) self.pushEvent(_event[prop[j]](self));
                            }
                            else break;
                        }
                    }
                }
            }
            return this;
        };


        this.compileAction = function () {
            var events = this.events;
            if (events.length) {
                var str = this.actionHeader();
                for (var i = 0; i < events.length; i++) {
                    str.push('\t/event-' + (i + 1) + ' {');
                    str.push(events[i]);
                    str.push('\t}');
                }
                str.push('}');
                this.data = str.join('\n') + '\n';
                return this.data;
            }
            return this;
        };


        this.loadAction = function () {
            var f = new File(this.options.path);
            f.open('w'); f.write(this.data); f.close();

            app.loadAction(f);
            f.remove();
            return this;
        };

        this.checkLanguage = function () {
            return true;
            return this.options.language.indexOf(app.locale.slice(0, 2)) > -1;
        }


        this.run = function (event_list) {

            var self = this;

            if (this.checkLanguage()) {

                this.addEvent(event_list);

                if (!this.events.length) return this;

                this.compileAction();
                this.loadAction();
                app.doScript(this.options.name.Set, this.options.name.action);
                app.unloadAction(this.options.name.action, '');
            }
            else {
                var _laguage = app.path + '/Support Files/Contents/Windows/' + app.locale + '/' + BridgeTalk.appName.slice(0, 1).toUpperCase() + BridgeTalk.appName.slice(1) + '.ztx';
                alert('Actions do not support current language! Only "en_.."');
            }

            return this;
        };


        this.event = {
            pathfinder: {
                header: function (hex, value) {
                    var name = 'Pathfinder';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_pathfinder)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 0',
                        '\t\t/parameterCount 1',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1851878757',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (enumerated)',
                        '\t\t\t/name [ ' + hex,
                        '\t\t\t]',
                        '\t\t\t/value ' + value,
                        '\t\t}'
                    ];
                },
                // pathfinders
                divide: function (self) {
                    var name = 'Divide';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '5');
                },
                trim: function (self) {
                    var name = 'trim';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '7');
                },
                merge: function (self) {
                    var name = 'Merge';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '8');
                },
                crop: function (self) {
                    var name = 'Crop';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '9');
                },
                outline: function (self) {
                    var name = 'Outline';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '6');
                },
                minusBack: function (self) {
                    var name = 'MinusBack';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '4');
                },
                // shape modes
                unite: function (self) {
                    var name = 'Add';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '0');
                },
                add: function (self) {
                    var name = 'Add';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '0');
                },
                minusFront: function (self) {
                    var name = 'Subtract';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '3');
                },
                subtract: function (self) {
                    var name = 'Subtract';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '3');
                },
                intersect: function (self) {
                    var name = 'Intersect';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '1');
                },
                exclude: function (self) {
                    var name = 'Exclude';
                    return self.event.pathfinder.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '2');
                }
            },
            expand: {
                header: function (data) {
                    var name = 'Expand';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_expand)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 1',
                        '\t\t/showDialog 0',
                        '\t\t/parameterCount 4',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1868720756',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value ' + (typeof data.object === 'boolean' ? (data.object ? 1 : 0) : (typeof data.object === 'number' ? data.object : 0)),
                        '\t\t}',
                        '\t\t/parameter-2 {',
                        '\t\t\t/key 1718185068',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value ' + (typeof data.fill === 'boolean' ? (data.fill ? 1 : 0) : (typeof data.fill === 'number' ? data.fill : 0)),
                        '\t\t}',
                        '\t\t/parameter-3 {',
                        '\t\t\t/key 1937011307',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value ' + (typeof data.stroke === 'boolean' ? (data.stroke ? 1 : 0) : (typeof data.stroke === 'number' ? data.stroke : 0)),
                        '\t\t}',
                        '\t\t/parameter-4 {',
                        '\t\t\t/key 1936553064',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value ' + (typeof data.gradient === 'boolean' ? (data.gradient ? 1 : 0) : (typeof data.gradient === 'number' ? data.gradient : 0)),
                        '\t\t}'
                    ];
                },
                only: {
                    object: function (self) {
                        return self.event.expand.header({ object: true, fill: false, stroke: false, gradient: false });
                    },
                    fill: function (self) {
                        return self.event.expand.header({ object: false, fill: true, stroke: false, gradient: false });
                    },
                    stroke: function (self) {
                        return self.event.expand.header({ object: false, fill: false, stroke: true, gradient: false });
                    },
                    gradient: function (self) {
                        return self.event.expand.header({ object: false, fill: false, stroke: false, gradient: true });
                    }
                },
                fillAndStrokeAndObject: function (self) {
                    return self.event.expand.header({ object: true, fill: true, stroke: true, gradient: false });
                },
                fillAndObject: function (self) {
                    return self.event.expand.header({ object: true, fill: true, stroke: false, gradient: false });
                },
                strokeAndObject: function (self) {
                    return self.event.expand.header({ object: true, fill: false, stroke: true, gradient: false });
                },
                fillAndStroke: function (self) {
                    return self.event.expand.header({ object: false, fill: true, stroke: true, gradient: false });
                },
                fillAndStrokeAndGradient: function (self) {
                    return self.event.expand.header({ object: false, fill: true, stroke: true, gradient: true });
                },
                all: function (self) {
                    return self.event.expand.header({ object: true, fill: true, stroke: true, gradient: true });
                },
                handler: function (data) {
                    return self.event.expand.header(data || { object: false, fill: true, stroke: true, gradient: false });
                }
            },
            text: {
                caseHeader: function (hex, value) {
                    var name = 'Change Case';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_changeCase)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 1',
                        '\t\t/showDialog 1',
                        '\t\t/parameterCount 1',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1954115685',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (enumerated)',
                        '\t\t\t/name [ ' + hex,
                        '\t\t\t]',
                        '\t\t\t/value ' + value,
                        '\t\t}'
                    ];
                },
                uppercase: function (self) {
                    var name = 'UPPERCASE';
                    return self.event.text.caseHeader(name.length + '\n\t\t\t\t' + name.hexEncode(), '0');
                },
                lowercase: function (self) {
                    var name = 'lowercase';
                    return self.event.text.caseHeader(name.length + '\n\t\t\t\t' + name.hexEncode(), '1');
                },
                titlecase: function (self) {
                    var name = 'Title Case';
                    return self.event.text.caseHeader(name.length + '\n\t\t\t\t' + name.hexEncode(), '2');
                },
                sentencecase: function (self) {
                    var name = 'Sentence case';
                    return self.event.text.caseHeader(name.length + '\n\t\t\t\t' + name.hexEncode(), '3');
                },
            },
            layer: {
                clippingMaskHeader: function (hex, value) {
                    var name = 'Layer';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_Layer)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 0',
                        '\t\t/parameterCount 2',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1836411236',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (integer)',
                        '\t\t\t/value 18',
                        '\t\t}',
                        '\t\t/parameter-2 {',
                        '\t\t\t/key 1851878757',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (ustring)',
                        '\t\t\t/value [ ' + hex,
                        '\t\t\t]',
                        '\t\t}'
                    ];
                },
                clippingMask: function (self) {
                    var name = 'Make/Release Clipping Mask';
                    selBack = selection,
                        doc = app.activeDocument,
                        rect = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect,
                        item = doc.activeLayer.pathItems.rectangle(rect[1], rect[0], rect[2] - rect[0], rect[1] - rect[3]);

                    selection = null;
                    item.filled = false;
                    item.stroked = false;
                    item.selected = true;
                    selection = selBack;

                    return self.event.layer.clippingMaskHeader(name.length + '\n\t\t\t\t' + name.hexEncode(), '0');
                }
            },
            align: {
                header: function (hex, value) {
                    var name = 'Alignment';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_alignPalette)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 0',
                        '\t\t/parameterCount 1',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1954115685',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (enumerated)',
                        '\t\t\t/name [ ' + hex,
                        '\t\t\t]',
                        '\t\t\t/value ' + value,
                        '\t\t}'
                    ];
                },
                top: function (self) {
                    var name = 'Vertical Align Top';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '4');
                },
                bottom: function (self) {
                    var name = 'Vertical Align Bottom';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '6');
                },
                vcenter: function (self) {
                    var name = 'Vertical Align Center';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '5');
                },
                left: function (self) {
                    var name = 'Horizontal Align Left';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '1');
                },
                right: function (self) {
                    var name = 'Horizontal Align Right';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '3');
                },
                hcenter: function (self) {
                    var name = 'Horizontal Align Center';
                    return self.event.align.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '2');
                },
                center: function (self) {
                    self.addEvent('align > vcenter').addEvent('align > hcenter');
                    return false;
                }
            },
            livePaint: {
                header: function (hex, value) {
                    var name = 'Live Paint';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_planetx)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 0',
                        '\t\t/parameterCount 1',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1835363957',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (enumerated)',
                        '\t\t\t/name [ ' + hex,
                        '\t\t\t]',
                        '\t\t\t/value ' + value,
                        '\t\t}'
                    ];
                },
                make: function (self) {
                    var name = 'Make';
                    return self.event.livePaint.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '1');
                },
                expand: function (self) {
                    var name = 'Expand';
                    return self.event.livePaint.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '4');
                },
                release: function (self) {
                    var name = 'Release';
                    return self.event.livePaint.header(name.length + '\n\t\t\t\t' + name.hexEncode(), '2');
                }
            },
            flattenTransparency: {
                header: function (data) {
                    var name = 'Flatten Transparency';
                    return [
                        '\t\t/useRulersIn1stQuadrant 0',
                        '\t\t/internalName (ai_plugin_flatten_transparency)',
                        '\t\t/localizedName [ ' + name.length + '\n\t\t\t' + name.hexEncode() + '\n\t\t]',
                        '\t\t/isOpen 0',
                        '\t\t/isOn 1',
                        '\t\t/hasDialog 1',
                        '\t\t/showDialog 0',
                        '\t\t/parameterCount 5',
                        '\t\t/parameter-1 {',
                        '\t\t\t/key 1920169082',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (integer)',
                        '\t\t\t/value 75',
                        '\t\t}',
                        '\t\t/parameter-2 {',
                        '\t\t\t/key 1919253100',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (unit real)',
                        '\t\t\t/value ' + (data.dpi ? data.dpi.toString() : '300.0'),
                        '\t\t\t/unit 592342629',
                        '\t\t}',
                        '\t\t/parameter-3 {',
                        '\t\t\t/key 1869902968',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value 0',
                        '\t\t}',
                        '\t\t/parameter-4 {',
                        '\t\t\t/key 1869902699',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value 1',
                        '\t\t}',
                        '\t\t/parameter-5 {',
                        '\t\t\t/key 1667463282',
                        '\t\t\t/showInPalette -1',
                        '\t\t\t/type (boolean)',
                        '\t\t\t/value 1',
                        '\t\t}'
                    ];
                },
                print: function (self) {
                    return self.event.flattenTransparency.header({ dpi: '300.0' });
                },
                printLight: function (self) {
                    return self.event.flattenTransparency.header({ dpi: '150.0' });
                },
                screen: function (self) {
                    return self.event.flattenTransparency.header({ dpi: '72.0' });
                }
            }
        };

        this.create = function (userOptions) {
            return new $.action(userOptions);
        }
    };


    // Documents
    Object.prototype.getRulerUnits = function (preset_name) {
        var unitsCollections = [];
        function getUnit(doc) {
            var unit = activeDocument.rulerUnits;
            if (preset_name === 'short') {
                unit = unit.toString().toLowerCase().replace('rulerunits.', '');
                if (unit === 'centimeters') unit = 'cm';
                else if (unit === 'millimeters') unit = 'mm';
                else if (unit === 'inches') unit = 'in';
                else if (unit === 'pixels') unit = 'px';
                else if (unit === 'points') unit = 'pt';
            }
            else if (preset_name === 'string') {
                return unit.toString().replace('RulerUnits.', '');
            }
            return unit;
        }
        LA(this, function (doc, i) {
            if (doc.typename === 'Document') {
                unitsCollections.push(getUnit(doc));
            }
        });
        if (unitsCollections.length === 1) return unitsCollections[0];
        return unitsCollections;
    };
    Object.prototype.colorMode = function (type) {
        /*
        * type : String
        * Example: documents.colorMode('cmyk')
        * return the same items and set color mode CMYK
        * Example: documents.colorMode('shortname');
        * return color mode names 'rgb' or 'cmyk'
        */
        var backup = {
            doc: app.activeDocument
        };
        function set(doc) {
            doc.activate();
            if (typeof type === 'string') {
                type = type.toLocaleLowerCase();
                if ((type === 'cmyk') || (type === 'rgb')) {
                    try {
                        $.command('doc-color-' + type);
                    }
                    catch (e) {
                        $.errorMessage('Error "Document color type" message: ' + e);
                    }
                }
            }
        }
        var obj = LA(this),
            names = [];
        for (var i = 0; i < obj.length; i++) {
            if (type === 'shortname') {
                var mode = obj[i].documentColorSpace.toString();
                if (type === 'shortname') mode = mode.replace('DocumentColorSpace.', '');
                names.push(mode);
            }
            else {
                set(obj[i]);
            }
        }
        if (type || type === 'shortname') {
            if (names.length === 1) return names[0];
            return names;
        }
        backup.doc.activate();
        return this;
    };
    Object.prototype.Save = function (options) {
        /*
            options = {
                path : ' String ',
                name : ' String '
            }
        */
        var obj = LA(this);
        try {
            for (var i = 0; i < obj.length; i++) {
                obj[i].save();
            }
        }
        catch (e) {
            for (var i = 0; i < obj.length; i++) {
                obj[i].saveAs(options.name || obj[i].name, options.path || '~/Desktop');
            }
        }
        return this;
    };
    Object.prototype.Close = function (save_options) {
        /*
            save_options = 'String'
                => 'not',
                => 'save',
                => 'prompt'
        */
        try {
            if ((!save_options) || (typeof save_options !== 'string')) save_options = 'p';
            function process(doc) {
                if (doc.typename === 'Document') {
                    $.documents.close(save_options, {
                        document: doc
                    });
                }
            }
            var objs = LA(this);
            for (var i = 0; i < objs.length; i++) {
                process(objs[i]);
            }
        }
        catch (e) {
            $.errorMessage('Document close() - error: ' + e);
        }
    };


    // artboards
    $.artboards.getActive = function (document) {
        document = document && document.typename === 'Document' ? document : activeDocument;
        return document.artboards.length ? document.artboards[document.artboards.getActiveArtboardIndex()] : null;
    };
    $.artboards.getCenter = function (artboard) {
        artboard = artboard || $.artboards.getActive();
        var rect = artboard.artboardRect;
        return [
            (rect[2] - rect[0]) / 2,
            (rect[3] - rect[1]) / 2
        ];
    };
    $.artboards.getSize = function (artboard, normalize) {
        artboard = artboard || $.artboards.getActive();
        var rect = artboard.artboardRect;
        return normalize ? [
            rect[2] - rect[0],
            rect[1] - rect[3]
        ] : [
                rect[2] - rect[0],
                rect[3] - rect[1]
            ];
    };
    $.artboards.createRectangle = function (art, _placement) {
        art = art && art.typename === 'artBoard' ? art : $.activeArtboard();
        var rect = art.artboardRect,
            parent = app.activeDocument.activeLayer;
        var rectangle = parent.pathItems.rectangle(rect[1], rect[0], rect[2] - rect[0], rect[1] - rect[3]);
        if (_placement) rectangle.moveBefore(_placement);
        return rectangle;
    };
    Object.prototype.getActiveArtboard = function () {
        var d = this || activeDocument;
        return d.artboards[d.artboards.getActiveArtboardIndex()];
    };
    Object.prototype.setActiveArtboard = function (index, startZero) {
        var d = this || activeDocument;
        if ((index === undefined) || (d.artboards.length < parseInt(index))) {
            return undefined;
        }
        else {
            d.artboards.setActiveArtboardIndex(startZero ? parseInt(index) : parseInt(index) - 1);
        }
    };
    Object.prototype.artboardActivate = function () {
        if (this.typename && this.typename === 'Artboard') {
            var i = activeDocument.artboards.length;
            while (i--) {
                if (activeDocument.artboards[i] === this) {
                    activeDocument.artboards.setActiveArtboardIndex(i);
                    return this;
                }
            }
        }
    };
    Object.prototype.layersOnArtboard = function (index) {
        var arr = [], backup_selection = LA(selection);
        function getLayers(doc) {
            var obj, art = doc.getActiveArtboard(),
                backup_index = doc.artboards.getActiveArtboardIndex() + 1;
            if (!isNaN(parseInt(index))) {
                doc.setActiveArtboard(index);
            }
            $.unSelect();
            $.command('selectallinartboard');
            obj = selection.parents().clearCloneWithArray();
            $.unSelect();
            doc.setActiveArtboard(backup_index);
            return obj;
        }
        var doc = LA(this);
        for (var i = 0; i < doc.length; i++) {
            arr = arr.concat(getLayers(doc[i]));
        }
        backup_selection.selected();
        return arr;
    };
    Object.prototype.expandForCrop = function () {
        var items = [];
        LA(this, function (item, counter) {
            $.unSelect();
            item.selected = true;
            app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
            if (item.typename === 'GroupItem') {
                LA(item.pageItems).expandForCrop();
            }
            else if ((item.typename === 'PathItem' && !item.clipping) || (item.typename === 'CompoundPathItem')) {
                $.command('expandStyle');
            }
            else if ((item.typename === 'RasterItem') || (item.typename === 'PlacedItem')) {
                $.command('expandStyle');
            }
            else if (item.typename === 'SymbolItem') {
                $.command('expandStyle');
                $.action().run('expand > fillAndObject');
            }
            items.concat(LA(selection));
        }, true);
        return items;
    };
    Object.prototype.cropArtboard = function (userOptions) {
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
        LA(this, function (art, i) {
            if (art.typename && art.typename === 'Artboard') {
                art.crop(userOptions);
            }
        });
    };
    Object.prototype.crop = function (userOptions) {
        var options = {
            expand: false,
            clipping: {
                image: false,
                mesh: false
            },
            frontItem: false,
            removeFrontItem: false
        }.extend(userOptions || {}, true);

        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

        var bnds,
            frontItem = (options.frontItem ? options.frontItem : this[0]);

        if (this.typename && this.typename === 'Artboard') {
            LA(activeDocument.layers).unlockAll();
            activeDocument.selectObjectsOnActiveArtboard();
            if (options.expand) selection.expandForCrop();
            selection = $.artboards.createRectangle();
            bnds = $.activeArtboard().artboardRect;
            $.command('Knife Tool2');
            activeDocument.selectObjectsOnActiveArtboard();
            checkOutside(selection, bnds);
        }
        else if (frontItem && frontItem.typename === 'PathItem') {
            this.unlockAll();
            var objs = options.expand ? this.expandForCrop() : LA(this);
            frontItem = (frontItem !== this[0] ? frontItem : objs[0]);
            bnds = frontItem.geometricBounds;
            selection = !options.removeFrontItem ? frontItem.duplicate() : frontItem;
            $.command('Knife Tool2');
            objs = LA(selection);
            if (options.removeFrontItem) objs.shift();
            checkOutside(objs, bnds, true);
        }


        function checkOutside(items, rect) {
            var i = items.length, arr = [];
            while (i--) {
                var bounds = items[i].geometricBounds;
                if ((bounds[0] < rect[0]) || (bounds[1] > rect[1]) || (bounds[2] > rect[2]) || (bounds[3] < rect[3])) {
                    items[i].remove();
                }
                else if (items[i].typename === 'GroupItem') {
                    checkOutside(items[i].pageItems, rect);
                }
                else if (((items[i].typename === 'PlacedItem') || (items[i].typename === 'RasterItem') && options.clipping.image) || (items[i].typename === 'MeshItem' && options.clipping.mesh)) {
                    var group = items[i].parent.groupItems.add(),
                        rectangle = group.pathItems.add();

                    rectangle.setEntirePath([
                        [rect[0], rect[1]],
                        [rect[2], rect[1]],
                        [rect[2], rect[3]],
                        [rect[0], rect[3]]
                    ]);

                    group.moveBefore(items[i]);
                    items[i].moveToBeginning(group);
                    rectangle.attr({
                        closed: true,
                        filled: false,
                        clipping: true,
                        stroked: false
                    }).zIndex('first');
                    group.clipped = true;
                }
            }
        }

        return this;
    };


    // Guides
    Object.prototype.getGuides = function () {
        /*
        * Example: activeDocument.getGuides()
        * return array with the guides in active document
        */
        var guides = [], items;
        function process(objects) {
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].guides) {
                    guides.push(objects[i]);
                }
            }
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename === 'Document') {
                process(obj[i].items('PathItem'));
            }
            else if ((obj[i].typename === 'Layer') || (obj[i].typename === 'GroupItem')) {
                process(obj[i].children('PathItem'));
            }
        }
        return guides;
    };
    Object.prototype.fastGuides = function (preset, options) {
        var obj = LA(this), arr = [],
            backup_doc = activeDocument,
            default_options = {
                object: activeDocument.getActiveArtboard(),
                bounds: 'geometric',
                margin: '0'
            };
        function process(doc, item, name, m) {
            var one = name.slice(0, 1).toLocaleLowerCase(),
                two = name.slice(0, 2).toLocaleLowerCase(),
                bounds;
            if (item.typename === 'Artboard') {
                bounds = item.artboardRect;
            }
            else if (item instanceof Array && !(item.typename) && !(isNaN(parseInt(item[0])))) {
                bounds = item;
            }
            else if (item.typename) {
                if (options.bounds.slice(0, 1).toLocaleLowerCase() === 'v') {
                    bounds = item.visibleBounds;
                }
                else {
                    bounds = item.geometricBounds;
                }
            }
            else {
                if (options.bounds.slice(0, 1).toLocaleLowerCase() === 'v') {
                    bounds = $.selectionBounds('visibleBounds');
                }
                else {
                    bounds = $.selectionBounds();
                }
            }
            if (one === 't') {
                createGuide(doc, [[bounds[0], bounds[1] - m[0]], [bounds[2], bounds[1] - m[0]]]);
            }
            else if (one === 'r') {
                createGuide(doc, [[bounds[2] - m[1], bounds[1]], [bounds[2] - m[1], bounds[3]]]);
            }
            else if (one === 'b') {
                createGuide(doc, [[bounds[0], bounds[3] + m[2]], [bounds[2], bounds[3] + m[2]]]);
            }
            else if (one === 'l') {
                createGuide(doc, [[bounds[0] + m[3], bounds[1]], [bounds[0] + m[3], bounds[3]]]);
            }
            else if (two === 'ch') {
                createGuide(doc, [[bounds[0], (bounds[3] + bounds[1]) / 2], [bounds[2], (bounds[3] + bounds[1]) / 2]]);
            }
            else if (two === 'cv') {
                createGuide(doc, [[(bounds[2] + bounds[0]) / 2, bounds[1]], [(bounds[2] + bounds[0]) / 2, bounds[3]]]);
            }
            else if (two === 'dl') {
                createGuide(doc, [[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);
            }
            else if (two === 'dr') {
                createGuide(doc, [[bounds[2], bounds[1]], [bounds[0], bounds[3]]])
            }
        }
        function createGuide(doc, value) {
            var guide = doc.pathItems.add();
            guide.guides = true;
            guide.setEntirePath(value);
            guide.scale(150);
            arr.push(guide);
        }
        if (options) {
            if (options.object) {
                options.object = LA(options.object);
            }
            options.checkObjPrototypes(default_options);
        }
        else {
            options = default_options;
        }
        options.margin = options.margin.split(' ');
        if (options.margin.length === 2) {
            options.margin[2] = options.margin[0];
            options.margin[3] = options.margin[1];
        }
        else if (options.margin.length < 4) {
            var val = options.margin[options.margin.length - 1];
            for (var i = options.margin.length; i < 4; i++) {
                options.margin[i] = val;
            }
        }
        for (var i = 0; i < options.margin.length; i++) {
            options.margin[i] = options.margin[i].toString().convertUnits('px');
        }
        for (var i = 0; i < obj.length; i++) {
            if (options.object instanceof Array && !(isNaN(parseInt(options.object[0])))) {
                var objs = options.object, length = 1, isarr = true;
            }
            else {
                var objs = LA(options.object), length = objs.length, isarr = false;
            }
            obj[i].activate();
            for (var j = 0; j < length; j++) {
                var names = preset.removeChars(' !@#$%&*()_+=-/.`~').split(',');
                if (names.length === 1) {
                    var $name = names[0].toLocaleLowerCase().slice(0, 3);
                    if ($name === 'all') {
                        names.splice(0, 1);
                        names = names.concat(['t', 'r', 'b', 'l', 'ch', 'cv']);
                    }
                    else if (($name === 'edg') || ($name === 'cor')) {
                        names.splice(0, 1);
                        names = names.concat(['t', 'r', 'b', 'l']);
                    }
                    else if ($name === 'cen') {
                        names.splice(0, 1);
                        names = names.concat(['ch', 'cv']);
                    }
                }
                for (var n = 0; n < names.length; n++) {
                    if (isarr) {
                        process(obj[i], objs, names[n], options.margin);
                    }
                    else {
                        process(obj[i], objs[j], names[n], options.margin);
                    }
                }
            }
        }
        backup_doc.activate();
        if (arr.length) {
            return arr;
        }
        else {
            return this;
        }
    };
    Object.prototype.clearGuides = function () {
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            obj[i].getGuides().remove();
        }
        return this;
    };
    Object.prototype.showGuides = function (value) {
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            obj[i].getGuides().show(value);
        }
        return obj;
    };
    Object.prototype.lockGuides = function (value) {
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            obj[i].getGuides().attr({ locked: value });
        }
        return this;
    };
    Object.prototype.releaseGuides = function () {
        var obj = LA(this);
        function process(item) {
            item.forcedChange(function (_obj) {
                if (_obj.guides !== undefined) {
                    _obj.guides = false;
                }
            });
        }
        for (var i = 0; i < obj.length; i++) {
            if ((obj[i].typename === 'Document') || (obj[i].typename === 'Layer')) {
                obj[i].getGuides().releaseGuides();
            }
            else {
                process(obj[i]);
            }
        }
        return this;
    };
    Object.prototype.convertToGuide = function () {
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].guides !== undefined) {
                obj[i].guides = true;
            }
        }
        return this;
    };
    Object.prototype.moveGuidesToLayer = function (options) {
        /*
        * options = {
        *    layer : Object or String,
        *    locked : Boolean || String,
        *    hidden : Boolean || String
        * }
        */
        var obj = LA(this),
            options = options || {};
        options.layer = options.layer || 'Layer of the guides';
        options.lock = options.lock || false;
        options.hide = options.hide || false;
        function moveGuides(doc, layer) {
            var guides = doc.getGuides().lockGuides(false),
                check_lock = guides.Parent('Layer');
            if (check_lock.lock()) {
                check_lock.lock(false);
                guides.appendTo(layer);
                check_lock.lock(true);
            }
            else {
                guides.appendTo(layer);
            }
            if (options.lock) {
                if (typeof options.lock === 'string' && options.lock.toLocaleLowerCase() === 'all') {
                    $.command('lockguide');
                }
                else {
                    layer.locked = true;
                }
            }
            if (options.hide) {
                if (typeof options.hide === 'string' && options.hide.toLocaleLowerCase() === 'all') {
                    $.command('showguide');
                }
                else {
                    layer.visible = true;
                }
            }
        }
        for (var i = 0; i < obj.length; i++) {
            if (typeof options.layer === 'string') {
                var l = obj[i].layers.add();
                l.name = options.layer;
                var m = moveGuides(obj[i], l);
            }
            else if (options.layer.typename && options.layer.typename === 'Layer') {
                moveGuides(obj[i], options.layer);
            }
        }
        return obj;
    };


    // Items
    Object.prototype.getAllParents = function () {
        function get(obj) {
            var arr = [];
            if (obj.parent.typename !== 'Application') {
                for (var i = 0; ; i++) {
                    arr.push(obj.parent);
                    if (obj.parent.parent.typename === 'Application') {
                        return arr;
                    }
                    else {
                        obj = obj.parent;
                    }
                    if (i === 1000) {
                        break;
                    }
                }
            }
            else {
                return obj;
            }
        }
        var obj = LA(this), _arr = [];
        for (var i = 0; i < obj.length; i++) {
            _arr = _arr.concat(get(obj[i]));
        }
        return _arr;
    };
    Object.prototype.parents = function (value) {
        var arr = [], obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (typeof value === 'string' && value.toLocaleLowerCase().slice(0, 3) === 'doc') {
                arr = arr.concat(obj[i].layer.parent);
            }
            else {
                arr = arr.concat(obj[i].layer);
            }
        }
        return arr.clearCloneWithArray();
    };
    Object.prototype.Parent = function (value) {
        var arr = [];
        if (!value) {
            if (!$.isArr(this)) {
                return this.parent;
            }
            else {
                for (var i = 0; i < this.length; i++) {
                    arr = arr.concat(this[i].parent);
                }
                return arr.clearCloneWithArray();
            }
        }
        else {
            var obj = LA(this), _obj;
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].typename === 'Document' && value === 'Document') {
                    arr.push(obj[i]);
                }
                else {
                    _obj = obj[i].parent;
                    for (var j = 0; j < 10000; j++) {
                        if (_obj.typename === value) {
                            arr.push(_obj);
                            break;
                        }
                        else if (_obj.typename === 'Application') {
                            return undefined;
                        }
                        _obj = _obj.parent;
                    }
                }
            }
            arr.clearCloneWithArray();
            if (arr.length === 1) {
                return arr[0];
            }
            return arr;
        }
    };
    Object.prototype.items = function (type) {
        function get(d, a) {
            a = a.toLocaleLowerCase();
            if (a.slice(0, 3) === 'non') {
                return $.getArr(d.noNNativeItems);
            }
            else if (a.slice(0, 4) === 'path') {
                return $.getArr(d.pathItems);
            }
            else if (a.slice(0, 5) === 'layer') {
                return $.getArr(d.layers);
            }
            else if (a.slice(0, 5) === 'group') {
                return $.getArr(d.groupItems);
            }
            else if (a.slice(0, 5) === 'graph') {
                return $.getArr(d.graphItems);
            }
            else if (a.slice(0, 5) === 'placed') {
                return $.getArr(d.placedItems);
            }
            else if (a.slice(0, 5) === 'textf') {
                return $.getArr(d.textFrames);
            }
            else if (a.slice(0, 5) === 'textr') {
                var txf = d.textFrames, arr = [];
                for (var i = 0; i < txf.length; i++) {
                    var txr = txf[i].textRanges;
                    for (var j = 0; j < txr.length; j++) {
                        arr.push(txr[j]);
                    }
                }
                return arr;
            }
            else if (a.slice(0, 6) === 'alllay') {
                return d.allLayers();
            }
            else if (a.slice(0, 6) === 'legacy') {
                return $.getArr(d.legacyTextItems);
            }
            else if (a.slice(0, 6) === 'plugin') {
                return $.getArr(d.pluginItems);
            }
            else if (a.slice(0, 6) === 'raster') {
                return $.getArr(d.rasterItems);
            }
            else if (a.slice(0, 6) === 'symbol') {
                return $.getArr(d.symbolItems);
            }
            else if (a.slice(0, 7) === 'pattern') {
                return $.getArr(d.patterns);
            }
            else if (a.slice(0, 8) === 'compound') {
                return $.getArr(d.compoundPathItems);
            }
            else if (a.slice(0, 8) === 'artboard') {
                return $.getArr(d.artboards);
            }
        }
        obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (!type) {
                return obj.items('path,compound,group,alllayers,graph,placed,textf,textr,legacy,plugin,raster,symbol,pattern,compound,artboard');
            }
            else {
                var arr = [];
                type = type.removeChars(' !1234567890_-=+*""@#$%^&*()[]~`').split(',');
                for (var j = 0; j < type.length; j++) {
                    arr = arr.concat(get(obj[i], type[j]));
                }
                return arr.removeItemsWithArray([undefined, '']);
            }
        }
    };
    Object.prototype.children = function (type, level) {
        var arr = [], obj = this, count = 0;
        function get(i, n) {
            var c;
            if (i.typename !== 'CompoundPathItem') {
                c = i.pageItems;
            }
            else {
                c = LA(i.pathItems);
            }
            if (!c || !c.length) {
                return undefined;
            }
            for (var j = 0; j < c.length; j++) {
                if (n === undefined) {
                    arr = arr.concat(c[j]);
                }
                else if (c[j].typename === n) {
                    arr = arr.concat(c[j]);
                }
                if ((level === undefined) || (count < level)) {
                    if (c[j].typename === 'GroupItem') {
                        get(c[j], n, count++);
                        count--;
                    }
                    else if (n === 'PathItem' && c[j].typename === 'CompoundPathItem') {
                        var items = LA(c[j].pathItems);
                        if (items.length !== 0) {
                            arr = arr.concat(items);
                        }
                    }
                }
            }
        }
        function process(e, t) {
            if (!$.isArr(t)) {
                for (var i = 0; i < e.length; i++) {
                    get(e[i], t);
                }
            }
            else {
                for (var i = 0; i < e.length; i++) {
                    for (var j = 0; j < t.length; j++) {
                        get(e[i], t[j]);
                    }
                }
            }
            return arr;
        }
        obj = LA(this);
        if (typeof type !== 'object' && !isNaN(parseInt(type))) {
            level = parseInt(type);
            type = undefined;
        }
        if ((this.typename === 'Layers') || (this.typename === 'Layer')) {
            obj = obj.concat(this.subLayers(level).removeItemsWithArray(this.emptySubLayers(level)));
        }
        return process(obj, type);
    };
    Object.prototype.checkOnModified = function () {
        function process(item) {
            var po = item.getAllParents();
            for (var i = 0; i < po.length; i++) {
                if (po[i].typename !== 'Document') {
                    if (po[i].lock() || po[i].show()) {
                        arr.push(po[i]);
                    }
                }
            }
        }
        var obj = LA(this), arr = [];
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename !== 'Document') {
                process(obj[i]);
            }
        }
        if (arr.length) {
            return arr;
        }
        else {
            return true;
        }
    };
    Object.prototype.forcedChange = function (callback) {
        function process(item) {
            var modified = item.checkOnModified();
            if (modified.length) {
                var l = modified.lock(),
                    h = modified.show();
                modified.lock(false).show(true);
                callback(item);
                if (!(l instanceof Array)) {
                    l = [l];
                }
                if (!(h instanceof Array)) {
                    h = [h];
                }
                LA(modified, function (_obj, i) {
                    _obj.lock(l[i]).show(h[i]);
                });
            }
            else {
                callback(item);
            }
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            process(obj[i]);
        }
        return this;
    };
    Object.prototype.getBounds = function (bounds) {
        bounds = bounds || 'geometricBounds';
        bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;

        if (this.typename === 'Artboard') {
            return this.artboardRect;
        }
        else if (this[0] && this[0].comparingArrays(selection)) {
            return selection.getBounds(bounds);
        }
        else if (this instanceof Array && !(this instanceof Object)) {
            return this;
        }
        else {
            var arr = LA(this), x = [],
                y = [], w = [], h = [];
            for (var i = 0; i < arr.length; i++) {
                x.push(arr[i][bounds][0]);
                y.push(arr[i][bounds][1]);
                w.push(arr[i][bounds][2]);
                h.push(arr[i][bounds][3]);
            };
            return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];
        }
    };
    Object.prototype.getExactSize = function (property, bounds) {
        bounds = bounds || 'geometricBounds';
        bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;

        var values = [],
            item = this,
            bounds = item[bounds],
            propertyArr = property.replace(/ /g, '').split(','),
            i = propertyArr.length;

        if (bounds) {
            while (i--) {
                if (propertyArr[i] === 'width') values.push(bounds[2] - bounds[0]);
                if (propertyArr[i] === 'height') values.push(bounds[1] - bounds[3]);
            }
        }

        return values.length === 1 ? values[0] : values;
    };


    // Layers
    Object.prototype.allLayers = function () {
        var obj = LA(this), arr = [];
        for (var i = 0; i < obj.length; i++) {
            var layers = LA(obj[i].layers);
            for (var j = 0; j < layers.length; j++) {
                arr = arr.concat(layers[j]).concat(LA(layers[j]).subLayers());
            }
        }
        return arr;
    };
    Object.prototype.activeLayers = function () {
        var d = this || activeDocument, arr = [];
        if (d.selection.length === 0) {
            return d.activeLayer;
        }
        for (var i = 0; i < d.selection.length; i++) {
            var s = d.selection[i];
            for (; ;) {
                if (s.parent.typename === 'Document') {
                    if (!checkArr(s)) {
                        arr = arr.concat(s);
                    }
                    break;
                }
                else {
                    s = s.parent;
                }
            }
            function checkArr(a) {
                for (var x = 0; x < arr.length; x++) {
                    if (arr[x] === a) {
                        return false;
                    }
                }
                return a;
            }
        }
        return arr;
    };
    Object.prototype.emptyLayers = function () {
        var arr = [];
        function check(layers) {
            var obj = [];
            for (var i = 0; i < layers.length; i++) {
                var subLayers = layers[i].subLayers(),
                    emptySubLayers = layers[i].emptySubLayers(),
                    count = subLayers.removeItemsWithArray(emptySubLayers).length;
                if (!count && !layers[i].pageItems.length) {
                    obj = obj.concat(layers[i]);
                }
            }
            return obj;
        }
        var doc = LA(this);
        for (var i = 0; i < doc.length; i++) {
            arr = arr.concat(check(doc[i].layers));
        }
        return arr;
    };
    Object.prototype.subLayers = function (level) {
        var arr = [], count = 0;
        if (level !== undefined) {
            level = level - 1;
        }
        function subLayers(layer) {
            var obj = [], sub = layer.layers;
            for (var j = 0; j < sub.length; j++) {
                obj = obj.concat(sub[j]);
                if ((level === undefined) || (sub[j].layers.length > 0 && count < level)) {
                    obj = obj.concat(subLayers(sub[j], count++));
                    count--;
                }
            }
            return obj;
        }
        var obj = LA(this);
        for (var j = 0; j < obj.length; j++) {
            arr = arr.concat(subLayers(obj[j]));
        }
        return arr;
    };
    Object.prototype.emptySubLayers = function (level) {
        var arr = [], obj = LA(this);
        function process(sub) {
            var sub_arr = [];
            sub = sub.subLayers(level).reverse();
            for (var i = 0; i < sub.length; i++) {
                if (sub[i].pageItems.length > 0) {
                    var parents = sub[i].pageItems[0].getAllParents();
                    parents.pop();
                    sub_arr = sub_arr.concat(parents);
                }
            }
            return sub.removeItemsWithArray(sub_arr).reverse();
        }
        for (var i = 0; i < obj.length; i++) {
            arr = arr.concat(process(obj[i]));
        }
        return arr;
    };
    Object.prototype.toLayer = function (options) {
        var l = LA(this).Parent('Layer').layers.add();
        this.appendTo(l);
        l.attr(options);
        return l;
    };
    Object.prototype.layersToGroups = function (options) {
        var arr = [], count = 0,
            obj = LA(this), i = obj.length,
            backup_doc = activeDocument, placement_layer,
            default_options = {
                name: 'Layer 1'
            };
        if (options) {
            options.checkObjPrototypes(default_options);
        }
        function process(layer, placement_object) {
            // covert layers
            var sub = layer.subLayers(), i = sub.length;
            while (i--) {
                arr = arr.concat(sub[i].children(0).group({ name: sub[i].name }).appendTo(sub[i].parent).zIndex(sub[i].Index()));
                sub[i].remove();
            }
            if (options) {
                var g = layer.children(0).group().appendTo(placement_object);
                layer.remove();
                return g;
            }
        }
        while (i--) {
            if (obj[i].typename === 'Document') {
                obj[i].activate();
                if (options) {
                    LA(activeDocument.layers, function (layer) {
                        layer.name = layer.name.toLocaleLowerCase().replace('layer', 'Group');
                    });
                }
                arr = arr.concat(LA(obj[i].layers).layersToGroups(options));
            }
            else if (obj[i].typename === 'Layer') {
                obj[i].name = obj[i].name.toLocaleLowerCase().replace('layer', 'Group');
                if (options && !count) {
                    placement_layer = activeDocument.layers.add();
                    count++;
                }
                process(obj[i], placement_layer);
            }
        }
        if (placement_layer) {
            placement_layer.attr(options);
        }
        backup_doc.activate();
        return arr;
    };


    // Groups
    Object.prototype.group = function (options) {
        var obj = LA(this),
            g = obj[0].parent.groupItems.add();
        this.appendTo(g);
        g.attr(options);
        return g;
    };
    Object.prototype.ungroup = function () {
        var arr = [], obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename === 'GroupItem') {
                var j = obj[i].pageItems.length;
                while (j--) {
                    arr = arr.concat(obj[i].pageItems[0]);
                    obj[i].pageItems[0].moveBefore(obj[i]);
                }
                obj[i].remove();
            }
            else {
                arr = arr.concat(obj[i]);
            }
        }
        return arr;
    };
    Object.prototype.ungroupAll = function () {
        var arr = [], obj = LA(this);
        obj = obj.concat(obj.children('GroupItem'));
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename === 'GroupItem') {
                var j = obj[i].pageItems.length;
                while (j--) {
                    arr = arr.concat(obj[i].pageItems[0]);
                    obj[i].pageItems[0].moveBefore(obj[i]);
                }
                obj[i].remove();
            }
            else {
                arr = arr.concat(obj[i]);
            }
        }
        return arr;
    };
    Object.prototype.groupsToLayers = function (options) {
        var obj = LA(this), i = obj.length,
            arr = [], backup_doc = activeDocument;
        function process(group) {
            arr.push(group.children(0).toLayer(options).attr({ name: group.name }));
            group.remove();
        }
        while (i--) {
            if (obj[i].typename === 'Document') {
                obj[i].activate();
                arr = arr.concat(obj[i].allLayers().groupsToLayers());
            }
            else if (obj[i].typename === 'Layer') {
                var lg = obj[i].children('GroupItem'),
                    j = lg.length;
                while (j--) {
                    arr = arr.concat(lg[j].groupsToLayers());
                }
            }
            else if (obj[i].typename === 'GroupItem') {
                process(obj[i]);
            }
        }
        backup_doc.activate();
        return arr;
    };


    // Text
    Object.prototype.divideText = function () {
        /*
        * Example: activeDocument.textFrames.divideText();
        * return a new array and divide text frames
        */
        var arr = [];
        function divide(s) {
            if (s.typename === 'Document') {
                arr = arr.concat(s.children('TextFrame').divideText());
                return false;
            }
            else if (s.typename === 'GroupItem') {
                arr = arr.concat(s.children('TextFrame').divideText());
                return false;
            }
            var x = s.left, y = s.top, l = s.contents.split('\r');
            arr = arr.concat(s);
            if (l.length === 1) {
                return arr;
            }
            for (var i = 1; i < l.length; i++) {
                t = s.duplicate(s, ElementPlacement.PLACEBEFORE);
                t.contents = l[i]; t.left = x;
                t.top = y - s.textRange.leading * i;
                arr = arr.concat(t);
                if (i === l.length - 1) {
                    arr[0].move(arr[1], ElementPlacement.PLACEBEFORE);
                }
            }
            s.contents = l[0];
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            divide(obj[i]);
        }
        return arr;
    };
    Object.prototype.joinText = function (userOptions) {
        /*
        * Example: activeDocument.layers[0].children('TextFrame').joinText()
        * return object textFrame
        */
        var options = {
            frame: 'row',      // row, column
            beforeChar: ' ',   // beforeChar + content
            afterChar: ' ',    // afterChar + content
            separator: ' ',    // content: textFrame1[separator]textFrame2..[separator]textFrameN
            reverse: false   // reverse items
        }.extend(userOptions || {}, true);

        function createAreaToSelection() {
            return activeDocument.textFrames.areaText(createShape());
        }
        function createShape() {
            var bounds = $.selectionBounds(),
                sizes = $.selectionSize('width, height'),
                addingSize = 10;
            return activeDocument.pathItems.rectangle(bounds[1], bounds[0] - addingSize / 2, sizes[1] + addingSize, sizes[0] + addingSize);
        }
        if (this.typename === 'GroupItem') {
            return this.children('TextFrame').joinText(options);
        }
        if (options.frame === 'area') {
            var layer = activeDocument.layers.add(),
                frame = createAreaToSelection();
            LA(this, function (item, i, arr) {
                var sep = options.separator;
                if ((!options.reverse && !i) || (options.reverse && i === arr.length - 1)) {
                    sep = '';
                    var frameAttr = frame.textRange.characterAttributes,
                        itemAttr = item.textRange.characterAttributes;
                    frameAttr.textFont = app.textFonts.getByName(itemAttr.textFont.name);
                    frameAttr.size = itemAttr.size;
                }
                if (item.typename === 'TextFrame') {
                    frame.contents += sep + item.contents;
                }
            }, options.reverse).remove();
            return frame;
        }
        else {
            var t = '', frame,
                length = this.length,
                columnSeparator = '\n';
            if (options.frame === 'row') columnSeparator = '';
            LA(this, function (item, i) {
                if ((!options.reverse && !i) || (options.reverse && i === length - 1)) frame = item;
                else {
                    frame.contents += columnSeparator + options.separator + item.contents;
                    item.remove();
                }
            }, options.reverse);
            return frame;
        }
    };
    Object.prototype.font = function (attr) {
        function set(e) {
            var i = e.textRange.characterAttributes,
                t = i.textFont;
            i.size = $.convertUnits(attr.size, 'px') || i.size;
            i.fillColor = attr.fillColor || i.fillColor;
            i.rotation = parseFloat(attr.rotation) || i.rotation;
            i.stroked = attr.stroked || i.stroked;
            i.strokeColor = attr.strokeColor || i.strokeColor;
            if ($.convertUnits(attr.strokeWeight, 'px') === 0 || !attr.strokeWeight) {
                i.strokeWeight = 0; i.parent.stroked = false;
            }
            else {
                i.strokeWeight = $.convertUnits(attr.strokeWeight, 'px') || i.strokeWeight;
            }
            i.tracking = $.convertUnits(attr.tracking, 'px') || i.tracking;
            i.verticalScale = $.convertUnits(attr.verticalScale, 'px') || i.verticalScale;
            i.horizontalScale = $.convertUnits(attr.horizontalScale, 'px') || i.horizontalScale;
            i.leading = $.convertUnits(attr.leading, 'px') || i.leading;
            t.family = attr.family || t.family;
        }
        var obj = LA(this);
        for (var j = 0; j < obj.length; j++) {
            set(obj[j]);
        }
        return this;
    };


    // Swatches
    Object.prototype.getSwatches = function() {
        var arr = [], obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            arr = arr.concat(LA(obj[i].swatches));
        }
        return arr;
    };
    Object.prototype.getSwatchGroups = function() {
        var arr = [], obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            var length = obj[i].swatchGroups.length;
            for (var j = 1; j < length; j++) {
                arr = arr.concat(obj[i].swatchGroups[j]);
            }
        }
        return arr;
    };
    Object.prototype.getSwatchGroupsWithSwatches = function() {
        var groups = this.getSwatchGroups(), arr = [];
        LA(groups, function (group, i) {
            arr.push({
                name: group.name,
                swatches: group.getAllSwatches()
            });
        });
        return arr;
    };
    Object.prototype.getSwatchGroupsOnlySwatches = function() {
        var groups = this.getSwatchGroups(), arr = [];
        LA(groups, function (group, i) {
            arr = arr.concat(group.getAllSwatches());
        });
        return arr;
    };
    Object.prototype.getSwatchesSaveStructure = function (onlySelected) {
        var __swatches = {
            swatches: [],
            groups: []
        },
        obj = LA(this),
        length = obj.length;

        function __getAllSwatches (group, selected) {
            return onlySelected ? LA(group.getAllSwatches()).sameItems(selected) : group.getAllSwatches();
        }

        for (var i = 0; i < length; i++) {
            var selectedSwatches = obj[i].swatches.getSelected();
            LA(obj[i].swatchGroups, function (group, i) {
                if (!i) {
                    __swatches.swatches = __getAllSwatches(group, selectedSwatches);
                }
                    else {
                        __swatches.groups.push({
                            name: group.name,
                            swatches: __getAllSwatches(group, selectedSwatches)
                        });
                    }
            });
        }
        return __swatches;
    };
    Object.prototype.addSwatches = function (obj, property) {
        /*
            if (obj === 'group') property = {
                name : 'Name group',
                swatches : [
                    {
                        name : 'Name Swatch',
                        type : Swatch color type / ' String ',
                        values : Swatch color values / [ Array ],
                        color: [Color] / [Object]
                    }
                ],
                spots : [
                    {
                        name : 'Name spot color',
                        type : Spot color type / ' String ',
                        values : Spot color values / [ Array ],
                        colorType : ColorModel / ' String '
                        color: [Color] / [Object]
                    }
                ]
            },
            if (obj === 'swatch') property = {
                name : 'Name Swatch',
                type : Swatch color type / ' String ',
                values : Swatch color values / [ Array ]
                color: [Color] / [Object]
            }
        */
        function addSwatch(doc) {
            var collection = [];
            if (obj && property instanceof Object) {
                if (typeof obj === 'string') {
                    switch (obj.toLocaleLowerCase()) {
                        case 'group':
                            var sg = doc.swatchGroups.add();
                            sg.name = property.name || 'Untitled';
                            collection = collection.concat(sg);
                            if (property.swatches) {
                                if (property.swatches instanceof Object && !(property.swatches instanceof Array)) {
                                    property.swatches = [property.swatches];
                                }
                                if (property.swatches instanceof Array) {
                                    for (var i = 0; i < property.swatches.length; i++) {
                                        var s = doc.swatches.add();
                                        s.name = property.swatches[i].name || 'Untitled';
                                        s.color = property.swatches[i].color || $.color(property.swatches[i].type || 'cmyk', property.swatches[i].values || [0, 0, 0, 0]);
                                        sg.addSwatch(s);
                                    }
                                }
                            }
                            ; break;
                        case 'swatch':
                            if (property) {
                                if (property instanceof Object && !(property instanceof Array)) {
                                    property = [property];
                                }
                                if (property instanceof Array) {
                                    for (var i = 0; i < property.length; i++) {
                                        var s = doc.swatches.add();
                                        collection = collection.concat(s);
                                        s.name = property[i].name || 'Untitled';
                                        s.color = property[i].color || $.color(property[i].type || 'cmyk', property[i].values || [0, 0, 0, 0]);
                                    }
                                }
                            }
                            ; break;
                    }
                }
            }
            else {
                return doc;
            }
            return collection;
        }
        var arr = [], docs = LA(this);
        for (var i = 0; i < docs.length; i++) {
            arr = arr.concat(addSwatch(docs[i]));
        }
        return arr;
    };
    Object.prototype.transferSwatches = function (userOptions) {
        var options = {
            replace: false
        }.extend(userOptions || {}, true);
    
        var __doc = activeDocument,
            __swatches = LA(this).getSwatchesSaveStructure();
    
        // without group swatches
        LA(__swatches.swatches, function (swatch, i) {
            if (swatch.name !== '[Registration]' && swatch.name !== '[None]') {
                try {
                    var swatchOriginal = __doc.swatches.getByName(swatch.name);
                    if (options.replace) {
                        swatchOriginal.color = swatch.color;
                    }
                        else {
                            __doc.addSwatches('swatch', {
                                name: swatch.name + '_' + __swatches.swatches.length + i,
                                color: swatch.color
                            });
                        }
                }
                    catch (e) {
                        __doc.addSwatches('swatch', {
                            name: swatch.name,
                            color: swatch.color
                        });
                    }
            }
        });
        function checkName (name, items) {
            var x = items.length;
            while (x--) if (items[x].name === name) return items[x];
            return false;
        }
        
        // group swatches
        if (!options.replace) {
            LA(__swatches.groups, function (group, i) {
                __doc.addSwatches('group', {
                    name: group.name,
                    swatches: group.swatches
                });
            });
        }
            else {
                LA(__swatches.groups, function (group, i) {
                    try {
                        var __group = __doc.swatchGroups.getByName(group.name),
                            replaceSwatch, $gswatch;
    
                        for (var j = 0; j < group.swatches.length; j++) {
                            replaceSwatch = checkName(group.swatches[j].name, __group.getAllSwatches());
                            if (replaceSwatch) {
                                replaceSwatch.color = group.swatches[j].color;
                            }
                                else {
                                    $gswatch = __doc.swatches.add();
                                    $gswatch.name = group.swatches[j].name;
                                    $gswatch.color = group.swatches[j].color;
                                    __group.addSwatch($gswatch);
                                }
                        }
                    }
                        catch (e) {
                            __doc.addSwatches('group', {
                                name: group.name,
                                swatches: group.swatches
                            });
                        }
                });
            }
    };


    // Position
    Object.prototype.align = function (preset, options) {
        var obj = LA(this),
            default_options = {
                bounds: 'geometric',
                margin: '0 0 0 0',
                artboard: activeDocument.artboards.getActiveArtboardIndex(),
                object: {
                    node: undefined,
                    offset: 'outline',
                    bounds: 'geometric'
                },
            };
        function process(item, obj_length) {
            var rect = activeDocument.artboards[options.artboard].artboardRect,
                m = options.margin, distance = 0,
                gb = item.geometricBounds, vb = item.visibleBounds,
                w = item.width / 2, h = item.height / 2,
                offset = options.object.offset.slice(0, 1).toLocaleLowerCase();
            if (options.bounds.slice(0, 1).toLocaleLowerCase() === 'v') {
                distance = vb[2] - gb[2];
            }
            if (!options.object || !options.object.node) {
                if (preset === 'top') {
                    item.position = [item.position[0], rect[1] - distance - m[0]];
                }
                else if (preset === 'right') {
                    item.position = [rect[2] - (w * 2) - distance - m[1], item.position[1]];
                }
                else if (preset === 'bottom') {
                    item.position = [item.position[0], rect[3] + (h * 2) + distance + m[2]];
                }
                else if (preset === 'left') {
                    item.position = [rect[0] + distance + m[3], item.position[1]];
                }
                else if (preset === 'vcenter') {
                    item.position = [item.position[0], (rect[3] + rect[1]) / 2 + h];
                }
                else if (preset === 'hcenter') {
                    item.position = [(rect[2] + rect[0]) / 2 - w, item.position[1]];
                }
                else if (preset === 'topleft') {
                    item.position = [rect[0] + distance + m[3], rect[1] - distance - m[0]];
                }
                else if (preset === 'topcenter') {
                    item.position = [(rect[2] + rect[0]) / 2 - w, rect[1] - distance - m[0]];
                }
                else if (preset === 'topright') {
                    item.position = [rect[2] - (w * 2) - distance - m[1], rect[1] - distance - m[0]];
                }
                else if (preset === 'middleright') {
                    item.position = [rect[2] - (w * 2) - distance - m[2], (rect[3] + rect[1]) / 2 + h];
                }
                else if (preset === 'bottomright') {
                    item.position = [rect[2] - (w * 2) - distance - m[1], rect[3] + (h * 2) + distance + m[2]];
                }
                else if (preset === 'bottomcenter') {
                    item.position = [(rect[2] + rect[0]) / 2 - w, rect[3] + (h * 2) + distance + m[2]];
                }
                else if (preset === 'bottomleft') {
                    item.position = [rect[0] + distance + m[3], rect[3] + (h * 2) + distance + m[2]];
                }
                else if (preset === 'middleleft') {
                    item.position = [rect[0] + distance + m[3], (rect[3] + rect[1]) / 2 + h];
                }
                else if (preset === 'center') {
                    item.position = [(rect[2] + rect[0]) / 2 - w, (rect[3] + rect[1]) / 2 + h];
                }
            }
            else {
                if ((obj_length === 1) || (options.object.node === 'current') || (item !== options.object.node)) {
                    var obn = options.object.node;
                    if (!obn.typename && obn instanceof Array) {
                        var b = bgeo = obn.getBounds('geometricBounds');
                        if (options.object.bounds.slice(0, 1).toLocaleLowerCase() === 'v') {
                            b = obn.getBounds('visibleBounds');
                            bgeo[2] = b[2] - b[0];
                        }
                        var objt = b[1], objl = b[0],
                            objw = b[2] - b[0], objh = b[1] - b[3],
                            node_distance = 0, distance_count, ow = w, oh = h, count = -2;
                    }
                    else if (options.object.node.typename !== 'Artboard') {
                        if (options.object.node === 'current') {
                            var obn = item;
                        }
                        var b = bgeo = obn.geometricBounds,
                            objt = obn.top, objl = obn.left,
                            objw = obn.width, objh = obn.height,
                            node_distance = 0, distance_count, ow = w, oh = h, count = -2;
                        if (options.object.bounds.slice(0, 1).toLocaleLowerCase() === 'v') {
                            b = obn.visibleBounds;
                        }
                    }
                    else {
                        var b = bgeo = obn.artboardRect,
                            objt = b[1], objl = b[0],
                            objw = b[2] - b[0], objh = -b[3],
                            node_distance = 0, ow = w, oh = h, count = -2;
                    }
                    if (offset === 'i') {
                        var ow = 0, oh = 0, count = 2;
                    }
                    else {
                        for (var i = 0; i < m.length; i++) {
                            m[i] = -m[i];
                        }
                    }
                    if (offset !== 'i') {
                        distance_count = -distance;
                    }
                    function getpos() {
                        return {
                            top: b[1] + distance + node_distance - m[0] - (oh * count),
                            right: b[2] + distance + node_distance - m[1] - (ow * count),
                            bottom: b[3] - distance - node_distance + m[2] + (oh * count),
                            left: b[0] - distance - node_distance + m[3] + (ow * count)
                        }
                    }
                    if (preset === 'top') {
                        item.position = [item.position[0], getpos().top];
                    }
                    else if (preset === 'right') {
                        offset === 'i' ? ow = w : ow = 0;
                        item.position = [getpos().right, item.position[1]];
                    }
                    else if (preset === 'bottom') {
                        offset === 'i' ? oh = h : oh = 0;
                        item.position = [item.position[0], getpos().bottom];
                    }
                    else if (preset === 'left') {
                        item.position = [getpos().left, item.position[1]];
                    }
                    else if (preset === 'vcenter') {
                        item.position = [item.position[0], bgeo[1] - (objh / 2) + h];
                    }
                    else if (preset === 'hcenter') {
                        item.position = [bgeo[0] + (objw / 2) - w, item.position[1]];
                    }
                    else if (preset === 'topleft') {
                        item.position = [getpos().left, getpos().top];
                    }
                    else if (preset === 'topcenter') {
                        item.position = [bgeo[0] + (objw / 2) - w, getpos().top];
                    }
                    else if (preset === 'topright') {
                        offset === 'i' ? ow = w : ow = 0;
                        item.position = [getpos().right, getpos().top];
                    }
                    else if (preset === 'middleright') {
                        offset === 'i' ? ow = w : ow = 0;
                        item.position = [getpos().right, bgeo[1] - (objh / 2) + h];
                    }
                    else if (preset === 'bottomright') {
                        offset === 'i' ? ow = w : ow = 0;
                        offset === 'i' ? oh = h : oh = 0;
                        item.position = [getpos().right, getpos().bottom];
                    }
                    else if (preset === 'bottomcenter') {
                        offset === 'i' ? oh = h : oh = 0;
                        item.position = [bgeo[0] + (objw / 2) - w, getpos().bottom];
                    }
                    else if (preset === 'bottomleft') {
                        offset === 'i' ? oh = h : oh = 0;
                        item.position = [getpos().left, getpos().bottom];
                    }
                    else if (preset === 'middleleft') {
                        item.position = [getpos().left, bgeo[1] - (objh / 2) + h];
                    }
                    else if (preset === 'center') {
                        item.position = [bgeo[0] + (objw / 2) - w, bgeo[1] - (objh / 2) + h];
                    }
                }
            }
        }
        if (options) {
            options.checkObjPrototypes(default_options);
        }
        else {
            options = default_options;
        }
        options.margin = options.margin.split(' ');
        if (options.margin.length === 2) {
            options.margin[2] = options.margin[0];
            options.margin[3] = options.margin[1];
        }
        else if (options.margin.length < 4) {
            var val = options.margin[options.margin.length - 1];
            for (var i = options.margin.length; i < 4; i++) {
                options.margin[i] = val;
            }
        }
        for (var i = 0; i < options.margin.length; i++) {
            options.margin[i] = options.margin[i].toString().convertUnits('px');
        }
        options.bounds = options.bounds.slice(0, 1).toLocaleLowerCase();
        for (var i = 0; i < obj.length; i++) {
            process(obj[i], obj.length);
        }
        return this;
    };
    Object.prototype.top = function (e, t) {
        return LA(LA_Position(this, e, 'top', t));
    };
    Object.prototype.right = function (e, t) {
        return LA(LA_Position(this, e, 'right', t));
    };
    Object.prototype.bottom = function (e, t) {
        return LA(LA_Position(this, e, 'bottom', t));
    };
    Object.prototype.left = function (e, t) {
        return LA(LA_Position(this, e, 'left', t));
    };


    // Transformations
    Object.prototype.reflection = function (c) {
        try {
            var a = b = 100, obj = LA(this);
            c = c.split(',');
            for (var i = 0; i < c.length; i++) {
                c[i] = c[i].toLocaleLowerCase().slice(0, 1);
                if ((c[i] === 'y') || (c[i] === 'h')) b = -100;
                else if ((c[i] === 'x') || (c[i] === 'v')) a = -100;
                for (var j = 0; j < obj.length; j++) obj[j].resize(a, b);
            }
            return this;
        }
        catch (e) {
            $.errorMessage('reflection - error: ' + e);
        }
    };
    Object.prototype.scale = function (w, h, t_obj, t_fillpatt, t_fillgrad, t_strokepatt) {
        scale = [w || 100, h || w];

        t_obj = (typeof t_obj === 'boolean' ? t_obj : true);
        t_fillpatt = (typeof t_fillpatt === 'boolean' ? t_fillpatt : true);
        t_fillgrad = (typeof t_fillgrad === 'boolean' ? t_fillgrad : true);
        t_strokepatt = (typeof t_strokepatt === 'boolean' ? t_strokepatt : true);

        function toScale(item, size) {
            var random_value = 10 + Math.floor(Math.random() * 170);

            if ((size[0] === 'random') && (size[1] instanceof Array)) {
                var _value = size[1][0] + Math.floor(Math.random() * (size[1][1] - size[1][0]));
                size = [_value, _value];
            }
                else if ((size[0] === 'random') && (size[2] !== 'random')) {
                    size = [random_value, random_value];
                }
                else if ((size[0] === 'random') && (size[2] === 'random')) {
                    size = [10 + Math.floor(Math.random() * 170), 10 + Math.floor(Math.random() * 170)];
                }

            item.resize(size[0], size[1] || size[0], t_obj, t_fillpatt, t_fillgrad, t_strokepatt);
        }

        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            toScale(obj[i], scale);
        }

        return this;
    };
    Object.prototype.rotation = function (degMin, degMax, t_obj, t_fillpatt, t_fillgrad, t_strokepatt) {
        __value = degMin;

        if ((degMin !== 'random') && (degMax === undefined)) __value = [degMin];
            else if (((degMin === 'random') && (degMax instanceof Array)) || ((typeof degMin === 'number') && (typeof degMax === 'number'))) __value = [degMin, degMax];

        t_obj = (typeof t_obj === 'boolean' ? t_obj : true);
        t_fillpatt = (typeof t_fillpatt === 'boolean' ? t_fillpatt : true);
        t_fillgrad = (typeof t_fillgrad === 'boolean' ? t_fillgrad : true);
        t_strokepatt = (typeof t_strokepatt === 'boolean' ? t_strokepatt : true);

        function toRotate(item, _val) {
            var $value = [],
                random_value = Math.floor(Math.random() * 360);

            if (_val.length === 1 && typeof _val[0] === 'number') {
                $value = [_val[0]];
            }
                if ((_val[0] === 'random') && (_val[1] instanceof Array)) {
                    var $value = _val[1][0] + Math.floor(Math.random() * (_val[1][1] - _val[1][0]));
                    $value = [$value];
                }
                else if ((typeof _val[0] === 'number') && (typeof _val[1] === 'number')) {
                    var $value = _val[0] + Math.floor(Math.random() * (_val[1] - _val[0]));
                    $value = [$value];
                }
                else if (_val[0] === 'random') {
                    $value = [random_value];
                }

            item.rotate($value[0], t_obj, t_fillpatt, t_fillgrad, t_strokepatt);

        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            toRotate(obj[i], __value);
        }

        return this;
    };
    Object.prototype.Translate = function (x, y, t_obj, t_fillpatt, t_fillgrad, t_strokepatt) {
        function Translate(item, size) {
            item.translate(x, y, t_obj, t_fillpatt, t_fillgrad, t_strokepatt);
        }
        var obj = LA(this), value;
        for (var i = 0; i < obj.length; i++) {
            Translate(x.toString().convertUnits('px'), y.toString().convertUnits('px'));
        }
        return this;
    };


    // Color
    Object.prototype.getColor = function (mode, property) {
        var arr = [];
        function color(i) {
            switch (mode) {
                case 'fill':
                    return get(i.fillColor || i.textRange.fillColor);
                    break;
                case 'stroke':
                    return get(i.strokeColor || i.textRange.strokeColor);
                    break;
                case undefined:
                    return [get(i.fillColor || i.textRange.fillColor), get(i.strokeColor || i.textRange.strokeColor)];
                    break;
                case mode:
                    return undefined;
                    break;
            }
            function get(j) {
                if (property === 'type') {
                    return j.typename;
                }
                else if (property === 'values') {
                    return j.getColorValues();
                }
                else {
                    return j;
                }
            }
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (obj.typename !== 'GroupItem') {
                if (obj.typename === 'CompoundPathItem') {
                    arr = arr.concat(color(obj[i].pathItems[0]));
                }
                else {
                    arr = arr.concat(color(obj[i]));
                }
            }
        }
        if (arr.length === 1) return arr[0];
        return arr;
    };
    Object.prototype.fastReplaceColor = function (options) {
        var backup = {
            sel: selection,
            doc: activeDocument
        }, modes = [], // [fill, stroke]
            findColor = showColorPicker($.color($.getColorMode('shortname').toLocaleLowerCase())),
            replaceColor = showColorPicker($.color($.getColorMode('shortname').toLocaleLowerCase()));
        for (var i in options) {
            if (options[i] === 'true') {
                options[i] = true;
            }
            else if (options[i] === 'false') {
                options[i] = false;
            }
        }

        function process(doc, mode) {
            doc.activate();
            selection = null;
            var backupColor = doc['default' + mode + 'Color'];
            doc['default' + mode + 'Color'] = findColor;
            $.command('Find Fill Color menu item');
            doc['default' + mode + 'Color'] = replaceColor;
            selection = null;
            doc['default' + mode + 'Color'] = backupColor;
            selection = backup.sel;
        }
        if (options.fill === true) {
            selection = null;
            modes.push('Fill');
        }
        if (options.stroke === true) {
            selection = null;
            modes.push('Stroke');
        }
        var obj = LA(this);
        for (var i = 0; i < modes.length; i++) {
            for (var j = 0; j < obj.length; j++) {
                if (obj[j].typename === 'Document') process(obj[j], modes[i]);
                else process(activeDocument, modes[i]);
            }
        }
        backup.doc.activate();
        selection = backup.sel;
    };
    Object.prototype.replaceColor = function (options) {
        /*
            options = {
                find : {
                    type : ' String ',
                    values : [ Array ]
                },
                replace : {
                    type : ' String ',
                    values : [ Array ]
                },
                fill : Boolean,
                stroke : Boolean,
                text : ' String ',
                mode : 'fast'
            }
        */
        for (var i in options) {
            if (options[i] === 'true') {
                options[i] = true;
            }
            else if (options[i] === 'false') {
                options[i] = false;
            }
        }
        var find, replace,
            backup = {
                doc: activeDocument
            },
            textFrames = $.getArr(activeDocument.textFrames);
        $.isColor(options.find) ? find = options.find : find = $.color(options.find.type, options.find.values);
        $.isColor(options.replace) ? replace = options.replace : replace = $.color(options.replace.type, options.replace.values);
        function fill() {
            // relace fill color
            if (options.fill) {
                selection = null;
                activeDocument.defaultFillColor = find;
                $.command('Find Fill Color menu item');
                if (options.text === 'ranges') {
                    selection = LA(selection).removeItemsWithArray(textFrames);
                }
                activeDocument.defaultFillColor = replace;
            }
        }
        function stroke() {
            // replace stroke color
            if (options.stroke) {
                selection = null;
                activeDocument.defaultStrokeColor = find;
                $.command('Find Stroke Color menu item');
                if (options.text === 'ranges') {
                    selection = LA(selection).removeItemsWithArray(textFrames);
                }
                activeDocument.defaultStrokeColor = replace;
            }
        }
        function text(object) {
            // replace chars with textFrames
            if (options.fill || options.stroke) {
                if (object) {
                    object = [object];
                }
                var arr = object || textFrames;
                for (var i = 0; i < arr.length; i++) {
                    var j = arr[i].textRanges.length;
                    if (options.text === 'ranges') {
                        while (j--) {
                            reText(arr[i].textRanges[j]);
                        }
                    }
                    else {
                        reText(arr[i]);
                    }
                }
            }
            function reText(object) {
                if (options.fill && LA(LA(LA(object.fillColor).getColorValues()).parseVal()).comparingArrays(LA(LA(find).getColorValues()).parseVal())) {
                    object.fillColor = replace;
                }
                if (options.stroke && LA(LA(LA(object.strokeColor).getColorValues()).parseVal()).comparingArrays(LA(LA(find).getColorValues()).parseVal())) {
                    object.strokeColor = replace;
                }
            }
        }
        function gradient(object, mode) {
            // replace gradient color
            if (options.fill || options.stroke && replace.typename !== 'GradientColor') {
                if (object) {
                    object = [object];
                }
                var paths = object || activeDocument.items('PathItem').get(),
                    i = paths.length, filled = options.fill,
                    stroked = options.stroke;
                if (mode === 'fill') {
                    filled = true; stroked = false;
                }
                else if (mode === 'stroke') {
                    filled = false; stroked = true;
                }
                while (i--) {
                    if (filled && paths[i].fillColor.typename === 'GradientColor') {
                        checkGradient(paths[i], true);
                    }
                    if (stroked && paths[i].strokeColor.typename === 'GradientColor') {
                        checkGradient(paths[i], false);
                    }
                }
            }
            function checkGradient(obj, mode) {
                if (mode) {
                    var g = obj.fillColor.gradient.gradientStops;
                }
                else {
                    var g = g = obj.strokeColor.gradient.gradientStops;
                }
                var i = g.length;
                while (i--) {
                    if (g[i].color.getColorValues().parseVal().comparingArrays(find.getColorValues().parseVal())) {
                        g[i].color = replace;
                    }
                }
            }
        }
        function replaceSelection(objects) {
            var i = objects.length;
            while (i--) {
                if (objects[i].typename === 'PathItem') {
                    if (options.fill) {
                        if (objects[i].fillColor.typename === 'GradientColor') {
                            gradient(objects[i], 'fill');
                        }
                        else if (LA(LA(LA(objects[i].fillColor).getColorValues()).parseVal()).comparingArrays(LA(LA(find).getColorValues()).parseVal())) {
                            objects[i].fillColor = replace;
                        }
                    }
                    if (options.stroke) {
                        if (objects[i].strokeColor.typename === 'GradientColor') {
                            gradient(objects[i], 'stroke');
                        }
                        else if (LA(LA(LA(objects[i].strokeColor).getColorValues()).parseVal()).comparingArrays(LA(LA(find).getColorValues()).parseVal())) {
                            objects[i].strokeColor = replace;
                        }
                    }
                }
                else if (objects[i].typename === 'TextFrame') {
                    text(objects[i]);
                }
                else if (objects[i].typename === 'CompoundPathItem') {
                    replaceSelection(LA(objects[i]).children('PathItem'));
                }
                else if (objects[i].typename === 'GroupItem') {
                    replaceSelection(LA(objects[i]).children(['PathItem', 'TextFrame']));
                }
            }
        }
        function get_backup_data() {
            backup = {
                doc: backup.doc,
                selection: activeDocument.selection,
                fill: activeDocument.defaultFillColor,
                stroke: activeDocument.defaultStrokeColor
            }
        }
        function return_backup_data() {
            // backup options
            selection = null;
            activeDocument.defaultFillColor = backup.fill;
            activeDocument.defaultStrokeColor = backup.stroke;
            selection = backup.selection;
        }
        function process(objects) {
            if (objects) {
                var arr = objects;
                if ((options.mode === 'fast') || (arr.typename === 'Documents') || (arr.typename === 'Document')) {
                    if (!$.isArr(arr)) arr = [objects];
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].activate();
                        get_backup_data();
                        fill();
                        stroke();
                        text();
                        gradient();
                        return_backup_data();
                    }
                }
                else {
                    get_backup_data();
                    replaceSelection(objects);
                    return_backup_data();
                }
                backup.doc.activate();
                return objects;
            }
        }
        process(this);
        return this;
    };


    // Styles paragraph & character
    Object.prototype.getItemsOfStyle = function () {
        var i = this.parent.items('TextFrame'),
            arr = [];
        for (var j = 0; j < i.length; j++) {
            var e = i[j].textRange;
            if (this.typename === 'ParagraphStyle') {
                e = e.paragraphStyles;
            }
            else if (this.typename === 'CharacterStyle') {
                e = e.characterStyles;
            }
            else {
                return undefined;
            }
            if (e.length > 0) {
                for (var n = 0; n < e.length; n++) {
                    if (this.name === e[n].name) {
                        arr = arr.concat(i[j]);
                    }
                }
            }
        }
        return arr;
    };
    Object.prototype.ApplyTo = function (style, clear) {
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            style.applyTo(obj[i].textRange, clear || true);
        }
    };


    // global
    Object.prototype.get = function (attr) {
        /*
        * Example: selection.get('name');
        * return an array of the names of selected items;
        */
        return $.getArr(this, attr);
    };
    Object.prototype.getBy = function (attr, value) {
        /*
        * Example: activeDocument.getBy('name', 'logo');
        * return all items with the name 'logo';
        */
        var items = LA(this).items(), arr = [];
        for (var i = 0; i < items.length; i++) {
            if (items[i][attr] === value) {
                arr.push(items[i]);
            }
        }
        return arr;
    };
    Object.prototype.Index = function () {
        if (this === undefined) {
            return 'No such element!';
        }
        var obj;
        if (this.typename === 'Document') {
            obj = documents;
        }
        else if (this.typename === 'Artboard') {
            obj = this.parent.artboards;
        }
        else if (this.typename === 'Layer') {
            obj = this.parent.layers;
        }
        else if (this.typename !== undefined) {
            obj = this.parent.pageItems;
        }
        for (var i = 0; i < obj.length; i++) {
            if (obj[i] === this) {
                return i;
            }
        }
        return -1;
    };
    Object.prototype.getIndex = function () {
        var obj = this.parent.pageItems;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i] === this) {
                return i;
            }
        }
        return -1;
    };
    Object.prototype.remove = function (forced) {
        var obj = LA(this), i = obj.length;
        while (i--) {
            if (forced === true) {
                obj[i].forcedChange(function (_obj) {
                    _obj.remove();
                });
            }
            else {
                obj[i].remove();
            }
        }
    };
    Object.prototype.selected = function (value) {
        var obj = LA(this);
        if (value === undefined) {
            value = true;
        }
        else if (typeof value !== 'boolean') {
            $.errorMessage('Type error: " ' + value + ' "');
            return false;
        }
        for (var i = 0; i < obj.length; i++) {
            obj[i].selected = value;
        }
        return obj;
    };
    Object.prototype.show = function (value) {
        var obj = LA(this), arr = [];
        // if (value === true) {
        //     value = false;
        // }
        //     else if (value === false) {
        //         value = true;
        //     }
        function process(item) {
            if (item.typename === 'Document') {
                for (var j = 0; j < item.layers.length; j++) {
                    set(item.layers[j], 'visible');
                }
            }
            else if (item.typename === 'Layer') {
                set(item, 'visible');
            }
            else if (item.typename) {
                set(item, 'hidden');
            }
            function set(a, b) {
                if (typeof value === 'boolean') {
                    a.forcedChange(function (_obj) {
                        if (value) {
                            _obj[b] = false;
                        }
                        else {
                            _obj[b] = true;
                        }
                    });
                }
                else {
                    if (b === 'visible') {
                        if (a[b]) {
                            arr.push(false);
                        }
                        else {
                            arr.push(true);
                        }
                    }
                    else {
                        arr.push(a[b]);
                    }
                }
            }
        }
        for (var i = 0; i < obj.length; i++) {
            process(obj[i]);
        }
        if (value === undefined) {
            if (arr.length === 1) {
                return arr[0];
            }
            else {
                return arr;
            }
        }
        else {
            return obj;
        }
    };
    Object.prototype.lock = function (value) {
        var arr = [];
        function get(i) {
            i.forcedChange(function (_obj) {
                value === undefined ? arr = arr.concat(_obj.locked) : _obj.locked = value;
            });
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            get(obj[i]);
        }
        if (value === undefined) {
            if (arr.length === 1) {
                return arr[0];
            }
            else {
                return arr;
            }
        }
        else {
            return this;
        }
    };
    Object.prototype.unlockAll = function () {
        function unlock(items) {
            var i = items.length;
            if (i) {
                while (i--) {
                    items[i].locked = false;
                    if (items[i].typename === 'GroupItem') {
                        unlock(items[i].pageItems);
                    }
                    else if (items[i].typename === 'Layer') {
                        unlock(items[i].layers);
                        unlock(items[i].pageItems);
                    }
                }
            }
        }

        unlock(this instanceof Array ? this : LA(this));
        return this;
    };
    Object.prototype.Opacity = function (value, __randomValues) {
        /*
        * value : Number or String
        * Example: selection.opacity(50)
        * return the same items and change the opacity
        * Example: selection.opacity()
        * return new array 
        */
       __randomValues = (__randomValues instanceof Array && __randomValues.length > 1 ? __randomValues : [5, 95]);
        function set(item, val) {
            val === 'random' ? val = Math.floor(__randomValues[0] + Math.random() * (__randomValues[1] - __randomValues[0])) : val = parseFloat(val) || item.opacity;
            arr.push(val);
            item.opacity = val;
        }
        var obj = LA(this), arr = [];
        for (var i = 0; i < obj.length; i++) {
            set(obj[i], value);
        }
        if (value === undefined) {
            if (arr.length === 1) {
                return arr[0];
            }
            else {
                return arr;
            }
        }
        else {
            return this;
        }
    };
    Object.prototype.fill = function (type, values) {
        /*
        * Example: activeDocument.pathItems.fill('hex', '00c8ff');
        * return the same items and replace the color
        * Example: activeDocument.pathItems.fill(false);
        * returns the same items and disable filled
        */
        var obj = LA(this),
            swatches = activeDocument.swatches.getSelected(),
            swatchesLength = swatches.length;

        if (!swatchesLength) {
            swatches = activeDocument.swatches;
            swatchesLength = swatches.length;
        }

        for (var i = 0; i < obj.length; i++) {
            if ((obj[i].typename === 'GroupItem') || (obj[i].typename === 'CompoundPathItem')) {
                obj[i].children().fill(type, values);
            }
            else {
                if (obj[i].fillColor && !obj[i].clipping && !obj[i].guides) {
                    if (type === 'random') {
                        obj[i].fillColor = $.color($.getColorMode('shortname'), 'random');
                    }
                    else if ((type === 'darken') || (type === 'lighten')) {
                        obj[i].fillColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].fillColor, values);
                    }
                    else if (type === 'swatches') {
                        obj[i].fillColor = swatches[Math.floor(Math.random() * swatchesLength)].color;
                    }
                    else if ($.isColor(type)) {
                        if (obj[i].fillColor) obj[i].fillColor = type;
                    }
                    else {
                        type === false ? obj[i].filled = false : obj[i].fillColor = $.color(type, values);
                    }
                }
                else if (obj[i].textRange) {
                    if (type === 'random') {
                        obj[i].textRange.characterAttributes.fillColor = $.color($.getColorMode('shortname'), 'random');
                    }
                    else if ((type === 'darken') || (type === 'lighten')) {
                        obj[i].fillColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].fillColor, values);
                    }
                    else if (type === 'swatches') {
                        var __clr = swatches[Math.floor(Math.random() * swatchesLength)].color;
                        if (__clr.typename !== 'GradientColor' && __clr.typename !== 'NoColor') obj[i].textRange.characterAttributes.fillColor = __clr;
                            else obj[i].fill('random');
                    }
                    else if ($.isColor(type)) {
                        obj[i].textRange.characterAttributes.fillColor = type;
                    }
                    else {
                        type === false ? obj[i].textRange.characterAttributes.filled = false : obj[i].textRange.characterAttributes.fillColor = $.color(type, values);
                    }
                }
            }
        }
        return this;
    };
    Object.prototype.strokecolor = function (type, values) {
        /*
        * Example: activeDocument.pathItems.strokecolor('hex', '00c8ff');
        * return the same items and replace the color
        * Example: activeDocument.pathItems.strokecolor(false);
        * returns the same items and disable stroked
        */
        var obj = LA(this),
            swatches = activeDocument.swatches.getSelected(),
            swatchesLength = swatches.length;

        if (!swatchesLength) {
            swatches = activeDocument.swatches;
            swatchesLength = swatches.length;
        }

        for (var i = 0; i < obj.length; i++) {
            if ((obj[i].typename === 'GroupItem') || (obj[i].typename === 'CompoundPathItem')) {
                obj[i].children().strokecolor(type, values);
            }
            else {
                if (obj[i].strokeColor && !obj[i].clipping && !obj[i].guides) {
                    if (type === 'random') {
                        obj[i].strokeColor = $.color($.getColorMode('shortname'), 'random');
                    }
                    else if ((type === 'darken') || (type === 'lighten')) {
                        obj[i].strokeColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].strokeColor, values);
                    }
                    else if (type === 'swatches') {
                        obj[i].strokeColor = swatches[Math.floor(Math.random() * swatchesLength)].color;
                    }
                    else if ($.isColor(type)) {
                        if (obj[i].strokeColor) obj[i].strokeColor = type;
                    }
                    else {
                        type === false ? obj[i].stroked = false : obj[i].strokeColor = $.color(type, values);
                    }
                }
                else if (obj[i].textRange) {
                    if (type === 'random') {
                        obj[i].textRange.characterAttributes.strokeColor = $.color($.getColorMode('shortname'), 'random');
                    }
                    else if ((type === 'darken') || (type === 'lighten')) {
                        obj[i].strokeColor = $['color' + type.slice(0,1).toUpperCase() + type.slice(1)](obj[i].strokeColor, values);
                    }
                    else if (type === 'swatches') {
                        var __clr = swatches[Math.floor(Math.random() * swatchesLength)].color;
                        if (__clr.typename !== 'GradientColor' && __clr.typename !== 'NoColor') obj[i].strokeColor = __clr;
                            else obj[i].strokecolor('random');
                    }
                    else if ($.isColor(type)) {
                        obj[i].textRange.characterAttributes.strokeColor = type;
                    }
                    else {
                        type === false ? obj[i].textRange.characterAttributes.stroked = false : obj[i].textRange.characterAttributes.strokeColor = $.color(type, values);
                    }
                }
            }
        }
        return this;
    };
    Object.prototype.stroke = function (width, type, values) {
        /*
        * width : String
        * type : String
        * values : Array
        * Example: activeDocument.pathItems.stroke('10 mm', 'hex', '00c8ff');
        * return the same items and replace the color of the stroke and replace stroke width
        * Example: activeDocument.pathItems.stroke('hex', '00c8ff')
        * return the same items and replace the color
        * Example: activeDocument.pathItems.stroke('10 mm')
        * the same items and replace stroke width
        */
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename === 'GroupItem') {
                LA(obj[i].pageItems).stroke(width, type, values);
            }
            else if (obj[i].typename === 'CompoundPathItem') {
                // obj[i].children().stroke(width, type, values);
                LA(obj[i].pathItems).stroke(width, type, values);
            }
            else {
                if (width === 'random') {
                    obj[i].stroke(1 + Math.random() * 40, $.getColorMode('shortname'), 'random');
                }
                else {
                    if (width === false || width === 0) {
                        if (obj[i].strokeColor && !obj[i].clipping && !obj[i].guides) {
                            obj[i].stroked = false;
                        }
                        else if (obj[i].textRange) {
                            obj[i].textRange.characterAttributes.strokeWeight = 0;
                        }
                    }
                    else if (typeof width === 'number' && !isNaN(parseInt(width)) && width !== null) {
                        if (obj[i].strokeColor && !obj[i].clipping && !obj[i].guides) {
                            obj[i].strokeWidth = width || obj[i].strokeWidth;
                        }
                        else if (obj[i].textRange) {
                            obj[i].textRange.characterAttributes.strokeWeight = width || obj[i].textRange.characterAttributes.strokeWeight;
                        }
                    }
                    if (width && type && !values) {
                        values = type;
                        type = width;
                        width = undefined;
                    }
                    else if (width === null && type === 'random' && !values) {
                        type = $.getColorMode('shortname');
                        values = 'random';
                    }
                    if (type && values) {
                        type = type === 'docColorMode' ? $.getColorMode('shortname') : type;
                        if (obj[i].strokeColor && !obj[i].clipping && !obj[i].guides) {
                            if (!obj[i].stroked) obj[i].stroked = true;
                            obj[i].strokeColor = $.color(type, values);
                        }
                        else if (obj[i].textRange) {
                            if (obj[i].textRange.characterAttributes.strokeColor.typename !== 'NoColor') obj[i].textRange.characterAttributes.strokeColor = $.color(type, values);
                        }
                    }
                }
            }
        }
        return this;
    };
    Object.prototype.Width = function (size, userOptions) {
        /*
        * size : String or Number
        * prop : Boolean
        * Example: selection.width('10 mm', true);
        * return the same item and change the width and proportional height
        */
        var options = {
            constrain: false,
            anchor: undefined
        };
        userOptions === undefined ? userOptions = options : userOptions;

        if (typeof userOptions === 'boolean') {
            options.constrain = userOptions;
            if (typeof arguments[2] === 'string') options.anchor = arguments[2];
            userOptions = options;
        }
        else if (typeof userOptions === 'string') {
            options.anchor = userOptions;
            if (typeof arguments[2] === 'boolean') options.constrain = arguments[2];
            userOptions = options;
        }
        return LA_WH(this, size, userOptions, 'width');
    };
    Object.prototype.Height = function (size, userOptions) {
        /*
        * size : String or Number
        * prop : Boolean
        * Example: selection.height('10 mm', true);
        * return the same item and change the height and proportional width
        */
        var options = {
            constrain: false,
            anchor: undefined
        };
        userOptions === undefined ? userOptions = options : userOptions;

        if (typeof userOptions === 'boolean') {
            options.constrain = userOptions;
            if (typeof arguments[2] === 'string') options.anchor = arguments[2];
            userOptions = options;
        }
        else if (typeof userOptions === 'string') {
            options.anchor = userOptions;
            if (typeof arguments[2] === 'boolean') options.constrain = arguments[2];
            userOptions = options;
        }
        return LA_WH(this, size, userOptions, 'height');
    };
    Object.prototype.attr = function (options) {
        var obj = LA(this);
        if (options) {
            options.objectParser();
            for (var i = 0; i < obj.length; i++) {
                for (var j in options) {
                    for (var n in obj[i]) {
                        if (j === n && !(options[j] instanceof Function)) {
                            obj[i].forcedChange(function (_obj) {
                                _obj[n] = options[j];
                            });
                        }
                    }
                }
            }
        }
        return this;
    };
    Object.prototype.appendTo = function (relativeObject, elementPlacement) {
        var obj = LA(this), i = obj.length;
        if (typeof elementPlacement === 'string' && elementPlacement.length) {
            switch (elementPlacement.toLowerCase()) {
                case 'inside': elementPlacement = 'INSIDE'; break;
                case 'begin': elementPlacement = 'PLACEATBEGINNING'; break;
                case 'end': elementPlacement = 'PLACEATEND'; break;
                case 'before': elementPlacement = 'PLACEBEFORE'; break;
                case 'after': elementPlacement = 'PLACEAFTER'; break;
                default: elementPlacement = '';
            }
        }
        while (i--) {
            if (obj[i].parent !== relativeObject && obj[i] !== relativeObject) {
                if (!elementPlacement) obj[i].moveToBeginning(relativeObject);
                    else obj[i].move(relativeObject, ElementPlacement[elementPlacement]);
            }
        }
        return this;
    };
    Object.prototype.zIndex = function (index) {
        var obj = LA(this), arr = [];
        function process(method) {
            var i = obj.length;
            while (i--) {
                if (obj[i].zOrder && typeof method === 'string') {
                    obj[i].zOrder(ZOrderMethod[method]);
                }
                else {
                    var obj_index = obj[i].Index(),
                        _method, length = 0;
                    if (obj_index > method) {
                        length = obj_index - method;
                        _method = 'BRINGFORWARD';
                    }
                    else if (obj_index < method) {
                        length = method - obj_index;
                        _method = 'SENDBACKWARD';
                    }
                    for (var j = 0; j < length; j++) {
                        obj[i].zOrder(ZOrderMethod[_method]);
                    }
                }
            }
        }
        function get(node) {
            var childs = node.parent.pageItems, i = childs.length;
            while (i--) { if (childs[i] === node) return i; }
            return -1;
        }
        if (index === undefined) {
            var l = obj.length;
            for (var i = 0; i < l; i++) arr.push(get(obj[i]));
            if (arr.length === 1) return arr[0];
            return arr;
        }
        else if (typeof index === 'number') {
            process(parseInt(index));
        }
        else if (typeof index === 'string') {
            index = index.toString().toLocaleLowerCase();
            if (index.slice(0, 1) === '+') {
                index = index.slice(1);
                if (!(isNaN(parseInt(index)))) {
                    for (var i = 0; i < index; i++) {
                        process('BRINGFORWARD');
                    }
                }
            }
            else if (index.slice(0, 1) === '-') {
                index = index.slice(1);
                if (!(isNaN(parseInt(index)))) {
                    for (var i = 0; i < index; i++) {
                        process('SENDBACKWARD');
                    }
                }
            }
            else if ((index === 'up') || (index === 'front')) {
                process('BRINGFORWARD');
            }
            else if ((index === 'down') || (index === 'back')) {
                process('SENDBACKWARD');
            }
            else if ((index === 'first') || (index === 'top')) {
                process('BRINGTOFRONT');
            }
            else if ((index === 'last') || (index === 'bottom')) {
                process('SENDTOBACK');
            }
        }
        return this;
    };
    Object.prototype.Duplicate = function (options) {
        /*
            options = {
                copies : Number,
                place : ' String ',
                place_object : {[ Object ]}
            }
        */
        var arr = [],
            default_options = {
                copies: 1,
                place: 'after',
                selected: true,
                ignoreOriginal: false,
                place_object: undefined
            };
        function createDuplicate(item, place) {
            var length = parseInt(options.copies);
            options.place_object = options.place_object || item;
            for (var i = 0; i < length; i++) {
                create(item, place);
            }
            function create(e, p) {
                var copy = undefined;
                switch (p.toLocaleLowerCase().slice(0, 3)) {
                    case 'ins':
                        copy = e.duplicate(options.place_object || e, ElementPlacement.INSIDE);
                        break;
                    case 'beg':
                        copy = e.duplicate(options.place_object || e, ElementPlacement.PLACEATBEGINNING);
                        break;
                    case 'end':
                        copy = e.duplicate(options.place_object || e, ElementPlacement.PLACEATEND);
                        break;
                    case 'bef':
                        copy = e.duplicate(options.place_object || e, ElementPlacement.PLACEBEFORE);
                        break;
                    case 'aft':
                        copy = e.duplicate(options.place_object || e, ElementPlacement.PLACEAFTER);
                        break;
                    case p:
                        copy = create(e, 'after');
                        break;
                }
                if (copy) {
                    if (!options.selected) e.selected = options.selected;
                    arr.push(copy);
                }
                return copy;
            }
        }
        if (options) {
            options = options.checkObjPrototypes(default_options);
        }
        else {
            options = default_options;
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            if (!options.ignoreOriginal) arr = arr.concat(obj[i]);
            createDuplicate(obj[i], options.place);
        }
        return arr;
    };
    Object.prototype.getHiddenPath = function () {
        var arr = [];
        function get(item) {
            var items = item.children('PathItem'), i = items.length;
            while (i--) {
                if ((items[i].pathPoints.length <= 1) || (!items[i].stroked && !items[i].filled && !items[i].clipping)) {
                    arr = arr.concat(items[i]);
                }
            }
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            get(obj[i]);
        }
        return arr;
    };
    Object.prototype.shape = function (type, obj) {
        /*
        */
        var arr = [];
        function create(i, e) {
            var p = [], i = i.pathItems;
            if (!$.isArr(e)) {
                p = e;
            }
            else if (typeof e !== 'object') {
                return undefined;
            }
            switch (type) {
                case 'ellipse':
                    arr = arr.concat(i.ellipse(LA(p[0]).convertUnits('px') || LA(e.x).convertUnits('px') || 0, LA(p[1]).convertUnits('px') || LA(e.y).convertUnits('px') || 0, LA(p[2]).convertUnits('px') || LA(e.width).convertUnits('px') || 0, LA(p[3]).convertUnits('px') || LA(e.height).convertUnits('px') || 0, p[4] || e.reversed || false, p[5] || e.inscribed || false));
                    break;
                case 'polygon':
                    arr = arr.concat(i.polygon(LA(p[0]).convertUnits('px') || LA(e.centerX).convertUnits('px') || 0, LA(p[1]).convertUnits('px') || LA(e.centerY).convertUnits('px') || 0, LA(p[2]).convertUnits('px') || LA(e.radius).convertUnits('px') || 0, parseInt(p[3]) || parseInt(e.sides) || 0, p[4] || e.reversed || false));
                    break;
                case 'rectangle':
                    arr = arr.concat(i.roundedRectangle(LA(p[0]).convertUnits('px') || LA(e.x).convertUnits('px') || 0, LA(p[1]).convertUnits('px') || LA(e.y).convertUnits('px') || 0, LA(p[2]).convertUnits('px') || LA(e.width).convertUnits('px') || 0, LA(p[3]).convertUnits('px') || LA(e.height).convertUnits('px') || 0, LA(p[4]).convertUnits('px') || LA(e.horizontalRadius).convertUnits('px') || 0, LA(p[5]).convertUnits('px') || LA(e.verticalRadius).convertUnits('px') || 0, p[6] || e.reversed || false));
                    break;
                case 'star':
                    arr = arr.concat(i.star(LA(p[0]).convertUnits('px') || LA(e.centerX).convertUnits('px') || 0, LA(p[1]).convertUnits('px') || LA(e.centerY).convertUnits('px') || 0, LA(p[2]).convertUnits('px') || LA(e.radius).convertUnits('px') || 0, LA(p[3]).convertUnits('px') || LA(e.innerRadius).convertUnits('px') || 0, parseInt(p[4]) || parseInt(e.points) || 0, p[5] || e.reversed || false));
                    break;
            }
        }
        var obj = LA(this);
        for (var i = 0; i < obj.length; i++) {
            create(a, obj[i]);
        }
        return arr;
    };
    Object.prototype.toRaster = function (userOptions) {
        var options = new RasterizeOptions(),
        userOptions = userOptions || {};
        var rect = userOptions.rect || undefined;

        options.antiAliasingMethod = (typeof userOptions.antiAliasingMethod === 'string' ? AntiAliasingMethod[userOptions.antiAliasingMethod.toUpperCase()] : AntiAliasingMethod.ARTOPTIMIZED);
        options.extend(userOptions || {}, {
            padding: .0,
            resolution: 72,
            transparency: false,
            clippingMask: false,
            includeLayers: false,
            backgroundBlack: false,
            convertSpotColors: false,
            convertTextToOutlines: false,
        });

        return activeDocument.rasterize(this, rect, options);
    };


    // global functions
    function LA_WH(obj, gSize, options, mode) {
        // options.constrain - Boolean
        // options.anchor - Sting

        var reverseMode = 'height', modificator;
        if (mode === 'height') {
            reverseMode = 'width';
        }
        function process(item, size) {
            var precent = 0;
            if (item.typename === 'Artboard') {
                var rect = item.artboardRect,
                    itemSize = {
                        width: rect[2] - rect[0],
                        height: -(rect[3] - rect[1])
                    },
                    artSize = {
                        width: 0,
                        height: 0
                    }
                if (size !== undefined) {
                    if (mode === 'width') {
                        if (modificator === '-') item.artboardRect = [rect[0], rect[1], rect[2] - size, rect[3]];
                        else if (modificator === '+') {
                            size += itemSize.width;
                            item.artboardRect = [rect[0], rect[1], rect[0] + size, rect[3]];
                        }
                        else item.artboardRect = [rect[0], rect[1], rect[0] + size, rect[3]];
                    }
                    else if (mode === 'height') {
                        if (modificator === '-') item.artboardRect = [rect[0], rect[1], rect[2], rect[3] + size];
                        else if (modificator === '+') {
                            size += itemSize.height;
                            item.artboardRect = [rect[0], rect[1], rect[2], rect[1] - size];
                        }
                        else item.artboardRect = [rect[0], rect[1], rect[2], rect[1] - size];
                    }
                    if (options.constrain === true) {
                        rect = item.artboardRect;
                        if (mode === 'width') {
                            precent = (rect[2] - rect[0]) * 100 / itemSize.width / 100;
                            item.artboardRect = [rect[0], rect[1], rect[2], rect[3] * precent];
                        }
                        else if (mode === 'height') {
                            precent = (-(rect[3] - rect[1])) * 100 / itemSize.height / 100;
                            item.artboardRect = [rect[0], rect[1], rect[2] * precent, rect[3]];
                        }
                    }

                    rect = item.artboardRect;
                    artSize.width = itemSize.width - (rect[2] - rect[0]);
                    artSize.height = itemSize.height - (-(rect[3] - rect[1]));

                    var moreOrLess = itemSize[mode];

                    if (artSize.width < 0) artSize.width *= -1;
                    if (artSize.height < 0) artSize.height *= -1;
                    if (size < moreOrLess) {
                        setPosition(item, artSize.width, artSize.height, 0, rect);
                    }
                    else {
                        setPosition(item, artSize.width, artSize.height, 1, rect);
                    }
                }
                else arr.push(itemSize[mode]);
            }
            else if (item.typename) {
                if (size !== undefined) {
                    var one = item[mode],
                        two = item[reverseMode],
                        rect = item.geometricBounds,
                        moreOrLess = one;

                    if (modificator === '-') size = item[mode] - size;
                    else if (modificator === '+') size = item[mode] + size;

                    item[mode] = size;
                    if (options.constrain === true) {
                        precent = item[mode] * 100 / one / 100;
                        item[reverseMode] = item[reverseMode] * precent;
                    }
                    artW = one - item[mode];
                    artH = two - item[reverseMode];
                    if (artW < 0) artW *= -1;
                    if (artH < 0) artH *= -1;
                    if (moreOrLess < size) {
                        setPosition(item, rect, 0, 0);
                    }
                    else {
                        setPosition(item, rect, 0, 1);
                    }
                }
                else {
                    arr.push(obj[i][mode]);
                }
            }
        }
        function setPosition(item, artW, artH, moreOrLess, rect) {
            if (typeof options.anchor === 'string') {
                if (item.typename === 'Artboard') {
                    var r = item.artboardRect,
                        top = r[1],
                        right = r[2],
                        bottom = r[3],
                        left = r[0],
                        middle, middleBottom,
                        center, centerRight;
                    if (moreOrLess) {
                        artW *= -1;
                        artH *= -1;
                    }
                    middle = top - artH / 2;
                    middleBottom = bottom - artH / 2;
                    center = left + artW / 2;
                    centerRight = right + artW / 2;
                    switch (options.anchor) {
                        case 'topleft':
                            item.artboardRect = [left, top, right, bottom];
                            break;
                        case 'topcenter':
                            item.artboardRect = [center, top, centerRight, bottom];
                            break;
                        case 'topright':
                            if (moreOrLess) { }
                            item.artboardRect = [left + artW, top, right + artW, bottom];
                            break;
                        case 'middleright':
                            item.artboardRect = [left + artW, middle, right + artW, middleBottom];
                            break;
                        case 'bottomright':
                            item.artboardRect = [left + artW, top - artH, right + artW, bottom - artH];
                            break;
                        case 'bottomcenter':
                            item.artboardRect = [center, top - artH, centerRight, bottom - artH];
                            break;
                        case 'bottomleft':
                            item.artboardRect = [left, top - artH, right, bottom - artH];
                            break;
                        case 'middleleft':
                            item.artboardRect = [left, middle, right, middleBottom];
                            break;
                        case 'center':
                            item.artboardRect = [center, middle, centerRight, middleBottom];
                            break;
                    }
                }
                else if (item.typename) {
                    var top = artW[1],
                        right = artW[2] - item.width,
                        bottom = artW[3] + item.height,
                        left = artW[0],
                        middle = artW[1] + ((artW[3] - artW[1]) / 2) + (item.height / 2),
                        center = artW[0] + ((artW[2] - artW[0]) / 2) - (item.width / 2);

                    switch (options.anchor) {
                        case 'topcenter':
                            item.position = [center, top];
                            break;
                        case 'topright':
                            item.position = [right, top];
                            break;
                        case 'middleright':
                            item.position = [right, middle];
                            break;
                        case 'bottomright':
                            item.position = [right, bottom];
                            break;
                        case 'bottomcenter':
                            item.position = [center, bottom];
                            break;
                        case 'bottomleft':
                            item.position = [left, bottom];
                            break;
                        case 'middleleft':
                            item.position = [left, middle];
                            break;
                        case 'center':
                            item.position = [center, middle];
                            break;
                    }
                }
            }
        }
        var $obj = LA(obj), arr = [],
            default_options = {
                constrain: false,
                anchor: undefined
            };
        if (options && options instanceof Object && !(options instanceof Array)) {
            options.checkObjPrototypes(default_options);
            options.objectParser();
        }
        else {
            options = default_options;
        }
        if (gSize !== undefined) {
            gSize = gSize.toString();
            if ((gSize.slice(0, 1) === '-') || (gSize.slice(0, 1) === '+')) {
                modificator = gSize.slice(0, 1);
                gSize = gSize.slice(1);
            }
            gSize = gSize.convertUnits('px');
        }
        if (typeof constrain === 'string' && anchor === undefined) {
            anchor = constrain;
            constrain = false;
        }
        for (var i = 0; i < $obj.length; i++) {
            process($obj[i], gSize);
        }
        if (gSize !== undefined) {
            return obj;
        }
        else if (arr.length === 1) {
            return arr[0];
        }
        return arr;
    }
    function LA_Position(el, _value, position, to) {
        var arr = [], toSize = false, count = 1, str = ['+', '-'];
        if (el === undefined) {
            return el;
        }
        if (!$.isArr(el)) {
            if (_value === undefined) {
                return get(el, _value);
            }
            else {
                get(el, _value);
                return el;
            }
        }
        else {
            if (_value === undefined) {
                for (var i = 0; i < el.length; i++) {
                    arr = arr.concat(get(el[i]), _value);
                }
                return arr;
            }
            else {
                for (var i = 0; i < el.length; i++) {
                    if (to === 'random') {
                        get(el[i], Math.floor(Math.random() * $.convertUnits(_value, 'px')) + _value.getUnits() + str[Math.floor(Math.random() * str.length)]);
                        count++;
                    }
                    else {
                        get(el[i], _value);
                        if (to === true) {
                            count++;
                        }
                    }
                }
                return el;
            }
        }
        function get(i, val) {
            if (val === undefined) {
                return set(i, undefined, '=');
            }
            else if (typeof val === 'string') {
                val = val.replace(/ /g, '');
                if (!isNaN(parseInt(val))) {
                    var Char = val[val.length - 1];
                    if ((Char === '+') || (Char === '-')) {
                        val = Char + val.slice(0, -1);
                        toSize = true;
                    }
                    switch (val.slice(0, 1)) {
                        case '-':
                            set(i, $.convertUnits(val, 'px'), '-');
                            break;
                        case '+':
                            set(i, $.convertUnits(val, 'px'), '+');
                            break;
                        case val.slice(0, 1):
                            set(i, $.convertUnits(val, 'px'), '=');
                            break;
                    }
                }
            }
            else if (typeof val === 'number') {
                set(i, val, '=');
            }
            else {
                $.errorMessage('SyntaxError: Unexpected token "' + val + '"');
                return false;
            }
        }
        function set(item, value, events) {
            toSize === false ? size = [0, 0] : size = [item.width, item.height];
            switch (position) {
                case 'top':
                    t(size[1]);
                    return item.top;
                    break;
                case 'right':
                    value = value * - 1;
                    r(size[0] * -1);
                    return item.left + item.width;
                    break;
                case 'bottom':
                    value = value * - 1;
                    b(size[1] * -1);
                    return item.top + item.height;
                    break;
                case 'left':
                    l(size[0]);
                    return item.left;
                    break;
            }
            function t(h) {
                if (events === '=') {
                    item.top = parseFloat(value) || parseFloat(item.top);
                }
                    else {
                        item.top = parseFloat(item.top) + parseFloat(value);
                    }
            }
            function r(w) {
                if (events === '=') {
                    item.left = parseFloat(value) || parseFloat(item.left);
                }
                    else {
                        item.left = parseFloat(item.left) + (parseFloat(value) + parseFloat(w));
                    }
            }
            function b(h) {
                if (events === '=') {
                    item.top = parseFloat(value) || parseFloat(item.top);
                }
                    else {
                        item.top = parseFloat(item.top) + (parseFloat(value) - parseFloat(h));
                    }
            }
            function l(w) {
                if (events === '=') {
                    item.left = parseFloat(value) || parseFloat(item.left);
                }
                    else {
                        item.left = parseFloat(item.left) + parseFloat(value);
                    }
            }
        }
    }


    // Special
    Object.prototype.addCropMarks = function (preset, options, attributes) {
        var obj = LA(this),
            collection = [],
            crop_collection = [],
            backup_doc = activeDocument,
            default_options = {
                position: 'absolute',
                bounds: 'visible',
                toGroup: 'marks',
                size: '5 mm',
                margin: '0'
            },
            default_attributes = {
                filled: false,
                strokeWidth: 0.25,
                strokeColor: $.color('cmyk', [0, 0, 0, 100])
            };
        if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'all') {
            preset = 'vtl,vtc,vtr,htr,hmr,hbr,vbr,vbc,vbl,hbl,hml,htl';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'top') {
            preset = 'vtl,vtc,vtr';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'rig') {
            preset = 'htr,hmr,hbr';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'bot') {
            preset = 'vbr,vbc,vbl';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'lef') {
            preset = 'hbl,hml,htl';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'cor') {
            preset = 'vtl,vtr,htr,hbr,vbr,vbl,hbl,htl';
        }
        else if (!preset || preset && preset.toLocaleLowerCase().slice(0, 3) === 'cen') {
            preset = 'vtc,hmr,vbc,hml';
        }
        function process(item) {
            var b = item.getBounds('geometricBounds');
            if (options.bounds.toLocaleLowerCase().slice(0, 1) === 'v') {
                b = item.getBounds('visibleBounds');
            }
            var $m = {
                top: options.margin[0].convertUnits('px'),
                right: options.margin[1].convertUnits('px'),
                bottom: options.margin[2].convertUnits('px'),
                left: options.margin[3].convertUnits('px')
            }, $mv = 0,
                $r = {
                    top: b[1],
                    right: b[2],
                    bottom: b[3],
                    left: b[0],
                    center: b[0] + (b[2] - b[0]) / 2,
                    middle: b[1] - (b[1] - b[3]) / 2
                },
                size = '5mm'.convertUnits('px'),
                _n = preset.split(',');
            if (options.position.toLocaleLowerCase().slice(0, 1) === 'r') { $mv = 1; }
            for (var i = 0; i < _n.length; i++) {
                if (_n[i] === 'vtl') {
                    createLine([[$r.left - $m.left * $mv, $r.top + $m.top], [$r.left - $m.left * $mv, $r.top + $m.top + size]]);
                }
                else if (_n[i] === 'vtc') {
                    createLine([[$r.center, $r.top + $m.top], [$r.center, $r.top + $m.top + size]]);
                }
                else if (_n[i] === 'vtr') {
                    createLine([[$r.right + $m.right * $mv, $r.top + $m.top], [$r.right + $m.right * $mv, $r.top + $m.top + size]]);
                }
                else if (_n[i] === 'vbr') {
                    createLine([[$r.right + $m.right * $mv, $r.bottom - $m.bottom], [$r.right + $m.right * $mv, $r.bottom - $m.bottom - size]]);
                }
                else if (_n[i] === 'vbc') {
                    createLine([[$r.center, $r.bottom - $m.bottom], [$r.center, $r.bottom - $m.bottom - size]]);
                }
                else if (_n[i] === 'vbl') {
                    createLine([[$r.left - $m.left * $mv, $r.bottom - $m.bottom], [$r.left - $m.left * $mv, $r.bottom - $m.bottom - size]]);
                }
                else if (_n[i] === 'htl') {
                    createLine([[$r.left - $m.left, $r.top + $m.top * $mv], [$r.left - $m.left - size, $r.top + $m.top * $mv]]);
                }
                else if (_n[i] === 'htr') {
                    createLine([[$r.right + $m.right, $r.top + $m.top * $mv], [$r.right + $m.right + size, $r.top + $m.top * $mv]]);
                }
                else if (_n[i] === 'hmr') {
                    createLine([[$r.right + $m.right, $r.middle], [$r.right + $m.right + size, $r.middle]]);
                }
                else if (_n[i] === 'hbr') {
                    createLine([[$r.right + $m.right, $r.bottom - $m.bottom * $mv], [$r.right + $m.right + size, $r.bottom - $m.bottom * $mv]]);
                }
                else if (_n[i] === 'hbl') {
                    createLine([[$r.left - $m.left, $r.bottom - $m.bottom * $mv], [$r.left - $m.left - size, $r.bottom - $m.bottom * $mv]]);
                }
                else if (_n[i] === 'hml') {
                    createLine([[$r.left - $m.left, $r.middle], [$r.left - $m.left - size, $r.middle]]);
                }
            }
            function createLine(rect) {
                var line = activeDocument.pathItems.add();
                line.strokeWidth = .25;
                line.setEntirePath(rect);
                collection.push(line);
            }
            if (options.toGroup.toLocaleLowerCase().slice(0, 1) === 'm') {
                collection.group();
            }
            else if (options.toGroup.toLocaleLowerCase().slice(0, 1) === 'a') {
                item.appendTo(collection.group());
            }
        }
        if (options) {
            options.checkObjPrototypes(default_options);
        }
        else {
            options = default_options;
        }
        if (attributes) {
            attributes.checkObjPrototypes(default_attributes);
        }
        else {
            attributes = default_attributes;
        }
        options.margin = options.margin.split(' ');
        if (options.margin.length === 2) {
            options.margin[2] = options.margin[0];
            options.margin[3] = options.margin[1];
        }
        else if (options.margin.length < 4) {
            var val = options.margin[options.margin.length - 1];
            for (var i = options.margin.length; i < 4; i++) {
                options.margin[i] = val;
            }
        }
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].typename === 'Document') {
                obj[i].activate();
                return obj[i].items('path,compounds,groups,symbols,textf,plugin,raster,placed').addCropMarks(preset, options);
            }
            else if (obj[i].typename === 'Layer') {
                return obj[i].children(0).concat(obj[i].subLayers().children(0)).addCropMarks(preset, options);
            }
            else {
                process(obj[i]);
            }
        }
        return collection;
    };
    Object.prototype.longShadow = function (size, options) {
        var default_options = {
            'preset': 'right_bottom'
        };
        if (options) {
            options.checkObjPrototypes(default_options);
        }
        else {
            options = default_options;
        }
        if (size > 0 || !(isNaN(parseInt(size)))) {
            size = $.convertUnits(size, 'px');
        }
        else {
            $.errorMessage('Incorrect size or zero value of length shadow or length shadow dimension offline!');
            return;
        }
        function process(obj) {
            var parentObj = obj.Parent('GroupItem') || obj.Parent('Layer'),
                group = parentObj.groupItems.add(),
                index = obj.Index(), p = obj.pathPoints,
                sizeW = sizeH = size, $paths = [],
                shortPreset = '';
            if (options.preset.indexOf('_') > 0) {
                shortPreset = options.preset.slice(0, 1) + options.preset.slice(options.preset.indexOf('_') + 1, options.preset.indexOf('_') + 2).toLocaleLowerCase()
            }
            else {
                shortPreset = options.preset.slice(0, 1);
            }
            switch (shortPreset) {
                case 'tl': sizeW *= -1; sizeH *= -1; break;
                case 't': sizeW = 0; sizeH *= -1; break;
                case 'tr': sizeH *= -1; break;
                case 'r': sizeH = 0; break;
                case 'b': sizeW = 0; break;
                case 'bl': sizeW *= -1; break;
                case 'l': sizeW *= -1; sizeH = 0; break;
            }
            for (var i = 0; i < p.length; i++) {
                var $path = group.pathItems.add(), j = i + 1;
                if (i === p.length - 1) {
                    if (p.length === 2) break;
                    j = 0;
                }
                $path.setEntirePath(
                    [
                        // 1 line
                        [p[i].anchor[0], p[i].anchor[1]],
                        [p[j].anchor[0], p[j].anchor[1]],
                        // 2 line
                        [p[j].anchor[0] + sizeW, p[j].anchor[1] - sizeH],
                        [p[j].anchor[0] + sizeW, p[j].anchor[1] - sizeH],
                        // 3 line
                        [p[i].anchor[0] + sizeW, p[i].anchor[1] - sizeH],
                        [p[i].anchor[0] + sizeW, p[i].anchor[1] - sizeH]
                    ]
                );
                $path.closed = true; $path.stroked = false;
                // $path.fillColor = options.fillColor;
            }
            group.attr(options).zIndex(index);
        }
        var objs = LA(this);
        for (var i = 0; i < objs.length; i++) {
            if ((objs[i].typename === 'CompoundPathItem') || (objs[i].typename === 'GroupItem') || (objs[i].typename === 'Layer')) {
                objs[i].children('PathItem').longShadow(size, options);
            }
            else {
                process(objs[i]);
            }
        }
        return this;
    };
    Object.prototype.orderRandomize = function (inArray) {
        var items = LA(this),
            i = items.length,
            l = items.length,
            tmpVar, randomIndex;

        alert(l);

        if (inArray) while (0 !== i) {
            randomIndex = Math.floor(Math.random() * i);
            i -= 1;
            tmpVar = items[i];
            items[i] = items[randomIndex];
            items[randomIndex] = tmpVar;
        }
            else while (i--) {
                var j = Math.floor(Math.random() * l);
                items[j].zOrder(ZOrderMethod.SENDTOBACK);
            }

        return !inArray ? this : items;
    };
    Object.prototype.setMaker = function (userOptions) {
        try {
            var options = {
                rows: 2,
                size: 'none',
                columns: 2,
                gutter: 0,
                offset: 0,
                randomOrder: true,
                ungroupSets: false,
                setsCreated: false,
                name: {
                    body: 'setMaker - ',
                    prefix: '',
                    suffix: 'Set $'
                },
                setOnArtboard: {
                    gutter: 0,
                    bleed: '0px',
                    setName: true,
                    enabled: false,
                    onlyAlign: false
                }
            }.extend(userOptions || {}, true),
                items = [],
                sets = [],
                sizes = [[], []],
                objects = LA(this),
                _align = 'topleft',
                l = objects.length;

            var setName = (options.setsCreated ? options.name.body : (options.name.prefix + options.name.body + options.name.suffix));
            options.size = (typeof options.size === 'number' ? options.size : options.size !== 'none' ? $.convertUnits(options.size, 'px') : options.size);
            options.gutter = $.convertUnits(options.gutter, 'px');
            options.offset = $.convertUnits(options.offset, 'px');
            options.setOnArtboard.gutter = $.convertUnits(options.setOnArtboard.gutter, 'px');
            options.setOnArtboard.bleed = (options.setOnArtboard.bleed instanceof Array ? options.setOnArtboard.bleed : parseMargin(options.setOnArtboard.bleed));

            if (!options.setsCreated && options.randomOrder) {
                objects = objects.orderRandomize(true);
            }

            // get sizes or set sizes and add to collection items
            objects.each(function (item) {
                if (typeof options.size === 'number') {
                    item[item.width >= item.height ? 'Width' : 'Height'](options.size, { constrain: true });
                }
                    else {
                        sizes[0].push(item.width);
                        sizes[1].push(item.height);
                    }
                items.push(item);
            }, true).align('center');

            if (typeof options.size === 'number') {
                options.size = {
                    width: options.size,
                    height: options.size
                };
            }
                else {
                    options.size = {
                        width:  Math.max.apply(null, sizes[0]),
                        height: Math.max.apply(null, sizes[1])
                    };
                }

            if (!options.setsCreated) {
                sets.push(items[0].group().attr({ name: setName.replace(/\$/g, '1') }));
            }

            for (var n = 0, i = 0, j = 0, s = 0; n < l; n++) {
                if (i >= options.columns) { i = 0; j++; }
                if (!options.setsCreated) {
                    if (j >= options.rows) {
                        sets.push(items[n].group().attr({ name: setName.replace(/\$/g, sets.length + 1) }));
                        j = 0;
                        s++;
                    }
                    else {
                        items[n].appendTo(sets[s]);
                    }
                }
                if (options.setsCreated && options.setOnArtboard.enabled) {
                    $.unSelect();
                    items[n].selected = true;
                    var bounds = $.selectionBounds('visibleBounds'),
                        width = options.size.width,
                        height = options.size.height,
                        bleed = options.setOnArtboard.bleed,
                        arts = activeDocument.artboards;

                    if (!n && !options.setOnArtboard.onlyAlign) {
                        bounds[0] -= bleed[3];
                        bounds[1] += bleed[0];
                        bounds[2] += bleed[1];
                        bounds[3] -= bleed[2];
                        arts[0].artboardRect = bounds;
                        var x = arts.length;
                        while (x--) {
                            if (x) arts[x].remove();
                        }
                    }

                    var rect = arts[0].artboardRect,
                        art = n < arts.length ? arts[n] : (options.setOnArtboard.onlyAlign ? $.activeArtboard() : arts.add(rect));

                    if (n) {
                        rect[0] += ((bleed[3] * 2 + width + options.setOnArtboard.gutter) * i);
                        rect[1] -= ((bleed[0] * 2 + height + options.setOnArtboard.gutter) * j);
                        rect[2] += ((bleed[1] * 2 + width + options.setOnArtboard.gutter) * i);
                        rect[3] -= ((bleed[2] * 2 + height + options.setOnArtboard.gutter) * j);
                        if (!options.setOnArtboard.onlyAlign) art.artboardRect = rect;
                    }
                    var checkAlign = (art === $.activeArtboard() && options.setOnArtboard.onlyAlign ? false : true);
                    art.artboardActivate();
                    if (options.setOnArtboard.setName) art.name = setName.replace(/\$/g, activeDocument.artboards.getActiveArtboardIndex());
                    if (checkAlign) items[n].align('center');
                        else {
                            items[n].left += (options.size.width + options.gutter + options.offset) * i;
                            items[n].top -= (options.size.height + options.gutter + options.offset) * j;
                        }
                }
                    else {
                        items[n].left += (options.size.width + options.gutter + options.offset) * i;
                        items[n].top -= (options.size.height + options.gutter + options.offset) * j;
                    }
                i++;
            }

            if (!options.setsCreated) {
                var activeArt = $.activeArtboard();
                sets.reverse().align(_align).setMaker({
                    size: 'none',
                    setsCreated: true,
                    rows: options.rows,
                    gutter: options.gutter,
                    offset: options.offset,
                    columns: options.columns,
                    name: {
                        body: setName,
                        prefix: options.name.prefix,
                        suffix: options.name.suffix
                    },
                    ungroupSets: options.ungroupSets,
                    randomOrder: options.randomOrder,
                    setOnArtboard: options.setOnArtboard
                });
                if (!options.setOnArtboard.enabled || (activeDocument.artboards.length === 1 && options.setOnArtboard.onlyAlign)) sets.group().align('center').ungroup();
                else activeArt.artboardActivate();
                $.unSelect();
                if (options.ungroupSets) {
                    sets.ungroup().each(function (item) {
                        item.selected = true;
                    });
                    sets = [];
                }
                else {
                    sets.each(function (item) {
                        item.selected = true;
                    });
                }
            }

            return sets.length ? sets : this;
        }
        catch (e) {
            $.errorMessage('setMaker() - error: ' + e);
        }
    };
    Object.prototype.griddder = function (userOptions) {
        try {
            var options = {
                rows: 0,
                columns: 0,
                gutter: {
                    rows: 0,
                    columns: 0
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
                rows = options.rows,
                columns = options.columns,
                gutter = options.gutter,
                align = options.align,
                fitToArtboard = options.fitToArtboard,
                bounds = options.bounds,
                art = $.activeArtboard(),
                margin = parseMargin(options.margin),
                marksPos = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? options.cropMarks.offset : 0),
                marksPosRows = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? gutter.rows / 2 : 0),
                marksPosColumns = (options.cropMarks.position.toLowerCase().slice(0, 1) === 'r' ? options.cropMarks.offset + gutter.columns : 0);


            if (!rows && !columns && !fitToArtboard) return this;

            function createCropMark(coords) {
                var mark = cropMarksGroup.pathItems.add();
                mark.setEntirePath(coords);
                mark.filled = false;
                mark.strokeWidth = options.cropMarks.attr.strokeWidth;
                mark.strokeColor = $.color(options.cropMarks.attr.strokeColor.type, options.cropMarks.attr.strokeColor.values);
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
                        width: art.Width() - margin[1] - margin[3],
                        height: art.Height() - margin[0] - margin[2]
                    },
                    isRotate = false,
                    group = item.group();
                cropMarksGroup = options.cropMarks.enabled && options.group !== 'none' ? group.groupItems.add() : group;

                if (fitToArtboard) {
                    // landscape
                    var landscape = {
                        rows: Math.round(artSize.width / itemSize.width),
                        columns: Math.round(artSize.height / itemSize.height)
                    };
                    landscape.rows = (itemSize.width * landscape.rows) > artSize.width ? landscape.rows - 1 : landscape.rows;
                    landscape.columns = (itemSize.height * landscape.columns) > artSize.height ? landscape.columns - 1 : landscape.columns;

                    // portrait
                    var portrait = {
                        rows: Math.round(artSize.width / itemSize.height),
                        columns: Math.round(artSize.height / itemSize.width)
                    };


                    portrait.rows = (itemSize.height * portrait.rows) > artSize.width ? portrait.rows - 1 : portrait.rows;
                    portrait.columns = (itemSize.width * portrait.columns) > artSize.height ? portrait.columns - 1 : portrait.columns;


                    if (portrait.rows * portrait.columns > landscape.rows * landscape.columns) {
                        isRotate = true;
                        rows = portrait.rows;
                        columns = portrait.columns;
                    }
                    else {
                        rows = landscape.rows;
                        columns = landscape.columns;
                    }
                }

                if (isRotate) {
                    group.rotate(90);
                    var w = itemSize.width;
                    itemSize.width = itemSize.height;
                    itemSize.height = w;
                }

                for (var i = 0; i < rows; i++) {
                    for (var j = 0; j < columns; j++) {
                        var s = (!i && !j ? item : item.duplicate());
                        collection.push(s);

                        s.left += (itemSize.width * i);
                        s.top -= (itemSize.height * j);

                        var bnds = getItemMask(s)[bounds + 'Bounds'];

                        // rows
                        if (options.cropMarks.enabled && !i) {
                            // first
                            if (gutter.rows || !j) createCropMark([
                                [bnds[0] - options.cropMarks.offset, bnds[1] + (!j ? marksPos : 0)],
                                [bnds[0] - options.cropMarks.size - options.cropMarks.offset, bnds[1] + (!j ? marksPos : 0)]
                            ]);
                            createCropMark([
                                [bnds[0] - options.cropMarks.offset, bnds[3] + (j === columns - 1 ? -marksPos : 0)],
                                [bnds[0] - options.cropMarks.size - options.cropMarks.offset, bnds[3] + (j === columns - 1 ? -marksPos : 0)]
                            ]);
                            // last
                            if (gutter.rows || !j) createCropMark([
                                [bnds[0] + itemSize.width * rows - gutter.rows + options.cropMarks.offset, bnds[1] + (!j ? marksPos : 0)],
                                [bnds[0] + options.cropMarks.size + itemSize.width * rows - gutter.rows + options.cropMarks.offset, bnds[1] + (!j ? marksPos : 0)]
                            ]);
                            // lastEnd
                            createCropMark([
                                [bnds[0] + itemSize.width * rows - gutter.rows + options.cropMarks.offset, bnds[3] + (j === columns - 1 ? -marksPos : 0)],
                                [bnds[0] + options.cropMarks.size + itemSize.width * rows - gutter.rows + options.cropMarks.offset, bnds[3] + (j === columns - 1 ? -marksPos : 0)]
                            ]);
                        }
                        // columns
                        if (options.cropMarks.enabled && !j) {
                            // first
                            if (gutter.columns || !i) createCropMark([
                                [bnds[0] + (!i ? -marksPos : 0), bnds[1] + gutter.columns + options.cropMarks.offset - gutter.columns],
                                [bnds[0] + (!i ? -marksPos : 0), bnds[1] + gutter.columns + options.cropMarks.size + options.cropMarks.offset - gutter.columns]
                            ]);
                            createCropMark([
                                [bnds[2] + (i === rows - 1 ? marksPos : 0), bnds[1] + gutter.columns + options.cropMarks.offset - gutter.columns],
                                [bnds[2] + (i === rows - 1 ? marksPos : 0), bnds[1] + gutter.columns + options.cropMarks.size + options.cropMarks.offset - gutter.columns]
                            ]);
                            // last
                            if (gutter.columns || !i) createCropMark([
                                [bnds[0] + (!i ? -marksPos : 0), bnds[1] - itemSize.height * columns - options.cropMarks.offset + gutter.columns],
                                [bnds[0] + (!i ? -marksPos : 0), bnds[1] - itemSize.height * columns - options.cropMarks.size - options.cropMarks.offset + gutter.columns]
                            ]);
                            // lastEnd
                            createCropMark([
                                [bnds[2] + (i === rows - 1 ? marksPos : 0), bnds[1] - itemSize.height * columns - options.cropMarks.offset + gutter.columns],
                                [bnds[2] + (i === rows - 1 ? marksPos : 0), bnds[1] - itemSize.height * columns - options.cropMarks.size - options.cropMarks.offset + gutter.columns]
                            ]);
                        }
                    }
                }

                if (fitToArtboard) group.align('center', {
                    bounds: 'visible'
                });
                else if (typeof options.align === 'string' && options.align.toLowerCase() !== 'none') group.align(options.align);

                if (options.cropMarks.enabled && options.group === 'only_items') {
                    cropMarksGroup.moveBefore(group);
                    cropMarksGroup.ungroup();
                }
                else if ((options.group === 'none') || (options.group === 'only_cropmarks')) {
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
    Object.prototype.stepArepeat = function (userOptions) {
        try {
            var options = {
                direction: 'middleright',
                position: 'relative',
                bounds: 'visible',
                eachSelection: false,
                ghostCopies: true,
                copies: 0,
                spacing: {
                    x: '0 px',
                    y: '0 px'
                }
            }.extend(userOptions || {}, true);

            // convert units
            options.spacing.x = $.convertUnits(options.spacing.x, 'px');
            options.spacing.y = $.convertUnits(options.spacing.y, 'px');
            options.bounds = options.bounds.toLowerCase().replace('bounds', '') + 'Bounds';
            options.copies = isNaN(parseInt(options.copies)) ? 0 : parseInt(options.copies);
            options.position = options.position.slice(0, 1).toLowerCase();

            var collection = [],
                items = LA(this),
                $gBounds = items.getBounds(options.bounds);

            function moveItem(item, offsetX, offsetY) {
                item.left += offsetX;
                item.top += offsetY;
                return item;
            }

            function beforeMoveitem(item, counter) {
                var iBounds = (options.position === 'r' ? (options.eachSelection ? item[options.bounds] : $gBounds) : [0, 0, 0, 0]),
                    offsetX = iBounds[2] - iBounds[0] + options.spacing.x,
                    offsetY = iBounds[1] - iBounds[3] + options.spacing.y;

                if (options.direction === 'topleft') {
                    return moveItem(item, offsetX * -1, offsetY);
                }
                else if (options.direction === 'topcenter') {
                    return moveItem(item, 0, offsetY);
                }
                else if (options.direction === 'topright') {
                    return moveItem(item, offsetX, offsetY);
                }
                else if (options.direction === 'middleright') {
                    return moveItem(item, offsetX, 0);
                }
                else if (options.direction === 'bottomright') {
                    return moveItem(item, offsetX, offsetY * -1);
                }
                else if (options.direction === 'bottomcenter') {
                    return moveItem(item, 0, offsetY * -1);
                }
                else if (options.direction === 'bottomleft') {
                    return moveItem(item, offsetX * -1, offsetY * -1);
                }
                else if (options.direction === 'middleleft') {
                    return moveItem(item, offsetX * -1, 0);
                }
                else if (options.direction === 'center') {
                    return moveItem(item, 0, 0);
                }
            }

            items.each(function (item, i, arr) {

                var l = options.copies;

                if (l) for (var j = 1; j < l + 1; j++) {
                    if (!options.ghostCopies) {
                        var copyItem = item.duplicate();
                        copyItem.selected = false;
                        collection.push(copyItem);
                    }
                    beforeMoveitem(item, j);
                    // beforeMoveitem(item, options.ghostCopies ? 1 : j);
                }
                else beforeMoveitem(item, 1);

            });

            return this;
        }
        catch (e) {
            $.errorMessage('stepArepeat() - error: ' + e);
        }
    };
    Object.prototype.getChildsByFilter = function (filterCallback, returnFirst) {
        filterCallback = filterCallback instanceof Function ? filterCallback : function () { return true; };
        var arr = [], items = LA(this),
            l = items.length;

        for (var i = 0; i < l; i++) {
            if (items[i].typename === 'GroupItem') {
                arr = arr.concat(LA(items[i].pageItems).getChildsByFilter(filterCallback));
            }
            else if (filterCallback(items[i])) {
                arr.push(items[i]);
                if (returnFirst) return arr;
            }
        }

        return arr;
    };




    // Export
    Object.prototype.Export = function (type, path, options) {
        /*
        * Example: activeDocument.Export('png24', '~/Desktop', {
            antiAliasing : true,
            artBoardClipping : true,
            horizontalScale : 100,
            verticalScale : 100,
            matte : false,
            saveAsHTML : false,
            transparency : true
          });
        */
        options = options || {};
        path = path || '~/Desktop';
        type = type.toLocaleLowerCase();
        options.objectParser();
        switch (type) {
            // PNG 8
            case 'png8':
                var ex = new ExportOptionsPNG8(),
                    exType = ExportType.PNG8,
                    file = new File(path);
                ex.antiAliasing = options.antiAliasing || true;
                ex.artBoardClipping = options.artBoardClipping || false;
                ex.colorCount = parseInt(options.colorCount) || 128;
                switch (options.colorDither) {
                    case 'NOISE': ex.colorDither = ColorDitherMethod.NOISE; break;
                    case 'NOREDUCTION': ex.colorDither = ColorDitherMethod.NOREDUCTION; break;
                    case 'PATTERNDITHER': ex.colorDither = ColorDitherMethod.PATTERNDITHER; break;
                    case options.colorDither: ex.colorDither = ColorDitherMethod.Diffusion; break;
                }
                switch (options.colorReduction) {
                    case 'WEB': ex.colorReduction = ColorReductionMethod.WEB; break;
                    case 'ADAPTIVE': ex.colorReduction = ColorReductionMethod.ADAPTIVE; break;
                    case 'PERCEPTUAL': ex.colorReduction = ColorReductionMethod.PERCEPTUAL; break;
                    case options.colorReduction: ex.colorReduction = ColorReductionMethod.SELECTIVE; break;
                }
                ex.ditherPercent = parseInt(options.ditherPercent) || 88;
                ex.horizontalScale = parseInt(options.horizontalScale) || 100;
                ex.interlaced = options.interlaced || false;
                ex.matte = options.matte || true;
                if (options.matteColor) {
                    ex.matteColor = $.color(options.matteColor.type, options.matteColor.values);
                }
                else {
                    ex.matteColor = $.color('rgb', [255, 255, 255]);
                }
                ex.saveAsHTML = options.saveAsHTML || false;
                ex.transparency = options.transparency || true;
                ex.verticalScale = parseInt(options.verticalScale) || 100;
                ex.webSnap = parseInt(options.webSnap) || 0;
                this.exportFile(file, exType, ex);
                break;
            // PNG 24
            case 'png': type = 'png24';
            case 'png24':
                var ex = new ExportOptionsPNG24(),
                    exType = ExportType.PNG24,
                    file = new File(path);
                ex.antiAliasing = options.antiAliasing || true;
                ex.artBoardClipping = options.artBoardClipping || false;
                ex.horizontalScale = parseInt(options.horizontalScale) || 100;
                ex.matte = options.matte || true;
                if (options.matteColor) {
                    ex.matteColor = $.color(options.matteColor.type, options.matteColor.values);
                }
                else {
                    ex.matteColor = $.color('rgb', [255, 255, 255]);
                }
                ex.saveAsHTML = options.saveAsHTML || false;
                ex.transparency = options.transparency || true;
                ex.verticalScale = parseInt(options.verticalScale) || 100;
                this.exportFile(file, exType, ex);
                break;
            // AutoCad
            case 'autocad':
                var ex = new ExportOptionsAutoCAD(),
                    exType = ExportType.AutoCAD,
                    file = new File(path);
                ex.alterPathsForAppearance = options.alterPathsForAppearance || false;
                switch (options.colors) {
                    case 'Max8Colors': ex.colors = AutoCADColors.Max8Colors; break;
                    case 'TrueColors': ex.colors = AutoCADColors.TrueColors; break;
                    case 'Max16Colors': ex.colors = AutoCADColors.Max16Colors; break;
                    case options.colors: ex.colors = AutoCADColors.Max256Colors; break;
                }
                ex.convertTextToOutlines = options.convertTextToOutlines || false;
                switch (options.exportFileFormat) {
                    case 'DXF': ex.exportFileFormat = AutoCADExportFileFormat.DXF; break;
                    case options.exportFileFormat: ex.exportFileFormat = AutoCADExportFileFormat.DWG; break;
                }
                switch (options.exportOption) {
                    case 'PreserveAppearance': ex.exportOption = AutoCADExportOption.PreserveAppearance; break;
                    case options.exportOption: ex.exportOption = AutoCADExportOption.MaximizeEditability; break;
                }
                ex.exportSelectedArtOnly = options.exportSelectedArtOnly || false;
                switch (options.rasterFormat) {
                    case 'JPEG': ex.rasterFormat = AutoCADRasterFormat.JPEG; break;
                    case options.rasterFormat: ex.rasterFormat = AutoCADRasterFormat.PNG; break;
                }
                ex.scaleLineweights = options.scaleLineweights || false;
                switch (options.unit) {
                    case 'Picas': ex.unit = AutoCADUnit.Picas; break;
                    case 'Points': ex.unit = AutoCADUnit.Points; break;
                    case 'Inches': ex.unit = AutoCADUnit.Inches; break;
                    case 'Pixels': ex.unit = AutoCADUnit.Pixels; break;
                    case 'Centimeters': ex.unit = AutoCADUnit.Centimeters; break;
                    case options.unit: ex.unit = AutoCADUnit.Millimeters; break;
                }
                ex.unitScaleRatio = parseInt(options.unitScaleRatio) || 300;
                switch (options.version) {
                    case 'AutoCADRelease13': ex.version = AutoCADCompatibility.AutoCADRelease13; break;
                    case 'AutoCADRelease18': ex.version = AutoCADCompatibility.AutoCADRelease18; break;
                    case 'AutoCADRelease14': ex.version = AutoCADCompatibility.AutoCADRelease14; break;
                    case 'AutoCADRelease21': ex.version = AutoCADCompatibility.AutoCADRelease21; break;
                    case 'AutoCADRelease15': ex.version = AutoCADCompatibility.AutoCADRelease15; break;
                    case options.version: ex.version = AutoCADCompatibility.AutoCADRelease24; break;
                }
                this.exportFile(file, exType, ex);
                break;
            // Flash
            case 'flash':
                var ex = new ExportOptionsFlash(),
                    exType = ExportType.FLASH,
                    file = new File(path);
                switch (options.artClipping) {
                    case 'OUTPUTARTBOARDBOUNDS': ex.artClipping = ex.ArtClippingOption.OUTPUTARTBOARDBOUNDS; break;
                    case 'OUTPUTCROPRECTBOUNDS': ex.artClipping = ex.ArtClippingOption.OUTPUTCROPRECTBOUNDS; break;
                    case options.artClipping: ex.artClipping = ArtClippingOption.OUTPUTARTBOUNDS; break;
                }
                ex.artboardRange = options.artboardRange || '';
                if (options.backgroundColor) {
                    ex.backgroundColor = $.color(options.backgroundColor.type, options.backgroundColor.values);
                }
                else {
                    ex.backgroundColor = $.color('rgb', [255, 255, 255]);
                }
                ex.backgroundLayers = options.backgroundLayers || [];
                switch (options.blendAnimation) {
                    case 'INBUILD': ex.blendAnimation = BlendAnimationType.INBUILD; break;
                    case 'INSEQUENCE': ex.blendAnimation = BlendAnimationType.INSEQUENCE; break;
                    case options.blendAnimation: ex.blendAnimation = BlendAnimationType.NOBLENDANIMATION; break;
                }
                ex.compressed = options.compressed || false;
                ex.convertTextToOutlines = options.convertTextToOutlines || false;
                ex.curveQuality = parseInt(options.curveQuality) || 7;
                ex.exportAllSymbols = options.exportAllSymbols || false;
                switch (options.exportStyle) {
                    case 'TOFILES': ex.exportStyle = FlashExportStyle.TOFILES; break;
                    case 'LAYERSASFILES': ex.exportStyle = FlashExportStyle.LAYERSASFILES; break;
                    case 'LAYERSASFRAMES': ex.exportStyle = FlashExportStyle.LAYERSASFRAMES; break;
                    case 'LAYERSASSYMBOLS': ex.exportStyle = FlashExportStyle.LAYERSASSYMBOLS; break;
                    case options.exportStyle: ex.exportStyle = FlashExportStyle.ASFLASHFILE; break;
                }
                switch (parseInt(options.exportVersion)) {
                    case 1: ex.exportVersion = FlashExportVersion.FlashVersion1; break;
                    case 2: ex.exportVersion = FlashExportVersion.FlashVersion2; break;
                    case 3: ex.exportVersion = FlashExportVersion.FlashVersion3; break;
                    case 4: ex.exportVersion = FlashExportVersion.FlashVersion4; break;
                    case 5: ex.exportVersion = FlashExportVersion.FlashVersion5; break;
                    case 6: ex.exportVersion = FlashExportVersion.FlashVersion6; break;
                    case 7: ex.exportVersion = FlashExportVersion.FlashVersion7; break;
                    case 8: ex.exportVersion = FlashExportVersion.FlashVersion8; break;
                    case options.exportVersion: ex.exportVersion = FlashExportVersion.FlashVersion9; break;
                }
                ex.frameRate = parseFloat(options.frameRate) || 12;
                ex.ignoreTextKerning = options.ignoreTextKerning || false;
                switch (options.imageFormat) {
                    case 'LOSSY': ex.imageFormat = FlashImageFormat.LOSSY; break;
                    case options.imageFormat: ex.imageFormat = FlashImageFormat.LOSSLESS; break;
                }
                ex.includeMetadata = options.includeMetadata || false;
                switch (options.jpegMethod) {
                    case 'Optimized': ex.jpegMethod = FlashJPEGMethod.Optimized; break;
                    case options.jpegMethod: ex.jpegMethod = FlashJPEGMethod.Standard; break;
                }
                ex.jpegQuality = parseInt(options.jpegQuality) || 3;
                switch (options.layerOrder) {
                    case 'TOPDOWN': ex.layerOrder = LayerOrderType.TOPDOWN; break;
                    case options.layerOrder: ex.layerOrder = LayerOrderType.BOTTOMUP; break;
                }
                ex.looping = options.looping || false;
                switch (options.playbackAccess) {
                    case 'PlaybackNetwork': ex.playbackAccess = FlashPlaybackSecurity.PlaybackNetwork; break;
                    case options.playbackAccess: ex.playbackAccess = FlashPlaybackSecurity.PlaybackLocal; break;
                }
                ex.preserveAppearance = options.preserveAppearance || false;
                ex.readOnly = options.readOnly || false;
                switch (options.replacing) {
                    case 'SAVECHANGES': ex.replacing = SaveOptions.SAVECHANGES; break;
                    case 'DONOTSAVECHANGES': ex.replacing = SaveOptions.DONOTSAVECHANGES; break;
                    case options.replacing: ex.replacing = SaveOptions.PROMPTTOSAVECHANGES; break;
                }
                ex.resolution = parseInt(options.resolution) || 72;
                ex.saveMultipleArtboards = options.saveMultipleArtboards || false;
                this.exportFile(file, exType, ex);
                break;
            // GIF
            case 'gif':
                var ex = new ExportOptionsGIF(),
                    exType = ExportType.GIF,
                    file = new File(path);
                ex.antiAliasing = options.antiAliasing || true;
                ex.artBoardClipping = options.artBoardClipping || false;
                ex.colorCount = parseInt(options.colorCount) || 128;
                switch (options.colorDither) {
                    case 'NOISE': ex.colorDither = ColorDitherMethod.NOISE; break;
                    case 'NOREDUCTION': ex.colorDither = ColorDitherMethod.NOREDUCTION; break;
                    case 'PATTERNDITHER': ex.colorDither = ColorDitherMethod.PATTERNDITHER; break;
                    case options.colorDither: ex.colorDither = ColorDitherMethod.Diffusion; break;
                }
                switch (options.colorReduction) {
                    case 'WEB': ex.colorReduction = ColorReductionMethod.WEB; break;
                    case 'ADAPTIVE': ex.colorReduction = ColorReductionMethod.ADAPTIVE; break;
                    case 'PERCEPTUAL': ex.colorReduction = ColorReductionMethod.PERCEPTUAL; break;
                    case options.colorReduction: ex.colorReduction = ColorReductionMethod.SELECTIVE; break;
                }
                ex.ditherPercent = parseInt(options.ditherPercent) || 88;
                ex.horizontalScale = parseInt(options.horizontalScale) || 100;
                ex.infoLossPercent = options.infoLossPercent || 100;
                ex.interlaced = options.interlaced || false;
                ex.matte = options.matte || true;
                ex.matteColor = $.color(options.matteColor.type, options.matteColor.values) || $.color('rgb', [255, 255, 255]);
                ex.saveAsHTML = options.saveAsHTML || false;
                ex.transparency = options.transparency || true;
                ex.verticalScale = parseInt(options.verticalScale) || 100;
                ex.webSnap = parseInt(options.webSnap) || 0;
                this.exportFile(file, exType, ex);
                break;
            // JPG
            case 'jpg':
                var ex = new ExportOptionsJPEG(),
                    exType = ExportType.JPEG,
                    file = new File(path);
                ex.antiAliasing = options.antiAliasing || true;
                ex.artBoardClipping = options.artBoardClipping || false;
                ex.blurAmount = parseInt(options.blurAmount) || 0;
                ex.horizontalScale = parseInt(options.horizontalScale) || 100;
                ex.matte = options.matte || true;
                ex.matteColor = $.color(options.matteColor.type, options.matteColor.values) || $.color('rgb', [255, 255, 255]);
                ex.optimization = options.optimization || true;
                ex.qualitySetting = parseInt(options.qualitySetting) || 30;
                ex.saveAsHTML = options.saveAsHTML || false;
                ex.verticalScale = parseInt(options.verticalScale) || 100;
                this.exportFile(file, exType, ex);
                break;
            // PSD
            case 'psd':
                var ex = new ExportOptionsPhotoshop(),
                    exType = ExportType.PHOTOSHOP,
                    file = new File(path);
                ex.antiAliasing = options.antiAliasing || true;
                ex.artboardRange = options.artboardRange || '';
                ex.editableText = options.editableText || true;
                ex.embedICCProfile = options.embedICCProfile || false;
                switch (options.imageColorSpace) {
                    case 'LAB': ex.imageColorSpace = ImageColorSpace.LAB; break;
                    case 'CMYK': ex.imageColorSpace = ImageColorSpace.CMYK; break;
                    case 'DeviceN': ex.imageColorSpace = ImageColorSpace.DeviceN; break;
                    case 'Indexed': ex.imageColorSpace = ImageColorSpace.Indexed; break;
                    case 'Grayscale': ex.imageColorSpace = ImageColorSpace.Grayscale; break;
                    case 'Separation': ex.imageColorSpace = ImageColorSpace.Separation; break;
                    case options.imageColorSpace: ex.imageColorSpace = ImageColorSpace.RGB; break;
                }
                ex.maximumEditability = options.maximumEditability || true;
                ex.resolution = parseInt(options.resolution) || 150;
                ex.saveMultipleArtboards = options.saveMultipleArtboards || false;
                ex.warnings = options.warnings || true;
                ex.writeLayers = options.writeLayers || true;
                this.exportFile(file, exType, ex);
                break;
            // SVG
            case 'svg':
                var ex = new ExportOptionsSVG(),
                    exType = ExportType.SVG,
                    file = new File(path);
                ex.artboardRange = options.artboardRange || '';
                ex.compressed = options.compressed || false;
                ex.coordinatePrecision = parseInt(options.coordinatePrecision) || 3;
                switch (options.cssProperties) {
                    case 'ENTITIES': ex.cssProperties = SVGCSSPropertyLocation.ENTITIES; break;
                    case 'STYLEELEMENTS': ex.cssProperties = SVGCSSPropertyLocation.STYLEELEMENTS; break;
                    case 'PRESENTATIONATTRIBUTES': ex.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES; break;
                    case options.cssProperties: ex.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES; break;
                }
                switch (options.documentEncoding) {
                    case 'ASCII': ex.documentEncoding = SVGDocumentEncoding.ASCII; break;
                    case 'UTF16': ex.documentEncoding = SVGDocumentEncoding.UTF16; break;
                    case options.documentEncoding: ex.documentEncoding = SVGDocumentEncoding.UTF8; break;
                }
                switch (options.DTD) {
                    case 'SVG1_0': ex.DTD = SVGDTDVersion.SVG1_0; break;
                    case 'SVGTINY1_1': ex.DTD = SVGDTDVersion.SVGTINY1_1; break;
                    case 'SVGTINY1_2': ex.DTD = SVGDTDVersion.SVGTINY1_2; break;
                    case 'SVGBASIC1_1': ex.DTD = SVGDTDVersion.SVGBASIC1_1; break;
                    case 'SVGTINY1_1PLUS': ex.DTD = SVGDTDVersion.SVGTINY1_1PLUS; break;
                    case options.DTD: ex.DTD = SVGDTDVersion.SVG1_1; break;
                }
                ex.embedRasterImages = options.embedRasterImages || false;
                switch (options.fontSubsetting) {
                    case 'None': ex.fontSubsetting = SVGFontSubsetting.None; break;
                    case 'GLYPHSUSED': ex.fontSubsetting = SVGFontSubsetting.GLYPHSUSED; break;
                    case 'COMMONROMAN': ex.fontSubsetting = SVGFontSubsetting.COMMONROMAN; break;
                    case 'COMMONENGLISH': ex.fontSubsetting = SVGFontSubsetting.COMMONENGLISH; break;
                    case 'GLYPHSUSEDPLUSROMAN': ex.fontSubsetting = SVGFontSubsetting.GLYPHSUSEDPLUSROMAN; break;
                    case 'GLYPHSUSEDPLUSENGLISH': ex.fontSubsetting = SVGFontSubsetting.GLYPHSUSEDPLUSENGLISH; break;
                    case options.fontSubsetting: ex.fontSubsetting = SVGFontSubsetting.ALLGLYPHS; break;
                }
                switch (options.fontType) {
                    case 'SVGFONT': ex.fontType = SVGFontType.SVGFONT; break;
                    case 'OUTLINEFONT': ex.fontType = SVGFontType.OUTLINEFONT; break;
                    case options.fontType: ex.fontType = SVGFontType.CEFFONT; break;
                }
                ex.includeFileInfo = options.includeFileInfo || false;
                ex.includeUnusedStyles = options.includeUnusedStyles || false;
                ex.includeVariablesAndDatasets = options.includeVariablesAndDatasets || false;
                ex.optimizeForSVGViewer = options.optimizeForSVGViewer || false;
                ex.preserveEditability = options.preserveEditability || false;
                ex.saveMultipleArtboards = options.saveMultipleArtboards || false;
                ex.slices = options.slices || false;
                ex.sVGAutoKerning = options.sVGAutoKerning || false;
                ex.sVGTextOnPath = options.sVGTextOnPath || false;
                this.exportFile(file, exType, ex);
                break;
            // TIFF
            case 'tif':
                var ex = new ExportOptionsSVG(),
                    exType = ExportType.SVG,
                    file = new File(path);
                options.antiAliasing = ex.antiAliasing || true;
                options.artboardRange = ex.artboardRange || '';
                switch (options.byteOrder) {
                    case 'IBMPC': options.byteOrder = TIFFByteOrder.IBMPC; break;
                    case 'MACINTOSH': options.byteOrder = TIFFByteOrder.MACINTOSH; break;
                }
                switch (options.imageColorSpace) {
                    case 'LAB': options.imageColorSpace = ImageColorSpace.LAB; break;
                    case 'CMYK': options.imageColorSpace = ImageColorSpace.CMYK; break;
                    case 'DeviceN': options.imageColorSpace = ImageColorSpace.DeviceN; break;
                    case 'Indexed': options.imageColorSpace = ImageColorSpace.Indexed; break;
                    case 'Grayscale': options.imageColorSpace = ImageColorSpace.Grayscale; break;
                    case 'Separation': options.imageColorSpace = ImageColorSpace.Separation; break;
                    case options.imageColorSpace: options.imageColorSpace = ImageColorSpace.RGB; break;
                }
                options.IZWCompression = ex.IZWCompression || true;
                options.resolution = parseInt(ex.resolution) || 150;
                options.saveMultipleArtboards = ex.saveMultipleArtboards || true;
                this.exportFile(file, exType, ex);
                break;
        }
    };


    // String prototypes
    String.prototype.stringToObject = function (separate) {
        var obj = {}, arr = this.split(separate || ',');
        for (var i = 0; i < arr.length; i++) {
            var data = arr[i].split(':');
            obj[data[0]] = data[1];
        }
        obj.objectParser();
        return obj;
    };
    String.prototype.removeChars = function (chars) {
        var _str = '';
        if (chars === undefined) {
            return this;
        }
        for (var i = 0; i < this.length; i++) {
            checkChars(this[i]);
        }
        function checkChars(a) {
            var j = 0;
            for (var i = 0; i < chars.length; i++) {
                if (a === chars[i]) {
                    j++;
                }
            }
            if (j === 0) {
                _str = _str.concat(a);
            }
        }
        return _str;
    };
    String.prototype.cleanLFSpace = function () {
        var a = this;
        if (a[0] === ' ') {
            a = a.slice(1);
        }
        if (a[a.length - 1] === ' ') {
            a = a.slice(0, -1);
        }
        return a;
    };
    String.prototype.replaceChars = function (a, b, c) {
        /*
        * a = current string    format 'String'
        * b = chars             format 'String' or [ Array ]
        * c = replaceable char, format 'String'
        *** Example ***
        *   a = 'http://ladygin.net/extension',
        *   b = 'extension';
        *   return 'http://ladygin.net/about';
        */
        try {
            if (typeof a !== 'string') {
                return false;
            }
            if (!b) {
                return a;
            }
            if (typeof b === 'string') {
                b = [b];
            }
            for (var i = 0; i < a.length; i++) {
                for (var j = 0; j < b.length; j++) {
                    a = a.replace(b[j], c);
                }
            }
            return a;
        }
        catch (e) {
            $.errorMessage('replaceChars: ' + e);
        }
    };
    String.prototype.reverse = function (a) {
        /*
        * a = current string    format 'String'
        *** Example ***
        *  a = 'abc12345';
        *  return '54321cba'
        */
        try {
            var b = '', i = a.length;
            while (i--) b = b.concat(a[i]);
            return b;
        }
        catch (e) {
            $.errorMessage('stringReverse: ' + e);
        }
    };


    // functions
    function parseMargin(value, ifErrReturnValue) {
        value = (typeof value === 'string' ? value.split(' ') : (value instanceof Array ? value : ''));
        if (!value.length) return ifErrReturnValue !== undefined ? ifErrReturnValue : [0, 0, 0, 0];
        if (value.length === 2) {
            value[2] = value[0];
            value[3] = value[1];
        }
        else if (value.length < 4) {
            var val = value[value.length - 1];
            for (var i = value.length; i < 4; i++) {
                value[i] = val;
            }
        }
        for (var i = 0; i < value.length; i++) {
            value[i] = value[i].toString().convertUnits('px');
        }
        return value;
    }


    // modules
    function calendarik(userOptions) {
        var $date = new Date(),
            options = {
                startYear: $date.getFullYear(),
                endYear: $date.getFullYear(),
                startMonth: 1,
                endMonth: 12,
                frameWidth: 500,
                frameHeight: 500,
                columns_gutter: 0,
                rows_gutter: 0,
                gutter_x: 20,
                gutter_y: 20,
                fontSize: 0.7,
                linkFrames: false,
                enableFrames: {
                    day: true,
                    week: true,
                    month: false,
                },
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                fontColor: {
                    body: {
                        type: 'cmyk',
                        values: [0, 0, 0, 100]
                    },
                    weekends: {
                        type: 'cmyk',
                        values: [0, 100, 100, 0]
                    },
                    weekNumbers: {
                        type: 'cmyk',
                        values: [0, 0, 0, 40]
                    },
                },
                weekends: [6, 7],
                holidays: [
                    // '[day].[month]'
                    '01.01',
                    '07.01',
                    '23.02',
                    '08.03',
                    '01.05',
                    '09.05',
                    '12.06',
                    '04.11'
                ],
                preset: '3x4',
                language: 'ru',
                daysFormat: 'shortForm',
                names: {
                    ru: {
                        oneLetter: [
                            'П',
                            'В',
                            'С',
                            'Ч',
                            'П',
                            'С',
                            'В'
                        ],
                        shortForm: [
                            'Пн',
                            'Вт',
                            'Ср',
                            'Чт',
                            'Пт',
                            'Сб',
                            'Вс'
                        ],
                        fullWord: [
                            'Понедельник',
                            'Вторник',
                            'Среда',
                            'Четверг',
                            'Пятница',
                            'Суббота',
                            'Воскресенье'
                        ],
                        months: [
                            'Январь',
                            'Февраль',
                            'Март',
                            'Апрель',
                            'Май',
                            'Июнь',
                            'Июль',
                            'Август',
                            'Сентябрь',
                            'Октябрь',
                            'Ноябрь',
                            'Декабрь'
                        ]
                    },
                    en_us: {
                        oneLetter: [
                            'S',
                            'M',
                            'T',
                            'W',
                            'T',
                            'F',
                            'S'
                        ],
                        shortForm: [
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat'
                        ],
                        fullWord: [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ],
                        months: [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December'
                        ]
                    },
                    en_uk: {
                        oneLetter: [
                            'S',
                            'M',
                            'T',
                            'W',
                            'T',
                            'F',
                            'S'
                        ],
                        shortForm: [
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat'
                        ],
                        fullWord: [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ],
                        months: [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December'
                        ]
                    },
                    en_cd: {
                        oneLetter: [
                            'S',
                            'M',
                            'T',
                            'W',
                            'T',
                            'F',
                            'S'
                        ],
                        shortForm: [
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat'
                        ],
                        fullWord: [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ],
                        months: [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December'
                        ]
                    },
                    de: {
                        oneLetter: [
                            'S',
                            'M',
                            'D',
                            'M',
                            'D',
                            'F',
                            'S'
                        ],
                        shortForm: [
                            'So',
                            'Mo',
                            'Di',
                            'Mi',
                            'Do',
                            'Fr',
                            'Sa'
                        ],
                        fullWord: [
                            'Sonntag',
                            'Montag',
                            'Dienstag',
                            'Mittwoch',
                            'Donnerstag',
                            'Freitag',
                            'Samstag'
                        ],
                        months: [
                            'Januar',
                            'Februar',
                            'Mдrz',
                            'April',
                            'Mai',
                            'Juni',
                            'Juli',
                            'August',
                            'September',
                            'Oktober',
                            'November',
                            'Dezember'
                        ]
                    },
                    fr: {
                        oneLetter: [
                            'D',
                            'T',
                            'W',
                            'T',
                            'F',
                            'S',
                            'S'
                        ],
                        shortForm: [
                            'Dim',
                            'Lun',
                            'Mar',
                            'Mer',
                            'Jeu',
                            'Ven',
                            'Sam'
                        ],
                        fullWord: [
                            'Dimanche',
                            'Lundi',
                            'Mardi',
                            'Mercredi',
                            'Jeudi',
                            'Vendredi',
                            'Samedi'
                        ],
                        months: [
                            'Janvier',
                            'Fйvrier',
                            'Mars',
                            'Avril',
                            'Mai',
                            'Juin',
                            'Juillet',
                            'Aoыt',
                            'Septembre',
                            'Octobre',
                            'Novembre',
                            'Dйcembre'
                        ]
                    },
                    es: {
                        oneLetter: [
                            'D',
                            'L',
                            'M',
                            'M',
                            'J',
                            'V',
                            'S'
                        ],
                        shortForm: [
                            'Dom',
                            'Lun',
                            'Mar',
                            'Mer',
                            'Jeu',
                            'Ven',
                            'Sam'
                        ],
                        fullWord: [
                            'Domingo',
                            'Lunes',
                            'Mardi',
                            'Mercredi',
                            'Jeudi',
                            'Vendredi',
                            'Samedi'
                        ],
                        months: [
                            'Enero',
                            'Febrero',
                            'Marzo',
                            'Abril',
                            'Mayo',
                            'Junio',
                            'Julio',
                            'Agosto',
                            'Septiembre',
                            'Octubre',
                            'Noviembre',
                            'Diciembre'
                        ]
                    },
                    it: {
                        oneLetter: [
                            'D',
                            'L',
                            'M',
                            'M',
                            'G',
                            'V',
                            'S'
                        ],
                        shortForm: [
                            'Dom',
                            'Lun',
                            'Mar',
                            'Mer',
                            'Gio',
                            'Ven',
                            'Sab'
                        ],
                        fullWord: [
                            'Domenica',
                            'Lunedм',
                            'Martedм',
                            'Mercoledм',
                            'Giovedм',
                            'Venerdм',
                            'Sabato'
                        ],
                        months: [
                            'Gennaio',
                            'Febbraio',
                            'Marzo',
                            'Aprile',
                            'Maggio',
                            'Giugno',
                            'Luglio',
                            'Agosto',
                            'Settembre',
                            'Ottobre',
                            'Novembre',
                            'Dicembre'
                        ]
                    },
                    dt: {
                        oneLetter: [
                            'D',
                            'M',
                            'D',
                            'W',
                            'D',
                            'V',
                            'Z'
                        ],
                        shortForm: [
                            'Zo',
                            'Ma',
                            'Di',
                            'Wo',
                            'Do',
                            'Vr',
                            'Za'
                        ],
                        fullWord: [
                            'Zondag',
                            'Maandag',
                            'Dinsdag',
                            'Woensdag',
                            'Donderdag',
                            'Vrijdag',
                            'Zaterdag'
                        ],
                        months: [
                            'Januari',
                            'Februari',
                            'Maart',
                            'April',
                            'Mei',
                            'Juni',
                            'Juli',
                            'Augustus',
                            'September',
                            'Oktober',
                            'November',
                            'December'
                        ]
                    },
                    uk: {
                        oneLetter: [
                            'н',
                            'п',
                            'в',
                            'с',
                            'ч',
                            'п',
                            'с'
                        ],
                        shortForm: [
                            'нд',
                            'пн',
                            'вт',
                            'ср',
                            'чт',
                            'пт',
                            'сб'
                        ],
                        fullWord: [
                            'Неділля',
                            'Понеділок',
                            'Вівторок',
                            'Середа',
                            'Четвер',
                            'П\'ятниця',
                            'Субота'
                        ],
                        months: [
                            'Січень',
                            'Лютий',
                            'Березень',
                            'Квітень',
                            'Травень',
                            'Червень',
                            'Липень',
                            'Серпень',
                            'Вересень',
                            'Жовтень',
                            'Листопад',
                            'Грудень'
                        ]
                    },

                    // experiment
                    ru_en_month_with_year: {
                        oneLetter: [
                            'П',
                            'В',
                            'С',
                            'Ч',
                            'П',
                            'С',
                            'В'
                        ],
                        shortForm: [
                            'Пн',
                            'Вт',
                            'Ср',
                            'Чт',
                            'Пт',
                            'Сб',
                            'Вс'
                        ],
                        fullWord: [
                            'Понедельник',
                            'Вторник',
                            'Среда',
                            'Четверг',
                            'Пятница',
                            'Суббота',
                            'Воскресенье'
                        ],
                        months: [
                            'Январь / {year} / January',
                            'Февраль / {year} / February',
                            'Март / {year} / March',
                            'Апрель / {year} / April',
                            'Май / {year} / May',
                            'Июнь / {year} / June',
                            'Июль / {year} / July',
                            'Август / {year} / August',
                            'Сентябрь / {year} / September',
                            'Октябрь / {year} / October',
                            'Ноябрь / {year} / November',
                            'Декабрь / {year} / December'
                        ]
                    },
                    ru_en: {
                        oneLetter: [
                            'П / S',
                            'В / M',
                            'С / T',
                            'Ч / W',
                            'П / T',
                            'С / F',
                            'В / S'
                        ],
                        shortForm: [
                            'Пн / Sun',
                            'Вт / Mon',
                            'Ср / Tue',
                            'Чт / Wed',
                            'Пт / Thu',
                            'Сб / Fri',
                            'Вс / Sat'
                        ],
                        fullWord: [
                            'Понедельник / Sunday',
                            'Вторник / Monday',
                            'Среда / Tuesday',
                            'Четверг / Wednesday',
                            'Пятница / Thursday',
                            'Суббота / Friday',
                            'Воскресенье / Saturday'
                        ],
                        months: [
                            'Январь / January',
                            'Февраль / February',
                            'Март / March',
                            'Апрель / April',
                            'Май / May',
                            'Июнь / June',
                            'Июль / July',
                            'Август / August',
                            'Сентябрь / September',
                            'Октябрь / October',
                            'Ноябрь / November',
                            'Декабрь / December'
                        ]
                    },
                }
            }.extend(userOptions || {}, true);


        const frameColumns = 7;
        const frameRows = 6;

        // styles
        var fontSize = false;
        const lastYear = options.endYear;
        const lastMonth = options.endMonth;
        const framesCollection = [];
        const stylesName = {
            chars: 'calendarik_chars',
            months: 'calendarik_months',
            dayName: 'calendarik_dayName',
            weekends: 'calendarik_weekends',
            paragraph: 'calendarik_paragraph',
            weekNumbers: 'calendarik_week_numbers',
        };

        var phStyle = activeDocument.paragraphStyles.length > 1 ? activeDocument.paragraphStyles.getByName(stylesName.paragraph) : false,
            phStyleMonth = activeDocument.paragraphStyles.length > 1 ? activeDocument.paragraphStyles.getByName(stylesName.months) : false,
            phStyleDayName = activeDocument.paragraphStyles.length > 1 ? activeDocument.paragraphStyles.getByName(stylesName.dayName) : false,
            phStyleWeekNumbers = activeDocument.paragraphStyles.length > 1 ? activeDocument.paragraphStyles.getByName(stylesName.weekNumbers) : false,
            charStyleWeekends = activeDocument.characterStyles.length > 1 ? activeDocument.characterStyles.getByName(stylesName.weekends) : false;

        phStyle = phStyle || activeDocument.paragraphStyles.add(stylesName.paragraph);
        phStyleMonth = phStyleMonth || activeDocument.paragraphStyles.add(stylesName.months);
        phStyleDayName = phStyleDayName || activeDocument.paragraphStyles.add(stylesName.dayName);
        phStyleWeekNumbers = phStyleWeekNumbers || activeDocument.paragraphStyles.add(stylesName.weekNumbers);
        charStyleWeekends = charStyleWeekends || activeDocument.characterStyles.add(stylesName.weekends);


        // LAScripts
        options.fontColor = {
            body: $.color(options.fontColor.body.type, options.fontColor.body.values),
            weekends: $.color(options.fontColor.weekends.type, options.fontColor.weekends.values),
            weekNumbers: $.color(options.fontColor.weekNumbers.type, options.fontColor.weekNumbers.values),
        };


        // body
        phStyle.paragraphAttributes.justification = Justification.CENTER;

        // months
        phStyleMonth.paragraphAttributes.justification = Justification.CENTER;

        // dayName
        phStyleDayName.paragraphAttributes.justification = Justification.CENTER;

        // body
        phStyle.characterAttributes.fillColor = options.fontColor.body;

        // week numbers
        phStyleWeekNumbers.paragraphAttributes.justification = Justification.CENTER;
        phStyleWeekNumbers.characterAttributes.fillColor = options.fontColor.weekNumbers;

        // weekends
        charStyleWeekends.characterAttributes.fillColor = options.fontColor.weekends;

        // holidays
        holidaysMask = ',' + options.holidays.toString().replace(/ /g, '') + ',';


        function getEmptyDays() {
            var n = $date.getDay() - 1, str = '';
            if (n < 0) {
                var _date = new Date();
                _date.setFullYear($date.getFullYear());
                _date.setMonth($date.getMonth());
                _date.setDate($date.getDate() - 1);
                n = _date.getDay();
            }

            if (n >= 0) while (n--) str += '\n';
            return str;
        }

        function getEmptyCells(x) {
            var str = '';
            while (x--) str += '\n';
            return str;
        }

        function getContent() {
            var currentYear = $date.getFullYear(),
                currentMonth = $date.getMonth()
            str = getEmptyDays(), maxDays = 32,
                emptyCells = frameColumns * frameRows - str.length;

            for (var j = 0; j < maxDays; j++) {
                $date.setDate(j + 1);
                if ($date.getMonth() !== currentMonth) {
                    $date.setMonth(currentMonth);
                    $date.setFullYear(currentYear);
                    break;
                }
                str += (j + 1) + (j < maxDays - 1 ? '\n' : '');
                emptyCells--;
            }
            str += getEmptyCells(emptyCells++);
            return str;
        }

        function setWeekends(frame) {
            var j = options.weekends.length,
                color = charStyleWeekends.characterAttributes.fillColor;

            function process(day) {
                var lines = frame.lines,
                    length = lines.length;

                for (var i = 0; i < length; i++) {
                    !i ? i += day : i += day + (6 - day);
                    if (i < length) charStyleWeekends.applyTo(lines[i]);
                }
            }

            while (j--) process(options.weekends[j] - 1);
        }

        function setHolidays(frame) {
            var lines = frame.lines,
                j = lines.length,
                month = $date.getMonth();

            while (j--) {
                if (holidaysMask.indexOf(',' + ('0' + lines[j].contents.replace(/\n/g, '')).slice(-2) + '.' + ('0' + $date.getMonth()).slice(-2) + ',') > -1) {
                    charStyleWeekends.applyTo(lines[j]);
                }
            }
        }

        function getWeekNumber() {
            var d = new Date(Date.UTC($date.getFullYear(), $date.getMonth(), $date.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

            var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }

        function getWeeksContent(weekNum) {
            var weekStart = weekNum || getWeekNumber(),
                length = weekStart + frameRows,
                str = '';

            for (var i = weekStart; i < length; i++) {
                str += i + '\n';
            }

            return str.slice(0, -1);
        }

        function createMonth(x, y, anchor_x, anchor_y) {
            var monthGroup = activeDocument.groupItems.add(),
                rectDirection = anchor_y < 0 ? -1 : 1;
            heightDayTitle = !options.enableFrames.day ? 0 : options.frameHeight / frameColumns / 2,
                offsetDayTitle = !options.enableFrames.day ? 0 : heightDayTitle / 2,
                heightMonthTitle = !options.enableFrames.month ? 0 : options.frameHeight / frameColumns - offsetDayTitle,
                heightArea = options.frameHeight - heightMonthTitle - heightDayTitle - offsetDayTitle * 2,
                widthWeeks = !options.enableFrames.week ? 0 : options.frameWidth / 7 / 2;


            // month title
            if (options.enableFrames.month) {
                var monthTitle = monthGroup.pathItems.rectangle(((anchor_y - options.margin.top * rectDirection)) + ((options.frameHeight + options.gutter_y) * y), (anchor_x + options.margin.left) + ((options.frameWidth + options.gutter_x) * x), options.frameWidth, heightMonthTitle),
                    monthTitleFrame = monthGroup.textFrames.areaText(monthTitle);

                // set content & font size
                monthTitleFrame.contents = options.names[options.language].months[$date.getMonth()].replace(/{year}/g, $date.getFullYear());
            }


            // days title
            if (options.enableFrames.day) {
                var dayTitle = monthGroup.pathItems.rectangle(((anchor_y - options.margin.top * rectDirection) - heightMonthTitle - offsetDayTitle) + ((options.frameHeight + options.gutter_y) * y), (anchor_x + options.margin.left + widthWeeks) + ((options.frameWidth + options.gutter_x) * x), options.frameWidth - widthWeeks, heightDayTitle),
                    dayTitleFrame = monthGroup.textFrames.areaText(dayTitle);

                // set grid
                dayTitleFrame.columnCount = frameColumns;
                dayTitleFrame.columnGutter = options.columns_gutter;

                // set content & font size
                dayTitleFrame.contents = options.names[options.language][options.daysFormat].toString().replace(/,/g, '\n');
            }


            // all days
            var area = monthGroup.pathItems.rectangle(((anchor_y - options.margin.top * rectDirection) - heightMonthTitle - heightDayTitle - offsetDayTitle * 2) + ((options.frameHeight + options.gutter_y) * y), (anchor_x + options.margin.left + widthWeeks) + ((options.frameWidth + options.gutter_x) * x), options.frameWidth - widthWeeks, heightArea),
                frame = monthGroup.textFrames.areaText(area, TextOrientation.HORIZONTAL, options.linkFrames ? framesCollection[framesCollection.length - 1] : undefined);

            // frame push to collection
            framesCollection.push(frame);

            // set days
            frame.contents = getContent();

            // set grid
            frame.columnCount = frameColumns;
            frame.rowCount = frameRows;
            frame.columnGutter = options.columns_gutter;
            frame.rowGutter = options.rows_gutter;


            // weeks numbers
            if (options.enableFrames.week) {

                var weekNumbers = getWeekNumber(),
                    weeksTitle = monthGroup.pathItems.rectangle(((anchor_y - options.margin.top * rectDirection) - heightMonthTitle - heightDayTitle - offsetDayTitle * 2) + ((options.frameHeight + options.gutter_y) * y), (anchor_x + options.margin.left) + ((options.frameWidth + options.gutter_x) * x), widthWeeks, heightArea),
                    weeksTitleFrame = monthGroup.textFrames.areaText(weeksTitle);

                // set grid
                weeksTitleFrame.rowCount = frameRows;
                weeksTitleFrame.rowGutter = options.rows_gutter;

                // set content & font size
                weeksTitleFrame.contents = getWeeksContent(weekNumbers);

                // check empty weeks
                weeksTitleFrame.contents = isNaN(parseInt(frame.contents.slice(-8))) ? weeksTitleFrame.contents.slice(0, -2) : weeksTitleFrame.contents;
            }



            // set styles
            var autoFontSize = options.frameHeight < (options.frameWidth - widthWeeks) ? options.frameHeight / (frameColumns + options.columns_gutter / 2) : (options.frameWidth - widthWeeks) / (frameRows + options.rows_gutter / 2);

            // set font size
            if (fontSize === false) {
                fontSize = options.fontSize === 'auto' ? autoFontSize : (options.fontSize < 2.5 ? autoFontSize * options.fontSize : options.fontSize);

                // paragraphStyles
                phStyle.characterAttributes.size = fontSize;
            }

            // set paragprahStyles
            // months
            if (options.enableFrames.month) {
                phStyleMonth.characterAttributes.size = heightMonthTitle;
                phStyleMonth.applyTo(monthTitleFrame.textRange);
            }

            // days
            if (options.enableFrames.day) {
                var monthsNames = options.names[options.language][options.daysFormat];
                phStyleDayName.characterAttributes.size = options.daysFormat !== 'fullWord' ? heightDayTitle : (options.frameWidth - widthWeeks) / frameColumns / (monthsNames.toString().replace(/,/g, '').length / monthsNames.length);
                phStyleDayName.applyTo(dayTitleFrame.textRange);
            }

            // weeksTitleFrame
            if (options.enableFrames.week) {
                phStyleWeekNumbers.characterAttributes.size = widthWeeks < heightArea / frameRows ? widthWeeks * 0.9 : fontSize;
                phStyle.applyTo(weeksTitleFrame.textRange);
                phStyleWeekNumbers.applyTo(weeksTitleFrame.textRange);
            }

            // body
            phStyle.applyTo(frame.textRange);

            // set weekends
            setWeekends(frame);

            // set holidays
            setHolidays(frame);
        }

        function setCalendar() {
            var allMonths = options.endMonth,
                allYears = options.endYear - options.startYear;

            $date.setFullYear(options.startYear);

            if (allYears > 0) {
                allMonths = options.startMonth + (12 * allYears - options.startMonth) + options.endMonth;
            }


            switch (options.preset.toLowerCase()) {
                case '3x4': {
                    var valX = 3, valY = 4;
                    if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin.right - options.margin.left - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (x === valX) { x = 0; y--; }
                        createMonth(x, y, rect[0], rect[1]);
                        x++; m++;
                    }
                    break;
                };
                case '4x3': {
                    var valX = 4, valY = 3;
                    if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin.right - options.margin.left - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (x === valX) { x = 0; y--; }
                        createMonth(x, y, rect[0], rect[1]);
                        x++; m++;
                    }
                    break;
                };
                case '6x2-top': {
                    var valX = 6, valY = 6;
                    if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin.right - options.margin.left - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (x === valX) { x = 0; y--; }
                        createMonth(x, y, rect[0], rect[1]);
                        x++; m++;
                    }
                    break;
                };
                case '6x2-bottom': {
                    var valX = 6, valY = 6;
                    if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin.right - options.margin.left - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (x === valX) { x = 0; y--; }
                        createMonth(x, y, rect[0], rect[3] + ((options.frameHeight + options.gutter_y / 2) * 2));
                        x++; m++;
                    }
                    break;
                };
                case '6|6': {
                    var valX = 6, valY = 6, anchorX = rect[0];
                    if (options.frameWidth === false) options.frameWidth = (artWidth - options.margin.right - options.margin.left - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , x-- , y-- , m++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (x === -valX) {
                            anchorX = rect[2] - (options.frameWidth + options.gutter_x + options.margin.right);
                            y = 0;
                        }
                        createMonth(0, y, anchorX, rect[1]);
                    }
                    break;
                };
                case 'left-bottom': {
                    var valX = 7, valY = 6;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = ((artHeight - options.margin.top - options.margin.bottom) - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        createMonth(x, y, rect[0], rect[1]);
                        y === -(valY - 1) ? x++ : y--;
                        m++;
                    }
                    break;
                };
                case 'top-right': {
                    var valX = 7, valY = 6;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = ((artHeight - options.margin.top - options.margin.bottom) - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        createMonth(x, y, rect[0], rect[1]);
                        x === valX - 1 ? y-- : x++;
                        m++;
                    }
                    break;
                };
                case 'full-top': {
                    var valX = 12, valY = 1;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = options.frameWidth / 1.2;

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        createMonth(x, y, rect[0], rect[1]);
                        x++; m++;
                    }
                    break;
                };
                case 'full-bottom': {
                    var valX = 12, valY = 1;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = options.frameWidth / 1.2;

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        createMonth(x, y, rect[0], rect[3] + options.frameHeight);
                        x++; m++;
                    }
                    break;
                };
                case 'circle': {
                    var valX = 6, valY = 6, anchorX = (rect[2] - rect[0]) / 2, reverseY = false, reverseX = false;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , m++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (y === -valY) {
                            y++;
                            reverseY = true;
                        }
                        if (x === 3) {
                            x--;
                            reverseX = true;
                        }
                        else if (x === -4) {
                            x++;
                            reverseX = false;
                        }
                        createMonth(x, y, anchorX, rect[1]);
                        !reverseY ? y-- : y++;
                        !reverseX ? x++ : x--;
                    }
                    break;
                };
                case 'circle-compact': {
                    var valX = 6, valY = 6, anchorX = (rect[2] - rect[0]) / 2, reverseY = false, reverseX = false, $val = 0.5;
                    if (options.frameWidth === false) options.frameWidth = ((artWidth - options.margin.right - options.margin.left) - (options.gutter_x * valX)) / valX + (options.gutter_x / valX);
                    if (options.frameHeight === false) options.frameHeight = (artHeight - options.margin.top - options.margin.bottom - (options.gutter_y * valY)) / valY + (options.gutter_y / valY);

                    for (var i = m = options.startMonth - 1, x = 0, y = 0; i < allMonths; i++ , m++) {
                        $date.setMonth(m);
                        $date.setDate(1);
                        if (y === -valY) {
                            y++;
                            reverseY = true;
                        }
                        if (m === 12 * $val) {
                            anchorX -= options.frameWidth / 2;
                        }
                        if (x === 3 * $val) {
                            x -= $val;
                            reverseX = true;
                        }
                        else if (x === -4 * $val) {
                            x += $val;
                            reverseX = false;
                        }
                        createMonth(x, y, anchorX, rect[1]);
                        !reverseY ? y-- : y++;
                        x = !reverseX ? x + $val : x - $val;
                    }
                    break;
                };
            }
        }


        // check and change of the variable values
        var activeArt = activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()],
            rect = activeArt.artboardRect,
            artWidth = rect[2] - rect[0],
            artHeight = rect[1] - rect[3];

        options.frameWidth = typeof options.frameWidth === 'number'
            ? options.frameWidth
            : (typeof options.frameWidth === 'string'
                ? (options.frameWidth.slice(0, 2).toLowerCase() === 'fi'
                    ? false
                    : (options.frameWidth.slice(0, 3).toLowerCase() === 'art'
                        ? artWidth - options.margin.right - options.margin.left
                        : 500)
                )
                : 500);

        options.frameHeight = typeof options.frameHeight === 'number'
            ? options.frameHeight
            : (typeof options.frameHeight === 'string'
                ? (options.frameHeight.slice(0, 2).toLowerCase() === 'fi'
                    ? false
                    : (options.frameHeight.slice(0, 3).toLowerCase() === 'art'
                        ? artHeight - options.margin.top - options.margin.bottom
                        : 500)
                )
                : 400);

        // run
        setCalendar();
    };

}


// illustrator end