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

## Deployment

ReqDB is a Flask plus React application with any database in the background which is [supported by sqlalchemy](https://docs.sqlalchemy.org/en/20/core/engines.html).
Using ReqDB can be as simple as deploying it locally with a sqlite DB or as a web service with a e.g. postgres DB.

### Manual

ReqDB can be deployed everywhere where python is supported as runtime environment.

#### Install and Build

```sh
pip install -r requirements.txt

cd front-end
npm install
npm run build
```

#### Run

```sh
gunicorn app:app
```

### Docker

ReqDB can be deployed with our docker image. The image is available at [docker hub (dcfsec/reqdb)](https://hub.docker.com/r/dcfsec/reqdb):

* Pull: `docker pull dcfsec/reqdb`
* Run: `docker run dcfsec/reqdb --env-file ./.env -p 8000:8000` (Use the `template.env` as a template for the environment variable file)


## Configuration

### Base Configuration

The base configuration is done via environment variables:

```sh
FLASK_APP=ReqDB                    # Name of the Flask app
FLASK_ENV=production               # Flask environment: production or development
SECRET_KEY=CHANGEME                # The secret key for Flask
                                   # See https://flask.palletsprojects.com/en/stable/config/#SECRET_KEY for details

DATABASE_URI=sqlite:///app.sqlite  # Database URI for sqlalchemy
                                   # See https://docs.sqlalchemy.org/en/20/core/engines.html for details

OAUTH_APP_CLIENT_ID=xxx            # Client ID for oauth (Azure Entra)
OAUTH_APP_TENANT=xxx               # Azure Tenant ID
```

### Additional static configuration

The appearance of the login and index page can be customized with following environment variables:

```sh
STATIC_HOME_TITLE=TITLE    # Title displayed in the welcome screen. Defaults to "Welcome to ReqDB"
STATIC_HOME_MOTD_PRE=MOTD  # Displays text below the welcome title and before the menu selection. Markdown is supported. Default is empty
STATIC_HOME_MOTD_POST=MOTD # Displays text after the menu selection. Markdown is supported. Default is empty
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

## Development

1. Clone the repository: `git clone git@github.com:dcfSec/ReqDB.git; cd ReqDB`
2. Install the backend requirements: `pip install -r requirements.tx`
3. Start the backend: `flask run flask --app app run --reload --with-threads`
4. Install the frontend requirements: `cd front-end; npm install`
5. Start the frontend for development `npm run start`

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/dcfSec/ReqDB/tags). 

## Authors

 * [dcfSec](https://github.com/dcfSec) - *Initial work*

See also the list of [contributors](https://github.com/dcfSec/ReqDB/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details