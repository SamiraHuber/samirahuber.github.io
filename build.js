#!/usr/bin/env node
/**
 * Static blog generator (Node.js version).
 * Reads Markdown posts from blog/posts/ and embeds them into index.html,
 * blog.html, and individual <slug>.html pages so no server is needed.
 * Run with: node build.js
 */

const fs = require('fs');
const path = require('path');

const POSTS_JSON = 'blog/posts/posts.json';
const POSTS_DIR = 'blog/posts';

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseInline(text) {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inUl = false;

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('### ')) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h3>${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      out.push(`<h2>${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${parseInline(line.slice(2))}</li>`);
      continue;
    }
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (line.trim() === '') continue;
    out.push(`<p>${parseInline(line)}</p>`);
  }
  if (inUl) out.push('</ul>');
  return out.join('\n');
}

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: text.trim() };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (key) meta[key] = value;
    }
  });
  return { meta, content: match[2].trim() };
}

function loadPosts() {
  const slugs = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')).posts;
  return slugs.map(slug => {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    const text = fs.readFileSync(filePath, 'utf8');
    const { meta, content } = parseFrontmatter(text);
    return { slug, meta, content, html: mdToHtml(content) };
  });
}

function cardHtml(post) {
  const meta = post.meta;
  return [
    '<article class="blog-overview-card">',
    '            <div class="blog-overview-image">',
    `              <img src="${meta.image || ''}" alt="${meta.title || ''}" />`,
    '            </div>',
    '            <div class="blog-overview-body">',
    `              <p class="blog-date">${meta.date || ''}</p>`,
    `              <h3>${meta.title || ''}</h3>`,
    `              <p class="blog-excerpt">${meta.excerpt || ''}</p>`,
    `              <a href="${post.slug}.html" class="blog-read-more">Read more</a>`,
    '            </div>',
    '          </article>'
  ].join('\n');
}

function generatePostPage(post, template) {
  const meta = post.meta;
  const imageHtml = meta.image ? `<div class="post-image"><img src="${meta.image}" alt="${meta.title || ''}" /></div>` : '';
  const rendered = [
    '<div class="post-header">',
    `        <p class="blog-date">${meta.date || ''}</p>`,
    `        <h1 class="post-title">${meta.title || ''}</h1>`,
    `        ${imageHtml}`,
    '      </div>',
    '      <div class="post-body">',
    `        ${post.html}`,
    '      </div>'
  ].join('\n');

  let page = template.replace(
    '<div id="post-content" class="post-content">\n          <p>Loading post...</p>\n        </div>',
    `<div id="post-content" class="post-content">\n        ${rendered}\n      </div>`
  );
  page = page.replace('<title>Blog | Samira Huber</title>', `<title>${meta.title || 'Blog'} | Samira Huber</title>`);
  page = page.replace('  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>\n', '');
  page = page.replace('  <script src="post.js"></script>\n', '');
  return page;
}

function embedCards(htmlPath, posts, startMarker, endMarker, limit) {
  let text = fs.readFileSync(htmlPath, 'utf8');
  const selected = limit ? posts.slice(0, limit) : posts;
  const cards = selected.map(cardHtml).join('\n');

  const startIdx = text.indexOf(startMarker);
  const endIdx = text.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers not found in ${htmlPath}`);
  }

  text = text.slice(0, startIdx + startMarker.length) + '\n' + cards + '\n        ' + text.slice(endIdx);
  text = text.replace('  <script src="blog.js"></script>\n', '');
  fs.writeFileSync(htmlPath, text, 'utf8');
}

function main() {
  const posts = loadPosts();
  const postTemplate = fs.readFileSync('post.html', 'utf8');

  posts.forEach(post => {
    const page = generatePostPage(post, postTemplate);
    fs.writeFileSync(`${post.slug}.html`, page, 'utf8');
    console.log(`Generated ${post.slug}.html`);
  });

  // Blog section on index.html is commented out; re-enable together with it.
  // embedCards('index.html', posts, '<!-- BLOG_OVERVIEW_START -->', '<!-- BLOG_OVERVIEW_END -->', 3);
  // console.log('Updated index.html');
  embedCards('blog.html', posts, '<!-- BLOG_LIST_START -->', '<!-- BLOG_LIST_END -->');
  console.log('Updated blog.html');
}

main();
