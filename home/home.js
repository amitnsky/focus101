var submitBtn = document.getElementById("blocked_url_submit")
submitBtn.addEventListener('click',(ev)=>{
  ev.preventDefault()
  let url =  document.getElementById('blocked_url_text').value;
  console.log("blocked_url: " + url)
  if(url){
    chrome.runtime.sendMessage({action: "ADD_BLACKLIST_URL", url: url}, function(response) {
      console.log(response);
    });
  };
})

chrome.runtime.sendMessage({action: "GET_FILTERED_URLS"}, function(response) {
  console.log('response',response);
  var list = document.getElementById("filtered_urls_ul");
  const createListItem = (text) => {
    let li = document.createElement('li')
    li.textContent = text;
    return li
  }
  response.rules.forEach(rule => {
    var li = createListItem(rule.condition.urlFilter)
    list.appendChild(li)
  });
});


