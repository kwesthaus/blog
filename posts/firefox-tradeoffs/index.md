---
title: "Firefox tradeoffs: sessions, history, and cookies"
date_published: 2021-07-26
authors:
    - kwesthaus
tags:
    - firefox
    - linux
    - privacy
    - configuration
---


## Background

Arch Linux, my daily driver operating system, [doesn't support partial upgrades](https://wiki.archlinux.org/title/System_maintenance#Partial_upgrades_are_unsupported). This means that sometimes in order to install a new package, I have to upgrade all existing packages on my system because a new version has been released since I last synced my local pacman database (if you're confused or curious, read the linked Arch Wiki page). Even with the LTS kernel (less frequent updates), most times upgrading all packages includes the kernel, for which [rebooting after upgrading is recommended](https://wiki.archlinux.org/title/System_maintenance#Restart_or_reboot_after_upgrades). Consequently, installing a new package involves rebooting your computer a decent amount of the time if you're following system maintenance best practices. For me, the biggest pain point in this scenario was losing my browsing session because I had Firefox set to clear everything on close.

With technology, I often used to take the extreme approach of turning off all features with even a slight chance of compromising privacy or security. While this approach is effective at reducing my attack surface and the amount of information corporations have about me to bundle up and sell, it certainly doesn't boost convenience. More recently I try to balance that approach with more realistic threat modeling so I know which settings actually matter and which settings just make my life more difficult without a significant improvement in security or privacy. My existing Firefox settings made upgrading painful; to get around losing my session on every close, I either delayed upgrades (exposing myself to known vulnerabilities) until I finished long-running projects that I had many Firefox tabs open for, or bookmarked every tab before closing then reopened them all when restarting (which was time consuming). I thought this was a good chance to reevaluate my settings to see what tradeoffs would be involved in allowing session restore. I also wanted to see what settings changes would be required for [multi-account containers](https://support.mozilla.org/en-US/kb/containers), which would reduce another pain point by enabling me to log in and out of my personal google account and the [OSU cybersecurity club](https://osucyber.club/) google account independent of each other.


## Ground Truth

After reading many articles trying to understand Firefox sessions, cookies, the preferences menu, and about:config hacks, I realized it can be confusing trying to understand all the options for preference menu settings and what other settings they unlock. Additionally, all the settings in the preferences menu of Firefox map to about:config settings, but the exact mapping isn't publicly documented in an easily digestible format anywhere. So, I saved the about:config page to a text file for every combination of options for a subset of the settings on the about:preferences page for Privacy & Security and used diff to figure out the exact mapping. 

Using the diffs, I set about drawing the relationship between various preference menu settings and their underlying about:config settings. My results are shown in the diagrams below **(note that there are 3 pages to click between)**. Also visualized is the relationship between settings which unlock others. For example, under the Enhanced Tracking Protection section, choosing Standard sets 8 about:config settings. Choosing Custom instead only sets 2 about:config settings, and reveals further menus which affect the remainig about:config settings.

<iframe frameborder="0" style="width:100%;height:50em;" src="https://viewer.diagrams.net/?highlight=0000ff&layers=1&nav=1&page-id=ZAhGN3KTwwpk25ggujl3&title=BLOG-VERSION-ON-GDRIVE_firefox-privacy-settings.drawio#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1dbfW35HqDPozQ4vDDG6_y_PumqNlXZN7%26export%3Ddownload"></iframe>

The about:config settings were all captured in April 2021. I should have recorded the exact version of Firefox, but I forgot to.


## History

To enable session restore and container tabs I needed to switch away from "Never remember history". I mostly care about not giving my browsing history away to some data aggregator to sell, but here's everything I could think of for a threat model for enabling browser history:

- Most cases of leaked browsing history that I could find arose from installing sketchy browser addons. I only have 2 addons with the [Access browsing history](https://support.mozilla.org/en-US/kb/permission-request-messages-firefox-extensions#w_access-browsing-history) permission, and I trust both of them: [Vimium](https://github.com/philc/vimium), which is open source, and Firefox Multi-Account Containers, which is an official Mozilla extension
- My SSD is encrypted which prevents an attacker from quickly reading my history file or anything else on the filesystem if my laptop gets stolen
- Some research uses cache-based timing attacks to determine visited websites which isn't dependent on recorded history, and I already clear the cache whenever I exit Firefox
- If another program with malicious intent on my computer could read the places.sqlite file where Firefox stores history, it would have access to many other interesting targets and information across my home directory and potentially the rest of my computer
- If a page I visit/extension I install uses an exploit and could access history without my permission, it could probably access other more interesting browser APIs without interaction

I personally decided that the benefits outweigh any risks for me, so I now have Firefox set to "Use custom settings for history" aka `privacy.history.custom: true` (for more granular control over some other settings) with "Remember browsing and download history" enabled (`places.history.enabled: true`).


## Cookies

Session restore and multi-account containers became a possbility after modifying my history settings, but I still had to log in to all my accounts again when I restored a previous session. I realized changing this necessarily required getting rid of some of the cookie autodelete settings I had enabled. While I determined history settings don't really affect how much data you leak to the outside world, that is definitely not true for cookies, which form the foundations of tracking on the web, so I wanted to be careful. Cookies could be their own blog post, but there are already good sources for [explaining](https://robertheaton.com/2017/11/20/how-does-online-tracking-actually-work/) and [testing](https://alanhogan.github.io/web-experiments/3rd/third-party-cookies.html) how [cookie tracking works](https://privacy.net/stop-cookies-tracking/) so I won't go too deep into them here. The important information is that I was interested in finding a more granular way to control cookie deletion than just a big on/off switch which affected cookies from all sites equally. In searching for a way to only allow some cookies to persist between closing and re-opening Firefox I found that it's possible but convoluted. Keep in mind that cookies can also be affected by browser addons, but I won't cover that here.

Cookies are a prime example of how the preferences menu is confusing:
1. there's a "Delete cookies and site data when Firefox is closed" setting (paired with a "Manage Exceptions" button) under the "Cookies and Site Data" section
2. there's a "Cookies" option presented by clicking on the "Settings..." button next to "Clear history when Firefox closes" under the "History" section.
3. when you select "Custom" for "Enhanced Tracking Protection", there are multiple options for which cookies to block

Using the diagram I made, we can see that #1 affects the `network.cookie.lifetimePolicy` about:config setting while #2 affects the `privacy.clearOnShutdown.cookies` and `privacy.sanitize.pending[0]["itemsToClear"]` about:config settings and #3 affects the `network.cookie.cookieBehavior` setting. That knowledge in itself isn't much more helpful, but in my experience searching about:config settings gets you much more specific answers than searching preference menu settings. For my specific case, I learned through searching and a healthy dose of trial and error that cookie deletion is affected by both #1 and #2 (while #3 affects which cookies are accepted in the first place). Disabling #2 gave full control to #1, so the "Manage Execeptions" button actually works as intended (which is NOT true if both of the cookie deletion options are enabled). By adding site exceptions, I can now stay logged in to a select few websites across sessions without also persisting a bunch of tracking cookies.


## Conclusion

Ultimately I'm happy that I was able to find settings which make it easier and more productive to use my laptop while still giving me some control over the information I spew out to the internet. I hope the diagrams both show that Firefox settings can be a bit messy and help others navigate this mess in the future. I definitely dove deeper into this topic than any reasonable person can be expected to in the name of "privacy". I also hope this post serves as helpful practice discussing and evaluating reasonable threat/privacy/productivity models.
