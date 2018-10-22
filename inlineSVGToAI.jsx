/* 

  Program version: Adobe Illustrator CS5+
  Name: inlineSVGToAI.jsx;

  Author: Alexander Ladygin, email: i@ladygin.pro
  Thanks for refactoring and testing - Sergey Osokin, email: hi@sergosokin.ru
  Copyright (c) 2018

  ***

  Instruction for use:
    1. Run script
    2. Paste your svg code in textarea
    3. Press button "Paste"
*/

#target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

function main() {
  if (app.documents.length == 0) {
    alert("Error: \nOpen a document and try again.");
    return;
  }
  uiDialog().show();
}

// Create dialog window
function uiDialog() {
  var win = new Window("dialog", "Inline SVG To AI \u00A9 www.ladygin.pro", undefined),
    winPanel = win.add("panel");
    winPanel.alignChildren = ['fill', 'fill'];

  // Field for pasting the SVG code
  var winSVGCodeTitle = winPanel.add("statictext", [0, 0, 200, 15], "Please paste your svg code:"),
    SVGCode = winPanel.add("edittext", [0, 0, 200, 50], "", { multiline: true, scrolling: true }),
    insertOpen = winPanel.add("checkbox", undefined, 'Insert through "Open" (without crash AI)');
  insertOpen.value = true;
  SVGCode.active = true; // Set state

  // Buttons
  var winButtonsGroup = win.add("group"),
    closeButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Cancel"),
    pasteButton = winButtonsGroup.add("button", [0, 0, 100, 30], "Paste");


  // Close window
  closeButton.onClick = function () {
    win.close();
  };

  // Paste button action
  pasteButton.onClick = function () {
    var code = SVGCode.text;
    if (code) {
      importSVG(code);
      win.close();
    } else {
      alert("You didn't insert the SVG code.");
    }
  };

  function importSVG(string) {
    var svgFileName = "inlineSVGtoAI.svg",
      svgFile = new File("" + Folder.temp + "/" + svgFileName),
      backDoc = activeDocument;
  
    svgFile.open("w");
    svgFile.write(string);
    svgFile.close();
    if (!insertOpen.value && (activeDocument.importFile instanceof Function)) {
      activeDocument.importFile(svgFile, false, false, false);
    }
      else {
        app.open(svgFile);
        var l = activeDocument.layers,
        i = l.length;
        while (i--) { l[i].hasSelectedArtwork = true; }
        app.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
        backDoc.activate();
        app.paste();
      }
    $.sleep(500);
    svgFile.remove();
  }

  return win;
}


function showError(err) {
  if (confirm(scriptName + ": an unknown error has occurred.\n" +
    "Would you like to see more information?", true, "Unknown Error")) {
    alert(err + ": on line " + err.line, "Script Error", true);
  }
}

try {
  main();
} catch (e) {
  showError(e);
}