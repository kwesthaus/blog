---
title: Garmin Forerunner 245 Music Teardown
date_published: 2022-06-02
authors:
    - kwesthaus
tags:
    - garmin
    - watch
    - teardown
    - hardware
    - security
---

<br>

**tl;dr:** I bought a "for parts" spare of my watch (a Garmin Forerunner 245 Music) so I could tear it apart, identify the components inside, and [document the results for others](https://www.ifixit.com/Teardown/Garmin+Forerunner+245+Music+Teardown/150396). In the process I found that 1. recent models of lower-tier Garmin watches are even harder to tear apart than previous models (which were already glued together) and 2. the electronics inside are 99% the same as more expensive tiers of Garmin watches. Identified components and their datasheets are available [on my iFixit writeup](https://www.ifixit.com/Teardown/Garmin+Forerunner+245+Music+Teardown/150396#s311798).

---

<br>

![picture of the Garmine Forerunner 245 Music smartwatch](/public/images/fr245m.webp)

I have a Garmin Forerunner 245 Music smartwatch (aka fr245m) that I'm using as a platform to practice some security research skills with the goal of eventually gaining arbitrary code execution (native code, not the [discount Java](https://developer.garmin.com/connect-iq/monkey-c) that Garmin provides for writing watch apps). When I originally started on this project, I found [an awesome article](https://www.atredis.com/blog/2020/11/4/garmin-forerunner-235-dion-blazakis) describing the process of finding memory corruption bugs in the virtual machine for apps on the fr235. Unfortunately for me, the size of the binary blobs I was pulling out of fr245m firmware updates (more about this process in future blog posts) did not match the internal flash or SRAM size of the author's expected processor (which they got from [this teardown of the fr735xt](https://www.ifixit.com/Teardown/Garmin+Forerunner+735XT+Teardown/117852)). This seemed to indicate a change in platform from the fr235/fr735xt to the fr245m, so I went searching for teardowns of the fr245m. While I found some [screen replacement](https://www.youtube.com/watch?v=pJYrldFxTZY&t=115s) videos on youtube and the [FCC-ID listing](https://fccid.io/IPH-03568) does have [internal photos](https://fccid.io/IPH-03568/Internal-Photos/Internal-Photos-4215004), they're all sufficiently grainy/dim that not all of the components can be identified.

Knowing all the processors (and having their datasheets) isn't strictly necessary to reverse engineer the firmware blobs, but it would be helpful and I figured performing a teardown would be a fun way to contribute to [iFixit](https://www.ifixit.com/) anyways. After a couple weeks of camping the "for parts" page of ebay, I had a broken fr245m ordered from Lithuania for $50. Word on the street is the Forerunner 255 is ~~coming soon~~ [released](https://www.garmin.com/en-US/p/780139) (after which the price for fr245m's should drop), but until then the "for parts" page is probably the cheapest option.

Eventually one broken watch arrived and I got to work. While I expected the internal components to be different from the fr735xt, I thought the teardown process would be similar. However, when I actually went to open the fr245m up I realized the watch face is structured differently and it probably wouldn't be as easy to reach the glue, or really any spot to pry the screen off. In the end I just cut the watch open.

With the help of some [teardown](https://www.youtube.com/watch?v=WdbPKmjUrKc&t=31s) [videos](https://www.youtube.com/watch?v=ju9_4paRIXQ&t=279s) for models similar to the fr735xt and my opened fr245m I could see why the fr245m is harder to open than the fr735xt. I felt like words and static pictures wouldn't do the explanation justice so I went to craft some 3D models. I started with [OpenSCAD](https://openscad.org/), but colors only work in preview mode (which itself is [jank](https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/FAQ#What_are_those_strange_flickering_artifacts_in_the_preview.3F)) so I found and switched to [JSCAD](https://openjscad.azurewebsites.net/). In addition to fixing the colors, I really like that I was able to add a slider so people can see how the watch face and watch body press together.

- Final models (can be opened in-browser with the previous link): [new](https://kwest.haus/public/files/new-garmin-glue.jscad), [old](https://kwest.haus/public/files/old-garmin-glue.jscad)
- Pics:
![screenshot of 3D model for new Garmin glue construction](/public/images/new-garmin-glue.png)
![screenshot of 3D model for old Garmin glue construction](/public/images/old-garmin-glue.png)

The Forerunner 735XT was released on May 11th, 2016, and the Forerunner 245 Music was released on April 30th, 2019 ([source](https://en.wikipedia.org/wiki/Garmin_Forerunner#Models_2)), so sometime between those dates Garmin modified the glue and watch face construction. As you can see in the 3D models, the new design has a U-shaped channel which goes all the way around the perimeter of the watch body that makes it harder to reach the glue both for prying and for softening via heating from the outside. I doubt the purpose of this change was to inhibit repairability; rather, I think the goal was likely to increase the reliability of the watch's waterproof rating (5 ATM, if you were curious).

Anyways, I managed to get the watch open and take pictures of the tiny components with my roommate's camera and macro lense setup. With the help of google and the discord for my university's electronics club, I was able to identify all of the major components. I ran out of time to do anything further during the semester, but last week I went back through and took better pictures of the teardown process and published it to iFixit.

Probably the most interesting result of my teardown is the comparison to teardowns of the Fenix series ([5+ Sapphire](https://www.edn.com/teardown-a-smartwatch-with-an-athletic-tradition/), [6X Pro](http://www.f-blog.info/garmin-fenix-6x-pro-disassembly-or-teardown-whatever-you-say/)). The Fenix series are considered higher-end watches with more features, and teardowns for them are more abundant because the Fenix's aren't glued together but just use torx screws and an o-ring instead. Apart from differences for NFC/sensors/increased storage, ALL of the major components seem to be the exact same, including the ARM processors. While the pessimistic view is that Garmin could offer more software features on the lower-end watches but doesn't to increase their profits, the optimistic view is that sharing the development platform means cheaper watches get all the bugfixes that more expensive watches do (whereas they otherwise might be left to wither). Regardless, this surprise means I might be able to have some fun experimenting with Fenix features on the Forerunner 245 Music if I eventually get arbitrary code execution.

In the end I was successful in finding the processor datasheet for each binary blob that I have from the firmware upgrades. I'm looking forward to continuing to reverse the firmware enough to get my surroundings, find some bugs, get code execution, and hopefully end up with some cool blog posts or a conference talk as a result.

*Disclaimer: While I did [intern at Garmin for a summer](/career), none of the information shared in this article comes from that experience.*
