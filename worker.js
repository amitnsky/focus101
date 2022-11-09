const EXTENSION_STATUS = "extension_status"
const FILTER_RULES = "filter_rules"
const ENABLED = "enabled";
const DISABLED = "disabled";

const filterRules = [];
let mode = ENABLED;
let redirectUrl = "meditopia.com";

const init = async () =>{
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([EXTENSION_STATUS], function(mode_val) {
      if(!mode_val || !mode_val[EXTENSION_STATUS]){
        mode = DISABLED;
      }else{
        mode = mode_val[EXTENSION_STATUS];
      }
      resolve();
    });
  });
}

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

chrome.runtime.onInstalled.addListener(async () => {
  await init()
  setupContextMenus();
  if(mode === ENABLED)
    enableExtension()
  else 
    disableExtension()
});

const enableExtension = async () => {
  mode = ENABLED;
  await loadRules()
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
    addRules: getAllRules(),
  });
  chrome.storage.sync.set({EXTENSION_STATUS: ENABLED});
}

const disableExtension = async () => {
  mode = DISABLED;
  await persistRules([...filterRules])
  console.log('persisted data',filterRules)
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
  });
  chrome.storage.sync.set({EXTENSION_STATUS: DISABLED});
  while(filterRules.length>0) filterRules.pop()
}

const persistRules = async (rules) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({FILTER_RULES: rules}, function(){
      console.log('saved data:', rules)
      resolve()
    })
  });
}

const loadRules = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(FILTER_RULES, function(response) {
      if(response && response[FILTER_RULES] && response[FILTER_RULES].length > 0 ){
        filterRules.push([...response[FILTER_RULES]])
      }
      console.log('retrived urls:', response)
    })
    resolve()
  })
}

chrome.contextMenus.onClicked.addListener((clickData) => {
  if (clickData.menuItemId === ENABLED) {
    enableExtension()
  } else if (clickData.menuItemId === DISABLED) {
    disableExtension()
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

const getAllRulesIds = () => [...filterRules.map((rule) => rule.id)]

const getAllRules = () => filterRules

/*
actions:

BLACKLIST_URL,
REMOVE_BLACKLISTED_URL,
GET_BLACKLISTED_URLS,
**/

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "BLACKLIST_URL"){
      addRule(request.url, 'block','')
      sendResponse({status: "success"});
    }else if (request.action === "REMOVE_BLACKLISTED_URL"){
      // console.log('received req')
      // chrome.declarativeNetRequest.getDynamicRules((rules) => {
      //   console.log('sending response')
      //   sendResponse({"rules": rules});
      // });
      // return true
    }else if (request.action === "GET_BLACKLISTED_URLS"){
      sendResponse({"rules": filterRules});
      return true
    }
  }
);

// const removeAllRules = () => {
//   const enabledRulesIds = [];
//   chrome.declarativeNetRequest.getDynamicRules((rules) => {
//     rules.map((rule) => enabledRulesIds.push(rule.id));
//   });
//   chrome.declarativeNetRequest.updateDynamicRules({
//     removeRuleIds: enabledRulesIds,
//   });
// };

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
  
  filterRules.push(rule);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: getAllRulesIds(),
    addRules: filterRules
  });
};