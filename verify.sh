#!/bin/bash
cd /home/z/my-project

# Kill existing
kill $(lsof -t -i:3000) 2>/dev/null
pkill -f "next-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 1

# Start server
npx next dev -p 3000 </dev/null >> /home/z/my-project/dev.log 2>&1 &
NPID=$!

# Wait for homepage
for i in $(seq 1 40); do
  S=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/ 2>/dev/null)
  [ "$S" = "200" ] && break
  sleep 2
done
echo "Homepage status: $S"

# Fetch CA page with long timeout
echo "Fetching CA page..."
CA=$(curl -s -m 180 http://127.0.0.1:3000/paycheck-calculator/california 2>/dev/null)
echo "CA page size: ${#CA} bytes"

if [ ${#CA} -gt 500 ]; then
  echo "$CA" > /tmp/verify_ca.html

  echo "===TITLE==="
  grep -oP '<title>[^<]+</title>' /tmp/verify_ca.html

  echo "===OG_URL==="
  grep 'og:url' /tmp/verify_ca.html | head -1

  echo "===OG_TITLE==="
  grep 'og:title' /tmp/verify_ca.html | head -1

  echo "===TWITTER_TITLE==="
  grep 'twitter:title' /tmp/verify_ca.html | head -1

  echo "===BRACKETS_H2==="
  grep -oP 'Tax Brackets \([^)]+\)' /tmp/verify_ca.html

  echo "===BREADCRUMB==="
  grep -c 'aria-label="Breadcrumb"' /tmp/verify_ca.html
  grep -c 'list-none' /tmp/verify_ca.html

  echo "===JSONLD==="
  grep -c 'application/ld+json' /tmp/verify_ca.html
  grep -oP '"@type"\s*:\s*"[A-Za-z]+"' /tmp/verify_ca.html | sort | uniq -c

  echo "===FAQ_ANSWERS==="
  python3 << 'PYEOF'
import json, re
with open('/tmp/verify_ca.html') as f:
    html = f.read()
for m in re.finditer(r'application/ld\+json">(.*?)</script>', html, re.DOTALL):
    d = json.loads(m.group(1))
    if d.get('@type') == 'FAQPage':
        print(f"FAQ count: {len(d['mainEntity'])}")
        for i, q in enumerate(d['mainEntity']):
            a = q.get('acceptedAnswer', {}).get('text', '')
            print(f"  Q{i+1}: ans_len={len(a)}")
PYEOF
else
  echo "FAILED: CA page too short (${#CA} bytes)"
  echo "First 500 chars:"
  echo "${CA:0:500}"
fi

kill $NPID 2>/dev/null