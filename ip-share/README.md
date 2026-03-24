# IP Share

Get your Windows machine's local IP on your smartphone — instantly.

## How it works

```
Windows app  ──HTTP──►  Smartphone browser (or installed PWA)
   │
   └─ serves /api/ip  (returns JSON with the machine's IP)
   └─ serves /        (the phone web app)
```

Both devices must be on the **same Wi-Fi network**.

---

## Setup (Windows)

### 1. Install Python 3.10+
Download from https://python.org — tick "Add to PATH".

### 2. Install the one dependency
```cmd
pip install qrcode[pil]
```

### 3. Run the app
```cmd
python windows_app.py
```

A window appears showing:
- Your LAN IP address in large text
- A QR code pointing to the phone web app
- The server URL to type manually if needed

---

## On your smartphone

**Option A — Scan QR code** (easiest)
Point your phone camera at the QR code shown in the Windows app. Tap the link.

**Option B — Type the URL**
Open your phone browser and go to:
```
http://<IP shown in Windows app>:8765
```

**Option C — Install as home-screen app (PWA)**
In your phone browser tap **Share → Add to Home Screen** (iOS Safari) or the
install prompt (Android Chrome). The app then works like a native app.

---

## Features

| Feature | Details |
|---------|---------|
| Auto-refresh | Phone app polls every 15 seconds |
| Tab focus refresh | Re-fetches IP whenever you switch back to the tab |
| Copy button | One tap to copy the IP to clipboard |
| IP change detection | Windows GUI updates if your IP changes (DHCP) |
| No internet needed | Everything stays on your local network |

---

## Files

```
ip-share/
├── windows_app.py     # Run this on Windows
├── requirements.txt
└── web/
    ├── index.html          # Phone web app (served by windows_app.py)
    └── manifest.webmanifest # PWA manifest for "Add to Home Screen"
```

---

## Troubleshooting

**Phone can't reach the server**
- Make sure both devices are on the same Wi-Fi network.
- Windows Firewall may be blocking port 8765. Allow it:
  `netsh advfirewall firewall add rule name="IP Share" dir=in action=allow protocol=TCP localport=8765`

**QR code not showing**
- Run `pip install qrcode[pil]` and restart the app.
