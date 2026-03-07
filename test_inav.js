const http = require('http');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('Invalid JSON: ' + data.substring(0, 100))); }
      });
    }).on('error', reject);
  });
}

async function main() {
  // Fetch 2000 Kia cars and extract Model values, then derive ModelGroups
  console.log('Fetching Kia cars...');
  const url = 'http://api.encar.com/search/car/list/general?count=true&q=(And.Hidden.N._.CarType.Y._.Manufacturer.%EA%B8%B0%EC%95%84.)&sr=%7CModifiedDate%7C0%7C2000';
  const d = await fetchJSON(url);
  console.log('Total Kia:', d.Count, '| Fetched:', d.SearchResults.length);

  // Group by base model name (strip prefixes/suffixes)
  function getBaseModelName(name) {
    for (const prefix of ['디 올 뉴 ', '더 뉴 ', '올 뉴 ', '뉴 ']) {
      if (name.startsWith(prefix)) { name = name.slice(prefix.length); break; }
    }
    name = name.replace(/\s*\d+세대$/, '');
    name = name.replace(/\s*\([A-Z0-9]+\)$/, '');
    name = name.replace(/\s*(하이브리드|쿠페|유로|플러스)$/, '');
    return name.trim();
  }

  const groups = new Map();
  d.SearchResults.forEach(item => {
    const model = item.Model;
    const base = getBaseModelName(model);
    if (!groups.has(base)) groups.set(base, { count: 0, variants: new Map() });
    const g = groups.get(base);
    g.count++;
    if (!g.variants.has(model)) g.variants.set(model, 0);
    g.variants.set(model, g.variants.get(model) + 1);
  });

  console.log('\n=== Model Groups ===');
  [...groups.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([base, data]) => {
      console.log(`${base} — ${data.count} cars`);
      [...data.variants.entries()]
        .sort((a, b) => b[1] - a[1])
        .forEach(([variant, count]) => {
          console.log(`  ${variant} — ${count}`);
        });
    });

  // Now verify: does "ModelGroup" query work with Korean base names too?
  console.log('\n=== Test: ModelGroup.카니발 ===');
  const url2 = 'http://api.encar.com/search/car/list/general?count=true&q=(And.Hidden.N._.CarType.Y._.Manufacturer.%EA%B8%B0%EC%95%84._.ModelGroup.%EC%B9%B4%EB%8B%88%EB%B0%9C.)&sr=%7CModifiedDate%7C0%7C0';
  const d2 = await fetchJSON(url2);
  console.log('카니발 count:', d2.Count);

  console.log('\n=== Test: ModelGroup.쏘렌토 ===');
  const url3 = 'http://api.encar.com/search/car/list/general?count=true&q=(And.Hidden.N._.CarType.Y._.Manufacturer.%EA%B8%B0%EC%95%84._.ModelGroup.%EC%8F%98%EB%A0%8C%ED%86%A0.)&sr=%7CModifiedDate%7C0%7C0';
  const d3 = await fetchJSON(url3);
  console.log('쏘렌토 count:', d3.Count);
}

main().catch(console.error);
