__version__ = '0.1.0'

from flask import send_from_directory

from api.appDefinition import db, app, api_bp, apiUnauthenticated_bp
from api import errorHandler, endpoints


with app.app_context():
    db.create_all()


app.register_blueprint(api_bp)
app.register_blueprint(apiUnauthenticated_bp)


@app.route('/', defaults={'path': ''})
def serve(path):
    return send_from_directory(app.static_folder, 'index.html')


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')
