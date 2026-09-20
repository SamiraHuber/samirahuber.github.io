#!/usr/bin/env python3
"""
Static blog generator.
Reads Markdown posts from blog/posts/ and embeds them into index.html,
blog.html, and individual <slug>.html pages so no server is needed.
Run with: python build.py
"""

import json
import re
import markdown

POSTS_JSON = 'blog/posts/posts.json'
POSTS_DIR = 'blog/posts'


def parse_frontmatter(text):
    match = re.match(r'^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$', text)
    if not match:
        return {}, text.strip()
    meta = {}
    for line in match.group(1).split('\n'):
        idx = line.find(':')
        if idx > -1:
            key = line[:idx].strip()
            value = line[idx + 1:].strip()
            if key:
                meta[key] = value
    return meta, match.group(2).strip()


def load_posts():
    with open(POSTS_JSON, encoding='utf-8') as f:
        slugs = json.load(f)['posts']
    posts = []
    for slug in slugs:
        path = f'{POSTS_DIR}/{slug}.md'
        with open(path, encoding='utf-8') as f:
            text = f.read()
        meta, content = parse_frontmatter(text)
        posts.append({
            'slug': slug,
            'meta': meta,
            'content': content,
            'html': markdown.markdown(content),
        })
    return posts


def card_html(post):
    meta = post['meta']
    return (
        '<article class="blog-overview-card">\n'
        '            <div class="blog-overview-image">\n'
        f'              <img src="{meta.get("image", "")}" alt="{meta.get("title", "")}" />\n'
        '            </div>\n'
        '            <div class="blog-overview-body">\n'
        f'              <p class="blog-date">{meta.get("date", "")}</p>\n'
        f'              <h3>{meta.get("title", "")}</h3>\n'
        f'              <p class="blog-excerpt">{meta.get("excerpt", "")}</p>\n'
        f'              <a href="{post["slug"]}.html" class="blog-read-more">Read more</a>\n'
        '            </div>\n'
        '          </article>'
    )


def post_page_html(post, template):
    meta = post['meta']
    image_html = ''
    if meta.get('image'):
        image_html = (
            f'<div class="post-image"><img src="{meta["image"]}" alt="{meta.get("title", "")}" /></div>'
        )
    rendered = (
        '<div class="post-header">\n'
        f'        <p class="blog-date">{meta.get("date", "")}</p>\n'
        f'        <h1 class="post-title">{meta.get("title", "")}</h1>\n'
        f'        {image_html}\n'
        '      </div>\n'
        '      <div class="post-body">\n'
        f'        {post["html"]}\n'
        '      </div>'
    )
    page = template.replace(
        '<div id="post-content" class="post-content">\n          <p>Loading post...</p>\n        </div>',
        f'<div id="post-content" class="post-content">\n        {rendered}\n      </div>'
    )
    page = page.replace('<title>Blog | Samira Huber</title>', f'<title>{meta.get("title", "Blog")} | Samira Huber</title>')
    # Remove the markdown parser script; content is already rendered.
    page = page.replace('  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>\n', '')
    # Remove post.js; content is already rendered.
    page = page.replace('  <script src="post.js"></script>\n', '')
    return page


def embed_cards(html_path, posts, start_marker, end_marker, limit=None):
    with open(html_path, encoding='utf-8') as f:
        text = f.read()

    selected = posts if limit is None else posts[:limit]
    cards = '\n'.join(card_html(p) for p in selected)

    start_idx = text.find(start_marker)
    end_idx = text.find(end_marker)
    if start_idx == -1 or end_idx == -1:
        raise ValueError(f'Markers not found in {html_path}')

    before = text[:start_idx + len(start_marker)]
    after = text[end_idx:]
    text = before + '\n' + cards + '\n        ' + after

    # Remove the dynamic blog loader script if present.
    text = text.replace('  <script src="blog.js"></script>\n', '')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(text)


def main():
    posts = load_posts()

    # Generate individual post pages.
    with open('post.html', encoding='utf-8') as f:
        post_template = f.read()
    for post in posts:
        page = post_page_html(post, post_template)
        with open(f'{post["slug"]}.html', 'w', encoding='utf-8') as f:
            f.write(page)
        print(f'Generated {post["slug"]}.html')

    # Embed static cards into index.html and blog.html.
    # Blog section on index.html is commented out; re-enable together with it.
    # embed_cards('index.html', posts, '<!-- BLOG_OVERVIEW_START -->', '<!-- BLOG_OVERVIEW_END -->', limit=3)
    # print('Updated index.html')
    embed_cards('blog.html', posts, '<!-- BLOG_LIST_START -->', '<!-- BLOG_LIST_END -->')
    print('Updated blog.html')


if __name__ == '__main__':
    main()
