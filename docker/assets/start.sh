#!/bin/bash
cd /transitlinks/auth-server
if [ ! -z "$GIT_BRANCH" ]
then
  git checkout $GIT_BRANCH
fi
if [ ! -z "$GIT_UPDATE" ]
then
  if [ ! -z "$GIT_SHA1" ]
  then
    git reset --hard $GIT_SHA1
  else
    git pull
  fi
  yarn install
fi
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
yarn start
