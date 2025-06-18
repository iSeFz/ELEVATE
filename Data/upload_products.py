import json
import requests
import os

# Path to the JSON file (assumes script is beside vulaire.json)
file_name = "vice.json"
json_path = os.path.join(os.path.dirname(__file__), "Final/", file_name)
api_url = "http://localhost:3000/api/v1//brand-owners/me/products"  # Change to your actual backend URL
params = {"userId": "fwqMyRyoKRbem2OZ7kOqvvf6cGK2"} # Brand Owner ID

# If authentication is required, set your token here
AUTH_TOKEN = "shawkyebrahim2514"  # Replace with a real token if needed

headers = {
    "Content-Type": "application/json",
}
if AUTH_TOKEN:
    headers["X-Test-Auth"] = f"{AUTH_TOKEN}" # Admin Access

with open(json_path, "r", encoding="utf-8") as f:
    products = json.load(f)

print("File name:", file_name, " Brand Owner ID:", params["userId"])
for idx, product in enumerate(products, 1):
    # Remove 'reviewSummary' field if present
    product.pop("reviewSummary", None)
    response = requests.post(api_url, headers=headers, json=product, params=params)
    print(f"[{idx}/{len(products)}] {product.get('name')}: {response.status_code}")

print("Bulk upload complete.")