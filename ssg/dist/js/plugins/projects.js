/**
 * projects.js (swup-safe)
 * projects.html template içinde JSON'dan içeriği basar.
 * Swup ile geçişlerde DOM timing sorunlarını çözer.
 */

(function () {
  "use strict";

  const JSON_PATH = window.PROJECTS_JSON_PATH || "/data/projects.json";
  function normalizeImagePath(src = "") {
    if (!src) return "";

    // dış linkse dokunma
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return src;
    }

    // başına / ekle
    return "/" + src.replace(/^\/+/, "");
  }

  // Bu scriptin gerçekten proje template'inde olup olmadığını DOM üzerinden anla
  function isProjectTemplate() {
    // Swup main içinde bu id'ler varsa, doğru sayfadayız demektir
    return !!document.querySelector("#swupMain #projectTitle, #projectTitle");
  }

  function raf2() {
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  function waitForEls(selectors, { timeout = 4000 } = {}) {
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const ok = () => selectors.every((s) => document.querySelector(s));
      if (ok()) return resolve(true);

      const obs = new MutationObserver(() => {
        if (ok()) {
          obs.disconnect();
          resolve(true);
        } else if (Date.now() - start > timeout) {
          obs.disconnect();
          reject(new Error("waitForEls timeout: " + selectors.join(", ")));
        }
      });

      obs.observe(document.documentElement, { childList: true, subtree: true });

      // timeout fallback
      setTimeout(() => {
        if (!ok()) {
          obs.disconnect();
          reject(new Error("waitForEls timeout: " + selectors.join(", ")));
        }
      }, timeout);
    });
  }

  async function loadProjectFromJson() {
    function setImageSlot(slotId, src) {
      const img = document.getElementById(slotId + "Img");
      const zoom = document.getElementById(slotId + "Zoom");

      // slotun ana kapsayıcısı (mil-image-frame) -> bunu saklayacağız
      const frame = (img && img.closest(".mil-image-frame")) || (zoom && zoom.closest(".mil-image-frame"));
      const normalizedSrc = normalizeImagePath(src);
      if (!src) {
        // Görsel yoksa: tüm slotu gizle + eski defaultları temizle
        if (frame) frame.style.display = "none";
        if (img) img.removeAttribute("src");
        if (zoom) zoom.removeAttribute("href");
        return;
      }

      // Görsel varsa: slotu görünür yap + src/href set et
      if (frame) frame.style.display = "";
      if (img) img.src = normalizedSrc;
      if (zoom) zoom.href = normalizedSrc;
    }

    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    if (!slug) return;

    const res = await fetch(JSON_PATH, { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) throw new Error("projects.json yüklenemedi");

    const projects = await res.json();
    const project = projects.find((p) => p.slug === slug);
    if (!project) throw new Error("Proje bulunamadı: " + slug);

    // Breadcrumb + Title
    const bc = document.getElementById("projectBreadcrumb");
    if (bc) bc.textContent = project.breadcrumb || "PROJE";

    const title = document.getElementById("projectTitle");
    if (title) {
      title.innerHTML = `${project.titleMain || ""} <span class="mil-thin">${project.titleThin || ""}</span>`;
    }

    // Info
    const client = document.getElementById("clientName");
    const date = document.getElementById("projectDate");
    const owner = document.getElementById("projectOwner");
    const webSiteLink = document.getElementById("webSiteLink");
    if (client) client.textContent = project.client || "-";
    if (date) date.textContent = project.date || "-";
    if (owner) owner.textContent = project.owner || "-";
    if (webSiteLink) webSiteLink.href = project.link || "#";

    // Cover
    const coverImg = document.getElementById("coverImg");
    const coverZoom = document.getElementById("coverZoom");
    const coverFrame = (coverImg && coverImg.closest(".mil-image-frame")) || (coverZoom && coverZoom.closest(".mil-image-frame"));
    const normalizedCover = normalizeImagePath(project.cover);
    if (!project.cover) {
      if (coverFrame) coverFrame.style.display = "none";
      if (coverImg) coverImg.removeAttribute("src");
      if (coverZoom) coverZoom.removeAttribute("href");
      if (coverZoom) {
        coverZoom.setAttribute("data-src", normalizedCover);
      }
    } else {
      if (coverFrame) coverFrame.style.display = "";
      if (coverImg) coverImg.src = normalizedCover;
      if (coverZoom) coverZoom.href = normalizedCover;
      if (zoom) {
        zoom.href = normalizedSrc;
        zoom.setAttribute("data-src", normalizedSrc);
      }
    }

    // Gallery (g2-g7) – kaç foto varsa o kadar göster
    const ids = ["g2", "g3", "g4", "g5", "g6", "g7"];
    const gallery = Array.isArray(project.gallery) ? project.gallery : [];

    ids.forEach((id, i) => {
      setImageSlot(id, gallery[i]);
    });

    const projectVideo = document.getElementById("projectVideo");

    if (project.video) {
      projectVideo.style.display = "block";
      projectVideo.src = project.video;
    }
    if (!project.video) {
      projectVideo.style.display = "none";
    }

    // Content
    // Content
    const sectionTitle = document.getElementById("sectionTitle");
    if (sectionTitle) sectionTitle.textContent = project.sectionTitle || "-";

    // Tüm içerik tek yerde (solda)
    const contentEl = document.getElementById("sectionContent");

    if (contentEl) {
      contentEl.innerHTML = "";

      const blocks = Array.isArray(project.content) ? project.content : [];

      blocks.forEach((block) => {
        if (block.type === "p") {
          const p = document.createElement("p");
          p.className = "mil-up mil-mb-30";
          p.innerHTML = block.html || "";
          contentEl.appendChild(p);
        }

        if (block.type === "ul") {
          const ul = document.createElement("ul");
          ul.className = "mil-up mil-mb-30";
          (block.items || []).forEach((item) => {
            const li = document.createElement("li");
            li.className = "mil-up";
            li.innerHTML = item;
            ul.appendChild(li);
          });

          contentEl.appendChild(ul);
        }
      });
    }

    // İstersen SEO title da güncellenebilir:
    // document.title = (project.seoTitle || project.titleMain || "Proje") + " | CFTC BrandTech";
    function setupPrevNextProjects(projects, currentSlug) {
      const prevBtn = document.getElementById("prevProject");
      const nextBtn = document.getElementById("nextProject");

      if (!prevBtn || !nextBtn) return;

      const index = projects.findIndex((p) => p.slug === currentSlug);

      if (index === -1) {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
        return;
      }

      // ÖNCEKİ
      if (index > 0) {
        const prevProject = projects[index - 1];
        prevBtn.href = `projects.html?slug=${prevProject.slug}`;
        prevBtn.classList.remove("mil-disabled");
      } else {
        prevBtn.classList.add("mil-disabled");
        prevBtn.removeAttribute("href");
      }

      // SONRAKİ
      if (index < projects.length - 1) {
        const nextProject = projects[index + 1];
        nextBtn.href = `projects.html?slug=${nextProject.slug}`;
        nextBtn.classList.remove("mil-disabled");
      } else {
        nextBtn.classList.add("mil-disabled");
        nextBtn.removeAttribute("href");
      }
    }
    setupPrevNextProjects(projects, slug);
  }

  let initLock = false;

  async function initProjectPage() {
    // yanlış sayfada çalışma
    if (!isProjectTemplate()) return;

    // aynı anda 2 kere çalışmasın
    if (initLock) return;
    initLock = true;

    try {
      // swup replace sonrası DOM'un "gerçekten" oturmasını bekle
      await raf2();

      // kritik elementler gelene kadar bekle (ilk gelişte boş kalma sebebin bu)
      await waitForEls(["#projectTitle", "#clientName", "#projectDate", "#projectOwner"], { timeout: 6000 });

      await loadProjectFromJson();
    } catch (e) {
      console.error("[projects.js] init error:", e);
    } finally {
      initLock = false;
    }
  }

  // Normal giriş
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectPage, { passive: true });
  } else {
    initProjectPage();
  }

  // Swup geçişleri
  document.addEventListener("swup:contentReplaced", initProjectPage);
  document.addEventListener("swup:pageView", initProjectPage);
})();
