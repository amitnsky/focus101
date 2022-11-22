const EXTENSION_STATUS = "EXTENSION_STATUS";
const FILTER_RULES = "FILTER_RULES";
const ENABLED = "ENABLED";
const DISABLED = "DISABLED";

let extensionStatus = DISABLED;

const reloadContent = (isEnabled) => {
  const content = document.getElementById("content");
  setupRadioButtons(isEnabled);
  if (isEnabled) {
    content.style["visibility"] = "visible";

    chrome.runtime.sendMessage(
      { action: "GET_BLACKLISTED_URLS" },
      function (response) {
        response.rules?.forEach((rule) => addUrl(rule));
      }
    );
    var submitBtn = document.getElementById("blocked_url_submit");
    submitBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      let input = document.getElementById("blocked_url_text");
      let url = input.value;
      if (url) {
        chrome.runtime.sendMessage(
          { action: "BLACKLIST_URL", url: url },
          function (response) {
            addUrl(response.rule);
          }
        );
        input.value = "";
      }
    });
  } else {
    chrome.runtime.sendMessage(
      { action: "GET_BLACKLISTED_URLS" },
      function (response) {
        var list = document.getElementById("blocked_urls_ul");
        response.rules?.forEach((rule) => {
          var li = document.getElementById(rule.id);
          list.removeChild(li);
        });
      }
    );
    content.style["visibility"] = "hidden";
  }
};

const disableExtension = () => {
  if (extensionStatus !== DISABLED) {
    extensionStatus = DISABLED;
    // console.log("disabled");
    reloadContent(false);
    chrome.runtime.sendMessage({
      action: "SET_EXTENSION_STATUS",
      status: DISABLED,
    });
  }
};

const enableExtension = () => {
  if (extensionStatus !== ENABLED) {
    extensionStatus = ENABLED;
    // console.log("enabled");
    reloadContent(true);
    chrome.runtime.sendMessage({
      action: "SET_EXTENSION_STATUS",
      status: ENABLED,
    });
  }
};

const setupRadioButtons = (isEnabled) => {
  let enabledRadioBtn = document.getElementById("enabled_radio_btn");
  let disabledRadioBtn = document.getElementById("disabled_radio_btn");

  enabledRadioBtn.removeEventListener("click", enableExtension);
  enabledRadioBtn.addEventListener("click", enableExtension);

  disabledRadioBtn.removeEventListener("click", disableExtension);
  disabledRadioBtn.addEventListener("click", disableExtension);

  if (isEnabled) {
    enabledRadioBtn.checked = true;
    disabledRadioBtn.checked = false;
  } else {
    enabledRadioBtn.checked = false;
    disabledRadioBtn.checked = true;
  }
};

const removeUrl = (id) => {
  var list = document.getElementById("blocked_urls_ul");
  var li = document.getElementById(id);
  chrome.runtime.sendMessage(
    { action: "REMOVE_BLACKLISTED_URL", id: id },
    function (response) {
      list.removeChild(li);
    }
  );
};

const addUrl = (rule) => {
  var list = document.getElementById("blocked_urls_ul");
  const createListItem = (text) => {
    let p = document.createElement("p");
    p.textContent = text;

    let icon = document.createElement("img");
    icon.src = "../images/delete_icon.png";
    icon.width = "8";
    icon.height = "8";
    icon.onclick = () => removeUrl(rule.id);

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

chrome.runtime.sendMessage(
  { action: "GET_EXTENSION_STATUS" },
  function (response) {
    // console.log("extension status:", response.status);
    extensionStatus = response.status;
    reloadContent(response.status === ENABLED);
  }
);
