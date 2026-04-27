(function () {
  function normalizeText(value) {
    return (value || "").toString().trim().toLowerCase().replace(/i̇/g, "i");
  }

  function getCategorySection() {
    return document.querySelector("#blog-categories");
  }

  function getPosts() {
    return document.querySelectorAll(".js-post-item");
  }

  function getFilterLinks() {
    const section = getCategorySection();
    return section ? section.querySelectorAll("[data-category]") : [];
  }

  function applyBlogFilter(selectedCategory) {
    const posts = getPosts();
    const filterLinks = getFilterLinks();

    if (!posts.length || !filterLinks.length) return;

    filterLinks.forEach((link) => {
      const cat = normalizeText(link.dataset.category);
      link.classList.toggle("mil-active", cat === selectedCategory);
    });

    let visibleCount = 0;

    posts.forEach((post) => {
      const postCategory = normalizeText(post.dataset.category);
      const shouldShow = selectedCategory === "all" || postCategory === selectedCategory;

      post.style.display = shouldShow ? "" : "none";

      if (shouldShow) {
        visibleCount++;
        post.querySelectorAll(".mil-up").forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      }
    });

    const emptyState = document.querySelector("#blog-empty-state");
    if (emptyState) {
      emptyState.style.display = visibleCount ? "none" : "block";
    }

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

  function initBlogFilterPage() {
    const section = getCategorySection();
    if (!section) return;

    const activeLink = section.querySelector("[data-category].mil-active") || section.querySelector('[data-category="all"]');

    const selectedCategory = normalizeText(activeLink?.dataset.category || "all");

    applyBlogFilter(selectedCategory);
  }

  document.addEventListener("click", function (e) {
    const link = e.target.closest("#blog-categories [data-category]");
    if (!link) return;

    e.preventDefault();

    const selectedCategory = normalizeText(link.dataset.category || "all");
    applyBlogFilter(selectedCategory);
  });

  document.addEventListener("DOMContentLoaded", initBlogFilterPage);
  document.addEventListener("swup:contentReplaced", initBlogFilterPage);
  document.addEventListener("swup:pageView", initBlogFilterPage);

  if (window.swup && window.swup.hooks) {
    window.swup.hooks.on("page:view", initBlogFilterPage);
  }
})();
