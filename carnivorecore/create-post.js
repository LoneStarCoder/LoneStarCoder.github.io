const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

(async () => {
  const title = await ask('Title: ');
  const slug = slugify(title);
  const date = new Date().toISOString().split('T')[0];
  const excerpt = await ask('Excerpt: ');

  const frontmatter = `---\ntitle: "${title}"\ndate: "${date}"\nid: ${Date.now()}\n---\n\nWrite your post content here.`;

  const postPath = path.join(__dirname, 'posts', `${slug}.md`);
  fs.writeFileSync(postPath, frontmatter);

  const indexPath = path.join(__dirname, 'posts', 'index.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath));
  indexData.push({ slug, title, date, excerpt });
  indexData.sort((a, b) => new Date(b.date) - new Date(a.date));
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));

  console.log(`✅ Created post at posts/${slug}.md`);
  rl.close();
})();

