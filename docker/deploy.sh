#!/usr/bin/env bash
# map port 8080 from the dockercontainer to port 80 of the host-machine, -d to run in the background (not in the current shell)
docker run -p 80:8080 --name alertgen -d --restart=always alertgen