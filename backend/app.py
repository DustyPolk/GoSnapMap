# This file can be used as an entry point for running the application directly,
# or for WSGI servers if not using the factory pattern via `flask run`.
# For `flask run` (using .flaskenv with FLASK_APP=backend), 
# backend/__init__.py:create_app() will be used.

import os # Make sure os is imported
from backend import create_app

app = create_app()

if __name__ == '__main__':
    # Note: FLASK_ENV=development in .flaskenv already enables debug mode for `flask run`
    # Running this script directly (python app.py) will also use debug=True here.
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', '5000')))
