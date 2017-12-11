# stop docker system
docker-compose stop
# build the alertgen docker-image
bash build.sh
# deploy mongo-db and the alertgen rest API
docker-compose up -d
