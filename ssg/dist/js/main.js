/* -------------------------------------------

Name: 		Ruizarch
Version:    1.0
Developer:	Nazar Miller (millerDigitalDesign)
Portfolio:  https://themeforest.net/user/millerdigitaldesign/portfolio?ref=MillerDigitalDesign

p.s. I am available for Freelance hire (UI design, web development). email: miller.themes@gmail.com

------------------------------------------- */

$(function () {
  "use strict";

  /***************************

    swup

    ***************************/
  const options = {
    containers: ["#swupMain", "#swupMenu"],
    animateHistoryBrowsing: true,
    linkSelector: "a:not([data-no-swup])",
    animationSelector: '[class="mil-main-transition"]',
  };
  const swup = new Swup();

  swup.hooks.on("page:view", () => {
    fetch(window.location.href)
      .then((res) => res.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");

        document.querySelector('link[rel="canonical"]').href = doc.querySelector('link[rel="canonical"]').href;

        document.querySelector('meta[property="og:url"]').content = doc.querySelector('meta[property="og:url"]').content;

        document.title = doc.title;
      });
  });

  /***************************

    register gsap plugins

    ***************************/
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  /***************************

    color variables

    ***************************/

  var accent = "#ff0000";
  var dark = "#000";
  var light = "#fff";

  /***************************

    preloader
    
    ***************************/
  // if (document.querySelector(".mil-preloader") &&
  //     document.querySelector(".mil-preloader-animation")) {
  //     var timeline = gsap.timeline();

  //     timeline.to(".mil-preloader-animation", {
  //         opacity: 1,
  //     });

  //     timeline.fromTo(
  //         ".mil-animation-1 .mil-h3", {
  //             y: "30px",
  //             opacity: 0
  //         }, {
  //             y: "0px",
  //             opacity: 1,
  //             stagger: 0.4
  //         },
  //     );

  //     timeline.to(".mil-animation-1 .mil-h3", {
  //         opacity: 0,
  //         y: '-30',
  //     }, "+=.3");

  //     timeline.fromTo(".mil-reveal-box", 0.1, {
  //         opacity: 0,
  //     }, {
  //         opacity: 1,
  //         x: '-30',
  //     });

  //     timeline.to(".mil-reveal-box", 0.45, {
  //         width: "100%",
  //         x: 0,
  //     }, "+=.1");
  //     timeline.to(".mil-reveal-box", {
  //         right: "0"
  //     });
  //     timeline.to(".mil-reveal-box", 0.3, {
  //         width: "0%"
  //     });
  //     timeline.fromTo(".mil-animation-2 .mil-h3", {
  //         opacity: 0,
  //     }, {
  //         opacity: 1,
  //     }, "-=.5");
  //     timeline.to(".mil-animation-2 .mil-h3", 0.6, {
  //         opacity: 0,
  //         y: '-30'
  //     }, "+=.5");
  //     timeline.to(".mil-preloader", 0.8, {
  //         opacity: 0,
  //         ease: 'sine',
  //     }, "+=.2");
  //     timeline.fromTo(".mil-up", 0.8, {
  //         opacity: 0,
  //         y: 40,
  //         scale: .98,
  //         ease: 'sine',

  //     }, {
  //         y: 0,
  //         opacity: 1,
  //         scale: 1,
  //         onComplete: function () {
  //             $('.mil-preloader').addClass("mil-hidden");
  //         },
  //     }, "-=1")};
  /***************************

    anchor scroll

    ***************************/
  $(document).on("click", 'a[href^="#"]', function (event) {
    const href = $(this).attr("href");

    // Sadece # ise (kategori butonların gibi) hiçbir şey yapma, hatayı da engelle
    if (!href || href === "#") return;

    event.preventDefault();

    const $target = $(href);
    if (!$target.length) return; // hedef yoksa sessizce çık

    let offset = 0;
    if ($(window).width() < 1200) {
      offset = 90;
    }

    $("html, body").animate(
      {
        scrollTop: $target.offset().top - offset,
      },
      400,
    );
  });

  /***************************

    append

    
    ***************************/

  $(document).ready(function () {
    // Active menu item (Ashley style)
    window.setActiveMenuItem = function () {
      var path = window.location.pathname.split("/").pop();

      // root ise index olarak say
      if (path === "" || path === "/") {
        path = "index.html";
      }

      // Eski aktif sınıfları temizle
      $("#swupMenu li").removeClass("mil-active");
      $("#swupMenu a").removeClass("mil-active");

      // Linkleri dolaş
      $("#swupMenu a").each(function () {
        var href = $(this).attr("href");
        if (!href) return;

        // /services.html, ./services.html -> sadece dosya adını al
        var last = href.split("/").pop();

        // Anasayfa özel durumu
        var isHome = path === "index.html" && (href === "/" || href === "./" || href === "#" || last === "index.html");

        if (isHome || last === path) {
          $(this).addClass("mil-active"); // <a> turuncu ve dot
          $(this).closest("li").addClass("mil-active"); // <li> Ashley stili
        }
      });
    };

    // İlk yüklemede aktif menüyü ayarla
    window.setActiveMenuItem();

    // 1) Arrow
    $(".mil-arrow-place").each(function () {
      const $host = $(this);
      if ($host.find("svg.mil-arrow").length) return; // zaten var
      const $tpl = $("svg.mil-arrow").first().clone(true, true);
      $host.append($tpl);
    });

    // 2) Dodecahedron
    $(".mil-animation").each(function () {
      const $host = $(this);
      if ($host.find(".mil-dodecahedron").length) return;
      const $tpl = $(".mil-dodecahedron").first().clone(true, true);
      $host.append($tpl);
    });

    // 3) Lines
    $(".mil-lines-place").each(function () {
      const $host = $(this);
      if ($host.find(".mil-lines").length) return;
      const $tpl = $(".mil-lines").first().clone(true, true);
      $host.append($tpl);
    });

    // 4) Current Page Link
    $(".mil-current-page").each(function () {
      const $host = $(this);
      if ($host.find("a").length) return;
      const $a = $(".mil-main-menu ul li.mil-active > a").first().clone(true, true);
      $host.append($a);
    });
  });

  /***************************

    accordion

    ***************************/

  let groups = gsap.utils.toArray(".mil-accordion-group");
  let menus = gsap.utils.toArray(".mil-accordion-menu");
  let menuToggles = groups.map(createAnimation);

  menus.forEach((menu) => {
    menu.addEventListener("click", () => toggleMenu(menu));
  });

  function toggleMenu(clickedMenu) {
    menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
  }

  function createAnimation(element) {
    let menu = element.querySelector(".mil-accordion-menu");
    let box = element.querySelector(".mil-accordion-content");
    let symbol = element.querySelector(".mil-symbol");
    let minusElement = element.querySelector(".mil-minus");
    let plusElement = element.querySelector(".mil-plus");

    gsap.set(box, {
      height: "auto",
    });

    let animation = gsap
      .timeline()
      .from(box, {
        height: 0,
        duration: 0.4,
        ease: "sine",
      })
      .from(
        minusElement,
        {
          duration: 0.4,
          autoAlpha: 0,
          ease: "none",
        },
        0,
      )
      .to(
        plusElement,
        {
          duration: 0.4,
          autoAlpha: 0,
          ease: "none",
        },
        0,
      )
      .to(
        symbol,
        {
          background: accent,
          ease: "none",
        },
        0,
      )
      .reverse();

    return function (clickedMenu) {
      if (clickedMenu === menu) {
        animation.reversed(!animation.reversed());
      } else {
        animation.reverse();
      }
    };
  }
  /***************************

    back to top

    ***************************/

  function initBackToTop() {
    const btt = document.querySelector(".mil-back-to-top .mil-link");
    if (!btt) return; // hedef yoksa sessizce çık

    gsap.set(btt, { x: -30, opacity: 0 });

    gsap.to(btt, {
      x: 0,
      opacity: 1,
      ease: "sine",
      scrollTrigger: {
        trigger: "body",
        start: "top -40%",
        end: "top -40%",
        toggleActions: "play none reverse none",
      },
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    initBackToTop();
    if (window.setActiveMenuItem) {
      window.setActiveMenuItem();
    }
  });

  document.addEventListener("swup:contentReplaced", () => {
    initBackToTop();
    if (window.setActiveMenuItem) {
      window.setActiveMenuItem();
    }
  });

  /***************************

    cursor

    ***************************/
  // const cursor = document.querySelector('.mil-ball');

  // gsap.set(cursor, {
  //     xPercent: -50,
  //     yPercent: -50,
  // });

  // document.addEventListener('pointermove', movecursor);

  // function movecursor(e) {
  //     gsap.to(cursor, {
  //         duration: 0.6,
  //         ease: 'sine',
  //         x: e.clientX,
  //         y: e.clientY,
  //     });
  // }

  // $('.mil-drag, .mil-more, .mil-choose').mouseover(function () {
  //     gsap.to($(cursor), .2, {
  //         width: 90,
  //         height: 90,
  //         opacity: 1,
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-drag, .mil-more, .mil-choose').mouseleave(function () {
  //     gsap.to($(cursor), .2, {
  //         width: 20,
  //         height: 20,
  //         opacity: .1,
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-accent-cursor').mouseover(function () {
  //     gsap.to($(cursor), .2, {
  //         background: accent,
  //         ease: 'sine',
  //     });
  //     $(cursor).addClass('mil-accent');
  // });

  // $('.mil-accent-cursor').mouseleave(function () {
  //     gsap.to($(cursor), .2, {
  //         background: dark,
  //         ease: 'sine',
  //     });
  //     $(cursor).removeClass('mil-accent');
  // });

  // $('.mil-drag').mouseover(function () {
  //     gsap.to($('.mil-ball .mil-icon-1'), .2, {
  //         scale: '1',
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-drag').mouseleave(function () {
  //     gsap.to($('.mil-ball .mil-icon-1'), .2, {
  //         scale: '0',
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-more').mouseover(function () {
  //     gsap.to($('.mil-ball .mil-more-text'), .2, {
  //         scale: '1',
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-more').mouseleave(function () {
  //     gsap.to($('.mil-ball .mil-more-text'), .2, {
  //         scale: '0',
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-choose').mouseover(function () {
  //     gsap.to($('.mil-ball .mil-choose-text'), .2, {
  //         scale: '1',
  //         ease: 'sine',
  //     });
  // });

  // $('.mil-choose').mouseleave(function () {
  //     gsap.to($('.mil-ball .mil-choose-text'), .2, {
  //         scale: '0',
  //         ease: 'sine',
  //     });
  // });

  // $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu').mouseover(function () {
  //     gsap.to($(cursor), .2, {
  //         scale: 0,
  //         ease: 'sine',
  //     });
  //     gsap.to($('.mil-ball svg'), .2, {
  //         scale: 0,
  //     });
  // });

  // $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input, textarea, .mil-accordion-menu').mouseleave(function () {
  //     gsap.to($(cursor), .2, {
  //         scale: 1,
  //         ease: 'sine',
  //     });

  //     gsap.to($('.mil-ball svg'), .2, {
  //         scale: 1,
  //     });
  // });

  // $('body').mousedown(function () {
  //     gsap.to($(cursor), .2, {
  //         scale: .1,
  //         ease: 'sine',
  //     });
  // });
  // $('body').mouseup(function () {
  //     gsap.to($(cursor), .2, {
  //         scale: 1,
  //         ease: 'sine',
  //     });
  // });
  /***************************

     menu

    ***************************/
  $(".mil-menu-btn").on("click", function () {
    $(".mil-menu-btn").toggleClass("mil-active");
    $(".mil-menu").toggleClass("mil-active");
    $(".mil-menu-frame").toggleClass("mil-active");
  });
  /***************************

    main menu

    ***************************/
  $(".mil-has-children a").on("click", function () {
    $(".mil-has-children ul").removeClass("mil-active");
    $(".mil-has-children a").removeClass("mil-active");
    $(this).toggleClass("mil-active");
    $(this).next().toggleClass("mil-active");
  });
  /***************************

    progressbar

    ***************************/
  gsap.to(".mil-progress", {
    height: "100%",
    ease: "sine",
    scrollTrigger: {
      scrub: 0.3,
    },
  });
  /***************************

    scroll animations

    ***************************/

  const appearance = document.querySelectorAll(".mil-up");

  appearance.forEach((section) => {
    gsap.fromTo(
      section,
      {
        opacity: 0,
        y: 40,
        scale: 0.98,
        ease: "sine",
      },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.4,
        scrollTrigger: {
          trigger: section,
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  const scaleImage = document.querySelectorAll(".mil-scale");

  scaleImage.forEach((section) => {
    var value1 = $(section).data("value-1");
    var value2 = $(section).data("value-2");
    gsap.fromTo(
      section,
      {
        ease: "sine",
        scale: value1,
      },
      {
        scale: value2,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  const parallaxImage = document.querySelectorAll(".mil-parallax");

  if ($(window).width() > 960) {
    parallaxImage.forEach((section) => {
      var value1 = $(section).data("value-1");
      var value2 = $(section).data("value-2");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          y: value1,
        },
        {
          y: value2,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
  }

  const rotate = document.querySelectorAll(".mil-rotate");

  rotate.forEach((section) => {
    var value = $(section).data("value");
    gsap.fromTo(
      section,
      {
        ease: "sine",
        rotate: 0,
      },
      {
        rotate: value,
        scrollTrigger: {
          trigger: section,
          scrub: true,
          toggleActions: "play none none reverse",
        },
      },
    );
  });
  /***************************

    fancybox

    ***************************/
  $('[data-fancybox="gallery"]').fancybox({
    buttons: ["slideShow", "zoom", "fullScreen", "close"],
    loop: false,
    protect: true,
  });
  $.fancybox.defaults.hash = false;
  /***************************

    reviews slider

    ***************************/

  var menu = [
    '<div class="mil-custom-dot mil-slide-1"></div>',
    '<div class="mil-custom-dot mil-slide-2"></div>',
    '<div class="mil-custom-dot mil-slide-3"></div>',
    '<div class="mil-custom-dot mil-slide-4"></div>',
    '<div class="mil-custom-dot mil-slide-5"></div>',
    '<div class="mil-custom-dot mil-slide-6"></div>',
    '<div class="mil-custom-dot mil-slide-7"></div>',
  ];
  var mySwiper = new Swiper(".mil-reviews-slider", {
    // If we need pagination
    pagination: {
      el: ".mil-revi-pagination",
      clickable: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '">' + menu[index] + "</span>";
      },
    },
    speed: 800,
    effect: "fade",
    parallax: true,
    navigation: {
      nextEl: ".mil-revi-next",
      prevEl: ".mil-revi-prev",
    },
  });

  /***************************

    infinite slider

    ***************************/
  var swiper = new Swiper(".mil-infinite-show", {
    slidesPerView: 2,
    spaceBetween: 30,
    speed: 5000,
    autoplay: true,
    autoplay: {
      delay: 0,
    },
    loop: true,
    freeMode: true,
    breakpoints: {
      992: {
        slidesPerView: 4,
      },
    },
  });

  /***************************

    portfolio slider

    ***************************/
  var swiper = new Swiper(".mil-portfolio-slider", {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 800,
    parallax: true,
    mousewheel: {
      enable: true,
    },
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });
  /***************************

    1 item slider

    ***************************/
  var swiper = new Swiper(".mil-1-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
  });
  /***************************

    2 item slider

    ***************************/
  var swiper = new Swiper(".mil-2-slider", {
    slidesPerView: 1,
    spaceBetween: 30,
    speed: 800,
    parallax: true,
    navigation: {
      nextEl: ".mil-portfolio-next",
      prevEl: ".mil-portfolio-prev",
    },
    pagination: {
      el: ".swiper-portfolio-pagination",
      type: "fraction",
    },
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
    },
  });
  /*----------------------------------------------------------
    ------------------------------------------------------------

    REINIT

    ------------------------------------------------------------
    ----------------------------------------------------------*/
  document.addEventListener("swup:contentReplaced", function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      0,
    );

    gsap.to(".mil-progress", {
      height: 0,
      ease: "sine",
      onComplete: () => {
        ScrollTrigger.refresh();
      },
    });
    /***************************

         menu

        ***************************/
    $(".mil-menu-btn").removeClass("mil-active");
    $(".mil-menu").removeClass("mil-active");
    $(".mil-menu-frame").removeClass("mil-active");
    /***************************

        append

        ***************************/
    $(document).ready(function () {
      // 1) Arrow
      $(".mil-arrow-place").each(function () {
        const $host = $(this);
        if ($host.find("svg.mil-arrow").length) return; // zaten var
        const $tpl = $("svg.mil-arrow").first().clone(true, true);
        $host.append($tpl);
      });

      // 2) Dodecahedron
      $(".mil-animation").each(function () {
        const $host = $(this);
        if ($host.find(".mil-dodecahedron").length) return;
        const $tpl = $(".mil-dodecahedron").first().clone(true, true);
        $host.append($tpl);
      });

      // 3) Lines
      $(".mil-lines-place").each(function () {
        const $host = $(this);
        if ($host.find(".mil-lines").length) return;
        const $tpl = $(".mil-lines").first().clone(true, true);
        $host.append($tpl);
      });

      // 4) Current Page Link
      $(".mil-current-page").each(function () {
        const $host = $(this);
        if ($host.find("a").length) return;
        const $a = $(".mil-main-menu ul li.mil-active > a").first().clone(true, true);
        $host.append($a);
      });
    });

    /***************************

        accordion

        ***************************/

    let groups = gsap.utils.toArray(".mil-accordion-group");
    let menus = gsap.utils.toArray(".mil-accordion-menu");
    let menuToggles = groups.map(createAnimation);

    menus.forEach((menu) => {
      menu.addEventListener("click", () => toggleMenu(menu));
    });

    function toggleMenu(clickedMenu) {
      menuToggles.forEach((toggleFn) => toggleFn(clickedMenu));
    }

    function createAnimation(element) {
      let menu = element.querySelector(".mil-accordion-menu");
      let box = element.querySelector(".mil-accordion-content");
      let symbol = element.querySelector(".mil-symbol");
      let minusElement = element.querySelector(".mil-minus");
      let plusElement = element.querySelector(".mil-plus");

      gsap.set(box, {
        height: "auto",
      });

      let animation = gsap
        .timeline()
        .from(box, {
          height: 0,
          duration: 0.4,
          ease: "sine",
        })
        .from(
          minusElement,
          {
            duration: 0.4,
            autoAlpha: 0,
            ease: "none",
          },
          0,
        )
        .to(
          plusElement,
          {
            duration: 0.4,
            autoAlpha: 0,
            ease: "none",
          },
          0,
        )
        .to(
          symbol,
          {
            background: accent,
            ease: "none",
          },
          0,
        )
        .reverse();

      return function (clickedMenu) {
        if (clickedMenu === menu) {
          animation.reversed(!animation.reversed());
        } else {
          animation.reverse();
        }
      };
    }

    /***************************

        cursor

        ***************************/

    // $('.mil-drag, .mil-more, .mil-choose').mouseover(function () {
    //     gsap.to($(cursor), .2, {
    //         width: 90,
    //         height: 90,
    //         opacity: 1,
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-drag, .mil-more, .mil-choose').mouseleave(function () {
    //     gsap.to($(cursor), .2, {
    //         width: 20,
    //         height: 20,
    //         opacity: .1,
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-accent-cursor').mouseover(function () {
    //     gsap.to($(cursor), .2, {
    //         background: accent,
    //         ease: 'sine',
    //     });
    //     $(cursor).addClass('mil-accent');
    // });

    // $('.mil-accent-cursor').mouseleave(function () {
    //     gsap.to($(cursor), .2, {
    //         background: dark,
    //         ease: 'sine',
    //     });
    //     $(cursor).removeClass('mil-accent');
    // });

    // $('.mil-drag').mouseover(function () {
    //     gsap.to($('.mil-ball .mil-icon-1'), .2, {
    //         scale: '1',
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-drag').mouseleave(function () {
    //     gsap.to($('.mil-ball .mil-icon-1'), .2, {
    //         scale: '0',
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-more').mouseover(function () {
    //     gsap.to($('.mil-ball .mil-more-text'), .2, {
    //         scale: '1',
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-more').mouseleave(function () {
    //     gsap.to($('.mil-ball .mil-more-text'), .2, {
    //         scale: '0',
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-choose').mouseover(function () {
    //     gsap.to($('.mil-ball .mil-choose-text'), .2, {
    //         scale: '1',
    //         ease: 'sine',
    //     });
    // });

    // $('.mil-choose').mouseleave(function () {
    //     gsap.to($('.mil-ball .mil-choose-text'), .2, {
    //         scale: '0',
    //         ease: 'sine',
    //     });
    // });

    // $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input , textarea, .mil-accordion-menu').mouseover(function () {
    //     gsap.to($(cursor), .2, {
    //         scale: 0,
    //         ease: 'sine',
    //     });
    //     gsap.to($('.mil-ball svg'), .2, {
    //         scale: 0,
    //     });
    // });

    // $('a:not(".mil-choose , .mil-more , .mil-drag , .mil-accent-cursor"), input, textarea, .mil-accordion-menu').mouseleave(function () {
    //     gsap.to($(cursor), .2, {
    //         scale: 1,
    //         ease: 'sine',
    //     });

    //     gsap.to($('.mil-ball svg'), .2, {
    //         scale: 1,
    //     });
    // });

    // $('body').mousedown(function () {
    //     gsap.to($(cursor), .2, {
    //         scale: .1,
    //         ease: 'sine',
    //     });
    // });
    // $('body').mouseup(function () {
    //     gsap.to($(cursor), .2, {
    //         scale: 1,
    //         ease: 'sine',
    //     });
    // });
    /***************************

        main menu

        ***************************/
    $(".mil-has-children a").on("click", function () {
      $(".mil-has-children ul").removeClass("mil-active");
      $(".mil-has-children a").removeClass("mil-active");
      $(this).toggleClass("mil-active");
      $(this).next().toggleClass("mil-active");
    });
    /***************************

        scroll animations

        ***************************/

    const appearance = document.querySelectorAll(".mil-up");

    appearance.forEach((section) => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 40,
          scale: 0.98,
          ease: "sine",
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          scrollTrigger: {
            trigger: section,
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    const scaleImage = document.querySelectorAll(".mil-scale");

    scaleImage.forEach((section) => {
      var value1 = $(section).data("value-1");
      var value2 = $(section).data("value-2");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          scale: value1,
        },
        {
          scale: value2,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    const parallaxImage = document.querySelectorAll(".mil-parallax");

    if ($(window).width() > 960) {
      parallaxImage.forEach((section) => {
        var value1 = $(section).data("value-1");
        var value2 = $(section).data("value-2");
        gsap.fromTo(
          section,
          {
            ease: "sine",
            y: value1,
          },
          {
            y: value2,
            scrollTrigger: {
              trigger: section,
              scrub: true,
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }

    const rotate = document.querySelectorAll(".mil-rotate");

    rotate.forEach((section) => {
      var value = $(section).data("value");
      gsap.fromTo(
        section,
        {
          ease: "sine",
          rotate: 0,
        },
        {
          rotate: value,
          scrollTrigger: {
            trigger: section,
            scrub: true,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
    /***************************

        fancybox

        ***************************/
    $('[data-fancybox="gallery"]').fancybox({
      buttons: ["slideShow", "zoom", "fullScreen", "close"],
      loop: false,
      protect: true,
    });
    $.fancybox.defaults.hash = false;
    /***************************

        reviews slider

        ***************************/

    var menu = [
      '<div class="mil-custom-dot mil-slide-1"></div>',
      '<div class="mil-custom-dot mil-slide-2"></div>',
      '<div class="mil-custom-dot mil-slide-3"></div>',
      '<div class="mil-custom-dot mil-slide-4"></div>',
      '<div class="mil-custom-dot mil-slide-5"></div>',
      '<div class="mil-custom-dot mil-slide-6"></div>',
      '<div class="mil-custom-dot mil-slide-7"></div>',
    ];
    var mySwiper = new Swiper(".mil-reviews-slider", {
      // If we need pagination
      pagination: {
        el: ".mil-revi-pagination",
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + menu[index] + "</span>";
        },
      },
      speed: 800,
      effect: "fade",
      parallax: true,
      navigation: {
        nextEl: ".mil-revi-next",
        prevEl: ".mil-revi-prev",
      },
    });

    /***************************

        infinite slider

        ***************************/
    var swiper = new Swiper(".mil-infinite-show", {
      slidesPerView: 2,
      spaceBetween: 30,
      speed: 5000,
      autoplay: true,
      autoplay: {
        delay: 0,
      },
      loop: true,
      freeMode: true,
      breakpoints: {
        992: {
          slidesPerView: 4,
        },
      },
    });

    /***************************

        portfolio slider

        ***************************/
    var swiper = new Swiper(".mil-portfolio-slider", {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: 800,
      parallax: true,
      mousewheel: {
        enable: true,
      },
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
    });
    /***************************

        1 item slider

        ***************************/
    var swiper = new Swiper(".mil-1-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
    });
    /***************************

        2 item slider

        ***************************/
    var swiper = new Swiper(".mil-2-slider", {
      slidesPerView: 1,
      spaceBetween: 30,
      speed: 800,
      parallax: true,
      navigation: {
        nextEl: ".mil-portfolio-next",
        prevEl: ".mil-portfolio-prev",
      },
      pagination: {
        el: ".swiper-portfolio-pagination",
        type: "fraction",
      },
      breakpoints: {
        992: {
          slidesPerView: 2,
        },
      },
    });
  });
});
// tek kaynaktan dinle: yeni içerik yüklense bile çalışır
// Menüde sadece bir alt seviye açık kalsın
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".mil-submenu-button");
  if (!btn) return;

  const li = btn.closest("li.mil-has-children");
  if (!li) return;

  const sub = li.querySelector("ul");
  if (!sub) return;

  // Önce diğer tüm menüleri kapat
  document.querySelectorAll("li.mil-has-children").forEach(function (item) {
    if (item === li) return; // tıklanan elemanı şimdilik bırak

    const otherSub = item.querySelector("ul");
    const otherBtn = item.querySelector(".mil-submenu-button");

    if (otherSub) otherSub.classList.remove("mil-active");
    if (otherBtn) otherBtn.classList.remove("mil-active");
  });

  // Şimdi tıklananı toggle et
  sub.classList.toggle("mil-active");
  btn.classList.toggle("mil-active");
});

//hover gösterme
document.addEventListener("DOMContentLoaded", initHoverDemo);
document.addEventListener("swup:contentReplaced", initHoverDemo);

function initHoverDemo() {
  const cards = document.querySelectorAll(".mil-service-card-sm");
  if (!cards.length) return;

  document.body.dataset.stopHoverDemo = "0";
  let index = 0;

  function showDemo() {
    if (document.body.dataset.stopHoverDemo === "1") return;

    cards.forEach((card) => card.classList.remove("is-hover-demo"));

    const current = cards[index];
    if (current) {
      current.classList.add("is-hover-demo");
    }

    index = (index + 1) % cards.length;
  }

  // İlk gösterim
  showDemo();

  // Animasyon başlasın
  const intervalId = setInterval(showDemo, 2500);

  const stopDemo = () => {
    document.body.dataset.stopHoverDemo = "1";
    clearInterval(intervalId);
    cards.forEach((card) => card.classList.remove("is-hover-demo"));
  };

  // Cardlara mouseenter ekle
  cards.forEach((card) => {
    card.addEventListener("mouseenter", stopDemo, { once: true });
  });
}

// Aktif menü elemanını işaretle
function setActiveMenuItem() {
  // URL'den sadece dosya adını al (services.html, blog.html gibi)
  let path = window.location.pathname.split("/").pop();

  // root ise index.html varsay
  if (path === "" || path === "/") {
    path = "index.html";
  }

  // Önce tüm menüdeki aktif sınıfları temizle
  document.querySelectorAll("#swupMenu li, #swupMenu a").forEach(function (el) {
    el.classList.remove("mil-active");
  });

  // Menü linklerini dolaş
  document.querySelectorAll("#swupMenu a").forEach(function (link) {
    // href'in son kısmını al
    let href = link.getAttribute("href");
    if (!href) return;

    // Sadece aynı domain içi linklere bak
    // href '/services.html' veya './services.html' vb olabilir
    let hrefLast = href.split("/").pop();

    // index için hem "index.html" hem de sadece "#" ya da "./" gibi durumları yakala
    let isHome = path === "index.html" && (href === "/" || href === "./" || href === "#" || hrefLast === "index.html");

    if (isHome || hrefLast === path) {
      // <a> ya mil-active
      link.classList.add("mil-active");
      // parent <li> ye de mil-active
      const li = link.closest("li");
      if (li) li.classList.add("mil-active");
    }
  });
}

// Sayfa ilk yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", setActiveMenuItem);

// Swup kullanıyorsan, içerik değişince de tekrar çalıştır
document.addEventListener("swup:contentReplaced", setActiveMenuItem);
// ======================
// reCAPTCHA (global)
// ======================
window.recaptchaWidgetId = null;

window.renderRecaptcha = function () {
  // Google script yüklenmediyse çık
  if (!window.grecaptcha) return;

  const el = document.getElementById("recaptcha-container");
  if (!el) return; // contact sayfasında değiliz

  // container temizle ve tekrar render et
  el.innerHTML = "";
  window.recaptchaWidgetId = grecaptcha.render(el, {
    sitekey: "6LfwAj8sAAAAAOFYr9hCMZALZ7pdyq4NWrvW3zx_",
  });
};

// reCAPTCHA script callback
window.onRecaptchaLoad = function () {
  window.renderRecaptcha();
};

// Swup geçişlerinden sonra (contact’a gelince) tekrar render
document.addEventListener("swup:contentReplaced", () => {
  // her geçişte widget resetle ve gerekiyorsa render et
  window.recaptchaWidgetId = null;
  window.renderRecaptcha();
});
// main.js: renderRecaptcha tanımlandıktan sonra
if (window.__recaptchaApiLoaded) window.renderRecaptcha();
