// Single blog post renderer

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

async function renderPost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    container.innerHTML = '<p class="blog-error">No post selected.</p>';
    return;
  }

  try {
    const res = await fetch(`/blog/posts/${slug}.md`);
    if (!res.ok) throw new Error('Post not found');
    const text = await res.text();
    const { meta, content } = parseFrontmatter(text);
    const html = typeof marked !== 'undefined' ? marked.parse(content) : content.replace(/\n/g, '<br>');

    container.innerHTML = `
      <div class="post-header">
        <p class="blog-date">${meta.date || ''}</p>
        <h1 class="post-title">${meta.title || ''}</h1>
        ${meta.image ? `<div class="post-image"><img src="${meta.image}" alt="${meta.title || ''}" /></div>` : ''}
      </div>
      <div class="post-body">
        ${html}
      </div>
    `;
    document.title = `${meta.title || 'Blog'} | Samira Huber`;
  } catch (err) {
    container.innerHTML = '<p class="blog-error">Could not load the blog post.</p>';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', renderPost);
