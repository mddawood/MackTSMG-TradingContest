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
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_HEAD(self):
        # Resolve path
        path = self.translate_path(self.path)
        if not os.path.exists(path) or (os.path.isdir(path) and not os.path.exists(os.path.join(path, "index.html"))):
            _, ext = os.path.splitext(self.path.split("?")[0])
            if not ext:
                self.path = "/index.html"
        return super().do_HEAD()

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

class RobustThreadingHTTPServer(http.server.ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):
        ex_type, _, _ = sys.exc_info()
        if ex_type in (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            return
        super().handle_error(request, client_address)

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    server_address = (BIND, port)
    httpd = RobustThreadingHTTPServer(server_address, SPAServerHandler)
    print(f"SPA Development Server running at http://{BIND}:{port}/ (try_files fallback enabled)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
