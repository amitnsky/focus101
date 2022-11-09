const ENABLED = "enabled";
const DISABLED = "disabled";
const filterRules = [];
let mode = ENABLED;
let redirectUrl = "meditopia.com";

const setupContextMenus = () => {
  chrome.contextMenus.create({
    id: ENABLED,
    checked: mode === ENABLED,
    type: "radio",
    contexts: ["all"],
    title: "Enable",
  });

  chrome.contextMenus.create({
    id: DISABLED,
    checked: mode === DISABLED,
    type: "radio",
    contexts: ["all"],
    title: "Disable",
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.contextMenus.onClicked.addListener((clickData) => {
  if (clickData.menuItemId === ENABLED) {
    mode = ENABLED;
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getAllRulesIds(),
      addRules: getAllRules(),
    });
  } else if (clickData.menuItemId === DISABLED) {
    mode = DISABLED;
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getAllRulesIds(),
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.create({
    url: "./home/home.html",
  });
});

/** FILTERING */

const logAllRules = () => {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    console.log("rules: ", rules);
  });
}

logAllRules()

const getAllRulesIds = () => filterRules.map((rule) => rule.id)

const getAllRules = () => filterRules

/*
actions:
BLACKLIST_URL,
WHITELIST_URL,
GET_BLACKLISTED_URLS,
GET_WHITELISTED_URLS
**/

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "BLACKLIST_URL"){
      addRule(request.url, 'block','')
      sendResponse({status: "success"});
    }else if (request.action === "GET_BLACKLISTED_URLS"){
      console.log('received req')
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        console.log('sending response')
        sendResponse({"rules": rules});
      });
      return true
    }
  }
);

const removeAllRules = () => {
  const enabledRulesIds = [];
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    rules.map((rule) => enabledRulesIds.push(rule.id));
  });
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: enabledRulesIds,
  });
};

const removeRule = (id) => {};

const addRule = (url, type, redirectUrl) => {
  const rule = {
    id: Math.floor(Date.now() + Math.random() * 5000)%5000,
    priority: 1,
    action: {
      type: type,
      redirect: {
        url: redirectUrl,
      },
    },
    condition: {
      urlFilter: url,
      resourceTypes: ["main_frame", "sub_frame"],
    },
  };

  console.log('adding rule:', rule, ' for mode', mode)

  filterRules.push(rule);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
    addRules: filterRules
  });

  console.log('updated rules:')
  logAllRules()
};