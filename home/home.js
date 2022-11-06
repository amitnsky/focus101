chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
  console.log(response.farewell);
});

/*

send_message:
{
  action: ACTION,
  url: url,
  mode: mode
}

ACTIONS:

REMOVE_RULE
ADD_RULE
GET_RULES
CHANGE_MODE


*/
