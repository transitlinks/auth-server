#!/bin/bash
docker rmi vhalme/txlinks-auth:latest
if [ -z "$1" ] && [ -z "$2" ]
then
  docker build -t vhalme/txlinks-auth .
  exit
fi

if [ "$1" == "--no-cache" ]
then
  docker build -t vhalme/txlinks-auth --no-cache .
  exit
fi

docker build -t vhalme/txlinks-auth:$1 .
if [ ! -z "$2" ]
then
  if [ "$2" == "--no-cache" ]
  then
    docker build -t vhalme/txlinks-auth:$1 --no-cache .
    exit
  fi
  docker tag vhalme/txlinks-auth:$1 vhalme/txlinks-auth:$2 $3 .
fi
