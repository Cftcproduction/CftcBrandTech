const fs = require("fs");
const path = require("path");

// build.js dosyası /ssg içinde duruyorsa:
const ssgRoot = __dirname;
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(ssgRoot, "dist");

const blogDataPath = path.join(ssgRoot, "data", "blog.json");
const projectsDataPath = path.join(ssgRoot, "data", "projects.json");

const blogListTemplatePath = path.join(ssgRoot, "templates", "blog.html");
const blogDetailTemplatePath = path.join(ssgRoot, "templates", "blog-detail.html");

// Proje detay sayfası ana dizindeki projects.html dosyasını template olarak kullanıyor
const projectTemplatePath = path.join(projectRoot, "projects.html");

const blogDistPath = path.join(distRoot, "blog");
const projectsDistPath = path.join(distRoot, "projects");
const SITE_URL = "https://www.cftcbrandtech.com";
const staticPages = ["", "about.html", "services.html", "team.html", "contact.html", "branding.html", "website-development.html", "digital-marketing.html", "consultancy.html", "full-service.html", "portfolio/", "portfolio-slide/", "blog/", "terms-conditions.html", "kvkk.html"];
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanDist() {
  if (fs.existsSync(distRoot)) {
    fs.rmSync(distRoot, { recursive: true, force: true });
  }

  ensureDir(distRoot);
}

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
  ["css", "js", "img", "fonts"].forEach((folder) => {
    copyDir(path.join(projectRoot, folder), path.join(distRoot, folder));
  });
}

function normalizeImagePath(src = "") {
  return "/" + String(src).replace(/^\/+/, "");
}

function normalizeCategory(value = "") {
  return value.toString().trim().toLowerCase().replace(/i̇/g, "i");
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function removeClientProjectScript(html = "") {
  return String(html).replace(/\s*<script\s+src="\/?js\/plugins\/projects\.js"\s+defer><\/script>\s*/g, "\n");
}

function normalizeInternalLinks(html = "") {
  return removeClientProjectScript(
    String(html)
      .replaceAll("projects.html?slug=", "/projects/")
      .replaceAll('href="projects/', 'href="/projects/')
      .replaceAll("href='projects/", "href='/projects/")
      .replaceAll("/portfolio.html", "/portfolio/")
      .replaceAll("/portfolio-slide.html", "/portfolio-slide/")
      .replace(/href="\/projects\/([^"\/#?]+)\/?"/g, 'href="/projects/$1/"')
      .replace(/src="js\//g, 'src="/js/')
      .replace(/href="css\//g, 'href="/css/')
      .replace(/src="img\//g, 'src="/img/')
      .replace(/href="img\//g, 'href="/img/'),
  );
}

function copyHtmlFile(sourceFile, targetFile) {
  const sourcePath = path.join(projectRoot, sourceFile);
  const targetPath = path.join(distRoot, targetFile || sourceFile);

  if (!fs.existsSync(sourcePath)) return;

  const html = normalizeInternalLinks(fs.readFileSync(sourcePath, "utf8"));

  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, html, "utf8");
}

function copyRootHtmlFiles() {
  for (const file of fs.readdirSync(projectRoot)) {
    if (!file.endsWith(".html")) continue;
    if (["portfolio.html", "portfolio-slide.html", "projects.html"].includes(file)) continue;

    copyHtmlFile(file, file);
  }
}

function buildPortfolioPages() {
  copyHtmlFile("portfolio.html", "portfolio/index.html");
  copyHtmlFile("portfolio-slide.html", "portfolio-slide/index.html");

  // Eski linkler/search sonuçları kırılmasın diye .html sürümleri de üretiliyor.
  copyHtmlFile("portfolio.html", "portfolio.html");
  copyHtmlFile("portfolio-slide.html", "portfolio-slide.html");

  console.log("Portfolio sayfaları build tamamlandı ✅");
}

function renderProjectContent(content = []) {
  return content
    .map((block) => {
      if (block.type === "p") {
        return `<p class="mil-up mil-mb-30">${block.html || ""}</p>`;
      }

      if (block.type === "ul") {
        return `
          <ul class="mil-list mil-dark mil-up mil-mb-30">
            ${(block.items || []).map((item) => `<li>${item}</li>`).join("")}
          </ul>
        `;
      }

      return "";
    })
    .join("");
}

function renderGallery(project) {
  return (project.gallery || [])
    .map((img, index) => {
      const src = normalizeImagePath(img);
      const alt = escapeHtml(`${project.titleMain || "Proje"} ${project.titleThin || ""} görsel ${index + 1}`.trim());

      return `
                <div class="mil-image-frame mil-horizontal mil-up mil-mb-30">
                  <img src="${src}" alt="${alt}" />
                  <a href="${src}" data-fancybox="gallery" data-no-swup class="mil-zoom-btn">
                    <img class="icons" src="/img/icons/zoom.svg" alt="zoom" />
                  </a>
                </div>
      `;
    })
    .join("");
}

function renderVideo(project) {
  if (!project.video) return "";

  return `
                <div class="col-lg-12">
                  <iframe
                    class="ratio ratio-16x9 mt-4"
                    width="100%"
                    height="350"
                    src="${project.video}"
                    title="${escapeHtml(project.titleMain || "Project video")}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                    data-no-swup>
                  </iframe>
                </div>
  `;
}

function getProjectDescription(project) {
  const firstParagraph = (project.content || []).find((block) => block.type === "p")?.html || "";
  return stripHtml(firstParagraph).slice(0, 155) || "CFTC BrandTech proje çalışması.";
}

function buildProjectPages() {
  const projects = JSON.parse(fs.readFileSync(projectsDataPath, "utf8"));
  const projectTemplate = fs.readFileSync(projectTemplatePath, "utf8");

  ensureDir(projectsDistPath);

  projects.forEach((project, index) => {
    const prev = projects[(index - 1 + projects.length) % projects.length];
    const next = projects[(index + 1) % projects.length];

    const projectTitlePlain = `${project.titleMain || ""} ${project.titleThin || ""}`.trim();
    const cover = normalizeImagePath(project.cover || "");

    let html = projectTemplate
      .replaceAll("{{slug}}", project.slug || "")
      .replaceAll("{{projectTitlePlain}}", escapeHtml(projectTitlePlain))
      .replaceAll("{{projectDescription}}", escapeHtml(getProjectDescription(project)))
      .replaceAll("{{breadcrumb}}", escapeHtml(project.breadcrumb || project.titleMain || "Proje"))
      .replaceAll("{{titleMain}}", escapeHtml(project.titleMain || ""))
      .replaceAll("{{titleThin}}", escapeHtml(project.titleThin || ""))
      .replaceAll("{{client}}", escapeHtml(project.client || "-"))
      .replaceAll("{{date}}", escapeHtml(project.date || "-"))
      .replaceAll("{{owner}}", escapeHtml(project.owner || "-"))
      .replaceAll("{{cover}}", cover)
      .replaceAll("{{sectionTitle}}", escapeHtml(project.sectionTitle || ""))
      .replaceAll("{{content}}", renderProjectContent(project.content))
      .replaceAll("{{gallery}}", renderGallery(project))
      .replaceAll("{{link}}", project.link || "#")
      .replaceAll("{{videoBlock}}", renderVideo(project))
      .replaceAll("{{video}}", project.video || "")
      .replaceAll("{{prevProjectUrl}}", `/projects/${prev.slug}/`)
      .replaceAll("{{nextProjectUrl}}", `/projects/${next.slug}/`);

    html = normalizeInternalLinks(html);

    const folder = path.join(projectsDistPath, project.slug);

    ensureDir(folder);
    fs.writeFileSync(path.join(folder, "index.html"), html, "utf8");
  });

  console.log("Project detail sayfaları build tamamlandı ✅");
}

function renderPost(post) {
  const category = post.category || "Genel";

  return `
  <div class="col-lg-12 js-post-item" data-category="${normalizeCategory(category)}">
    <a href="/blog/${post.slug}/" class="mil-blog-card mil-blog-card-hori mil-more mil-mb-60">
      <div class="mil-cover-frame mil-up">
        <img src="${normalizeImagePath(post.cover)}" alt="${escapeHtml(post.title || "")}" />
      </div>
      <div class="mil-post-descr">
        <div class="mil-labels mil-up mil-mb-30">
          <div class="mil-label mil-upper mil-accent">${category}</div>
          <div class="mil-label mil-upper">${post.date || ""}</div>
        </div>
        <h4 class="mil-up mil-mb-30">${post.title || ""}</h4>
        <p class="mil-post-text mil-up mil-mb-30">${post.excerpt || ""}</p>
        <div class="mil-link mil-dark mil-arrow-place mil-up">
          <span>Daha fazla</span>
        </div>
      </div>
    </a>
  </div>
  `;
}

function renderPopularPost(post) {
  const category = post.category || "Genel";

  return `
  <div class="col-lg-6">
    <a href="/blog/${post.slug}/" class="mil-blog-card mil-mb-60">
      <div class="mil-cover-frame mil-up">
        <img src="${normalizeImagePath(post.cover)}" alt="${escapeHtml(post.title || "")}" />
      </div>
      <div class="mil-post-descr">
        <div class="mil-labels mil-up mil-mb-30">
          <div class="mil-label mil-upper mil-accent">${category}</div>
          <div class="mil-label mil-upper">${post.date || ""}</div>
        </div>
        <h4 class="mil-up mil-mb-30">${post.title || ""}</h4>
        <p class="mil-post-text mil-up mil-mb-30">${post.excerpt || ""}</p>
        <div class="mil-link mil-dark mil-arrow-place mil-up">
          <span>Daha fazla</span>
        </div>
      </div>
    </a>
  </div>
  `;
}

function shuffle(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function buildBlogPages() {
  const posts = JSON.parse(fs.readFileSync(blogDataPath, "utf8"));
  const detailTemplate = fs.readFileSync(blogDetailTemplatePath, "utf8");
  const listTemplate = fs.readFileSync(blogListTemplatePath, "utf8");

  ensureDir(blogDistPath);

  posts.forEach((post) => {
    const seoTitle = post.seo?.title || post.title || "";
    const seoDescription = post.seo?.description || post.excerpt || "";
    const image = normalizeImagePath(post.seo?.image || post.cover || "");

    let html = detailTemplate
      .replaceAll("{{slug}}", post.slug || "")
      .replaceAll("{{title}}", post.title || "")
      .replaceAll("{{category}}", post.category || "")
      .replaceAll("{{date}}", post.date || "")
      .replaceAll("{{author}}", post.author || "")
      .replaceAll("{{readingMinutes}}", String(post.readingMinutes || ""))
      .replaceAll("{{seoTitle}}", seoTitle)
      .replaceAll("{{seoDescription}}", seoDescription)
      .replaceAll("{{image}}", image)
      .replaceAll("{{content}}", post.contentHtml || "");

    html = normalizeInternalLinks(html);

    const folder = path.join(blogDistPath, post.slug);

    ensureDir(folder);
    fs.writeFileSync(path.join(folder, "index.html"), html, "utf8");
  });

  const postsHtml = posts.map(renderPost).join("");
  const popularPostsHtml = shuffle(posts).slice(0, 2).map(renderPopularPost).join("");

  const listHtml = normalizeInternalLinks(listTemplate.replace("{{popularPosts}}", popularPostsHtml).replace("{{posts}}", postsHtml));

  fs.writeFileSync(path.join(blogDistPath, "index.html"), listHtml, "utf8");

  console.log("Blog build tamamlandı 🚀");
}
function formatDate(date = new Date()) {
  return new Date(date).toISOString().split("T")[0];
}

function createSitemapUrl(loc, lastmod = formatDate()) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}
function buildSitemap() {
  const today = formatDate();

  const posts = fs.existsSync(blogDataPath) ? JSON.parse(fs.readFileSync(blogDataPath, "utf8")) : [];

  const projects = fs.existsSync(projectsDataPath) ? JSON.parse(fs.readFileSync(projectsDataPath, "utf8")) : [];

  const staticUrls = staticPages
    .map((page) => {
      const url = page === "" ? `${SITE_URL}/` : `${SITE_URL}/${page}`;
      return createSitemapUrl(url, today);
    })
    .join("");

  const blogUrls = posts
    .filter((post) => post.slug)
    .map((post) => {
      const lastmod = post.updatedAt || post.date || today;
      return createSitemapUrl(`${SITE_URL}/blog/${post.slug}/`, lastmod);
    })
    .join("");

  const projectUrls = projects
    .filter((project) => project.slug)
    .map((project) => {
      const lastmod = project.updatedAt || project.date || today;
      return createSitemapUrl(`${SITE_URL}/projects/${project.slug}/`, lastmod);
    })
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${blogUrls}
${projectUrls}
</urlset>`;

  fs.writeFileSync(path.join(distRoot, "sitemap.xml"), sitemap.trim(), "utf8");

  console.log("sitemap.xml otomatik üretildi ✅");
}

function buildRobotsTxt() {
  const robots = `User-agent: *
Disallow:

Sitemap: ${SITE_URL}/sitemap.xml
`;

  fs.writeFileSync(path.join(distRoot, "robots.txt"), robots, "utf8");

  console.log("robots.txt otomatik üretildi ✅");
}

cleanDist();
copyAssets();
copyRootHtmlFiles();
buildPortfolioPages();
buildProjectPages();
buildBlogPages();
buildSitemap();
buildRobotsTxt();

console.log("Tüm build işlemi tamamlandı 🚀");
