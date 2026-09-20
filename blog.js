// Shared blog utilities

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, content: text.trim() };
  }
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

async function fetchPosts() {
  const res = await fetch('/blog/posts/posts.json');
  if (!res.ok) throw new Error('Could not load blog posts');
  const { posts } = await res.json();
  const entries = await Promise.all(
    posts.map(async slug => {
      const mdRes = await fetch(`/blog/posts/${slug}.md`);
      if (!mdRes.ok) return null;
      const text = await mdRes.text();
      const { meta, content } = parseFrontmatter(text);
      return { slug, meta, content };
    })
  );
  return entries.filter(Boolean);
}

function createBlogCard({ slug, meta }) {
  const article = document.createElement('article');
  article.className = 'blog-overview-card';
  article.innerHTML = `
    <div class="blog-overview-image">
      <img src="${meta.image || ''}" alt="${meta.title || ''}" />
    </div>
    <div class="blog-overview-body">
      <p class="blog-date">${meta.date || ''}</p>
      <h3>${meta.title || ''}</h3>
      <p class="blog-excerpt">${meta.excerpt || ''}</p>
      <a href="post.html?slug=${slug}" class="blog-read-more">Read more</a>
    </div>
  `;
  return article;
}

async function renderBlogOverview() {
  const grid = document.getElementById('blog-overview-grid');
  if (!grid) return;
  try {
    const posts = await fetchPosts();
    grid.innerHTML = '';
    posts.slice(0, 3).forEach(post => {
      grid.appendChild(createBlogCard(post));
    });
  } catch (err) {
    grid.innerHTML = '<p class="blog-error">Could not load blog posts.</p>';
    console.error(err);
  }
}

async function renderBlogList() {
  const list = document.getElementById('blog-list');
  if (!list) return;
  try {
    const posts = await fetchPosts();
    list.innerHTML = '';
    posts.forEach(post => {
      list.appendChild(createBlogCard(post));
    });
  } catch (err) {
    list.innerHTML = '<p class="blog-error">Could not load blog posts.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogOverview();
  renderBlogList();
});
