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

const staticPages = [
  { source: "index.html", output: "index.html", url: "/" },
  { source: "about.html", output: "about/index.html", url: "/about/" },
  { source: "services.html", output: "services/index.html", url: "/services/" },
  { source: "team.html", output: "team/index.html", url: "/team/" },
  { source: "contact.html", output: "contact/index.html", url: "/contact/" },
  { source: "branding.html", output: "branding/index.html", url: "/branding/" },
  {
    source: "website-development.html",
    output: "website-development/index.html",
    url: "/website-development/",
  },
  {
    source: "digital-marketing.html",
    output: "digital-marketing/index.html",
    url: "/digital-marketing/",
  },
  { source: "consultancy.html", output: "consultancy/index.html", url: "/consultancy/" },
  { source: "full-service.html", output: "full-service/index.html", url: "/full-service/" },
  { source: "portfolio.html", output: "portfolio/index.html", url: "/portfolio/" },
  {
    source: "portfolio-slide.html",
    output: "portfolio-slide/index.html",
    url: "/portfolio-slide/",
  },
  {
    source: "terms-conditions.html",
    output: "terms-conditions/index.html",
    url: "/terms-conditions/",
  },
  { source: "kvkk.html", output: "kvkk/index.html", url: "/kvkk/" },
];

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

  console.log("Asset dosyaları kopyalandı ✅");
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function stripHtml(html = "") {
  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImagePath(src = "") {
  if (!src) return "";
  return "/" + src.replace(/^\/+/, "");
}

function normalizeCategory(value = "") {
  return value.toString().trim().toLowerCase().replace(/i̇/g, "i");
}

function renderTokens(template, data = {}) {
  return String(template).replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const cleanKey = key.trim();
    return data[cleanKey] ?? "";
  });
}

function removeClientProjectScript(html = "") {
  return String(html).replace(/\s*<script\s+src="\/?js\/plugins\/projects\.js"\s+defer><\/script>\s*/g, "\n");
}

function normalizeInternalLinks(html = "") {
  return removeClientProjectScript(
    String(html)
      .replaceAll('href="index.html"', 'href="/"')
      .replaceAll('href="/index.html"', 'href="/"')

      .replaceAll('href="about.html"', 'href="/about/"')
      .replaceAll('href="/about.html"', 'href="/about/"')

      .replaceAll('href="services.html"', 'href="/services/"')
      .replaceAll('href="/services.html"', 'href="/services/"')

      .replaceAll('href="team.html"', 'href="/team/"')
      .replaceAll('href="/team.html"', 'href="/team/"')

      .replaceAll('href="contact.html"', 'href="/contact/"')
      .replaceAll('href="/contact.html"', 'href="/contact/"')

      .replaceAll('href="branding.html"', 'href="/branding/"')
      .replaceAll('href="/branding.html"', 'href="/branding/"')

      .replaceAll('href="website-development.html"', 'href="/website-development/"')
      .replaceAll('href="/website-development.html"', 'href="/website-development/"')

      .replaceAll('href="digital-marketing.html"', 'href="/digital-marketing/"')
      .replaceAll('href="/digital-marketing.html"', 'href="/digital-marketing/"')

      .replaceAll('href="consultancy.html"', 'href="/consultancy/"')
      .replaceAll('href="/consultancy.html"', 'href="/consultancy/"')

      .replaceAll('href="full-service.html"', 'href="/full-service/"')
      .replaceAll('href="/full-service.html"', 'href="/full-service/"')

      .replaceAll('href="portfolio.html"', 'href="/portfolio/"')
      .replaceAll('href="/portfolio.html"', 'href="/portfolio/"')

      .replaceAll('href="portfolio-slide.html"', 'href="/portfolio-slide/"')
      .replaceAll('href="/portfolio-slide.html"', 'href="/portfolio-slide/"')

      .replaceAll('href="terms-conditions.html"', 'href="/terms-conditions/"')
      .replaceAll('href="/terms-conditions.html"', 'href="/terms-conditions/"')

      .replaceAll('href="kvkk.html"', 'href="/kvkk/"')
      .replaceAll('href="/kvkk.html"', 'href="/kvkk/"')

      .replaceAll("projects.html?slug=", "/projects/")
      .replaceAll('href="projects/', 'href="/projects/')
      .replaceAll("href='projects/", "href='/projects/")

      .replace(/href="\/projects\/([^"\/#?]+)\/?"/g, 'href="/projects/$1/"')

      .replace(/src="js\//g, 'src="/js/')
      .replace(/href="css\//g, 'href="/css/')
      .replace(/src="img\//g, 'src="/img/')
      .replace(/href="img\//g, 'href="/img/'),
  );
}

function readJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function getProjectTitle(project) {
  return `${project.titleMain || ""} ${project.titleThin || ""}`.replace(/\s+/g, " ").trim() || "Proje";
}

function getProjectCover(project) {
  if (project.portfolioCover) return normalizeImagePath(project.portfolioCover);
  if (project.cover) return normalizeImagePath(project.cover);
  if (Array.isArray(project.gallery) && project.gallery[0]) return normalizeImagePath(project.gallery[0]);
  return "/img/placeholder.jpg";
}

function getProjectCategory(project) {
  return project.category || project.service || "Web Tasarım ve GELİŞTİRME";
}

function renderPortfolioListProject(project, index) {
  const isNarrow = index % 4 === 0 || index % 4 === 3;
  const colClass = isNarrow ? "col-lg-5" : "col-lg-6";
  const frameClass = isNarrow ? "mil-vert" : "mil-hori";
  const parallaxClass = isNarrow ? "" : " mil-parallax";
  const parallaxAttrs = isNarrow ? "" : ' data-value-1="60" data-value-2="-60"';
  const title = getProjectTitle(project);

  return `
              <div class="${colClass}">
                <a href="/projects/${project.slug}/" class="mil-portfolio-item mil-more${parallaxClass} mil-mb-60"${parallaxAttrs}>
                  <div class="mil-cover-frame ${frameClass} mil-up">
                    <div class="mil-cover">
                      <img src="${getProjectCover(project)}" alt="${escapeHtml(title)}" />
                    </div>
                  </div>
                  <div class="mil-descr">
                    <div class="mil-labels mil-up mil-mb-15">
                      <div class="mil-label mil-upper mil-accent">${escapeHtml(getProjectCategory(project))}</div>
                      <div class="mil-label mil-upper">${escapeHtml(project.date || "")}</div>
                    </div>
                    <h4 class="mil-up">${escapeHtml(title)}</h4>
                  </div>
                </a>
              </div>`;
}

function renderPortfolioSlideProject(project) {
  const title = getProjectTitle(project);

  return `
                    <div class="swiper-slide">
                      <div class="mil-portfolio-item mil-slider-item" data-swiper-parallax="-30">
                        <div class="mil-cover-frame mil-drag">
                          <div class="mil-cover" data-swiper-parallax-scale="1.3">
                            <a href="/projects/${project.slug}/"><img src="${getProjectCover(project)}" alt="${escapeHtml(title)}" /></a>
                          </div>
                        </div>
                        <div class="mil-descr" data-swiper-parallax-x="104%" data-swiper-parallax-opacity="0">
                          <div class="mil-descr-text" data-swiper-parallax-y="100%" data-swiper-parallax-opacity="0">
                            <div class="mil-labels mil-mb-15">
                              <div class="mil-label mil-upper mil-accent">${escapeHtml(getProjectCategory(project))}</div>
                              <div class="mil-label mil-upper">${escapeHtml(project.date || "")}</div>
                            </div>
                            <h5>${escapeHtml(title)}</h5>
                          </div>
                          <div data-swiper-parallax-y="100%" data-swiper-parallax-opacity="0">
                            <a href="/projects/${project.slug}/" class="mil-button mil-arrow-place">
                              <span>Projeyİ Gör</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>`;
}

function renderMenuProjects(projects = []) {
  return projects
    .filter((project) => project.slug)
    .map((project) => `<li><a href="/projects/${project.slug}/" class="mil-light-soft">${escapeHtml(getProjectTitle(project))}</a></li>`)
    .join("\n                        ");
}

function injectMenuProjects(html, projects = []) {
  const menuHtml = renderMenuProjects(projects);
  if (!menuHtml) return html;

  return String(html).replace(/(<h5 id="projelerimiz" class="mil-muted mil-mb-30">Projelerimiz<\/h5>\s*<ul class="mil-menu-list" role="list">)[\s\S]*?(<\/ul>)/, `$1\n                        ${menuHtml}\n                      $2`);
}

function injectPortfolioList(html, projects = []) {
  const portfolioHtml = projects
    .filter((project) => project.slug)
    .map(renderPortfolioListProject)
    .join("\n");
  if (!portfolioHtml) return html;

  return String(html).replace(/(<section id="portfolio">[\s\S]*?<div class="row justify-content-between align-items-center">)[\s\S]*?(\s*<\/div>\s*<\/div>\s*<\/section>\s*<!-- portfolio end -->)/, `$1\n${portfolioHtml}\n            $2`);
}

function injectPortfolioSlider(html, projects = []) {
  const slidesHtml = projects
    .filter((project) => project.slug)
    .map(renderPortfolioSlideProject)
    .join("\n");
  if (!slidesHtml) return html;

  return String(html).replace(/(<div class="swiper-wrapper">)[\s\S]*?(\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="col-lg-3 mil-relative">)/, `$1\n${slidesHtml}\n                  $2`);
}

function injectPortfolioData(html, sourceFile) {
  const projects = readJson(projectsDataPath, []);
  let nextHtml = injectMenuProjects(html, projects);

  if (sourceFile === "portfolio.html") {
    nextHtml = injectPortfolioList(nextHtml, projects);
  }

  if (sourceFile === "portfolio-slide.html") {
    nextHtml = injectPortfolioSlider(nextHtml, projects);
  }

  return nextHtml;
}

function copyStaticHtmlPages() {
  staticPages.forEach((page) => {
    const sourcePath = path.join(projectRoot, page.source);
    const targetPath = path.join(distRoot, page.output);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`Static sayfa bulunamadı: ${page.source}`);
      return;
    }

    let html = fs.readFileSync(sourcePath, "utf8");

    html = renderTokens(html, {
      canonical: `${SITE_URL}${page.url}`,
      siteUrl: SITE_URL,
    });
    html = injectPortfolioData(html, page.source);
    html = normalizeInternalLinks(html);

    ensureDir(path.dirname(targetPath));
    fs.writeFileSync(targetPath, html, "utf8");
  });

  console.log("Static clean URL sayfalar üretildi ✅");
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
  const projects = readJson(projectsDataPath, []);

  if (!fs.existsSync(projectTemplatePath)) {
    console.warn("projects.html template bulunamadı, proje sayfaları atlandı.");
    return;
  }

  const projectTemplate = fs.readFileSync(projectTemplatePath, "utf8");

  ensureDir(projectsDistPath);

  projects.forEach((project, index) => {
    if (!project.slug) return;

    const prev = projects[(index - 1 + projects.length) % projects.length] || project;
    const next = projects[(index + 1) % projects.length] || project;

    const projectTitlePlain = `${project.titleMain || ""} ${project.titleThin || ""}`.trim();
    const cover = normalizeImagePath(project.cover || "");

    let html = renderTokens(projectTemplate, {
      slug: project.slug || "",
      projectTitlePlain: escapeHtml(projectTitlePlain),
      projectDescription: escapeHtml(getProjectDescription(project)),
      breadcrumb: escapeHtml(project.breadcrumb || project.titleMain || "Proje"),
      titleMain: escapeHtml(project.titleMain || ""),
      titleThin: escapeHtml(project.titleThin || ""),
      client: escapeHtml(project.client || "-"),
      date: escapeHtml(project.date || "-"),
      owner: escapeHtml(project.owner || "-"),
      cover,
      sectionTitle: escapeHtml(project.sectionTitle || ""),
      content: renderProjectContent(project.content),
      gallery: renderGallery(project),
      link: project.link || "#",
      videoBlock: renderVideo(project),
      video: project.video || "",
      prevProjectUrl: `/projects/${prev.slug}/`,
      nextProjectUrl: `/projects/${next.slug}/`,
      canonical: `${SITE_URL}/projects/${project.slug}/`,
      siteUrl: SITE_URL,
    });

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
            <div class="mil-label mil-upper mil-accent">${escapeHtml(category)}</div>
            <div class="mil-label mil-upper">${escapeHtml(post.date || "")}</div>
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
            <div class="mil-label mil-upper mil-accent">${escapeHtml(category)}</div>
            <div class="mil-label mil-upper">${escapeHtml(post.date || "")}</div>
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
  return [...array]
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function buildBlogPages() {
  const posts = readJson(blogDataPath, []);

  if (!fs.existsSync(blogDetailTemplatePath)) {
    console.warn("blog-detail.html template bulunamadı, blog detayları atlandı.");
    return;
  }

  if (!fs.existsSync(blogListTemplatePath)) {
    console.warn("blog.html template bulunamadı, blog liste sayfası atlandı.");
    return;
  }

  const detailTemplate = fs.readFileSync(blogDetailTemplatePath, "utf8");
  const listTemplate = fs.readFileSync(blogListTemplatePath, "utf8");

  ensureDir(blogDistPath);

  posts.forEach((post) => {
    if (!post.slug) return;

    const seoTitle = post.seo?.title || post.title || "";
    const seoDescription = post.seo?.description || post.excerpt || "";
    const image = normalizeImagePath(post.seo?.image || post.cover || "");

    let html = renderTokens(detailTemplate, {
      slug: post.slug || "",
      title: post.title || "",
      category: post.category || "",
      date: post.date || "",
      author: post.author || "",
      readingMinutes: String(post.readingMinutes || ""),
      seoTitle,
      seoDescription,
      image,
      content: post.contentHtml || "",
      canonical: `${SITE_URL}/blog/${post.slug}/`,
      siteUrl: SITE_URL,
    });

    html = normalizeInternalLinks(html);

    const folder = path.join(blogDistPath, post.slug);

    ensureDir(folder);
    fs.writeFileSync(path.join(folder, "index.html"), html, "utf8");
  });

  const postsHtml = posts.map(renderPost).join("");
  const popularPostsHtml = shuffle(posts).slice(0, 2).map(renderPopularPost).join("");

  let listHtml = renderTokens(listTemplate, {
    posts: postsHtml,
    popularPosts: popularPostsHtml,
    canonical: `${SITE_URL}/blog/`,
    siteUrl: SITE_URL,
  });

  listHtml = normalizeInternalLinks(listHtml);

  fs.writeFileSync(path.join(blogDistPath, "index.html"), listHtml, "utf8");

  console.log("Blog build tamamlandı ✅");
}

function formatDate(date = new Date()) {
  if (!date) return new Date().toISOString().split("T")[0];

  const value = String(date).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const monthsTR = {
    ocak: "01",
    şubat: "02",
    subat: "02",
    mart: "03",
    nisan: "04",
    mayıs: "05",
    mayis: "05",
    haziran: "06",
    temmuz: "07",
    ağustos: "08",
    agustos: "08",
    eylül: "09",
    eylul: "09",
    ekim: "10",
    kasım: "11",
    kasim: "11",
    aralık: "12",
    aralik: "12",
  };

  const parts = value.split(/\s+/);

  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = monthsTR[parts[1].toLowerCase()];
    const year = parts[2];

    if (month && /^\d{4}$/.test(year)) {
      return `${year}-${month}-${day}`;
    }
  }

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function createSitemapUrl(loc, lastmod = formatDate()) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
  </url>`;
}

function buildSitemap() {
  const today = formatDate();
  const posts = readJson(blogDataPath, []);
  const projects = readJson(projectsDataPath, []);

  const staticUrls = staticPages.map((page) => createSitemapUrl(`${SITE_URL}${page.url}`, today)).join("");

  const blogUrls = posts
    .filter((post) => post.slug)
    .map((post) => {
      const lastmod = formatDate(post.updatedAt || post.date || today);
      return createSitemapUrl(`${SITE_URL}/blog/${post.slug}/`, lastmod);
    })
    .join("");

  const projectUrls = projects
    .filter((project) => project.slug)
    .map((project) => {
      const lastmod = formatDate(project.updatedAt || project.date || today);
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

  console.log("sitemap.xml üretildi ✅");
}

function buildRobotsTxt() {
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /
`;

  fs.writeFileSync(path.join(distRoot, "robots.txt"), robots, "utf8");

  console.log("robots.txt üretildi ✅");
}

cleanDist();
copyAssets();
copyStaticHtmlPages();
buildProjectPages();
buildBlogPages();
buildSitemap();
buildRobotsTxt();

console.log("Tüm build işlemi tamamlandı 🚀");
