TODOs
- [ ] add enable/disable options for each rule
- [ ] unblock any custom url (it will help in unblocking any custom URL)
  - [ ] youtube.com/shorts
  - [ ] youtube.com/shorts/ - note that first and this are equivalent
  - [ ] youtube.com/shorts/123
  - [ ] optional key - block immediately (close all tabs which match this url)
- [ ] add exceptions - e.g. some bookmarked urls
- [ ] poc for any other tool which can simplify styling with built in widgets something, somehow we need to get rid of manually styling components
- [ ] integrate react js
- [ ] create it a great extension

Test cases
- enable should reload blocked urls
- disable should hide the page
- disable should disable extension
- disable should persist data
- submit should add a new rule
- submit should persist all rules
- remove should remove rule from local cache
- remove should remove rule from chrome blocking
- remove should persist data
- on load should recover previous state


Additional features
- add exception for pages
- show a nice UI when blocking
- optionally redirect to a new page (configurable)
- scheduling
- do not add duplicate urls


source of truth to list active rules should be 
> always declarative net requests

