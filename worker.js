const WHITELIST_MODE = "whitelist_mode";
const BLACKLIST_MODE = "blacklist_mode";
const DISABLED_MODE = "disabled_mode";
const whitelistedRules = [];
const blacklistedRules = [];
let mode = BLACKLIST_MODE;
let redirectUrl = "meditopia.com";

const setupContextMenus = () => {
  chrome.contextMenus.create({
    id: BLACKLIST_MODE,
    checked: mode === BLACKLIST_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Blacklist Mode",
  });

  chrome.contextMenus.create({
    id: WHITELIST_MODE,
    checked: mode === WHITELIST_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Whitelist Mode",
  });

  chrome.contextMenus.create({
    id: DISABLED_MODE,
    checked: mode === DISABLED_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Disable Filtering",
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.contextMenus.onClicked.addListener((clickData) => {
  if (clickData.menuItemId === WHITELIST_MODE) {
    mode = WHITELIST_MODE;
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getAllRulesIds(),
      addRules: whitelistedRules,
    });
  } else if (clickData.menuItemId === BLACKLIST_MODE) {
    mode = BLACKLIST_MODE;
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getAllRulesIds(),
      addRules: blacklistedRules,
    });
  } else if (clickData.menuItemId === DISABLED_MODE) {
    mode = DISABLED_MODE;
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

const getAllRulesIds = () => [
  ...whitelistedRules.map((rule) => rule.id),
  ...blacklistedRules.map((rule) => rule.id),
];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "ADD_BLACKLIST_URL"){
      addRule(request.url, 'block','')
      sendResponse({status: "success"});
    }else if (request.action === "GET_FILTERED_URLS"){
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
  const enabledRules = [];
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    rules.map((rule) => enabledRules.push(rule));
  });
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: enabledRules,
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

  mode === WHITELIST_MODE ? whitelistedRules.push(rule) : blacklistedRules.push(rule);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
    addRules: mode === WHITELIST_MODE ? whitelistedRules : blacklistedRules
  });

  console.log('updated rules:')
  logAllRules()
};