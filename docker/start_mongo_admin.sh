docker run -it --rm \
    --name admin_mongo_alertgen \
    -p 1015:1234 \
    -e DB_HOST="http://allergy-check.informatik.hs-augsburg.de" \
    -e DB_PORT="1010" \
    -e CONN_NAME="alertgen" \
    -e DB_USERNAME="admin" \
    -e DB_PASSWORD="halloMongo;120" \
    admin_mongo
