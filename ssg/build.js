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
// PROJECT DETAIL SAYFALARI
const projectsDataPath = path.join(__dirname, "data", "projects.json");
const projectTemplatePath = path.join(__dirname, "..", "projects.html");
const projectsDistPath = path.join(__dirname, "dist", "projects");

const projects = JSON.parse(fs.readFileSync(projectsDataPath, "utf8"));
const projectTemplate = fs.readFileSync(projectTemplatePath, "utf8");

function renderProjectContent(content = []) {
  return content
    .map((block) => {
      if (block.type === "p") {
        return `<p class="mil-up mil-mb-30">${block.html}</p>`;
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
    .map(
      (img) => `
        <div class="col-lg-6">
          <div class="mil-image-frame mil-horizontal mil-up mil-mb-30">
            <img src="/${img.replace(/^\/+/, "")}" alt="${project.titleMain} ${project.titleThin}" />
          </div>
        </div>
      `,
    )
    .join("");
}

projects.forEach((project) => {
  let html = projectTemplate
    .replaceAll("Project Title", `${project.titleMain || ""} <span class="mil-thin">${project.titleThin || ""}</span>`)
    .replaceAll("MÜŞTERİ: -", `MÜŞTERİ: ${project.client || "-"}`)
    .replaceAll("TARİH: -", `TARİH: ${project.date || "-"}`)
    .replaceAll("YETKİLİ: -", `YETKİLİ: ${project.owner || "-"}`)
    .replaceAll('src="" alt="cover image"', `src="/${project.cover}" alt="${project.titleMain}"`)
    .replaceAll("{{projectTitle}}", `${project.titleMain || ""} ${project.titleThin || ""}`)
    .replaceAll("{{breadcrumb}}", project.breadcrumb || "")
    .replaceAll("{{client}}", project.client || "")
    .replaceAll("{{date}}", project.date || "")
    .replaceAll("{{owner}}", project.owner || "")
    .replaceAll("{{cover}}", `/${project.cover || ""}`)
    .replaceAll("{{sectionTitle}}", project.sectionTitle || "")
    .replaceAll("{{content}}", renderProjectContent(project.content))
    .replaceAll("{{gallery}}", renderGallery(project))
    .replaceAll("{{link}}", project.link || "#")
    .replaceAll("{{videoBlock}}", renderVideo(project));

  html = html.replaceAll("projects.html?slug=", "/projects/");

  const folder = path.join(projectsDistPath, project.slug);
  fs.mkdirSync(folder, { recursive: true });

  fs.writeFileSync(path.join(folder, "index.html"), html, "utf8");
});

console.log("Project detail sayfaları build tamamlandı ✅");
function renderVideo(project) {
  if (!project.video) return "";

  return `
    <div class="col-lg-12">
      <iframe
        class="ratio ratio-16x9 mt-4"
        width="100%"
        height="350"
        src="${project.video}"
        title="${project.titleMain || "Project video"}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
        data-no-swup>
      </iframe>
    </div>
  `;
}

function copyStaticPage(sourceFile, outputFolder) {
  const sourcePath = path.join(__dirname, "..", sourceFile);
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
