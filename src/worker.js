const EXTENSION_STATUS = "EXTENSION_STATUS";
const FILTER_RULES = "FILTER_RULES";
const ENABLED = "ENABLED";
const DISABLED = "DISABLED";

chrome.runtime.onInstalled.addListener(async () => {
  persistExtensionState(DISABLED);
  persistRules([]); // just in case there was a jombie rule
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.create({
    url: "./home/home.html",
  });
});

const persistExtensionState = (status) => {
  chrome.storage.sync.set({ [EXTENSION_STATUS]: status });
};

const persistRules = async (rules) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [FILTER_RULES]: rules }, function () {
      resolve(rules);
    });
  });
};
