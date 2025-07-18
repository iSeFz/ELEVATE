import pandas as pd
import requests
import json
import time
import os

def get_shopify_products(store_url, max_pages=5, delay=1):
    all_products = []
    
    for page in range(1, max_pages + 1):
        url = f"{store_url.rstrip('/')}/products.json?page={page}"
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            data = response.json()
            
            products = data.get('products', [])
            if not products:
                break
            
            all_products.extend(products)
            print(f"[{store_url}] Page {page}: {len(products)} products")
            time.sleep(delay)
        
        except requests.exceptions.RequestException as e:
            print(f"[{store_url}] Error on page {page}: {e}")
            break

    return all_products

def scrape_all_stores(file_path):
    # Load store URLs
    if file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    elif file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("File must be .xlsx or .csv")

    # Ensure the column exists
    if 'store_url' not in df.columns:
        raise ValueError("The file must contain a 'store_url' column.")

    os.makedirs("scraped_data", exist_ok=True)

    # Loop over store URLs
    for raw_url in df['store_url'].dropna():
        # Normalize URL
        store_url = raw_url.strip()
        if not store_url.startswith("http"):
            store_url = "https://" + store_url

        print(f"\nScraping: {store_url}")
        products = get_shopify_products(store_url, max_pages=10)
        
        domain = store_url.replace("https://", "").replace("http://", "").replace("/", "")
        out_file = f"scraped_data/{domain}.json"
        
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"Saved {len(products)} products to {out_file}")


# Example usage:
scrape_all_stores("shopify_stores.xlsx")  # Or "shopify_stores.csv"
