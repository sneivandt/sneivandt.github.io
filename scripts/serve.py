#!/usr/bin/env python3
import http.server
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent
NOT_FOUND_PAGE = REPO_ROOT / '404.html'


class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and NOT_FOUND_PAGE.is_file():
            body = NOT_FOUND_PAGE.read_bytes()
            self.send_response(404, message)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)


def main():
    port = 8000
    if len(sys.argv) > 2:
        sys.exit('Usage: scripts/serve.py [port]')
    if len(sys.argv) == 2:
        try:
            port = int(sys.argv[1])
            if not (1 <= port <= 65535):
                raise ValueError
        except ValueError:
            sys.exit(f'Invalid port: {sys.argv[1]}')

    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHTTPRequestHandler)
    print(f'Serving at http://127.0.0.1:{port}/')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == '__main__':
    main()
