/*

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: smallWorker.jsx;

  Copyright (c) 2020
  www.ladyginpro.ru

*/

// #target illustrator
#targetengine smallWorker

function helpersFunctions() {
  $.errorMessage = function (err) {
    alert(err + '\n' + err.line);
  };
  $.appName = {
    indesign: (BridgeTalk.appName.toLowerCase() === 'indesign'),
    photoshop: (BridgeTalk.appName.toLowerCase() === 'photoshop'),
    illustrator: (BridgeTalk.appName.toLowerCase() === 'illustrator')
  };
  $.getUnits = function (val, def) {
    try {
      return 'px,pt,mm,cm,in,pc'.indexOf(val.slice(-2)) > -1 ? val.slice(-2) : def;
    } catch (e) {
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
      var unit = $.getUnits(obj), val = parseFloat(obj);
      if (unit && !isNaN(val)) {
        obj = val;
      } else if (!isNaN(val)) {
        obj = val;
        unit = 'px';
      }
    }
    if ($.appName.illustrator) {
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
    } else if ($.appName.photoshop) {
      return parseFloat(obj);
    }
  };
  String.prototype.convertUnits = function (b) {
    return $.convertUnits(this.toString(), b);
  };
  String.prototype.numberFormat = function () {
    return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
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
  String.prototype.btSend = function (onResultHandler, onErrorHandler, __appName) {
    var BT = new BridgeTalk;
    BT.body = this;
    BT.target = __appName || app.name.toLowerCase().replace('adobe ', '');
    
    BT.onError = function (err) {
      if (onErrorHandler instanceof Function) {
        onErrorHandler(err);
      } else {
        alert('btSend: ' + err.body);
      }
    };
    
    if (onResultHandler instanceof Function) {
      BT.onResult = function (result) {
        onResultHandler(result);
      }
    }
    
    BT.send();
    return BT;
  };
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
  $.getObjKeys = function(object) {
    var props = [];
    
    for (var key in object) {
      props.push(key);
    }
    
    return props.join('\n');
  }
  $.removeSpaces = function (str) {
    return str.replace(/ /g, '');
  }
  $.getUITheme = function (userWindow) {
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
}
function scriptBody(props) {
  props.shiftKey = (props.shiftKey === 'true');
  props.ctrlKey = (props.ctrlKey === 'true');
  props.altKey = (props.altKey === 'true');
  
  function getActiveArtboard() {
    return activeDocument.artboards[ activeDocument.artboards.getActiveArtboardIndex() ];
  }
  function getActiveLayer() {
    return activeDocument.activeLayer || activeDocumet.layers[0];
  }
  function createRectangleByArtboardSize (placementElement, artboard) {
    var currentArtboard = (artboard && artboard.typename === 'Artboard') ? artboard : getActiveArtboard();
    
    if (!currentArtboard) {
      return null;
    }
    
    var rect = currentArtboard.artboardRect;
    var rectangleGroup = (placementElement && ((placementElement.typename === 'Layer') || (placementElement.typename === 'GroupItem'))) ? placementElement : getActiveLayer();
    var rectangle = rectangleGroup.pathItems.rectangle(rect[1], rect[0], rect[2] - rect[0], rect[1] - rect[3]);
    
    if (rectangleGroup.typename === 'GroupItem') {
      rectangle.move(rectangleGroup, ElementPlacement['PLACEBEFORE']);
    }

    return rectangle;
  }
  function ungroupAll (group, placementGroup) {
    if (!group) return;

    var items = group.pageItems;
    
    if (!items) {
      group.remove();
      return;
    }

    var i = items.length;
    
    if (!i) {
      group.remove();
      return;
    }
    
    while (i-- > 0) {
      if (items[i].typename === 'GroupItem') {
        ungroupAll(items[i], placementGroup || group);
      } else {
        items[i].move(placementGroup || group, ElementPlacement['PLACEBEFORE']);
      }
    }
    
    // group.remove();
  }
  function unlockLayersAndItems (items, isUnlockItems) {
    if (!items) return;
    
    var i = items.length;
    
    if (!i) return;
    
    while (i-- > 0) {
      items[i].locked = false;
      
      if (isUnlockItems && ((items[i].typename === 'GroupItem') || (items[i].typename === 'Layer')) && items[i].pageItems.length) {
        unlockLayersAndItems(items[i].pageItems);
      }
      
      if (items[i].typename === 'Layer' && items[i].layers.length) {
        unlockLayersAndItems(items[i].layers, isUnlockItems);
      }
    }
  }
  
  switch (props.method) {
    case 'clipping_by_artboard': {
      var items = selection;
      var i = items.length;
      
      if (!i) return;
  
      var rectangleMask = createRectangleByArtboardSize(items[0]);
      var clippingMaskGroup = items[0].parent.groupItems.add();
  
      while (i-- > 0) {
        items[i].moveToBeginning(clippingMaskGroup);
      }
  
  
      rectangleMask.clipping = true;
      rectangleMask.moveToBeginning(clippingMaskGroup);
      clippingMaskGroup.clipped = true;

      break;
    }
    case 'close_other_document': {
      var currentDocument = activeDocument;
      var i = app.documents.length;
      var SAVE_OPTIONS = 'DONOTSAVECHANGES';
      
      while (i-- > 0) {
        if (app.documents[i] !== currentDocument) {
          app.documents[i].close(SaveOptions[SAVE_OPTIONS]);
        }
      }
      
      break;
    }
    case 'create_artboard_rectangle': {
      var placemenetItem = null;
      var selectionItems = selection;
      var artboards = activeDocument.artboards;
      var artboardsCount = (props.shiftKey ? artboards.length : 1);
      
      if (selectionItems.length) {
        placemenetItem = selectionItems[0];
      }
      
      for (var i = 0; i < artboardsCount; i++) {
        createRectangleByArtboardSize(placemenetItem, props.shiftKey ? artboards[i] : null);
      }

      break;
    }
    case 'ungroup_all': {
      var items = selection;
      var itemsCount = items.length;

      if (!itemsCount) return;
      
      for (var i = 0; i < itemsCount; i++) {
        if (items[i].typename === 'GroupItem') {
          ungroupAll(items[i]);
        }
      }

      break;
    }
    case 'unlock_all': {
      var activeLayers = activeDocument.activeLayer;
  
      unlockLayersAndItems(activeLayers ? [activeLayers] : activeDocument.layers, props.shiftKey);

      break;
    }
  }
}

helpersFunctions();

function runScript(scriptOptions) {
  var code = helpersFunctions.toString() + scriptBody.toString() + '\n' + 'helpersFunctions();' + '\n' + 'scriptBody(' + (scriptOptions || {}).stringify() + ');';
  code.btSend();
}

function resetButtonFocus(button) {
  try {
    resetActiveStateElement.active = true;
    button.active = false;
    win.update();
  } catch (err) {
  }
}

var scriptName = 'SmallWorker';
var copyright = ' \u00A9 www.ladyginpro.ru';
var settingFile = {
  name: scriptName + '__setting.json',
  folder: Folder.myDocuments + '/LA_AI_Scripts/'
};
var THEME = $.getUITheme();
var uiSettings = {
  unit: 'px',
  activeDocument: activeDocument,
  theme: THEME,
  themeInvert: THEME === 'dark' ? 'light' : 'dark',
  window: {
    location: [0, 0]
  },
  panel: {
    withTitle: [10, 20, 10, 10],
    withoutTitle: [10, 10, 10, 10],
  },
  button: {
    width: 34,
    height: 34,
    spacing: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
};



// icon start
var iconsData = {
  dark: {
    disabled: {
      clipping_by_artboard: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00C5IDATx\x01\u00CD\u00941\x0E\u00830\fE\u009D\u008A\u009D[\u00F4\x02\x15kO\u00D0[W\u00EA\u00C4\u00D4\u00A1Co\x01\x17\bN\u00E4 cl\u0093H\f|\u00C9 9\u00C9\u00CBOl\x05\u0080\x14c\u00BC\u00A7\u0080F\u00C9u78Y\u0081\u00D1\u009B\u00DD\t\u00FD\u00D3\u00E7t\u0087]\b!\u0093\u0099\u00D37\u00C6\x03c\u00C4\u00B1\u00B9L\u00C4\u00F1\u00DE\u00C8\u00BF\u00D2\u00BFp4\u0087-\u00B0~\u00E7P\x01\u00E6E\u00B4\u00F3\u0084\u00F1\u00C3\x18h\u00EE\x13\u00F3@\u00F9/m\u00B2\u00D1\u00CE!s a \u00F2\u00D9\u00F1!\u0090\u00C9\u0083\r \u008E\u00EF\x02\u00E9n<X\u00A7\u00C1T +\u0080\t\x03Gf\u0095k`Z\u00955\u00E0XQ\x18~\x12\x1FX\x033N\u0092\u00E5\u00DDG\u00E9\u00B3\u008F\u00D7\u00E4\u00D4\u0097\u00B6Cm\u00D1Q\u009E\u00EB\u00FA\u00AF\u00CD\u00AA\u00CB\u00BE\u00D8\x0BN\u00C6\u0083_]\u00B0(\u00C0\x00\x00\x00\x00IEND\u00AEB`\u0082",
      close_other_document: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00F0IDATx\x01\u00B5\u0094\u00A1\x12\u00C20\f\u00863n\x06\fbO0\u00C44v\u00EF\u00C0\u00E3bQ\u0088i\x04ffbz\x06\x01\x021\u00FE\u008C\f\u00CA-\u00ED\u00DA\u00A3\u00FB\u00EFr\r#|\u00FD\x13\u00DA\x11EV\u00E2\u00FA\u00B2\u00EF\u00FB\x03\u0085\u00C0\u0092\u00E4\u00B8\u00A2\u00C8J}\u008Axg\u00ED9:(\u00B0\x14?\u00B5\u00F4\u00A7L(o\u009C\u00CA\u00C3\u00E0Y\x19y-\u00D0A\u00CB\u00CE0dV6y9\u00E4\u00B6\u00B0\u00D4>\u00B5\u00DE-\x0BtV\u00CEc\u0083V7XJ\x01\u009E\u00C8\u00ADV\x05\x02RJ\u00CA\u008E\u00F6\u00885\u00E2n\u00D9p'\u008C\n\u00B1\u00C5\u00E7\\s\u00C8\u0080\u008F3\u0081Udi\u0082\u00DE\x7FV\u0087\u00C8\u00D8\u00846\u00C3\u008A\u00BE\u008E\x06\x18\u00DA}(\u00EE\u00F8\u00EC\u00DE\fX\u00C7s\u009E8\u00E4\x1F\u00A3\u00F8\u008C4G\u00B4\x1AL\u00D4\n(\x1B\u00A1\u00B6\u0096\x19\u00FA\u00A4\u0099c\u0082\u009A\x0B\x03\u0090^\u00917\u00E3m\u00F1z98\u00A0\u008D\u0091\u00D7\x13`\u00E8\u009D\u00D6\x14\u00FD.G\u00D7\x0B\x07\u00BFX\x10\x06\u00A4u;\x00\x00\x00\x00IEND\u00AEB`\u0082",
      create_artboard_rectangle: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00ACIDATx\x01\u00ED\u0094M\x0EF0\x10\u0086g\u00BEX\u00D9~\u00CE\u00E0\x0E.\u00C0\u00C6i8\x00\x0E\u00E066\\\u00C0\x1D\\\x01[\u00DB\u00EA\u0088&m\u00A3\x1A\u00D1\u0085\u00847\u00E9of\u009E\u00FE\u00CE\x00\u00ECb\u008C\u00FD\u00A9\u00C0E\u00E9~?p,\u0094\u00E8\x11\u00DCSO\u0095'\u00CFL9nmP3X\u00BA\u00F2\u00D4\u00DB\u008FK\u00C5^\u00C8C\u00C4\u0099:|\u00A7\u008A\u00C3\u00D2V\u0083\x05\x18\u00CAc\u00C1A1\u00C1\u0081\u00A9f\u00D0\u009C\x01M\u00F6\u00CA\u00A3\u00D01\u00F91\x06\x1BL\x00\u00C8V\u00BF\x1A\u00E7\u00AF\u00FC\x01\u00DF\x00t\u00FE\u00B1\u008D\u00B1<f\x10\u0082E\u0087\u00B1l\u00CA\u0081~RX\u0081\u00DA\u008E7\u008E\u00F3\u00F4\u00A5\u00AC\u00F0\u00C8\u008C\u00BD\x02\u00CB [\u0081\u009FWj\u00D0\x00\x00\x00\x00IEND\u00AEB`\u0082",
      remove_empty_layers: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\u0092IDATx\x01\u00ADT=O\u00C2P\x14\u00BD\u008F\x00\t$\u00EA\u00C0\u00A0\u0083\f:8\u00C8 \u008B\u00AB\u00FF\x7Fp\u0080A\x13;\u00C8 \x03$2\u0088\u00B1\x1D \u00A9\u00E7\u00D0\u00F3\u00E4\u00B5ym\u008D\u00F1&'-\u00F7\u00DD{\u00DE\u00B9\x1F\u00D4\u00EC\u009F\u00CD\u00B5\x05\u00E4y\u00DE\u00C3\u00E3\x1C\u00D8\x01\u009F\u00CE\u00B9\u00F4O\u0084\"\u00BA\x02n\u0080\r0\x00\u0086\u00C0\u0082\u00A8#v5d\u00D7\"\u00CA\u0081'$/\u00E5\u00BF\u0094\u009Fy\t\u00FCo\u008D\u0084H\x18)\u00E1TJ^\u0091\u00B4\u0087\u00FF\f\u00EF;\u00AA\u00AA(\u00CF\u0080\x19\u00FC\u009B\x12!\u0082X\u00CA\u00C4\u008A^m\x14\u0094\x05\x17M\x0F\u00C1\u00CE\u00CD\x02\u00DF@\u00A4c`)\u00C5\u00A9\x13\u00D9\x03\u00F0\x05<\u00FB\u00DBT\u009E\u00B7\u00B1\u009E\u00BED\u00AA]\x07U\u00DD\x01T\u00FE\u00D8\u00B1\u00A2\u00D9\u00B4\u00BE\u0095mo\u00F5\u00D6\u00AB\u0089M]\u0093\u00FC\u0096\u0092\u0087RF\u0085++\u0086\u0097\u00C5\u0086\u00C2 \x06'v\x1C\n/\u00EC\u00E1}\x1B\f\u0085\u009B\u00F0\u00A1\u00CB\u00CBC\u00A9Z\u00DDz\u00C0\u00CF\n8\u00BC\\\u00FEE5\u00D7E\u00C8FR\u00F8.\x15T\u00C3\u0089\u00A7*\u00EF\u00A0\\gYu\x17]@\u00C4]\u00BBU\u0092\u0089$\x111\u00CF\u00BA\u00EA\x15\u00DF\u00D9S?L\u0096;\u00F7=\u00F7C\u0099HI\u00CC\u0098\u00B0by\u0088\u00BB\u00B7bWc\u00C6\u00F2_:\b\u00BAh 3)\u00F6\u00E7'\rq\u008C\x19u\u00A5`aqR\u00FAW\u00AA\u0082}\u00ED7\x10r#\u00D6a\x0F\u00D9\u0093\u00A9\x1D{\u00F8[\u00A3 \u00EE\u00E0\u0096?bS\u00F6+3l!\u00E2\x10\u00E6\u00E1\x0EF\t\x03b\u0092r5\u00BA\u0095#~h\x7F\u00BED\u00D5\u00BC\u00C6/v\u00F0\u0097\f\u00D7&\u0089\x11y\u00FB\x06\u00C9W\u00BBb7\u00D0h\u00B4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ungroup_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00F6IDATx\x01\u00B5U1\x12\u0083 \x10<24\u00E45\u00B6\u00D6\u00B6y\u00AEmli\u00E3C\u00D2jI\x16\x06\f9\u008EAc\u00B23\f\u00B2\u0083\u00EB\u00DE\u00AD\u00A2r\u00CE\u00DD(B)5R\x03\u00AD\u00FD\u00BA\u00B6\u00F9[\\\u00E8\x1F\u00F0\u00CE\u00F6\u00BAk\u00ED\u00D5\u00C2\rC\u00BC\u00B4\u00E8\u00D1\u0082\u00F5\x15\u00D7\u00BD'\u00B0\u00BES\x03Z2\u0081\x11D \u00F6\u00C0\u00DCa\x18\u008C\u00A5&\u0092;\u0096\x04mt\u00B49\u008Bb\u00B6&\u0092\u00A3\b\x05e\u00AD\u0098fF\u00CF\u0091oB\u00EA\u00A1w\u00D61\u00BA\x03\x1Fz\u009A=x\u00E4n='\u00BD6\u00BE\u00CC\u00D43\x1BgC\u00EF\u00F2\u0093\u00C8\u0090\x05\u00B8A\x12tI\fO|f\u00A2\u008E\u00ED3\x02W\u0096\f\u0091\u0089\u00AD}\u00EF&*Q\x04\x15\x04\u00F3\u00B4\x0E~zW)\u00A8S\u009F^\f\u00B0.\u00E8SJ#\u00E70%'\u00FC\u00E5\u00EE\u00B9\u00A0\u00DEsd\u00D1gP+\u009C\x19I,\b\u00EE\x10;\x12\x14)\u0089<s.\u00FE\u00FC<l\u0096|\u00F4\u00B7\u00F0\x02~8xQ\x11\u00C2\u00DA\u00AF\x00\x00\x00\x00IEND\u00AEB`\u0082",
      unlock_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\x05IDATx\x01\u00B5T\u00B1\x0E\u0082@\f\u00ED\x19\x1Dt\u00D0D\x07'F]0\u00E1\x0F\u00F8\x02?\u00D7?ppu\u0081\u00C1\u00D5\u00C5\u00C5A\x07\x1D \u00C1\x1E)I-\u00AD\x1CF_\u00D2\\\u00B9\u00DE{<\u00AE\r\x00?\u0086\u00B3\nUUMpI0f\x18CV\u00BA`\u00E4\u00CE\u00B9G\u00B0 \u0089\u00A5B\u0088\u00A3\u00C0\u00D8k\u00A2\x16!\u00A6\u00DA\x19#CbI/\x1A\u00E3\u00B2\u00C6\u0088\u00C8\u00FDA\x12\x07\u0086\u00E0\u0092\u00D6S#\u00E6\u0081\u00F9\x13\u0097\u009C\x1E\u00A7\x1AQu\u0088\u00C4\x1D\x18\u00C0Z\u0081N}:\u00D2\u00EA\u0096\u00C3\u00AF\u00D1r\u00F8\u00A1\u00BB\u00A0\u009D\u0095\u008Dq\u008AX\u00DA%\u00C4\u00D0\u00EA\u00B6\u00FC\u00E4\u00A6\u00BB\u00A1\u00F0\u00F7\u0098\u00F0\rI^(\u00A4zt\u0088\u00DC\u008C\f\u00C7[\u00B7\u00A5C\u00CD]=:bd\u00A4KSPCa\u00915\u0084\b\u00C6,_u\x1D\x0E\x11\u008C\u008C<H\u00B0\u0084\u00FE\u00E0W\u00D2j\u00C2\r\u0094N\u00E3|n\u00C1\u00C6\u0095?H\u0087G\u00E8\u00E7\u00D2\u00BB\u00CB\u00F8\u0086S\u00DC\u00F8_\u00D4\x06c\x0EvW\u00BD\u00D0\u00DD\x1B\u00A0q\u00FA\x1F^\u00AEFB\u00AB\u00CE2l\x0F\x00\x00\x00\x00IEND\u00AEB`\u0082",
    },
    normal: {
      clipping_by_artboard: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00ABIDATx\x01\u00CD\u0094\u008B\r\u0084 \f\u0086{\u0097\x1B\u0088\x11\u00DCL7d\x04Gp\u0084\u00FF\u00C0\u00F8\u00A8\x05j\x1B5\u00F1O\n\x01\u00C2\u00D7\x07\u00A1D\u008B\x00\u00F4\u00D9\u00C8)y\u00EFK7\u00EB\u00C3\u00E8\x03]\u00D3\u0090\u0087\u00DB#\u00DC\u0084]!\u00D9\u0098gq\u00DE\u00DA\u009F\u00A5\x01=\u00B0`\x01\x06\u00B6\u008E\u00C9\u00BAd\x13\u008E\u008A\u00CC\u0089\x0Edk\r\u00D6\u00AD\x11{\u0080\x1Al\x12\u0099\u00E8\u00C0\u00C5\u00B3\x06C+\u0090\x02(kS\u0083y\u0081#Xm\u00D0\u00A8%\u00CB\u00E4<B\u00C3+\x17\u0099\u0090\u00E1Q4X\u0091\u0089\x05h\u00FA1& \x1C\u00DFO\x02\x7F\x10=Px\u008B5\u00E7\u00B5\u00FD\u0095\u00F3h\u00B7\u00E9\u00F1\u00C6\u008E\u00FD\x07\u00C8\u00BBs%\u008A\x14\u0099\u008C\x00\x00\x00\x00IEND\u00AEB`\u0082",
      close_other_document: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00D2IDATx\x01\u00BDT\u0089\r\u00C20\ft+\x06\u00E8\ba\x046`\u00A4n\u00D02\x02\x13\u0094M:\n\u008C\u00C0\x06\u00E1,9\u00C8\x04\u0093\u0087F=\u00E9\u009A&v.\u00D7\u008BT\u00A2\u00C6\u00E8RE\x0FP\u008D\x18\u00D0\u00D3\u009E\u00F0\u0082D}\u00F2\n\u00D4\u00E8\u00D0I\x0Bv\u00C1I\u008D\bg\x15\u0089\u00FA\u00B0\u00DE<\u00C3>>\u00D9\x02J3\u00D5\u00A0$\u00D48\u00AB\u00E4\u00FE\u00D2[*\x11\u00EC3\x02\x0E\u00BC3)\u008F\x1B?>n\u0099\u00F3\u00C2\u00EB*\r\x17p\x01\x1D\u00F8@\u00E9\u00A8\u00FBd\u00DF\u0088a\x00y\u00CF\u00C9\u00B4,\u008E4x\u00EE\u00E2\u00BE (K\u00AB\u008C\u0093%\u00E8\u0094\u00E8[\u00CC\u00E8c\u009C\u0095\u00D8j:\u0094\u00F9 \u00B7\u00EAtH\u0091\u00E0\x02\u00CE\u0091\u00C3\u00F1+CJ\u00E0G\u0086\x1E\u00D3\u00AB|\u00EE\u00D3t\u0098\x12\u00CC\u00F5\x1D,\x07[\u00B0\u00EF\u00FF\u00F0\x1F\u00BC\x00\u00A5\tC\u00CD\u00D8\x10\u00E0\x7F\x00\x00\x00\x00IEND\u00AEB`\u0082",
      create_artboard_rectangle: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B2IDATx\x01\u00ED\u0094=\x0E\u00C20\f\u0085\u009FQ\x06\u00C4\u00CA\u0081(\x13\x1C\x07q\u0081\u0084\x0Bp\u009E2\x01\x07\u00EA\bb3ITKN\u0090\u00FA\u00A3f@j\u009F\u0094?\u00E7\u00F9\u00CB\u0090\u00C4@+f\u00AE|\u00DBa\u00A4\u00F2\u00BC\x15\n\u008B\u00C2\t\u00ED\u00FC\u008Ei\u00DA\u0087\u00CE\u00F8\u00C6\x12i\u00CE\x14\u00C7\u00ED\u0095\u00F1\u00BE\u00B9\u00CE\u00EC\u00CD\u00C1%~\u00E1\x18\"z\u00C6\x15s\u0092\u00F0\u00A9/\u00AE\x07\u0098\u00EC\x0B\u0087$\u00C0\x19\u00D1\x1B\u00A8\x0B\u00D8\u00EB\x0F\u0086Wm\u00B99\u00C1b\u00A0\u00827\u00E4hx\u00F1[^\u0080s\x00\x16\x7F\u00D8F\x07\u00F5\u00DF\x1C\u00F2\u00C0\u00B3\u00BF\x1CeT\u00B5I\u00B4>Z\u0087\x11\x12\x0E\u00A9\u00E2\u00F8\u00C04U?'\u00FCe\u00C5\u00FE\x02*sg\u00B4\u00FDP\u00C5\u00C7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      remove_empty_layers: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01QIDATx\x01\u00ADT\u0081Q\u00C2@\x10Lh@\u00EC v@\x07\u00C4\n\u00C0\n\u00B0\x03\u00E9 t\x10:\bV\u0080\x1D\u00FCX\x01v\u0090t\u0090tp\u00EE\u00C9\u00BE\u009C\u00F8\u00F97\x0E7\u00B3\u00C9\u00CFq\u00B7\u00DC\u00DE/d\u00D9\u008D#O\x15\u0088\u00C8\x1C\u00AF50\x00\x1Fy\u009Ew\u00D9\x7FB\u0089\u0080\u009D\u009C\u00C3\x01-\u00CF5PL\u00E1R\u00B2-\u00D0\x13\x1B\u0093\x7F&qk\u00F31\u00A2\u0092\u00D3(QE\u00B9\u009A_\u00F8\u00A98y\u00C5i\u0095\u00B8\f\x11\x15\u00C0\u00D1\u00C8+\u00AE>o\x14\u0081\u009E\u0086=\u008D\u00EF\u00C9y8\x01\x1D\u00B0\u00C5\u00D2\u00DF\u00BD<\u00D3\u00EF\u00E5\u00BD\u00F2=\u00A0\u00EE\u008DuK\u00BC\x0E\u0080\u00AAy\u009A\u00E1Q\u00B0H\x13\u00F6\u00D6{\u00AD'\u00BE\x07#\u00EELN{\x06\u009E\u00BB\u00E8\u00F8\x7F\u0090\u00EC\u00D8s\u0094\u00D0\u00CD\u00EB\u00F8\u00C6\x1E;s)\u00DA\u00BC\u00E0\u00D9\u00DB\u00A9'\u00E12K\u00C5\u0098=\u0098\u00F7vz\t\u00F5\u00CE\x02dev\u00DE\u00D3#\u00A0\u008B?\u0090\u00D8\u00E1\u00AC\u00B2\u00F7\u00C0\x03p/1/\u00D2k~'\u00DEc\x1B\u00CA]\u00F1<\u00A7W[S\u00E7~\u00ED\x0F\u0089\u00BD\u008C\u0087\u00F3\u00F2\u00E4\u00E2\u00D5P\u00D4_;\u00C7c-\u00E9hI\u00D8&\u00EAV\u00FE\u00D6\u00EA\u00C8\u00B7\u0096\u0084J\u00EF#d\u00F5\u00B5l\u00EB\u00AB)\u00E1\u0084\u0096JY&\x15Z\u0093\u00F6\u00A0!\u00AEF$\u00FE\u00F8'\u009A\x14r\u00F9I\u009E8Q\u009D\"\u00FA\x04tx\u00DE\u00E1\u00DB\u00D7XQ\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ungroup_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B3IDATx\x01\u00B5\u0095\u0081\r\u0084 \fE\x0Bq\u0090\u00DE$\u00E7M~\u00A3\u00C8&\x15\u0093b\u009A\u00DAZD}\tQ\u00C8\u00EF\u00E7\u00A7\x04MT\x01&U  \u00D2O\u009Ex\u0094\fo@\u00CC\x13\u00DAl\x14,<\u0090\u00E7\u00D8\u00D6`$!\x17\x13?g9\u00D7Z]\u00BF\u00AF+C\x14&$\u00CCQ\x17[\u0080\u00B5+'\u0093\u00CCV\u009A.\u00C3\u00DE\u0084^\u00CB\u00A2\x1E~\u00C9\u00E9!\u0089\u0083\u00EA1\u0094\u0089\u00D0*\u00B66\u00F1#\u009F\x10\u00B5!\u00F5\x1AY\u00B4\u00BB\u00BC\u009BUn]\u00BD\u0096P\u0092\u00F5\u008E\r\u0095\u00A2\u00F0\u00B4\u00A8\u00FA\u00FF\u00C1\u00D02q(u\u00FCX\u00F7\u0081\u00A3\u00F99#\x07\u00B5\u00BD'O\x00\u0083<\u00FE=\u009C\"\u00C1\u00D5\u00DF\u00C2\n\u00D9\x03\u00CCq6\u00C8\x01\u00AE\x00\x00\x00\x00IEND\u00AEB`\u0082",
      unlock_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B4IDATx\x01\u00BD\u0094\u0081\t\u00C5 \fD\u00D3N\u00E0\bnn7\u00E8\b\u00FE\x11\u00FE&\u00ED\x06\u00F9\u00CA\u00AF\x10\u00C3YM\u0091>\x10\nW/''\x12\u00BD\x053\u00FB\u00B4bZ\x07\u00D7\u00ECY\u00B3x\x153m$9L\u00A6W\u008ALH\u00CB\u00A9A\u00DB\u00A5E\u008Ba\u00C1\x03\u00CD\u0095\u00944\u008B2\ri+Mf\x05\u00D3[\u00ED\u00B2N\u00D6-f\u00A0][\u00DB\u00A2]\x0B\u00F1\u00CE\x10\u00A5\x0B\u00FCoV^\u0099*\u00E5\u009D!\u00C2\x0B\u00DD\u00A1\x1F\u00A4\u00C7H\u00CB\u00A7\u00F8vd\u00A1\u00910\b}\u00EB%\\\u00B4!\x1A\u00B4$F\u00F4\u008C>\u00F2Iv\u00AA=\u00DA\u00F0\u008Bv\u00A0\u00A3\t>\u00D4\u0082g_la\u00BAs\u00FF=\u008Cl}h\u009F\u00F0\x03\u00B4\x19\x1B91\x0E\u0085p\x00\x00\x00\x00IEND\u00AEB`\u0082",
    },
  },
  light: {
    disabled: {
      clipping_by_artboard: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B5IDATx\x01\u00D5\u00941\x0E\u00830\fE\u00DD\u008A\u00B9\u00B9E/P\u00B1v\u00E8\u00DCs3110p\x0B8\x01\u008Ed\x0B'\u00C4N@\x19\u00E0K\u009F\u00C1\u00E0\u0097O\x1C\x05`\u00D3\u009B|TA\u00DF\x13*\u00EB!\u00E8g\u00D2IM\u00FEQ=\u00A1\u00D4\u009F\u00EC\u00D0?\u00F4+z\u00AF\u00D5\u00B9\x0F\u00B4\u0084\x1Ft\u008F^\"\u0098V\x0F\u00D4$\u0080\u00DC\u00E4W\u009D\u00D1#\u00BA\u00A5o\u00BF\u00F4\u008D\u00AF\x0F\u00B4H\u00A0T\u00C2E4I\x18DuN\u009C\x05\u00B2,X\x0B\u00FB\u00DF7\u0081.\x03kR0\r\u00C8\x03\u00B0`\u00AA\u00AC)\u0097\u00C0\\\tP\u00EEM\x0EVe\u00CA\u00AC\u00E4\u0094\u00AD\u00FD\u00E0s\u00D6A\u00D9!W\x13ZM&\u00CC\u00EB^\u00B7\u00CD5o\u00EC\x15\u00A0\u008C3\u008A.Y\u008F:\x00\x00\x00\x00IEND\u00AEB`\u0082",
      close_other_document: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00D5IDATx\x01\u00B5\u0094\u00A1\x0E\u00C20\x10\u0086\x0F\u0082\x19\x06\u00B1'\x18\x02\u008D\u00DD;\u00F0\u00B8\u00B3(\u00C44\x02S3\u0081\u00C6 \u0086@\u00C0]v\u0085\x0B\u00DC\u00E5\u00DA\u00A4\u00FB\u0093?m\u00D6\u00F6\u00DB\u00BFk;\u0080\u00C2Z8\u00E3\x07\u00C8S\u00B7\u0084\u00C2Z%\u00CE\u00EB\u008C\u00E7;\u00F6G\u00DE'\u00A7HB\u00BB\u00980\u00BBV\u00A2\x1F\x04\x10f\u00AFar\u00AD,\u00A5&\f\u00ECb\u00C0\bu\u00E5\x1D\u009B5\u00BA\u00E5\u00FE\u00D1\u0099{\u00B5\u0080\u00ADH\u00B4GW\u00E8\u00D1\u0080l\u0099\u00D1\u00A37\u00E8F\x03V?\u00C9F^\u00A0\u00E9\x05\u00D3f\u00DD\u00D05\u0085\u00D0j\u00D8\u00C37Q\u0084=\u0094ytv\u00EF\x02Fm\u00D0\x12\u00D2\u00E2\x13\u00C5\u0087\u00A9.\x1A\fx\u00AC\x160j\x1BkS\u009E\u00E0\u00EF\u00EA\u0099_zA\x0F\u00C0\u00E74\u00F5\u00E7`i\x10\u00FD\u00A0\x01s\u00EF\u00F4\u009F\u008A\u00DF\u00E5\u00E2z\x03Hc(\n\u00B1\u00DC:s\x00\x00\x00\x00IEND\u00AEB`\u0082",
      create_artboard_rectangle: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009BIDATx\x01\u00ED\u0094\u00D1\r@0\x14E/\u00B1\u0081X\u00C1\x0Ev0\u008D\u0084!HLc\u0087\u00EE`\x05\u00B1\u0083\u00BEji\u009B*\u00A2\x1F\x12N\u0082\u00E6\u00E5\u00F6HU\x1F\u00B0\u0093\u00CA\u00EB.\u00C6\u00BC\x18\u0081\u00894{\u0081g0\u00BA%ze\u00AA\u00D6g\u00D6\x03\u00F5\u0089\u00BEcf^A\u00C2\u00D95\u00A1)0\u00C2/\u00CC\u00AD\u0092\u00F0DZ\u00A1\u00B4\x02\x03\u00FC8\u00F3\u00C6\u00A6\u00D02\u00F92\u00C6\x0B2!\u00A0\u00AC\u00FDi\u0082\u00EF\u00F2/\u00FC\u00820\u00F8\u008F}x\u0096\u00F98\u0087\x07\u0099\u00D9\u00C6\n\x12:{`\u00CB\u00FCB\x07\u00C2\x13\u00BC}\u00D9ox_\u00C7^\x00<\\ \u00B72\u00A1\u0082}\x00\x00\x00\x00IEND\u00AEB`\u0082",
      remove_empty_layers: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01zIDATx\x01\u00ADT=K\u00C3P\x14\u00BD\u00D1\u00B4\u0090\u0080:dP\u00A4\x1D,\u00E2`\u0087f\x117\u00FF\u00FF\u00E0\u0090\x0E\nf0C\x1D,\u00D8A\u00C1t\u00B0P\u00EF!\u00E7\u0099g|\u00EF5H/\x1C\x12\u00EE\u00BB\u00F7\u00E4\u00DC\u008F\x17\u0091=\u00DBa\u008F\u0098\u0081\u00E2\\\u0091(\u00B6\u008A\u00AF\u00FF\x12\u0082\u00E8Rqk\u0091^\u00F1\u00FD\u00D3G\x1Cy\u00C8&L\u0086\u00A2\x07\u00C5\x0B\u00FD#\u00FA\u0091W*\x16\u00BB\b3&\x1C+*\u00C5\u00B3b\u00A38\u00A1\u00A2\u009A\n/\x18\u00B7V\x14\u008AU\u00970UL\x15\u00A7<,\x18l,\u00E7\u00B3\u00B0|\tI\u00C7\u00AC\x00\u008A\u00EB\u0088dw\u00D2\u00F4\u00E5\u00D1\u00FA\u00DA\u00C8J\x1E\u00F3iJ\u0084\u00DA\u00A5U\u00D5\u008C\u00CA\u00EF\x0F\u00F8%\u00D8P~\u00DBF\u00FC6\u00F0\u00C4\u00D6QH\u00BE\u0095\u00E0*9\u00A52(|\u0095fxk\u00D7Pf\f\x06\u00A9\x19JBU\x1F\u00D2\x0E\x05\u009B\u00F0\u00CE\u00B8?C\u00E9\u009Ao=P\x01\u0086\u00B7\u00A5\u00BF\u00EA&\u00BA\b3*|\u00A3\n\u00A8\u00C1\u00C4k\u009E\x19\u00E5\x13\u00FA\x17>B\u00EC\u00DA5\u0093\u0084\u00C1%\u0089q\x16K\u00D3+\u00BC\u00E7\u00D2\x0E\x13\u00E5\u00CE\u00F9\u00C1\x1F\u00C2)\u0095\u00B8lE\"\u0094w#\u00CD\u00AE\u00BA\f\u00E7OX\u009B\u00B3\x00\u0099P\u00B19?\n\u00C4!&\u008B\u00A9\u00A0\x127iEu0\u00F4u\x18 D_\u0097v\x0F\u00D1\u0093\\\u00DA\x1E\u00F65\b\u00C2\x0Eb\u00A5\u009CS6+\u0093\u00EE \u00C2\x10\u00E6b\u00ED\u00A0\u008F\u00D0\x18H\u00B1\x1Aq\u00C7\u008F{l\u00FF\u0089\u00A4/!\u00CC\\I{mJ\t\u00DC\u00F3ob\u00E5\\+;Kna\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ungroup_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00DBIDATx\x01\u00B5U\u00BB\x0E\u00830\x103\x15\x0B|\rkg\u00D6|n\u00D6ve-\x1F\u00D2\x15\u00C64A\t9En\x12h\u00B1tBX'\u00CB\x17\u00E7\u00D1\x00P\u0088\u00D0(#\u00DB\u00DFf\u009AO\u00E1\u0086\u008B\u00A0P\u00EF.\u00DB\u00DB\x12n\u00F4\u00DF\u00C9\u00D6b\u00AB\u00B7u\u00F7\u00DC\x03\x050A#D^\u00B6\x06[\u009D\x17\u00FF\x06\u0095\x13\u009C\u00BC\u0098t\u00B6x\u009E\u008AH\u00B0PV[s\u00C2\u00CD\u009E/\u00829t\u00CE\u0086\u0084\x1B\x10\u00D74@\u00EE\u00C1\u00E0V3\u0087n\u00CC\u00B0fA\u00A4C\x1C?`D\fp\x07\x134B\u00EC-DM\u00D2\u00D7\x11\u008E\u008E\u00FCL\u00FEW\u00C2\x01<\u00A8MP\u00A6u\u00E4\u00E8\u00F5 A\u00FDz\u00F4\u00FA\u0092\u00A0\x16%\u00B9\u00E0$\u00DD\u00DCiP\u00DB\u00C85W\u0096\f\u00CA\u0089\u00B3\u00D4w\u00C1\x1A\u00D4\x06\u0085\x06\x1C\u00A7\u00EF\u00C5\u00BF\u00DF\u00875#\x1Fz\x16>\u00CC\u00AE3T\u00BCW\x1Dt\x00\x00\x00\x00IEND\u00AEB`\u0082",
      unlock_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\x00IDATx\x01\u00B5S\u00BB\x0E\u00C20\f4\x05\u0084x\b\x06\x06\x16:\u00C2\u00D2\u00A1\x7F\u00C0\x17\u00F0\u00B9\u00FC\x01\x03bc)\x03+B\u00B0 \u00C1\x02C;`\u00AB\u0089pS\x1BR\u00A9=\u00E9\u00D44\u00CE\u009D\u00AE\u00B1\x0BP3Z?j\x03d\u008C\u009C ;l\u00FF\u0086<\"_U\f\u00C9l\u00E5\x18q\u00A4\u00C8\u00ADd\u00AA\t\"S;#\x13df\u00F6\u00FB\u00C8%24\u00E9w\u00AE0P\fg\u00E6ybf\u00847\u00E4\u009FK\x18KB-\u00E1\x06t\u00A4\u00E6\u00D9\u0095\u008A\x01\u00D4\f)\u00A1\u00D6]P\u00CE\x16\x1A\u00D3\x16\x0EPwG\u00E0\u0097~\u008E\u00BC\u00C2\u00F7\x1AJ\"\u00DB]_\u00D0=\u00C6|\u00C3\x15O\x05\u0091\x1D\x1D\x12\u00DB\u0091\u00E1(t\u00DBM(\u00A5\u00B3\u00A3\u00C3G\u00C6M\u00A9\x1AJH5\u00B1\x04\x1F\u00C3\u0088\u00AD\x17\u00FF\x0E\u00FB\x18\u0086\u00CA\u00DA\u00CB0\u0083\u00EA\u00E0WRj\u00C2\x13\u00E4N\u00AFA\u00C7\u009D\u00BF\u00B8\t\x0FP-%\u00A5K\u00F8\u0086\u00FB\u00A7\u0090\u00D9\x059D\u00F6\u0084:7z \u00F7\u0090\u008FSs\u00F8\x00NS(\u009B\u0086\x1BVg\x00\x00\x00\x00IEND\u00AEB`\u0082",
    },
    normal: {
      clipping_by_artboard: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00A0IDATx\x01\u00CD\u0094\u008B\r\u0080 \fD\u00ABq Fp3\u00D9\u00D0\x11\x1C\u0081\x11\x10\r\u008D\u00E5SZ\"&^r\x1AKx\u00B6%\x14\u00E0\u00D1\x16\u00DD\u00ABd\u00DF\f\u00835\x11\u00BA\u0085w\u00B2\u00D7cx\u0086T>\u00DA\x04\x1F\u00F1M\u00C5\u00C5q\x1F\x0B\u00EC\u0081\x19\r\u00D0\u0090\u00EF=x\rvd\x1D\u00E3\u00F8\x13\x11\u0088j\u00C1V\u0092\u00B1\x1A\u00D8\u00829H+\x11\u0081F\u0080\u00F9F\"\u00C5B\u00DE\x1B\u00AE\u0097j`\u00DE\x1B\u00AE\u0097\x00\x03O\u00B9V\t\x0BD\u00B5`\u00B5JD\u00A0\u00F6\u00C6\u00A8OY\x03+\u0080\x0B\u009430/\u00BB\u00A6Z\u00FC\u00E6|:m\u00FE9\u00B1O-\u00CD\x7F\u00FC'\u00AFb\u00A9\x00\x00\x00\x00IEND\u00AEB`\u0082",
      close_other_document: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BEIDATx\x01\u00BD\u0094\u008B\r\u00C20\fD\x0F\u00C4\x00\u008CPF`\x03F\u00EA\x06\u0081\x11\u0098\x006\u00E9(e\x046\b\u00B1tE\u00961\u00F9\u00A8\u009F\u0093\u00DC6\u00E9\u00E5\u00D5\u00B9H\x05\x16\u00D6\u00AE\u00F0>\u00A2\u0091\u00B7\u00C7\u00C6\u008A\u00C8w\x19\u0094\u00A7u7U\u00D0o\u0086\u00CDY\u0099\u00F1\u00B4~\u00BD\f\u00E7f\u00F53_\x13jX\x1A\u0088\x1A`)\u00C3.\u00D5\u00C8*\u00E9)\x17{\u00CA2\x1E\u00F8|K\u00F5 \u00F4\u0095\u00EAd|\u00A2>\u00D5\u0091k\u00CE\u00F0Zf7\u00FA\x00FB\u00ADo\x02F\x02\u00E5\x1E<`\u00A7\u00A0\x1Af}r\u00BF(\u00D8\u0080?Fp\x1B\u00C1\u00C0\u00ACO\u00E2\u00B8\u009A\x0E{/\u00C3\u009C\u00BC\fe\u00EE\u00CE\x06\u00DE\u00DE\u0097K\u00C0\u00AC\u00EF\u00E0,\u0098\u00A5\u00CD\u00FF\u0087\u00CD\u00FA\x00\u0093\u008DRz\u00EE\u00D1|\x14\x00\x00\x00\x00IEND\u00AEB`\u0082",
      create_artboard_rectangle: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00ED\u00931\x12\u00820\x10E\x7F\u0094\x1Bh\u00EF5\u00E8Xo\u00A4\u008D\u0096\u00DAj\u00A37R;\u00AEa\x0Fg\bY \u00C3\x02\u0099\x00C:x3\x0B3\u009F\u00FD\u009Fd\u0092\u00DD\u00A2\u0081L\x1DL\u00FD1\r\u0092\u00BE\r\x02\u00A3\u00EA?0\x1F\u00CC\u00E3\u00C8\u008F\u00C8\u0094\u00B6Jv\u00AE\u00DE\u00FB\x17p\u0089\u00FD\u00EEg\u00DA\u00EE\u00B79\x1C\u00F8s\x19\u00AE1\u00EE\u00F0\x07v\u00BF\u00979J\b\u00BA\u00D3\u00A0\u00E0g\u00B0_\u009Bm\u00EA\u00FC\u0084\x1BF\u00C2\u00BD\u00EC\u0091\u00E1\u00C1Oy\r\\B`\u00F0\u008B\x1DIE\u00CE\u00E6\u00D0\x05\u00DF\u00BD{\u00B3\f\x1BH.\u00C3#\u00F5\u00CF\u00B2\x03\u00B2\u00CBLj\u00E1\u008By\u0090KH0\x1D\u0092\u00BE\u00E0\u00A7\\\x00\u00B1\u008D(\u0088T\u00CE\f\u00A5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      remove_empty_layers: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01GIDATx\x01\u00ADT\u00C1Q\u0084@\x10l\u00CE\x00\u00C4\f\u00D6\f\u00C8\u00E00\x02\u00F5\u00E7O2\u00D0\f\u008E\f0\x03\u00CE\b0\x03\u00CA\b.\x04.\u0083\u00F3\u00E9\x0Fg\u008EF\x06j\u0097\x03\u00CB\u00AE\u00EAbYff\u00BBw\u00A6\x00\u00FE\x19W\x0Bbb\u00E1\u0093\u00D0\t\u00BF\u0085_\u00F8#\u00B4P.l\u0085\u00B5\u00B0\u00E1\u00BA`\u00F1Ux\x15\u009E\u00C8g\u00B3\u009F\u00B1p3\u00D9\x0F\"\u00A5\x1A-\u00B4\u00A3JEbT\u00C5\u00FC\u00D6\u00B2p\u00EA+\u00A4\u00C1\x15\x06{n\u00F2\u00BD$\u00A79%s\u00CA>'\u00E2\u00E2 <\u00A2\u00B3\u00FA\u00C9\u0084\u00CC$\u00F7\u00F6\u00DE\u00F9\u00D4\u00C6|p\u00BD\x15\u00EE\u00A9\u00FCq\u0083\u00B1\u0095\u00C8\x149\u00F1\u00F4\u00D6\u00EC\u00F5\u00EF\u00D7f/\u00C2\u00D0\u00F9\u00E3\u00AC|\u0083\u0090\u00E5\u009A9\x15\x02\u009DW\u00F9\u00FDx\u00E4\x18\u009A\u00A2\u00C1\u0089q\u0092\u00D3A\u00CD\u009C\u008B\u00C8\u00E0\x1F\u008F\f\u00C38\u00BD\u00F8\x127\u009E\u00BD\u0094\n\u00EF\u00D0]\u00FC\u009E\u0085U\u008D\u00DA~\x13\u00DE\nopa\x16\x13\fw\u00D2\x1AuNx\u00CFu\u00CC\x03\x1B\x13\u00E7\x1B\u00B3\u00F3\u00A9m\u0080\u00B5\u00B1W\u00CD\u00C4\x15<\x10\x0F3AV-&\u00CA|T'\u00E7\u00AA\u00C5\u00CC\u00A9)\u00E90\u009EM_\u00EC\b\x0E\u00E3;\\J\u00CDI0\u0083l\u0081\u00B5\u00FE\x1A\u00B6X\u0081]\u00C0\u00E2\u00F4O\u00B4\n\x0E\u00DD\u00EC\x1D\u00A8\u00E8\u00B7\u0093!\u00FC\x00\u00BB\u00A6\u0097un\u00C7$\u0090\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ungroup_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00ADIDATx\x01\u00B5U\x01\x0E\u00830\b\u00BC\x1A\x1F\u00C2^\u00B2\u00EE\u00FF\u008F\u00E8~\u00D2\u00CD\u0085E\u0082\u0094\u00D2\u00AA\u0097\x10\u0085\\\u008F\x0BD\u009B\x00T\u00ECH\u00E8\u00C3\u00E5\u00AF\x0Ey\n\x0BnBE\u00DC\u009D\u00CB\u00B5\x1C\x16\x0E\u00E2\u009CD-\f\u00D9\u00B5\u00F0\u00FB\u00F6\u00CC*\u00D7\\}\u00BEZ\u0082$D\u00AA\x10#\u00E3\u00B0\x15f\u00D7\u00ACH\u00B9\u00E1&$HA\u00870\u009A\u0098\x059\u00B3'\u00DA3,p\u00E6\u00AA\x05\u00BD-k\u00E7]\u00C1\x1E\u00DC1\u00A4\x01!\x0BI\b\u00FE\u00F2\u00B3\u009F\x1EY\u00C5\u00C3\u00CAU}\u0083\\\u008C;\u00C3\u0085m\u00FF\u00C3\u00C3\u00FB\x1B/\u00E6=8\x1F\u00C2\u00CC\u00A2\u009A\u00AE\u00A6\x17u\u00F9\u00FFp\rp\u0086\u00AE\u0085\x0F\u00BEOv\u00AA+MO\u00CF\x00\x00\x00\x00IEND\u00AEB`\u0082",
      unlock_all: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00ADIDATx\x01\u00BD\u0094\u00DD\r\u00830\f\u0084\u008FN\u0090\x11\u00BC9l\u0090\x11\u00D2\x11\u00BA\tl\u00D0\u00E6!V\u008Dq~,\">\u00E9\u009EL\u00CE\x076\x01\x1E\u0084\u00B2R\u00D6\u009E\u00F5\x15\u008A\u00A5\u00E66\u00D3FR;\u009C\u00A6\u00B1\x1C\\\u00B3\u0082j\u00B4\u0095Z\u0082\x03NBF-\u0088\u0094\u00D3\u00E0\u0086\x17^\u0098\u008CeH\u00B0\u00A7+%\u009FmB\x1D#\u00F7\u00B4\u00A3\u00C3\u008C\u00D5\u009C\u00B6\u0095\u008EW\u0087\u00F0_\x19\u009D\u00B2\u008A\u0095\u0080D=\u00A0\u00FDM\u0087\u00A6|(C\x17V\u00F7U\u00D47t\x12.\u0086\u00A1\u00C52X\u00BF\u00BC\u00F2\x01?\u00A73\u00DA\u00F0S9T\u00FD\u00D52o4 L^l6\u008D\u00E8\u00DF\u0087i\u00C4\u00EC6?D\u00F4x\u00B9_\u00C1|\u00E2\x00\x00\x00\x00IEND\u00AEB`\u0082",
    },
  },
};
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
          width: uiSettings.icon.width,
          height: uiSettings.icon.height,
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
// icon end

// start / edit text to number events
function editTextToNumberGetUnit(target, defaultUnit, notSetUnit) {
  var unit = target.unit || target.text.replace(/ /g, '').slice(-2);
  var allowedUnits = ',px,pt,mm,cm,in,';
  
  if (!allowedUnits.match(',' + unit + ',')) {
    unit = defaultUnit || '';
  }
  if (!notSetUnit) {
    target.unit = unit;
  }
  
  return unit;
}
function editTextToNumberChangeResult(target, value, unit) {
  var result = ('' + value).numberFormat() + (unit ? (' ' + unit) : '');
  target.text = result;
  return result;
}
function editTextToNumberFormatOnChange(target, defaultUnit) {
  var value = parseFloat(target.text.replace(/ /g, ''));
  var unit = editTextToNumberGetUnit(target, defaultUnit);
  
  editTextToNumberChangeResult(target, value, unit);
}
function editTextToNumberKeyEvent(target, event, min, max, callback, defaultUnit) {
  var direction = event.keyName ? event.keyName.toLowerCase().slice(0, 1) : '';
  
  if (direction !== 'u' && direction !== 'd') {
    return true;
  }
  
  // init unit
  var unit = editTextToNumberGetUnit(target, defaultUnit);
  
  // general
  var step = (event.shiftKey ? 10 : (event.ctrlKey ? .1 : 1));
  var minValue = (typeof min === 'number' ? min : -100000);
  var maxValue = (typeof max === 'number' ? max : 100000);
  var value = parseFloat(target.text.replace(/ /g, ''));
  var resultValue = value;
  
  // result
  if (isNaN(value)) {
    var valueNumber = value.replace(/[^0-9]/g, '');
    resultValue = valueNumber || minValue;
  } else {
    resultValue = direction === 'u' ? value + step : value - step;
    
    resultValue = resultValue <= minValue ? minValue : (resultValue >= maxValue ? maxValue : resultValue);
    
    if (callback instanceof Function) {
      callback(resultValue, unit, target, event, minValue, maxValue);
    }
  }
  
  // set value
  editTextToNumberChangeResult(target, resultValue, unit);
}
function editTextBrothersValues(target, elements) {
  try {
    var length = elements.length;
    var targetValue = target.text;
    
    // set unit for target
    var elementUnit = editTextToNumberGetUnit(target, target.unit || '');
    
    if (elementUnit) {
      targetValue = parseFloat(targetValue) + ' ' + elementUnit;
      target.text = targetValue;
    }
    
    for (var i = 0; i < length; i++) {
      if (elements[i] !== target) {
        elements[i].text = targetValue;
        elements[i].unit = elementUnit;
      }
    }
  } catch (err) {
    alert('editTextBrothersValues:\n' + err + '\n' + err.line);
  }
}
function editTextBrothersValuesHandler(elements) {
  var length = elements.length;
  
  for (var i = 0; i < length; i++) {
    elements[i].addEventListener('keyup', function (event) {
      var key = event.keyName ? event.keyName.toLowerCase() : '';
      
      if (
        ((key === 'right' || key === 'left') && event.altKey)
        || (key === 'enter' && event.shiftKey)
      ) {
        editTextBrothersValues(this, elements);
      }
    });
  }
}
// end / edit text to number events

function onClickIconButton (button, event, options) {
  runScript({
    method: options.method,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
  });
  resetButtonFocus(button);
}


var win = new Window('palette', scriptName + copyright, undefined, { borderless: false, closeButton: true });
win.margins = [10, 10, 10, 10];
win.spacing = 0;
win.orientation = 'column';
win.alignChildren = ['fill', 'fill'];

var resetActiveStateElement = win.add('checkbox', [0, 0, 0, 0], '');
resetActiveStateElement.margins = [0, 0, 0, 0];
resetActiveStateElement.spacing = 0;

var firstRow = win.add('group');
firstRow.orientation = 'row';

  // var create_artboard_rectangle = firstRow.add('');
  createIconButton(firstRow, { method: 'clipping_by_artboard', helpTip: 'Clipping selection by artboard size', onClick: onClickIconButton });
  createIconButton(firstRow, { method: 'close_other_document', helpTip: 'Close documents without active document', onClick: onClickIconButton });
  createIconButton(firstRow, { method: 'create_artboard_rectangle', helpTip: 'Create rectangle by artboard size', onClick: onClickIconButton });
  createIconButton(firstRow, { method: 'ungroup_all', helpTip: 'Ungroup all in selection', onClick: onClickIconButton });
  createIconButton(firstRow, { method: 'unlock_all', helpTip: 'Unlock all layers (in active layer or all layers)', onClick: onClickIconButton });

  function runScript(scriptOptions) {
    var code = helpersFunctions.toString() + scriptBody.toString() + '\n' + 'helpersFunctions();' + '\n' + 'scriptBody(' + (scriptOptions || {}).stringify() + ');';
    code.btSend();
  }



function saveSettings() {
  var $file = new File(settingFile.folder + settingFile.name);
  var data = [
    ].toString() + '\n' +
    win.location.toString();
  
  $file.open('w');
  $file.write(data);
  $file.close();
}
function loadSettings() {
  var $file = File(settingFile.folder + settingFile.name);
  
  if ($file.exists) {
    try {
      $file.open('r');
      
      var fileData = $file.read().split('\n');
      var generalSettings = fileData[0].split(',');
      
      var locationValues = fileData[1].split(',');
      uiSettings.window.location = locationValues;
      win.location = locationValues;
    } catch (e) {
    }
    $file.close();
  }
}
function checkSettingFolder() {
  var $folder = new Folder(settingFile.folder);
  
  if (!$folder.exists) {
    $folder.create();
  }
}

win.onClose = function () {
  saveSettings();
  return true;
}
win.onActivate = function () {
}

checkSettingFolder();
loadSettings();

if (!uiSettings.window.location[0] && !uiSettings.window.location[1]) {
  win.center();
}
win.show();