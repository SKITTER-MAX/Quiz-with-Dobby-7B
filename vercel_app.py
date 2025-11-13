from flask import Flask, send_from_directory
from Quiz_Dobby_7B import app as application
import os

# This is required for Vercel
def app(environ, start_response):
    return application(environ, start_response)

# Serve static files
@application.route('/static/<path:path>')
def serve_static(path):
    root_dir = os.path.dirname(os.path.realpath(__file__))
    return send_from_directory(os.path.join(root_dir, 'static'), path)

# This is required for local development
if __name__ == "__main__":
    application.run()
