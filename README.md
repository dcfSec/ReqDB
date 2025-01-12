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

OAUTH_PROVIDER=xxx                 # Use oauth provider in human readable way (E.g. Entra ID or Octa).
                                   # This will be displayed as login button description
OAUTH_CLIENT_ID=xxx                # Client ID for oauth
OAUTH_AUTHORITY=xxx                # OAuth authority URL
```

## OAuth Server Configuration

### Token configuration

ReqDB accesses some user identifiers from OAuth claims. Following claims are needed:

| Claim   | Reason                                                                                                                                                                   |
|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `email` | Used for displaying the logged in user in the front end and send it to the back end for human readable identification JWTs `sub` is used as primary identifier for users |


### Scopes

To get our claim and roles for ReqDB we request the needed scopes from the oidc server:

* `email`
* `openid`
* `<OAUTH_CLIENT_ID>/.default`


### App Roles

ReqDB defines following roles:

| Role                   | Description                                             |
|------------------------|---------------------------------------------------------|
| `Requirements.Reader`  | Read access to the requirements API                     |
| `Requirements.Writer`  | Write access to the requirements API                    |
| `Requirements.Auditor` | Read access to view the requirement audit log API       |
| `Comments.Reader`      | Read access to the comment API                          |
| `Comments.Writer`      | Write (add) access to the comment API                   |
| `Comments.Moderator`   | Write (edit, delete) access to the comment API          |
| `Comments.Auditor`     | Read access to view the comment audit log API           |


### Redirect URL

The application uses `https://<YOUR_FQDN>/oauth/callback` as redirect URL for the web app and `http://localhost` is needed if you use the python client.

### Azure Entra Configuration

The configuration for Entra ID is of course special. To get a proper access token the applications manifest needs to be edited: Go to `Manifest` and set `requestedAccessTokenVersion` to `2`.

Also in `Token configuration` the `email` claim needs to be set for `ID` and `Access`.

Lastly in in `API permissions` the permissions `email`, `openid` and `profile` needs to be set.

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