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
      const rule = addRule(url, "block", "");
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
  console.log("isEnabled: " + isEnabled);
  const content = document.getElementById("content");
  if (isEnabled) {
    reloadRadioBtns(isEnabled);
    getAllRules().then((allRules) => {
      allRules.forEach((rule) => addUrlToUI(rule));
      content.style["visibility"] = "visible";
    });
  } else {
    reloadRadioBtns(isEnabled);
    content.style["visibility"] = "hidden";
    getAllRules().then((allRules) => {
      allRules.forEach((rule) => removeUrlFromUI(rule.id));
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
      removeUrlFromUI(rule.id);
      removeRule(rule.id);
    };

    let div = document.createElement("span");
    div.style["display"] = "flex";
    div.style["align-items"] = "baseline";

    div.appendChild(p);
    div.appendChild(icon);

    let li = document.createElement("li");
    li.id = rule.id;
    li.appendChild(div);

    return li;
  };
  const url = rule.condition.urlFilter;
  var li = createListItem(url);
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
      addRules: allRules,
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
      getActiveRules().then((rules) => {
        rules.forEach((rule) => {
          if (filterRules.findIndex((fr) => fr.id === rule.id) < 0) {
            filterRules.push(rule);
          }
        });
        resolve(filterRules);
      });
    });
  });
};

const getRuleIds = (rules) => rules.map((rule) => rule.id);

const removeRule = (id) => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id],
  });
  getAllRules().then((allRules) => {
    const ind = allRules.findIndex((fr) => fr.id === id);
    if (ind >= 0) {
      allRules.splice(ind, 1);
      persistRules(allRules);
    }
  });
};

const addRule = (url, type, redirectUrl) => {
  console.log(url);
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

  getAllRules().then((allRules) => {
    allRules.push(rule);
    persistRules(allRules);

    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule],
    });
  });

  return rule;
};

const getActiveRules = async () => {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.getDynamicRules((rules) => resolve(rules));
  });
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
  // if (mode === ENABLED) {
  //   enableExtension();
  // } else {
  //   disableExtension();
  // }
};

await init();

/**
 *
 * operations
 *
 * add a rule
 * delete a rule
 * get all rules
 *
 * enable extension -
 * disable extension -
 *
 */
