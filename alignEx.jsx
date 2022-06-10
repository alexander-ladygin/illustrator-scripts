/*

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+ (presumably in Adobe Illustrator CS6 - did not test)
  Name: alignEx.jsx;

  Copyright (c) 2020
  www.ladyginpro.ru

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
    
    if (element.typename === 'Artboard') {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }
    } else {
      var geometric = getAreaBoundsObject(element.geometricBounds);
      var visible = getAreaBoundsObject(element.visibleBounds);
  
      return {
        top: visible.top - geometric.top,
        right: visible.right - geometric.right,
        bottom: visible.bottom - geometric.bottom,
        left: visible.left - geometric.left,
      }
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
      var activeArtboard = activeDocument.artboards[activeDocument.artboards.getActiveArtboardIndex()];
      var activeArtboardBounds = getElementBounds(activeArtboard);
      var areaElement = keyObject || activeArtboard;
      
      // distribute spacing
      if (props.method.match(/spacing/)) {
        var direction = props.method.replace('distribute_spacing_', '');
        var sortedItems = (((direction === 'left') || (direction === 'right')) ? sortByX(items, 'ASC') : sortByY(items, 'ASC'));
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
      // distribute align
      else if (props.method.match(/distribute/)) {
        try {
          var isToArtboard = (props.keyObject !== 'selection');
          var isHorizontal = props.method === 'distribute_x';
          var isHorizontalValue = isHorizontal ? 1 : -1;
          var direction = {
            start: isHorizontal ? (isToArtboard ? 'left' : 'right') : (isToArtboard ? 'top' : 'bottom'),
            end: isHorizontal ? (isToArtboard ? 'right' : 'left') : (isToArtboard ? 'bottom' : 'top'),
            size: isHorizontal ? 'width' : 'height'
          };
          var sortedItems = (isHorizontal ? sortByX(items, 'ASC') : sortByY(items, 'DESC'));
          var sortedItemsCount = sortedItems.length;
          var positionItems = [];
          var summItemsSize = {
            width: 0,
            height: 0
          };
          
          for (var i = 0; i < sortedItemsCount; i++) {
            var position = getElementBounds(
              sortedItems[i],
              parsedProps.boundsType
            );
  
            positionItems.push({
              position: position,
              between: getDifferenceBetweenVisibleAndGeometricBounds(sortedItems[i])
            });
            
            if (isToArtboard || (i > 0 && i < sortedItemsCount - 1)) {
              summItemsSize.width += position.width;
              summItemsSize.height += position.height;
            }
          }
  
          if (summItemsSize[direction.size] > 0) {
            var startPosition = (isToArtboard ? activeArtboardBounds[direction.start] : positionItems[0].position[direction.start]);
            var endPosition = (isToArtboard ? activeArtboardBounds[direction.end] : positionItems[positionItems.length - 1].position[direction.end]);
            var areaSize = endPosition - startPosition;
            areaSize = areaSize < 0 ? areaSize * -1 : areaSize;
            var gutter = (areaSize - summItemsSize[direction.size]) / (sortedItemsCount - ((isToArtboard && !parsedProps.isEdgePosition) ? -1 : 1));
            var positionCounter = isToArtboard ? 0 : 1;

            for (var j = 0; j < sortedItemsCount; j++) {
              if (isToArtboard || (j > 0 && j < sortedItemsCount - 1)) {
                var betweenValue = positionItems[j].between[direction.end];
                betweenValue *= betweenValue < 0 ? -1 : 1;

                var newPosition = startPosition + ((((parsedProps.isEdgePosition && isToArtboard && !j) ? 0 : gutter) * isHorizontalValue) + (betweenValue * isHorizontalValue));
  
                sortedItems[j].position = [
                  isHorizontal ? newPosition : sortedItems[j].position[0],
                  isHorizontal ? sortedItems[j].position[1] : newPosition
                ];
  
                startPosition = newPosition + (positionItems[j].position[direction.size] * isHorizontalValue) - (betweenValue * isHorizontalValue);
                positionCounter++;
              }
            }
          }
        } catch (err) {
          alert('body() >> match(/distribute/):\n' + err + '\n' + err.line);
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
var copyright = ' \u00A9 www.ladyginpro.ru';
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
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00A9IDATx\x01\u00E5\u0094\u00E1\r\u0084 \f\u0085\u00CB\u00E5\x06`\x04F\u00B8\x11\u00CE\u0089\x1C\u00C5\x11\\\u00C1\rt\x03G\u0090\x11p\x02|\u0098\u00C64DE\u0088\x7F\u008C/y1m\u00ECG\x0B\x04\u00A2\u00D7I\u00C9\u00C0{\u00FF\u00C3\u00A7\u0086\u009D\u00F0\x1C\u00C5V)\u00E5\u00AE\u00C0\x03\u00B0\u00F5i\u008Dg\u008Cob\u008D\u008E\u00BB\u00D2\u00C2C\x0E\u00D0Fq\u00D8\u0082\n#Z\u00BA\u00A8O\x14;\u00D1\u0099\u0085\r\u00DCcLC\u0085\u00C0Y\u0080\u00AB\x12\u00E8Q\u0087\u009A\u00C7,\u0082nB\u00C1\u009FO\u00B2\x179\x03O\u009C\u009F\u00B2\u00A0\\\u00BC\x16\u00EE\u00E4\u00F3\u00A1\u00F8Q\u0087{\x067\x07\u008B\u0095u\u009A\u0098\u00E0y\u00D0\u0096\u00EE\x10C\x1B~P\u00DE\u00AC\x056\u00FF\u00DE\u00F2\u00DE\u0093\x18N\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0098IDATx\x01\u00ED\u0092m\r\u00840\f\u0086\u00DF]\x10\u0080$$\u009C\u0093\u00C3\x01\u009C\u0083;\x05X\u00C0\x01\x12\u0090\u00C0\x1C \u00A1\x14R\u00A0\u00E1+c\x10\u00F8\u00C3\u00934\u00E9\u00BA\u00F6\u00D9\u00B2\f\u00B8\x1A\"\n9*\u0089\x10GaII#\x05\u008E\u00C0\u0082\x1F\u00CD\u00C9\u00E0\x03\x0F\u00A6\"\u00A8\u0095\u00AC\u00CF\u00D3=\u00AEV\x16+\u00C9[\u00E5\u0091\u00CAcW\u0099\x16|\u00A4\u00D6\u00B1pX\u00E4\"\u00AC\u00A49Q\u00B5A(\u00EB\u00A4\x7F\u0082\u00E9|\u00B0\u00E0\u00CC9\u00AC1\u00E6\u008F\x15x\u00EF+_\u00C8\u00C2\u0087\u00E9\r\u00B7x\u00E1d\x1E\u00E1#\u00F4 p\u00EC\u00B3\u00B8\u008B\x06\x19\x02\u00CB\u00FAp\x1E\u008C\u00E2\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00E5\u0093\u00E1\t\u00840\f\u0085\u00D3\u00E3\u00FE_Gp\x0478n\u0083\u00DB\u00E8F\u0090\u009B\u00C0\x15\u00DC@7\u00D0\rt\x047\u00A8\t>!H\u00B1\u00D5\u00F6\u009F\x0F\x1E\u00A1M\u00FA\x11\u00D2\u0096\u00E8v2GI\u00E7\u009C\u00E5 .\x10\u00C5/\u00B5'\u00FA\x1Bc\x06\u008A\x11\x03{\x17V\u00AD\u00CF<\x03\u00CC\x0E\u00DDL\u00EC\x19\u0096\u00F5W\u00D5\u00CCtU\u00DCM\u00C1\x1Ew\x1D\u00FEt\u00CD\u00E3\f\u008CCK\u00EB\u00EC&v\u00E3\u00EB0\n\u00E8\u0081}\x14\u00E8\x1C\u00D0\x07\u00E3[\u0095h}\u00C0 L\u00CDl\x04|\u00CB\u00B5\u00D8\x7F'\u00C3\u0090\u00DF\u009ET\u0099\fCM\x05\u00A8M\u0086E++\f\u00C0*\x1B\f\u00C0R\u00FEf\x16\u00D8}\u00B4\x00jU\u00EEq\u00BE\u0088\u00B1\u0090\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0082IDATx\x01\u00ED\u0092\u00C1\r\u0080 \x10\x047V`\x07\u0096\u00A2%\u00D0\u0089v\x00\x1D\u00D0\u0082\u009DP\u0082%P\u0082%\u009CKB\"\x1FM\x10\u00F0\u00C5$\u00FB\u00BC\u00C9-\x1C\u00D0i\u0086\u0088,\u00CC\u00C9l9s\u00C3\u0083,H\x1C32\x13\n73r\u00A3Q\x02\x05{\"[\u00F1\x15\x0E\u008F\u008C\u008B\u00A2\u00F0n3J\u00A0\u00C0K9>\u00B8\x06\u00B4 V>\u0092\u00CA\n5\u00A0\u00C8&\x15\u00B2\u00EE\u00EFM\u00AA\x13\u00A9A\r\u00C2v-6U\u00F1\u00F7-:\u00BFr\x01w\u00B3\u00CF\u00C4)\u00DDA;\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00^IDATx\x01\u00ED\u00D2K\n\u00C0 \f\x04\u00D0\u00A1\u00F4\u00DE\u00F6\x06\u00F6\u0086\u00F6&S\x05\x17\u008A\u008A\u00BF\u00E0B| \u00B8\bC\u008C\x01\u008E\x1C\u0092\u00C6\x1DH\u00A1\u00D7R{A\u00D8\u00FA@\u00FB\u00D2'\u00B8k\u00CC\u00B0\x01/S\u00AA'\u00C0\u00B0_\u00F4\u00FB\u00E23\u00ACu\u00AC2\x1DM\u00CFQ\x0F\u00CD\u00AF\x12\u00BA\u00D1b\u00DF\u008Du\x1F\u008E\u0092\x1FYA\u0094\x1Bg\u00AFO\u0092\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0086IDATx\x01\u00ED\u00D3\u00DD\rD@\x14\x05\u00E03\u009B-`K\u00DA\x12tB\x07t@\x07J\x11\x15(at@\x07\u00D7\u0099 .\u00F1\u00C2\f\u00F1\u00E0K\u00CE\u00D3LN\u00E6\x17x\u00DDJD\n\u00C62\x11B`Q\"\u008B\x04!\u00B0(U\u00A5\x19B\u00D8\u00AC4G\b\u00EE\x1C\u0099n*m\u0098\u009F\x1E\u00B4\u00E2\u00CF\u00BA\u00AE\x0F\u009E\u0082+\u00FA\u00AB-W\u00AB-\u009F(\u00D3\u0097R\u00C2\u0087{*\u00AA,\u0085\x0F\x19\x7F\u00CA,\u00DE\u009B\u00F3\u00C51-\u00D33\u00911\u00A6\u00C6\u00EB\x12\x03\u00BD\u0097\u00D2\u00AC\u00C8Lr\u00A5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00ACIDATx\x01\u00ED\u0091\u00D1\x11\u00820\f\u0086S\u00CFw;BGp\x04\u00DC\u00C0U\u009C\u00C0\x11<'p\x057p\x04\u00DC\u00C0\u008E \x13\u0084?G\u00B8+\u00A5\x0F4}\u00E5\u00BB\u00FB/\x14\u00C8Gh\u0089v\u00B6\u00C2\u00CC\x01y!gjEe?\u009ExP\x0B\u0099Lj +\u00D52\u00BC\u00E0\u0091\u00BE\u00F4\x1B\u00A6\u00C9d\u0083\u00B5\u00A1o\u0096ic\u00A7M\x1F\u00AB\u00EC\u0090\u00AD\u00BD\u00D6\u00FF,C\x11\u00B9\u00D4\u0088\\\u009Cs\u00D1$\u00B4\u00C8J\u00C2S\"\u00AE\u0096\u00AD\u00C0Tw^\u00B2\u00FD\x00\u0094c\u00B6\u00F6\u00D9\u00FA\u008B\u00C8G\u00BC>\x0B\u00C8\x1B\u00D3\u00DE\u00C8(\u00BC\x16z:\u00AA\u0098\u00F0\u0099\\G\u009AN;\u008D\u00DC\x1Bh'e\x04##\u00C7<\x1F\u00FE\u00B5\u00FF\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008EIDATx\x01\u00ED\u0094\u00D1\r\u0080 \fD/N\u00E0H\u008E\u00E0&\u00B2\x01n\u00E0\nn\u00E2\b\u008E\u00E0\b\u008CPKRb\u00C5\x0FP\u0089\u00FE\u00F0\u0092&M\u00E9\x1D$P\u0080? \u00A2\u00CD\x07JABNo\u0083\u00C2T\u00C3jX\u00C2\u0090\u00DF\u00AF\u00E1\u0098R\u00C2\u00DC>\u00DF\u00E8d0FU;M\u008A_\u0093Rz\x1C\u00B9\u00A9\u00A3\x03\x13\x1B\u00CA\u00C9\x02=r\u0088Dz\u0083^\u00E5\x03\u00EE\u00C0\x02+B\u00A7LBn\u00F1\x04\x16\u00CEt%}\x11\t\u00D3E\u0099\u00ADx\x0B\u009B\u00B4$\x1F\u00AC\u00CF\u00F15;\u00EC\u00D1\u00DA)\n4\x02\u00FD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009BIDATx\x01\u00E5\u0091\u00ED\r@0\x10\u0086\u00AF\u00E2?\x1B\u00E8\b6\x10\u0093\x19\x01\x13\x18\u00C5\bl\u00C0\b6\u00A8\u00B7q\u0092\u008B\u00A0%\u00FD\u00C5\u0093\u00BC\u00B9\u00A6\x1FO.W\u00A2\x7Fc\u008C\u00C9\u0091\x1A\u00D1\x14\x02\u0088:\u00B31\x05\u0091Z\t\u00CB> \u00C5^\u0083\fH\x1AD*\u00CE2\u00F2\u00E5N\u008Au\u00CF\u00FB\u0085|\x13\u00DD\t\u0095R3J\u0089\u00D8\u00AA\u0091^H\x17\u00AE\u00A9\u00B7\u00D0!}'\u00BC\u0092\n\u0091\u00DF\u00A7\u009Cq\u0098\u00E9N%\u00EF\u00C4\x0EA\u0083b\u0087\u00BE\u0088\u008C\u00DC\u00E5\u008E\u00F6\x16\u00B2,\u00A7\x07\u00B8\u0084%w\u0090\u00D06\u00AB\u00B3\u00B4\u00F4oV\u0088\u00E0\u00C3V\u00F0\u0088\u0092+\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00FIDATx\x01\u00ED\u00D2\u00B1\n\x00 \b\x04\u00D03\u00FA\u00FF_.\x1D\x04\x17\u0089\u00E8\u0086@\u00DFRQ\u00DCp\t\u0090\u0089o\u0096\u00C2\x03Q\u00B6\x0E\u0094#\u00F1\u0090\u00F5\u00E8\u00FD\u009C\u00EE\r\u00BD\u00C3\x0E\u00AC\x108o\x1E\u00C7y\u00CB\u00F4\u00A7|\x18H\u00B7\x01R\u00AD\f%\u00B7\rJ5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00FIDATx\x01\u00ED\u00D2I\n\x00 \f\x03\u00C0(\u00FE\u00FF\u00CBnx\x12m\u00C0\u00E5P\u00DA9\u0089J)$\u0080\tyh\u00E7\u00C4>J\u00EF\u00A1\u009A\u00EF\"\x1E\u00F3\u0081\u00F7\u00C4\u0094W)2\x7F6d}\u00DB\u00F1\x1E*\x19\u00D8S>\u00E9\u009B^\x05\x07|\x10'\u00A9l\u009B\u00EC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00CIDATx\x01\u00ED\u00931\n\x00 \f\x03\u00A3\u00F8\u00FF/k\x07\x11\x07\u0085\u0088\x1DJ\u00C9m\u0085\u0090\u00A1I\x00g\u00CA~t\u00E3(2@R\u00E1\u008C\f\u00FFi/b\u00A6\x05\nE\u0086)Y\r\u00BF\u00AD\u00806\u009Ak\u0089\u00FF\u00C3\x01\u00A8E\f!\u00ED\u00B8\x005\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00DIDATx\x01\u00ED\u00D2K\n\x00 \b\x04\u00D0)\u00BA\u00FF\u0095\u00FB@\u00CB4\u00A8A\x14|\u00DB\u00C8\x0F\x0E\x10B\u00DF@\u00D0\u00A4\x06\u00DA\u00A72Io\x15dY\u00F0\u00DF\u00F1\u00CA\u00DA\x15ol&|\r\u00F9\u00DA,c\u00E3\u00B0 =\u0087\u00FE\r\u00E5k\x10'\u0094\u00FA\u00BC7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00ED\u0094A\n\x00 \b\x04\u00D7\u00FE\u00FF\u00E7\u00EA\u00D0\u00A1\u00A8h\x0FB\u00A2\u00CEQeQ\x18\x04\b\u00EA\u0080\u0099-PF=Pn\u008D\u00D7\u0089\u00D29\u00D5\u00ED\u009F\x1C0\u0090\u00E2\u00AB\u00D8\u008BK\u00EC\x16[\u00C8\u00E4djc0\u0090\u00C2\u00D7\u0083m\u00A8\u0084 \t4\x1E0\u009D\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00E5\u0092\u00C1\n\x00 \bC5\u00FA\u00FF_./\u0081\u0087\u00C4\u008C\x1DD\u00DF\u00C9\u0081\f\u0087#j\x07G\u0096\u0097p5\x11\u00CE<\b\f\u00DCpj\u00F1\x12\u00C9#\x7Fd\u00B6b\u00FE\u0082\u00BFP\x0B\u00EF)\x05{\x18\u00E9\u009BE\u00FE\u00C8\r\u00D9^\u009F\x14\x1E\u00E0\u00E4\u0082h\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00DDR\u00DB\r\u0080 \fl\u008D\x03\u00B8\u0082\u0093\u00E9F2\u008A\x1B\u00C1\x06\u008E\u0080\u00C5\u00F4\u00A3\"\u0089\u00E5\u00A1\u0089^r\x1F}]h\x0F\u0080\u00A7\u00E0\u00BD\x1F\u0088\u00969\u0088|\u00885\u00B0\u00B1\u00A0\x11\u00C5E\u00E4\u00D5\u0090bs\u00A2>\u00D5\b\u00DAD}+Y\u00B9g\u00CD\u0095\u00E8\u0088\u0086c\u00C31 \u00E2\b\x15\u00C6\u009C\u009F^\u0080\x0E\x1A\u00E3V0\u00F7\u0086\x18\r\x1F\u00EB\u00D2\u00DD0\u00CEi\x10\u00E6\u00DE_\x19\u00D8\u00ED\u00A2\u00BEo\u00BA\u00DC\\\u00F0\u00FF\u00DF\u00C6\u00C1\u00D5~\x07:h\u00FB\u00F2\u00B0\x03\u00C7]zH\x05M\u00CA\x10\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00lIDATx\x01\u00ED\u0091\u00D1\r\u0080 \fD\u008B\x13\u00B8\u00A1+\u00B8\u0089nX6p\u0084\u00F3HHl\u0088\u0089\u00B1\u00F4\u0083\x0F^r?\\9\u00C2Ud\x14\x00\u009C\u0094R\u009BD\u00C0\u00A0\x1D\x0F\x07\u00B5ZS\u00D1\u008F\u0096\u00ACEF\u00A1v\u00F8\u00FEeg`\u00E9\u00F0\n[\u00CA\u00D7k\u00DA\u0096\u00EB\u00F5R5`\x07\x131\u0097~y\u00E1[\u009E\u00813\u00B0#0\u009B\u00B3\u00DC\u00CCx\u00BD\x18ny\x01\u00C1t\u00E4\u00CC\u00A7O\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008BIDATx\x01\u00ED\u0094\u00DB\r\u0080 \fE\u00ABq\x007p4\x1DA'aD\u00DC\u00C0\x11jKhB\x10\u0093\u0082\x10\u00FD\u00F0$\u00BC.\u00ED\r\u0090\x06\u0080\u0096 \u00A2\u00E5\u0096\u00D04\u00B8\u00BC.JF'\x12\u00B1\u00A6\u0081\u00F3z\u00A8\u008C\u00C6p\x07\x1D\u00D78y\fx\u00C0+W\u00AEk\u00F8\u0097M^\u00DC'\u00CBf\u00E0\u008E\x0E\u00B5\u00D20\u0089(kz\u00E3\rJ \u0083\u00E3\u00AE\fr\u00CBF\f\u0097D\u00C0\u00EC\u00F7\u00D4\u00C4\u00A74\u00C1\u009E\t\u00F4b\u00C3\x11\u00FD\x07\u00CB\u00F3@\u00B7J?\x0B-8\x01\u00E7\u00A4\u0084\x15b-X\x0B\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00lIDATx\x01\u00ED\u0091\u00C1\r\u0080 \fE\u008B\x138\"#\u00B8\tnX6p\u0084oM\u009AX\u00BD\u00E9/7^\u00D2\x0B\x1F\x1Ei+2\x12\x00\u00D5\u00EA\u00B0\u00DA\u0084\u00C1\x04\u00AB\u00D5\u008E\u009B&\f&P\u00F0\u00E8\u00E5Zd\x04\u00DEr\x0B\u00BFq3\f\u00E2\u00EA\u00EDs3L\x07\u00CF\u00A5(\u0093\x15\x0F\x10/\x16#<\u00FA\u0094\u00A5oy\n\u00A7\u0090\x10\u00F6p\u00D6_w\u00FEf9\u009CtU\u00C1u\u009E\x1F\x0E*\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_x: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00QIDATx\x01\u00E5\u0094\u00D1\n\x00\x10\fE/\u00F9\u00FF_\u00C6\u0083[Z\u009Ahj\u00D9yBR\u00F7\u00D8\x06\b\u00EA\x00\n\u00DA\u009D\fc\u00CC\x1F,\\\u00C8\b\u00DC\u00A7\x0E\x0E\u00F0\x1F\u00F9\u009D\u00C3\x1D\u00AB2\u0099\u00CF\u00E8:\u00A0\u00C3\u008F~y\u00EE\x18\u00AD\u008B\";\u00A4\u008F\u00DB)C\u00FCGn9\u00F0(\x1F)\u00DF\x18\u00AD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_y: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00CIDATx\x01\u00E5\u00921\x0E\x000\b\x02\u00B1\u00FF\u00FFs\u00EB\u00D8&\u00D5\u00C10\x10\u00BD\u00D5`\x14\x00\u00D4\u00B1l\u00B8\u009D\u00AF\u00C8\u00894\x0Bd\u00E8\x0B-z\u00AB\n\u00FF\u00C2l\u00D83\x14}\x1Es\u00AB\x15\u00BAC\u009A^lI\x0F\u00F59\u00BB\u00FF\x18\x0F\u0090\u00C1?\u009A\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00E4IDATx\x01\u00A5R[\x11\u00C20\x10L\u00AA 8\u0088\x03p\x00\x0E\u00A8\x03pP\x1C\x14\x07\u00C5\x018(\x0E\"\x01\u00AA\x00\x1C\u00A4\x0E\u00C2ef\u00C3\\C\x1E\x1F\u00EC\u00CCN&\u00B9\u00BD\u00CB\u00BD\u0084\u00F8\x13\u00B2&p\u00CEm\u00E8\u00D8\x13'\u00E2SJ\u00F9\u00AE9\x1C\u0089\u008A\u00DD{\u00B7\u00C49\u00E7\u00D8\x12_\x10\u00F5\u00A9L\u0088W\u00D8\x1F\u00DFO`0\u00D1/\u0096g\x11\x05:A3\u0084\u0087\x11\x0E\x1D2\u00B0\x10t\"_\u00E6\x00\u008D\x0E\x0F\n%xl\u0091\u0091)\x04P?\u00A5\u0086f\u00B1FZQ\x00\u00FA06)#\u008D\u00EAF\\\u00892f\u00A2j\u00A2\x07\u0091k^\x02\u00DA\u00FB\u00F0\x00\x13\u00CEC\u00CD\x13\u00CD\u00F3\u00BC\u00C7\x06\u0083I\u00A8J\u0080\x11:\x1D\x1BvlQt\u00C6\u00F9R\x1C3&\u00E0\u00F0\u00C3\u0080\u00A0-\u00DB\u0093\u00E5\u00F8r5\u00B2\u00B5\u00E50~O\u00B8VV\x02\u00F9^\u00ACq\u009Dh\u00B4s\u00AC\u00F9\x00b\x1F@\b\u008F.\u00ED\u00E1\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
    disabled: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BBIDATx\x01\u00E5\u0092=\n\u00C30\f\u0085\u00E5\u0090\x0E\u00C9\u00D0^\u00A0K\u0097\x0E\u00BDA\u00AF\u00DF%W\u00C9\u00D0\u00A9C\fI\u00C0}\n\x0E\b\u00E5\x07\u00CBd\u00CB\u0083\u0087,c\x7FHBD\u00A7\u0093\u0093I\b\u00E1\u0086\u00F0\u0080\u0087\u00E8\x11\u00EE\u00C5\u0099\u00A3w\u00CE\r[\u00C0R\u00E5\f\u00BB\u00D3\u00BE~\u00F0'\x15\u00A8\u00D5\u00C6\u00CA.\u00F1-\u00C7\u00EF\u00DE\x07\r\u00ECT\u00CE#h\u00D0bG\u0089*T>\u008A\u00CA\x18R\u00C1o\u00CC\u00B6\u00A6L`/\u00C0M\x0Et\u00AB\u00C2\x12m\u00FA\x1C\u00A8\x06\u00CE\u00EB\u00C0\u00C3\u00A7\x1C\u00A8\x06\u00FA\x18\u00AB\u00F9\u00C2\n]\u00AB\u0090\u00F7\u00AC\u0095\u0097\x16\u00A8#\u0083\x00\u0099`p\x1D\u00BBY\u00AC\u0094\t\u0098\x02-\u00C8\u00A8\u0095\u00F6\u009Ft\u0084\u00B8R\u00F8\x05_\u00E9\u00DC\u00FA\x03\u00B7\u009AV\u00C4\u00F1\u00A2\u00AE\u00DA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BFIDATx\x01\u00ED\u0092/\x0F\u00C20\x10\u00C5\u00AF\u00CB\x10\x18\u00CC\f\x061\u00C4\x04\x13\x18\x10\x18\u00BE;\x1A\u0083\u0099\u00A9\u00C1\u0082\u00C0\u00D6@R^\u0093\u00B7\u00A4\x19\x7F\u00AE,$3{\u00C9\u00E5\u00ED\u00EE^\x7F\u00D9\u00B2\u008A\u00FCYF\x0Bx\u00EF'\u00B0=\u00DB\u00831\u00E6\u00F1-\u009F\u0089\u00AE\x1Dj\u00CA\u00DAj\u00E1Ly\u00BB\x1A6\u008BF\x05f\u00EB^@\x1C\u00AC`%\u00EA\x1E\u008D\u00C3\u00E7.\u00B8K\x07\u00E2\u00C0\x12\u00D6\x1E:E\u00AB#\u00BDB\u00A6L\x02\"8\u0087\u00AD\u00D86\u00F8\t\u00D7v\u0087\u00E7[\u0098\u00B1\u00AD\u0091-T`\b\u00D2-\x00\u00E7\u00EE\u00923\u00CBv\u00D3\u00DD\u00E7\u00AF<\u00B9\u00A0\u00DC;X\x04\u00B5\u00BCNN\x05\"\u00DCH\u0082>\u00E5R\u00EE\u00E1O\x1A\u0081#\u00B0\u0087\u00F2\u00C4\u009C\u0093\u00A1\u00F4\x04\u00A2\u00B74\u00D0-\u00A9\u00F5\x17\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BAIDATx\x01\u00ED\u0092\u00BB\x0E\u00C20\fEm\u0094\"\u0085\x01Ff\u00FE\u0080\u0095\u00FF\x1FX\u0099;0\u00B3\u00B00\u0080D+\u0085k\u00E1\u00A0\u00A8\u00B4\u00A9S\u00D8\u00E0HW}\u00C49r\u00DC\x12\u00FD\x1C\u009C[\f!T\u00B8H<\u00E2\u00F4~\u00AE\u00F7\x0B-;2\u00F3%\u00EEq\u0094g\u0087,i\u009C\u0083Ux\u00D6\u009A\x1B\u00D2\"\u008Dv\u00B9Nj\u00EE\u00E9\x06\u00A6\x020\x029\u00A6t\u00ED\u0093\u00D75\u008E\\\u00C7\u0087\x19\x19\u00E9\u00C8\u00AE\u00C8I\u0097\u009A\u00B4\u00CE$\u00EC\u0091\u00ED\u00E99\u0082ra\u009F\fG\u0094\u0099V\u00C5\u00C2\u008CL\u0088\x1F\u00B45\tGd4\u00D4\u00A1\u009B(\x13\u00E4\u0097\n\u00BA\u00FE\u0082'\u00CA\x06\u00E1o\u00CA\u0084\u00EE\f7\u009F\u00C8\u00DE@\u0087+d\u008Bx\u00FAc\u00E5\x01s\u00AFSJ\u00A0\u00DE\u00A6\x02\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00ED\u0093!\x0F\u00830\x10\u0085\u00DF-\u009B\u0098\u0099AOl\x021\u00C4\u00CC\u00CC\u00F4\u00CC\u00FE\u00F4\u00FE\u00C1\u00C4\u00CC\f\x06\u008D@#\x10\u00E5\x01GBH\x11W\u00C0\u00F1\u0092\u0097\u00CB\x13\u00FDz\u00ED\u00B5\u00C0\u00A6\u00D5\u00E4\u009C\u008B\u00E87}\u00B1\u00AC\u00DBO\u00C0\u00AE,7\u008DG\x18$\x1EX\u00CC\x12kLE$E(\u0090\u00B0;\u00CBY\u00E3\u009F\u00B0\fF\u0089\u0082\x0E,\x0F:\u00A2+\u00FAKX\u0081\x00\u00F5\u00C0\x17\u008Cw\u00E5Q\u00C9&>;\r\x0E\u00F3\u00D52\u0086G~\u00D2'tG\u00FEq\u00B7\x1C\x01\x1A\x0F%a\u00E9\u00DF]\u00F8PF\u00D0\u00E5\u009E\u00CD\x00\u00DAt\u0099h4u\u00EA\u00FD)\r\u0080\u00D0\x12\u00DDo\u0099;\u00FDMF\u00D5\u0099\u00E2=\u00DF\u0083hF\u00A5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00ED\u00931\x0E\u0080 \f\x00\u008Bq\u00F1\x19..>\u00C3w\u00FB\f\x1D\x18\u00F4\x17:VHj\u0082\u008D\u00D0\x12\u0089\x13\u0097\u0090@S\x0Eh\x03@\u00E5\rD\u009C\u00FC\u00D0\u00E4\u00B6\u00A0\u00A3S\u00E6A\x03\u0085\u00F9_\u00E8j7\x04\u00F3Q\u00CA7\u0082\u00CC\x0Bz\x16\u00B6\u00C6\x18\u00AB\x12R'\u00D5\r Nw\u00C0|/\u00F8\u0093\x11\u00F2y\u00EC\u0091\u009E\u00EC\u00EB7\u00B0\u00F0\u00E6n\u00B4\u00C6\u00F6$\u009BB\u00B5\u00DA\u0083\u0090M\u00C9D!I\x17v\x00|\x12\u00E6R\\\u00A8\u00FD\u00CB\x07Tb\\\u008Bd$\bX\x11\u00F3\u009E\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B5IDATx\x01\u00ED\u0093\u00A1\x0E\u00C20\x10\u0086\u00AFd\x06\u008D\u00C1\u0082\u0098`\x06\u00B3'\u00E0\u00B9\u00D1\b0$\u00CC\u00CCL\u00A0\x10\x13\x18\x10\u0090\u0094\u00AF\u00EC\u008A \u0098rYf\u00F6'\x7F.\u0097^\u00BE\u00DC\u00B5=\u0091QV\u00B9\u0094b\u00EF}A\u0098\u00E3\u0093s\u00EE\u00F2\u00ABf\"i\u00BA\u00E1).\u0081/\u00C4\u00DAa\x10\u00A0\u009C\u0090kZ\u00D3im\x02*4tWh\u00DA\x00\u00ADL@\u0085\u0086\u00BB\\\u00E3\f_\u00F1\x0E\u00F0\u00D3\u00E9\u00E1F\u00BA\u00BB\u00B1\u00E8\x0Ep\x1B\x1F\u00C5\u008B]o\u0086e\u00E4\x19\u00A1\u0094n\u00E4\x16\u00EF?#\u00FF\x01[\x12V\u009A\u009E\x01\x1D\u00E3\u00D9\u00B0\u00DFF7%~\u00E8\nX\u00F3]\u0093I\u009A\u00C2\u00A6<\u00F0\x01X+\u00A3z\u00D1\x0B'\u00969\x0F\u00F4_\u00C2\u00F9\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00ED\u00931\x0B\u00C2@\f\u0085s\u00D2\x13tpp\u00D1\u00C1\u00DD\u00C1\u00C5\u00D5\u00C5\u00BF\u00EF/pvv\u00ED\u00D0B[\u00B8\u00BE@\u0086pMK/s\x1F<Bz\u00E4\u00BB\u0097\u00C2\x11mZ\u00AB\u0094\u00D2\x11~\u00C2'\u00FD}G\x0E1\f\u00E5\x05\u00DF\u00C4~\u00A0\u0082\x1D\u00E0\x06\u00FE\u00E9\u00F3@\x052`\u009F\x10BKs\t1\x10\u00E17\u00FC\u00F0\u00C0XU\u00D6\u00F3\x10\u00FF\u00E4\u00E4\u0081M\x12\u00AA\x0B\x06\x0F\u00CC\x02F\u00A9\u00BD\x07\u00B6\u0098\u00D0\x03\u00B3\u0080{\u0095\u00B4\x18\u00A6\x13\u00E5\u00FDEj\x11\u00CC\x02\u00C6\u00AC\u00AF\u00E1;\u00D6\u00AF\u00E4\u008C\x13\u00FFq\u00C1\u0097\u009C\u00C0\u00AB1s\u00A6\u0082\u0084\u00FA\x19\u00F1\u00BA\u00BDx\u0090\u00CA\u00ABw\u00B4Ik\x04!IW\x1Bwo\u00B1\u0094\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B5IDATx\x01\u00ED\u0094!\x0F\u00C20\x14\u0084\u00AF\x04\x04\x1A\x01v\x13\x13\u00ECg\u00F0\u00E3\x11`\x10 &0(\u00C4\x04\x06\x03I\u00B9\u00C2#i\u00B2\u00BE\u00ED\u0089e3\u00BB\u00E4\u00B2\u00E4\u00ED\u00EE[\u0097\u00AD\x05\u00C6\u0090\u00F7~\x17l\u00C9\u00CEa\u00D3\u00D2\u0098\u00C3\f=k\x02N\u00C0>\u0080\u00DC\x119]v\x15\u00B5\\j\u0085\x05\u009D1\\@\u0087\u0085{[zm\x01\x1E\u00FE`\x16\u00B3\x04,\u0097\u0087\x06\u009D;\u0081\u00CE\u00B9:\n\u0096\x04\u00AC\"\u00D8FV\u00F6\u00851{o\u00F4\u00A1H^+\u00F8E/d\u00FC\u00C6\u00EF@\u00A9\b\u00ABR=\u00F5+K\u00E1\x16\u00C1 \u00B0\u00AB\x06k\x05\n\u00F4\u00C4K\x1D\u008D\x1E\u009C]\u00DA:\u0096\u00FF\u00F0H?\u00C5{\f\u00AD\x0F0\u00C8=\u00C0d\u00E1\u00F3@\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B8IDATx\x01\u00E5\u0092A\n\u00830\x10EgD\x0BZ\u00A8\u00D0.\\w\u00DD\x13t\u00D1\u00F3\u00F7\f\u00DD\u00F4\x10-\u00E8\u00C2B\u00FA\u00A3#H\u00D4d\u0092\u00AD\x1F\x1E\u00A3\"o\u0092a\u0088\u00F6\x1DcL\rn\u00A0\u00A2\u00C4d\u00CE\u00FBU\u00B8\u00A7J]\u00E1\x0B\u00B4\u00A0L\u0095\u00B2\u00FB\x01\u0092A\x06\u00AC\u00AC\x03OfnI\u0099l\u00D1\u0081y\u0090\u0084N*\u00B3~\u0080\u00DC+\u008C\u00906\u00A0\x06\u0087\u00A0P)\u00ED\u00A4\u0096*\u00A1B\u00FA\u0093\x1A\u00BE\u00B2R\u00DA\u00CB/E\u0094pK:\x13\u00C5\x0B7\u00A4\u00CD\u009A0\u00F7I\u00ECj\u00A0\u009Ci\u009CW/\u00F5K\u00E3\u008EN\u00A9\u00D4B\u00E4\x02N\x14\x11&\u00FF\tm\u00C3\u00A34.fuz\u00B6;\u00F8\u00C68>\u00B4\u00DF\u00FC\x01\r@T\u00B5\x1B\u00E5\u0090\u00A6\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00IIDATx\x01\u00ED\u0092\u00B1\n\x00 \bD\u00EF\u00A2\u00CF\u00EBs\u00FB?\u00A3Ap\u0091\u0088\x1C\x02}\u008B\u008Ar\u00C3y@0\u00D4FD\x06\x1E 9wmH\x07\u00ED\u00E0\u00F9\u00A8\u00FE\u009C\u00F6\u009Bp\x0FK0\u0083`\u00BF9\u00B6y\u00F3\u00A8\u00A7|(\x18\u00CE\x02oQ\f\u00D8&}g`\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00JIDATx\x01\u00ED\u0092K\n\x00 \bD5:^\u00C7\u00ED~\u0086-\u00A3\x1C\u00E8\u00B3\u0090| \u0088\u00CA \u00CC\x10}\u0081\u0088\x14-\u00ED3:\u00B4\u00F6\u00CC\\\u00C7Y\u00A2\u00CB\u0084\u00E09\u00A6\u00CB3\x17\x11o>Dy[\x119t\"\u00D8]\u00DE\u00C9\u009B_\x1A7+\x10'\u00BF\u0082Q\"\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00GIDATx\x01\u00ED\u00941\n\x00 \f\x03S\u00F1y>\u00D7\u00FF\u00D5E\u00C4A!b\x07\u0091\u00DCV\b\x19\u00DA&@06\x0F\u00EE^\u0096\"\u00B3\n\u0092\u0084`dxO>\x113_\u00A0\u00A3\u00C8\u00F0KF\x1F\u00EER@\x1B\u00F5\u00B4\u00BC\u00BF\u00C3\x06Y\u00F5\f!\u00F25[e\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00HIDATx\x01\u00ED\u0092Q\n\x00 \bCgt\u00BC\u008E\u00DB\u00FD\f\u00FF\u00D3\u00A0$\x14|\u00E0\u00978\u0095\rH\x013\x0F)8\u00D0\u00B5\x05\u00D6\x10\x11M\u00AD\u00D7\u00E0L\t\u00BE\u00B3u\u00D9r\u00F1\u00C4\u009F\x0BoC.\u009FUl\x02\n\u00BA\u00E70>\x0B\u00B6\x02\x10'\u00DF\u0097\u00C6>\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00KIDATx\x01\u00ED\u0094Q\n\x00 \bC\u00B7\u00CE\u00D7q\u00BB\u009F\u00D1_D\u00D1\u0088 \u00A9\x1E\u00F8\u00A32\x1C\f\x01\x013\u008B\u00A5\u0094\u00DD\u0080\u00CDl\x17\u00E4h0\u00B3H2\u00F5\u00FA\u00FE-?((q4\u00D8l/\u00C1\x02u&\x7Fl\x1C\nJ\u00DC\u00F5`3\x0F\x12\x1B\u00D7\u00EAjv#\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00LIDATx\x01\u00E5\u0092\u00C1\n\x00 \bC]\u00F4y}n\u00FFg\u00A7\u00C0Cb\u0086\x07\u00C9wr \u00C3\u00E1\u0088\u00CA\x01\u00CF23\u008F\u00A3\t0\u00F7\u00DC(\u0098p\u00C3.\u00C5M$\u008B\u00FC\u0091\u00A1\u00C5|%\u00FEB)\u00AC\u00A7|\u00D8CO\u00DF4\u00F2G.\u00C8\x02\u00F7\u00CE\x14\x1E\u00F4\n\u009E\u0091\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00A8IDATx\x01\u00ED\u00921\n\u0084@\fE\u0093\u00C1-\u00F6\x10[\u00D8\u00EC\u00C2z\x07\x1B\u00CF\u00AD\u00E0!\u00AC\u00BD\u00856\u00C2\x18\u0087(A\x14\x13\x1D\u00B0\u00F1\u0081\u00C4\u00FC\u00C9|b\f@dp~\u00F1\u00DE\u00BF(\u00E4\u009C\u00D6\u00888\u00B0^Px+\u00BCz\u00BAS:!|\u00F9\u00E2\u00F4\u00FC\u0084\u00AE1[\u00EA\x1Cw\u00F1\u00A1\u0090\u008A\u00C3\u009453Nt\u00B7\u00E6\u00CF\u00B1\x03\x1D\u00A1.\u00CC\u0090\u00BA\u00C9X\u00C8\u00F8\u00B0\u009Dr\u009AI\x0BF\u0092\u00E0\u008A\u00D8\b\u00E3%?\u0083\u0083\u00C8$G\x05W\u00D6f\x0F\u00FB\u00DA\u00C4DchZ\u009B\u00C3\x19\u00D2\\*0p\u00CB'\u009Bx\u00D6&\u00FC\u00FAnC\u00D3\u00A0\u00AD\u00B31\x02\x1Am/\u00CF=\u008F\u00B3\u00D7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008CIDATx\x01\u00ED\u00921\x0E\u0080 \fE\u008Ba\u00F1\x06\u00AE\u00CE\x0E\x1E\u00C2s{\r\x07\x07\x17\u00EF\u0080\u0083&X\u0090\x1ABXh\x19y\u00C9\x0F\u00816?M?\x00\u0095Q\u00C0\u00C4Z;\u00E11\u00A0v\u00A5\u00D4I\u00EF\x1D\u00F01\u00A8\x1E5;s\u0094\u00FE'\u00C4\u00CB\x12\u008A\x12.\u009Ct\u00A5\t-\u00C8\u00F1\x1E\u00D2\x1D\u008E\u00E1z\u00C0\u00B7\u00CBG\x03\x1F\u00B7\u00C3\x1B\u00B5\u00C5\u00A1T'\x17\u008A_.5\u0094\u00D6(\u00948\u00E14\u00ED\u00A2\u009A\u00E4\x1Ffi\u0086\u00CDP`h\u00A27\u0093\u00F4pkux\x01pd2\x1D\u00A0f\u00CE4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009DIDATx\x01\u00ED\u0092=\x0E\u0080 \f\u0085\x1F\u00C6\u00C5k88x\r\u00CF\u00AD\u00B7pq\u00D0A\u00CF\u00A0#\u00D6\x1F\f\x12\"\u0094`\\\u00FC\x12Bx\u0094\u00A6-\x0F\u0088\u008C\u00D0\x0FR\u00CAj\x17\u0085\u00A8\r-s\u00A7\u00C2\u00B2\u00BDK\r\u00D1\u00F6\u00D0'\u00D9\x15\u0097 2>\tg\u00F8\u00B1\u00C7\u00A5\u00AE(\u009AK\x03\x06\u009F\u00B4\u00CC\u00C2\u00D92\u00D76>\x15\u00FE\u00B6y\u00E6\u009D_\u00A6\u009F\u00CC\u00A1\r_\u009D\u00A9\u00BA\x16LT\u00CB\x05\u00EE\u00ED\u00978f\u00D2\u0086\u00DA\u00C6VIw\u00EE|\u00DBP\u00E6\u0091\u00B6A\u00BB\u00ECI\u009B\x10@bT4\u009F\u00AB\u00D3t\u0096m\u00A2\u00B3\x02B\u00F2,\u00D5\u00B5Y\u00EEU\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0086IDATx\x01\u00ED\u00911\x0E\u0080 \f\x00\x0B\u00D1\u00C1G8\u00B8\u00F8\x11\x17?\u00ED3\u009C}\u0083\x0B\x0E\x0E\u00B5\u00926!\u00C4\u0085\x167.i\b\x14\x0EJ\x01\u00FE\x04\x11G\u008A\u0095b\x02%\x1D\u008Bz\x1Af\n\x11\r\u00A0\u00C4\u00B1p\u00B1H\u0098\u00CB9\u00B7y\u009E \u00D8\u0089\x0Eya^\u00F2N\u00B7\x1D\u00A0 \u00FE!\x1D\u00BE_\t\u0089O\x16[\u00CB\u00AF\u00C7WS\u00E2\u00E7\u00CA\u0086\u00D2\u009C4%-1/\u00B7(\u00E7\u00A12M\u00D8\u0084\x06aH\u00D6B\u00B6G\u009B\u00AB\u00C3\x03;\u00D43\u00D95\u00D1\u00FFA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_x: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00VIDATx\x01\u00E5\u0094Q\n\x00\x10\x10Dg\u00E5x\u008E\u00EB~+\x1FS\u0092VD\u00C9\u00BERHj\x1E\u00BB@\u0087\u00AA\u00A6:``\u009D\t8\u00CC\u00F1\x0B#'}\x04\u00AEE$c\u0081\u00F7#\u00DFs8c\u00F4M\u00DA=\u00BAv\u00E8\u00F0\u00A3Wn+\u00C6\u00AA\"\u00CF\x0E\u00E9c\u00B7\u00CB\u0090\u00F7#\x17o\u00AE%S\u00AC\u00F0\u0084\u00F4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_y: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00GIDATx\x01\u00E5\u00921\x0E\x00 \b\x03\u00A9\u00EF\u00F3\u00B9\u00FE\x0FWM\u0084\u0081th\u00E4\u00D6\u00A6\x04h\u00CD\u00D4A&\u00BA\u00FB|\u009A\u0080\x15y\u0086\u0091\u00A1\x0FDtV\x15\u00FE\u0086\u0099\u00F8g(\u00FA\\\u00A1T+t\u0086\u00D4\u00BD\u00D8\u0092?\u00D4g\x03\u00AC\r\x16\u00A9\u00BE;KZ\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\x18IDATx\x01\u00A5S1\x0F\u00C1P\x10~\u00EF\u00A5\x06$\f\x06\x06\x125\x18\x18\u00CC~\u00BC\u00D9\u00C0j\u00E9b`\u00E8\u00D2\u00A1$\f$\u00F5}|\u0095\u00A7Z$^\u00F2\u00E5\u00DAw\u00F7\u00DD}w\u00BD\x1A\u00F3\u00E7\u00B1\u00DF\x02\u00B2,k\u00C3t\u0081\x148ZkO\u00BE?(!\u00F4ab\x04^uE\u00F2\u00D8\u00F3G\u00F0Eo\n\u00E0\u00E8\u00C1L\u0081:\u00F0\x12\u00E4)\x19\x02\x03\u00A9Y\u00B2\u0088\u0095c\x02t\u00BC\u00F8\x0B\u00B0\u00F0T\u00F8\u0089B\x15\u00DA\u00C2\u00BFq\u0092\u00D7\x026\u00C0Y\u00E4\u009A*\u00BD\x1D\u0090\u00B6$\x03!\u00925\x1C.V\u00AC&2\u00E5\u00AF\u0081\x04\u00E8\u0099\u00EA\u0093\u00B7\u00D7w\u00CAz\u0095\n>\u0093\u00BC\u00CB\u00DF+TP\u00E5\u00811AE\u00C0\x1Efo>\u009F{\u00AB\u00CE\u00BB\u00B8\x0F\f}\x05\u00E6\u00B7\u00D3`\x12?A*;\u00F8\u00C6\u00E4\u00F0\u00CCc^\u00F13\u0081z'F?\u00A8\u00E0g\u00E4F&\u00AE\u00E0\u0088\u0094y\u00AE*e\u00D5I\u00E6vr\x0F\u00CE\u00B6$\u0080-\u00CC\u00CC\u00E3\u00B3\u00C6\x02\x155\u0081\u00D0\x146\u00D5VTa\x10\x17\u00AC8\u008FD\u00E4$\u00BF\u00F8\u00F87j\x16m\u00BD\u00A6e\u00AB}\x03\x07\u00AEhn0\u00CA\u00D1\u00A4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
  },
  light: {
    normal: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u009AIDATx\x01\u00E5\u0092[\r\u00800\fE/\x04\x01H\u00A8\x04$\u0080\"\u00A4 \x01\x0B8\x00\x07H`\x12@\x01t\u00A1\x1F\u00CD\u00C2x,\u00FB!\u00BB\u00C9\u00C9\u00D2&\x1C\u00BA\x07\u0090\\2\u00A7\u00AE\u0098\u0096Y\x15\u009BS\x1BY_\u00A5g\u00F6\x07\u00E6;A\u0081\u00FB\f2M\u00A9\u0098\u00BE\b\u008DS\u00DB#h.\u00FA\u00DE\u00E4N\u00BD\u00AA\u00C9\fC\u00CC(k\u0090pS\u00E2&D\u00EA\u009B\u00B0\x14Y\u0090T\u00A7\u00C6y\u0093\u00A3\u00EA\x11\u00B3H\x7F\u00C1G)\u00A9\x0F\x11Cj\u00B7j\u00DFY\u00E7\u00F9Y\u00F0\u00A4\u00BE\u00D0/\u00A5=\"\u0085p\u009Eu\u0085\u00B4s\x00qF:\u008E\x05HI\u00B5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u008BIDATx\x01\u00ED\u0092\u00E1\t\u0080 \x10\u0085\x1F\u00D1\x00\u008D\u00D4\bm\u0092\x1Bd\x1B\u00D4\x04\u00AD\u00D0\x06\u008D\u00D0\b\u00BAA#\u0094\u00D0\t\u0097$\u0098\t\u00FE\u00F1\u0083\x07\u00E7y|\u008A\bd\u00A01Q\u0094\x06\t\u00D8MN\u00CA\u0086\u009FLLf\u00B3 \x12I\u0082\u0083\u00C9l-\u00F1\x11\u00C1$\x1D\u00AB[V\u008BP\x19\x17\u00F4\u00D4\u00B3k\u00F7\u00B06D\u00A8hx`=.\x04\u00ED\u00D9'xP\u00BF\bW\x13m2\u00C3\u00CF\u0088\u00FB\x0BiD\u00E2\u00DE\u00D0K\u0085\u00C4\x14a\x11FP\x07\u00CEi\u00E4\u00E2\x02\u00B7\u00F0-\u0093\u00DAzhj\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B3IDATx\x01\u00ED\u0092\u00CD\r\u00C20\f\u0085\x1F?\x07nd\x04\u008F\u00C0\x06\u0088\rX\u0081I\x18\u00A1b\x02V`\x03\u00D8\x006h\u00AF\u00DC\u00BA\x01\u00D8\u00C2\x15V\x14a\u00A3\u00F6\u00D6~\u00D2S\u009A4\u00F9bE\x06F\u00C7\u00CC\u00F9\u009F4d\u00BE\u00D7fM8q\x1E\br\u00E7\u00BC\u009C\u009C\u00ED\u0081\u00A5#\u00BCi5\r\u00A7\u00D5\u00C8|o\u00F6\u00B4\u00E8\x01q\u00EA\u00AC\u00C2\u00A3\u00DD0G\x1C\u00E2\\ul8\x17\x14*\u008C\n)\u0093\u00ED\u008C\u00E8o!\x15d2\u00A6\u00920\"\u00EB\u00DE\u00AC\u00C6\u00B7U\u00A0\u0097\u00C8\u00FA\x16A\u00E8\u0087L\u00E8Zj\u0083\x00\u00E4\u00C8\u0084J\u00A5i\bY\x18\x1AR&T}e\u008Bl\u00FE\u00E4\u00AC8\x07|Zc\u00C2\u00E7\r\u00F659h\"\x17\t*\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0081IDATx\x01\u00ED\u0091\u00B1\r\u0080 \x10E\x7Ft\x017p\x14\x1D\u00C1Md\x03\u00D8\u0080\x15\u00DC\u0084\u00D6\u008E\x11\x1C\u00C1\u00DAJ\u00EF\x12\x12h0\u00C6C+^\u00F2\x1AH~\u00EE\u00DF\x01\x15)\u00ED\u00CD\u00DFHz\u00F2 W<\u00A4\u00C9\u00BC+\u00D2\u0091\x1D\u00D9C\u0088!\u00CF\u00A0\u0086\u0090%\t\u009B!\u0080\u00AB\u00B9\x10\u00B4\u0093\x03\u0084l\u0088\u0093\u00BD\u00953\u00B2G\x11\u00C3\u0095=b\u00E5\t\u0085\u00B0\u0088\x15\x14\n\u00A1\u0093P\u0083B(|0)\u00EF\u0091/gQ\u00F9\u0095\x0BK\x1A,\u009DWt\u0099r\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00ZIDATx\x01\u00ED\u00D2\u00CB\t\u00C0 \x10\x04\u00D0!\u00A4o\u00D3\u0081\u00E9P;\u00D1\u008B\u00A2\u00E2g\u00FD,\b\u00E2\u0083\x01\x0F\u00B2\u00C8\u00B8\u00C0U\u00A1\\\u00D8\x18\x17\u00D2\x03f[\x06~\u00D1Yb\u00D1\u008F\u00D0\u009F\u008F\x18\x19\u00A0\n\x03\u00A8$\u00BF\u00CF\u00DE!E \x7F\u00D1r\u008F\x12\u0093\u00FD\u00B5\x1C\u00B4\u00D8o\u00E7=\u008D\u00AB\u00C6\x02\u00C8\x11\"\u008D\u00AD\x04\u00EE\u0096\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00{IDATx\x01\u00ED\u00D2]\r\u0080 \x14\x05\u00E03g\x00#\x19\u00C1&\u00D2\x00\x1AH\x03\u00A38\x13\x18\x01\x1Bh\x03\u00BDL6\u00EF\u009C/\u00C8\u00D5\u00F9\u00C0\u00B7\u009D'\u00D8\u00E1\x17\u00C8\u00BEf)\u008E\u00D2@\u0088\u00A2l!\nB4+5\x10\u00C2w\u00DAA\u0088\u00BF\u00C7%\u0094N\u0094\u008A\x0F:\u00B6\u00E2\u00D3\u00F8\x0E\x14\u00F8\u0091\x1A\u00E7\u0091\x07\\\u008E\x1C\u008B?J\u008FD\u0086\u0095i$\u00B2\u00AC\u00AC\u00BD\u009BP\"\u00CELYq|\u0099\x11\u00D9+v\x01\u00D1.N*\u00E9#g\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00A1IDATx\x01\u00ED\u0092\u00C1\r\u00830\fE\u00BF\u00AA\u00DE\u009B\x11<\x02#\u00B4#u\u0082\u008EPu\x02V\u00E8\x06\u008C\u0090n\x00#\u0094\t\u00E0#\u008CdE9\u00E0\u00808\u00F1\u00A5'c\u00A4<L\x12\u00E0\u008C#BjRa\u0087\bi\u00C9@\u00DE\u00D8\x181\u00B2V\u00FB\u00E3d\u0081D\u00E4\x7FCP0Y\u00A5\x0B\u00E2\x1E\u00B2)w]\u00D4\u0094\u00CA.I\x1F\u00B4\u00FE\u008D\u00AC\u00D1\u00DA\u0091\u0087\u00D6\"\u00A1xe9\u00E1\u00CD\u0088\u00DD\u00B2\\^\u0098\u00F7j\u00C1}\u00CF\u00AEI\x1F\u0092\u00FE\u00A7\x1F\t\u008A\u0090/ybe\u00EAd\u00C2\x1C\x11\u008E\t?\u00E6\u00B9\u00C3|8\u0096\u00E9]\u008F36#T\u0090:\u0088\u00E7%58\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x7FIDATx\x01\u00ED\u0094\u00D1\t\u0080 \x10\u0086\x7F\u009A\u00C0\u0091\x1C\u00A1Mr\x03\u00DD\u00A0\x15\u00DA\u00A4\x11\x1A\u00A1\x11\x1C\u00A1\u0082N:$\u00F2\u008A#_\u00FC\u00E0\u0087;\u00F1\u00BE\x179\u0081J\u00AC\x1456J\u0091\x0E\u00CA4a\x13*\t\u00DD\u0091\x11e\u00A4\u00F7\x10qnE`g\u00F9\u00A6\x04\u00EAE\u00EBh\u0099\u00C0\u00DD\b\x1D\u00EB{\b\u00E1C6\x13\u00A4z\u00C0K<\rF&I\u00B5\u00C7G&&K\x11=\u00C4\x133\u0093-P\u00C0\u00E0\u00FA`\r\u00FEf\x07\x12\x10,\u00D7h<b\u0082\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0096IDATx\x01\u00E5\u0092\u00E1\rF0\x10\u0086\u00DF\u00EF\u008B\u00FF\u00BA\u0081\x1B\u00C1\x06b2#`\x02\u00A3\x18\u0081\r\x18\u00C1\x06\\\u00E3D%hN\u00FA\u008B7y\u00D2\u00A6\u00D7>i\u00AE\x05>\u009F\u0094)\x19B\u00A04\u00CC\u00CC\f\u00A1\u00A4$\u00B2wH+\u00A6c\f\x02I\u00B7Z\x02E\u00E8F\u00DA\u00CAz\u00E6\x1E\u00F8{\u0084#\u0093\u00CBH\"!\u00A9M2\x1A\u008D\u00F0N\u00FAXx%5gBm\b{O7\nwC\u00E4\x11\u00D8\u00AFa\u009B>9\u00F48>\x0Ei\u0084V\u0096B\u0091\u009F\u00A7n\u00E4\x06\u00B1\u00CC\u00CF\u00A8\u00B1\u00DE\u00FA\u00ABY\x00\u00B5\x1D.\x7F\x07:\u00B0M\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00>IDATx\x01\u00ED\u00911\n\x00 \f\x03\x13\u00F1\u00FF_\u00AE\u00E0$.A\u00CCPhoji\u00B8\u00A1\x01\u00CC\u00F0\u0098\x03\x7Fl\u00D7@9x\u00ED!r\u00EA\u00EE\u00FFa\x0B+\b'\u00DE\u00A0\nt)\t\u0085v\x16\u009A0\x03\"\u00BA=\u0090\f\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00@IDATx\x01\u00ED\u00D2\u00B1\n\x00 \bE\u00D1k\u00F4\u00FF\u00BF\\KSP&\u00D5 z\u00C0ED\x04\x1FD\u00D1FQ\x0F\x06wdn\x14\x1E\u00CB\u0085\u00F7\u00B4/\x0BF\u00DF.\u00D4\u00F2\u00B6\u00929\u00F4\u0094Cs\u00DE\u00FC\u00EAZ\u00CB\x04'!\u00C9\u00B7Y\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00>IDATx\x01\u00ED\u00D4A\n\x00 \bD\u00D1_t\u00FF+\x1B\u00B4\u008A *t\x112o'\u00C8,T\u0084`e\u00A9\u00ED\u00B2o\u00AB\x12L\u0081~\u008D7\u00C7+\u00D0R\x14\u0098\u00D2\u00FC\u00E7\f\u009F\u0091\u00F5\u00FF\f;@\u00B5\x03!Gf\u00E5\u0090\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00?IDATx\x01\u00ED\u00D21\n\x000\b\x03\u00C0\u00A4\u00F4\u00FF_n\u0097\u00AE\u00E9\u00A0\"\n\x1E8\t*\x18\u00A0\u008B\u00F3\u00CAmC/\u00F8\u00A1j,\x04\u009B\u0081~\u00EA\u00CB\u0084Q\u00DA\u0085\u00D6\u0090sbSp`x\x0E\u00EB\u00BB\u00D2C\x04'QnFB\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u00941\n\x000\b\x03c\u00FF\u00FF\u00E7v\u00E9(5PAQ\x0F\u009C\u00C4C!\bp\u00EC[&\x0B\u00CE\u00B8\x0B\u00E5\u00D1\u00B3NTg\u00F3\u009F\u00DCP\u00C8\x12\x17lQ6\u00F9\u00F2Ll\x12\nY\n=\u00D8\x03\u00F0>\b\x1BkpQ\u0098\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00DIDATx\x01\u00E5\u00D3\u00B1\n\x00 \b\x04\u00D0+\u00FA\u00FF_6\u00DA\u00A2\u0086C8A\u00F4m.\u00E2\u00A1\x02\u00ED\f\u00F8\x18\u00EB3!&o\u00B8\u009E\u009AFb\u00F2G>Q\fB!\x13\u00DE\u00D8R\n\u00DE\u00A1\u00F7\x15?\u00F9#7\u00B4\x01\u00DBZ\x05\x1E\u00B2\u00CE\u00CD\u00AD\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0082IDATx\x01\u00DD\u0092\u00D1\r\u0080 \fD\x0F\u00E3\x00\u00AE\u00E0d\u00BA\u0091\u008E\u00E2Ft\x03G@L\u00C0\x10\u00E8G+\x18\u00A3/\u00B9\x04J\u00DBp\x14\u00E0A\x06/\x1B4$\u00F1s\u00EF\x04\u00B2y\u00C359\\\u0092\u00B8S\u00E8bf\x0E\u00A7\u009A\u0086\u009C\u00AD\x1D7,\u00F7\u00A1h\u00F3\u00A2`;\u00DA\u00A7\u00B0\x1EQAqu-\x1D\x1A#i\u00A8zC\u0093\x15G\u00BB\u0086\u0089I0\u00AFX&\u00C8`\u00F3\u00BE9\u00E5\u00E6\r\x7F\u00FEm\b\u00E5\u00F8\t2\u00A4y:\x0E\u0092\u008AaD)\u00A7\x143\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00iIDATx\x01\u00ED\u0091\u00D1\t\u00C0 \fD\u00CFN\u00D0\r\u00BBB7i7\u008C\x1Bt\x04\u009B\u0080\x1F\u0087\u00D0\u00821\x1F~xp \u00BEp\u0090\x1C0\u0091n\u00B5\u00A8\x0F\x04\u00E9T\u0097\u00EAK\u00BD3\x14\u0082^[\x066L$\u00BB\u00E1\u00E7\u00CA\x1E\u00D9\r\x1F\x04\u0096\u00F2+.EFX\u00AA\u00A04\u0083\u0089\u00DE],\u00BC\u00E5\x15\u00B8\x02\x07\x023\u00FD\u00E5f\u00C6\u00CBb\u00F4\x02&^.\u00FEz\u00AB\u00CA\u00BC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x7FIDATx\x01\u00ED\u0094\u00DD\t\u00800\f\u0084\u00AF\u00E2\x00\u00DD\u00C0\u00D1t\x04\u009D\u00A4#\u00EA\x06\u008EPER\u008C\u00A5B\x1A\"\u00FA\u00E0\x07\u00A1\u00F4\u00F2\x03)G\u0081\u0087\u0099)r-\n\u00E2\u00E8sYs\u00A4\u00D3\x154\t\u00AE\u00811\u0092\u0081\x0Bd\x14\u00EB\u00D2{\u00A8yee\u00F3\u0081\u00BFm\u00EA\u00EA\u00BEg\u009B\u0096\u00CEq\u008F\u008E\u00E9\u00E9>A\u00C9\u008A\x1B\x1B\u00A0\u00D26\u0089\u00A1P\u00D0S.V\u00C4\u0085\u00C0\x12\u0081\u00E9\u00EA\u0081\x1E\u00E7\x07\u00EB\u0099\u00AEZ\u00D9\u008C\r\u00D5\u0083_\x1D\u00963\u0080c\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00oIDATx\x01\u00ED\u0091\u00C1\r\u0080 \fE?\u00BA\u0080#2\u0082\u009B\u00E0F^\u00DD\x02\u00D6\u00F0\u0084%rhz\u0093~o\u00FC\u00E4%\u00C0o>\u00D0\x02d\u00ADf\x1F\u0085S\u00B8\u0085\x0B\x0Em\u00C2!\u00D4N\u0082SY\u0085\u008D\u00D22\u00B0\u00E0'\u00B5/'u\u00DB\x0E\u0092\"\u00DE\u00A7\u00BB{H\u0097\x1EJ\u00F6x\u00A1\x1B\u00D5\x14\x06\u00B5\u00FE\u00E4\u00D1\u00A7<\x03g\u00A0#\u00B0\u00A8\u00B3bjF=\u008E\x1E\u00B7)0#\u00C6!x)\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_x: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00OIDATx\x01\u00E5\u0094\x01\x06\x00 \fE\x7F\u00E9\u00FEW.\u00D2\u0098\u00B2\u00A6,\u00A6=\u00A2\u0092\u00F8o6`\u00A5\u008E\u00B5C|\u0093a\u008C\u00F9\u0087\u0085\u00ED\u00E7\btN8\u00C0\x7F\u00E4\u00A7\x0E5\u00AAr\u00D7]\x07t\u00F8W\u0095y\u00C7\u0088]\x14\u00DC!\u00F9\u00B8\u009A2\u0084\u00FF\u00C8\rqj\n+\x1B/8\x10\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_y: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00@IDATx\x01\u00ED\u0092\u00C1\n\x00 \bCW\u00FF\u00FF\u00CFF\u0097\x0E\x1D\ne\u00C2\x10\u00DFU\x1Cc\x1B\u00A0\u00CE\u00F8\u00DC\u00CD\u00FB7A\u0086.\u00B8\u00AD\x1B\u0088\u00A48|Q\u00B0\x14}\u00EEp\u00A3\x13::=l\u00C1\f\u00F5Y\"M\x06\x15\u0089\x04M\u00F4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00E2IDATx\x01\u00A5S\u00D1\x11\u00820\f\u008D\u00B8@\u00DD\u00A0\x1B\u00E8\x068\x02\x1B\u00C8\u009F\u009F\u00B8\x01n\u0080\x1B\u00E8\x06\u00B8\x01#xN\u00C0\b\u00F8\u00E9\u009F&\u00E7\u00EB\x11\u00AA\u00A5\u00BD\u00F3\u00DD\u00BD\x03\u0092\u00974M\x02\u00D1\u009FX&h6\u00CC=s\u00C5|2\x1F\u00B1\u0080\u0092i\u00D4w\u00CD|)\x1EC\u0081\x05\u00B3\u0087\u00A8\x0ETr\u0086\u00FF\u00A6\x0F\x11G\u00E7\u009D2\u00D0\u00B4\n\u008D\x034\u008D3\u00B4\b\u00A8P\u00C1\x00AEa4\u00D0Xg0\u00B8\u0082\x18sT\u00D4\u00CD$0\u00F4\u00E3\u00AA\u00AEY\u0082\x12\u0095\u00CCA\u00FA\u00D0f\x01\u00E7\u0085>c\u009B\u0083\u008C\u00D3d\u009E\u00C1\u0095\u0097\x02+1:\u00C1\x1D\u00CF]b\u00B0\u00F0\u00EA;\u00A4q}B\x15-t\u00D6wli\\\x14\x1B\b>Qd\u00CC%\x04rB\u0083\u00A4\x05\u008D{\x12\u00DA\u00D4\t,\u008Dk\u00AB)W\u00CC\u00B5p\x11I$\u00BDX\u00E3]\u009A\u00FC\u00F5'\u00BE\x01\u009F\u00B4>\u0081\x02J\u00E7\u00E7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      ghost: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x04\x00\x00\x00\x04\b\x06\x00\x00\x00\u00A9\u00F1\u009E~\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\x15IDATx\x01\u00A5\u00C0\u0081\x00\x00\x00\x00\u0080\u00A0\u00FC\u00A9\u00878\u00BE\x00\x00D\x00\x01\u00C7y\u008Bw\x00\x00\x00\x00IEND\u00AEB`\u0082"
    },
    disabled: {
      top_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B9IDATx\x01\u00E5\u0092\u00BD\x0E\u00C20\f\u0084] C\x19`C\f,\u00AC\u00BC\x01\u00AF\u00CF\u00D2W\u00E1ob R\u00E9\u0080Or%\u00CBr\u00D3&\x1D{\u00D2\u00C9\u00B5\u00D5~\u00BA:!Z\u009C*\u00D3\u00EF\u00D9g\u00F6O\u00DC\u00B1[\u00F5\u008C\x1A\u00A5\u00BA\u00DA\u0098\x1E\u00B0\x13\u00A5\u00F5a\u00DF\u00A6\x02\u00AD\u00EE\u0092,\u00C8\u00BB\u00A8\u00EF\u00D4\x07\x16\u00F85=V\u00D08\u00F3A\u00ADL\u00DF\u00A9d\u0080\u00D4\u00EC+{K\u0085\u00C0V\u0081\u009B\x12\u00E8PB\u00AC\"\u0096@-\u00B0\u00BF\x0EAj6\u00D4\x02\u00A3\u00D4\u00DA\u00CC&C\u00D7\u00CE\u00EC\u00C0~\u00B2_j\u0086U\u00E0\u00A0\u008E\x02C}\u0090s\u00C1+\u00CA\u0093N\u00A8\u0093'\x13\u00A64\u009A4\x17\u00E8A\u0083\u00F4\u00B3\u0085\u00DF\u00BF\u00B0w\u00B4l\u00FD\x01\u00BF>3\u00FB\u00EDq1\n\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AEIDATx\x01\u00ED\u0090!\x0F\u0082P\x14\u0085\u00AF\bAgq\x16\u00AB\u00CE\x19\u00A4\x1A\u009D\u00FF\u00DDl\u00B1P,\x14\u0083\x06*E\u0082\u00E7n'\\\u00DDC\u00EE\u0080\u008D\u00C2\u00D9\u00BE\u00F1x\u00EF\u00BC\u00EF\u00F1\x10\u00E99\x13G'\x01g\u008E/\u00A0\u00FAW\u009EJsN`A\u00F1\x12<\u00BA\bS\u00B06\u00EFs0\x03\u00AF6\u00C2=\u00D8\u0081\u00B7\u00E9U\u00FCJM\x11\u00DA\x14\u00D5\u00C8\u00B6\x14jnf\u00FEj\x0E\u00DBx\u0085z\u00C5\x03\u00C7\u0099|_\u00AF\u00E0\u009CF\x7F\u00C7\u00CA#L\u00F9\u00BC\u0083<\u00B0\u009EsMs\u00FC]\u008C\x03\x1B\u009E\u00A0\u00AC\u0091\u00899,a\u00AFQ\u0098\u0089/\u00C1^$=g\x14\u008E\u00C2\x16\u0089\u009D\u00BDR\u0086\u00CA\x07?\u00B6\x19\x1D{r\u00EAN\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AEIDATx\x01\u00E5\u0092\u00B1\x0E\u00820\x10\u0086\u00AFZLppu\u00F61|\u00FF\u00C1\u0095\u00D9\u00C1\u00D9\u00C5\u00C5A\x13 \u00D1;\u00F8!\u0097\u0086\u00D2\u00E6`\u00E3K\u00FE\u00A4\u00B4\u00D7/\u00EDQ\u00A2\u00CD\u00E1\x12\u00EB\x05Rr<\u00C6\x07\u008C\u008F\u00A8yp\u00DE\u00C3\x06\u009F\x10^9'JS\u00E5\n_\u00A8\u00F9rZN\u0083S\u009EUM\u00AD7\u00A4\u00AE\x1C\"\u00D7\u0094S\u0097j\u00EE\u008Et\u00EC(\x1F-\u00FBp\u009E\u0098otQ\u00AE0\u0094\u00DD\u00A8o\u0081I8%\u0093\u009E\x16\x16aL&\f?\u00B4\u00CD\x15\u00CE\u00C9(vBo\u0094\t\u00F2\u00A4~X\x1FqFY\x14\u00B7\u00A6L\b{xY\"\x13\u00F6\u00C1w\u008D\u00B9\u00CA\"\u00DB(\x7F\u00AD\u00AD.\u00D5\u009B?\x15\u00B3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00BCIDATx\x01\u00ED\u0093\u00BB\n\x021\x10E\u00AF\u00AF\u00C2F\x04\u00C1Fl,,lll\u00AC,\u00FCn\u00FF\u00C0\u00C2\u00C6\u00C6F,E\x04\u00B1\x11Y|\u00DCqgP$\u00BB$Y\u00D8j\x0F\x1Cv6\u0081K2I\u0080\u008A\u00A24r\u00E6ztA\x1F\u00F4\x02O\u009A\x19\u00E3#:\u00D1\u00BA\u008D\x00j\u008E\u00B1\u00B1*\u00EC\u00D4\u00E8\u00C0)\x1Dj\u00BD\u00A5{\x04b\u0081-:C\u00DA\u00B7\u0084\u00AE\u00E9\x19\x11X\u00E0\x12\u0081\u00BDrp\u00A3\u00AB\u00BA\u00FE\u00BCP\u009CO\u00C6\u00EF\u0096\u00E7\u00B4\u0083t\u00CB\x1BzD\x04v\x0F\u009F\u00F4\u00A0\u00C1\u00D2\u00C7\u0081\x06{\u00DF\u00BF\u00FF@\u00E3\u00A4_\t\u00EDk\x1Dt8\u00AE\u0097\"\x01\u0089\x06\u00DA\u00A9{\u00AF4\u00EB\u00E9I\u00C0\u0095v\u00E9\x1D\u00DF\u0095W\u0094\u00C0\x1B\x15\u00F1\x1E}\u00E6\u0093\u00C0\u00FC\x00\x00\x00\x00IEND\u00AEB`\u0082",
      center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0089IDATx\x01\u00ED\u0093M\n\u0080 \x10\u0085\u009F\u00FD,Zv\u0087p\u00D31:w\u00C7(\u00C2E7h[\u00CBR0R\u00C1f\u0082\u00A0\x16~0\u00E8\u00E0\u00BC\x01\u00DF(\u0090\u0088\u00D0\u00D9 )\u00C0\u00A3b\u00D6!\u00C3\u00CB|\u00D2P:\u00FB\u0096*\u00CE\u0089s\u00D3\u00A0q\u00F2\u00DA\u00AEKL \u0082\u00DCL\u0092=\x00\u00CB\u00A6\u00A3?\u0093\u00F0\u00CA;\u009E\u00E3i\x04Q,\u00E1{h\u0098u\u008C1\x01\u00E5\u00A1\u00F1\u00AA\u00C4\u00E5\u009D\u00D21\u00DD\t8S\x1E\u009C\u00BD\u00A2\u008A\u00FF\u00FF\u00B0\u00B9\x7FyE\"\u00C6\x01\u00E6w\r\u00A4gv\x1A\u00CA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      middle_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00AEIDATx\x01\u00ED\u0093\u00B1\n\u0082P\x14\u0086\x7F\u00CB\u0086\u00A0-(\u00A8\u00A9\u0086\u0086\u0082\u00B6\u009E\u00A0\u00E7\u00EE\tjihii\bZ\"\u0088 \x1D\x14\u00F5?z.\u0088\u009B\u00F78\u00FA\u00C1\x07G\u00BC|\u00E8\u00E5^\u00A0\u00C7\u00CA\x10\u00ED\u00D8\u00D1=\u008D\u00E8\u00BF\u008B\u00E0\u0084.\u00E8\u0092&\u00F4k\r\u00BA\u00C0\u0094\u00CEt\u00FEX\u0082.\u0090hP\u00C2#\u00FA\u00B6\x04\x05\u00F9\u00D2_-:\u00A7/\u009A\x05\u00BA\u00E0H\u00C7\u00B0\x11\u00D3\u00D3@\x1Fr\u00D8)\x1B\x01\u00FC\u0091_=\u00D0\x10\u00D5\u00BE\u009Ei\u00EA\x1B\\\u00D3\u00AD\u00CEOzu/|\u0082\x1BU\u00B8\u00AB\u00F0\r\u00CAMY\u00E9|\u00A3\u008F\u00E6\u0082\x10\u00ED\u0090+'g\u00F0\u0082\u00C6\u0081\u00EE\u00E9\u008E\x02i\u00FE\x1E@t\u00F2\u00F6\u00F4\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B0IDATx\x01\u00ED\u0093\u00B1\n\u00C2@\f\u0086c\u00F5\x04E\x1Ct\u00D07p\u00F0\t\x04\u00DF\u00DF'pv\x167\x07E[\u00D1?\u0090B8\"m\u00D2\u00B1\u00FD\u00E1#\x1C\u00B9\u00FB\u009A\f%\u00EA]\u00C6\x14\u00CF\x1C\u00EC\u00C1\x03\u00BC\u00BA\nYv\x00k\u00F0\x01\u00B7\u00BAQ\u0090?\u00B5l&\u00D3]tsD\u00BE\u00E4\u00B2\x13x\u00EA\x0B\u00F9\u00CA\t\x1C\u00C1\u0082\u00D4\x1Ame\u009C\u0089\u00F1h\t\u00BE\x11\x19\u00A7\u00F8\u00F3\u0081*\"\u00B3\u0084Ij\x19\u00915M\u00E8\u0096Y\u00C2\u00A9\u009A\u00D4-\u00D3\x13\u00E5\u00E7\u008DT\u0097\u00CC\x12\u00A6\u00EC|\x07;\u00B9\u00C7=\u009E\u00F8\n\u00CE\x14\x14n\u008D7+rL\u00A8\x7F#^\u00B7\x14*\u00A9\u00BC\u00FA\u009B\u0086\u00E8\u00FC\x00\u00A0;.\u009B\u00CC?BL\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00B2IDATx\x01\u00ED\u00941\x0B\u00C20\x10\u0085\x1F\u00EA\u00A2\u009B\b*\u0082\u0083\x0E\x0E:\u00F8#\u00FC\u00EDN\u00E2(\u0088\u00A0\u0093\u008B\u0083\u00A0.\x0E\u0085\u00D2w\u00F4\n\u00A1\\\u009A\f\u00A5]\u00FA\u00E0#\u00B4\u00B9\u00FBr\u00ED\x10\u00A0\u00A5\x1C\u0094`\x06\u0088\u00CB0\u00B2\x0E=\u00D4\u009CN\u00D8\tk\x12\u00AE\u00C9\x0E\u00E1\u0098u\u0096pCV\u00BA\u00FA\"{[2\u008B\x11\u009EJbk\u00B2\u00E2\u00B0Ky\u00B3o4\u00FCIB\u00A6\u00CA\u009B,u\u00EFG\u00F6\u008E\u00EC\x19#\u0094|t\u009D\u0090\u00B9S'\x07\u00C8W\u00DD\u00C8\u00DDj\u00F4\t\u00A1\u0093\u00C9-3v\u00DE\u0089\u00ECA\u00AE\u00BE\u00A6*\u00A1\u00E4\u00A5S\u008E\u00F4\u00F9K\u00CEU\r!a!] \u00FF\u00AFG\u0092\u00A2\u00C9d?\u0081\x16\u0089\u00AABns\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u00C6IDATx\x01\u00E5\u0092\u00BD\n\u00C20\x14\u0085\u00AF\u00A6\x15\u00AAEA\x07\u00DD\\\x1C\x14\u009F\u00C0\u00F7\x1F|\x0BG\u00D1A\u00A8\u008Avh\x11O\u00F4\x06\u00D2\x10\u00CDO\u00C7\x1E\u00F8\u00B8\u00EDi\u00F9\n\u00BD!\u00EA\\\u0084q?\x01+\u00F0\x00\x15E\u00C4\x14n\u00C0\x12,\u00C09Fj\n\u00AF,\x1B\u00C6JMa\rNm\u00A4\u00C2\u00D2\u00F9J\u00B7`\r\u008E\u00E0\u00A5\u00CA>\u00D9S\u0082=x\u0082\f\u00ECX\u00AEgN\u00DF%\x0E\u00F4\u00F2\u0097\u00D0GZ\u00F2\u00CC|\u0085.i\u00CD3\t\x11\u00FE\u0093\u00AA\x7F\u009A\u00EA/\x0B\u00F2\u008BmQ\u00B2\u00CB\u00C1\x05\x14\u00A1B\u009B4\u00E7\u00BE`\u00E9'\u0089C\"\u008F\u00C6\u0094e\x15\u00CF;5\u0097\u00D3\u00D8\u00BEK8\x03c\nH\u00CF\u00F1\\~p\u00C43\u00D5\u00A6\u00BA\u0096g\u00F0\x00n\u00D4\u00DD\u00BC\x01\u0083\u00C00N\x1D'\x17\u00A7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u0091A\n\x00 \b\x04\u00D7\u00E8y=w\x1F\x18\u00DD\"\u0088\u008A\u00F6 \u00E8\x1CDQ\u00E6\u00B0\x02bl\u00EA\x1B\u00FE\u00E0(\x05\u00E1\u00B0e\u00DE\u00E5\u00C8\u00CB\u00BD>\u00C3\x14F\x10V\u00BC\u00C1\u00D3A>\u00C5\u00A1PN\x07\u00B6\u00D4\x03\u00D5k\u00EB\u00D8\u00F0\x00\x00\x00\x00IEND\u00AEB`\u0082",
      right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00BIDATx\x01\u00ED\u00D21\n\x00 \b\u0085\u00E1\u009F\u00E8x\x1D\u00D7\x03\u00B64\x05eR\r\u00A2\x1F\u00B8\u0088\u0088\u00E0\u0083(\u00DA(\u00EA\u00C1\u00E0\u008E\u00CC\u008D\u00C2c\u00B9\u00F0\u009E\u00F6e\u00C1\u00E8\u00DB\u0085Z\u00DEV2\u0087\u009Erh\u00CE\u009B_\x1D\u008Az\x04'\u00A8\u00DBn\x02\x00\x00\x00\x00IEND\u00AEB`\u0082",
      bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00AIDATx\x01\u00ED\u00D4\u00BB\t\x00 \fE\u00D1\u00AB8^\u00C6u@\u00C1J\x04QI\n\u0091w\u00BA@H\u0091\x1F\x04KSl\u008B\u00BC\u00CA\u00A1L0\x15\u00F4+\u00DC\u00D9n\u0081\u0086\u00A2\u0082_\x1A\u00FF\u00A1\u00E1\u00D3\u00AF\u00E5\u00FD\x1E6\u00F2V\x03!\u00F9\x1A\u00B8\u00E3\x00\x00\x00\x00IEND\u00AEB`\u0082",
      left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00AIDATx\x01\u00ED\u00D21\n\x000\b\x03\u00C0P\u00FA\u00BC>7\x0F\u00EC\u00D25\x1DTD\u00C1\x03'A\x05\x03tq^\u00B9m\u00E8\x05?T\u008D\u0085`3\u00D0O}\u00990J\u00BB\u00D0\x1ArNl\n\x0E\f\u00CFa}\x17\u00A2\u00DA\x04'\u00DAn\x0F\u008F\x00\x00\x00\x00IEND\u00AEB`\u0082",
      horizontal_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00GIDATx\x01\u00ED\u0094Q\n\x00 \bCg\u00E7\u00EB\u00B8\x1D\u00B0\u009F\u00E8Kr\u0084\u0090\u00A4\x0F\u00FCQ\x18\x0E\u00C6\x00\u008E\u00BE\u00C6\u00A4\u00C1\x19wA9\u00DC,\u008BC[\u00C6\u00B7\u009CP\u0090\u00E5]\u00B0E\u00F9\u00E4\u0086\u009D\u00C9\u008AM@A\u0096\u008F\nv\x02V\u00CC\x03\u00E9\f\x0E\u00E2\u00D7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      vertical_center: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00IIDATx\x01\u00E5\u00D2A\n\x00 \b\x04\u00C0-z\u009E\u00CF\u00ED\u0081\u00D1!\u0088@,\u00D8@tN\u00E5A\\\x14H\u00A7\u00E0\u008D(\u00F5\u00BE\x1E\x15d\u00F4\u0086\u00ED\u00F8\u009B\u0091,\u00FE#\u00CF-\x0B\u0088\u00BEL\u00B8\u00B3\u0096\x12\u00F0\x0E\u00AF\u00EFM\u00E3?rB\x03t\u0098\x05\x1E\u0089\n~G\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_top: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0097IDATx\x01\u00ED\u0092M\x0E@@\f\u0085k\u00C2\u00C2!,lH\u00B8\u0083\u008Ds\u00938\u0084\u00B5[\u00B0\u00B1P\u00F2H#D+\u0093\u00D8\u00F8\u0092\u0097i\u009Fj\u00E6\u00A7D\u009E\tD\x1C\u00B1*\u00C4\x1DkF\\\u00B3bzfb5N\x18\x19~\\\u0095\x0B_\u00D3\u00EC\u00A8\u00DB\x1B&\u00ACT|L\u00E1\u0099qbwg\n\u00AC#\u00E9\u00D8\u00EA\u00F6;,a\u0094\u00C8\x07\u00E4\x03\x19\t\u00B1\u00F6\u00A2\u00B1\u00CC\u00CD8\u00F2L\u00A8\u00A8y=6w\u00BC\x1A\x1Boh\x1A\u009A\u00C6Fs\u0087-\x19\u00F8\u00E4\u00C8&\u00FE\u00B1\u00D9\u009E~\u00BC\u00F04h\u00EBl,\x0B\u0093\x17\u00CFc \n\u00BA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_right: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0088IDATx\x01\u00ED\u00919\n\u00800\x14D\u00C7\u00AD\x10<\u0080\u00D8Y\x0B^\u00C2s{\r\x0B\x0B\x1B\x0F X\u00C4BQG\u0089\x10\u00C4&\u008B]\x1E<H\u00F2\u00C3\x14\x7F\x00\u00C7D0\u00A7\u00A25\u00DD\u00E8\u00EC\"0\u00A3\x05\u00CDiB'\u00BA\x07r\u00D8\u00D0\x14v,\u00B4\r\u00E5\u00E5\u0080=wF\x00s\u00AE\x1D\u0096\u00F2<\u00D0\u009En1\u00CC\x11t\u00A5\x1D\x1D\u00F1\x17_\u00A5\u00DC\u00CBU\u00FEh\u00CD\u009ER\u00D4\u0086\u00DFmk\u00CDB8\u00C6\x07\u00FA@\u008B@\u00A1\u00BC\u0089\u00D7\x1F\u00D3\u0099\x1BN\x18\u00BD\x1B=\u00BCq\u00FE\u00E7\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_bottom: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0097IDATx\x01\u00ED\u0092\u00BD\x0E@@\x10\u0084\u00C7O\u00A3\u00D4*\x15\n\u00AF\u00E1\u00B9y\x0B\u008D\u0082\u0082NO\u00A3pX\u00C2E\u00D8\u00BD\\\u00A2\u00F1%\u0093\u00CD\u00AE\u00BD\u00CB\u008D\f`\x19G\u00EB3\u00AA\u00B96\x0B\u00F0\u00CE\u00B8\u009C\u00F3\u00B5\u00E1\u00DDA\u00CEe\u00C7\u009E\x0B\u00CBp.\x1C\u00C0c\u00DD\u00F3\x19\u008B\x05\x04|bY\x04\u00C7\u00B2(6\u009C\x17\u00FE\u00B1y\u00C6\u00BAe\u008Fj\u00AC\x14)\u0085\u00D4O\u00D4\u00F7\x10\u00B2[Np\u00B5\u009Fb\u00FB'%\fcS\u00DE,TT\u008Db\u00D3*5\u00A7\u008F\u00B5R\x07\x03\\\u00EDE\x03\u00A9:\u00CDE\u00B1\u00B1\u00CE\fO\x13\x1B\u00EE\u00FD@\u00C9\u00F1\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_spacing_left: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00\u0088IDATx\x01\u00ED\u0091;\n\u00800\x10D\u00D7\u00A8\u0085\u008D7\u00B0\u00B0\u00F1\x10\u00B6\u009E\u00DBcX{\x00\x1B\u00AB\u0088\u0085\u009F!l \x04\u009Bl\x026y\u00F0\b\u00EB\u0086A\x1D\u00A2\u00C4\u0094\u00DE\u00DC\u00C1\x11^p'\x01\x15\u009F5\x1C`\u00CFsCB\n>\u00A7\u0098\x10\u00E6\u0080\u00B3\u00E2\u00E1\u00A1xL\u0086}C\u00FF\u0093\x17\u00B8\u0092\x00[\u00CA\r7\u00A8a\x0BO\u009E\u00FF\u00E7\u00AB\x14\u00F3s\u009D;A;[\u008A\u00DB\u00B0\u00DFv\u00D0NQbr`\x0E\u008C\b\u00D4\u00CE3\u00ED\u00DD\u0091\u00EE\u00D2\u00F0\x02%T\x19\u0086\x0F\x15\u00EF\u00BA\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_x: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00QIDATx\x01\u00E5\u0094\x01\x06\x00 \fE\u00BFt\u00BC\u008E\u00DB\x01#\u008D)k\u00CAb\u00DA#*\u0089\u00FFf\x03V\u00CAX;\u00C47\t\u00C6\u0098\x7F\u0098\u00D9~\u008E@\u00E7\u008A\x03\u00FCG~\u00EAP\u00A3(w\u00DDu@\u0087\x7FU\u0099w\u008C\u00D8E\u00C1\x1D\u0092\u008F\u00AB)C\u00F8\u008F\u00DC\x00\u00A7(\x07_\u00FA\u00BA\u00BBy\x00\x00\x00\x00IEND\u00AEB`\u0082",
      distribute_y: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x14\x00\x00\x00\x14\b\x06\x00\x00\x00\u008D\u0089\x1D\r\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x00EIDATx\x01\u00ED\u0092Q\n\x00 \bCW\u00E7\u00F3\u00B8\x1D0\u00FA\u00E9#\u00B0 &\f\u00F1}*\u008An\x03\u00D4i\u008F\u00BE9\u00F5\u00E1\rt\u0090\u00A1/\\/\x1B\u0088\u0084\\x#\u00A1)\u00FA\u009C\u00A6\u00FCFh\u009BT\u00C1\x16\u00D4P\u009F\t\x12[\x04\u00AF=y\x06\u00F5\x00\x00\x00\x00IEND\u00AEB`\u0082",
      refresh: "\u0089PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x10\x00\x00\x00\x10\b\x06\x00\x00\x00\x1F\u00F3\u00FFa\x00\x00\x00\tpHYs\x00\x00\x0B\x13\x00\x00\x0B\x13\x01\x00\u009A\u009C\x18\x00\x00\x00\x01sRGB\x00\u00AE\u00CE\x1C\u00E9\x00\x00\x00\x04gAMA\x00\x00\u00B1\u008F\x0B\u00FCa\x05\x00\x00\x01\x13IDATx\x01\u00A5\u0093Kk\u00C2P\x10\u0085\u00A7y\x14\u00EC\u00CBnJ\x0B\u00AD\u0094JqSh\u00A1\x1B\u00FF\u00FF\u00D6_ \u00EED\x11E\x03\u00D1\u0085\"\t\u00EA9x\"\u0097x\u0083\x01\x07\u00BE<n\u00CE\u009C;\u0093L\u00CC\u00AE\u008C\u00B0\u0086\u00A6\t>A\x04\u00F6 \u00BBd\u00F0\x01\u00D6`\u00A7{&w\u00C0;\u00F8\u00D2Z\u00E23x\x03]\u00D0Rr\u00E2\u0088\x07`\x06\x02\u00D0\x06\u00AF`B]\u00A8\x12\u00FF\u00C17\u0088\u0095\u00F4\x04\u0086N\x15\u008C\u00ADL2m\u00C2\u00DC9\x0F\u00BF\u00E0\x19\u00F4\u00C1\u00A3\u00C4\u00B1\x12R;\u008FT\u00CF\u00D9\u00CE8T)\u00DC\u00EDV\u00FD\u00F6\u00C0\x1Dx\u00A0\u00C0\u00FC\u0091\u00AA\u00E2,\u00D0B\u00AE\u00B2\u008B\u009EG\u00CE\u00BD/\u00D8\u00C6\u008A\u009A\u00A8B0\u00B6\u00EA\u00DD]\u00938p\x16r\u009D#\u00AB\x17l3s\r\u0096:\u00B7j&7\u00C0\u00D45HD\u00BBF\x15?v\x1C\u00B6\u00A4<\u0089\x1B;~\u009E\x17\u00B0\u00B0\u00D2\u00D8:\u00C9\u009CV\x0E\u00D7\u00FC\u00C6#`\x0B\x7F2\u009B\nVt/\u00F3\u0086\u0092\u0089\u00F9\fL\u00A2\u008E\u009D\u00BF\u008Fb\u00ACO\u00FFB\u0095A\x11\u00DC\u00B9\u00A9k\u00BE\u00E4\u00BC,8\x00\u00BD\x0E<\u00E5\u00A4\u0094@'\x00\x00\x00\x00IEND\u00AEB`\u0082",
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
  
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_spacing_top', helpTip: 'Distribute Spacing To Top', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_spacing_bottom', helpTip: 'Distribute Spacing To Bottom', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignThirdGroup, { method: 'distribute_spacing_right', helpTip: 'Distribute Spacing To Right', onClick: onClickButtonAlign });
  
  var panelExtraAlignFourGroup = panelExtraAlign.add('group');
  panelExtraAlignFourGroup.orientation = 'row';
  panelExtraAlignFourGroup.spacing = uiSettings.button.spacing;

  createIconButton(panelExtraAlignFourGroup, { method: 'distribute_spacing_left', helpTip: 'Distribute Spacing To Left', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignFourGroup, { method: 'distribute_x', helpTip: 'Distribute Horizontal', onClick: onClickButtonAlign });
  createIconButton(panelExtraAlignFourGroup, { method: 'distribute_y', helpTip: 'Distribute Vertical', onClick: onClickButtonAlign });
  
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
  // keyObjectDropdownListGroup change items
  changeKeyObjectDropdownListGroupItems();
}

checkSettingFolder();
loadSettings();

if (!uiSettings.window.location[0] && !uiSettings.window.location[1]) {
  win.center();
}
win.show();
// win.active = true;