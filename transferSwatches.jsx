/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: transferSwatches.jsx;

  Copyright (c) 2018
  www.ladyginpro.ru

*/
function LA(obj, callback, reverse) {if (!callback) {if (obj instanceof Array) {return obj;}else {var arr = $.getArr(obj);if (arr === obj) {if ($.isColor(obj)) {return obj;}else {return [obj];}}return arr;}}else if (callback instanceof Function) {var arr = $.getArr(obj);if (arr === obj) {arr = [obj];}if (reverse) {var i = arr.length;while (i--) callback(arr[i], i, arr);}else {for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);}return arr;}}$.isColor = function (color) {if ((color.typename === 'GradientColor')|| (color.typename === 'PatternColor')|| (color.typename === 'CMYKColor')|| (color.typename === 'SpotColor')|| (color.typename === 'GrayColor')|| (color.typename === 'LabColor')|| (color.typename === 'RGBColor')|| (color.typename === 'NoColor')) {return true;}else {return false;}};$.isArr = function (a) {if ((!a)|| (typeof a === 'string')|| (a.typename === 'Document')|| (a.typename === 'Layer')|| (a.typename === 'PathItem')|| (a.typename === 'GroupItem')|| (a.typename === 'PageItem')|| (a.typename === 'CompoundPathItem')|| (a.typename === 'TextFrame')|| (a.typename === 'TextRange')|| (a.typename === 'GraphItem')|| (a.typename === 'Document')|| (a.typename === 'Artboard')|| (a.typename === 'LegacyTextItem')|| (a.typename === 'NoNNativeItem')|| (a.typename === 'Pattern')|| (a.typename === 'PlacedItem')|| (a.typename === 'PluginItem')|| (a.typename === 'RasterItem')|| (a.typename === 'MeshItem')|| (a.typename === 'SymbolItem')) {return false;}else if (!a.typename && !(a instanceof Array)) {return false;}else {return true;}};$.getArr = function (obj, attr, value, exclude) {var arr = [];function checkExclude (item) {if (exclude !== undefined) {var j = exclude.length;while (j--) if (exclude[j] === item) return true;}return false;}if ($.isArr(obj)) {for (var i = 0; i < obj.length; i++) {if (!checkExclude(obj[i])) {if (attr) {if (value !== undefined) {arr.push(obj[i][attr][value]);}else {arr.push(obj[i][attr]);}}else {arr.push(obj[i]);}}}return arr;}else if (attr) {return obj[attr];}else {return obj;}};$.errorMessage = function (err) {alert(err + '\n' + err.line);};Object.prototype.extend = function (userObject, deep) {try {for (var key in userObject) {if (this.hasOwnProperty(key)) {if (deep&& this[key] instanceof Object&& !(this[key] instanceof Array)&& userObject[key] instanceof Object&& !(userObject[key] instanceof Array)) {this[key].extend(userObject[key], deep);}else this[key] = userObject[key];}}return this;}catch (e) {$.errorMessage('$.objectParser() - error: ' + e);}};Object.prototype.getSwatches = function() {var arr = [], obj = LA(this);for (var i = 0; i < obj.length; i++) {arr = arr.concat(LA(obj[i].swatches));}return arr;};Object.prototype.getSwatchGroups = function() {var arr = [], obj = LA(this);for (var i = 0; i < obj.length; i++) {var length = obj[i].swatchGroups.length;for (var j = 1; j < length; j++) {arr = arr.concat(obj[i].swatchGroups[j]);}}return arr;};Object.prototype.getSwatchGroupsWithSwatches = function() {var groups = this.getSwatchGroups(), arr = [];LA(groups, function (group, i) {arr.push({name: group.name,swatches: group.getAllSwatches()});});return arr;};Object.prototype.getSwatchGroupsOnlySwatches = function() {var groups = this.getSwatchGroups(), arr = [];LA(groups, function (group, i) {arr = arr.concat(group.getAllSwatches());});return arr;};
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
                                    var s = (property.swatches[i].isGlobal ? doc.spots.add() : doc.swatches.add());
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
                                    var s = (property[i].isGlobal ? doc.spots.add() : doc.swatches.add());
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
Object.prototype.getSwatchesSaveStructure = function (onlySelected) {
    var __swatches = {
        swatches: [],
        groups: []
    },
    activeDoc = activeDocument,
    obj = LA(this),
    length = obj.length;

    function __getAllSwatches (group, selected) {
        return onlySelected ? LA(group.getAllSwatches()).sameItems(selected) : group.getAllSwatches();
    }

    for (var i = 0; i < length; i++) {
        var selectedSwatches = obj[i].swatches.getSelected();
        // obj[i].activate();
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
    // activeDoc.activate();
    return __swatches;
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
            LA(__swatches.groups, function ($group, i) {
                try {
                    var __group = __doc.swatchGroups.getByName($group.name),
                        replaceSwatch, $gswatch;

                    for (var j = 0; j < $group.swatches.length; j++) {
                        replaceSwatch = checkName($group.swatches[j].name, __group.getAllSwatches());
                        if (replaceSwatch) {
                            replaceSwatch.color = $group.swatches[j].color;
                        }
                            else {
                                $gswatch = __doc.swatches.add();
                                $gswatch.name = $group.swatches[j].name;
                                $gswatch.color = $group.swatches[j].color;
                                __group.addSwatch($gswatch);
                            }
                    }
                }
                    catch (e) {
                        __doc.addSwatches('group', {
                            name: $group.name,
                            swatches: $group.swatches
                        });
                    }
            });
        }
};
var win = new Window('dialog', 'Transfer swatches \u00A9 www.ladyginpro.ru', undefined);
win.orientation = 'column';
win.alignChildren = ['fill', 'fill'];

panel = win.add('panel', undefined, 'Please select a document!');
var winDocs = panel.add('dropdownlist', [0, 0, 180, 30], $.getArr(app.documents, 'name', undefined, [activeDocument])),
    winReplace = panel.add('checkbox', [0, 0, 180, 15], 'Replace the same by name');

winDocs.selection = 0;

var winButtons = win.add('group');
winButtons.alignChildren = ['fill', 'fill'];
winButtons.margins = [0, 0, 0, 0];

var cancel = winButtons.add('button', undefined, 'Cancel');
cancel.helpTip = 'Press Esc to Close';
cancel.onClick = function () { win.close(); }

var ok = winButtons.add('button', [0, 0, 100, 30], 'OK');
ok.helpTip = 'Press Enter to Run';
ok.onClick = startAction;
ok.active = true;

win.center();
win.show();


function startAction () {
    app.documents[winDocs.selection].transferSwatches({
        replace: winReplace.value
    });
    win.close();
}