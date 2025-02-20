#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const yaml = require('js-yaml');

const blogTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Gurgen.zip - Blog</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta name="title" content="Gurgen Hayrapetyan - Blog" />
    <meta name="description" content="Welcome To My Blog" />
    <meta name="keywords" content="rasjonell,gurgen,tech,blog,blog,rss" />
    <meta name="robots" content="index, follow" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="language" content="English" />
    <meta name="author" content="Gurgen Hayrapetyann" />

    <link href="/styles.css" rel="stylesheet" />
  </head>
  <body>
    <div class="min-h-screen flex flex-col bg-[#fbf1c7] text-[#3c3836] dark:bg-[#282828] dark:text-[#ebdbb2] font-mono">
      <header class="p-4 bg-[#ebdbb2] dark:bg-[#3c3836]">
        <nav class="container mx-auto flex justify-between items-center">
          <a href="/">
            <h1 class="text-2xl font-bold text-[#b57614] dark:text-[#fe8019]">&larr; gurgen.zip</h1>
          </a>
          <ul class="flex space-x-4">
            <li>
              <a href="/" class="hover:text-[#d65d0e] dark:hover:text-[#fe8019]"> Home </a>
            </li>

            <a href="/blog.html" class="hover:text-[#d65d0e] dark:hover:text-[#fe8019]"> Blog </a>
            </li>
            <li>
            <a
              href="/rss.xml"
              class="hover:text-[#d65d0e] dark:hover:text-[#fe8019] flex items-center"
            >
              <svg
                class="h-5 w-5 fill-[#d67d0e] dark:fill-[#fe8019] mr-2"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                d="M3 1H1V3H3C8.52285 3 13 7.47715 13 13V15H15V13C15 6.37258 9.62742 1 3 1Z"
              />
                <path
                d="M3 6H1V8H3C5.76142 8 8 10.2386 8 13V15H10V13C10 9.13401 6.86599 6 3 6Z"
              />
                <path
                d="M3 15C4.10457 15 5 14.1046 5 13C5 11.8954 4.10457 11 3 11C1.89543 11 1 11.8954 1 13C1 14.1046 1.89543 15 3 15Z"
              />
              </svg>
              RSS
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main class="flex-grow container mx-auto px-4 py-8">
        <section class="mb-8">
          <h2 class="text-4xl font-bold mb-6 text-[#b57614] dark:text-[#fe8019]">Latest Posts</h2>
          <!-- posts -->
        </section>
      </main>

      <footer class="bg-[#ebdbb2] dark:bg-[#3c3836] p-4 text-center">made with ❤️</footer>
    </div>
  </body>
</html>`;

const blogIndexTemplate = `<div class="space-y-6">
  <article
    class="border border-[#d5c4a1] dark:border-[#504945] p-4 rounded-md hover:bg-[#ebdbb2] dark:hover:bg-[#3c3836] transition-colors mb-4"
  >
    <a href="/blog/{{slug}}.html" class="block">
      <h3 class="text-xl font-semibold mb-2 text-[#8f3f71] dark:text-[#d3869b] hover:underline">
        {{title}}
      </h3>
      <p class="mb-2">
        {{abstract}}
      </p>
      <time class="text-sm text-[#7c6f64] dark:text-[#a89984]">
        {{date}}
      </time>
    </a>
  </article>
</div>
`;

const postTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{title}} - Gurgen.zip</title>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="description" content="{{abstract}}" />
    <meta name="keywords" content="{{tags}}" />
    <meta name="author" content="Gurgen Hayrapetyan" />
    <link href="/styles.css" rel="stylesheet" />
    <style>
      pre[class*="language-"] {
        background: #3c3836;
        padding: 1em;
        margin: .5em 0;
        overflow: auto;
        border-radius: 0.3em;
      }
      
      code[class*="language-"] {
        font-family: "Fira Code", monospace;
        white-space: pre;
        tab-size: 4;
      }
      
      .dark pre[class*="language-"] {
        background: #1d2021;
      }

      .prose {
        color: inherit;
      }
      
      .prose h1 {
        font-size: 2.25rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 700;
        color: #b57614;
        line-height: 1.2;
      }
      
      .dark .prose h1 {
        color: #fe8019;
      }
      
      .prose h2 {
        font-size: 1.875rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
        font-weight: 700;
        color: #b57614;
        line-height: 1.3;
      }
      
      .dark .prose h2 {
        color: #fe8019;
      }
      
      .prose h3 {
        font-size: 1.5rem;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #b57614;
        line-height: 1.4;
      }
      
      .dark .prose h3 {
        color: #fe8019;
      }
      
      .prose h4 {
        font-size: 1.25rem;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
        color: #b57614;
        line-height: 1.4;
      }
      
      .dark .prose h4 {
        color: #fe8019;
      }
      
      .prose p {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
        line-height: 1.6;
      }
      
      .prose ul {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
        padding-left: 1.625em;
        list-style-type: disc;
      }
      
      .prose ol {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
        padding-left: 1.625em;
        list-style-type: decimal;
      }
      
      .prose li {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
      }
      
      .prose a {
        color: #d65d0e;
        text-decoration: underline;
      }
      
      .dark .prose a {
        color: #fe8019;
      }
      
      .prose blockquote {
        border-left: 4px solid #d5c4a1;
        padding-left: 1rem;
        margin: 1.5rem 0;
        font-style: italic;
        color: #665c54;
      }
      
      .dark .prose blockquote {
        border-left-color: #504945;
        color: #bdae93;
      }

     .prose pre {
        background-color: #3c3836;
        color: #ebdbb2;
        padding: 1rem;
        border-radius: 0.375rem;
        margin: 1rem 0;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        max-width: 100%;
      }     
      
      .dark .prose pre {
        background-color: #1d2021;
      }
      
      .prose code {
        color: rgb(254, 128, 25);
        font-weight: 600;
        font-size: 0.875em;
      }
      
      .prose pre code {
        color: #ebdbb2;
        font-weight: 400;
        font-size: 0.875em;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: anywhere;
      }
    </style>
  </head>
  <body>
    <div class="min-h-screen flex flex-col bg-[#fbf1c7] text-[#3c3836] dark:bg-[#282828] dark:text-[#ebdbb2] font-mono">
      <header class="p-4 bg-[#ebdbb2] dark:bg-[#3c3836]">
        <nav class="container mx-auto flex justify-between items-center">
          <a href="/blog.html">
            <h1 class="text-2xl font-bold text-[#b57614] dark:text-[#fe8019]">&larr; Blog</h1>
          </a>
        </nav>
      </header>

      <main class="flex-grow container mx-auto px-4 py-8">
        <article class="prose dark:prose-invert max-w-none">
          <h1 class="text-4xl font-bold mb-4 text-[#b57614] dark:text-[#fe8019]">{{title}}</h1>
          <div class="mb-4">
            <time class="text-sm text-[#7c6f64] dark:text-[#a89984]">{{date}}</time>
            <div class="text-sm text-[#7c6f64] dark:text-[#a89984]">Tags: {{tags}}</div>
          </div>
          {{content}}
        </article>
      </main>

      <footer class="bg-[#ebdbb2] dark:bg-[#3c3836] p-4 text-center">made with ❤️</footer>
    </div>
  </body>
</html>`;

async function parseMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const [, frontmatter, markdown] = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  const metadata = yaml.load(frontmatter);

  marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    smartLists: true,
    smartypants: true,
  });

  const htmlContent = marked.parse(markdown);

  return {
    ...metadata,
    content: htmlContent,
  };
}

async function generateRSSFeed(posts, outputDir) {
  const siteUrl = 'https://gurgen.zip';
  const feedUrl = `${siteUrl}/rss.xml`;
  const now = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gurgen's Blog</title>
    <description>Personal blog about technology, programming, and more</description>
    <link>${siteUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
`;

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const latestPosts = posts.slice(0, 10);

  for (const post of latestPosts) {
    const postUrl = `${siteUrl}/blog/${post.slug}.html`;
    const pubDate = new Date(post.date).toUTCString();

    rss += `
    <item>
      <title>${post.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
      <description><![CDATA[${post.content}]]></description>
      <pubDate>${pubDate}</pubDate>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      ${post.tags ? `<category>${post.tags.replace(/,/g, '</category><category>')}</category>` : ''}
    </item>`;
  }

  rss += `
  </channel>
</rss>`;

  await fs.writeFile(path.join(outputDir, 'rss.xml'), rss);
}

async function generatePost(markdownPath, outputDir) {
  const post = await parseMarkdownFile(markdownPath);

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = postTemplate
    .replace(/{{title}}/g, post.title)
    .replace(/{{abstract}}/g, post.abstract)
    .replace(/{{tags}}/g, post.tags)
    .replace(/{{date}}/g, formattedDate)
    .replace('{{content}}', post.content);

  const outputPath = path.join(outputDir, `${post.slug}.html`);
  await fs.writeFile(outputPath, html);
  return post;
}

async function generateBlogPage(posts, outputPath) {
  let postSection = '';

  for (const post of posts.sort((a, b) => new Date(b.date) - new Date(a.date))) {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = blogIndexTemplate
      .replace(/{{title}}/g, post.title)
      .replace(/{{slug}}/g, post.slug)
      .replace(/{{abstract}}/g, post.abstract)
      .replace(/{{date}}/g, formattedDate);

    postSection += html;
  }

  const finalBlogHtml = blogTemplate.replace(
    /<!-- posts -->/g,
    `<!-- posts -->

  ${postSection}
`,
  );

  await fs.writeFile(outputPath, finalBlogHtml);
}

async function main() {
  try {
    const cwd = process.cwd();
    const blogDir = path.join(cwd, 'articles');
    const outputDir = path.join(cwd, 'blog');
    const templatePath = path.join(cwd, 'blog.html');

    // Get all markdown files
    const files = await fs.readdir(blogDir);
    const markdownFiles = files.filter((file) => file.endsWith('.md'));

    // Generate individual post pages and collect metadata
    const posts = [];
    for (const file of markdownFiles) {
      const post = await generatePost(path.join(blogDir, file), outputDir);
      posts.push(post);
    }

    // Generate blog index
    await generateBlogPage(posts, templatePath);
    await generateRSSFeed(posts, cwd);

    console.log('Blog generated successfully!');
  } catch (error) {
    console.error('Error generating blog:', error);
    process.exit(1);
  }
}

main();
