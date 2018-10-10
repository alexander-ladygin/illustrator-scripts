/* 

  Author: Alexander Ladygin (i@ladygin.pro)
  Program version: Adobe Illustrator CC+
  Name: forceCloseOtherDocuments.jsx;
  Copyright (c) 2018

*/
function getCustomNumbers ($str, items, returnItems) {
  var __num = $str.replace(/ /g, '').replace(/[^-0-9^,]/gim,'').split(','),
      $maxItems = items.length,
      j = __num.length,
      arr = [];

  function getNumbersBetweenMinMax (min, max) {
      var numbers = [];
      for (var n = min; n <= max; n++) {
          if (n < $maxItems) {
            numbers.push(returnItems ? items[n] : n);
          }
      }
      return numbers;
  }

  while (j--) {
      if (__num[j].indexOf('-') > -1) {
          var values = __num[j].split('-'),
              min = parseInt(values[0]),
              max = parseInt(values[1]);

          if (!isNaN(min) && !isNaN(max)) arr = arr.concat(getNumbersBetweenMinMax(min - 1, max - 1));
      }
          else {
              var __val = parseInt(__num[j]);
              if (!isNaN(__val) && __val <= $maxItems) {
                  arr.push(returnItems ? items[__val - 1] : __val - 1);
              }
          }
  }

  return arr;
}

function __documentsClose (save_options, userOptions) {
    // documentsDontClose => [Document] || [Array]

    var options = {};
    options.not = userOptions.not || [];
    options.document = userOptions.document || null;

    if (app.documents.length) {
        save_options = (typeof save_options === 'string' && save_options.length ? save_options : 'PROMPTTOSAVECHANGES').toLowerCase();

        if ((save_options.slice(0, 1) === 'n') || (save_options.slice(0, 1) === 'd')) save_options = 'DONOTSAVECHANGES';
          else if (save_options.slice(0, 1) === 's') save_options = 'SAVECHANGES';
            else save_options = 'PROMPTTOSAVECHANGES';

        options.not = (options.not.typename === 'Document' ? [options.not] : options.not.typename === 'Documents' ? options.not : options.not);
        var l = options.not.length;

        if (!options.documents) {
            var i = app.documents.length;
            while (i--) {
                var check = true;
                for (var j = 0; j < l; j++) { if (app.documents[i] === options.not[j]) check = false; }
                if (check) app.documents[i].close(SaveOptions[save_options.toUpperCase()]);
            }
        }
        else {
            options.document.close(SaveOptions[save_options.toUpperCase()]);
        }
    }
      else {
        throw new Error('Documents not found!');
      }
};

function __documentsForceCloseOther (documentsDontClose) {
    if (app.documents.length) {
        documentsDontClose = documentsDontClose instanceof Array ? documentsDontClose.concat([app.activeDocument]) : [app.activeDocument];
        return __documentsClose('not', {
            not: documentsDontClose
        });
    }
      else {
        throw new Error('Documents not found!');
      }
};

function getDocumentToList() {
  var result = [], l = app.documents.length;
  for (i = 0; i < l; i++) {
    result.push((i + 1) + '. ' + app.documents[i].name);
  }
  return result;
}

var win = new Window('dialog', 'Force close others', undefined);
  win.orientation = 'column';
  win.alignChildren = ['fill', 'fill'];

var panel = win.add('panel', undefined, 'Exclude documents:');
  panel.orientation = 'column';
  panel.alignChildren = ['fill', 'fill'];
  panel.margins = 20;

var inputPlaceholder = panel.add('statictext', undefined, 'Example: "1, 2, 3" or "1, 2-5, 9"'),
  inputDocuments = panel.add('edittext', undefined, 1);

var docGroup = panel.add('group');
  docGroup.orientation = 'row';


var docPlaceholder = docGroup.add('statictext', undefined, 'Only read'),
  docList = docGroup.add('dropdownlist', undefined, getDocumentToList());
  docList.selection = 0;

var winButtons = win.add('group');
  winButtons.orientation = 'row';
  winButtons.alignChildren = ['fill', 'fill'];

  var ok = winButtons.add('button', undefined, 'OK');
  ok.helpTip = 'Press Enter to Run';
  ok.onClick = startAction;
  ok.active = true;
  
var cancel = winButtons.add('button', undefined, 'Cancel');
  cancel.helpTip = 'Press Esc to Close';
  cancel.onClick = function () { win.close(); }

win.center();
win.show();

function startAction() {
  if (app.documents.length) {
    __documentsForceCloseOther(getCustomNumbers(inputDocuments.text, app.documents, true));
  }
  win.close();
}