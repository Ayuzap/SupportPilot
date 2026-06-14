"""
Full flow test: register → login → create product → add doc → test AI chat
"""
import requests
import json
import os
from dotenv import load_dotenv
load_dotenv()

BASE = "http://localhost:8000"

# Check API key
key = os.getenv("GEMINI_API_KEY", "")
if not key.startswith("AIza"):
    print(f"WARNING: GEMINI_API_KEY looks invalid! Starts with '{key[:10]}' - expected 'AIza...'")
    print("   Get a real key from: https://aistudio.google.com/app/apikey\n")
else:
    print(f"[OK] Gemini key looks valid: {key[:10]}...")

def p(label, resp):
    print(f"\n{'='*50}")
    print(f"  {label}")
    print(f"  Status: {resp.status_code}")
    try:
        print(f"  Body:   {json.dumps(resp.json(), indent=2)[:600]}")
    except:
        print(f"  Body:   {resp.text[:200]}")
    return resp.json() if resp.ok else None

# 1. Register (ignore if already exists)
r = requests.post(f"{BASE}/auth/register", json={
    "email": "test@supportpilot.com",
    "password": "Test1234!",
    "role": "company",
    "company_name": "Test Corp"
})
print(f"\nRegister: {r.status_code} - {'OK' if r.ok else r.json().get('detail','error')}")

# 2. Login
r = requests.post(f"{BASE}/auth/login", json={
    "email": "test@supportpilot.com",
    "password": "Test1234!"
})
data = p("LOGIN", r)
if not data:
    print("Login failed, exiting")
    exit(1)

token = data["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"\n  Token: {token[:40]}...")

# 3. Create product
r = requests.post(f"{BASE}/products", headers=headers, json={
    "name": "Kreo Swarm Keyboard",
    "category": "Consumer Electronics",
    "model": "KS-100",
    "description": "A wireless mechanical keyboard with RGB lighting, multi-device connectivity via Bluetooth 5.2, and 6000mAh battery.",
    "status": "Live",
    "common_issues": ["Battery level unclear", "RGB not syncing", "Bluetooth drops connection"]
})
prod = p("CREATE PRODUCT", r)
if not prod:
    print("Product creation failed, exiting")
    exit(1)

product_id = prod.get("id") or prod.get("product", {}).get("id")
print(f"\n  Product ID: {product_id}")

# 4. Upload a text document via the documents endpoint
# Try uploading a plain-text document with battery info
doc_text = """Kreo Swarm Keyboard - User Manual

## Battery Information
The Kreo Swarm Keyboard has a built-in 6000mAh rechargeable battery.

### Checking Battery Level
- Press Fn + B to display the battery level via LED indicators:
  - GREEN (solid): Battery > 60%
  - YELLOW (solid): Battery 30-60%  
  - RED (solid): Battery < 30%
  - RED (blinking): Battery < 10% — charge immediately

### Battery Life
- Backlight OFF: Up to 180 hours
- Backlight LOW: Up to 80 hours
- Backlight HIGH: Up to 30 hours

### Charging
- Use the included USB-C cable
- Full charge takes approximately 3 hours
- Charge via any USB-A port or USB-C charger (5V/2A recommended)

## LED Light Meanings
- GREEN solid: Connected and battery > 60%
- GREEN blinking: Pairing mode active
- BLUE solid: Connected via Bluetooth
- RED solid: Low battery
- RED blinking: Critical battery, charge now
- WHITE: Caps Lock is ON
"""

# Try to upload as a link/text document
r = requests.post(
    f"{BASE}/products/{product_id}/documents",
    headers=headers,
    json={
        "name": "Kreo Swarm User Manual",
        "type": "text",
        "content": doc_text,
        "url": ""
    }
)
doc = p("UPLOAD DOCUMENT (json)", r)

if not doc:
    # Upload as a proper .txt file
    r = requests.post(
        f"{BASE}/products/{product_id}/documents",
        headers=headers,
        data={"name": "Kreo Swarm User Manual"},
        files={"file": ("kreo_swarm_manual.txt", doc_text.encode("utf-8"), "text/plain")}
    )
    doc = p("UPLOAD DOCUMENT (txt file)", r)

# 5. Test AI chat
print(f"\n{'='*50}")
print("  TESTING AI CHAT...")
r = requests.post(f"{BASE}/assistant/chat", headers=headers, json={
    "product_id": product_id,
    "message": "how to check how much battery is left in my keyboard",
    "session_id": None
})
chat = p("AI CHAT RESPONSE", r)

if chat:
    print(f"\n{'='*50}")
    print("  FINAL AI REPLY:")
    print(f"  {chat.get('reply', 'No reply field')}")
    print(f"\n  Sources: {chat.get('sources', [])}")
