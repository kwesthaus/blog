---
title: Safely Updating a Rooted Pixel 4a
date_published: 2021-01-13
authors:
    - kwesthaus
tags:
    - android
    - rooting
    - pixel
    - google
---

## (Skip to the Process section for just the instructions and a tl;dr)

Like many people with Android phones, I keep my [Google Pixel 4a](https://www.gsmarena.com/google_pixel_4a-10123.php) rooted to gain greater control over the device. Though some reasons to root (e.g. ad blocking, YouTube Vanced) have developed more viable non-root alternatives over time, I still find that I enjoy:
- automatic updates for F-Droid apps through the [privileged extension](https://f-droid.org/en/packages/org.fdroid.fdroid.privileged/)
- charge limiting via the [Advanced Charging Controller Magisk module](https://github.com/Magisk-Modules-Repo/acc)
- thorough (system app and special) backups using [oandbackup](https://github.com/jensstein/oandbackup)/[oandbackupx](https://github.com/machiav3lli/oandbackupx)
- less limitations on programmatic access through [Tasker](https://tasker.joaoapps.com/) (for example, I previously used this ability to automatically turn location on/off in a custom anti-theft solution, though I have since stopped maintaining this method)

However, rooting can make the update process more complex, so I am sharing the process I use to safely update (where "safely" means "with minimal chance of bootlooping/bricking"). Note that this article assumes you have an unlocked bootloader and are already rooted with [Magisk](https://github.com/topjohnwu/Magisk). Some other devices do not allow bootloader unlocking and thus require exploits to gain root.

## Rooting Background
Rooting involves modifying parts of the Android boot chain so as to gain superuser access. Because rooting modifies critical files and the methods used are not officially supported by vendors, rooting (and by the same token custom ROMs) can interfere with updates and sometimes cause bootloops, bricking, or other instability. Thus, having a clear set of update steps to follow can be helpful in avoiding any issues.

Modern root methods are "systemless" and avoid modifying the system partition because [not having to reflash system makes it easier to update](https://forum.xda-developers.com/t/wip-2016-01-21-android-6-0-marshmallow-closed.3219344/#post-63197935). Since the linked post was written, Magisk has become the go-to rooting tool (read [The Magisk Story](https://www.reddit.com/r/Android/comments/7oem7o/the_magisk_story/) from the creator). Additionally, the Android boot process has changed quite a bit. A good place to learn about these changes as they apply to rooting is the [Android Booting Shenanigans page in the Magisk documentation](https://topjohnwu.github.io/Magisk/boot.html).

As described in the linked Magisk documentation, almost all old devices used Boot Method A, Boot Method B was introduced with the first [A/B devices](https://source.android.com/devices/tech/ota/ab), and modern A/B devices use Boot Method C. The standard root method for Boot Method A devices was to replace the stock recovery with a custom recovery (such as [TWRP](https://twrp.me/)) and flash a zip file which would perform the necessary modifications to install Magisk. This method is how I rooted my previous phone, the [Motorola Moto G5+](https://www.gsmarena.com/motorola_moto_g5_plus-8453.php#xt1687). Since stock updates required a stock recovery, you had to uninstall Magisk and flash stock recovery (and likely other partitions depending upon the exact phone), install the OTA (Over-The-Air) update, reinstall a custom recovery, then re-root in order to update your device.

Boot Method B devices can get complex (and make up the majority of the caveats on the [Installation page in the Magisk documentation](https://topjohnwu.github.io/Magisk/install.html)), but for the purposes of this article we are mostly interested in Boot Method C devices which includes the Pixel 4a.

Since Boot Method C devices are A/B devices, updates are applied to the inactive slot. It used to be possible to restore the original boot images for both slots in Magisk Manager, take the update, patch the updated boot partition in the inactive slot, and then reboot to the updated build number with Magisk installed, making rooted updates a 1-reboot process. However, as noted on the [OTA Upgrade Guides page in the Magisk documentation](https://topjohnwu.github.io/Magisk/ota.html), Google has since changed the OTA process which makes installing Magisk to the inactive slot impossible. Updates now require 3 reboots similar to the Boot Method A process, but are simpler in that only the boot partition needs flashed and no interaction with a recovery image is needed. The full process for updating Boot Method C devices such as the Pixel 4a is covered in the next section.

## Process

### tl;dr
1. flash stock boot.img for CURRENT Android build number
2. OTA update
3. download, patch, flash boot.img for NEW build number

[Magisk documentation](https://topjohnwu.github.io/Magisk/) or [XDA](https://www.xda-developers.com/) for questions.

### Detailed Steps
0. (optional) if using [MagiskHide Props Config](https://github.com/Magisk-Modules-Repo/MagiskHidePropsConf) to change the device fingerprint (usually done to force BASIC key attestation and thus pass the ctsProfile check of SafetyNet), follow these steps to temporarily reset props and prevent Android from potentially downloading an incorrect OTA update:
    1. open terminal, run `su -c props`
    2. select the `r` (reset) option
    3. reboot when prompted
1. plug in phone, make sure USB mode is set to file sharing on the phone, that USB debugging is enabled and the current computer is approved, and that `sudo adb devices` on the computer returns the phone's serial # (NOTE: notice the sudo)
2. on computer, open terminal and navigate to directory with boot images for the CURRENT build number (for me, under `~/Documents/tech/devices/phone/pixel4a/$BUILD_NUMBER`) (NOTE: if you do not have these files available, follow steps 8-12 but for the CURRENT build number)
3. run `sudo adb reboot bootloader`
4. let phone boot to bootloader, then verify that `sudo fastboot devices` lists the phone's serial #
5. run `sudo fastboot flash boot boot.img`
6. run `sudo fastboot reboot`, then let the phone boot normally
7. on the phone, go to settings, select and install OTA update, reboot when prompted
8. go to phone settings, note NEW build number
9. on computer, get stock image (use the Download Link for the zip file, not Flash) for NEW build number on [google's factory images page](https://developers.google.com/android/images?hl=en#sunfish)
10. extract the downloaded stock zip
11. in the stock zip, ignore the bootloader and radio img files and extract the image zip
12. navigate to the same directory as the NEW boot.img in the extracted image zip
13. run `sudo adb push ./boot.img /sdcard/Download/`
14. on the phone, ensure boot.img shows up under the Download folder in the Files app
15. open magisk manager app, check for app updates. if the app updates, reboot (NOTE: if the patching process or ensuing reboot fails, check the [Pixel 4a rooting thread on XDA](https://forum.xda-developers.com/pixel-4a/how-to/guide-unlock-root-pixel-4a-t4153773) to see if you need to change to a specific update channel and return to this step to get boot.img patching to work)
16. open Magisk Manager, select "Install", select "Select and Patch a File", select the boot.img under the Download folder, select "LET'S GO", let it run until it says "All done!", then close Magisk Manager
17. on the computer, navigate to directory for the NEW build number and run `sudo adb pull /sdcard/Download/magisk_patched.img ./`
18. run `sudo adb reboot bootloader`
19. let phone boot to bootloader, then verify that `sudo fastboot devices` lists the phone's serial #
20. run `sudo fastboot flash boot magisk_patched.img`
21. run `sudo fastboot reboot`, then let the phone boot normally
22. on phone, open settings and verify new build number
23. open Magisk Manager, verify that the "Installed" property listed under "Magisk" gives a version number as opposed to "N/A"
24. (optional) if you disabled MagiskHide Props Config and wish to re-enable:
    1. check to make sure you still have to do this by opening Magisk Manager on phone and selecting "Check SafetyNet" to see current status. if fails:
        1. re-enable by opening terminal, running `su -c props` and selecting desired options, then rebooting when prompted
        2. verify that SafetyNet now passes

