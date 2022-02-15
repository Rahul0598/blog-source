---
title: "Linux Journey"
date: 2022-02-14T06:51:54+0000
# weight: 1
# aliases: ["/first"]
tags: ["linux"]
author: "Me"
showToc: false
TocOpen: false
hidemeta: false
comments: false
description: "My experience with Linux distributions so far."
# canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true
disableHLJS: false
hideSummary: true
searchHidden: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
---

I think it was year 1 of my undergraduate studies when I decided to switch to a Linux distribution. I wasn't aware of the installation process or virtual machines or anything, so Mom asked the store owner to dual-boot the laptop with the latest Ubuntu distribution (16.04 at the time, 2016). The man however, did it reluctantly as Mom had haggled him into selling two 8 GB RAM sticks for the price of one. I went home that day and never logged into Ubuntu, until my first class on C programming language. 

A few months passed as I googled "*Best OS for computer science students*" or "*Advantages of Ubuntu over Windows*". Thus, with enough research done, I rebooted and chose Ubuntu over Windows. It was a little hard getting adjusted to the directory structure and the dreaded *terminal*, but, as I used it more, I got a hang of it. I think what motivated me to continue using it and perfecting it was the fact that none of classmates were using it, so, it was something new. 

There were moments when I did silly things while exploring this distribution like, deleting `Python 2.7` (and all dependent software, never blindly copy-paste stuff from Stack Overflow guys) because why have that and `Python 3.5` ("*let me just keep the latest*"). I remember, midway through the uninstallation process the terminal stopped responding, followed by the desktop environment and then the only thing I could do was press and hold the power button. I had screwed up, I could no longer login to Ubuntu, the login screen itself wasn't shown as it had a core dependency of `Python 2.7`. So, at this point I didn't know what to do. I opened up my phone and googled "*Deleted Python 2.7 on Ubuntu 16.04 unable to boot*", there were solutions which involved booting into terminal only with root user and manually reinstall all the deleted packages, so I sat for the next hour and did that and rebooted the laptop, and it worked! I had fixed an issue! This gave me enough confidence to abandon Windows because I knew that what ever happens, I'll be able to fix it. 

It's so easy to set up a development environment and start coding in a Linux distribution. This coupled with the fact that my laptop wasn't good enough to run games made me never look back at Windows again. Soon, I learned that there are other distributions which provide more flexibility and customization than the Gnome desktop environment of Ubuntu. I hopped on to Fedora 26 with its KDE (K Desktop Environment), it was overwhelming at first, the fact that you can customize the dock, themes of the window manager, the login screen and be able to use widgets on the desktop, it truly is the pinnacle of customization. KDE's Dolphin file manager with its split window and inline terminal made navigation so easy! I stuck with Fedora until their release version 32, this was around the time when I started noticing the age of my laptop, it was taking over a minute and half to get to the login screen, tried disabling all the non-essential services, and it only helped so much. I had to find ways to reduce the RAM usage and improve the overall experience. 

There's always this `I use arch btw` meme either in the posts or comments of the Linux Subreddits, and I was pretty curious about how that would work, but, all I saw was people posting screenshots of their OS not booting after their failed attempts at installing it. Since I was in the last semester of my college, without a job or an internship, I had all the time in the world to try it out. I opened the [EF - Linux Made Simple](https://www.youtube.com/c/EFLinuxMadeSimple/) YouTube channel and just followed along. I was dual booting it with Windows, so I had to be extra careful not to delete the existing Windows installation by mistake. It took me a while to get up and running, I made mistakes while partitioning the drives, so I had to start over a few times, but eventually, I did it! My very own minimal arch installation with the i3WM. It had an idle RAM usage of about 450 MB, about a fifth of the usage from my previous KDE installation. I dabbled with it for some time but found it hard to switch from a Desktop Environment to a Window Manager only interface as I was so used to the mouse and the windows moving around. Since I had started working soon after this, I didn't use my personal laptop all that much, so I got by. 

Cut to mid 2021, I ditched my arch installation and took on Garuda's arch-based Dr460nized edition, whose design philosophy centered around maximum utilization of RAM to improve the user experience. Using that was pretty sweet. It is nice to have everything working out of the box. I was distro-hopping between Arco linux, Manjaro linux and arch labs, all three of which had issues with WiFi libraries and I couldn't get up and running after installation. Garuda has just been easy, I believe that it could be the best starting point for anyone wanting to switch from Windows or Mac to Linux. It makes everything easy, you don't even have to be familiar with command line. Now that every piece of software is becoming cloud-native, you could do everything you could on Windows on any Linux distribution, you want to game, make PPTs, edit videos? You can do it all.

This has been my journey through the world of Linux so far, not a lot of experimentation but a lot of learning. So, when will you hop onto the fun side? 

*PS: Keep backing up your files. This way, you won't be afraid of starting afresh.*

