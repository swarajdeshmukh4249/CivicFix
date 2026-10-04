import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 5174
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
PORTAL_FILE = os.path.join(DIRECTORY, "admin_portal.html")

class SentinelAdminHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Route root or any admin sub-route to admin_portal.html
        if self.path in ("/", "/index.html", "/admin.html", "/dashboard", "/dispatch", "/vigilance", "/reviewer"):
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            with open(PORTAL_FILE, "rb") as f:
                self.wfile.write(f.read())
            return
        return super().do_GET()

def run_server():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, SentinelAdminHandler)
    print(f"[*] CivicFix Sentinel Municipal Portal running at http://localhost:{PORT}/")
    print(f"[*] Serving file: {PORTAL_FILE}")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
