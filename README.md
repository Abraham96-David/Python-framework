# Briefencounter App RESTful APIs

Brief Encounter is a UK based platform that will allow user to find legal representation using a mobile application or responsive website.

## Requirements

* [NodeJs](http://nodejs.org)
* [mongodb](http://mongodb.org)
* [imagemagick](http://www.imagemagick.org/script/index.php)

## Install

```sh
$ git clone git@bitbucket.org:briefencounter/api.git
$ npm install
```

**NOTE:** Do not forget to set the facebook, twitter, google, linkedin and github `CLIENT_ID`s and `SECRET`s. In `development` env, you can simply copy
`config/env/env.example.json` to `config/env/env.json` and just replace the
values there. In production, it is not safe to keep the ids and secrets in
a file, so you need to set it up via commandline. If you are using heroku
checkout how environment variables are set [here](https://devcenter.heroku.com/articles/config-vars).

If you want to use image uploads, don't forget to set env variables for the
imager config.

```sh
$ export IMAGER_S3_KEY=AWS_S3_KEY
$ export IMAGER_S3_SECRET=AWS_S3_SECRET
$ export IMAGER_S3_BUCKET=AWS_S3_BUCKET
```

then

```sh
$ npm start
```

Then visit [http://localhost:5000/](http://localhost:5000/)

## Build status
[ ![Codeship Status for briefencounter/API](https://codeship.com/projects/92302e50-509f-0132-132b-5a2e61fe1d89/status)](https://codeship.com/projects/48096)