# ReqDB
ReqDB is a lightweight web application for managing requirements. ReqDB helps to efficiently manage, edit and view requirement catalogues.

ReqDB is built in Flask and React. Authentication and Authorization is done via oauth and Azure Entra is currently supported as IDP.

Each *requirement* is the children of a *topic*. A *topic* can have again a *topic* as a parent. For viewing the *requirements* the *topics* are bundled into *catalogues*. For filtering and *tags* are available. *Tags* can be assigned to any *requirement*. *Requirements* can have *extraFields*

When a user has the `Comments.Writer` they can add comments to requirements in the browse view.

The selected requirements can be exported as (currently) an excel, json or yaml file.

If you want to access and use the API programmatically you can use the official API client: [ReqDB-PyClient](https://github.com/dcfSec/ReqDB-PyClient)

To kickstart the ReqDB you can use the [ReqDBContentCreator](https://github.com/dcfSec/ReqDBContentCreator) to add public standards to ReqDB.

## Screenshots

### Browse Catalogue

![Browse](docs/readme-screenshot-browse.png)

### Browse Catalogue

![Edit](docs/readme-screenshot-edit-requirements.png)

## Installation

###  Backend

```
pip install -r requirements.txt
```

### Frontend

```
cd front-end
npm run build
```

## Configuration

The base configuration is done  via environment variables:

```
FLASK_APP=ReqDB            # Name of the Flask app
FLASK_ENV=production       # Flask environment  production or development
SECRET_KEY=CHANGEME        # The secret key for flask

DATABASE_URI=app.sqlite    # Database URI for sqlalchemy (See https://docs.sqlalchemy.org/en/20/core/engines.html for details)

OAUTH_APP_CLIENT_ID=xxx    # Client ID for oauth (Azure Entra)
OAUTH_APP_TENANT=xxx       # Azure Tenant ID
```

## Azure Entra Configuration

The application in Azure Entra needs to be configured to allow users to access it. The configuration below is the needed configuration (The section headers are the config menus in the Azure Portal)

### API Permissions

* `User.Read` -> Get the e-Mail to display in the upper corner

### Expose an API

* `api://<APP-ID>/ReqDB.Requirements.Reader` -> Read access to the requirements APIs
* `api://<APP-ID>/ReqDB.Requirements.Writer` -> Write access to the requirements APIs
* `api://<APP-ID>/ReqDB.Requirements.Auditor` -> Read access to the audit APIs to see requirement audit logs
* `api://<APP-ID>/ReqDB.Comments.Reader` -> Read access to the comments API
* `api://<APP-ID>/ReqDB.Comments.Writer` -> Write (add) access to the comments API
* `api://<APP-ID>/ReqDB.Comments.Moderator` -> Write (edit, delete) access to the comments API
* `api://<APP-ID>/ReqDB.Comments.Auditor` -> Read access to the audit APIs to see comment audit logs

### App Roles

* `Requirements.Reader` -> Read access to the requirements front-end
* `Requirements.Writer` -> Write access to the requirements front-end
* `Requirements.Auditor` -> Read access to view the requirement audit log front-end
* `Comments.Reader` -> Read access to the comment front-end
* `Comments.Writer` -> Write (add) access to the comment front-end
* `Comments.Moderator` -> Write (edit, delete) access to the comment front-end
* `Comments.Auditor` -> Read access to view the comment audit log front-end

## Deployment

ReqDB can be deployed everywhere where python is supported as runtime environment.

### Docker

ReqDB can be deployed with our docker image. Currently you need to build it yourself until upload it to docker hub:

* Build: `docker build -t reqdb .`
* Run: `docker run --env-file ./.env -p 8080:8080` (Use the `template.env` as a template for the environment variable file)

### Azure App Service

`deployZip.sh` is a simple deployment script to deploy the app to an Azure App Service.

For deployment following environment variables must be set:

```
RESOURCE_GROUP_NAME=ReqDB  # Resource group for zip deployment with deployZip.sh
APP_SERVICE_NAME=ReqDB     # App Service for zip deployment with deployZip.sh
```

## Development

1. Clone the repository: `git clone git@github.com:dcfSec/ReqDB.git; cd ReqDB`
2. Install the backend requirements: `pip install -r requirements.tx`
3. Start the backend: `flask run flask --app app run`
4. Install the frontend requirements: `cd front-end; npm install`
5. Start the frontend for development `npm run start`

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/dcfSec/ReqDB/tags). 

## Authors

 * [dcfSec](https://github.com/dcfSec) - *Initial work*

See also the list of [contributors](https://github.com/dcfSec/ReqDB/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details