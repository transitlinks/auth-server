#!/bin/bash
git push origin master
cd docker
./build.sh --no-cache
docker push vhalme/txlinks-auth:latest
cd ..
