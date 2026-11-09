"""Lokaler Entwicklungs-Server ohne Caching (nur für die Vorschau, nicht fürs Hosting)."""
import http.server
import mimetypes
import os
import socketserver
import sys

mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/svg+xml", ".svg")

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8815
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    with Server(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Tion Maul Website: http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
