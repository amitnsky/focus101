const reloadContent = () => {
  const isEnabled = false
  const content = document.getElementById("content")
  if(isEnabled){
    content.style['visibility'] = 'visible'
    chrome.runtime.sendMessage({action: "GET_BLACKLISTED_URLS"}, function(response) {
      response.rules?.forEach(rule => addUrl(rule))
    });
    var submitBtn = document.getElementById("blocked_url_submit")
    submitBtn.addEventListener('click',(ev)=>{
      ev.preventDefault()
      let input =  document.getElementById('blocked_url_text');
      let url =  input.value;
      if(url){
        chrome.runtime.sendMessage({action: "BLACKLIST_URL", url: url}, function(response) {
          addUrl(response.rule)
        });
        input.value = ''
      };
    })    
  }else{
    content.style['visibility'] = 'hidden'
  }
}

const removeUrl = (id) => {
  var list = document.getElementById("blocked_urls_ul");
  var li = document.getElementById(id);
  list.removeChild(li);
  chrome.runtime.sendMessage({action: "BLACKLIST_URL", url: url}, function(response) {
    addUrl(response.rule)
  });
}

const addUrl = (rule) => {
  var list = document.getElementById("blocked_urls_ul");
  const createListItem = (text) => {
    let p = document.createElement('p')
    p.textContent = text
    
    let icon = document.createElement('img')
    icon.src = '../images/delete_icon.png'
    icon.width = '8'
    icon.height = '8'
    icon.onclick = () => removeUrl(rule.id)
    
    let div = document.createElement('span')
    div.style['display'] = 'flex'
    div.style['align-items'] = 'baseline'

    div.appendChild(p)
    div.appendChild(icon)
    
    let li = document.createElement('li')
    li.id = rule.id
    li.appendChild(div)

    return li
  }
  const url = rule.condition.urlFilter
  var li = createListItem(url)
  list.appendChild(li)
}

reloadContent()