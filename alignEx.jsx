/*

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: alignEx.jsx;

  Copyright (c) 2020
  www.ladygin.pro

*/

// #target illustrator
#targetengine alignex

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
}
function scriptBody(props) {
  function getBoundsType (boundsType) {
    return boundsType !== 'visible' ? 'geometricBounds' : 'visibleBounds';
  }
  function getSelectionAreaBounds (elements, boundsType) {
    /*
    * @elements: [ElementItem]
    * @boundsType: 'geometric' | 'visible'
    */
  
    var elementsCount = elements.length;
    
    if (!elementsCount) {
      return null;
    }

    var x = [];
    var y2 = [];
    var y = [];
    var x2 = [];
    var boundsTypeValue = getBoundsType(boundsType);
    var boundsValues;
  
    for (var i = 0; i < elementsCount; i++) {
      if (elements[i].clipped) {
        var childsGroup = elements[i].pageItems;
        var childsGroupCount = childsGroup.length;

        for (var j = 0; j < childsGroupCount; j++) {
          if (childsGroup[j].clipping) {
            boundsValues = getAreaBoundsObject(childsGroup[j].geometricBounds, true);
          }
        }
      } else {
        boundsValues = getAreaBoundsObject(elements[i][boundsTypeValue], elements[i].clipped);
      }

      x.push(boundsValues.left);
      y.push(boundsValues.top);
      x2.push(boundsValues.right);
      y2.push(boundsValues.bottom);
    }
  
    return [
      Math.min.apply(null, x),
      Math.max.apply(null, y),
      Math.max.apply(null, x2),
      Math.min.apply(null, y2)
    ];
  }
  function getAreaBoundsObject (bounds, clippedElementOptions) {
    /*
    * @bounds: [
    *   x: number,
    *   y: number,
    *   x2: number,
    *   y2: number
    * ]
    * @clippedElementOptions: boolean
    *
    * @return {
    *   top: number,
    *   right: number,
    *   bottom: number,
    *   left: number,
    *   width: number,
    *   height: number,
    *   center: {
    *     x: number,
    *     y: number
    *   },
    *   clipped: boolean
    * }
    * */
    
    if (!bounds) {
      return null;
    }
    
    var boundsToObject = {
      top: bounds[1],
      right: bounds[2],
      bottom: bounds[3],
      left: bounds[0],
    };
    boundsToObject.width = boundsToObject.right - boundsToObject.left;
    boundsToObject.height = boundsToObject.top - boundsToObject.bottom;
    boundsToObject.center = {
      x: boundsToObject.left + (boundsToObject.width / 2),
      y: boundsToObject.top - (boundsToObject.height / 2),
    }
    boundsToObject.clipped = !!clippedElementOptions;
    
    return boundsToObject;
  }
  function getDifferenceBetweenVisibleAndGeometricBounds(element) {
    /*
    * @element: ElementItem
    * */
    
    var geometric = getAreaBoundsObject(element.geometricBounds);
    var visible = getAreaBoundsObject(element.visibleBounds);
    
    return {
      top: visible.top - geometric.top,
      right: visible.right - geometric.right,
      bottom: visible.bottom - geometric.bottom,
      left: visible.left - geometric.left,
    }
  }
  function getElementBounds (element, boundsType, clippedElementOptions) {
    /*
    * @element: [collection of ElementItem] | ElementItem
    * @boundsType: 'geometric' | 'visible'
    * @clippedElementOptions: boolean | 'ignoreClipped'
    * */
    
    if ((element instanceof Array) && element[0].typename) {
      return getAreaBoundsObject(getSelectionAreaBounds(element, boundsType));
    } else if (element && element.typename) {
      if (element.typename === 'Artboard') {
        return getAreaBoundsObject(element.artboardRect);
      } else if (element.typename === 'GroupItem' && element.clipped && clippedElementOptions !== 'ignoreClipped') {
        var groupChilds = element.pageItems;
        var groupChildsCount = groupChilds.length;
        
        for (var i = 0; i < groupChildsCount; i++) {
          if (groupChilds[i].clipping) {
            return getElementBounds(groupChilds[i], boundsType, true);
          }
        }
      } else {
        return getAreaBoundsObject(element[getBoundsType(boundsType)], clippedElementOptions === 'ignoreClipped' ? false : !!clippedElementOptions);
      }
    }
    
    return null;
  }
  function parseStringMargin (marginString) {
    /*
    * marginString: '0px 0px 0px 0px' | [
    *   ? number | string,
    *   ? number | string,
    *   ? number | string,
    *   ? number | string
    * ]
    * @return [
    *   number,
    *   number,
    *   number,
    *   number
    * ]
    * */
  
  
    var values = (typeof marginString === 'string' ? marginString.split(' ')
      : (marginString instanceof Array ? marginString : [0, 0, 0, 0]));
    
    var valuesCount = values.length;
    
    for (var i = 0; i < valuesCount; i++) {
      if (i >= valuesCount) {
        values.push(0);
      } else {
        values[i] = values[i].toString().convertUnits('px');
      }
    }
    
    return {
      top: values[0],
      right: values[1],
      bottom: values[2],
      left: values[3]
    };
  }
  function getOffsetOfClippedElement (groupElement, clippedBounds, boundsType) {
    /*
    * @groupElement: GroupItem | boolean
    * clippedBounds: {
    *   top: number,
    *   right: number,
    *   bottom: number,
    *   left: number,
    *   width: number,
    *   height: number,
    *   center: {
    *     x: number,
    *     y: number
    *   },
    *   clipped: boolean
    * }
    * @boundsType: 'geometric' | 'visible'
    *
    * @return {
    *   x: number,
    *   y: number
    * }
    * */
    
    if (!groupElement) {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        center: {
          x: 0,
          y: 0,
        }
      }
    }
    
    var groupElementBounds = getElementBounds(groupElement, boundsType, 'ignoreClipped');
    var offsetValues = {
      top: clippedBounds.top - groupElementBounds.top,
      right: clippedBounds.right - groupElementBounds.right,
      bottom: clippedBounds.bottom - groupElementBounds.bottom,
      left: clippedBounds.left - groupElementBounds.left,
    };
    var offset = {
      top: offsetValues.top < 0 ? offsetValues.top * -1 : offsetValues.top,
      right: offsetValues.right < 0 ? offsetValues.right * -1 : offsetValues.right,
      bottom: offsetValues.bottom < 0 ? offsetValues.bottom * -1 : offsetValues.bottom,
      left: offsetValues.left < 0 ? offsetValues.left * -1 : offsetValues.left,
    }
    offset.center = {
      x: offset.left,
      y: offset.top,
    };

    return offset;
  }
  function getElementPosition (areaElement, alignElement, margin, elementBoundsType, areaBoundsType, isEdgePosition) {
    /*
    * @areaElement: [collection of ElementItem] | ElementItem
    * @alignElement: [collection of ElementItem] | ElementItem
    * @boundsType: 'geometric' | 'visible'
    * margin: [
    *   top: number,
    *   right: number,
    *   bottom: number,
    *   left: number,
    * ]
    * @isEdgePosition: boolean
    *
    * @return {
    *   top_left: [ number, number ],
    *   top_center: [ number, number ],
    *   top_right: [ number, number ],
    *   middle_left: [ number, number ],
    *   center: [ number, number ],
    *   middle_right: [ number, number ],
    *   bottom_left: [ number, number ],
    *   bottom_center: [ number, number ],
    *   bottom_right: [ number, number ],
    * }
    * */

    var areaElementBounds = getElementBounds(areaElement, areaBoundsType);
    var alignElementBounds = getElementBounds(alignElement, elementBoundsType);
    var alignElementGeometricBetweenVisible = getDifferenceBetweenVisibleAndGeometricBounds(alignElement);
    // var alignElementPosition = getAreaBoundsObject(alignElement[getBoundsType(boundsType)]);
    var alignElementPosition = alignElement.position;
    var clippedValues = getOffsetOfClippedElement(alignElementBounds.clipped && alignElement, alignElementBounds, 'geometric')
    
    if (!areaElementBounds && !alignElementBounds) {
      return null;
    }

    var isElementVisibleBounds = elementBoundsType === 'visible';
    var isEdgePositionMarginReverse = isEdgePosition ? -1 : 1;
    var elementBasePosition = {
      top: areaElementBounds.top - (margin.top * isEdgePositionMarginReverse) + (isEdgePosition ? alignElementBounds.height : 0) + clippedValues.top - (isElementVisibleBounds ? alignElementGeometricBetweenVisible.top : 0),
      right: areaElementBounds.right - (margin.right * isEdgePositionMarginReverse) - (isEdgePosition ? 0 : alignElementBounds.width) - clippedValues.left - (isElementVisibleBounds ? alignElementGeometricBetweenVisible.left : 0),
      bottom: areaElementBounds.bottom + (margin.bottom * isEdgePositionMarginReverse) + (isEdgePosition ? 0 : alignElementBounds.height) + clippedValues.top + (isElementVisibleBounds ? alignElementGeometricBetweenVisible.bottom : 0),
      left: areaElementBounds.left + (margin.left * isEdgePositionMarginReverse) - (isEdgePosition ? alignElementBounds.width : 0) - clippedValues.left - (isElementVisibleBounds ? alignElementGeometricBetweenVisible.left : 0),
      center: {
        x: areaElementBounds.center.x - (alignElementBounds.width / 2) - clippedValues.center.x - (isElementVisibleBounds ? alignElementGeometricBetweenVisible.left : 0),
        y: areaElementBounds.center.y + (alignElementBounds.height / 2) + clippedValues.center.y - (isElementVisibleBounds ? alignElementGeometricBetweenVisible.top : 0),
      }
    };
    var elementPosition = {
      top_left: [
        elementBasePosition.left,
        elementBasePosition.top
      ],
      top_center: [
        elementBasePosition.center.x,
        elementBasePosition.top
      ],
      top_right: [
        elementBasePosition.right,
        elementBasePosition.top
      ],
      middle_left: [
        elementBasePosition.left,
        elementBasePosition.center.y
      ],
      center: [
        elementBasePosition.center.x,
        elementBasePosition.center.y
      ],
      middle_right: [
        elementBasePosition.right,
        elementBasePosition.center.y
      ],
      bottom_left: [
        elementBasePosition.left,
        elementBasePosition.bottom
      ],
      bottom_center: [
        elementBasePosition.center.x,
        elementBasePosition.bottom
      ],
      bottom_right: [
        elementBasePosition.right,
        elementBasePosition.bottom
      ],
      top: [
        alignElementPosition[0],
        elementBasePosition.top
      ],
      right: [
        elementBasePosition.right,
        alignElementPosition[1]
      ],
      bottom: [
        alignElementPosition[0],
        elementBasePosition.bottom
      ],
      left: [
        elementBasePosition.left,
        alignElementPosition[1]
      ],
      horizontal_center: [
        elementBasePosition.center.x,
        alignElementPosition[1]
      ],
      vertical_center: [
        alignElementPosition[0],
        elementBasePosition.center.y
      ]
    }
    
    return elementPosition;
  }
  function sortByBounds(items, property, orderBy, boundsType) {
    /*
    * @items: [collection of ElementItem]
    * @property: 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'center'
    * @orderBy: 'DESC' | 'ASC'
    * */
    
    var orderByValue = (orderBy || 'desc').toLowerCase();
    var propertyValue = (property || 'left').toLowerCase();
  
    return [].concat(items).sort(function (first, second) {
      var firstBounds = getElementBounds(first, boundsType);
      var secondBounds = getElementBounds(second, boundsType);
    
      return orderByValue === 'asc' ?
        firstBounds[propertyValue] - secondBounds[propertyValue] :
        secondBounds[propertyValue] - firstBounds[propertyValue];
    });
  }
  function sortByX(items, orderBy, boundsType) {
    /*
    * @items: [collection of ElementItem]
    * */
    
    if (!items || !items.length) {
      return [];
    }

    return sortByBounds(items, 'left', orderBy || 'ASC', boundsType);
  }
  function sortByY(items, orderBy, boundsType) {
    /*
    * items: [collection of ElementItem]
    * */
    
    if (!items || !items.length) {
      return [];
    }
 
    return sortByBounds(items, 'top', orderBy || 'ASC', boundsType);
  }
  
  function body() {
  
    var items = selection;
    var itemsCount = items.length;
  
    // general code
    if (props && props.method) {
      var parsedProps = {
        isEdgePosition: props.isEdgePosition === 'true',
        boundsType: props.boundsType,
        shiftKey: props.shiftKey === 'true',
        keyObjectBoundsType: props.boundsType,
        margin: parseStringMargin(props.margin || ''),
      };

      // keyObjectDropdownList
      var keyObject = null;

      if (props.keyObject === 'selection') {
        keyObject = items;
      } else if (!isNaN(parseInt(props.keyObject))) {
        keyObject = selection[props.keyObject];
        parsedProps.keyObjectBoundsType = props.keyObjectBoundsType;
      }
      
      if (parsedProps.shiftKey) {
        parsedProps.isEdgePosition = !parsedProps.isEdgePosition;
      }

      // main
      var areaElement = keyObject || activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()];
      
      // distribute
      if (props.method.match(/distribute/)) {
        var direction = props.method.replace('distribute_', '');
        var sortedItems = props.method === 'distribute_x' ? sortByX(items, 'DESC') : sortByY(items, 'DESC');
        var sortedItemsCount = sortedItems.length;
        var isEdgePosition = parsedProps.shiftKey ? false : true;
        var isStarted = false;
        var prevElement = null;
        
        for (var i = 0; i < sortedItemsCount; i++) {
          // alert((!i && sortedItems[i - 1] !== keyObject) ? areaElement : (sortedItems[i - 1] !== keyObject ? sortedItems[i - 1] : areaElement));
          if (sortedItems[i] !== keyObject) {
            var areaObject = prevElement || areaElement;

            var elementPosition = getElementPosition(
              areaObject,
              sortedItems[i],
              parsedProps.margin,
              parsedProps.boundsType,
              parsedProps.keyObjectBoundsType,
              isEdgePosition
            );
            
            if (elementPosition) {
              sortedItems[i].position = elementPosition[direction];
            }

            isStarted = true;
            prevElement = sortedItems[i];
          }
        }
      }
      // base align
      else {
        for (var i = 0; i < itemsCount; i++) {
          if (items[i] !== keyObject) {
            var elementPosition = getElementPosition(
              areaElement,
              items[i],
              parsedProps.margin,
              parsedProps.boundsType,
              parsedProps.keyObjectBoundsType,
              parsedProps.isEdgePosition
            );
      
            if (elementPosition) {
              items[i].position = elementPosition[props.method];
            }
          }
        }
      }

    }
  }
  
  body();
}

helpersFunctions();

function runScript(scriptOptions) {
  var code = helpersFunctions.toString() + scriptBody.toString() + '\n' + 'helpersFunctions();' + '\n' + 'scriptBody(' + (scriptOptions || {}).stringify() + ');';
  code.btSend();
}

var scriptName = 'AlignEx';
var copyright = ' \u00A9 www.ladygin.pro';
var settingFile = {
  name: scriptName + '__setting.json',
  folder: Folder.myDocuments + '/LA_AI_Scripts/'
};
var uiSettings = {
  unit: 'px',
  activeDocument: activeDocument,
  theme: getUITheme(),
  boundsTypeList: [
    'Geometric Bounds',
    'Visible Bounds'
  ],
  window: {
    isActive: false,
    location: [0, 0]
  },
  panel: {
    withTitle: [10, 20, 10, 10],
    withoutTitle: [10, 10, 10, 10],
  },
  margin: {
    size: [0, 0, 100, 25],
  },
  button: {
    width: 36,
    height: 36,
    spacing: 8,
  },
};
uiSettings.themeInvert = uiSettings.theme === 'dark' ? 'light' : 'dark';

var win = new Window('palette', scriptName + copyright, undefined, { borderless: false, closeButton: true });
win.margins = [10, 10, 10, 10];
win.alignChildren = 'fill';

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
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00E5\u00D0\u00E1\r@0\x10\x05\u00E0\u00AB\u00F8\u00AF\x1B0\u0082\x11\u00D8\u00CC\x06b\x03\u009B\x18\u0081\r\x18\u0081\t\u00EA5\u00AEI#hI\x7F\u00E9K^N\u00D0/\u00CD\x11\u00C5\x1D\u00A5T\u0089\u00B6hA!\x02\u00A8WG\u00E6 \u00A8F\x18\u00FB\x01\u00CA\u00BB\x1EQ\x19\x04\u00B5\u00BE\u00E5\u00E4\u009B'\x14\u00CF\x03\u00BF\u00AF\u00EC3\u00C9\x13(\u0084X0jT\u00CF\x02\x1D,t\u00E5)\u00BDA\x07\u00BA}\x02\u00EFP4\u00BB\x02_\u00E5\u00B4S\u0093\u00C6\u00FE'u\x00-FE\u00C7\u00BEL'\u00BE\u00A5I\u00EE\r2V\u00D2\u008B\u00B8\u00C0\u009Ao#o\u00AA\u00F7\u00D8Q\u00DC\u00D9\x01\u008Fa\u00C3X\u008FE\x1D\b\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00FIDATx\x01\u00ED\u00D2\u00B1\n\x00 \b\x04\u00D03\u00FA\u00FF_.\x1D\x04\x17\u0089\u00E8\u0086@\u00DFRQ\u00DCp\t\u0090\u0089o\u0096\u00C2\x03Q\u00B6\x0E\u0094#\u00F1\u0090\u00F5\u00E8\u00FD\u009C\u00EE\r\u00BD\u00C3\x0E\u00AC\x108o\x1E\u00C7y\u00CB\u00F4\u00A7|\x18H\u00B7\x01R\u00AD\f%\u00B7\rJ5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00FIDATx\x01\u00ED\u00D2I\n\x00 \f\x03\u00C0(\u00FE\u00FF\u00CBnx\x12m\u00C0\u00E5P\u00DA9\u0089J)$\u0080\tyh\u00E7\u00C4>J\u00EF\u00A1\u009A\u00EF\"\x1E\u00F3\u0081\u00F7\u00C4\u0094W)2\x7F6d}\u00DB\u00F1\x1E*\x19\u00D8S>\u00E9\u009B^\x05\x07|\x10'\u00A9l\u009B\u00EC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00CIDATx\x01\u00ED\u00931\n\x00 \f\x03\u00A3\u00F8\u00FF/k\x07\x11\x07\u0085\u0088\x1DJ\u00C9m\u0085\u0090\u00A1I\x00g\u00CA~t\u00E3(2@R\u00E1\u008C\f\u00FFi/b\u00A6\x05\nE\u0086)Y\r\u00BF\u00AD\u00806\u009Ak\u0089\u00FF\u00C3\x01\u00A8E\f!\u00ED\u00B8\x005\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00DIDATx\x01\u00ED\u00D2K\n\x00 \b\x04\u00D0)\u00BA\u00FF\u0095\u00FB@\u00CB4\u00A8A\x14|\u00DB\u00C8\x0F\x0E\x10B\u00DF@\u00D0\u00A4\x06\u00DA\u00A72Io\x15dY\u00F0\u00DF\u00F1\u00CA\u00DA\x15ol&|\r\u00F9\u00DA,c\u00E3\u00B0 =\u0087\u00FE\r\u00E5k\x10'\u0094\u00FA\u00BC7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00ED\u0094A\n\x00 \b\x04\u00D7\u00FE\u00FF\u00E7\u00EA\u00D0\u00A1\u00A8h\x0FB\u00A2\u00CEQeQ\x18\x04\b\u00EA\u0080\u0099-PF=Pn\u008D\u00D7\u0089\u00D29\u00D5\u00ED\u009F\x1C0\u0090\u00E2\u00AB\u00D8\u008BK\u00EC\x16[\u00C8\u00E4djc0\u0090\u00C2\u00D7\u0083m\u00A8\u0084 \t4\x1E0\u009D\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00E5\u0092\u00C1\n\x00 \bC5\u00FA\u00FF_./\u0081\u0087\u00C4\u008C\x1DD\u00DF\u00C9\u0081\f\u0087#j\x07G\u0096\u0097p5\x11\u00CE<\b\f\u00DCpj\u00F1\x12\u00C9#\x7Fd\u00B6b\u00FE\u0082\u00BFP\x0B\u00EF)\x05{\x18\u00E9\u009BE\u00FE\u00C8\r\u00D9^\u009F\x14\x1E\u00E0\u00E4\u0082h\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00DDR\u00DB\r\u0080 \fl\u008D\x03\u00B0\u0082\u0093\u00E9F\u00C4Q\u009C\b6p\x04\x04S\u0093\u008A$\u0096\u0087&zI?\u00FA\u00BAp=\x00\u009E\u0082sN\u00F90\x14\u008A\u00D5C.\u0081\u0089\t5kjV\x17\u0083\u0093M\u0089\u00FEXCh\x12\u00FD\u00B5DrO\u009C\u008B\x0F\u00EB\u00E3\u0090:S\x0E\u00888@\u00851\u00E7\u00A7\x17\u00A0\u0083\u00C6\u00B8%\u00CC\u00BD!F\u00CB\u00BB\\\x7F7\u008Ck\x12\u0084\u00BD\u00F7%\x03\u00B9]4\u00F7M\u0097\u009B\x13\u00FE\u00FF\u00DBX\u00B8\u00DAoA\x06\u00E9\\\x1E6\u00C6fzH\x03\r+\u00A1\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00mIDATx\x01\u00ED\u0091\u00C1\r\u0080 \fE\u008B\x138\u00A2#\u00B8\u0089nX6p\u0084o\u009B`\u00AC\\\f\u00A5\x07\x0E\u00BC\u0084\x0B\u00BF<\u00D2\u0096h\x14\x00\x1CrX\u00CEF\x11\u0088h\u00C7\u008B\u00CAW\x1B2\u00FAau-4\n\u00A5\u00CD\u0087\u00F3\u00D3\u00B2S\u00A83\u00BC\u00C2\u0096\u00F2\u00F7\x1B\u00D7\u00C3\u00F5f\u00A9\x04\u00B0\u0085I0\u008F\u009A\u00B2\u00F0-O\u00E1\x14v\b\u00B3\u00B9\u00CBU\u008D7\u008B\u00E1\x06}\x17\u00C1u\u00A9I^1\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008AIDATx\x01\u00ED\u0094m\n\u0080 \f\u0086Wt\u0080\u008E\u00D0\u00D1\u00BCAt\x13oh7\u00E8\bk\x13\x07b\x06\u00D3\u0094\u00FA\u00D1\x03~\u00BDn/*C\u0080\u009E \u00A2\u00E3\u0096\u00D14\u00F8\u00BC!IF/\x12\u00A9\u00A6\u0081\u00F3Fh\u008C\u00C6p\x07\x1D\u00D78y\fx\u00C0+Wnk\u00F8\u0097MY\u00DC'\u00CBf\u00E2\u008E\x0E\u00B5\u00D2\u00B0\u0088(kz\u00E3\rj \u0083\u00E3\u00AE\fJ\u00CBF\fM&\u00C0\u0084=5\u00E9)m\u00B4g#\u00BD\u00DAp\u00C6\u00F0\u00C1\u00F2<\u00D2\u009D\u00D2\u00CFA\x0FN\u00EA\u0086\u0084\x18\u009D\x13\u00E6w\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00mIDATx\x01\u00ED\u0091\u00C1\r\u00800\bE\u00A9\x13\u00B8\u00A1\u008E\u00E0&vC\u00BA\u0081#|1!\x11\u00BD\u00E9\u00A7\u00B7\u00BE\u0084K\x7F\u00FB\x1A@\u00A4'\x00\x16\u00AB\u00C3j\x13\x06\x13\u00CCV;n\u00AA0\u0098@\u00C1\u00A3\u0097k\u0092\x1Ex\u00CB5\u00FC\u00C6\u00CD0\u0088Wo\u009F\u009Ba:x.E\u0099\u00ACx\u0080x\u00B1\x18\u00E1\u00D1\u00A7,}\u00CBC8\u0084\u0084\u00B0\u0085\u00B3\u00F6\u00BA\u00F37\u00CB\u00E1\x04w_\u00C1v\u00BB\u00FA\u00DC4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00E1IDATx\x01\u00A5S[\x11\u00C3 \x10\u0084\x18(u\u0080\u0084H\u0088\u0084H\u0088\u00848h\x1C\u00A4\x12\u00E2 q\u0080\u0084\u00C6A\u00EB\u0080T\x01=f\u0096\u00CE\u0085\u00F2\u00F8\u00E8\u00CD\u00EC0p{\u00CB=@\u0088?M\u00D6\b\u00CE\u00B9\u0096\u0096\u009E\u00B0{H)_\u00B5\u0080\u0081\u00A0\u00D8~rg\u00BB\u00E5\x02{\u00C2\x13\u00A4)\u0095\ta\u0081\u00FF\u00F1\u00BD\x04\x0E\x13\u00DDby\x16\u0091\u00D0\b\u00CE\x1C\x0EV\x04\u008C\u00C8\u00C0\u00820\u008A|\u0099wpt8P(\u00C1[\u0087\u008CLA@\u00FD\u0094\x1A\u009A\u00C5\x1AiE\u00C1\u00D0\u0087\u00ADI9iT\x0B\u00E1*\u00CAv\x10.Mt r\u00CDK\u0098&\u00BC\u00B9\u00C0\u008Eu\u00A8E\u00A2y\x1E[\u00EC0\u0098\u0084\u00AA\b\u00AC\u00E0\u00E9\u00D8\u00D1\u00B1\u0087\u00A23\u00C1sq\u00CC\u0098\u0080\u00C3\r3D{\u00F6N\u00CE\u00E3\u00CB\u00D5\u00C8\u009E-7\u00E3\x059WV\u0084|/Zl\u00FDO<b\u00CE\x07{\x19@\x15\x02(Z\u00EC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
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
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B4IDATx\x01\u00E5\u0092A\n\u00C20\x10E'%\x15\u00D2E\x05]\u00E8\u00D6\u00B5'P\u00F0\u00FAz\x07\x17\x1E\u00A2\x0B\u00BBPH\x7F\u00C9\x04J\u00DA&\u0093l\u00FB\u00E11m /\u0093!D\u00DB\u008E\u00B5\u00B6\x05W`\u00A80U\u00F0\x7Fa\u00EE\u00A5\u00D2P\u00F8\x06_`J\u00A5*\\`\u00C9\r4\u00A0\x07O\u00A5TO\u00C2T\u00B3\x13\u00DC\u00E6W\u00AAS\u009E\u00F5\x03\u00E8\u00A80Cz\x02{\u00B0K\n\u0085R?\x06#\x12\n\u00A4?\u00AE\u00E9+\x0B\u00A5^Xg\t\u00D7\u00A4\x13Q\u00BEpEz^\x12\u00EA\u0098d|\x1A(\x07\u00F0'w\u00C5\u00B1v\u00E4\u00DE\u00A8O#\x16\"G\u00D0RF\x14\u00C5;\u00D4\u00DCA\u00CD\u00E8\u00C9\u00B7\u00E7\u0083qt\u00B4\u00DD\f\x07\x18T\u00B47\u00D4\u00B7\u00FD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00IIDATx\x01\u00ED\u0092\u00B1\n\x00 \bD\u00EF\u00A2\u00CF\u00EBs\u00FB?\u00A3Ap\u0091\u0088\x1C\x02}\u008B\u008Ar\u00C3y@0\u00D4FD\x06\x1E 9wmH\x07\u00ED\u00E0\u00F9\u00A8\u00FE\u009C\u00F6\u009Bp\x0FK0\u0083`\u00BF9\u00B6y\u00F3\u00A8\u00A7|(\x18\u00CE\x02oQ\f\u00D8&}g`\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00JIDATx\x01\u00ED\u0092K\n\x00 \bD5:^\u00C7\u00ED~\u0086-\u00A3\x1C\u00E8\u00B3\u0090| \u0088\u00CA \u00CC\x10}\u0081\u0088\x14-\u00ED3:\u00B4\u00F6\u00CC\\\u00C7Y\u00A2\u00CB\u0084\u00E09\u00A6\u00CB3\x17\x11o>Dy[\x119t\"\u00D8]\u00DE\u00C9\u009B_\x1A7+\x10'\u00BF\u0082Q\"\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00GIDATx\x01\u00ED\u00941\n\x00 \f\x03S\u00F1y>\u00D7\u00FF\u00D5E\u00C4A!b\x07\u0091\u00DCV\b\x19\u00DA&@06\x0F\u00EE^\u0096\"\u00B3\n\u0092\u0084`dxO>\x113_\u00A0\u00A3\u00C8\u00F0KF\x1F\u00EER@\x1B\u00F5\u00B4\u00BC\u00BF\u00C3\x06Y\u00F5\f!\u00F25[e\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00ED\u0092Q\n\x00 \bCgt\u00BC\u008E\u00DB\u00FD\f\u00FF\u00D3\u00A0$\x14|\u00E0\u00978\u0095\rH\x013\x0F)8\u00D0\u00B5\x05\u00D6\x10\x11M\u00AD\u00D7\u00E0L\t\u00BE\u00B3u\u00D9r\u00F1\u00C4\u009F\x0BoC.\u009FUl\x02\n\u00BA\u00E70>\x0B\u00B6\x02\x10'\u00DF\u0097\u00C6>\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00KIDATx\x01\u00ED\u0094Q\n\x00 \bC\u00B7\u00CE\u00D7q\u00BB\u009F\u00D1_D\u00D1\u0088 \u00A9\x1E\u00F8\u00A32\x1C\f\x01\x013\u008B\u00A5\u0094\u00DD\u0080\u00CDl\x17\u00E4h0\u00B3H2\u00F5\u00FA\u00FE-?((q4\u00D8l/\u00C1\x02u&\x7Fl\x1C\nJ\u00DC\u00F5`3\x0F\x12\x1B\u00D7\u00EAjv#\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00LIDATx\x01\u00E5\u0092\u00C1\n\x00 \bC]\u00F4y}n\u00FFg\u00A7\u00C0Cb\u0086\x07\u00C9wr \u00C3\u00E1\u0088\u00CA\x01\u00CF23\u008F\u00A3\t0\u00F7\u00DC(\u0098p\u00C3.\u00C5M$\u008B\u00FC\u0091\u00A1\u00C5|%\u00FEB)\u00AC\u00A7|\u00D8CO\u00DF4\u00F2G.\u00C8\x02\u00F7\u00CE\x14\x1E\u00F4\n\u009E\u0091\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AAIDATx\x01\u00ED\u0092A\n\u0083@\fE\u0093a6\u00BDC\u00BBh\x17-\u00D4Ct\u00D1s+x\b\u00D7\u00DEB7\u00C2\x18\u0087(A\x14\x13\x1Dp\u00E3\x03\u0089\u00F9\u0093\u00F9\u00C4\x18\u0080\u00C4\u00E0\u00F8\x12B\u00F0\x14~\u009C\u0096\u0088\u00D8\u00B1\u00FE\u00A7pSx\u00B5t'wB\u00F8\u00F0\u00C5\u00E1y\x0B]c6\u00D59\u00EE\u00E2N\u00E1)\x0E_\u00A4=`\x07Nt7\u00E7\u00CB\u00B1\x01\x1D\u00B1.\u00CE\u0090\u00BA\u00C9X\u00C8\u00F8\u00B0\x1Er\u009AI\rF|tE\u00AC\u0084\u00F1\u0094\u00EF\u00C1Ab\u00FCV\u00C1\u0091\u00B5Y\u00C3\u00BE6)\u00D1\x18\u009A\u00D6fs\u00864\u0097\x02\f\u009C\u00F2\u00C9&\u00AE\u00B5\u0089\u00BF\u00BEY\u00D04h\u00EBl\u00F4\x1Fm/\u00D0\x01\x1D\u00DC\u0093\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008EIDATx\x01\u00ED\u0092=\n\u00800\f\u0085Sq\u00F1\x06\u00AE\u00AE\u00BAx\x07\u00CF\u00ED5\x04'\x07=C\x1D\x14\u00EAS[)\u00A5K\u009B\u00BA\u00F5\u0083G\u00C9\x0F\u008F\u0090\u0094(1\u0082\"QJuxjh\x16Bl&_P<\x12\u00AA\u00A0\x1E\u00E6-T~\x13\"\x18t\u0091\u00C3\u008EIG3\u00A1\">\u008F\x07w\u0087\u008D\x0E\x17zwy\u0096\x14\u00CF\u00BD\u00C3\x03\u009A`\u00B4\u00D2_\u00F8\u008E\u00F2,\u00D74\u0084\u00D6\u00CCQ\u00EC\x0B\u00BB\u00D7\x0E\u00AAq\u00FE\u00A1\u0097l\u0098\r\x19\u0086\u00D2\u00CAI\u00A7'\u00B6\u0096\u0086\x0Bph2\x1D\u00FA\u00CF\u00D0\u00EE\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009DIDATx\x01\u00ED\u0092A\n\u0080 \x10E\u00C7(\u00A8k\x04m\u00BAF\u00E7\u00AE[\x14\u00D4\u00C6Mg\u00B0\u00A5M\u00A6!\"\u00E9\u0084\u00D1\u00A6\x072\u00F8\x1D\u0087\x19\u00FD\x00\u0089a\u00F6FJ\u00D9)\u0091\u00B1\u00DE\u00D1\u00AAp)\u00D8\u008E{\u00B9#\u00FA.\u00C6\x14\u00BB\u00F22HLLA\x01q\u00A8\u00BC<\u0094\u0085\u00EF2\x00\u0081OF&\x11\x1C\u0099j\u009B\u0098\x0E\x7F\u00DB\u00DC\u00F3\u00CE/\u00E3O\u00D6\x18J#\u009A=v7\x01\x113r\u0083\u00AB\u00B0\u00F4\x16\u00CE7\u0099\u009E\u00DAf\u00F4$,:\u00D2m\u0083\u0095W\f\u00DC:\u00E4Z#\u00939\x1D\t\u00BDfK'\u00D9&9;C\u00C1,\u00D6e\u0082\u00ED\u00EE\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008BIDATx\x01\u00ED\u00911\x0E\u0080 \fE?D\x07\u00BD\u0083\u0083\u008B\x1E\u00C4\u00C1S{\fg\u00CF\u00E0\u0082\u0083\x03\x16\x02\u0091\x10\x17\nn\u00BC\u00A4i\u00B4\u00F0\u0080\x16\u00F8\x13\u00AD\u00F5@\u00B1R\u008C`\u00D28\u0091\u00C93\u0085\x17\u00F5`\"\u009Cp\u00A1\u00D4!\u008FK\b\u00B1I\u00F7\u00A1\u0091\u008Fu\u00F8\x1B\u00B6\u0094&\u00BCO\u00DE\u00E9\u00B4\x03\fl\x0Fi\u00F3m$$>\u009D\u0098\u00DD\u00C3\u00E2|\r\u00C56\u00D7/H\u00AD\u00F9\u00A1\u0084\x13\u008E\u00A7\u009DT\u0093(L\x15Va\u0086P\x05\u00FFT\u00B4\u0086[+\u00C3\x03?\u00D13\u00DA\u00CB\u00C3\u00FB<\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\x13IDATx\x01\u00A5S=\x13\u00C1@\x10\u00BD\u00BB\u0089\u0082\u0082BA!\u0085\x14\x1A\n\u00AD\x1F\u00AF\u00D6h)RPP\u00A4I\x11\x05\x053\u00F1\x1E/\u00E6D\x12f\u00EC\u00CC\u009B\u00CD\u00DD~\u00BD\u00DD\u00DB\x18\u00F3\u00A7\u00D8o\x0Ey\u009Ew\u00A1\u0086@\x06\u009C\u00AC\u00B5\x17\u00DF\x1ET\x04\u008C\u00A0\x128\u00DEt\u00C5\u00E0\u0089g\u008Fa\u008B?\x18\u00C00\u0080\u009A\x01m\u00E0\u00CD\u00C9c2\x06B\u00B1Y\u00B1\u0088\u0095a\n\u00F4=\u00FF+\u00B0\u00F4X\u00F8\u0089\u00C6\u00F2\u00DF\u00C1\u00BEu\u00A2\u00C7$\x1B\u00E0\u00A2\u00E0\u0096*}\b\u0082\u00F6PD\u0084dm\u0087\u008B5\u00AB)\u0098\u00F4yN\u00D5{\u009D\x14\u00ED\u0085NYob\u00C1o\x06\x1F\u008As\r\x0B\u00B2<\u00D1'\u00A8q8B\x1DM\u00B3<Zu\u00DE\u00C5c`\u00E8+0\u00BFI\u0087I\u00FC\x04\u0099t\u00F8-\u0092\u00C33\u00CFy%\u00AF\x04\u00EA\u009D\u0088~`\u00C1g<\u00D3\u00DF\u0095\f\u00B12/T\u00A5\u00AA:\u0083\u00F9B{\u00AE\u00B5\u00ADp\u00E0*\u00CF\u00CD\u00F3Y\x13\u0081\u008C\u00D8sdJ\u009Bj\x1Bz\u00E4\u0082\u0095\u00E7\u0091*8-.\x1A\u00FFF\u00CD\u00A2\u00A7cV\u00B5\u00DAw\x0Ebhp\x14\u008FX\u00C5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
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
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00E5\u0093\u00C1\r\u0084 \x10E\u00FFn\u00F6\u00BEt\u00E0\u0094`\t\u00D8\u0099\x1D\x18;\u00B0\x13K\u00D0\x0E\u00B4\x04\u00AD@\u00870DMT\u00C4p\u00D2\u009F\u00BC\u00900\u00F0B\x06\x00^\u009F\u0094)\x18B\u00A4T\u00CC\u00C4t\u00B1\u00A4$\u00B2gHM\u00AF\x1BF!\u0092\u00D4\u00D5\x12\x04\u0084N\u00A4\u00B5\u00CC\u00EB\u00F5\u0086\u00AFG\u00D83\u0099\u008C$\x12\u0092\u00DA \u00A3\n\x11\u009EI\u00C7\u00BB\u00C2#\u00E9\x7FO\x18\x1A\u00C2\u00D2SG\u00BE^\u00F0\u00F3\b\u00CC\u00D3\u00D0\u00B0\u00FDr\u00B4\u00D8^N\x12\"\u00D4\u00B0\u00FF\u00FBr>\u009E\u00BA\u0092\u00D3\u00A8\x03L\x1FK\u00D8S\u00BF53\u00BB\u009E.\u0081e\u00E1{\u0088\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00>IDATx\x01\u00ED\u00911\n\x00 \f\x03\x13\u00F1\u00FF_\u00AE\u00E0$.A\u00CCPhoji\u00B8\u00A1\x01\u00CC\u00F0\u0098\x03\x7Fl\u00D7@9x\u00ED!r\u00EA\u00EE\u00FFa\x0B+\b'\u00DE\u00A0\nt)\t\u0085v\x16\u009A0\x03\"\u00BA=\u0090\f\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00@IDATx\x01\u00ED\u00D2\u00B1\n\x00 \bE\u00D1k\u00F4\u00FF\u00BF\\KSP&\u00D5 z\u00C0ED\x04\x1FD\u00D1FQ\x0F\x06wdn\x14\x1E\u00CB\u0085\u00F7\u00B4/\x0BF\u00DF.\u00D4\u00F2\u00B6\u00929\u00F4\u0094Cs\u00DE\u00FC\u00EAZ\u00CB\x04'!\u00C9\u00B7Y\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00>IDATx\x01\u00ED\u00D4A\n\x00 \bD\u00D1_t\u00FF+\x1B\u00B4\u008A *t\x112o'\u00C8,T\u0084`e\u00A9\u00ED\u00B2o\u00AB\x12L\u0081~\u008D7\u00C7+\u00D0R\x14\u0098\u00D2\u00FC\u00E7\f\u009F\u0091\u00F5\u00FF\f;@\u00B5\x03!Gf\u00E5\u0090\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00?IDATx\x01\u00ED\u00D21\n\x000\b\x03\u00C0\u00A4\u00F4\u00FF_n\u0097\u00AE\u00E9\u00A0\"\n\x1E8\t*\x18\u00A0\u008B\u00F3\u00CAmC/\u00F8\u00A1j,\x04\u009B\u0081~\u00EA\u00CB\u0084Q\u00DA\u0085\u00D6\u0090sbSp`x\x0E\u00EB\u00BB\u00D2C\x04'QnFB\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u00941\n\x000\b\x03c\u00FF\u00FF\u00E7v\u00E9(5PAQ\x0F\u009C\u00C4C!\bp\u00EC[&\x0B\u00CE\u00B8\x0B\u00E5\u00D1\u00B3NTg\u00F3\u009F\u00DCP\u00C8\x12\x17lQ6\u00F9\u00F2Ll\x12\nY\n=\u00D8\x03\u00F0>\b\x1BkpQ\u0098\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00DIDATx\x01\u00E5\u00D3\u00B1\n\x00 \b\x04\u00D0+\u00FA\u00FF_6\u00DA\u00A2\u0086C8A\u00F4m.\u00E2\u00A1\x02\u00ED\f\u00F8\x18\u00EB3!&o\u00B8\u009E\u009AFb\u00F2G>Q\fB!\x13\u00DE\u00D8R\n\u00DE\u00A1\u00F7\x15?\u00F9#7\u00B4\x01\u00DBZ\x05\x1E\u00B2\u00CE\u00CD\u00AD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0082IDATx\x01\u00DD\u0092\u00DB\r\u0080 \fE\u008Bq\x00Vp2\u00DD\u00888\u008A\x13\u00D1\r\x1C\x01!A\u00D3@?Z\u00C1\x18=\u00C9\u00FD\u00A0\u00AFp)\x00\x0Fb\u00A3|\u0096%\u00F1t\x0E\x02\u00F9r\u00A0#IG\u00E2A\u00A1\u008B\u0085I\u00CE-\x039[;\u00DC\u00B0<\u00E6\u00A6-\n\u0089\u00D55\u009F\x13\x134P]]\u00CB\x00\u009D\u0091\fT\u00BD\u00A1)\u009AO\u00BB\u0086\u0089I0\u00AFXF\u0090\u00C1\u00D6}s\u00CB\u00DD\x07\u00FE\u00FC\u00DB \u00D4\u00EBG\u0090!\u00AD\u00D3q\x00\u0091\u0093aDo\u00B4n\u00EE\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00kIDATx\x01\u00ED\u0091\u00D1\t\u00C0 \fD\u00CFN\u00D0\x11;B7i7\u008C\x1Bt\x04\u009B\u0080B\u00C8\u0087`\u00CC\u0087\x1F\x1E\x1C\u0088/\x1C\u00C6\x03\x16\u00D2\u00C3&\u00F6\u0085 \u00DD\u00ECR-\u00E1\u00A7\u0086\u00A4\u00A0\u00D7\u0092\u0081\x03\x0BI\u00D6l\u00AF{aV\u00F6H\u00FE\u00F0C`)]\u00E9Rh\u0086\u00A5\n\u008A\x19L\u00EA<\u00C4\u00C2[\u00DE\u0081;p\"0\u00AB\u00BBlf\u00BC,F?*t.\u00FFP\x02\u0097\u00FA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x7FIDATx\x01\u00ED\u0094\u00DD\t\u00800\f\u0084\u00AF\u00E2\x00\x1D\u00C1\u00D1\u00BA\u0081\u00B8I7\u00D4\r\x1C\u00A1\u008A\u00A4\x18K\u00854D\u00F4\u00C1\x0FB\u00E9\u00E5\x07R\u008E\x02\x0F3S\u0094Z\x12\u00C4\u00D1\u00E7\u008A\u00E6D\u00A7\u00ABh\x12\\\x07c$\x03\x17\u00C8\u00A8\u00D6\u00E5\u00F7P\u00F3\u00CA\u00CA\u00E6\x03\x7F\u00DB\u00B4\u00D5}\u00CF6=\u009D\u00E3\x1E\x03\u00D3\u00F3}\u0082\u0092\x1576@\u00A3m2\u00A1R\x10(\u0097\x1A\u00E2Bd\u0089\u00C8t\u00F5@\u008F\u00F3\u0083\u00F5LW\u00ADl\u00C6\x06\u00D8e_ \u00CE\u00F7g\u00CC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00pIDATx\x01\u00ED\u0091\u00C1\r\u0080 \fE?\u00BA\u0080\x1B\u00EA\bn\"#yt\x0BX\u00C3\x13\u0096\u00C8\u00A1\u00E9M\u00FA\u00BD\u00F1\u0093\u0097\x00\u00BF\u00F9@\x0B\u00905\u009B\u00FD*\u009C\u00C2-\\ph\x11\x0E\u00A14\"\u009CJ*\u00AC\u0097\u009A\u0081\t?\u00A9~9\u00AA\u00DBv\u0090\u00B4\u00E1}\u00BA\u00BB\u0087t\u00E9\u00A1$\u008F\x17\u009AQLaP\u00EBO\x1E}\u00CA#p\x04:\x02\u00B3:\u00CB\u00A6\u00A6\u00D7\u00E3\u00E8\x01\u00C0\"0%\u00F9\u0083\u0098*\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00DFIDATx\x01\u00A5S\u00DB\x11\u0082@\f\u008CX\u0080\u00D8\u00C1\u0095@\t\u0094`\t\u00F7\u00E9'\x1DH\x07X\x02\x1D@\x07\u0094\u00A0\x1DP\x02\u00FA\u00E7\u009F&\u00BA'\u00C7\u00E9=f\u00D8\u0099\x1D\u0098d\x13\u00F6r\u0081h%\u00B6\t\u009A\u0082yd\u00E6\u00CC\x07\u00F3\x16+\u00D0\x10\x1B\u00D4\u00CC\u00A7\u00C5\u0093\u00AF\u00F0\u00C0\x1C!\u00AA=NZ\u00E4/\u00F6G$18_\u0099h\u00E9\u00C2F\x05Mc\x02\x1D\n*8\u0098 \u00A8\u00C8\u008F34\u00CA\x04r\x1CA\u0082%\x1C\r\u0081\x069\u00FD9j\u008D\u00A0@\u00C3I\b2\u0087>\u00F3$[\u00E6\u009E\u00C2\u0090\u00EB\u00DCeN\u00C0\u00D8K\u0081b\u00DE\u00ED\x06W<u\u00BC\u00F6],\u00EC\u00DD\u0084\fnLp\u00D1A\u00A7\u00DCDI\u00F3\u00A2(OqC\u0091k\u00D6\x10\u008C\x10\u0097\u00F4\u00B9b\u00B3'\u00BEM]@\u00D1\u00BC\u00B66\x074\u00FCb\x13i$\u00B3(\u00F0.C\u00FE\u00F9\x13_\u00B8\u00AE>\u008E\u00B5q\x00\u00F2\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
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
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00C2IDATx\x01\u00E5\u0093\u00CB\n\u00C20\x10EG\u0093\n\u0095\u00A2\u00A0\x0Bu\u00E5V\u00F0\x0F\u00FC\x7F\u00F0/\\\u008A\x1B\u00A1ta\x17-\u00E2\u008D\u0099@H\u00D3\u00E6\u00B1\u00ED\u0085\u00C3\u00A4\u00D3r\b\u0099\u0086h\u00F6\u00D9\u0080+()3\u00C2y\u00BE\u008038\u0081\x17\u00E8)1\u00AE\u00B0\x01G\u00B0\u00CE\u0095\u00BA\u00C2\u009E%\u00D9R\u00E1\u00E9\u00C5J\u00D5Y\u00AB#z\u0082\u00AFi.\u00C9\u009F\x16\u00DC\u00C1\u0087\u00F4\u0080n4\x1C\u00D4\x01l\u00C1\u00CAn\u008E\tc\u00A4-\u00D72V\x18\u0092v\\e\u008ApJj\u0084\u0085\u00FD\u00B1\u00A0\u00B8\u00F8\x06\u00A5\u0084\x15x\u0083:U\u00E8\u0093V\u00DC\u00AFY\u00FA\u008F\fH\u00D4\u00AF\u00B1cY\u00C7\u00B5a\u00A1\u0089\u00BD\x0E\n\u00F7\u00A4\u00EFwt\x16\u0081\u00F7\u0092wP0\u00D2Z\x1B\x1E\u00A4w=\u00D7\u00FC\x00\u0095\u00D3.l\u00D5\u00E9E\u00F8\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u0091A\n\x00 \b\x04\u00D7\u00E8y=w\x1F\x18\u00DD\"\u0088\u008A\u00F6 \u00E8\x1CDQ\u00E6\u00B0\x02bl\u00EA\x1B\u00FE\u00E0(\x05\u00E1\u00B0e\u00DE\u00E5\u00C8\u00CB\u00BD>\u00C3\x14F\x10V\u00BC\u00C1\u00D3A>\u00C5\u00A1PN\x07\u00B6\u00D4\x03\u00D5k\u00EB\u00D8\u00F0\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u00D21\n\x00 \b\u0085\u00E1\u009F\u00E8x\x1D\u00D7\x03\u00B64\x05eR\r\u00A2\x1F\u00B8\u0088\u0088\u00E0\u0083(\u00DA(\u00EA\u00C1\u00E0\u008E\u00CC\u008D\u00C2c\u00B9\u00F0\u009E\u00F6e\u00C1\u00E8\u00DB\u0085Z\u00DEV2\u0087\u009Erh\u00CE\u009B_\x1D\u008Az\x04'\u00A8\u00DBn\x02\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00AIDATx\x01\u00ED\u00D4\u00BB\t\x00 \fE\u00D1\u00AB8^\u00C6u@\u00C1J\x04QI\n\u0091w\u00BA@H\u0091\x1F\x04KSl\u008B\u00BC\u00CA\u00A1L0\x15\u00F4+\u00DC\u00D9n\u0081\u0086\u00A2\u0082_\x1A\u00FF\u00A1\u00E1\u00D3\u00AF\u00E5\u00FD\x1E6\u00F2V\x03!\u00F9\x1A\u00B8\u00E3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00AIDATx\x01\u00ED\u00D21\n\x000\b\x03\u00C0P\u00FA\u00BC>7\x0F\u00EC\u00D25\x1DTD\u00C1\x03'A\x05\x03tq^\u00B9m\u00E8\x05?T\u008D\u0085`3\u00D0O}\u00990J\u00BB\u00D0\x1ArNl\n\x0E\f\u00CFa}\x17\u00A2\u00DA\x04'\u00DAn\x0F\u008F\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00GIDATx\x01\u00ED\u0094Q\n\x00 \bCg\u00E7\u00EB\u00B8\x1D\u00B0\u009F\u00E8Kr\u0084\u0090\u00A4\x0F\u00FCQ\x18\x0E\u00C6\x00\u008E\u00BE\u00C6\u00A4\u00C1\x19wA9\u00DC,\u008BC[\u00C6\u00B7\u009CP\u0090\u00E5]\u00B0E\u00F9\u00E4\u0086\u009D\u00C9\u008AM@A\u0096\u008F\nv\x02V\u00CC\x03\u00E9\f\x0E\u00E2\u00D7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00IIDATx\x01\u00E5\u00D2A\n\x00 \b\x04\u00C0-z\u009E\u00CF\u00ED\u0081\u00D1!\u0088@,\u00D8@tN\u00E5A\\\x14H\u00A7\u00E0\u008D(\u00F5\u00BE\x1E\x15d\u00F4\u0086\u00ED\u00F8\u009B\u0091,\u00FE#\u00CF-\x0B\u0088\u00BEL\u00B8\u00B3\u0096\x12\u00F0\x0E\u00AF\u00EFM\u00E3?rB\x03t\u0098\x05\x1E\u0089\n~G\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00ED\u00921\n\u00800\fEc\u00E9\u00E2\x1Dt\u00D0AA\x0F\u00E1\u00E0\u00B9\x15<\u0084\u00B3\u00B7\u00D0\u00C5\u00C1(\u00A9\x04QLJ\u00C1\u00C5\x07\u009F&i\x1A\u00DA4\x00\u0081\u0089\u0098mQ\r\u00D9\x03j%\u00BBE\u00C5\u00F0\u00CE\u0082\u00EA\f\x0B\u0094tpW\u00C1\u00E2\u0092bg\u009E+\u0098\u00A02\u00B6\u0099\u00A3R\u00F0\u00C0\u00B0\u00DB]\u00A9h\u009DA\u00C6\u0091\u00E7zXS\u00A0&\x7F\"\x7F\x02%\u0096\u00D6\u0091\x15\u00E6\u00BE\x1A\x03\u0081\u00B1\u0082\x1C\u00EF\u00B1y\u00C2kl\u0082!)\u00A8\x1A\x1BI\x0F{P\u00F0\u00C9\u0093U\u00FCcs|\u00FD|\x13\u0093 \u00CD\u00D3\u00B1\x01\x10\u0093\x17\u00D0\x1C\u00BE6l\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0088IDATx\x01\u00ED\u00919\n\u00800\x14D\u00C7\u00A5\x11<\u0080\u00D8Y\x0B^\u00C2s{\r\u00C1\u00CA\u00C2\x03\b\x16\u00B1P\u00D4Q#\x04\u00B1\u00C9b\u0097\x07\x0F\u0092\u00FC0\u00C5\x1F\u00C01\x11\u00CC)iE\x17:\u00B9\bLiN3\x1A\u00D3\u0091n\u0081\x1C\u00D64\u0081\x1D3mBy\u00D9a\u00CF\u0095\x11\u00C0\u009Cs\u0087\u0085<\u00F7\u00B4\u00A3k\fs\x04\u00EEBZ:\u00E0/\u00BEJ\u00B9\u0096\u00AB\u00FC\u00D1\u009A=\u00A5\u00A8\r\u00BF\u00DB\u00D6\u009A\u0085p\u008C\x0F\u00F4\u0081\x16\u0081By\x13\u00AF?\u00A637\x1C\r\u0098\x1B;[\u00A9\u00DD[\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0097IDATx\x01\u00ED\u0092\u00BD\x0E@@\x10\u0084\u00C7_\u00A1Tj%\x1A\u00AF\u00E1\u00B9y\x0B\x12\x1A\u008DNO\u00A3pXr\u00B9\b\u00BBr\u0089\u00C6\u0097L6;\u00F6.\u00B72\u0080e\x1C\u00A3\u00CF\u00A9\x16\u0086\x17\u00E2\u0099i=\u00E7\x1B\u00E6\u00D5A\u00CEe\u00E7\u009C\x0B\u00CBp.\x1C\u00C1c\u009B\u00F3\x19\u0083%\x04|\u00B2\u00B2\b\u00CE\u00CA\u00A2\u00D8p^\u00F8\u00C7\u00E6\x1E\u00EB+{T\x13\u00A5X)\u00A2~\u00A6~\u0080\u0090c\u00E5T)\u00D0\u00FC\f\u00FB?\u00A9\u00F126\u00D5\u00C5@K\u00F5Ulz\u00A5N\u00FB\u00D8\u0091'\u00C65^4\u0092\x1A\u00CD\x17\u00C5\u00C6:\x0BN\x1C\x1B\u00EE\u00F6\u00B4\x0BV\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008BIDATx\x01\u00ED\u0091;\x0E\u0080 \x10D\u00C7_\u00A1\u00857\u00B0\u00B0\u00D13X{n\u008Fa\u00ED\x01l\u00AC0\u00B1PG\x03\u0091\x10\x1B\u0081\u00C4\u0086\u0097\u00BC\u0090e\u00C9\x06\x18\u00C03\u0089QW\u00B4\u00A3;]`A\u00AA\u00AD-\u00ADe]\u00C0\u0092H\u00AE=\u00CD\u00E1\u00C6J\u0087X\x16\x07\u00DC\u00B9g\u00A8\x1Bf\u00B4\u00C1\u00F3\u00E4\u0091N\u00B0@\u0085r\u00850SAK\u00BA\u00C9\u00FA\x7F\u00DEB\u00B9?W;\u00F3\u00A9\u00A7B\u00D1\x136\u00D3\u00FE\u00D4\u008B\u00E1\u009900\ft\x18(\u00B4=a\u009C\u00B1\u00ED\u00F9\u00E1\x04/<\x19\u0088\u00B1W\u0095\u00A3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\nIDATx\x01\u00A5\u0093_\u00AB\x01Q\x14\u00C5\u00F7\u009D?\u00B7\u00E8^\u00F2 \x0FH$/R\u00F2\u00E4\u00FB?\u00FA\x04\u00F2&\u00D2h\u009A\x1A\x1EH&Y;k\u00B4\u00E3L\u00A6\u00EC\u00FA\u0085c\u00EDu\u00D6f\u008F\u00C8\u0097\u00E5\u0097\u00D0\u00D4@\x0F\x04\u00E0\x06\u00B2O\x06\x1Dp\u00A2X\u00D8<\x02m0\u00E0Y\u00E22h\u00819\u00E8\u00B291\u00E2\x15\u0088\u0080G\x13\u00D5\u00EET\u00E73\u00E2\f\fAhb\u00AFM\n\u00AD\x0B\u00D8\u0083+/Q\u00B3X\r&\u00A0\x01\u0096\u00E0\u009F\u00E2\u0090\r\u00A9\u00BCW\u00CA\u00EF5\u00C9\u00C6g\x14\u00BD\u00ED\u0097\u00F3.@\x15\u00FC\u0081\u00AD\u00B8+e\u00E2\u00CC\u00E3A\u00C6\u00D8\u00F9\u00CC\x1B\u00F3\u00D9U:\u00C6Q5A\u0081`+\u00C5\u00B7[\u0093\u00D03\x07\u00F9\u00FF\x1BH\u00B9\u00D21\u00AF\u00D6\u00E0\u00C0\u00D7n\u0089\u00E6\n\u0089\u00ACAB\x06%R\u008C\u00E5\u00B1l\u00C9\u00EB&\u009EA\x1F4A,/kk\u009A5\u00A5.W\u00FC\u00E3\x10\u00E8*Oi\x16\x11MTe\u00BA\n\u009B\x15q\x19\bE#y\u00FF=\u00F2\u00B5~>\x0BE\x06y\u00E9\u00CDu\u00BE?\u00B8F\u00BA\x03\u00B5|<\u00E3\u00E4\u00A5\u00CE\u00D5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
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
// icon end

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
function scriptUISetFont (element, userProps) {
  /*
  * @element: ScriptUI Element
  * @userProps: {
  *   @fontSIze: number,
  *   @fontFamily?: string,
  *   @fontStyle: 'regular' | 'bold' | 'italic',
  * }
  * */
  
  try {
    var props = {
      size: null,
      family: '',
      style: 'regular',
      color: null
    }.extend(userProps || {});
    
    if (element && element.graphics && element.graphics.font) {
      var elementFont = element.graphics.font.size;
      var elementFontFamily = element.graphics.font.family;
      
      if (!((props.style === 'regular') || (props.style === 'bold') || (props.style === 'italic'))) {
        props.style = 'regular';
      }
      props.style = props.style.toUpperCase();
      
      if (props.color instanceof Array && props.color.length === 3) {
        for (var i = 0; i < 3; i++) {
          if (!parseInt(props.color[i])) {
            props.color = null;
            break;
          }
        }
      }
      
      if (props.color !== null) {
        element.graphics.foregroundColor = element.graphics.newPen(element.graphics.BrushType.SOLID_COLOR, getColorForBrush(color), 1);
      }
      
      var newFont = ScriptUI.newFont(
        props.family || elementFontFamily,
        ScriptUI.FontStyle[props.style],
        typeof props.size === 'number' ? parseInt(props.size) : (parseInt(elementFont) || 11)
      );
      // var newFont = ScriptUI.newFont(
      //   elementFontFamily,
      //   ScriptUI.FontStyle.BOLD,
      //   4
      // );
      
      element.graphics.font = newFont;
    }
  } catch (err) {
    alert('scriptUISetFont:\n' + err + '\n' + err.line);
  }
}
function onClickButtonAlign (button, event, options) {
  /*
    * scriptOptions: {
    *   method: '',
    *   shiftKey: boolean,
    *   isEdgePosition: boolean,
    *   margin: string,
    *   boundsType: 'geometric' | 'visible',
    *   keyObject: number | 'selection' | void,
    *   keyObjectBoundsType: 'geometric' | 'visible'
    * }
   */

  try {
    var scriptOptions = {
      method: options.method,
      shiftKey: event.shiftKey,
      boundsType: boundsTypeDropdownList.selection.text.split(' ').shift().toLowerCase(),
      isEdgePosition: isEdgePositionCheckbox.value,
      keyObjectBoundsType: keyObjectBoundsTypeDropdownList.selection.text.split(' ').shift().toLowerCase(),
      margin: $.removeSpaces(marginTop.text) + ' ' + $.removeSpaces(marginRight.text) + ' ' + $.removeSpaces(marginBottom.text) + ' ' + $.removeSpaces(marginLeft.text)
    };
  
    if (alignByKeyObjectDropdownListCheckbox.value && (keyObjectDropdownList && keyObjectDropdownList.items && keyObjectDropdownList.items.length && keyObjectDropdownList.selection)) {
      scriptOptions.keyObject = keyObjectDropdownList.selection.index;
    }
    
    if (alignToSelectionCheckbox.value) {
      scriptOptions.keyObject = 'selection';
    }
  
    runScript(scriptOptions);
  } catch (err) {
    alert('onClickButtonAlign:\n' + err + '\n' + err.line);
  }
}

var panelsGroup = win.add('group');
panelsGroup.orientation = 'row';
panelsGroup.alignChildren = 'fill';

var panelsChildLeftGroup = panelsGroup.add('group');
panelsChildLeftGroup.orientation = 'column';

var panelsChildRightGroup = panelsGroup.add('group');
panelsChildRightGroup.orientation = 'column';
panelsChildRightGroup.alignChildren = 'fill';

var panelBaseAlign = panelsChildLeftGroup.add('panel');
panelBaseAlign.spacing = uiSettings.button.spacing;
panelBaseAlign.orientation = 'column';
panelBaseAlign.alignChildren = 'left';

  var panelBaseAlignFirstGroup = panelBaseAlign.add('group');
  panelBaseAlignFirstGroup.orientation = 'row';
  panelBaseAlignFirstGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelBaseAlignFirstGroup, { method: 'top_left', helpTip: 'Align Top Left', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignFirstGroup, { method: 'top_center', helpTip: 'Align Top Center', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignFirstGroup, { method: 'top_right', helpTip: 'Align Top Right', onClick: onClickButtonAlign });
  
  var panelBaseAlignSecondGroup = panelBaseAlign.add('group');
  panelBaseAlignSecondGroup.orientation = 'row';
  panelBaseAlignSecondGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelBaseAlignSecondGroup, { method: 'middle_left', helpTip: 'Align Middle Left', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignSecondGroup, { method: 'center', helpTip: 'Align Center', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignSecondGroup, { method: 'middle_right', helpTip: 'Align Middle Right', onClick: onClickButtonAlign });
  
  var panelBaseAlignThirdGroup = panelBaseAlign.add('group');
  panelBaseAlignThirdGroup.orientation = 'row';
  panelBaseAlignThirdGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelBaseAlignThirdGroup, { method: 'bottom_left', helpTip: 'Align Bottom Left', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignThirdGroup, { method: 'bottom_center', helpTip: 'Align Bottom Center', onClick: onClickButtonAlign });
  createIconButton(panelBaseAlignThirdGroup, { method: 'bottom_right', helpTip: 'Align Bottom Right', onClick: onClickButtonAlign });


var panelExtraAlign = panelsChildLeftGroup.add('panel');
panelExtraAlign.orientation = 'column';
panelExtraAlign.alignChildren = 'left';

  var panelExtraAlignFirstGroup = panelExtraAlign.add('group');
  panelBaseAlignThirdGroup.orientation = 'row';
  panelExtraAlignFirstGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelExtraAlignFirstGroup, { method: 'left', helpTip: 'Align Left', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignFirstGroup, { method: 'horizontal_center', helpTip: 'Align Horizontal Center', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignFirstGroup, { method: 'right', helpTip: 'Align Right', onClick: onClickButtonAlign });
  
  var panelExtraAlignSecondGroup = panelExtraAlign.add('group');
  panelExtraAlignSecondGroup.orientation = 'row';
  panelExtraAlignSecondGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelExtraAlignSecondGroup, { method: 'top', helpTip: 'Align Top', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignSecondGroup, { method: 'vertical_center', helpTip: 'Align Vertical Center', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignSecondGroup, { method: 'bottom', helpTip: 'Align Bottom', onClick: onClickButtonAlign });
  
  var panelExtraAlignThirdGroup = panelExtraAlign.add('group');
  panelExtraAlignThirdGroup.orientation = 'row';
  panelExtraAlignThirdGroup.spacing = uiSettings.button.spacing;
  
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_top', helpTip: 'Distribute To Top', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_bottom', helpTip: 'Distribute To Bottom', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_right', helpTip: 'Distribute To Right', onClick: onClickButtonAlign });
  
  var panelExtraAlignFourGroup = panelExtraAlign.add('group');
  panelExtraAlignFourGroup.orientation = 'row';
  panelExtraAlignFourGroup.spacing = uiSettings.button.spacing;

  createIconButton(panelExtraAlignFourGroup, { method: 'distribute_left', helpTip: 'Distribute To Left', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignFourGroup, { method: 'ghost', helpTip: '', enabled: false, onClick: function () { alert('focus'); } });
  createIconButton(panelExtraAlignFourGroup, { method: 'ghost', helpTip: '', enabled: false });
  
var messageGroup = panelsChildLeftGroup.add('group');
messageGroup.orientation = 'column';
messageGroup.margins = [0, 0, 0, 0];
messageGroup.spacing = 5;
messageGroup.alignChildren = ['fill', 'fill'];

  var messageRightClick = messageGroup.add('statictext', [0, 0, 150, 45], 'Right mouse click by button -> reverse "Align by outer bounds"', { multiline: true });

var panelMargin = panelsChildRightGroup.add('panel', undefined, 'Margin:');
  panelMargin.margins = uiSettings.panel.withTitle;
  panelMargin.orientation = 'column';
  panelMargin.alignChildren = ['fill', 'fill'];
  panelMargin.spacing = 5;

  var marginTopGroup = panelMargin.add('group');
  marginTopGroup.orientation = 'row';
  marginTopGroup.alignChildren = ['fill', 'fill'];

  var marginTopLabel = marginTopGroup.add('statictext', undefined, 'T:');
  marginTopLabel.alignment = 'left';
  var marginTop = marginTopGroup.add('edittext', undefined, '0 ' + uiSettings.unit);
  marginTop.unit = uiSettings.unit;
  marginTop.addEventListener('keydown', function (event) {
    editTextToNumberKeyEvent(this, event, null, null, null, uiSettings.unit);
  });
  marginTop.addEventListener('change', function (event) {
    editTextToNumberFormatOnChange(this, uiSettings.unit);
  });

  var marginRightGroup = panelMargin.add('group');
    marginRightGroup.orientation = 'row';
    marginRightGroup.alignChildren = ['fill', 'fill'];

  var marginRightLabel = marginRightGroup.add('statictext', undefined, 'R:');
  marginRightLabel.alignment = 'left';
  var marginRight = marginRightGroup.add('edittext', undefined, '0 ' + uiSettings.unit);
  marginRight.unit = uiSettings.unit;
  marginRight.addEventListener('keydown', function (event) {
    editTextToNumberKeyEvent(this, event, null, null, null, uiSettings.unit);
  });
  marginRight.addEventListener('change', function (event) {
    editTextToNumberFormatOnChange(this, uiSettings.unit);
  });
  
  var marginBottomGroup = panelMargin.add('group');
  marginBottomGroup.orientation = 'row';
  marginBottomGroup.alignChildren = ['fill', 'fill'];

  var marginBottomLabel = marginBottomGroup.add('statictext', undefined, 'B:');
  marginBottomLabel.alignment = 'left';
  var marginBottom = marginBottomGroup.add('edittext', undefined, '0 ' + uiSettings.unit);
  marginBottom.unit = uiSettings.unit;
  marginBottom.addEventListener('keydown', function (event) {
    editTextToNumberKeyEvent(this, event, null, null, null, uiSettings.unit);
  });
  marginBottom.addEventListener('change', function (event) {
    editTextToNumberFormatOnChange(this, uiSettings.unit);
  });
  
  var marginLeftGroup = panelMargin.add('group');
  marginLeftGroup.orientation = 'row';
  marginLeftGroup.alignChildren = ['fill', 'fill'];

  var marginLeftLabel = marginLeftGroup.add('statictext', undefined, 'L:');
  marginLeftLabel.alignment = 'left';
  var marginLeft = marginLeftGroup.add('edittext', undefined, '0 ' + uiSettings.unit);
  marginLeft.unit = uiSettings.unit;
  marginLeft.addEventListener('keydown', function (event) {
    editTextToNumberKeyEvent(this, event, null, null, null, uiSettings.unit);
  });
  marginLeft.addEventListener('change', function (event) {
    editTextToNumberFormatOnChange(this, uiSettings.unit);
  });
  
  editTextBrothersValuesHandler([
    marginTop,
    marginRight,
    marginBottom,
    marginLeft
  ]);


function getSelectionItemsNames() {
  var elements = activeDocument.selection;
  var elementsCount = elements.length;
  var names = [];

  for (var i = 0; i < elementsCount; i++) {
    names.push((i + 1) + ': ' + (elements[i].name || elements[i].typename));
  }

  return names;
}

function changeDropDownElementList(items, dropDownElement) {
  try {
    var length = items.length;
    var newSelectedItem = 0;
    var selectedItem = {
      index: -1,
      text: ''
    };
    
    if (dropDownElement && dropDownElement.items && dropDownElement.items.length) {
      selectedItem = {
        index: dropDownElement.selection.index,
        text: dropDownElement.selection.text
      }
    }

    if (dropDownElement && dropDownElement.removeAll instanceof Function) {
      dropDownElement.removeAll();
    }

    for (var i = 0; i < length; i++) {
      if ((i === selectedItem.index) && (items[i] === selectedItem.text)) {
        newSelectedItem = i;
      }

      dropDownElement.add('item', items[i]);
    }

    dropDownElement.selection = newSelectedItem;
  } catch (err) {
    alert('changeDropDownElementList: \n' + err + '\n' + err.line);
  }
}

function changeKeyObjectDropdownListGroupItems() {
  var scriptMessage = getSelectionItemsNames.toString() + '\ngetSelectionItemsNames();';
  
  scriptMessage.btSend(function (result) {
    changeDropDownElementList(result.body.split(','), keyObjectDropdownList);
  });
}

var panelKeyObjectDropdownList = panelsChildRightGroup.add('panel', undefined, 'Key Object:');
  panelKeyObjectDropdownList.margins = uiSettings.panel.withTitle;
  panelKeyObjectDropdownList.spacing = 5;
  panelKeyObjectDropdownList.orientation = 'column';
  panelKeyObjectDropdownList.alignChildren = 'fill';
  
  var alignByKeyObjectDropdownListCheckbox = panelKeyObjectDropdownList.add('checkbox', undefined, 'Align by key object');
  alignByKeyObjectDropdownListCheckbox.onClick = function (event) {
    onChangeKeyObjectCheckbox(this.value);
  }
  
  var keyObjectDropdownListGroup = panelKeyObjectDropdownList.add('group');
  keyObjectDropdownListGroup.orientation = 'column';
  keyObjectDropdownListGroup.alignChildren = ['fill', 'fill'];
  keyObjectDropdownListGroup.spacing = 5;

  var keyObjectDropdownList = keyObjectDropdownListGroup.add('dropdownlist', [0, 0, 100, 25], getSelectionItemsNames());
  keyObjectDropdownList.selection = 0;

  keyObjectDropdownListGroup.add('statictext', undefined, 'Key object bounds:');
  var keyObjectBoundsTypeDropdownList = keyObjectDropdownListGroup.add('dropdownlist', undefined, uiSettings.boundsTypeList);
  keyObjectBoundsTypeDropdownList.selection = 0;

var alignOuterPanel = panelsChildRightGroup.add('panel');
  alignOuterPanel.alignChildren = 'fill';
  alignOuterPanel.margins = uiSettings.panel.withoutTitle;
  alignOuterPanel.spacing = 5;

  var alignToSelectionCheckbox = alignOuterPanel.add('checkbox', undefined, 'Align to selection');
  alignToSelectionCheckbox.value = false;
  alignToSelectionCheckbox.onClick = function () {
    onChangeAlignToSelectionCheckbox(this.value);
  };

  var isEdgePositionCheckbox = alignOuterPanel.add('checkbox', undefined, 'Align by outer bounds');
  isEdgePositionCheckbox.value = false;

  // var isEdgePositionLabel = alignOuterPanel.add('statictext', [0, 0, 100, 44], 'click with shiftKey by button = align by outer bounds', { multiline: true });
  // isEdgePositionLabel.justify = 'left';

  var boundsTypeDropdownListGroup = alignOuterPanel.add('group');
  boundsTypeDropdownListGroup.orientation = 'column';
  boundsTypeDropdownListGroup.alignChildren = ['fill', 'fill'];
  boundsTypeDropdownListGroup.spacing = 5;

  boundsTypeDropdownListGroup.add('statictext', undefined, 'Align by bounds:');
  var boundsTypeDropdownList = boundsTypeDropdownListGroup.add('dropdownlist', undefined, uiSettings.boundsTypeList);
  boundsTypeDropdownList.selection = 0;

function onChangeAlignToSelectionCheckbox (value) {
  alignByKeyObjectDropdownListCheckbox.enabled = !value;
}
function onChangeKeyObjectCheckbox (value) {
  keyObjectDropdownListGroup.enabled = value;
  alignToSelectionCheckbox.enabled = !value;
}
onChangeAlignToSelectionCheckbox(alignToSelectionCheckbox.value);
onChangeKeyObjectCheckbox(alignByKeyObjectDropdownListCheckbox.value);

function saveSettings() {
  var $file = new File(settingFile.folder + settingFile.name);
  var data = [
      marginTop.text,
      marginRight.text,
      marginBottom.text,
      marginLeft.text,
      isEdgePositionCheckbox.value,
      keyObjectBoundsTypeDropdownList.selection.index,
      boundsTypeDropdownList.selection.index,
      alignByKeyObjectDropdownListCheckbox.value,
      alignToSelectionCheckbox.value
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
      marginTop.text = isNaN(parseInt(generalSettings[0])) ? '0 ' + uiSettings.unit : generalSettings[0];
      marginRight.text = isNaN(parseInt(generalSettings[1])) ? '0 ' + uiSettings.unit : generalSettings[1];
      marginBottom.text = isNaN(parseInt(generalSettings[2])) ? '0 ' + uiSettings.unit : generalSettings[2];
      marginLeft.text = isNaN(parseInt(generalSettings[3])) ? '0 ' + uiSettings.unit : generalSettings[3];
      isEdgePositionCheckbox.value = (generalSettings[4] === 'true');
      keyObjectBoundsTypeDropdownList.selection = parseInt(generalSettings[5]) || 0;;
      boundsTypeDropdownList.selection = parseInt(generalSettings[6]) || 0;
      alignByKeyObjectDropdownListCheckbox.value = (generalSettings[7] === 'true');
      alignToSelectionCheckbox.value = (generalSettings[8] === 'true');
      onChangeAlignToSelectionCheckbox(alignToSelectionCheckbox.value);
      onChangeKeyObjectCheckbox(alignByKeyObjectDropdownListCheckbox.value);

      var locationValues = fileData[1].split(',');
      uiSettings.window.location = locationValues;
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
  // keyObjectDropdownListGroup change items
  changeKeyObjectDropdownListGroupItems();
}

checkSettingFolder();
loadSettings();

win.center();
win.show();
// win.active = true;