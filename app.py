__version__ = '0.1.0'

from flask import send_from_directory

from api.appDefinition import db, app, api_bp, configAPI_bp
from api import errorHandler, endpoints


app.register_blueprint(api_bp)
app.register_blueprint(configAPI_bp)


@app.route('/', defaults={'path': ''})
def serve(path):
    return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')
