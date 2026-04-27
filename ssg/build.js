const fs = require("fs");
const path = require("path");

// paths
const dataPath = path.join(__dirname, "data", "blog.json");
const detailTemplatePath = path.join(__dirname, "templates", "blog-detail.html");
const listTemplatePath = path.join(__dirname, "templates", "blog.html");
const distPath = path.join(__dirname, "dist", "blog");

// data
const posts = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const detailTemplate = fs.readFileSync(detailTemplatePath, "utf8");
const listTemplate = fs.readFileSync(listTemplatePath, "utf8");
const projectRoot = path.join(__dirname, "..");
const distRoot = path.join(__dirname, "dist");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

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
function copyHtmlFiles() {
  for (const file of fs.readdirSync(projectRoot)) {
    if (file.endsWith(".html")) {
      fs.copyFileSync(path.join(projectRoot, file), path.join(distRoot, file));
    }
  }
}

copyHtmlFiles();

// PORTFOLIO STATIK SAYFALAR
// PROJECT JSON KOPYALA
const projectJsonSource = path.join(__dirname, "projects.json");
const projectJsonTargetDir = path.join(__dirname, "dist", "data");

fs.mkdirSync(projectJsonTargetDir, { recursive: true });

fs.copyFileSync(projectJsonSource, path.join(projectJsonTargetDir, "projects.json"));

console.log("projects.json kopyalandı ✅");
function copyStaticPage(sourceFile, outputFolder) {
  const sourcePath = path.join(__dirname, sourceFile);
  const targetFolder = path.join(__dirname, "dist", outputFolder);

  fs.mkdirSync(targetFolder, { recursive: true });

  const html = fs.readFileSync(sourcePath, "utf8");

  fs.writeFileSync(path.join(targetFolder, "index.html"), html, "utf8");

  console.log(`${outputFolder} build tamamlandı ✅`);
}

copyStaticPage("portfolio.html", "portfolio");
copyStaticPage("portfolio-slide.html", "portfolio-slide");
// klasör oluştur
fs.mkdirSync(distPath, { recursive: true });

function normalizeImagePath(src = "") {
  return "/" + src.replace(/^\/+/, "");
}

function normalizeCategory(value = "") {
  return value.toString().trim().toLowerCase().replace(/i̇/g, "i");
}

function renderPost(post) {
  const category = post.category || "Genel";

  return `
  <div class="col-lg-12 js-post-item" data-category="${normalizeCategory(category)}">
    <a href="/blog/${post.slug}/" class="mil-blog-card mil-blog-card-hori mil-more mil-mb-60">
      <div class="mil-cover-frame mil-up">
        <img src="${normalizeImagePath(post.cover)}" alt="${post.title}" />
      </div>
      <div class="mil-post-descr">
        <div class="mil-labels mil-up mil-mb-30">
          <div class="mil-label mil-upper mil-accent">${category}</div>
          <div class="mil-label mil-upper">${post.date}</div>
        </div>
        <h4 class="mil-up mil-mb-30">${post.title}</h4>
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
        <img src="${normalizeImagePath(post.cover)}" alt="${post.title}" />
      </div>
      <div class="mil-post-descr">
        <div class="mil-labels mil-up mil-mb-30">
          <div class="mil-label mil-upper mil-accent">${category}</div>
          <div class="mil-label mil-upper">${post.date}</div>
        </div>
        <h4 class="mil-up mil-mb-30">${post.title}</h4>
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

// DETAIL SAYFALAR
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

  const folder = path.join(distPath, post.slug);
  fs.mkdirSync(folder, { recursive: true });

  fs.writeFileSync(path.join(folder, "index.html"), html, "utf8");
});

// LIST SAYFASI
const postsHtml = posts.map(renderPost).join("");
const randomPosts = shuffle(posts).slice(0, 2);
const popularPostsHtml = randomPosts.map(renderPopularPost).join("");

const listHtml = listTemplate.replace("{{popularPosts}}", popularPostsHtml).replace("{{posts}}", postsHtml);

fs.writeFileSync(path.join(distPath, "index.html"), listHtml, "utf8");

console.log("Blog build tamamlandı 🚀");
copyDir(path.join(projectRoot, "css"), path.join(distRoot, "css"));
copyDir(path.join(projectRoot, "js"), path.join(distRoot, "js"));
copyDir(path.join(projectRoot, "img"), path.join(distRoot, "img"));
copyDir(path.join(projectRoot, "fonts"), path.join(distRoot, "fonts"));
