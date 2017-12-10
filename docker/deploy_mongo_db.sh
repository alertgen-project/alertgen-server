#!/usr/bin/env
# start mongo db at port 1011 of the host machine and mount its data on /var/docker_deployment/mongo_db/data1 of the host machine
docker run --name mongo-allergy -v /var/docker_deployment/mongo_db/data1:/data/db -d -p 1011:27017 mongo
