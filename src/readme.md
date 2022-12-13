Minimum required features for launch
- [X] enable disable extension
- [X] ability to block url
- [X] live refresh options page
- [X] persist blocked urls
- [X] do not show list of urls if extension is disabled
- [X] option to remove a blocked url
- [X] Good icon for extension

TODOs
- [ ] pretty blocked page with random 10 images 
- [ ] make image responsive
- [ ] add text placeholder in submit field - Type url, e.g. htttps://abc.nyz.com
- [ ] change default blocking priority to 3
- [ ] figure out how to block all sites - // https?:\\/\\/(www\\.)?google\\.com
- [ ] add exceptions - e.g. some bookmarked urls
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

