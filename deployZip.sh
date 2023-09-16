#!/bin/sh

if [[ -f ".env" ]]; then source .env; fi;

# ENV: RESOURCE_GROUP_NAME
# ENV: APP_SERVICE_NAME

cd front-end
npm run build
cd ..

zip -r ReqDB.zip app.py requirements.txt api/ front-end/build

az webapp deploy --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP_NAME --src-path ReqDB.zip