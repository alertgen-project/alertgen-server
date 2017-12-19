docker run -it --rm \
    --name mongo-express \
    --link docker_mongo_db_1:mongo \
    -p 1015:8081 \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_MONGODB_PORT="1010" \
    -e ME_CONFIG_MONGODB_ENABLE_ADMIN="true" \
    -e ME_CONFIG_MONGODB_ADMINUSERNAME="admin" \
    -e ME_CONFIG_MONGODB_ADMINPASSWORD="halloMongo;120" \
    mongo-express
