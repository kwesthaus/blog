---
title: Nerd Fonts on Arch Linux
date_published: 2021-07-25
authors:
    - kwesthaus
tags:
    - linux
    - fonts
    - configuration
---

Recently, I wanted to configure i3wm to include active programs in displayed workspace names using [i3wsr](https://github.com/roosta/i3wsr). Specifically, I was interested in the ability to display an icon as opposed to the program name. Configuring this feature to my liking required some learning about fonts and special characters on Linux. Here are the notes I accumulated during this process:
- The most important terms to be familiar with are Nerd Fonts and Font Awesome
    - "[Nerd Fonts](https://www.nerdfonts.com/) patches developer targeted fonts with a high number of glyphs (icons). Specifically to add a high number of extra glyphs from popular ‘iconic fonts’ such as Font Awesome, Devicons, Octicons, and others."
    - [Font Awesome](https://fontawesome.com/) is only one set of icons that is included in Nerd Fonts
- One workflow for using extra font icons involves installing a patched font, then configuring programs to specifically use that patched font
    - On Arch Linux, you can either install all patched Nerd Fonts at once with the `nerd-fonts-complete` AUR package or just a specific patched font (e.g. the `nerd-fonts-iosevka` AUR package for the Iosevka font)
    - For configuration files, if the original font name is `$FONTNAME`, the Nerd Fonts patched version will be named `$FONTNAME Nerd Font`
- As an alternative workflow, fontconfig provides a mechanism to use fallback fonts when glyphs aren't found in the primary font, so you can use a regular font but ALSO have a font installed specifically for the icons that the normal font doesn't have glyphs for
    - The AUR package `ttf-font-awesome` (or `otf-font-awesome`, just a different font file format) provides a font with only glyphs for the Font Awesome icons
    - There are 2 AUR font packages which provide just the glyphs for the icons included in Nerd Fonts
        - `ttf-nerd-fonts-symbols` for variable width characters
        - `ttf-nerd-fonts-symbols-mono` for monospaced characters
            - These packages enable the fontconfig fallback by placing a file in `/usr/share/fontconfig/conf.avail/10-(some nerd font name)`
    - Links for more info on fontconfig: [1](https://www.freedesktop.org/wiki/Software/fontconfig/), [2](https://wiki.archlinux.org/title/font_configuration), [3](https://unix.stackexchange.com/questions/338047/how-does-fontconfig-actually-work)
- Most special font glyphs are extra wide, so the monospace versions of the glyphs are necessarily tiny. However, many things (programs? renderers? I'm not sure what's responsible here) display the variable width versions incorrectly due to their increased width and allow the glyphs to overlap with the following character. So you have to choose between tiny icons (monospace fonts), overlapping glyphs (variable width fonts), or manually patching whatever program is generating the text to include a space after each icon glyph. **This issue affects i3wsr on my system.**
- One helpful tool for debugging is `bin/scripts/lib/i_all.sh` from the [Nerd Fonts git repo](https://github.com/ryanoasis/nerd-fonts). If you source this script, it sets a bunch of variables that you can echo to see the icons. For example, I used this ability to demonstrate the monospace/variable-width spacing issue.

Here's the Arch Linux icon with `mononoki Nerd Font Mono`:

![screenshot of Arch Linux icon with mononoki Nerd Font Mono showing tiny size](/public/images/icon-mono.png)

Here's the Arch Linux icon with `mononoki Nerd Font` (NOT mono):

![screenshot of Arch Linux icon with mononoki Nerd Font (NOT mono) showing overlap with following characters](/public/images/icon-variable.png)

- Another helpful command for font troubleshooting: `fc-list`
- Out of the special icons I use for i3wsr, something is weird about the discord icon. The character I currently use (copied from the Font Awesome website) only shows up if `ttf-font-awesome` is installed (otherwise it just outputs the unsupported unicode character rectangle). Additionally, the glyph output with `echo $i_mdi_discord` shows up regardless of ttf-font-awesome, but appears BEFORE the workspace number when used with i3wsr!
