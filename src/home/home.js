const EXTENSION_STATUS = "EXTENSION_STATUS";
const FILTER_RULES = "FILTER_RULES";
const ENABLED = "ENABLED";
const DISABLED = "DISABLED";

const getEnabledRadioBtn = () => {
  return document.getElementById("enabled_radio_btn");
};

const getDisabledRadioBtn = () => {
  return document.getElementById("disabled_radio_btn");
};

const setupPage = () => {
  var submitBtn = document.getElementById("blocked_url_submit");
  submitBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    let input = document.getElementById("blocked_url_text");
    let url = input.value;
    if (url) {
      const rule = addRule(url);
      addUrlToUI(rule);
      input.value = "";
    }
  });
  setupRadioButtons();
};

const setupRadioButtons = () => {
  let enabledRadioBtn = getEnabledRadioBtn();
  let disabledRadioBtn = getDisabledRadioBtn();
  enabledRadioBtn.addEventListener("click", enableExtension);
  disabledRadioBtn.addEventListener("click", disableExtension);
};

const reloadContent = (isEnabled) => {
  // console.log("isEnabled: " + isEnabled);
  const content = document.getElementById("content");
  reloadRadioBtns(isEnabled);
  if (isEnabled) {
    getAllRules().then((allRules) => {
      allRules.forEach((rule) => addUrlToUI(rule));
      content.style["visibility"] = "visible";
    });
  } else {
    content.style["visibility"] = "hidden";
    getAllRules().then((allRules) => {
      allRules.forEach((rule) => removeUrlFromUI(rule.dynamicRule.id));
    });
  }
};

const reloadRadioBtns = (isEnabled) => {
  let enabledRadioBtn = getEnabledRadioBtn();
  let disabledRadioBtn = getDisabledRadioBtn();
  if (isEnabled) {
    enabledRadioBtn.checked = true;
    disabledRadioBtn.checked = false;
  } else {
    enabledRadioBtn.checked = false;
    disabledRadioBtn.checked = true;
  }
};

const removeUrlFromUI = (id) => {
  var list = document.getElementById("blocked_urls_ul");
  var li = document.getElementById(id);
  list.removeChild(li);
};

const addUrlToUI = (rule) => {
  var list = document.getElementById("blocked_urls_ul");
  const createListItem = (text) => {
    let p = document.createElement("p");
    p.textContent = text;

    let icon = document.createElement("img");
    icon.src = "../images/delete_icon.png";
    icon.width = "8";
    icon.height = "8";
    icon.onclick = () => {
      removeUrlFromUI(rule.dynamicRule.id);
      removeRule(rule.dynamicRule.id);
    };

    let div = document.createElement("span");
    div.style["display"] = "flex";
    div.style["align-items"] = "baseline";

    div.appendChild(p);
    div.appendChild(icon);

    let li = document.createElement("li");
    li.id = rule.dynamicRule.id;
    li.appendChild(div);

    return li;
  };
  var li = createListItem(rule.url);
  list.appendChild(li);
};

const getExtensionStatus = async () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([EXTENSION_STATUS], function (mode_val) {
      let status = DISABLED;
      if (!mode_val || !mode_val[EXTENSION_STATUS]) {
        status = DISABLED;
      } else {
        status = mode_val[EXTENSION_STATUS];
      }
      resolve(status);
    });
  });
};

const persistExtensionStatus = (status) => {
  chrome.storage.sync.set({ [EXTENSION_STATUS]: status });
};

const enableExtension = () => {
  persistExtensionStatus(ENABLED);
  getAllRules().then((allRules) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: allRules.map((rule) => rule.dynamicRule),
    });
  });
  reloadContent(true);
};

const disableExtension = () => {
  persistExtensionStatus(DISABLED);
  reloadContent(false);
  getAllRules().then((allRules) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: getRuleIds(allRules),
    });
  });
};

const getAllRules = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(FILTER_RULES, function (response) {
      const filterRules = [];
      if (
        response &&
        response[FILTER_RULES] &&
        response[FILTER_RULES].length > 0
      ) {
        filterRules.length = 0;
        filterRules.push(...response[FILTER_RULES]);
      }
      resolve(filterRules);
    });
  });
};

const getRuleIds = (rules) => rules.map((rule) => rule.dynamicRule.id);

const removeRule = (id) => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
  });
  getAllRules().then((allRules) => {
    const ind = allRules.findIndex((fr) => fr?.dynamicRule?.id === id);
    if (ind >= 0) {
      allRules.splice(ind, 1);
      persistRules(allRules);
    }
  });
};

const createRule = (url) => {
  const urlReg = /(?:https?:\/\/)?(?:www\.)?(.+)/gm;
  const matchRes = urlReg.exec(url);
  const domain = matchRes[1].replace(".", "\\.");
  const urlFilterPattern = `https?:\\/\\/(www\\.)?${domain}`;
  const dynamicRule = {
    id: Math.floor(Date.now() + Math.random() * 5000) % 5000,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: "/blocked/blocked.html",
      },
    },
    condition: {
      isUrlFilterCaseSensitive: false,
      regexFilter: urlFilterPattern,
      resourceTypes: ["main_frame"],
    },
  };
  return { url: url, dynamicRule: dynamicRule };
};

const addRule = (url) => {
  const rule = createRule(url);
  getAllRules().then((allRules) => {
    allRules.push(rule);
    persistRules(allRules);
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule.dynamicRule],
    });
  });
  return rule;
};

const persistRules = async (rules) => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [FILTER_RULES]: rules }, function () {
      resolve();
    });
  });
};

const init = async () => {
  setupPage();
  const mode = await getExtensionStatus();
  reloadContent(mode === ENABLED);
};

await init();
