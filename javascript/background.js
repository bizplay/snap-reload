// Copyright (c) 2014-2015 Bizplay (bizplay.com)

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
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Inspiration for this extension:
// http://zerodeveloper.tumblr.com/post/67664299242/chrome-extension-reload-tab-after-crash
// and
// https://github.com/unclespode/ohnoyoudidnt

// Different ways to test crashes and other problems in Chrome/Chromium:
// In Chrome/Chromium see chrome://about under "For debug", currenlty
// the following options are available:
// chrome://badcastcrash/
// chrome://crash/
// chrome://crashdump/
// chrome://kill/
// chrome://hang/
// chrome://shorthang
// chrome://gpuclean/
// chrome://gpucrash/
// chrome://gpuhang/
// chrome://memory-exhaust/
// chrome://ppapiflashcrash/
// chrome://ppapiflashhang/
// chrome://quit/
// chrome://restart/
//
// Another option is to open the developer tools on a tab that should be
// crashed and in the JavaScript console type:
//
// var memoryHog = "more"; while(true) {memoryHog = memoryHog + "andMore";}
//
// This code will consume so much memory that the tab will crash

// About reloading of tabs; see: https://developer.chrome.com/extensions/tabs
// chrome.tabs.reload(integer tabId, object reloadProperties, function callback)
//   tabId (integer optional): The ID of the tab to reload;
//         defaults to the selected tab of the current window.
//   reloadProperties (object optional): bypassCache (boolean	optional): Whether
//         using any local cache. Default is false.
//   callback (function optional): If you specify the callback parameter,
//         it should be a function that looks like this: function() {...};
//
// For the use case of reloading a kiosk app or tabs that the user is using
// the default of calling chrome.tabs.reload() is best

// Add listener to onExited event that is fired when a tab or
// underlying thread exits
// Parameters:
// exitType (integer): The type of exit that occurred for the process -
// normal, abnormal, killed, crashed. Only available for renderer processes.
// exitCode ( optional integer ): The exit code if the process exited abnormally.
// Only available for renderer processes.
chrome.processes.onExited.addListener(function (processId, exitType, exitCode) {
  console.log("chrome.processes.onExited: processId=" + processId + " exitType=" + exitType + " exitCode=" + exitCode);

  if(exitType !== 0){
    console.log("chrome.processes.onExited:: reloading tab.");
    chrome.tabs.reload();
  }
});

// Add listener to onUnresponsive event that is fired when a tab or
// underlying thread becomes unresponsive
// Parameters:
// process.type enum: type of process -
// "browser", "renderer", "extension", "notification", "plugin", "worker",
// "nacl", "utility", "gpu", "other"
chrome.processes.onUnresponsive.addListener(function (process){
  console.log("chrome.processes.onUnresponsive: id=" + process.id + " os procid=" + process.osProcessId + " type=" + process.type);

  if(process.type === "browser" || process.type === "renderer"){
    chrome.processes.terminate(process.id, function(didTerminate) {
      console.log("chrome.processes.terminate: process termination succeeded: " + didTerminate.toString() + ", reloading tab.");
      chrome.tabs.reload();
    });
  }
});



/*
  The following code is only needed when a specific tabs needs to
  be reloaded
  NOTE: this code is not complete

var tab_id;
var tabToProcess = {};
var processToTab = {};

chrome.browserAction.onClicked.addListener(function (tab) {
    tab_id = tab.id;
    console.log("onClicked.addListener: tab_id=" + tab_id);
    chrome.processes.getProcessIdForTab(tab.id, function (processId) {
      console.log("getProcessIdForTab: tab.id=" + tab.id);
      if (!isNaN(parseFloat(processId)) && isFinite(processId)) {
        // chrome.processes.terminate(processId, function(didTerminate) {
        //   console.log("onClicked.addListener.getProcessIdForTab chrome.processes.terminate(: didTerminate" + toString(didTerminate));
        //   // chrome.processes.terminate
        // });
      }
    });
});

function getTabAndProcessIds(tabs) {
  var tabsLength = 0;
  var tabId = 0;

  if (tabs !== null && tabs !== undefined && tabs.length > 0) {
    tabsLength = tabs.length;
    console.log("getTabsInfo: #Tabs=" + tabsLength);
    for (var i = 0; i < tabsLength; i += 1) {
      aTab = tabs[i];
      chrome.processes.getProcessIdForTab(aTab.id, function(processId) {
        if (tabToProcess[aTab.id.toString()] === undefined || (tabToProcess[aTab.id.toString()] !== undefined && tabToProcess[aTab.id.toString()] !== processId)) {
          tabToProcess[aTab.id.toString()] = processId;
        }
        if (processToTab[processId.toString()] === undefined || (tabToProcess[processId.toString()] !== undefined && processToTab[processId.toString()] !== aTab.id)) {
          processToTab[processId.toString()] = aTab.id;
        }
      });
    }
  }
}

function getTabsInfo(tabs) {
  var tabsLength = 0;
  var tabId = 0;

  if (tabs !== null && tabs !== undefined && tabs.length > 0) {
    tabsLength = tabs.length;
    for (var i = 0; i < tabsLength; i += 1) {
      aTab = tabs[i];
      console.log("getTabsInfo: i=" + i + " tab.id=" + aTab.id);
      tabId = chrome.processes.getProcessIdForTab(aTab.id, function(processId) {
        console.log("getTabsInfo: processId=" + processId);
      });
      console.log("getTabsInfo: tabId=" + tabId);
    }
  } else {
    console.log("getTabsInfo: tabs null/undefined/empty");
  }
}

// Check now and once a minute on all tabs to have current processIds
chrome.tabs.query({}, getTabAndProcessIds);
var tabAndProcessPID = setInterval(function() {
    chrome.tabs.query({}, getTabAndProcessIds);
}, 60000);

chrome.tabs.query({}, getTabsInfo);
*/
