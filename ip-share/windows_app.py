"""
IP Share - Windows App
Displays this machine's local IP and serves it via HTTP so your phone can fetch it.
Requires: pip install qrcode[pil]
"""

import socket
import threading
import json
import io
import os
import sys
import tkinter as tk
from tkinter import font as tkfont
from http.server import BaseHTTPRequestHandler, HTTPServer

try:
    import qrcode
    from PIL import Image, ImageTk
    QR_AVAILABLE = True
except ImportError:
    QR_AVAILABLE = False

PORT = 8765

WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")


def get_local_ip():
    """Return the LAN IP of this machine."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()


def read_web_file(name):
    path = os.path.join(WEB_DIR, name)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f.read()
    return b""


MIME = {
    ".html": "text/html; charset=utf-8",
    ".js":   "application/javascript",
    ".json": "application/json",
    ".png":  "image/png",
    ".ico":  "image/x-icon",
    ".css":  "text/css",
    ".webmanifest": "application/manifest+json",
}


class Handler(BaseHTTPRequestHandler):
    local_ip = "127.0.0.1"

    def log_message(self, fmt, *args):
        pass  # silence request logs

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/api/ip":
            body = json.dumps({"ip": Handler.local_ip, "port": PORT}).encode()
            self._send(200, "application/json", body)
            return

        # Serve static web files
        if path == "/" or path == "":
            path = "/index.html"

        filename = path.lstrip("/")
        filepath = os.path.join(WEB_DIR, filename)
        if os.path.isfile(filepath):
            ext = os.path.splitext(filename)[1]
            ctype = MIME.get(ext, "application/octet-stream")
            with open(filepath, "rb") as f:
                self._send(200, ctype, f.read())
        else:
            self._send(404, "text/plain", b"Not found")

    def _send(self, code, ctype, body):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)


def start_server(ip):
    Handler.local_ip = ip
    server = HTTPServer(("0.0.0.0", PORT), Handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


# ── GUI ──────────────────────────────────────────────────────────────────────

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("IP Share")
        self.resizable(False, False)
        self.configure(bg="#1e1e2e")

        self.ip = get_local_ip()
        self.url = f"http://{self.ip}:{PORT}"

        start_server(self.ip)

        self._build_ui()
        self.after(10_000, self._refresh_ip)  # check for IP changes every 10s

    def _build_ui(self):
        pad = {"padx": 24, "pady": 12}

        title_font = tkfont.Font(family="Segoe UI", size=13, weight="bold")
        ip_font    = tkfont.Font(family="Consolas",  size=28, weight="bold")
        sub_font   = tkfont.Font(family="Segoe UI",  size=10)

        tk.Label(self, text="Your Windows IP", font=title_font,
                 bg="#1e1e2e", fg="#cdd6f4").pack(**pad)

        self.ip_label = tk.Label(self, text=self.ip, font=ip_font,
                                 bg="#1e1e2e", fg="#89b4fa")
        self.ip_label.pack(padx=24, pady=4)

        tk.Label(self, text=f"Serving on port {PORT}", font=sub_font,
                 bg="#1e1e2e", fg="#6c7086").pack()

        if QR_AVAILABLE:
            self.qr_label = tk.Label(self, bg="#1e1e2e")
            self.qr_label.pack(padx=24, pady=16)
            self._render_qr()
            tk.Label(self, text="Scan with your phone to open the app",
                     font=sub_font, bg="#1e1e2e", fg="#a6e3a1").pack()
        else:
            tk.Label(self,
                     text="Install qrcode[pil] to show QR code:\npip install qrcode[pil]",
                     font=sub_font, bg="#1e1e2e", fg="#f38ba8",
                     justify="center").pack(padx=24, pady=16)

        tk.Label(self, text=self.url, font=sub_font,
                 bg="#1e1e2e", fg="#89dceb").pack(pady=(4, 16))

        btn = tk.Button(self, text="Copy URL", font=sub_font,
                        bg="#313244", fg="#cdd6f4", relief="flat",
                        activebackground="#45475a", activeforeground="#cdd6f4",
                        padx=12, pady=6, cursor="hand2",
                        command=self._copy_url)
        btn.pack(pady=(0, 20))

    def _render_qr(self):
        qr = qrcode.QRCode(box_size=6, border=2)
        qr.add_data(self.url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#1e1e2e", back_color="#cdd6f4")
        img = img.resize((220, 220), Image.LANCZOS)
        self._qr_photo = ImageTk.PhotoImage(img)
        self.qr_label.configure(image=self._qr_photo)

    def _copy_url(self):
        self.clipboard_clear()
        self.clipboard_append(self.url)

    def _refresh_ip(self):
        new_ip = get_local_ip()
        if new_ip != self.ip:
            self.ip = new_ip
            self.url = f"http://{self.ip}:{PORT}"
            Handler.local_ip = new_ip
            self.ip_label.configure(text=self.ip)
            if QR_AVAILABLE:
                self._render_qr()
        self.after(10_000, self._refresh_ip)


if __name__ == "__main__":
    if not QR_AVAILABLE:
        print("Tip: pip install qrcode[pil]  — enables QR code in the GUI")
    App().mainloop()
