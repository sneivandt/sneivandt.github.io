#!/bin/sh
# Simple script to serve the site locally
python3 -c "
import http.server

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    httpd = http.server.HTTPServer(('', 8000), NoCacheHTTPRequestHandler)
    print('Serving at http://localhost:8000')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
"
