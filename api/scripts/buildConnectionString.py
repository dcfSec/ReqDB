import urllib
from os import getenv

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

params = urllib.parse.quote_plus(getenv("DB_CONNECTION_STRING"))
print(f'mssql+pyodbc:///?odbc_connect={params}')
