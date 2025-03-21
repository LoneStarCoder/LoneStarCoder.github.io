import json
import re
from datetime import date
from pathlib import Path

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

title = input("Title: ")
slug = slugify(title)
excerpt = input("Excerpt: ")
today = date.today().isoformat()
id = int(date.today().strftime('%Y%m%d'))

post_md = f"""---
title: \"{title}\"
date: \"{today}\"
id: {id}
---

Write your post content here.
"""

post_path = Path("posts") / f"{slug}.md"
post_path.write_text(post_md)

index_path = Path("posts") / "index.json"
index_data = json.loads(index_path.read_text())
index_data.append({
    "slug": slug,
    "title": title,
    "date": today,
    "excerpt": excerpt
})
index_data.sort(key=lambda x: x['date'], reverse=True)
index_path.write_text(json.dumps(index_data, indent=2))

print(f"✅ Created posts/{slug}.md and updated index.json")

