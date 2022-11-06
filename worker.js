const whitelistedRules = [];
const blacklistedRules = [];
let mode = "whitelist_mode";
let redirectUrl = "meditopia.com";
const WHITELIST_MODE = "whitelist_mode";
const BLACKLIST_MODE = "blacklist_mode";
const DISABLED_MODE = "disabled_mode";

const setupContextMenus = () => {
  chrome.contextMenus.create({
    id: WHITELIST_MODE,
    checked: mode == WHITELIST_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Whitelist Mode",
  });

  chrome.contextMenus.create({
    id: BLACKLIST_MODE,
    checked: mode == BLACKLIST_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Blacklist Mode",
  });

  chrome.contextMenus.create({
    id: DISABLED_MODE,
    checked: mode == DISABLED_MODE,
    type: "radio",
    contexts: ["all"],
    title: "Disable Blocking",
  });
};

chrome.runtime.onInstalled.addListener(() => {
  // console.log("extension installed");
  setupContextMenus();
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.tabs.create({
    url: "blocked/blocked.html",
  });
});

chrome.declarativeNetRequest.getDynamicRules((rules) => {
  console.log("rules: ", rules);
});

const getAllRulesIds = () => [
  ...whitelistedRules.map((rule) => rule.id),
  ...blacklistedRules.map((rule) => rule.id),
];

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

const addNewRule = (url, type, redirectUrl) => {
  const rule = {
    id: Math.floor(Math.random() * 5000),
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

  WHITELIST_MODE ? whitelistedRules.push(rule) : blacklistedRules.push(rule);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
    addRules: [
      ...(mode == WHITELIST_MODE ? whitelistedRules : blacklistedRules),
      rule,
    ],
  });
};

// const blocked_urls = [
//   "netflix.com",
//   "hotstar.com",
//   "https://www.primevideo.com/",
// ];
// {
//   id: 4567,
//   priority: 1,
//   action: {
//     type: "redirect",
//     redirect: {
//       url: "https://www.meditopia.com",
//     },
//   },
//   condition: {
//     urlFilter: "*://*.youtube.com/",
//     resourceTypes: ["main_frame", "sub_frame"],
//   },
// },

// chrome.declarativeNetRequest.updateDynamicRules({
//   addRules: blocked_urls.map((url, index) => {
//     return {
//       id: index + 1,
//       priority: 1,
//       action: {
//         type: "redirect",
//         redirect: {
//           url: "https://www.meditopia.com",
//         },
//       },
//       condition: {
//         urlFilter: url,
//         resourceTypes: ["main_frame", "sub_frame"],
//       },
//     };
//   }),
//   removeRuleIds: blocked_urls.map((_, index) => index + 1),
// });
