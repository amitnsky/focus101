const EXTENSION_STATUS = "EXTENSION_STATUS";
const FILTER_RULES = "FILTER_RULES";
const ENABLED = "ENABLED";
const DISABLED = "DISABLED";

const filterRules = [];
let mode = ENABLED;
let redirectUrl = "meditopia.com";

chrome.runtime.onInstalled.addListener(async () => {
  await init();
  setExtensionStatus(mode);
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.create({
    url: "./home/home.html",
  });
});

const init = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([EXTENSION_STATUS], function (mode_val) {
      if (!mode_val || !mode_val[EXTENSION_STATUS]) {
        mode = DISABLED;
      } else {
        mode = mode_val[EXTENSION_STATUS];
      }
      resolve(mode);
    });
  });
};

const setExtensionStatus = (status) => {
  mode = status;
  persistExtensionState(status);
  if (status === ENABLED) {
    enableExtension();
  } else {
    disableExtension();
  }
};

const enableExtension = async () => {
  await loadRules();
  getActiveRulesIds().then((ruleIds) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
      addRules: getAllRules(),
    });
  });
};

const disableExtension = async () => {
  await persistRules(filterRules);
  getActiveRulesIds().then((ruleIds) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIds,
    });
  });
  filterRules.length = 0;
};

const loadRules = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(FILTER_RULES, function (response) {
      if (
        response &&
        response[FILTER_RULES] &&
        response[FILTER_RULES].length > 0
      ) {
        filterRules.push(...response[FILTER_RULES]);
      }
    });
    resolve();
  });
};

/** FILTERING */

logAllRules();

const logAllRules = () => {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    console.log("rules: ", rules);
  });
};

const getAllRules = () => filterRules;

const getActiveRulesIds = async () => {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.getDynamicRules((rules) => resolve(rules));
  });
};

/*
actions:
BLACKLIST_URL,
REMOVE_BLACKLISTED_URL,
GET_BLACKLISTED_URLS,
GET_EXTENSION_STATUS
SET_EXTENSION_STATUS
**/

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "BLACKLIST_URL") {
    const rule = addRule(request.url, "block", "");
    sendResponse({ status: "success", rule: rule });
  } else if (request.action === "REMOVE_BLACKLISTED_URL") {
    removeRule(request.id);
    sendResponse({ status: "success" });
    return true;
  } else if (request.action === "GET_BLACKLISTED_URLS") {
    sendResponse({ rules: filterRules });
    return true;
  } else if (request.action === "GET_EXTENSION_STATUS") {
    sendResponse({ status: mode });
    return true;
  } else if (request.action === "SET_EXTENSION_STATUS") {
    setExtensionStatus(request.status);
    sendResponse({ status: mode });
    return true;
  }
});
/** UTILITY.JS */
const removeRule = (id) => {
  const ind = filterRules.findIndex((rule) => rule.id === id);
  if (ind >= 0) {
    filterRules.splice(ind, 1);
  }
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
  });
  persistRules(filterRules);
};

const addRule = (url, type, redirectUrl) => {
  const rule = {
    id: Math.floor(Date.now() + Math.random() * 5000) % 5000,
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

  filterRules.push(rule);

  getActiveRulesIds().then((rulesIds) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rulesIds,
      addRules: filterRules,
    });
  });

  persistRules(filterRules);

  return rule;
};

/** STORAGE JS */
const persistRules = async (rules) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [FILTER_RULES]: rules }, function () {
      resolve();
    });
  });
};

const persistExtensionState = (status) => {
  chrome.storage.sync.set({ [EXTENSION_STATUS]: status });
};
