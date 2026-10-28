/* Web Studio starter: interactions and motion (see toolkit/MOTION.md).
   Everything here is progressive: without JavaScript, or with reduced motion,
   every page still shows all of its content. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- header: solid after scrolling ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-solid", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = root.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && window.gsap && !reduce) {
        gsap.fromTo(".nav a", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .06, duration: .7, delay: .2, ease: "power3.out" });
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("nav-open")) toggle.click();
    });
  }

  /* ---------- review mode: ?review outlines draft text ---------- */
  if (/[?&]review\b/.test(location.search)) root.classList.add("review");

  /* ---------- contact form: compose an email (no server needed) ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var to = f.recipient.value || "secretary@ptlaw.ph";
      var subject = "Website inquiry: " + (f.topic.value || "General") + " (" + f.name.value + ")";
      var body = f.message.value + "\n\n" + f.name.value + "\n" + f.email.value + (f.phone.value ? "\n" + f.phone.value : "");
      location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- practice page: highlight the section in view ---------- */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove("is-active"); });
          map[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll(".area[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------- no motion: tidy up and stop ---------- */
  var wipe = document.querySelector(".wipe");
  if (reduce || !window.gsap) {
    root.classList.remove("intro", "arriving");
    store.del("pt-wipe");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  /* ---------- page transitions (maroon wipe) ---------- */
  function wipeIn() {
    // arriving from another page: lift the panel away
    if (!root.classList.contains("arriving")) return 0;
    store.del("pt-wipe");
    gsap.set(wipe, { display: "block", yPercent: 0 });
    gsap.to(wipe, { yPercent: -100, duration: .9, ease: "power4.inOut", delay: .05, onComplete: function () {
      root.classList.remove("arriving"); gsap.set(wipe, { clearProps: "all" });
    } });
    return .45;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var href = a.getAttribute("href") || "";
    if (a.target === "_blank" || a.hasAttribute("download") || /^(mailto:|tel:|#|https?:)/.test(href)) return;
    if (href.split("#")[0] === "" ) return;
    e.preventDefault();
    root.classList.remove("nav-open");
    store.set("pt-wipe", "1");
    wipe.classList.add("is-on");
    gsap.fromTo(wipe, { yPercent: 100 }, { yPercent: 0, duration: .65, ease: "power4.inOut", onComplete: function () { location.href = href; } });
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { wipe.classList.remove("is-on"); gsap.set(wipe, { clearProps: "all" }); root.classList.remove("arriving"); }
  });

  /* ---------- intro: logo reveal, once per visit ---------- */
  function intro() {
    var loader = document.querySelector(".loader");
    if (!root.classList.contains("intro") || !loader) return 0;
    store.set("pt-intro", "1");
    loader.style.animation = "none";
    var tl = gsap.timeline({ onComplete: function () { root.classList.remove("intro"); loader.remove(); } });
    tl.from(loader.querySelectorAll(".bar"), { scaleX: 0, transformOrigin: "50% 50%", duration: .8, ease: "power4.inOut" })
      .from(loader.querySelectorAll(".hair"), { scaleX: 0, transformOrigin: "50% 50%", duration: .7, ease: "power3.inOut" }, "<.1")
      .from(loader.querySelectorAll(".tile, .key"), { scale: .6, autoAlpha: 0, transformOrigin: "50% 50%", stagger: .06, duration: .7, ease: "back.out(1.6)" }, "<.15")
      .from(loader.querySelectorAll(".letter"), { yPercent: 40, autoAlpha: 0, stagger: .12, duration: .6 }, "<.25")
      .from(loader.querySelector(".loader__word"), { autoAlpha: 0, letterSpacing: ".6em", duration: 1 }, "<")
      .to(loader, { yPercent: -100, duration: 1, ease: "power4.inOut" }, "+=.35");
    return 2.6;
  }

  var delay = intro() || wipeIn();

  /* ---------- hero ---------- */
  var hero = document.querySelector(".hero, .page-hero");
  if (hero) {
    var h = gsap.timeline({ delay: delay });
    h.from(hero.querySelectorAll(".line > span"), { yPercent: 112, duration: 1.2, stagger: .1, ease: "power4.out" })
     .from(hero.querySelectorAll(".eyebrow, .crumbs"), { autoAlpha: 0, x: -20, duration: .8 }, "<.1")
     .from(hero.querySelectorAll("[data-hero-fade]"), { autoAlpha: 0, y: 24, duration: .9, stagger: .1 }, "<.35")
     .from(hero.querySelectorAll(".hero__foot, .page-hero__seal"), { autoAlpha: 0, duration: 1.2 }, "<.2");
    var media = hero.querySelector(".hero__media img");
    if (media) {
      gsap.fromTo(media, { scale: 1.18 }, { scale: 1.05, duration: 2.6, ease: "power2.out", delay: delay });
      gsap.to(media, { yPercent: 14, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }
    var seal = hero.querySelector(".page-hero__seal");
    if (seal) gsap.to(seal, { rotate: 8, yPercent: 20, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  }

  /* ---------- scroll reveals ---------- */
  gsap.utils.toArray("[data-reveal]").forEach(function (el) { gsap.set(el, { autoAlpha: 0, y: 46 }); });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) { gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, stagger: .1, overwrite: true }); }
  });

  gsap.utils.toArray("[data-rule]").forEach(function (el) {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "power4.inOut", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });

  gsap.utils.toArray("[data-clip]").forEach(function (el) {
    gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
      clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut",
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
    var img = el.querySelector("img");
    if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });

  /* split serif statements word by word */
  gsap.utils.toArray("[data-words]").forEach(function (el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span"); s.style.display = "inline-block"; s.textContent = part; frag.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    gsap.from(words, { autoAlpha: .12, duration: .6, stagger: .05, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
  });

  /* icons draw themselves in */
  gsap.utils.toArray(".icon").forEach(function (svg) {
    var parts = svg.querySelectorAll("path, circle, rect, line, polyline");
    parts.forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 0;
      if (len) gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.to(parts, { strokeDashoffset: 0, duration: 1.6, stagger: .08, ease: "power2.inOut", scrollTrigger: { trigger: svg, start: "top 92%", once: true } });
  });

  /* environmental feature: gold line follows the scroll */
  var fill = document.querySelector(".points__fill");
  if (fill) {
    gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".points", start: "top 70%", end: "bottom 60%", scrub: true } });
    gsap.utils.toArray(".point").forEach(function (p) {
      gsap.from(p, { autoAlpha: .2, x: 20, duration: .8, scrollTrigger: { trigger: p, start: "top 75%", toggleActions: "play none none reverse" } });
    });
  }

  /* subtle magnetic pull on primary buttons (pointer devices only) */
  if (window.matchMedia("(hover: hover)").matches) {
    gsap.utils.toArray("[data-magnetic]").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5 });
      });
      b.addEventListener("mouseleave", function () { gsap.to(b, { x: 0, y: 0, duration: .7, ease: "elastic.out(1, .4)" }); });
    });
  }

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
