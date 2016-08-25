// Photoshop Script to Create iPhone Icons from iTunesArtwork
//
// WARNING!!! In the rare case that there are name collisions, this script will
// overwrite (delete permanently) files in the same folder in which the selected
// iTunesArtwork file is located. Therefore, to be safe, before running the
// script, it's best to make sure the selected iTuensArtwork file is the only
// file in its containing folder.
//
// Copyright (c) 2010 Matt Di Pasquale
// Added tweaks Copyright (c) 2012 by Josh Jones http://www.appsbynight.com
// Updated for iPhone 6 Plus Copyright (c) Winona Tong
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// Prerequisite:
// First, create at least a 1024x1024 px PNG file according to:
// http://developer.apple.com/library/ios/#documentation/iphone/conceptual/iphoneosprogrammingguide/BuildTimeConfiguration/BuildTimeConfiguration.html
//
// Install - Save Create Icons.jsx to:
//   Win: C:\Program Files\Adobe\Adobe Utilities\ExtendScript Toolkit CS5\SDK
//   Mac: /Applications/Adobe Photoshop CS6/Presets/Scripts
// * Restart Photoshop
//
// Update:
// * Just modify & save, no need to resart Photoshop once it's installed.
//
// Run:
// * With Photoshop open, select File > Scripts > Create Icons
// * When prompted select the prepared iTunesArtwork file for your app.
// * The different version of the icons will get saved to the same folder that
//   the iTunesArtwork file is in.
//
// Adobe Photoshop JavaScript Reference
// http://www.adobe.com/devnet/photoshop/scripting.html


// Turn debugger on. 0 is off.
// $.level = 1;

var dlg = new Window("dialog{text:'Create App Icons',bounds:[100,100,500,250],\
warningText:StaticText{bounds:[25,80,380,200] , text:'* If the image is vector-based it can be smaller than 1024x1024, otherwise it is a really good idea for the file to be at least 1024x1024 pixels in size.' ,properties:{multiline:true}},\
dropDownLabel:StaticText{bounds:[17,16,200,38] , text:'Create icons for' ,properties:{multiline:true}},\
};");

dlg.cancelBtn = dlg.add('button', [255,40,375,63], 'Abort', {name:'cancel'});
dlg.selectImgBtn = dlg.add('button', [255,13,375,35], 'Select an image*', {name:'ok'});

var platformOptions = []; 
platformOptions[0] = "iOS App";
platformOptions[1] = "pre-iOS 6.1 App";
platformOptions[2] = "Mac App"; 

dlg.dropdownlist = dlg.add("dropdownlist", [130,13,220,35]);

for (var i=0,len=platformOptions.length;i<len;i++)  {
    dlg.dropdownlist.add ('item', "" + platformOptions[i]);      
}

var destPlatform = 0;
dlg.dropdownlist.selection = dlg.dropdownlist.items[destPlatform];

dlg.dropdownlist.onChange = function() { 
   destPlatform = parseInt(this.selection);
}

dlg.center();
var returnValue = dlg.show();

if (returnValue == 1) {
    try {
        // Prompt user to select an image file. Clicking "Cancel" returns null.
        var iTunesArtwork = File.openDialog();

        if (iTunesArtwork !== null) { 
            var doc = open(iTunesArtwork);

            if (doc == null) {
                throw "Something is wrong with the file.  Make sure it's a valid PNG file.";
            }

            var startState = doc.activeHistoryState;       // save for undo
            var initialPrefs = app.preferences.rulerUnits; // will restore at end
            app.preferences.rulerUnits = Units.PIXELS;     // use pixels

            if (doc.width != doc.height) {
                throw "Image is not square";
            }

            // Folder selection dialog
            var destFolder = Folder.selectDialog( "Choose an output folder");

            if (destFolder == null) {
                // User canceled, just exit
                throw "";
            }

            // Save icons in PNG using Save for Web.
            var sfw = new ExportOptionsSaveForWeb();
            sfw.format = SaveDocumentType.PNG;
            sfw.PNG8 = false; // use PNG-24
            sfw.transparency = false;
            doc.info = null;  // delete metadata

            var icons;

            // String check rather than using magic numbers
            if (platformOptions[destPlatform] == "iOS App") {
                sfw.transparency = false;
                icons = [
                    {"name": "iTunesArtwork",    "size":512},
                    {"name": "iTunesArtwork@2x", "size":1024},
                    {"name": "Icon-60@2x",       "size":120},
                    {"name": "Icon-60@3x",       "size":180},
                    {"name": "Icon-76",          "size":76},
                    {"name": "Icon-76@2x",       "size":152},
                    {"name": "Icon-Small-40",    "size":40},
                    {"name": "Icon-Small-40@2x", "size":80},
                    {"name": "Icon-Small-40@3x", "size":120},
                    {"name": "Icon-Small",       "size":29},
                    {"name": "Icon-Small@2x",    "size":58},
                    {"name": "Icon-Small@3x",    "size":87}

                    ];
            } else if (platformOptions[destPlatform] == "pre-iOS 6.1 App") {   
                sfw.transparency = false;
                icons = [
                    {"name": "Icon",             "size":57},
                    {"name": "Icon@2x",          "size":114},
                    {"name": "Icon-72",          "size":72},
                    {"name": "Icon-72@2x",       "size":144},
                    {"name": "Icon-Small",       "size":29},
                    {"name": "Icon-Small@2x",    "size":58},
                    {"name": "Icon-Small-50",    "size":50},
                    {"name": "Icon-Small-50@2x", "size":100}
                    ];
                    
            } else {
                sfw.transparency = true;
                icons = [
                    {"name": "icon_16x16",             "size":16},
                    {"name": "icon_16x16@2x",          "size":32},
                    {"name": "icon_32x32",             "size":32},
                    {"name": "icon_32x32@2x",          "size":64},
                    {"name": "icon_128x128",           "size":128},
                    {"name": "icon_128x128@2x",        "size":256},
                    {"name": "icon_256x256",           "size":256},
                    {"name": "icon_256x256@2x",        "size":512},
                    {"name": "icon_512x512",           "size":512},
                    {"name": "icon_512x512@2x",        "size":1024},
                ];
            }

            var icon;
            for (i = 0; i < icons.length; i++) {
                icon = icons[i];
                doc.resizeImage(icon.size, icon.size, null, ResampleMethod.BICUBICSHARPER);

                var destFileName = icon.name + ".png";

                if ((icon.name == "iTunesArtwork@2x") || (icon.name == "iTunesArtwork")) {
                    // iTunesArtwork files don't have an extension
                    destFileName = icon.name;
                }

                doc.exportDocument(new File(destFolder + "/" + destFileName), ExportType.SAVEFORWEB, sfw);
                doc.activeHistoryState = startState; // undo resize
            }

            alert(platformOptions[destPlatform] + " icons created!");
        }
    } catch (exception) {
        // Show degbug message and then quit
        if ((exception != null) && (exception != "")) {
            alert(exception);
        }
    } finally {
        if (doc != null) {
            doc.close(SaveOptions.DONOTSAVECHANGES);
        }

        app.preferences.rulerUnits = initialPrefs; // restore prefs
    }
}