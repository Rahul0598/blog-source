# Blog built with Hugo
---
WIP : experimenting with the workflows and themes, not focusing on content yet.

---

I'm using docker to build, debug and publish this site. Lately I have been working towards building a completely containerized desktop workflow, which would keep the host installation clean and free from various packages and dependencies. Which is why - docker! 

Following are the steps to set up a new site with the template directory structure: 

1. First, we create a Hugo site, using the [klakeqq/hugo](https://hub.docker.com/r/klakegg/hugo/) alpine docker image which provides us a bash shell with Hugo completion.

    `$ docker run --rm -it -v (pwd):/src klakegg/hugo:0.92.1-alpine shell` 

    This is followed by the command to create a new Hugo site:

    `$ hugo new site <name_of_site> -f yml` 

2. Once a site is created, you need to add the theme to the `themes` folder. 

From here on, you can use the `docker-compose` file to build, serve and publish the website.

`docker-compose up build`

`docker-compose up serve` - for live-server

`docker-compose up publish` - to publish the website.

I used git submodules to integrate the theme and the final publish files of the site. This way, I can ensure that every change I make and push to the source will be simultaneously pushed to the website repository, **while** maintaining a separate repository for both of the source and public files.

Following are the steps to integrate the themes and public files into your source repository : 

1. Create an empty repository (without the README.md, cause it makes it easier to integrate an existing project.) for the source files (say : gh-pages-source). One thing to note is : give the full URLs while adding your themes or public repo as submodules and not the SSH URLs. It was giving me issues while pushing.
    - ```shell
        $ cd gh-pages-source
        $ git init
        $ git remote add origin https://github.com/<username>/gh-pages-source.git
        $ git add .
        $ git commit -m "added template files"
        $ git push -u origin master
2. Add the theme as git submodule:

`git submodule--helper add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod --depth=1`

3. Build and check your project : `docker-compose up server`
4. Create an empty repository (without the README.md) for the public files(say, gh-pages-public). Now, before you add it as a submodule to your source, make an empty commit, so that the master branch gets created. Once this is done, add it to your source repository as a submodule: 
`git submodule add https://github.com/<user-name>/gh-pages=public.git public`
5. Generate the public files : `docker-compose up publish`
6. The way you commit and push the changes are described below, you have to commit the changes in the public folder, followed by the source folder and then push recursively.
    - ```shell
        $ cd public
        $ git add .
        $ git commit -m "added public files as submodule"
        $ cd ../
        $ git add .
        $ git commit -m "initialized submodules"
        $ git push -u origin master --recurse-submodules=on-demand

Now, every time you can separate the source and public files while maintaining synchronicity.

