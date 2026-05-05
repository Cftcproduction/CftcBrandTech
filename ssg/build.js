const fs = require("fs");
const path = require("path");

const ssgRoot = __dirname;
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(ssgRoot, "dist");

const SITE_URL = "https://www.cftcbrandtech.com";

const blogDataPath = path.join(ssgRoot, "data", "blog.json");
const projectsDataPath = path.join(ssgRoot, "data", "projects.json");

const blogListTemplatePath = path.join(ssgRoot, "templates", "blog.html");
const blogDetailTemplatePath = path.join(ssgRoot, "templates", "blog-detail.html");
const projectTemplatePath = path.join(projectRoot, "projects.html");

const blogDistPath = path.join(distRoot, "blog");
const projectsDistPath = path.join(distRoot, "projects");

const staticPages = ["", "about.html", "services.html", "team.html", "contact.html", "branding.html", "website-development.html", "digital-marketing.html", "consultancy.html", "full-service.html", "portfolio/", "portfolio-slide/", "blog/", "terms-conditions.html", "kvkk.html"];

// ---------- CORE ----------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDist() {
  if (fs.existsSync(distRoot)) {
    fs.rmSync(distRoot, { recursive: true, force: true });
  }
  ensureDir(distRoot);
}

// ---------- ASSETS ----------
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyAssets() {
  ["css", "js", "img", "fonts"].forEach((f) => {
    copyDir(path.join(projectRoot, f), path.join(distRoot, f));
  });
}
function copyHtmlFile(sourceFile, targetFile = sourceFile) {
  const sourcePath = path.join(projectRoot, sourceFile);
  const targetPath = path.join(distRoot, targetFile);

  if (!fs.existsSync(sourcePath)) {
    console.warn(`HTML bulunamadı: ${sourceFile}`);
    return;
  }

  let html = fs.readFileSync(sourcePath, "utf8");
  html = normalizeLinks(html);

  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, html, "utf8");
}

function copyStaticHtmlPages() {
  for (const file of fs.readdirSync(projectRoot)) {
    if (!file.endsWith(".html")) continue;

    // Bunlar özel build ediliyor, direkt kopyalanmasın
    if (["projects.html", "portfolio.html", "portfolio-slide.html"].includes(file)) {
      continue;
    }

    copyHtmlFile(file);
  }

  // Clean URL versiyonları
  copyHtmlFile("portfolio.html", "portfolio/index.html");
  copyHtmlFile("portfolio-slide.html", "portfolio-slide/index.html");

  // Eski .html URL'ler kırılmasın diye ayrıca kopyala
  copyHtmlFile("portfolio.html", "portfolio.html");
  copyHtmlFile("portfolio-slide.html", "portfolio-slide.html");

  console.log("Static HTML sayfalar kopyalandı ✅");
}

// ---------- HELPERS ----------
function normalizeImagePath(src = "") {
  return "/" + String(src).replace(/^\/+/, "");
}

function escapeHtml(str = "") {
  return String(str).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function normalizeLinks(html = "") {
  return String(html)
    .replaceAll("projects.html?slug=", "/projects/")
    .replaceAll("/portfolio.html", "/portfolio/")
    .replaceAll("/portfolio-slide.html", "/portfolio-slide/")
    .replace(/src="js\//g, 'src="/js/')
    .replace(/href="css\//g, 'href="/css/')
    .replace(/src="img\//g, 'src="/img/')
    .replace(/href="img\//g, 'href="/img/');
}

// ---------- BLOG ----------
function buildBlogPages() {
  const posts = JSON.parse(fs.readFileSync(blogDataPath, "utf8"));
  const detailTemplate = fs.readFileSync(blogDetailTemplatePath, "utf8");
  const listTemplate = fs.readFileSync(blogListTemplatePath, "utf8");

  ensureDir(blogDistPath);

  posts.forEach((post) => {
    let html = detailTemplate
      .replaceAll("{{title}}", post.title || "")
      .replaceAll("{{content}}", post.contentHtml || "")
      .replaceAll("{{seoTitle}}", post.seo?.title || post.title || "")
      .replaceAll("{{seoDescription}}", post.seo?.description || "")
      .replaceAll("{{image}}", normalizeImagePath(post.cover || ""))
      .replaceAll("{{canonical}}", `${SITE_URL}/blog/${post.slug}/`);

    html = normalizeLinks(html);

    const folder = path.join(blogDistPath, post.slug);
    ensureDir(folder);

    fs.writeFileSync(path.join(folder, "index.html"), html);
  });

  fs.writeFileSync(path.join(blogDistPath, "index.html"), listTemplate);

  console.log("Blog OK");
}

// ---------- PROJECT ----------
function buildProjectPages() {
  const projects = JSON.parse(fs.readFileSync(projectsDataPath, "utf8"));
  const template = fs.readFileSync(projectTemplatePath, "utf8");

  ensureDir(projectsDistPath);

  projects.forEach((p) => {
    let html = template
      .replaceAll("{{titleMain}}", p.titleMain || "")
      .replaceAll("{{titleThin}}", p.titleThin || "")
      .replaceAll("{{canonical}}", `${SITE_URL}/projects/${p.slug}/`);

    html = normalizeLinks(html);

    const folder = path.join(projectsDistPath, p.slug);
    ensureDir(folder);

    fs.writeFileSync(path.join(folder, "index.html"), html);
  });

  console.log("Projects OK");
}

// ---------- SITEMAP ----------
function buildSitemap() {
  const posts = JSON.parse(fs.readFileSync(blogDataPath, "utf8"));
  const projects = JSON.parse(fs.readFileSync(projectsDataPath, "utf8"));

  let urls = "";

  staticPages.forEach((p) => {
    const url = p === "" ? `${SITE_URL}/` : `${SITE_URL}/${p}`;
    urls += `<url><loc>${url}</loc></url>\n`;
  });

  posts.forEach((p) => {
    urls += `<url><loc>${SITE_URL}/blog/${p.slug}/</loc></url>\n`;
  });

  projects.forEach((p) => {
    urls += `<url><loc>${SITE_URL}/projects/${p.slug}/</loc></url>\n`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  fs.writeFileSync(path.join(distRoot, "sitemap.xml"), xml);
}

// ---------- ROBOTS ----------
function buildRobots() {
  fs.writeFileSync(
    path.join(distRoot, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`,
  );
}

// ---------- RUN ----------
cleanDist();
copyAssets();
copyStaticHtmlPages();
buildBlogPages();
buildProjectPages();
buildSitemap();
buildRobots();

console.log("BUILD TAMAMLANDI 🚀");
