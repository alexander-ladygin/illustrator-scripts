/* 

  Program version: Adobe Illustrator CS5+
  Name: duplicator.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro

  Copyright (c) 2018
  www.ladyginpro.ru

*/

// #target illustrator
#targetengine duplicator

function setFN() {
  $.errorMessage = function (err) {
    alert(err + '\n' + err.line);
  };
  $.getUnits = function (val, def) {
    return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;
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
      var unit = $.getUnits(obj), val = parseFloat(obj);
      if (unit && !isNaN(val)) {
        obj = val;
      } else if (!isNaN(val)) {
        obj = val;
        unit = 'px';
      }
    }
    if (((unit === 'px') || (unit === 'pt')) && (b === 'mm')) {
      obj = parseFloat(obj) / 2.83464566929134;
    } else if (((unit === 'px') || (unit === 'pt')) && (b === 'cm')) {
      obj = parseFloat(obj) / (2.83464566929134 * 10);
    } else if (((unit === 'px') || (unit === 'pt')) && (b === 'in')) {
      obj = parseFloat(obj) / 72;
    } else if ((unit === 'mm') && ((b === 'px') || (b === 'pt'))) {
      obj = parseFloat(obj) * 2.83464566929134;
    } else if ((unit === 'mm') && (b === 'cm')) {
      obj = parseFloat(obj) * 10;
    } else if ((unit === 'mm') && (b === 'in')) {
      obj = parseFloat(obj) / 25.4;
    } else if ((unit === 'cm') && ((b === 'px') || (b === 'pt'))) {
      obj = parseFloat(obj) * 2.83464566929134 * 10;
    } else if ((unit === 'cm') && (b === 'mm')) {
      obj = parseFloat(obj) / 10;
    } else if ((unit === 'cm') && (b === 'in')) {
      obj = parseFloat(obj) * 2.54;
    } else if ((unit === 'in') && ((b === 'px') || (b === 'pt'))) {
      obj = parseFloat(obj) * 72;
    } else if ((unit === 'in') && (b === 'mm')) {
      obj = parseFloat(obj) * 25.4;
    } else if ((unit === 'in') && (b === 'cm')) {
      obj = parseFloat(obj) * 25.4;
    }
    return parseFloat(obj);
  };
  
  function LA(obj, callback, reverse) {
    if (!callback) {
      if (obj instanceof Array) {
        return obj;
      } else {
        var arr = $.getArr(obj);
        if (arr === obj) {
          if ($.isColor(obj)) {
            return obj;
          } else {
            return [obj];
          }
        }
        return arr;
      }
    } else if (callback instanceof Function) {
      var arr = $.getArr(obj);
      if (arr === obj) {
        arr = [obj];
      }
      if (reverse) {
        var i = arr.length;
        while (i--) callback(arr[i], i, arr);
      } else {
        for (var i = 0; i < arr.length; i++) callback(arr[i], i, arr);
      }
      return arr;
    }
  }
  
  $.isColor = function (color) {
    if ((color.typename === 'GradientColor') || (color.typename === 'PatternColor') || (color.typename === 'CMYKColor') || (color.typename === 'SpotColor') || (color.typename === 'GrayColor') || (color.typename === 'LabColor') || (color.typename === 'RGBColor') || (color.typename === 'NoColor')) {
      return true;
    } else {
      return false;
    }
  };
  $.isArr = function (a) {
    if ((!a) || (typeof a === 'string') || (a.typename === 'Document') || (a.typename === 'Layer') || (a.typename === 'PathItem') || (a.typename === 'GroupItem') || (a.typename === 'PageItem') || (a.typename === 'CompoundPathItem') || (a.typename === 'TextFrame') || (a.typename === 'TextRange') || (a.typename === 'GraphItem') || (a.typename === 'Document') || (a.typename === 'Artboard') || (a.typename === 'LegacyTextItem') || (a.typename === 'NoNNativeItem') || (a.typename === 'Pattern') || (a.typename === 'PlacedItem') || (a.typename === 'PluginItem') || (a.typename === 'RasterItem') || (a.typename === 'MeshItem') || (a.typename === 'SymbolItem')) {
      return false;
    } else if (!a.typename && !(a instanceof Array)) {
      return false;
    } else {
      return true;
    }
  };
  $.getArr = function (obj, attr, value, exclude) {
    var arr = [];
    
    function checkExclude(item) {
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
            } else {
              arr.push(obj[i][attr]);
            }
          } else {
            arr.push(obj[i]);
          }
        }
      }
      return arr;
    } else if (attr) {
      return obj[attr];
    } else {
      return obj;
    }
  };
  $.each = function (object, callback, reverse) {
    try {
      if (object && object.length) {
        var l = object.length;
        if (!reverse) for (var i = 0; i < l; i++) callback(object[i], i, object); else while (l--) callback(object[l], l, object);
      }
      return $;
    } catch (e) {
      $.errorMessage('$.each() - error: ' + e);
    }
  };
  Object.prototype.each = function (callback, reverse) {
    if (this.length) $.each(this, callback, reverse);
    return this;
  };
  Object.prototype.extend = function (userObject, deep) {
    try {
      for (var key in userObject) {
        if (this.hasOwnProperty(key)) {
          if (deep && this[key] instanceof Object && !(this[key] instanceof Array) && userObject[key] instanceof Object && !(userObject[key] instanceof Array)) {
            this[key].extend(userObject[key], deep);
          } else this[key] = userObject[key];
        }
      }
      return this;
    } catch (e) {
      $.errorMessage('$.objectParser() - error: ' + e);
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
    } else {
      return false;
    }
  };
  Object.prototype.getBounds = function (bounds) {
    bounds = bounds || 'geometricBounds';
    bounds = (bounds && bounds.toLowerCase().indexOf('bounds') === -1) ? bounds += 'Bounds' : bounds;
    if (this.typename === 'Artboard') {
      return this.artboardRect;
    } else if (this[0] && this[0].comparingArrays(selection)) {
      return selection.getBounds(bounds);
    } else if (this instanceof Array && !(this instanceof Object)) {
      return this;
    } else {
      var arr = LA(this), x = [], y = [], w = [], h = [];
      for (var i = 0; i < arr.length; i++) {
        x.push(arr[i][bounds][0]);
        y.push(arr[i][bounds][1]);
        w.push(arr[i][bounds][2]);
        h.push(arr[i][bounds][3]);
      }
      ;
      return [Math.min.apply(null, x), Math.max.apply(null, y), Math.max.apply(null, w), Math.min.apply(null, h)];
    }
  };
  String.prototype.btSend = function (__appName) {
    var BT = new BridgeTalk;
    BT.body = this;
    BT.target = __appName || app.name.toLowerCase().replace('adobe ', '');
    BT.onError = function (err) {
      alert('Error: ' + err.body);
    };
    BT.send();
    return BT;
  }
  Object.prototype.stringify = function (startSeparator, type) {
    startSeparator = startSeparator || ['{', '}'];
    var str = startSeparator[0], separator = '';
    for (var i in this) {
      if (this[i] instanceof Object && typeof this[i] === 'object') {
        if (this[i] instanceof Array) {
          str += separator + '"' + i + '":' + this[i].stringify(['[', ']'], 'array');
        } else {
          str += separator + '"' + i + '":' + this[i].stringify(null, 'object');
        }
      } else if (!(this[i] instanceof Function)) {
        if (type === 'array') {
          str += separator + '"' + this[i] + '"';
        } else {
          str += separator + '"' + i + '":"' + this[i] + '"';
        }
      }
      separator = ',';
    }
    return str + startSeparator[1];
  };
  Object.prototype.stepArepeat = function (userOptions) {
    try {
      var options = {
        direction: 'middle_right',
        position: 'relative',
        bounds: 'visible',
        eachSelection: false,
        ghostCopies: false,
        copies: 0,
        spacing: {
          x: '0 px',
          y: '0 px'
        }
      }.extend(userOptions || {}, true);
      
      options.eachSelection = (options.eachSelection === 'true');
      options.ghostCopies = (options.ghostCopies === 'true');
      
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
        
        if (options.direction === 'top_left') {
          return moveItem(item, offsetX * -1, offsetY);
        } else if (options.direction === 'top_center') {
          return moveItem(item, 0, offsetY);
        } else if (options.direction === 'top_right') {
          return moveItem(item, offsetX, offsetY);
        } else if (options.direction === 'middle_right') {
          return moveItem(item, offsetX, 0);
        } else if (options.direction === 'bottom_right') {
          return moveItem(item, offsetX, offsetY * -1);
        } else if (options.direction === 'bottom_center') {
          return moveItem(item, 0, offsetY * -1);
        } else if (options.direction === 'bottom_left') {
          return moveItem(item, offsetX * -1, offsetY * -1);
        } else if (options.direction === 'middle_left') {
          return moveItem(item, offsetX * -1, 0);
        } else if (options.direction === 'center') {
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
        }
        else beforeMoveitem(item, 1);
        
      });
      
      return this;
    } catch (e) {
      $.errorMessage('stepArepeat() - error: ' + e);
    }
  };
}

setFN();

function inputNumberEvents(ev, _input, min, max, callback) {
  var step,
    _dir = (ev.keyName ? ev.keyName.toLowerCase().slice(0, 1) : '#none#'),
    _value = parseFloat(_input.text),
    units = (',px,pt,mm,cm,in,'.indexOf(_input.text.length > 2 ? (',' + _input.text.replace(/ /g, '').slice(-2) + ',') : ',!,') > -1 ? _input.text.replace(/ /g, '').slice(-2) : '');
  
  min = (min === undefined ? 0 : min);
  max = (max === undefined ? Infinity : max);
  step = (ev.shiftKey ? 10 : (ev.ctrlKey ? .1 : 1));
  
  if (isNaN(_value)) {
    _input.text = min;
  } else {
    _value = (((_dir === 'u')) ? _value + step : (((_dir === 'd')) ? _value - step : false));
    if (_value !== false) {
      _value = (_value <= min ? min : (_value >= max ? max : _value))
      _input.text = _value;
      if (callback instanceof Function) callback(ev, _value, _input, min, max, units);
      else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
    } else if (units) _input.text = parseFloat(_input.text) + ' ' + units;
  }
}

function doubleGutters(ev, _value, items) {
  if (ev.altKey && ((ev.keyName === 'Left') || (ev.keyName === 'Right'))) {
    var i = items.length;
    if (i > 0) while (i--) items[i].text = _value;
  }
}

var scriptName = 'Duplicator',
  copyright = ' \u00A9 www.ladyginpro.ru',
  settingFile = {
    name: scriptName + '__setting.json',
    folder: Folder.myDocuments + '/LA_AI_Scripts/'
  },
  $winLocation = [0, 0],
  $size = {
    win: {
      value: 'max',
      max: [232, 410],
      mim: [232, 325],
      mid: [232, 265],
      min: [232, 190],
    },
    button: [0, 0, 40, 40],
  };
var uiSettings = {
  unit: 'px',
  activeDocument: activeDocument,
  theme: getUITheme(),
  button: {
    width: 36,
    height: 36,
    spacing: 10,
  },
};
uiSettings.themeInvert = uiSettings.theme === 'dark' ? 'light' : 'dark';

// icon start
var iconsData = {
  dark: {
    normal: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AAIDATx\x01\u00E5\u0094\u00E1\t\u00840\f\u0085\u00D3\u00E3\x06\u00F06\u00E8\b7\u0082N\u00E4*n\u00A0#\u00B8\u00818\u0081#\u00D8\x11\u00EA\x04\u00F5U\u0082\u0094\u00A2\u00D6V\u00FF\u0088\x0F\x1E!\u00C1|MTJ\u00F4:\t71\u00C6\u00FC\x11JX\u00C3\x13G\u00DFJ\b\u00A1\u00CF\u00C0-\u00B01a\rG\u008Co\u00E0\u008C\u0096\u00A7\u00CA\x1C\u00F71@\u00E5\u00E5\u00F6\x15\x14XQ\u00D1I}\u00BC\\;\u0093)X\u00C2\x1D\u00D6\u0094t\x11hc\u0091\x02\u00DD\x03\u00FEx\u00CD$\u00E8*4\u00E4\u00FC%;\u00A7&\u00E1\u0091\u00EBc\x14\u0094\u009B\u0097\u00C6\u008Dz<\x14\x0Ff\u00F6?\u0083\u00AB\u009D\u00C3\u00D2&\rl\u00F0<hMw\u0088\u00A1\x15_(o\u00D6\fC\u00AD\u00DE\u00F6^\u00C2\u00A5\u00AA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0096IDATx\x01\u00ED\u0092m\r\u00840\f\u0086\u00DF]\x10\u0080\u00A4\u0093\u0080\u0093\u00C3\x01sp\u00E7\u00E04\u00A0\x00\tH`\x0E\u0090P\u00FA\u00A3\u0083f|d\f\x02\x7Fx\u0092&\u00ED\u00D6>[\u0096\x01WCD9G'\u0091\u00E3(,ii\u00A2\u00C1\x11X\u00F0\u00A59\x7F\u00A4\u00C0\u0083\u0095\bz%\u00F3y\u00B5W\u00F6Q\u0092B\u00E5o\u0095\u0097\u00B1\u00B2\"\x1C\u00F2\u0085\u00E4\u00A5> F\u00D8I\u00B3Uk\u00A3Pj\u00EB\u009F \u009C\u00CF\x16\u009C5\u00873\u00C6\u00FC\u00B0\x02\u00EFY\u00F9B\x0E)\u00847\u00DC\u00E2\u0085\u0093y\u0084\u008F0\u0081,\u00B2\u00CF\u00E1.\x06\r\u00F6\u00CB\u00F8\x19\x10\u00D1)\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00E5\u0093\u00DD\r\u00830\f\u0084\u009D\u00AA\u00EFe\u00832\x02#\u00B4\x1Bt\u00A4\u008E\x00\x13\u00B0\x02\x1B &\u0080\r`\x04\u0098 8\u00E2\x10\x16\u008A\b!y\u00E3\u00A4\u0093\u0095\u00D8\u00F9\u00E4\u00FC\x11\u00DDN\u00EA(\u00A9\u00B5N8\x18\u00A7\u0088\u00D2o\u0094\x15J\u00A9\u008E\u00CE\u0088\u0081\u00ADv\u00AB\u0094k\u009E\x0Ef\u0083n\x06\u00F6\b\u009B\u00F1O\u00D4LtU\u00DCM\u00CA\u00EEw\x1D\u00FEe\u00CD\u00C3\x07\u00C6\u00A1\u00A6\u00E5<\x07v\u0085\u00D4\u00E8\r\u00B4\u00C0\u00BE\u00B4m\u00D5\x0Fh\u0083\u00F1\u00AD\u009A\u00F8\u00B2\x01\u009D0qf=\u00E0k\u00AE\u00C6\u00FC'\x18\u0086\u00FC\u00FA\u00A4\u00B2`\x18jr@\u0093`\u00D8iE\u0085\x01\u0098G\u0083\x01\u0098\u0099\u00BF\x19\x05v\x1F\u00CD~\u00A9\u00EEw\u00C93\x00,\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0080IDATx\x01\u00ED\u0091A\r\u00C0 \x10\x047UP\t\u0095\u0082\x04\u009C\u00B4\x0E@\x02\x0E*\x05\t\u0095\u0080\u0084J\u00B8.\tI\tI\x1F\x04\u00E8\u008BI6\u00BC\u0098\u00DC\u00DE\x01\u0093a\u0088\u0088bn\u00E6\u00A8\u00F9\u00B7|\u00C8v>\u009EY\u0099\r\u008D\u0093\x19y\u00B1h\u0081\u00823\u0093UU-E+\u00E3\u0093(\u00EEM\u00A1\x05\n\u0082\u00B4\x13\u00A2k\u00C1\bR\u00E5+\u00AB\u00AC\u00D1\x03\u008A\\\u0097\u00A3\x14R\u009BI\rz\x10\u00A7\x1B1\u00A9N\u00D7w\u0098\u00FC\u00CA\x03\x7F8\u00CF\u00C7\u009A\u00CDG\u00CC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00^IDATx\x01\u00ED\u00D2K\n\u00C0 \f\x04\u00D0\u00A1\u00F4\u00DE\u00F5\x06\u00ED\r\u00EDM\u00A6\r\u00B8PT\u00FC\x05\x17\u00E2\x03\u00C1E\x18b\f\u00B0\u00A5\u0090\u00B4r\u00A0\u0085NM\u00ED\x01e\u00F3\x03\u00FF\u0097^\u00DE\u00FD\u00C6\b\t`\u00CC\u00B4\x04X\u00B6\x0B~_}\u0086\u00A5\u008EM\u00A2\u00A3\x07#$\u00A0k~\u0085\u00D0\u0085\x16\u00FB\u00AC\u00AC{\u00B1\u00E5|_N\u0094\x1E\u00BAyO\u0089\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0087IDATx\x01\u00ED\u00D3Q\r\u00840\x10\x04\u00D0\u00E9\u00E5\x04\u009C\u00A4\u0093\x00J\u00C0\x018\u00C0\x02N\u00C0\x01\x12\x1A\x14\u0080\u0083e\x1A ,\u0084\x1Fh!|\u00F0\u0092\u00F9j2\u00E96[\u00E0u+\x11)\x18\u00CBD\b\u0081E\u00A9,R\u0084\u00C0\u00A2\\\u0095f\bas\u00D3\x02!\u00B8wd\u00BA\u00A9\u00B4a~\u00FA\u00D0\u008A?\u00EB\u00BA>x\n\u00DE\u00E8\u00AFF\u00AEV#\u009F(K\u00D4\u00A8%|\u00B8UQe9|\u00C8\u00F8Sf\u00BB\u008B\u00FD\u00C51-\u00D33\u00B11\u00A6\u00C6\u00EB\x12\x03\u00BA\b\u00D2\u00ACh\u00DF\u009Fo\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AAIDATx\x01\u00ED\u0093Q\r\u00C2@\x10D\u00F7\b\x02N\u00C2I\u00A8\u0084\u00E2\x00+(\x00\x07\u00E0\x00\x0B8@Bq\u00C0\u00A1\x00P\u00B0\u00CC\u0086i\bGC\u00DA\u00BD\u00DF\u00BEd\u00B2m\u00DAy\u00D9\u00A4=\u0091\u0099\u00B1\u00A8jB\u008EH#\u00B5Pv\u00D57\x07\u00A9\u00A1\u0090\u00D9L\u00E2e\u00B2\f/D\u00A4C\u00F6\u00D52\u0096\x1A\x16\u00BAj\x19\u008B-Kg\u00AFlQ\u00DCG\u00CEg/\u00C30\u00B9\u00CD\u008C\u00ACB\b\u00D9#\u00BC{d\u00FF\u0084\u00D1#\u00FB\x01[\u00ED\u00F4\u009B\u00F1\x1F\u0080,ex\u00C3\u009E\x0B\u00B2\u00B5\u00DF\u0089\u00CF\x12r\u00C2\u00B6\x1Bq\n\u00D7\x03\u009DV&lh\u00E7Ry}C\x1EE2\u00E7\u00CC\u0087\x17Z\u00A2\u00C8=\u0082\u00C85\u008D\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008EIDATx\x01\u00ED\u0094\u00C1\r\u0080 \fE\x7F\u009C\u00C0\u0091\x1C\u00C1Mt\x03\u00DD@Gp\x13Gp\x04Gp\u0084\u00DA&%V<@\u0084\u00E8\u0085\u0097\u0090\x10\u00E8\x7Fp\u00A0\x00\x7F@D\u00BB\f\u00E4\u0082\u0094\u0098\u00DA\n\u0099)\u00C2\"\u00CC!\u00E4\u00F7\u00DB\u00F1\u0098B\u00C1\u00D8:)<\u00B41\x06\u00B3v\u00EB\x14\u00D9\u00D3\u00A5p;rQC\x17\u00BD/\u00D4\u009B9Z\u00C4 \"\x13\u00B2\x07\u00B4\u00FEa\u00D1p`\u00D4\u00E0a$n>\u00E2\r\x1C\\\u00E8\u00C9\u008C\x14X\u00B0\x1A\u00D9\u0086TXR\u0093~\u00B02\u00C7\u00D7\u009C\u00E6@\u00DA(\u00DA^W&\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00E5\u00D0\u00E1\r@0\x10\x05\u00E0\u00AB\u00F8\u00AF\x1B0\u0082\x11\u00D8\u00CC\x06b\x03\u009B\x18\u0081\r\x18\u0081\t\u00EA5\u00AEI#hI\x7F\u00E9K^N\u00D0/\u00CD\x11\u00C5\x1D\u00A5T\u0089\u00B6hA!\x02\u00A8WG\u00E6 \u00A8F\x18\u00FB\x01\u00CA\u00BB\x1EQ\x19\x04\u00B5\u00BE\u00E5\u00E4\u009B'\x14\u00CF\x03\u00BF\u00AF\u00EC3\u00C9\x13(\u0084X0jT\u00CF\x02\x1D,t\u00E5)\u00BDA\x07\u00BA}\x02\u00EFP4\u00BB\x02_\u00E5\u00B4S\u0093\u00C6\u00FE'u\x00-FE\u00C7\u00BEL'\u00BE\u00A5I\u00EE\r2V\u00D2\u008B\u00B8\u00C0\u009Ao#o\u00AA\u00F7\u00D8Q\u00DC\u00D9\x01\u008Fa\u00C3X\u008FE\x1D\b\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
    disabled: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B9IDATx\x01\u00E5\u0094\u00B1\n\u00C20\x10\u0086/\u00A5\x0Eu\u00D0\x17p\u00D1\u00C5\u00C1'\u00D0\u00C7w\u00D0W\u00E9\u00E2\u00E2\u0090\u0082\r\u00C4\u00FF\u00E0\n\u00E1\u009A\u0096\\\u00E9\u00D6\x1F~\u008E\x0B\u00ED\u0097\u00FBC\b\u00D1\u00E6\u00E4\u00D2&\u00C6x@\u00B9\u00C0}\u00C6A\u00AAw\u00CE\u0085)`\u00AD\u00FA3|\u00A2y}\u00E1g)P\u00AB\u0095\u00C9\u00F8\u00BB\u009D\u00F83\u00F7\u0083\x06v\u00AA?\u00C2/D\u00EC\u00A8P\u0095\u00EAC2\u0099\u0087\x1B\u00F8\u0081\u00B3m\u00A8P\x1A\u00F8K\u00C0\u00EF%\u00D0\u00A9\tk\u0089i\u0086j`/\u0095\x0F\u009F\u0096@5\u00D0K\u00DD\x0F\x0BVh.2\u00DF\u00B36]\u00B4@\x1D\x19$\u0090\u00BB$\u00E0MFW\u00CA\x04,\u0081VdT&\u00FE\u0095\u00D6\x10O\n\u00DF\u00E4A\u00D9\u00B2\u00FE\u00C5DV\u00C9a-y\u00C7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BFIDATx\x01\u00ED\u0092!\x0F\u00C20\x10\u0085\u00AFK\x11\x18\u00CC\x04\n1\u00C4\x04#\u00C1\u0080\u00C1\u00F0\u00DB\u00F1\b\u00CCL\r\x16\x04v\x06\u0092\u00F2\u009A\u00DC\u0092f\x19\u00BB\u00DB\u00B2df/\u00B9\u00BC\u00DE\u00DD\u00EB\u0097&\x1B\u00D1\u00C82R\u00C0{oa\x17n\u00AF\u00C6\u0098oW>!Yg\u00D4\u0092\u00EB$\u0085\x13\u00E1u\x05l\x15\u008DR\u00CC\x0E\u0083\u0080\u00B8\u0098\u00C32\u00D4'\x1A\u0087\u00F3\u0086wz .la\u00F5\u00A5{\u00B4\u00BA\u00B1\u00E7\u00C8d* \u0082k\u00D8\u008E\u00DB\x12\x1F\u00E1U\u00EFp~\u0087\x19\u00B7\x05\u00B2\u00A9\b\u0084\u00F6\u00EC\x0E\u0080Gs\u00C93\u00C7\u00ED\u00B1\u00B9\u00B7-\u00C0'\u00AAj\u0083EP\u0087\u00D7-BN\x04\"\\\u0092B\u00FFr\u009A\u00FF\u00B0\u0097f\u00E0\f\x1C \u00AB\u00CCU4\u0095~\u00A7\u009F4\u00D1\t\u0090\u00AD\u00A3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B4IDATx\x01\u00ED\u0092\u00B1\n\u00C20\x10\u0086\u00EF$\x15\u00EA\u00D0\u00D9\u00D9'p\u00F6\u00FD\u00C1\u00D5\u00B9\u0083\u00B3\u008B\u008B\u0083\x0E-\u00C4\u00FF\u00E0*GM\u00D3Ku\u00D3\x0F~\u00DA4\u00C9\u00C7\u00DDQ\u00A2\u009F\u0083s\u009B1\u00C6\u0080\u00C7\x1A\u00A9\x11y\u00AFL6z\u00EC\u00CC\u00CC\u00B7\u00E1N\u00A0<\x07\u00A4\u00A1yN^\u00E1U\u00CF<\u0090\x0E\u00E9u\u00BD5g:{\u0081\u00A9\x00\u008C@Z\u0097\u00AAk\u00F3\u00B9E\u00CB\u00ED\u00B0X\u0091\u0093\u0091\u00EC\u008E\\R\x15\u00BA\u0084\t\u00D9\u00D1\u0088\u00CA\u0084)\x19Z\u0094\u0099V\u00C5\u00C2\u008C\u008C\u008C\u00B0w\tgd4UaX(\x13\u00E4\u0097\u008A\u00BA\u00FF\u0082\x17\u00CA&\u00E1o\u00CA\u0084\u00F1\fw\u009F\u00C8\u00DE@\u0085\r\u00B2\u00D7J\u00FF\u00F8x\x02|\u0095SL<$\u0092s\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B1IDATx\x01\u00ED\u0093\u00A1\x0E\u00C2@\x10Dg\t\b\x10\u0098j\x04\u0088\n*P\b4\u0082\u00AF\u00E6\x0F\x10\x18L\r\x1A\u0081\u00AE@\x1Cs\u00ED^\u00D24\u00AD\u00D8\u00BB\u00D6u\u0092\u00C9dD_\u00F7r\u00B7\u00C0\u00AC\u00C9\u00E4\u009C\u00CB\u00E8\x1B\u00BD\u00B7|\u00B7\x1C\u0080\x1D\x18G\u00AD\x1B\x18$=\u00B0\u009C\u0091k-E\u00A4D,\u0090\u00B0\x13c\u00A7\u00F5E\u00D8\x1BF\u0089\u0082\u00FC\u00D1\u00CFtF\u00FF\u00E8\x07a_D(\x00\u00AF\u008C5\u00D2Tq\u0088\u00FBB\u008BC\u00BAjF\u0098p\u00C5\u00B8\u00D0[4G~\u00F2o\x1FD\u00A8{)\x05#\u00BC\u00BB\u00F8K\u00E9@\u00C7{6-\u00A8\u009F\u00B2\u00D0j\u009A\u00B4wS<\u0080\u00D0\n\u00CD\u00B6\u00986eV\u00BA\u00FE\u009A\u00FA=\u00E0\u00A7\x03\u00D9\u00A8\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00ED\u0093;\x0E\u0080 \f\u0086[\u00E3\u00E21\\\x18\u00F4\x18\u009E\u00DBc\u00B8\u00B0x\x0B\x1DkI0A\"\u00B4$\u0084\u0089/!@\u00D3\u00FE\u00F4\x11\x00:\x7F\x10\u00D1\u00E6\u0096\u00C6w\x04\x1D\u0093\u00D2\x0F\x06\u00A8L{A\u00EE\u009D\t\u00CE\u008B\u00E4\u008F\u0082\u00D8\u00CA\u00DB\x1C\u0099-\"Z\u0095\u00A0\u009F\u00A4z\x00\u009E\u009B\x1F\u00D8\u00DFK\\2A9\u009F\x18\u00A9d\u00D7?\x13\u0099O\u00CE\u00E8H\u00C5d\x05\u00BDh\u00D8\u00C7l\u00FF\x1C\u00E2\u0094\u00C3l$1\u0095`)\u00D5\x05\u00B5\x7F\u00F9\u0082N\u008A\x07E\u008F%\u0097\x7F\u0083b\b\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B6IDATx\x01\u00ED\u0093\u00A1\x0E\x021\f\u0086;\x02\x02\u008D\u00C1\u00828\u00C1\t\f<\x01\u00CF\u008DF\u0080!\x01\u00C4\t\x10(\u00C4\t\f\bH\u00C67\u00AEC\x10\u00CCh.g\u00EEO\u00FE4\u00CD\u009A/\u00ED\u00B6\u008A\u00B4\u00B2\u00CA\u00A5\x14{\u00EFs\u00C2\x10\u00EF\u009Cs\u0097_5\x1DI\u00D3\r\u00F7\u00F1\x1C\u00F8H\u00AC\x1D\x06\x01\u00CA\b\u0099\u00A6\x05\u009D\x16&\u00A0BCw\u00B9\u00A6G\u00A0\x07\x13P\u00A1\u00E1.\u00A7\u00B8\u0087\u00AFx\x05\u00F8\u00E9\u00F4p!\u00D5\u00DDXt\x07\u00B8\u008C\u008F\u00E2\u00C5\u00AE7\u00C32\u00F2\u00800\u0093j\u00E4\x12\u00AF?#\u00FF\x01\x1B\x13&\u009A\u009E\x01m\u00E3Y\u00B3\u00DFF7%~\u00E8=\u00B0\u00D3wMW\u00D2\x146\u00E5\u00817\u00C0JiU\u008B^'\u008A9\x0F\u00E2\x1D\u00EA\u00FA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B5IDATx\x01\u00ED\u00931\x0B\u00C20\x10\u0085/\u00D2\b...\x0E:\x0BN\u00CE\x0E\u00FE}\u00FF\u0081\u00A3\u00AE\u00CE\x0E\n6\x10\u00DFA\u008AG<K\u00EF\u00BA\u00F6\u00C1\u00E3\u00B8\u00A6\u00F9\u00F2.\x10\u00A2IC\u0095s^\u00C0\x07x)\u00BF\u00CF\u00C8!\u0086\u00A1\x1C\u00E1\r\u00BC\x1D\x05\x140\u00AEO\u00F8*\u00D7\x03\x19\u00A4\u00C0\u00CE!\u0084\x17\u00FDK\u0088\r\x11>\u00C1{\x0F\u008C\u00D5T=\u00FF\u00CC\u0097\u009C=\u00B0\u009F\u0084P,5y`}\u00C0\u00D6\x03\u00D3\u0080\u00DD\x15$\x0FL\x03\u00CE\x05\u00D8\f\u00EB6j\u00FD\u00BAT\x13L\x03\u00C6\u00AA\x7F\u00C0;\u008C\u00DF\u00945N|\u00C7\x01\x172&\u00A4*\u00A9\u00D4\u008A\f\to\u00F4}=<n[\u009CJ\u00E5\u00D1\u00DF4I\u00EA\x03\x1B\"W\x1B\u0090<\u00D0\u009F\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B2IDATx\x01\u00ED\u0093!\x0F\u00C20\x10\u0085\u00AF\x04\x04\x1A\x01\u0096%L\u00C0\u00CF\u00E0\u00C7c0\u0088\u0099\x19\x04\n1\u0081\u00C1 \u00CA;\u00F2H\u009A\u00AC\u00B7\u009DX6\u00B3K^\u00DA]\u00DF\u00FB\u00D2\u00A5\u00AD\u00C8\x14\x15c<\u00AB<\u00DE\u00A5\u00F8j\u00ED\u00F4\u00C9B\x06\u00AE\x198\x03\u0087\x00\u00E2E\x14\u00D0\u00B1/h\u00F9r;<@j.\u00C5\u0086\u00E9\u009A\u00C2v\x1E\u00E0\u0095c\u0089\u00E0>\x03+t\u008D\u009FU/0\u0084\u00D0$\u00C6\x13\x00\u009B\x04\u00B6\u00E5\u00CE~0x\u009F\u00AD\u00BC\x18\u00C5\u00DFR}\u00A0\x15\u00DB\u00FFy\rX\u009D\u00CB\u0099\u00A7\u00CC\u00C0#\u0081\t\u00E7w\x0B\u00D6\t$\u00F4\u0086\u00A1IZ/\u00F4\u00AA\u00AE\u008C\u00E7\x1E\u00EA!\u00BD\u00A9\u008B\u008C]_/\u0080=\u00C0\u00C5\u00C7\u00DF\u00BF\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B4IDATx\x01\u00E5\u0092A\n\u00C20\x10E'%\x15\u00D2E\x05]\u00E8\u00D6\u00B5'P\u00F0\u00FAz\x07\x17\x1E\u00A2\x0B\u00BBPH\x7F\u00C9\x04J\u00DA&\u0093l\u00FB\u00E11m /\u0093!D\u00DB\u008E\u00B5\u00B6\x05W`\u00A80U\u00F0\x7Fa\u00EE\u00A5\u00D2P\u00F8\x06_`J\u00A5*\\`\u00C9\r4\u00A0\x07O\u00A5TO\u00C2T\u00B3\x13\u00DC\u00E6W\u00AAS\u009E\u00F5\x03\u00E8\u00A80Cz\x02{\u00B0K\n\u0085R?\x06#\x12\n\u00A4?\u00AE\u00E9+\x0B\u00A5^Xg\t\u00D7\u00A4\x13Q\u00BEpEz^\x12\u00EA\u0098d|\x1A(\x07\u00F0'w\u00C5\u00B1v\u00E4\u00DE\u00A8O#\x16\"G\u00D0RF\x14\u00C5;\u00D4\u00DCA\u00CD\u00E8\u00C9\u00B7\u00E7\u0083qt\u00B4\u00DD\f\x07\x18T\u00B47\u00D4\u00B7\u00FD\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
  },
  light: {
    normal: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009DIDATx\x01\u00E5\u0092Q\r\u00850\fE\u00EF{y\x02\x1E\x0E*\x01\t\u00A0\b+8\x00\t8 (@\x02\u00930\x14@\x17\u00FA\u00D1,\f\x18\u00F0C\u00B8\u00C9I\u00D3&\x1C\u009Am\u00C0\u00EB\u00F2\u00F1\u00FA\u0094)\x18\u00CB\u008CR}\u008C\u00D4C\u00A9\u0099i\u0087~K\u00F0\u00C3v\x1A\u00D9\u00E6\u00AF\u00E8b\u0084\u00C6\u00EB\u00DD\x11\u00E4+\u00F3`\u00BE^o\u00D5f\u0086!\u00A6\u0095zIh\u00D5f\x14#\r\t\x13\u0091\u009D\u0092\u00EAdXn\u00B2U3b\x06\u0099\x0F\u0088\u0094\u0092\u00FA\x10wH\u00DD\u00B3p\u00EF\u00AC\f\u00FC\u00EC\u00F4\u00A6\u00A1\u00D0#\u00A5\x15n\na9\u00EB\x14\u00EF\u00CE\f}\u00F4:\u0092G\u00DCE\u0081\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008BIDATx\x01\u00ED\u0092\u00ED\t\u0080 \x14E/\u00D1\x00\u008D\u00D4\bmR\x1B\u00E8\x06\u00B5A34A#4\u0082n\u00D0\b%\u00F4\u0084\u00D7\u0087d&\u00F8\u00C7\x03\x17\u009E\u00FA<\u008A\b$\u00A02Q\u0094\n\x11XL6\u00CA\u008C\u009F\u00F4Lf3\"\x10A\u0082\u0095\u00C9l-\u00F0\u0091\u0096I\x1AV\u00D7\u00AC\u00EE|e\u00CD\u00C3&;\x06\u00CD\u00F1\x03^Q\u00D4,\u00D9\x1C\x17\u0082\u00D6\u00EC\x13\u009C(\u00EF>L&\u00DAd\u0080\x1B\u0089\u00E3\x0Bi\x04r\u00BD\u00A1\u0093\x02\u0091\u00C9\u00C2,\f\u00A0\u00F4\u00EC\u00D3H\u00C5\x0E\u00AC\u00E4-\u0091\u00A6[?\u0089\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B3IDATx\x01\u00ED\u0092\u00CD\r\u0082@\x10F\u00C7\u009F\u00837\u00E9\u00C0)\u00C1\x12\u00B4\x03[\u00B0\x13K\u00C0\nl\u00C1\x0E\u0088\x15h\x07p\u00F4\u0088\x15\u00E8L\u00FC6n6\u00C4\x19~n\u00F0\u0092\x17\u00D8eyY\u00C8\x12\u008D\u008E\u0099\u00F1<\u0083\x1C\u00DD\x077Xs\x16\x1F\u00E4\u00E4.\u00BE\r/\u00F1\x0BK#x\u00C3n*\u00B1\u0086:>Dk^\u00D4\x03\x16\u00CBd\u0087\u00A7x\u00C1\u009C\u00FC\u00B0X\u00E0Z\u0089W\u00CC\u00D7]\u0082\u009C\u00C4\u00F6\u00F4\u00FB\u00D4\u00D6An\u0088\u00E9u\u00DD\x14\u00F4\u00C4\u00C2?+1\x0E\x14\u0098\u00DF\u0091\x13\u00FE\x13S\u00C2\u0091\u00DA\u0092\x036bJ\u008Eh6D\u00CC\r\x0F\x19S\u00F2\u00BE\u00B1E2~\u008A+\u00F1H\u00DF\u00A31a\u00F3\x01\td9m\u00FBu\u00AE\u0080\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0081IDATx\x01\u00ED\u0091\u00B1\r\u0080 \x10E\x7Ft\x01Gp\x14Gp\x13\u00D9\x00F`\x03G\u00A1\u00B5c\x04G\u00B0\u00B6\u00D2\u00BBH\x02\r\u00C6xh\u00C5K^\x03\u00C9\u00CF\u00DD}\u00A0\"\u00A5\u00BD\u00F9\x1BHO\u00EE\u00E4\u0082\u00874\u0099\u00F7\u0089tdG\u00F6\x10\u00A2\u00C9#h dN\u00C2\x14\x04\u00F0j.\x04m\u00B8\u00EE'bE\u009C\u00EC\u00AD\u009C\u0091-E\f\u00AF\u00EC\x11W\x1EQ\b\u008BB\u00A5\u00A4\u0098$T\u00A3\x10\n\x1FL\u00CAw\u00E4\u00E6,*\u00BFr\x02R\u009F,\u00A0M]N+\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00YIDATx\x01\u00ED\u00D2\u00C9\t\x00!\f\x05\u00D0\u00CF0}\u008F\x1D\u008C\x1Dj'\x11\u00C5\u0083\x0B\u00EE\x01A|\u00F0\u00C1\u0083\x06I\x02\\\x05\u00CA\u0087\r\u00F94=`\u00B6\u00A5\u00E0\x17\u009C\x7F,\u00B2\x05(\u0089\x18x\u00EF&I\u0083\u0089\u00A6\u00CF\u00DE\u00C3\x16\u0081\u00FCG\x12\u008B$&\u00FBWs\u00D0b\u00BF\u009D\u00F74\u00AE\x12\x03\u00CE\x1E\"\u0090\u0084'\u00BC<\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0084IDATx\x01\u00ED\u0092\u00CF\r@0\x1C\u0085\u009F?\x03\x18\u00C9\u00D1\u0091I\u00D8\u0080\r\u00BA\u0082Mps3\u0082\u0098\u0080\rx\u0092&\x1A\u0091H\u00B5\u00C4\u00A1_\u00F2]\u00DA\u00E6\u00B5\u00AF\u00F9\x01\u008E\u00AF\x11t\u00A4),Q\u00D0UZ\\\x1D\b\u00A0GO=\x1A\u00D3D\u00AEu\u00B0\u0080\u00FAR\x01K\u00EC\u00FF8\u00CB\u00D0\u0081F\u00EA\u00E6\u00A8\u00DC\u00F8\u00D4=\x03>~D\u008C\u00A3r\u0083Se]r\x1CUk\x18R*a\x15\f\x11\u00B8\x19\u00EC\x10zLt\u00A1\x19m\u00E1x\u0085\r/\u00CA-fI\x00\u00C9V\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009DIDATx\x01\u00ED\u0092\u00D1\t\u00830\x14E\x1F\u00A5\x03d\u0084\u008C\u00E0\b\u00EDH\u009D\u00A0\u00DD\u00A0n\u00D0\u008E\u00D0\r\x1C!\u00DD@\u009D@\u009D@o\u00F0\u008A\x12\u0082\u0098\x18\u00FC\u00F2\u00C0\u00E1\x11!\u0087\u0087D\u00E4$\x00\r?0\u0093\x04hX\u00C2\x1E\u00E6\u00B2\x13\u00BD\u0088\u0095<\x1F\x17S\u00D0\u00C0w\u008A\u0098%\u00E3\x05\u0093\"f\u00B9\u00F1R\x11\x1B\u00BB8g\u00C5\u00D9-b\x05g\x05\u00EF\u009C\u00C1\u00C1&&\u00B6\x16T11\x1F/\x19\u00FF\u00D5d\u00F0;\u00BB\u008A\x7F\u00C3\u0089?|\u00F2\u00BBb\u00FC\x07\x1F\u00B2\u0091\u00AF\u00B3\u00A1O#\x01\x1B\u00E6\u00BCd\u00A9a\u00EBXq\u009E\u00CC\f\u008D\u0094;\u008A\u00F6Ke\u00CD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00~IDATx\x01\u00ED\u0094\u00D1\t\u0080 \x10\u0086\x7F\u009A\u00C0\u0091\x1C\u00A1Mt\x03\u00DD\u00A0Fh\u0093Fh\u0084Fp\u0084\n:\u00E9\u0090\u00C0\u00A3\u008Ez\u00F1\u0083\x1F<\u00F1>\u009F\u00EE\u0080\u009FX)jl\u0094*\x1D\u0094i\u00C2&T\x12\u00BA#\x03\u00EAH\u00DF!\u00E1\u009C\u008A\u00C0\u00EE\u00CAI\tT\u008B\u00C6\u00D12\u0081\u00BF\x11:V\u00F7\x10\u00E2Y\u0093-\x04\u00E5gb\"5&&\u00C9\u00E7\u0088\u0087LL\u00963\u00E2%3\u0093-P\u00C0\u00E0Z\u00B0\x06_\u00B3\x03\x0B\x7F,\u00D6\u00CA\u00BA4\u00B9\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00E5\u0093\u00C1\r\u0084 \x10E\u00FFn\u00F6\u00BEt\u00E0\u0094`\t\u00D8\u0099\x1D\x18;\u00B0\x13K\u00D0\x0E\u00B4\x04\u00AD@\u00870DMT\u00C4p\u00D2\u009F\u00BC\u00900\u00F0B\x06\x00^\u009F\u0094)\x18B\u00A4T\u00CC\u00C4t\u00B1\u00A4$\u00B2gHM\u00AF\x1BF!\u0092\u00D4\u00D5\x12\x04\u0084N\u00A4\u00B5\u00CC\u00EB\u00F5\u0086\u00AFG\u00D83\u0099\u008C$\x12\u0092\u00DA \u00A3\n\x11\u009EI\u00C7\u00BB\u00C2#\u00E9\x7FO\x18\x1A\u00C2\u00D2SG\u00BE^\u00F0\u00F3\b\u00CC\u00D3\u00D0\u00B0\u00FDr\u00B4\u00D8^N\x12\"\u00D4\u00B0\u00FF\u00FBr>\u009E\u00BA\u0092\u00D3\u00A8\x03L\x1FK\u00D8S\u00BF53\u00BB\u009E.\u0081e\u00E1{\u0088\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
    disabled: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BCIDATx\x01\u00E5\u0094\u00B1\n\u00C2@\x10DWc\x04-\u00B4\x13\x05\x1Bm\u00FD\x02\u00FD|\x0B\u00FD\x15Al,\x120)\u00DC\u00C5\x11\u008F\u00C9%\u00BAg\u0099\u0081a\u00B3G\u00F22\u00B9,'\u00D2;\r\u00A8\u009F\u00A9\u00B7\u00EA*\u00E2\x1A\u00B5\u00C0uT#\u00EA7\u00EA\u00B5t\u00EB\u00AE>\u00FE\nd]\u0090\u00C6\u00EE\u00CB\u00E1[\u00D7\x03\f,\u00A9\u009F\u00ABO\u0091\u00F5V\r\u00A9\u00AF\u0083d\u00B6W\x13\u00F5\x015\t\u00F8\b\u00C0\u00E7\x14h[B\u00DB\u008A2\x05\u00CA\u00C0\n5GuC\x19X\u00A0N\u00835\x174\u00A3\u00DE\x06}\u00A1\u00BE\u00C2o\u00D9V\u00D8\u008FZ\u00E2e+\u00F9\u008CT\x03\u00E0\u0091%\u00DB\x03j\u00C9\x1B#\u0095\u0089O_\u0093z\u00811\u00E8\x18\u00FD\u00DF\u00B2\u00CF\u00DF\u00C9\u00EB@\u00E9\u00B3\u009E\u00D3F4\x03R\u00F7\u00D9:\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00ED\u0090\u00A1\x0F\u0082@\x14\u00C6\u009Fx\x04\u009D\u00C5\x19\u00B4\u00EA\u009CA\u008DF7\u00FFv\u00BB\u00C1B\u00B1P\f\x1A\u00A8\x14\b|o{\u00E1\u00C1\x0Ex\x036\n\u00DF\u00F6\x1B\u00C7\u00DDw\u00BF\u0083#\x1A83C\u00C7\u0081\u0087\u008C\u009F o*\u00CF\u00A9=w\u00B0\x02!X\u0083o\x1F\u00E1\x05\u00EC\u00D4\u00FB\x12,\u00C0\u00BF\u008B\u00F0\x04\u008E S\u00BDL\u00BE\u0092\u0093\u00F86\x055\u00B2\u0083\b9o5\u00FFR\u0087\u00ED\u00AD\u00C2-8\u00CB8\u00A2\u00F2\u00EF%2\u00C7\u00E1\u00EB\u00D8X\u0084Wy~@\u00ECY\u008Fe\u008Ds\u00AB.:\u00CF\u0086\x1FHkd\u00A4\x0E\x0B\u00A5\u00D7*\u008C\u00C8\x16o/\u00A0\u00813\t'a\u00878c/\u00A5\u00B1R\x00?\x10\x19\x1D=\x18\u00B5\u00CE\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00A6IDATx\x01\u00E5\u0092\u00BB\n\u00840\x10E'\u00BB\u00BA\u00B0\x16\u00D6\u00D6~\u0086\u00FF\x0F\u00B6\u00D6\x16\u00D666\x16\u008A(\u00E8\u008C\u008C2\x04cb\u00B4\u00F3\u00C0%\u00AF\u00C9!\t\x01x\x1D\u00CA\u00B2\x1E`~\u0098?\u00F7C\u0091\u0088k*L+7\u009C\u0091ab\u00B0S\u00B8\n\x1B\u00AE\u00E91#f\u00E2q\"jF\u00B9\u00C1ve\x1D\u00BAz\u00C6\u00EDF\u00C9Y\u00F9\u0080;R\u00D6aj88\u00A1\u00ABP\u0097\u00E5BtYx$\u00A37\r}\u0084&\x19\b\u00E1\u00E4*<\u0093\u0081\u00E9\u0084\u0081\u00A7\u008C\u00A0/5\u00F3\u00FA\u008E\u00F2\u0094\x19QO\u00CA\b\u00FD\r\u00D3;2\u00E2\u00AB\u008D\x07\u009E+|d/e\x01\u00B6\u0093.\u00D7\x05T\x11\u00F3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BDIDATx\x01\u00ED\u0093\u00BB\n\u00C2@\x10E\u00AF\u00AFB\x0B\x11\x04\x1B\u00B1\u00B1\u00B0\u00B0\u00B1\u00B2\u00B0\u00B1\u00F1\u00BB\u00FD\x03\x0B\x1B\x1B\x1B\u00B1\x14\x11\u00C4F0\u00A0\u00DE13\b!\t\u00FB\u0080T9p\u00C8f\x17.\u00B3\u00BB\u00B3@M,\u00AD\u0092\u00B5!]\u00D37\u00BD\u00C3\u0091v\u00C1\u00FC\u0094\u00CEu\u00DC\u0083\x07\u008D\u009C\u00B9\u0099*\x1C\u00D5\u00E0\u00C0\x05\u009D\u00E8\u00F8@O\u00F0\u00C4\x02e\u00EBK\u00A4\u00E7\u0096\u00D0\x1D\u00BD!\x00\x0B\u00DC\u00D0.\u00E2x\u00D2mS\x7F>\u0088\u00E7\u0097a\x15v\u00E8\u008A\u00F6\u0091nyO/\b\u00C0\u00FAPz\u00ED\u00AC\u00C1r\u008Ec\rv\u00EE\u00BFl\u00A0q\u00D5\u00AF\u0084\u008Et\u00ECu9y/E\x02\x12\r\u00B4[w\u00AE\u00B4\u00E8\u00E9I\u00C0\u0083\x0E\u00E8\x0B\u00FF\u00CAk*\u00E0\x0B\x1B\u00F5\x1E\x7F\x01p\u00D9\u00B7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00ED\u0093M\n\u0080 \x10\u0085\u009F\u00FD,Zv\u0087pQ\u00C7\u00E8\u00DC\x1D#\b7\u009D\u00A0m-K\u00C1H\x05\u009B\t\u0082Z\u00F8\u00C1C\x07gD\u00DF(\u0090\u0088\u00D0[\u0091\x14\u00E0Q1\u00F3\u0090\u00E1e>\u00D9P:\u00F3\u0096J\u00CE\u0089\u00F5N\u00ABq\u00E2\u00DA\u008EK\u00AC@\x04\u00B1\u00E9$\u00BB\x01\u0096Mk8\u0083\u00F0\u00CA;\u009E\u00E3\u00D5\b\"Y\u00C2\u00F7\u00D00k\u008D\u00B1\x02\u00CAC\u00E3U\u0089\u00CB;\u00A55\u00DD\x15p\u00BA\u00EC\u009EFQ\u00C9\u00FF\x7F\u00D8\u00DC\u00BF\u00BC\"\x11\u00E3\x00\u00E2\u008E\r\u00A3}\u00D9\u00E4\u00B7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AEIDATx\x01\u00ED\u0093\u00BB\n\u00C2@\x10\x007\x1A\x0B\u00C1\u00CE\x17h\u00A5\u0085\u0085\u0082\u0095\x7F\u00E0w\u00FB\x05\u00DAX\u00D8\u00D8X\b6\"\u0088\u00A0\x16\x11uV\u00F7\u009At\u00B9M\u0099\u0081\u0081\r9\u0086\u00E3\u00B8\x13\u00A9\u00F0R\u0097b\u00CCp\u008E\x0F\u00BC\u0097\x11l\u00E1\x00\u0087\u0098\u00E1\u00D5\x1B\f\u00816\u00F6l\u00BEx\u0082!\u0090YP\u00C3)\u009E=AEwz\u00C3.v\u00B0\u008F'|'\u00B6`\u0089M\u00F1\u00F1\u00C4U\u00CD>>\u00E2\u00E7\u00D7H$\x1E=\u00BF\x056\u00E4\x7F\u00AEk|\u00C5\x06\u00C78\u00B5\u00F9\u0088\u00DB\u00F0#&81\u0095\u00BD)\u00B1A})#\u009Bwx\u00C8/H\u00A5\x18\u00FA\u00E4\u00F4\x0En$w\u00A1+\u00CA\u00E3\x0Bf\x1D\x1E?\u00B5+t/\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B1IDATx\x01\u00ED\u00931\n\x021\x10E\u00BF\u00EB\u00AE\u00B0\b6\u00DBx\x03\x1BO \u00DE\u00DF\x1BXj+\u00D8Y(\u00BA\u008B\u00FA\x07&8\u0084A\u009CX\u00EA\u0087G\bI\x1E\x7F\u008A\x00?\u00971\u00CA\u00D3\u0092%9\u0093\u00EB\u00B7B\u0091\u00ADHG\u00EE\u00E4\u0098\x0E*\u00C4\u0093d\u00AD\u00B6\u00DB\u00D9\u00C3\x11b\u00C9e\x1Br\u00B1\x17\u00F2\u0091\x1B\u00B2&S\u00981>\u0095Ij\u00E7\u00D1\u008C<Jd\u0092\u00CAi(\x19Jd\u00EF\u0084}\u0089\u00CC\x13\u00D6\u00A6aX\u00E6\t'F\x1C\u0096\u00A5\u0087\u00DE~\u00AEkH\u00E6\t\u009Bl\x7F\"\x0B\u00BD'g\u00D2\u00F8@\u00B6\b6D\u00D6\u00D4\u00A6C\u00A0\u00E1\x1E\u00AF\u00DF#\u00E3\u00F6\u00CA\u00A0\u00AB\u008C~\u00C3?6O\u009F5.\u009C\u0087\u009E\u00B2@\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B5IDATx\x01\u00ED\u0094?\x0B\u00C20\x14\u00C4\x0F\u00FF\f\u00BA\u0089PDpP\u00B0\u0083\u0093\u00DF\u00C1\u00CF\u00EE\u00D6U\x11A\\\\\x1C\x04]tP\u00C4\x0B\u009E\x10\u00CAk\u0093\u00A1\u00D8\u00A5\x07?\u0092\u0090w\u00C7K \x01j\u00D2J\x04\u00D5A\u009Cz\u0091uh\u00A1b5\u0081M`E\u00813\u00B2@Xf\u009D\u00F5R\u00E6\u00A4K^d\x0F[\u00A9\u00B8\u0093-\x02\x1Df\u009Ei\n\u00BB\u00B3T\u00F3M~\u00B3m\x18\x1E\u00E4I\x12q!\x13\u00ED\u00DD\u00C8\u00D2\x0B;\u00C5\x04:]5\x0E\u00C9\u00C8\u00ABK4wWq\u00B0\u008CE\u0081Pg\u00EE\u0097\x19\u00E4\u00EA\u008FdWd*\x0Bt:\u00AB\u00CB\u00BE\u00D6\u00EE\u00C8Y\u0099!\x14\u00F8\x0B\x1D\u00E3{\u00AFk\u00F2\u00C6?\u00F5\x01\u00E9\t\x19\u00D04S\b:\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00C2IDATx\x01\u00E5\u0093\u00CB\n\u00C20\x10EG\u0093\n\u0095\u00A2\u00A0\x0Bu\u00E5V\u00F0\x0F\u00FC\x7F\u00F0/\\\u008A\x1B\u00A1ta\x17-\u00E2\u008D\u0099@H\u00D3\u00E6\u00B1\u00ED\u0085\u00C3\u00A4\u00D3r\b\u0099\u0086h\u00F6\u00D9\u0080+()3\u00C2y\u00BE\u008038\u0081\x17\u00E8)1\u00AE\u00B0\x01G\u00B0\u00CE\u0095\u00BA\u00C2\u009E%\u00D9R\u00E1\u00E9\u00C5J\u00D5Y\u00AB#z\u0082\u00AFi.\u00C9\u009F\x16\u00DC\u00C1\u0087\u00F4\u0080n4\x1C\u00D4\x01l\u00C1\u00CAn\u008E\tc\u00A4-\u00D72V\x18\u0092v\\e\u008ApJj\u0084\u0085\u00FD\u00B1\u00A0\u00B8\u00F8\x06\u00A5\u0084\x15x\u0083:U\u00E8\u0093V\u00DC\u00AFY\u00FA\u008F\fH\u00D4\u00AF\u00B1cY\u00C7\u00B5a\u00A1\u0089\u00BD\x0E\n\u00F7\u00A4\u00EFwt\x16\u0081\u00F7\u0092wP0\u00D2Z\x1B\x1E\u00A4w=\u00D7\u00FC\x00\u0095\u00D3.l\u00D5\u00E9E\u00F8\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
  },
};
function getUITheme (userWindow) {
  /*
  * @userWindow: ScriptUI Window | undefined | null
  * @return 'dark' | 'light'
  * */

  try {
    var themeWindow = userWindow || new Window('palette', 'Theme');
    var backgroundColorValues = themeWindow.graphics.newBrush(themeWindow.graphics.BrushType.THEME_COLOR, 'background').color.toSource();
    var backgroundColor = parseFloat(backgroundColorValues.slice(1, -1).split(',')[0]);
    var result = parseFloat((backgroundColor || 0.2).toFixed(1));
    
    return result > 0.5 ? 'light' : 'dark';
  } catch (err) {
    return 'dark';
  }
}
function getIconState(iconName) {
  /*
  * @iconName: string
  *
  * @return {
  *   normal: binary icon string,
  *   disabled: binary icon string,
  *   hover: binary icon string,
  * }
  * */

  return {
    normal: iconsData[uiSettings.theme].normal[iconName],
    disabled: iconsData[uiSettings.theme].disabled[iconName],
    hover: iconsData[uiSettings.themeInvert].normal[iconName],
  };
}
function getIcon(iconName) {
  /*
  * @iconName: string
  *
  * @return undefined | ScruptUI Image
  * */
  
  var icon = getIconState(iconName);
  return !icon ? undefined : ScriptUI.newImage(icon.normal, icon.disabled, icon.normal, icon.normal);
}
function drawIcon(button, iconState, size, position) {
  /*
  * button: ScriptUI Button Element
  * iconState: string
  * size: {
  *   width: number,
  *   height: number
  * }
  * position: {
  *   x: number,
  *   y: number
  * }
  * */
  
  var icon = getIconState(button.iconName);
  
  button.graphics.drawImage(ScriptUI.newImage(icon[iconState]), position.x, position.y, size.width, size.height);
}
function getColorForBrush (colorRGB) {
  /*
  * colorRGB: [
  *   red: number [0-255],
  *   green: number [0-255],
  *   blue: number [0-255]
  * ]
  *
  * @retrun [
  *   red: number [0-1],
  *   green: number [0-1],
  *   blue: number [0-1],
  * ]
  * */
  
  return (colorRGB instanceof Array) ? [
    (colorRGB[0] / 255).toFixed(2) * 1,
    (colorRGB[1] / 255).toFixed(2) * 1,
    (colorRGB[2] / 255).toFixed(2) * 1
  ] : [0, 90, 255];
}
function drawButtonShape(color, isOutline) {
  /*
  * color: ColorRGB - values format [0-1]
  * isOutline: booelan
  * */
  
  var canvas = this.graphics;
  
  // create fill circle
  // if isOutline = true, fill opacity = 1
  var fill = canvas.newBrush(canvas.BrushType.SOLID_COLOR, getColorForBrush(color).concat([isOutline ? 0 : 1]));
  var shapePath = canvas.newPath();
  canvas.ellipsePath(0, 0, this.size[0], this.size[1]);
  canvas.fillPath(fill, shapePath);
  
  // create ring if isOutline = true
  if (!!isOutline) {
    var stroke = canvas.newPen(canvas.PenType.SOLID_COLOR, getColorForBrush(color).concat([1]), 1);
    canvas.strokePath(stroke);
  }
  
  canvas.closePath();
}
function createIconButton(group, props) {
  try {
    var options = {
      title: '',
      helpTip: '',
      method: null,
      icon: null,
      onClick: null,
      enabled: true,
      margins: [
        5, 5, 5, 5
      ],
      shape: {
        color: {
          normal: uiSettings.theme === 'dark' ? [255, 255, 255] : [0, 0, 0],
          active: [70, 160, 245],
          disabled: [130, 130, 130],
        }
      },
      justify: 'center',
      size: {
        button: {
          width: uiSettings.button.width,
          height: uiSettings.button.height,
        },
        icon: {
          width: 20,
          height: 20,
        }
      },
    }.extend(props || {});
    
    var iconName = options.icon || options.method;
    var button = group.add('iconbutton', [0, 0, options.size.button.width, options.size.button.height], iconName === null ? undefined : getIcon(iconName));
    // if (iconName !== null) {
    // } else {
    //   var button = group.add('button', [0, 0, options.size.button.width, options.size.button.height], '');
    // }
    
    if (options.method) button.method = options.method;
    if (options.margins) button.margins = options.margins;
    if (options.helpTip) button.helpTip = options.helpTip;
    if (options.justify) button.justify = options.justify;
    button.enabled = options.enabled;
    button.iconName = options.method || options.icon;
    
    if (options.onClick instanceof Function) {
      button.addEventListener('click', function (event) {
        options.onClick(this, event, options);
      });
      button.addEventListener('keyup', function (event) {
        if (event.keyName === 'Enter') {
          options.onClick(this, event, options);
        }
      });
    }
    
    button.onDraw = function (event) {
      try {
        if (!this.image) return;
        
        var imagePosition = {
          x: (options.size.button.width - options.size.icon.width) / 2,
          y: (options.size.button.height - options.size.icon.height) / 2
        }
        
        if (!this.enabled) {
          drawButtonShape.call(this, options.shape.color.disabled, 'isOutline');
          if (iconName) {
            drawIcon(this, 'disabled', options.size.icon, imagePosition);
          }
        } else if (event.leftButtonPressed && event.mouseOver) {
          drawButtonShape.call(this, options.shape.color.active);
          if (iconName) {
            drawIcon(this, 'normal', options.size.icon, imagePosition);
          }
        } else if (event.mouseOver || event.hasFocus) {
          drawButtonShape.call(this, options.shape.color.normal);
          if (iconName) {
            drawIcon(this, 'hover', options.size.icon, imagePosition);
          }
        } else {
          drawButtonShape.call(this, options.shape.color.normal, 'isOutline');
          if (iconName) {
            drawIcon(this, 'normal', options.size.icon, imagePosition);
          }
        }
      } catch (err) {
        alert('button.onDraw: \n' + err + '\n' + err.line);
      }
    }
    
    return button;
  } catch (err) {
    alert('createIconButton:\n' + err + '\n' + err.line);
  }
}
// icons end

var win = new Window('palette', scriptName + copyright, undefined, { borderless: false, closeButton: true });
win.margins = [0,0,0,0];
win.alignChildren = 'fill';
win.addEventListener('mousedown', function (e) {
  if (e.button === 2) {
    $size.win.value = ($size.win.value === 'max' ? 'mim' : ($size.win.value === 'mim' ? 'mid' : ($size.win.value === 'mid' ? 'min' : 'max')));
    win.size = $size.win[$size.win.value];
    win.update();
  }
});


function onClickDirectionButton (button, event, options) {
  runScript(button.method);
}

var buttonsGroup = win.add('panel');
buttonsGroup.orientation = 'column';
buttonsGroup.alignChildren = 'center';

var buttonsGroupRowFirst = buttonsGroup.add('group');
buttonsGroupRowFirst.orientation = 'row';

createIconButton(buttonsGroupRowFirst, { method: 'top_left', helpTip: 'Top Left', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowFirst, { method: 'top_center', helpTip: 'Top Center', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowFirst, { method: 'top_right', helpTip: 'Top Right', onClick: onClickDirectionButton });

var buttonsGroupRowSecond = buttonsGroup.add('group');
buttonsGroupRowSecond.orientation = 'row';

createIconButton(buttonsGroupRowSecond, { method: 'middle_left', helpTip: 'Middle Left', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowSecond, { method: 'center', helpTip: 'Center', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowSecond, { method: 'middle_right', helpTip: 'Middle Right', onClick: onClickDirectionButton });

var buttonsGroupRowThird = buttonsGroup.add('group');
buttonsGroupRowThird.orientation = 'row';

createIconButton(buttonsGroupRowThird, { method: 'bottom_left', helpTip: 'Bottom Left', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowThird, { method: 'bottom_center', helpTip: 'Bottom Center', onClick: onClickDirectionButton });
createIconButton(buttonsGroupRowThird, { method: 'bottom_right', helpTip: 'Bottom Right', onClick: onClickDirectionButton });


var extraOptionsPanel = win.add('panel');
extraOptionsPanel.orientation = 'column';
extraOptionsPanel.alignChildren = 'fill';

var extraOptionsGroupFirst = extraOptionsPanel.add('group');
extraOptionsGroupFirst.orientation = 'row';
extraOptionsGroupFirst.alignChildren = 'fill';

var copiesGroup = extraOptionsGroupFirst.add('group');
copiesGroup.orientation = 'column';
copiesGroup.alignChildren = 'fill';

copiesGroup.add('statictext', undefined, 'Copies:');
var __copies = copiesGroup.add('edittext', undefined, 0);
__copies.addEventListener('keydown', function (e) {
  inputNumberEvents(e, this, 0, Infinity);
});

var gutterXGroup = extraOptionsGroupFirst.add('group');
gutterXGroup.orientation = 'column';
gutterXGroup.alignChildren = 'fill';

gutterXGroup.add('statictext', undefined, 'Gutter X:');
var __gutterX = gutterXGroup.add('edittext', undefined, '0 px');
__gutterX.addEventListener('keydown', function (e) {
  inputNumberEvents(e, this, 0, Infinity);
  doubleGutters(e, this.text, [__gutterX, __gutterY]);
});

var gutterYGroup = extraOptionsGroupFirst.add('group');
gutterYGroup.orientation = 'column';
gutterYGroup.alignChildren = 'fill';

gutterYGroup.add('statictext', undefined, 'Gutter Y:');
var __gutterY = gutterYGroup.add('edittext', undefined, '0 px');
__gutterY.addEventListener('keydown', function (e) {
  inputNumberEvents(e, this, 0, Infinity);
  doubleGutters(e, this.text, [__gutterX, __gutterY]);
});

var eachSelectionGroup = extraOptionsPanel.add('group');
eachSelectionGroup.orientation = 'row';
eachSelectionGroup.alignChildren = ['fill', 'fill'];

var __eachSelection = eachSelectionGroup.add('checkbox', undefined, 'Apply for each elements');
__eachSelection.value = false;

var ghostCopiesGroup = extraOptionsPanel.add('group');
ghostCopiesGroup.orientation = 'row';
ghostCopiesGroup.alignChildren = ['fill', 'fill'];

var __ghostCopies = ghostCopiesGroup.add('checkbox', undefined, 'Ghost copies (skip steps)');
__ghostCopies.value = false;

var __bounds = extraOptionsPanel.add('dropdownlist', undefined, 'Bounds: Geometric,Bounds: Visible'.split(',')),
  __position = extraOptionsPanel.add('dropdownlist', undefined, 'Position: Relative,Position: Absolute'.split(','));
__bounds.selection = __position.selection = 0;

function getData(direction) {
  return {
    direction: direction,
    position: __position.selection.text.replace('Position: ', '').toLowerCase(),
    bounds: __bounds.selection.text.replace('Bounds: ', '').toLowerCase(),
    eachSelection: __eachSelection.value,
    ghostCopies: __ghostCopies.value,
    copies: parseInt(__copies.text),
    spacing: {
      x: __gutterX.text,
      y: __gutterY.text
    }
  }.stringify();
}

function runScript(direction) {
  (setFN.toString() + '\nsetFN();' + '\nselection.stepArepeat(' + getData(direction) + ')').btSend();
}

function saveSettings() {
  var $file = new File(settingFile.folder + settingFile.name),
    data = [
      __position.selection.index,
      __bounds.selection.index,
      __eachSelection.value,
      __ghostCopies.value,
      __copies.text,
      __gutterX.text,
      __gutterY.text,
      $size.win.value
    ].toString() + '\n' + win.location.toString();
  
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
        $location = data[1].split(',');
      __position.selection.index = parseInt($main[0]);
      __bounds.selection.index = parseInt($main[1]);
      __eachSelection.value = ($main[2] === 'true');
      __ghostCopies.value = ($main[3] === 'true');
      __copies.text = $main[4];
      __gutterX.text = $main[5];
      __gutterY.text = $main[6];
      $size.win.value = $main[7];
      
      $winLocation = $location;
    } catch (e) {
    }
    $file.close();
  }
}

win.onClose = function () {
  saveSettings();
  return true;
}

function checkSettingFolder() {
  var $folder = new Folder(settingFile.folder);
  if (!$folder.exists) $folder.create();
}

checkSettingFolder();
loadSettings();


win.location = [0, 0];
win.center();
win.show();