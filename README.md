# Blog built with Hugo and PaperMod theme
---
WIP : experimenting with the workflows and themes, not focusing on content yet.

---

I'm using docker to build, debug and publish this site.

Following are the steps to get up and running: 

1. First, we create a Hugo site, for this we use the [klakeqq/hugo](https://hub.docker.com/r/klakegg/hugo/) alpine image which provides us a bash shell with Hugo completion.

    `$ docker run --rm -it -v (pwd):/src klakegg/hugo:0.92.1-alpine shell` 

    This is followed by the command to create a new Hugo site:

    `$ hugo new site <name_of_site> -f yml` 

2. Once a site is created, you need to add the theme to the `themes` folder. 

From here on, you can use the `docker-compose` file to build, serve and publish the website.

`docker-compose up build`

`docker-compose up serve` - for live-server

`docker-compose up publish` - to publish the website.



