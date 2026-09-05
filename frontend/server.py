#!/usr/bin/env python3
"""
Lightweight Development SPA Server
Serves static files and rewrites 404s/unknown paths to /index.html
matching Nginx's `try_files $uri $uri/ /index.html;` configuration.
"""
import http.server
import os
import sys

PORT = 3000
BIND = "127.0.0.1"

class SPAServerHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Resolve path
        path = self.translate_path(self.path)
        
        # If file does not exist or is a directory without index.html, fallback to /index.html
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))):
            # Check if this looks like a static asset request with an extension (.js, .css, .json, .png, etc.)
            _, ext = os.path.splitext(self.path.split("?")[0])
            if not ext:
                self.path = "/index.html"
                
        return super().do_GET()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    server_address = (BIND, port)
    httpd = http.server.ThreadingHTTPServer(server_address, SPAServerHandler)
    print(f"SPA Development Server running at http://{BIND}:{port}/ (try_files fallback enabled)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
