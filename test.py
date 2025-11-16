import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin

url = "http://monopolyboardpubcrawl.com/site_media/images/propertycardssmall/"  # page or directory listing
folder = "downloads"
os.makedirs(folder, exist_ok=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
}
r = requests.get(url, headers=headers)
print(r.text)
soup = BeautifulSoup(r.text, "html.parser")

for img in soup.find_all("a"):
    img_url = urljoin(url, img.get("href"))
    print(img_url)
    if img_url.endswith(".jpg"):
        name = os.path.basename(img_url)
        r2 = requests.get(img_url, headers=headers)
        with open(os.path.join(folder, name), "wb") as f:
            f.write(r2.content)
        print(f"Downloaded {name}")
