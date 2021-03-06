---
title: Updating a Rooted Pixel 4a
date_published: 2021-01-13
authors:
    - kwesthaus
tags:
    - android
    - rooting
    - pixel
    - google
---

## (Skip to the [Process](#process) section for just the tl;dr or full instructions)

Like many people with Android phones, I keep my [Google Pixel 4a](https://www.gsmarena.com/google_pixel_4a-10123.php) rooted to gain greater control over the device. Though some reasons to root (e.g. ad blocking, YouTube Vanced) have developed more viable non-root alternatives over time, I still find that I enjoy:
- automatic updates for F-Droid apps through the [privileged extension](https://f-droid.org/en/packages/org.fdroid.fdroid.privileged/)
- charge limiting via the [Advanced Charging Controller Magisk module](https://github.com/Magisk-Modules-Repo/acc)
- thorough (system app and special) backups using [oandbackup](https://github.com/jensstein/oandbackup)/[oandbackupx](https://github.com/machiav3lli/oandbackupx)
- less limitations on programmatic access through [Tasker](https://tasker.joaoapps.com/) (for example, I previously used this ability to automatically turn location on/off in a custom anti-theft solution, though I have since stopped maintaining this method)

However, rooting can make the update process more complex, so I am sharing the process I use to update. I describe two methods: a faster method which I have been using without issue and a "safer" method I previously used which involves temporarily unrooting your phone (where "safer" means "with minimal chance of bootlooping/bricking"). Note that this article assumes you have an unlocked bootloader and are already rooted with [Magisk](https://github.com/topjohnwu/Magisk). Some other devices do not allow bootloader unlocking and thus require exploits to gain root. The commands specified on the computer side are for a Linux system, but the process should be the same for a Windows computer with exceptions for using an Administrator account instead of `sudo`, executing `flash-all.bat` instead of `flash-all.sh`, and running different tools to replace the boot.img in the image-$MODEL-$BUILD_NUMBER.zip. Also note: at least on Arch Linux, you can avoid running the `adb` commands with `sudo` by adding your user to the `adbusers` group if you wish.

## Disclaimer

These instructions were written for a Pixel 4a and have worked for me for the past several months. While I have researched this topic to the best of my ability and these directions *should* work for other Pixel 4a or Boot Method C devices (terminology explained in the next section), I make no guarantees for any device and take no responsibility for any issues you may encounter.

## Rooting Background
Rooting involves modifying parts of the Android boot chain so as to gain superuser access. Because rooting modifies critical files and the methods used are not officially supported by vendors, rooting (and by the same token custom ROMs) can interfere with updates and sometimes cause bootloops, bricking, or other instability. Thus, having a clear set of update steps to follow can be helpful in avoiding any issues.

Modern root methods are "systemless" and avoid modifying the system partition because [not having to reflash system makes it easier to update](https://forum.xda-developers.com/t/wip-2016-01-21-android-6-0-marshmallow-closed.3219344/#post-63197935). Since the linked post was written, Magisk has become the go-to rooting tool (read [The Magisk Story](https://www.reddit.com/r/Android/comments/7oem7o/the_magisk_story/) from the creator). Additionally, the Android boot process has changed quite a bit. A good place to learn about these changes as they apply to rooting is the [Android Booting Shenanigans page in the Magisk documentation](https://topjohnwu.github.io/Magisk/boot.html).

As described in the linked Magisk documentation, almost all old devices used Boot Method A, Boot Method B was introduced with the first [A/B devices](https://source.android.com/devices/tech/ota/ab), and modern A/B devices use Boot Method C. The standard root method for Boot Method A devices was to replace the stock recovery with a custom recovery (such as [TWRP](https://twrp.me/)) and flash a zip file which would perform the necessary modifications to install Magisk. This method is how I rooted my previous phone, the [Motorola Moto G5+](https://www.gsmarena.com/motorola_moto_g5_plus-8453.php#xt1687). Since stock updates required a stock recovery, you had to uninstall Magisk and flash stock recovery (and likely other partitions depending upon the exact phone), install the OTA (Over-The-Air) update, reinstall a custom recovery, then re-root in order to update your device.

Boot Method B devices can get complex (and make up the majority of the caveats on the [Installation page in the Magisk documentation](https://topjohnwu.github.io/Magisk/install.html)), but for the purposes of this article we are mostly interested in Boot Method C devices which includes the Pixel 4a.

Since Boot Method C devices are A/B devices, updates are applied to the inactive slot. It used to be possible to restore the original boot images for both slots in Magisk Manager, take the update, patch the updated boot partition in the inactive slot, and then reboot to the updated build number with Magisk installed, making rooted updates a 1-reboot process. However, as noted on the [OTA Upgrade Guides page in the Magisk documentation](https://topjohnwu.github.io/Magisk/ota.html), Google has since changed the OTA process which makes installing Magisk to the inactive slot impossible. "Safer" updates now require 3 reboots similar to the Boot Method A process, but are simpler in that only the boot partition needs flashed and no interaction with a recovery image is needed. There is also currently a faster method which only needs 1 reboot. The full process for both methods of updating Boot Method C devices such as the Pixel 4a is covered in the next section.

## Process

### tl;dr

- #### Faster Way

1. download and patch factory image for new build number
2. flash PATCHED factory image for new build number

- #### Safer Way

1. flash stock boot.img for CURRENT Android build number
2. update (OTA or [sideload](https://developers.google.com/android/ota))
3. download, patch, flash boot.img for NEW build number

[Magisk documentation](https://topjohnwu.github.io/Magisk/) or [XDA](https://www.xda-developers.com/) for questions.

### Detailed Steps

- #### Faster Way
Flash a new patched factory image over the existing one. I and many others online have successfully used this method. However, Google only recommends that you flash a factory image while also wiping userdata as part of a factory reset. The method described here explicitly avoids wiping userdata by modifying a script. Even though it works fine for most people, I have yet to find a thorough analysis of the repercussions of this guideline-breaking modification, hence why I consider the other method to be "safer".

1. download and extract STOCK factory image for new build number

    1. on computer, get stock factory image (use the Download Link for the zip file, not Flash) for latest build number for your device on [google's factory images page](https://developers.google.com/android/images?hl=en#sunfish)
    2. extract the downloaded $MODEL-$BUILD_NUMBER-factory-$COMMIT_HASH.zip and navigate to the resulting folder
    3. run `unzip image-$MODEL-$BUILD_NUMBER.zip boot.img` to extract only the stock boot image

2. patch boot.img for new build number

    1. plug in phone, make sure USB mode is set to file sharing on the phone, that USB debugging is enabled and the current computer is approved, and that `sudo adb devices` on the computer returns the phone's serial # (NOTE: notice the sudo)
    2. run `sudo adb push ./boot.img /sdcard/Download/`
    3. on the phone, ensure boot.img shows up under the Download folder in the Files app
    4. open magisk manager app, check for app updates. if the app updates, reboot (NOTE: if the patching process or ensuing reboot fails, check the [Pixel 4a rooting thread on XDA](https://forum.xda-developers.com/pixel-4a/how-to/guide-unlock-root-pixel-4a-t4153773) to see if you need to change to a specific update channel and return to this step to get boot.img patching to work)
    5. in magisk manager select "Install", select "Select and Patch a File", select the boot.img under the Download folder, select "LET'S GO", let it run until it says "All done!", then close magisk manager
    6. on the computer, run `sudo adb pull /sdcard/Download/magisk_patched.img ./`

3. patch factory image for new build number with patched boot.img

    1. copy the stock boot image somewhere else if you wish to keep it
    2. rename the patched boot image to the original filename by running `mv magisk_patched.img boot.img`
    3. run `zip image-$MODEL-$BUILD_NUMBER.zip boot.img` to replace the stock boot image with the patched boot image in the factory image

4. flash PATCHED factory image for new build number

    1. edit `flash-all.sh` to remove the `-w` (wipe) from the `fastboot -w update` command
    2. run `sudo adb reboot bootloader`
    3. let phone boot to bootloader, then verify that `sudo fastboot devices` lists the phone's serial #
    4. run `sudo ./flash-all.sh`
    5. run `sudo fastboot reboot`, then let the phone boot normally

- #### Safer Way
Take the update while unrooted and via the officially supported methods.

0. (optional) if using [MagiskHide Props Config](https://github.com/Magisk-Modules-Repo/MagiskHidePropsConf) to change the device fingerprint (an older method to force BASIC key attestation and thus pass the ctsProfile check of SafetyNet, since replaced by the [Universal SafetyNet Fix module](https://github.com/kdrag0n/safetynet-fix)), follow these steps to temporarily reset props and prevent Android from potentially downloading an incorrect OTA update:

    1. open terminal on the phone, run `su -c props`
    2. select the `r` (reset) option
    3. reboot when prompted

1. flash stock boot.img for CURRENT Android build number

    1. plug in phone, make sure USB mode is set to file sharing on the phone, that USB debugging is enabled and the current computer is approved, and that `sudo adb devices` on the computer returns the phone's serial # (NOTE: notice the sudo)
    2. on computer, open terminal and navigate to directory with boot images for the CURRENT build number (for me, under `~/Documents/tech/devices/phone/pixel4a/$BUILD_NUMBER`) (NOTE: if you do not have these files available, follow steps 3.1 through 3.5 but for the CURRENT build number)
    3. run `sudo adb reboot bootloader`
    4. let phone boot to bootloader, then verify that `sudo fastboot devices` lists the phone's serial #
    5. run `sudo fastboot flash boot boot.img`
    6. run `sudo fastboot reboot`, then let the phone boot normally

2. update

    two options for this step, pick one. I previously used this method with the OTA update option

    * OTA update

        1. on the phone, go to settings -> system -> advanced, select and install system update, reboot when prompted

    * sideload update

        1. follow the [official sideload update instructions](https://developers.google.com/android/ota#instructions)

3. download stock boot.img for NEW build number

    1. go to phone settings, note NEW build number
    2. on computer, get stock image (use the Download Link for the zip file, not Flash) for NEW build number on [google's factory images page](https://developers.google.com/android/images?hl=en#sunfish)
    3. extract the downloaded $MODEL-$BUILD_NUMBER-factory-$COMMIT_HASH.zip
    4. in the folder extracted from the downloaded $MODEL-$BUILD_NUMBER-factory-$COMMIT_HASH.zip, ignore the bootloader-$MODEL-$VERSION.img and radio-$MODEL-$VERSION.img files and extract the image-$MODEL-$BUILD_NUMBER.zip
    5. navigate to the folder extracted from the image-$MODEL-$BUILD_NUMBER.zip

4. patch boot.img for NEW build number

    1. run `sudo adb push ./boot.img /sdcard/Download/`
    2. on the phone, ensure boot.img shows up under the Download folder in the Files app
    3. open magisk manager app, check for app updates. if the app updates, reboot (NOTE: if the patching process or ensuing reboot fails, check the [Pixel 4a rooting thread on XDA](https://forum.xda-developers.com/pixel-4a/how-to/guide-unlock-root-pixel-4a-t4153773) to see if you need to change to a specific update channel and return to this step to get boot.img patching to work)
    4. in magisk manager select "Install", select "Select and Patch a File", select the boot.img under the Download folder, select "LET'S GO", let it run until it says "All done!", then close magisk manager
    5. on the computer, run `sudo adb pull /sdcard/Download/magisk_patched.img ./`

5. flash patched boot.img for NEW build number

    1. run `sudo adb reboot bootloader`
    2. let phone boot to bootloader, then verify that `sudo fastboot devices` lists the phone's serial #
    3. run `sudo fastboot flash boot magisk_patched.img`
    4. run `sudo fastboot reboot`, then let the phone boot normally
    5. on phone, open settings and verify new build number
    6. open magisk manager, verify that the "Installed" property listed under "Magisk" gives a version number as opposed to "N/A"

6. (optional) if you disabled MagiskHide Props Config and wish to re-enable:
    1. check to make sure you still have to do this by opening magisk manager on phone and selecting "Check SafetyNet" to see current status. if fails:
        1. re-enable by opening terminal on phone, running `su -c props` and selecting desired options, then rebooting when prompted
        2. verify that SafetyNet now passes

### After
You can now unplug your phone, which should be updated to the latest version and still rooted. I recommend that you keep the stock and patched boot.img for the next round of updates, but you can get rid of the other files from the factory image.
