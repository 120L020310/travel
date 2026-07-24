
(() => {
  "use strict";

  const STYLE_IDS = ["oil", "y2k", "film", "sketchbook", "watercolor"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  let lenis = null;
  let gsapContext = null;
  let splitInstances = [];
  let rebuildTimer = 0;
  let cardObserver = null;
  let cursorX = null;
  let cursorY = null;
  let lenisTickerReady = false;

  const filmCulture = [
    {
      keys:["paris","巴黎"],
      title:"PARIS / AFTERNOON CONVERSATION",
      references:"BEFORE SUNSET · MIDNIGHT IN PARIS · THÉÂTRE PROGRAM",
      note:"A location study of river light, abandoned stages and conversations that outlive the scene."
    },
    {
      keys:["vienna","维也纳","維也納"],
      title:"VIENNA / DAWN UNIT",
      references:"BEFORE SUNRISE · NIGHT TRAM · FIRST LIGHT",
      note:"A nocturnal walk assembled as dialogue, tram windows and the silence before morning."
    },
    {
      keys:["budapest","布达佩斯","布達佩斯"],
      title:"BUDAPEST / GRAND LOBBY STUDY",
      references:"GRAND HOTEL MOOD · DANUBE NIGHT · EASTERN EUROPE",
      note:"Symmetry, red corridors and river reflections arranged as an imaginary hotel sequence."
    },
    {
      keys:["rome","罗马","羅馬"],
      title:"ROME / HOLIDAY REEL",
      references:"ROMAN HOLIDAY · VIA MARGUTTA · SUMMER CUT",
      note:"A city remembered through scooters, stone, fountain light and a day that feels borrowed."
    },
    {
      keys:["granada","格拉纳达","格拉納達"],
      title:"GRANADA / FESTIVAL PROGRAM",
      references:"EUROPEAN CINEMA · ALHAMBRA NIGHT · SECOND ACT",
      note:"Courtyard shadows and late-night streets edited like an independent festival programme."
    },
    {
      keys:["madrid","马德里","馬德里"],
      title:"MADRID / CITY UNIT",
      references:"CINEMATECA · METROPOLIS · WORKING DAYS",
      note:"A contemporary chapter of offices, metro transfers and the warm light after work."
    },
    {
      keys:["barcelona","巴塞罗那","巴塞羅那"],
      title:"BARCELONA / MEDITERRANEAN FRAME",
      references:"SUMMER REEL · MODERNIST CITY · SEA LIGHT",
      note:"Graphic façades, blue hours and the sea assembled as a bright editorial montage."
    },
    {
      keys:["seville","sevilla","塞维利亚","塞維利亞"],
      title:"SEVILLE / OPERA CITY",
      references:"CARMEN · ORANGE BLOSSOM · STAGE LIGHT",
      note:"An original programme-book composition inspired by courtyards, opera mythology and heat."
    },
    {
      keys:["naples","napoli","那不勒斯"],
      title:"NAPLES / SEA CUT",
      references:"ITALIAN STREET CINEMA · VESUVIUS · PORT REEL",
      note:"A rough, vivid cut of balconies, scooters, volcanic distance and the edge of the sea."
    },
    {
      keys:["málaga","malaga","马拉加","馬拉加"],
      title:"MÁLAGA / COASTAL FESTIVAL",
      references:"PICASSO CITY · 35MM SUN · SOUTHERN PROGRAM",
      note:"A coastal film-festival identity built from museum afternoons and high Mediterranean light."
    }
  ];

  function currentStyle() {
    const value = document.documentElement.dataset.memoryStyle;
    return STYLE_IDS.includes(value) ? value : "oil";
  }

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function findFilmCulture(title, country) {
    const searchable = normalizeText(`${title} ${country}`);
    return filmCulture.find(item =>
      item.keys.some(key => searchable.includes(normalizeText(key)))
    ) || {
      title:`${String(title || "CITY").split("·")[0].trim().toUpperCase()} / LOCATION STUDY`,
      references:"TRAVEL CUT · AVAILABLE LIGHT · MEMORY ARCHIVE",
      note:"An original cinematic identity assembled from the photographs, dates and atmosphere of this journey."
    };
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function createUniverseCardLayer(card, index) {
    window.TravelMemoryComponents?.renderCard?.(card, index, currentStyle());
  }

  function enhanceCards() {
    window.TravelMemoryComponents?.renderAll?.(currentStyle());

    $$(".archive-card").forEach((card, index) => {
      card.style.setProperty("--memory-index", String(index + 1));
      card.style.setProperty("--archive-rotate", `${((index % 5) - 2) * .42}deg`);
      card.dataset.archiveNumber = String(index + 1).padStart(2, "0");
    });

    clearTimeout(rebuildTimer);
    if (currentStyle() !== "film") {
      rebuildTimer = setTimeout(rebuildMotion, 160);
    }
  }

  function observeDynamicContent() {
    if (cardObserver) cardObserver.disconnect();

    cardObserver = new MutationObserver(mutations => {
      if (mutations.some(mutation => mutation.addedNodes.length || mutation.removedNodes.length)) {
        enhanceCards();
      }
    });

    ["#journalGrid", "#archiveGrid", "#routeTimeline"].forEach(selector => {
      const element = $(selector);
      if (element) {
        cardObserver.observe(element, { childList:true, subtree:true });
      }
    });
  }


  function destroyLenis() {
    if (!lenis) return;
    try { lenis.destroy(); } catch (_) {}
    lenis = null;
  }

  function syncWorldRuntime(style = currentStyle()) {
    const worldSheet = $("#memoryWorldsCSS");
    if (worldSheet) worldSheet.disabled = style === "oil";

    document.documentElement.classList.toggle(
      "oil-painting-restored",
      style === "oil"
    );

    if (style === "oil") {
      cleanMotion();
      destroyLenis();
      window.TravelMemoryComponents?.renderAll?.("oil");
      return;
    }

    if (style === "film") {
      destroyLenis();
    } else {
      initLenis();
    }
    window.TravelMemoryComponents?.renderAll?.(style);
  }



  function decorateY2KSections() {
    const sectionSpecs = [
      ["#journal", ["🎀", "🍓", "🫧", "🐱"]],
      ["#map", ["🦋", "💿", "✨", "🐇"]],
      ["#archive", ["📷", "🍬", "🩵", "🎧"]]
    ];

    sectionSpecs.forEach(([selector, symbols]) => {
      const section = $(selector);
      if (!section || $(".y2k-section-emoji-layer", section)) return;

      const layer = document.createElement("div");
      layer.className = "y2k-section-emoji-layer";
      layer.setAttribute("aria-hidden", "true");

      symbols.forEach(symbol => {
        const element = document.createElement("span");
        element.className = "y2k-section-emoji";
        element.textContent = symbol;
        layer.appendChild(element);
      });

      section.appendChild(layer);
    });
  }

  function promoteY2KEmojiLayer() {
    const layer = $(".y2k-emoji-atmosphere");
    const hero = $(".hero");
    if (!layer || !hero || layer.parentElement === hero) return;
    hero.appendChild(layer);
  }

  function initQueryPreview() {
    const preview = new URLSearchParams(location.search).get("memoryStyle");
    if (!STYLE_IDS.includes(preview)) return;

    const selector = $("#memoryStyleSelect");
    if (!selector || selector.value === preview) return;

    selector.value = preview;
    selector.dispatchEvent(new Event("change", { bubbles:true }));
  }

  function initLenis() {
    if (
      currentStyle() === "oil" ||
      lenis ||
      reducedMotion ||
      typeof window.Lenis !== "function"
    ) return;

    try {
      lenis = new window.Lenis({
        autoRaf:false,
        duration:1.12,
        smoothWheel:true,
        syncTouch:false,
        anchors:{ offset:-92 },
        stopInertiaOnNavigate:true,
        prevent:node => Boolean(
          node.closest?.(
            "dialog, .theme-panel, .music-popover, .route-timeline, " +
            ".archive-grid, .leaflet-container, .map-canvas, input, textarea, select"
          )
        )
      });

      if (window.gsap && window.ScrollTrigger) {
        lenis.on("scroll", window.ScrollTrigger.update);
        if (!lenisTickerReady) {
          window.gsap.ticker.add(time => lenis?.raf(time * 1000));
          window.gsap.ticker.lagSmoothing(0);
          lenisTickerReady = true;
        }
      } else {
        const raf = time => {
          lenis?.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    } catch (error) {
      console.warn("[Travel Reverie] Lenis disabled:", error);
      lenis = null;
    }
  }

  function cleanMotion() {
    if (gsapContext) {
      gsapContext.revert();
      gsapContext = null;
    }

    splitInstances.forEach(instance => {
      try { instance.revert(); } catch (_) {}
    });
    splitInstances = [];

    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll()
        .filter(trigger => String(trigger.vars?.id || "").startsWith("memory-"))
        .forEach(trigger => trigger.kill());
    }
  }

  function splitHeadings() {
    if (!window.SplitText) return [];

    const results = [];
    $$(".section-heading h2").forEach((heading, index) => {
      try {
        const split = new window.SplitText(heading, {
          type:"lines,words",
          linesClass:"memory-split-line",
          wordsClass:"memory-split-word"
        });
        splitInstances.push(split);
        results.push({ heading, split, index });
      } catch (_) {}
    });
    return results;
  }

  function animateTransition(style) {
    if (style === "oil") return;
    const overlay = $("#memoryTransition");
    const surface = $(".memory-transition-surface", overlay);
    const grid = $(".memory-transition-grid", overlay);
    const title = $(".memory-transition-title", overlay);

    if (!overlay || reducedMotion || !window.gsap) return;

    title.textContent = {
      oil:"ENTERING GALLERY",
      y2k:"LOADING MEMORY.EXE",
      film:"ROLLING NEXT SCENE",
      sketchbook:"TURNING THE PAGE",
      watercolor:"MIXING PIGMENT"
    }[style] || "ENTERING MEMORY";

    const gsap = window.gsap;
    const timeline = gsap.timeline({
      defaults:{ ease:"power3.inOut" },
      onStart:() => {
        overlay.style.visibility = "visible";
      },
      onComplete:() => {
        overlay.style.visibility = "hidden";
        gsap.set([surface, grid, title], { clearProps:"all" });
      }
    });

    if (style === "film") {
      timeline
        .set(surface, { scaleY:1, clipPath:"inset(49% 0 49% 0)" })
        .to(surface, { clipPath:"inset(0% 0 0% 0)", duration:.32 })
        .to(title, { opacity:1, duration:.12 }, "<+.08")
        .to(title, { opacity:0, duration:.12, delay:.16 })
        .to(surface, { clipPath:"inset(49% 0 49% 0)", duration:.38 });
    } else if (style === "watercolor") {
      timeline
        .set(surface, { scale:0, borderRadius:"50%", opacity:.94 })
        .to(surface, { scale:1.8, duration:.48 })
        .to(title, { opacity:1, duration:.16 }, "<+.12")
        .to(title, { opacity:0, duration:.12, delay:.12 })
        .to(surface, { opacity:0, scale:2.2, duration:.34 });
    } else if (style === "sketchbook") {
      timeline
        .set(surface, { transformOrigin:"left center", scaleX:0, rotateY:-18 })
        .to(surface, { scaleX:1, rotateY:0, duration:.42 })
        .to(title, { opacity:1, duration:.14 }, "<+.12")
        .to(title, { opacity:0, duration:.12, delay:.12 })
        .to(surface, { transformOrigin:"right center", scaleX:0, rotateY:14, duration:.42 });
    } else if (style === "y2k") {
      timeline
        .set(surface, { scaleY:0, transformOrigin:"bottom" })
        .set(grid, {
          opacity:1,
          backgroundImage:
            "linear-gradient(rgba(72,90,146,.14) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(72,90,146,.14) 1px,transparent 1px)",
          backgroundSize:"18px 18px"
        })
        .to(surface, { scaleY:1, duration:.34, ease:"steps(8)" })
        .to(title, { opacity:1, duration:.10, ease:"none" }, "<+.11")
        .to(title, { opacity:0, duration:.08, delay:.18 })
        .to(surface, { scaleY:0, transformOrigin:"top", duration:.36, ease:"steps(8)" })
        .to(grid, { opacity:0, duration:.12 }, "<");
    } else {
      timeline
        .set(surface, { opacity:0, scale:1.08 })
        .to(surface, { opacity:1, scale:1, duration:.40 })
        .to(title, { opacity:1, duration:.15 }, "<+.12")
        .to(title, { opacity:0, duration:.12, delay:.14 })
        .to(surface, { opacity:0, scale:.98, duration:.34 });
    }
  }

  function heroMotion(style, gsap) {
    const title = $(".hero-title");
    const intro = $(".hero-intro");
    const actions = $(".hero-actions");
    const card = $(".hero-card");
    const interfacePanel = $(`.memory-interface-${style}`);
    const stage = $(`.world-stage-${style}`);

    const timeline = gsap.timeline({ defaults:{ ease:"power3.out" } });

    if (style === "y2k") {
      timeline
        .from(".hero-copy", { y:36, scale:.94, opacity:0, duration:.75 })
        .from(title, { y:28, opacity:0, duration:.55 }, "-=.42")
        .from([intro, actions], { y:18, opacity:0, stagger:.10, duration:.42 }, "-=.28")
        .from(card, { x:55, rotate:5, scale:.86, opacity:0, duration:.62 }, "-=.38")
        .from(".world-stage-y2k .y2k-window", {
          scale:.65,
          opacity:0,
          y:28,
          rotate:() => gsap.utils.random(-8,8),
          stagger:.09,
          duration:.52,
          ease:"back.out(1.8)"
        }, "-=.48");
    } else if (style === "film") {
      timeline
        .from(title, { clipPath:"inset(0 100% 0 0)", duration:1.05, ease:"power4.inOut" })
        .from(".film-opening-credit > *", { y:15, opacity:0, stagger:.08, duration:.45 }, "-=.58")
        .from([intro, actions], { y:24, opacity:0, stagger:.12, duration:.58 }, "-=.30")
        .from(".film-clapper", { y:-30, rotate:-5, opacity:0, duration:.72 }, "-=.48")
        .from(".film-timecode", { opacity:0, duration:.35 }, "-=.30");
    } else if (style === "sketchbook") {
      timeline
        .from(".hero-copy", { x:-42, rotate:-2, opacity:0, duration:.78 })
        .from(title, { y:30, opacity:0, duration:.55 }, "-=.44")
        .from([intro, actions], { y:18, opacity:0, stagger:.11, duration:.48 }, "-=.28")
        .from(card, { x:42, rotate:5, opacity:0, duration:.72 }, "-=.45")
        .from(".world-stage-sketchbook .sketch-ticket, .world-stage-sketchbook .sketch-note", {
          scale:.82,
          rotate:() => gsap.utils.random(-12,12),
          opacity:0,
          stagger:.10,
          duration:.50,
          ease:"back.out(1.4)"
        }, "-=.55");
    } else if (style === "watercolor") {
      timeline
        .from(title, { y:26, opacity:0, filter:"blur(14px)", duration:1.1 })
        .from([interfacePanel,intro,actions], { y:16, opacity:0, stagger:.12, duration:.58 }, "-=.65")
        .from(card, { scale:.84, opacity:0, filter:"blur(9px)", duration:.74 }, "-=.48")
        .from(".watercolor-bloom", { scale:.42, opacity:0, stagger:.12, duration:1.1 }, "-=.82");
    } else {
      timeline
        .from(title, { y:45, opacity:0, duration:.92 })
        .from([interfacePanel,intro,actions], { y:20, opacity:0, stagger:.12, duration:.55 }, "-=.52")
        .from(card, { x:38, opacity:0, duration:.72 }, "-=.50")
        .from(".oil-spotlight", { scaleY:.2, opacity:0, stagger:.12, duration:1.2 }, "-=.75");
    }

    if (stage && !reducedMotion) {
      const layers = $$(":scope > *", stage);
      layers.forEach((layer, index) => {
        gsap.to(layer, {
          yPercent:index % 2 ? -4 : 4,
          xPercent:index % 3 ? 1.5 : -1.5,
          ease:"none",
          scrollTrigger:{
            id:`memory-hero-${style}-${index}`,
            trigger:".hero",
            start:"top top",
            end:"bottom top",
            scrub:1.4
          }
        });
      });
    }
  }

  function cardMotion(style, gsap) {
    const cards = $$(".trip-card");

    cards.forEach((card, index) => {
      const media = $(".media-frame", card);
      const content = $(".card-content", card);

      const presets = {
        oil:{
          from:{ y:70, opacity:0, scale:.965 },
          duration:.86
        },
        y2k:{
          from:{ y:44, opacity:0, scale:.88, rotate:index % 2 ? 2.4 : -2.4 },
          duration:.68
        },
        film:{
          from:{ x:index % 2 ? 120 : -120, opacity:0, clipPath:index % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
          duration:1.05
        },
        sketchbook:{
          from:{ y:55, x:index % 2 ? 28 : -28, opacity:0, rotate:index % 2 ? 4 : -4 },
          duration:.78
        },
        watercolor:{
          from:{ y:40, opacity:0, scale:.94, filter:"blur(10px)" },
          duration:1.02
        }
      };

      const preset = presets[style] || presets.oil;

      gsap.from(card, {
        ...preset.from,
        duration:preset.duration,
        ease:style === "y2k" ? "back.out(1.25)" : "power3.out",
        clearProps:"transform,filter,clipPath",
        scrollTrigger:{
          id:`memory-card-${style}-${index}`,
          trigger:card,
          start:"top 88%",
          once:true
        }
      });

      if (media && !reducedMotion) {
        gsap.fromTo(
          media,
          { backgroundPosition:"50% 44%" },
          {
            backgroundPosition:"50% 58%",
            ease:"none",
            scrollTrigger:{
              id:`memory-media-${style}-${index}`,
              trigger:card,
              start:"top bottom",
              end:"bottom top",
              scrub:1.5
            }
          }
        );
      }

      if (style === "film" && content) {
        gsap.from(content.children, {
          y:18,
          opacity:0,
          stagger:.07,
          duration:.48,
          scrollTrigger:{
            id:`memory-film-copy-${index}`,
            trigger:card,
            start:"top 70%",
            once:true
          }
        });
      }
    });
  }

  function sectionMotion(style, gsap) {
    const splitHeadingsData = splitHeadings();

    splitHeadingsData.forEach(({ heading, split, index }) => {
      const targets = split.words?.length ? split.words : split.lines;
      gsap.from(targets, {
        yPercent:style === "film" ? 110 : 70,
        opacity:0,
        rotate:style === "sketchbook" ? -3 : 0,
        stagger:.035,
        duration:style === "film" ? .82 : .62,
        ease:"power3.out",
        scrollTrigger:{
          id:`memory-heading-${style}-${index}`,
          trigger:heading,
          start:"top 84%",
          once:true
        }
      });
    });

    $$(".section-shell").forEach((section, index) => {
      if (style === "film") {
        gsap.from(section, {
          opacity:0,
          duration:.5,
          scrollTrigger:{
            id:`memory-section-${style}-${index}`,
            trigger:section,
            start:"top 92%",
            once:true
          }
        });
      } else if (style === "watercolor") {
        gsap.from(section, {
          y:35,
          opacity:0,
          filter:"blur(8px)",
          duration:.9,
          clearProps:"filter",
          scrollTrigger:{
            id:`memory-section-${style}-${index}`,
            trigger:section,
            start:"top 90%",
            once:true
          }
        });
      }
    });

    if (style === "film") {
      const timecode = $(".film-timecode");
      if (timecode) {
        window.ScrollTrigger.create({
          id:"memory-film-timecode",
          trigger:"main",
          start:"top top",
          end:"bottom bottom",
          onUpdate:self => {
            const total = Math.floor(self.progress * 26 * 60);
            const minute = String(Math.floor(total / 60)).padStart(2,"0");
            const second = String(total % 60).padStart(2,"0");
            const frame = String(Math.floor((self.progress * 240) % 24)).padStart(2,"0");
            timecode.textContent = `00:${minute}:${second}:${frame}`;
          }
        });
      }
    }
  }

  function ambientMotion(style, gsap) {
    if (reducedMotion) return;

    if (style === "y2k") {
      gsap.to(".y2k-cloud-a", { x:18, y:-8, duration:8, repeat:-1, yoyo:true, ease:"sine.inOut" });
      gsap.to(".y2k-cloud-b", { x:-14, y:7, duration:10, repeat:-1, yoyo:true, ease:"sine.inOut" });
      gsap.to(".y2k-window-mp3", { y:-7, rotate:-.5, duration:5.8, repeat:-1, yoyo:true, ease:"sine.inOut" });
    } else if (style === "film") {
      gsap.to(".film-clapper", { y:-4, rotate:.7, duration:6.5, repeat:-1, yoyo:true, ease:"sine.inOut" });
    } else if (style === "sketchbook") {
      gsap.to(".sketch-note-a", { rotate:-2, y:-3, duration:7.4, repeat:-1, yoyo:true, ease:"sine.inOut" });
      gsap.to(".sketch-ticket-rail", { rotate:2.5, y:4, duration:8.2, repeat:-1, yoyo:true, ease:"sine.inOut" });
    } else if (style === "watercolor") {
      gsap.to(".watercolor-bloom-a", { scale:1.08, x:12, duration:11, repeat:-1, yoyo:true, ease:"sine.inOut" });
      gsap.to(".watercolor-bloom-b", { scale:.94, y:10, duration:13, repeat:-1, yoyo:true, ease:"sine.inOut" });
    } else {
      gsap.to(".oil-spotlight-a", { opacity:.22, rotate:10, duration:10, repeat:-1, yoyo:true, ease:"sine.inOut" });
      gsap.to(".oil-spotlight-b", { opacity:.36, rotate:-8, duration:12, repeat:-1, yoyo:true, ease:"sine.inOut" });
    }
  }

  function rebuildMotion() {
    cleanMotion();

    if (currentStyle() === "oil") return;
    if (!window.gsap || !window.ScrollTrigger) return;

    const gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(window.SplitText);

    const style = currentStyle();

    gsapContext = gsap.context(() => {
      heroMotion(style, gsap);
      if (style !== "film") {
        cardMotion(style, gsap);
      }
      sectionMotion(style, gsap);
      ambientMotion(style, gsap);
    }, document.body);

    requestAnimationFrame(() => window.ScrollTrigger.refresh());
  }

  function initMagneticControls() {
    if (
      currentStyle() === "oil" ||
      !finePointer ||
      reducedMotion ||
      !window.gsap
    ) return;

    const gsap = window.gsap;
    $$(
      ".primary-button, .pill-button, .ghost-button, .map-mode, " +
      ".icon-button, .tiny-button, .music-sticker-toggle"
    ).forEach(button => {
      if (button.dataset.magneticReady) return;
      button.dataset.magneticReady = "true";

      const xTo = gsap.quickTo(button, "x", { duration:.32, ease:"power3.out" });
      const yTo = gsap.quickTo(button, "y", { duration:.32, ease:"power3.out" });

      button.addEventListener("mousemove", event => {
        const rect = button.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * .16);
        yTo((event.clientY - rect.top - rect.height / 2) * .18);
      });

      button.addEventListener("mouseleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  function initCursor() {
    const cursor = $("#memoryCursor");
    if (!cursor || !finePointer || reducedMotion) return;

    const label = $(".memory-cursor-label", cursor);
    const gsap = window.gsap;

    if (gsap) {
      cursorX = gsap.quickTo(cursor, "x", { duration:.18, ease:"power3.out" });
      cursorY = gsap.quickTo(cursor, "y", { duration:.18, ease:"power3.out" });
    }

    document.addEventListener("mousemove", event => {
      cursor.classList.add("is-visible");
      if (cursorX && cursorY) {
        cursorX(event.clientX - 17);
        cursorY(event.clientY - 17);
      } else {
        cursor.style.transform = `translate3d(${event.clientX - 17}px,${event.clientY - 17}px,0)`;
      }
    }, { passive:true });

    document.addEventListener("mouseover", event => {
      const interactive = event.target.closest(
        "a,button,select,input,textarea,.trip-card,.archive-card,.leaflet-interactive"
      );
      cursor.classList.toggle("is-interactive", Boolean(interactive));
      if (!interactive) {
        label.textContent = "MEMORY";
        return;
      }

      if (interactive.matches("input,textarea,select")) label.textContent = "EDIT";
      else if (interactive.closest(".music-sticker")) label.textContent = "PLAY";
      else if (interactive.closest(".map-frame")) label.textContent = "EXPLORE";
      else if (interactive.matches(".trip-card,.archive-card")) label.textContent = "OPEN";
      else label.textContent = "ENTER";
    });

    document.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-visible");
    });
  }

  function initMouseParallax() {
    if (!finePointer || reducedMotion || !window.gsap) return;

    const gsap = window.gsap;
    const hero = $(".hero");
    if (!hero) return;

    hero.addEventListener("mousemove", event => {
      if (["oil", "film"].includes(currentStyle())) return;
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;

      const activeStage = $(`.world-stage-${currentStyle()}`);
      if (!activeStage) return;

      $$(":scope > *", activeStage).forEach((element, index) => {
        const depth = (index % 4 + 1) * 2.2;
        gsap.to(element, {
          x:px * depth,
          y:py * depth,
          duration:.85,
          ease:"power2.out",
          overwrite:"auto"
        });
      });
    }, { passive:true });
  }


  function handleJournalLayoutChange() {
    requestAnimationFrame(() => {
      lenis?.resize?.();
      window.ScrollTrigger?.refresh?.();
    });
    setTimeout(() => {
      lenis?.resize?.();
      window.ScrollTrigger?.refresh?.();
    }, 360);
  }

  function handleStyleChange(event) {
    const style = event.detail?.style || currentStyle();

    promoteY2KEmojiLayer();
    decorateY2KSections();
    syncWorldRuntime(style);

    if (style === "oil") {
      enhanceCards();
      return;
    }

    animateTransition(style);
    enhanceCards();

    setTimeout(() => {
      rebuildMotion();
      initMagneticControls();
      lenis?.resize?.();
    }, 90);
  }

  function init() {
    promoteY2KEmojiLayer();
    decorateY2KSections();
    syncWorldRuntime(currentStyle());
    initCursor();
    initMouseParallax();
    observeDynamicContent();
    enhanceCards();
    initMagneticControls();
    initQueryPreview();

    document.addEventListener("travel-memory-style-change", handleStyleChange);
    document.addEventListener("travel-journal-layout-change", handleJournalLayoutChange);
    window.addEventListener("resize", () => {
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(() => {
        rebuildMotion();
        lenis?.resize?.();
      }, 220);
    }, { passive:true });

    document.fonts?.ready?.then(() => {
      enhanceCards();
      rebuildMotion();
    }).catch(() => rebuildMotion());

    setTimeout(() => {
      enhanceCards();
      rebuildMotion();
    }, 900);

    console.info("[Travel Reverie] creative experience 6.4 loaded");
  }

  init();
})();
