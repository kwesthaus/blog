---
title: "Firefox tradeoffs: history, sessions, and cookies"
date_published: 2021-04-06
authors:
    - kwesthaus
tags:
    - firefox
    - linux
    - privacy
    - convenience
---

## History

I used to choose Firefox settings solely based on what I believed would maximize my privacy and security with complete disregard for usability. However, I have recently walked back some of these choices based on a more realistic threat/privacy/productivity model for myself. For example, I used to have {settings}. However, within the past few months I realized it would be helpful to enable [multi-account containers](https://support.mozilla.org/en-US/kb/containers) so I can log in and out of personal and school club google accounts regardless of each other. After installing the add-on, I realized that my [history setting conflicted with containers](https://support.mozilla.org/en-US/questions/1292668). I could still {caveat setting} if I wanted, but decided to re-evaluate living without browser history and realized that while I try to bookmark everything important, there are definitely some occurrences of me wasting time trying to find a site I have already browsed to before. In terms of a threat model:

- Most cases of leaked browsing history that I could find arose from installing sketchy browser addons. I only have 2 addons with the [Access browsing history](https://support.mozilla.org/en-US/kb/permission-request-messages-firefox-extensions#w_access-browsing-history) permission, and I trust both of them: [Vimium](https://github.com/philc/vimium), which is open source, and Firefox Multi-Account Containers, which is an official Mozilla extension
- My SSD is encrypted which prevents an attacker from quickly reading my history file or anything else on the filesystem if my laptop gets stolen
- Some research uses cache-based timing attacks to determine visited websites which isn't dependent on recorded history, and I already clear the cache whenever I exit Firefox
- If another program with malicious intent on my computer could read the places.sqlite file where Firefox stores history, it would have access to many other interesting targets and information across my home directory and potentially the rest of my computer
- If a page I visit/extension I install uses an exploit and could access history without my permission, it could probably access other more interesting browser APIs without interaction

I personally decided that the benefits outweigh the risks for me, so I now have Firefox set to keep browser history {exact setting?}.

## Sessions

More recently, for reasons I'll get into in another blog post (tl;dr: Arch Linux doesn't support partial upgrades), I realized my existing Firefox habits were pushing me to delay updating my computer. I had Firefox set to clear {specific settings} on close. Closing firefox would get rid of everything, including open tabs and logged-in sessions. When I wanted to save the tabs I had open, I would select them all and right click -> Bookmark tabs so that I could later right click on saved bookmarks folder -> Open all in tabs. However, having to do that and re-log in to accounts every time I closed and opened firefox was a pain, so I avoided completely closing firefox whenever possible. To fix this annoyance I evaluated Firefox's session restore feature, which when starting Firefox gives you the option to return to how it was before you closed it.

CHANGE PREVIOUS 2 PARAGRAPHS - I didn't actually decide to KEEP history until needing session restore

I still had to log in to all my accounts again even when I restored a previous session. I realized doing this necessarily requires getting rid of cookie autodelete for ALL cookies, so I searched for a way to only allow some cookies to persist between closing and re-opening firefox. Turns out it's possible but convoluted. There are some conflicting settings and it's not exactly clear what the settings do at a technical level or what threats different options enable, so I verified the behavior myself. The relevant settings are {}, both of which can be enabled or disabled, giving us 4 combinations. To further understand what's going on requires a quick look into cookies.

## Cookies

https://privacy.net/stop-cookies-tracking/
https://robertheaton.com/2017/11/20/how-does-online-tracking-actually-work/
https://wiki.mozilla.org/Session_Restore

persistent vs session, remember me?
first vs third party
threat of third party cookies

So I decided what I wanted to do was test both session and persistent cookies on starting a new session and restoring an existing one for each of the above 4 combinations.

results

realized also affected by Firefox third-party cookies setting, and uMatrix options

## Final Choices

what I ended up doing
block all cookies, have exceptions, cause most websites I care about set persistent login cookies that I can whitelist and not have to worry about
set firefox third-party to less strict so that I can more easily selectively enable using uMatrix

https://alanhogan.github.io/web-experiments/3rd/third-party-cookies.html

## Conclusion

hope this was
- helpful practice and discussion of evaluating reasonable threat/privacy/productivity model
- helpful to understand the underling technology behind some of these choices
