// batchTextEdit.jsx
// adobe Illustrator CSx script
// for editing the contents of the text frames all together.
//
// Usage:
// 1. Select the textframe(s) and run this script.
// 2. Edit the contents in the dialog. Then hit OK button.
//
// Notice:
// * The attribute of the first character is applied to whole
//   contents of textframe if you run this script for it.
//   It is assumed that each contents is plain text.
// 
// * For the multiline contents, the return code characters are
//   replaced to the alternative ones (default:"@/") in the dialog.
//   When applying the edited contents, they are replaced to
//   the return code. This means you can't use "@/" itself in the
//   contents. You can change it in the setting part of the script.
//
// * The order of the texts in the dialog depends on the rectangle
//   area surrounding each top-left corner of the selected textframes.
//   If the width of the area is greater than the height of it, the
//   order is from left to right. Otherwise from top to bottom.

// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Sorting options by Alexander Ladygin

main();

function main() {
    // - settings -------------
    // return code alternative character(s) used while editting
    const return_code_alt = "@/";

    // return code that used in regexp (escape the characters if it needs)
    const return_code_alt_for_rex = return_code_alt;

    // edittext size
    const edittext_width = 200;
    const edittext_height = 200;

    // - settings end -------------
    // ----------------------------
    if (app.documents.length < 1) return;

    // show a dialog
    var win = new Window("dialog", "batchTextEdit");

    // add edittext
    var et_opt = {
        multiline: true,
        scrolling: true
    };
    var ver16 = (app.version.substr(0, 2) > "15");
    if (ver16) et_opt.wantReturn = true;

    var et = win.add("edittext", [0, 0, edittext_width, edittext_height], "", et_opt);
    var sortByTree = win.add('checkbox', [0, 0, edittext_width, 30], 'Sort by [Layers] tree\ninstead of visual order'),
        sortReverse = win.add('checkbox', [0, 0, edittext_width, 15], 'Reverse display order');

    // get textframes in the selection
    var tfs = [], tfsSort = [], tfsOriginal = []; // textframes
    extractTextFramesAsVTextFrameItem(app.activeDocument.selection, tfs, tfsOriginal, tfsSort);
    if (tfs.length < 1) {
        alert("Please select textframes");
        return;
    }

    // sort tfs
    sortVTextFramesReasonableByPosition(tfs);

    // get the contents of tfs
    var conts = [];
    function getConts() {
        conts = [];
        var rex_return_code = new RegExp("\r", "g");
        for (var i = 0; i < tfs.length; i++) {
            conts.push(tfs[i].tf.contents.replace(
                rex_return_code, return_code_alt));
        }
    }

    getConts();

    sortReverse.onClick = function () {
        tfs.reverse();
        getConts();
        et.text = conts.join("\n");
        win.update();
    };
    sortByTree.onClick = sortCheckboxes;

    function sortCheckboxes (__reverse) {
        if (sortByTree.value) tfs = tfsOriginal;
            else tfs = tfsSort;

        sortVTextFramesReasonableByPosition(tfs);
        if (sortReverse.value) tfs.reverse();
        getConts();
        et.text = conts.join("\n");
        win.update();
    }

    et.text = conts.join("\n");
    et.active = true;

    // add statictext
    var st_text = "* \"" + return_code_alt + "\" means a return code"
    if (!ver16) st_text += "\r* Use ctrl+enter for new line"
    win.add("statictext", undefined, st_text, {
        multiline: true
    });


    // add buttons
    var gr = win.add("group");
    var btn_ok = gr.add("button", undefined, "OK");
    var btn_cancel = gr.add("button", undefined, "Cancel");
    btn_ok.onClick = function() {
        replaceContents(tfs, et.text.split("\n"),
            new RegExp(return_code_alt_for_rex, "g"));
        win.close()
    };

    win.show();
    // --------------------------------------------------
    function vTextFrameItem(tf) {
        // virtual textframe for comparing the each position
        this.tf = tf;
        if (tf.kind == TextType.POINTTEXT) {
            this.left = tf.left;
            this.top = tf.top;
        } else {
            var tp = tf.textPath;
            this.left = tp.left;
            this.top = tp.top;
        }
    }
    // --------------------------------------------------
    function replaceContents(tfs, et_texts, rex_return_code_alt) {
        while (et_texts[et_texts.length - 1 ] == "") et_texts.pop();
    
        for (var i = 0; i < tfs.length; i++) {
            if (i >= et_texts.length) break;
    
            tfs[i].tf.contents = et_texts[i].replace(rex_return_code_alt, "\r");
        }
    }
    // --------------------------------------------------
    function sortVTextFramesReasonableByPosition(tfs) {
        if (!sortByTree.value) {
            var rect = [];
            // reft, top, right, bottom
            getVTextFramesRect(tfs, rect);
        
            if (rect[1] - rect[3] < rect[2] - rect[0]) { // height < width
                // left -> right || top -> bottom
                tfs.sort(function(a, b) {
                    return a.left == b.left ?
                        b.top - a.top :
                        a.left - b.left
                });
            } else {
                // top -> down || left -> right
                tfs.sort(function(a, b) {
                    return a.top == b.top ?
                        a.left - b.left :
                        b.top - a.top
                });
            }
        }
    }
    // --------------------------------------------------
    function getVTextFramesRect(tfs, rect) {
        // get the rect that includes each top-left corner of tfs
        var top, left;
    
        for (var i = 0; i < tfs.length; i++) {
            top = tfs[i].top;
            left = tfs[i].left;
    
            if (i == 0) {
                // reft, top, right, bottom
                rect.push(left);
                rect.push(top);
                rect.push(left);
                rect.push(top);
            } else {
                rect[0] = Math.min(rect[0], left);
                rect[1] = Math.max(rect[1], top);
                rect[2] = Math.max(rect[2], left);
                rect[3] = Math.min(rect[3], top);
            }
        }
    }
    // --------------------------------------------------
    function extractTextFramesAsVTextFrameItem(s, r, _r, __r) {
        // s is an array of pageitems ( ex. selection )
        for (var i = 0; i < s.length; i++) {
            if (s[i].typename === "TextFrame") {
                r.push(new vTextFrameItem(s[i]));
                _r.push(new vTextFrameItem(s[i]));
                __r.push(new vTextFrameItem(s[i]));
            } else if (s[i].typename == "GroupItem") {
                extractTextFramesAsVTextFrameItem(s[i].pageItems, r, _r, __r);
            }
        }
    }
}