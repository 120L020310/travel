
(() => {
  "use strict";

  const STYLE_IDS = ["oil", "y2k", "film", "sketchbook", "watercolor"];
  const COMPONENT_SELECTOR = ".memory-theme-component";
  const CONTROL_SELECTOR = ".memory-theme-control";
  const expandedCards = new Set();
  const allExpandedByStyle = new Map();

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function currentStyle() {
    const style = document.documentElement.dataset.memoryStyle;
    return STYLE_IDS.includes(style) ? style : "oil";
  }

  function hashText(value) {
    let hash = 2166136261;
    for (const character of String(value || "")) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cardData(card, index) {
    const title = $("h3", card)?.textContent?.trim() || "Memory";
    const country = $(".country-line", card)?.textContent?.trim() || "";
    const date = $(".trip-date", card)?.textContent?.trim() || "";
    const type = $(".trip-type", card)?.textContent?.trim() || "Journey";
    const seed = hashText(`${title}|${country}|${date}|${index}`);
    const serial = String((seed % 9999) + 1).padStart(4, "0");
    const frame = String((seed % 24) + 1).padStart(2, "0");
    const roll = String(((seed >>> 5) % 36) + 1).padStart(2, "0");
    const yearMatch = date.match(/\d{4}/);
    const year = yearMatch?.[0] || "2005";
    const city = title.split(/[·/]/)[0].trim();
    return { title, city, country, date, type, seed, serial, frame, roll, year };
  }

  function removeThemeComponent(card) {
    $$(
      `${COMPONENT_SELECTOR}, ${CONTROL_SELECTOR}, .memory-compact-summary, .universe-card-layer, .universe-cover-layer`,
      card
    ).forEach(element => element.remove());
    card.classList.remove(
      "memory-card-oil",
      "memory-card-y2k",
      "memory-card-film",
      "memory-card-sketchbook",
      "memory-card-watercolor"
    );
    delete card.dataset.themeComponent;
  }

  function createElement(className, html) {
    const element = document.createElement("div");
    element.className = `${className} memory-theme-component`;
    element.setAttribute("aria-hidden", "true");
    element.innerHTML = html;
    return element;
  }

  class PaintingMemoryCard {
    static id = "oil";

    static render(card) {
      /*
       * Oil Painting is deliberately left untouched. Stage 5.0 already owns
       * its card, typography, cover and motion. This component exists as a
       * separate renderer so switching back to Oil removes foreign structures
       * instead of applying a shared cover template.
       */
      card.classList.add("memory-card-oil");
      card.dataset.themeComponent = this.id;
    }
  }

  class Y2KMemoryCard {
    static id = "y2k";

    static render(card, data) {
      const media = $(".media-frame", card);
      if (!media) return;

      const symbols = ["🎀", "🐰", "🐱", "🦋", "✨", "💗", "💿", "🫧", "🍓", "📷", "🎧", "🍬", "🩵", "🐇", "💫", "☁️"];
      const icon = symbols[data.seed % symbols.length];
      const secondIcon = symbols[(data.seed >>> 4) % symbols.length];
      const palette = ["PINK", "AQUA", "LILAC", "LIME"];
      const colorLabel = palette[(data.seed >>> 7) % palette.length];

      const cover = createElement(
        "memory-cover-component memory-cover-component-y2k",
        `
          <div class="y2k-cover-titlebar">
            <span>memory_${escapeHTML(data.serial)}.exe</span>
            <b>_ □ ×</b>
          </div>
          <div class="y2k-cover-pixel-border"></div>
          <div class="y2k-cover-crt"></div>
          <span class="y2k-cover-folder">★<small>TRIP_${escapeHTML(data.roll)}</small></span>
          <span class="y2k-cover-icon y2k-cover-icon-a">${icon}</span>
          <span class="y2k-cover-icon y2k-cover-icon-b">${secondIcon}</span>
          <span class="y2k-cover-label">${colorLabel} MEMORY</span>
          <span class="y2k-cover-camera">CAM ${escapeHTML(data.frame)} / ${escapeHTML(data.year)}</span>
          <strong>PIXEL ${escapeHTML(data.city.toUpperCase())}</strong>
        `
      );

      const cardChrome = createElement(
        "memory-card-component memory-card-component-y2k",
        `
          <span class="y2k-card-status">ONLINE</span>
          <span class="y2k-card-file">FILE_${escapeHTML(data.serial)}</span>
          <span class="y2k-card-sticker">${icon}</span>
        `
      );

      media.appendChild(cover);
      card.appendChild(cardChrome);
      card.classList.add("memory-card-y2k");
      card.dataset.themeComponent = this.id;
    }
  }

  class FilmMemoryCard {
    static id = "film";

    static render(card, data) {
      const media = $(".media-frame", card);
      if (!media) return;

      const stock = data.seed % 2 ? "KODAK 200" : "FUJI 400";
      const sceneWords = [
        "LOCATION STUDY",
        "DAYLIGHT UNIT",
        "NIGHT SEQUENCE",
        "TRAVEL TAKE",
        "CITY CLOSE-UP",
        "SECOND ACT"
      ];
      const scene = sceneWords[(data.seed >>> 3) % sceneWords.length];

      const cover = createElement(
        "memory-cover-component memory-cover-component-film",
        `
          <div class="film-cover-perforation film-cover-perforation-top"></div>
          <div class="film-cover-perforation film-cover-perforation-bottom"></div>
          <div class="film-cover-scratch"></div>
          <div class="film-cover-flare"></div>
          <span class="film-cover-stock">${stock}</span>
          <span class="film-cover-ticket">CINEMA / ADMIT ONE / ${escapeHTML(data.serial)}</span>
          <span class="film-cover-timecode">00:${escapeHTML(data.roll)}:${escapeHTML(data.frame)}:18</span>
          <span class="film-cover-frame">ROLL ${escapeHTML(data.roll)} · FRAME ${escapeHTML(data.frame)}</span>
          <strong>${escapeHTML(data.city)}</strong>
          <small>${scene}</small>
        `
      );

      const cardChrome = createElement(
        "memory-card-component memory-card-component-film",
        `
          <span class="film-card-scene">SCENE ${escapeHTML(data.frame)}</span>
          <span class="film-card-stock">${stock}</span>
          <span class="film-card-number">${escapeHTML(data.serial)}</span>
        `
      );

      media.appendChild(cover);
      card.appendChild(cardChrome);
      card.classList.add("memory-card-film");
      card.dataset.themeComponent = this.id;
    }
  }

  class SketchbookMemoryCard {
    static id = "sketchbook";

    static render(card, data) {
      const media = $(".media-frame", card);
      if (!media) return;

      const noteWords = [
        "remember this light",
        "train at 18:42",
        "museum afternoon",
        "keep this corner",
        "coffee, map, sea",
        "walked here twice"
      ];
      const note = noteWords[(data.seed >>> 2) % noteWords.length];

      const cover = createElement(
        "memory-cover-component memory-cover-component-sketchbook",
        `
          <span class="sketch-cover-tape sketch-cover-tape-left"></span>
          <span class="sketch-cover-tape sketch-cover-tape-right"></span>
          <span class="sketch-cover-pencil-line"></span>
          <span class="sketch-cover-circle"></span>
          <span class="sketch-cover-star">*</span>
          <span class="sketch-cover-flower">✿</span>
          <span class="sketch-cover-number">PAGE ${escapeHTML(data.roll)}</span>
          <span class="sketch-cover-note">${escapeHTML(note)}</span>
          <strong>${escapeHTML(data.city)}</strong>
        `
      );

      const cardChrome = createElement(
        "memory-card-component memory-card-component-sketchbook",
        `
          <span class="sketch-card-fold"></span>
          <span class="sketch-card-arrow">→</span>
          <span class="sketch-card-stamp">TRAVEL NOTE<br>${escapeHTML(data.serial)}</span>
        `
      );

      media.appendChild(cover);
      card.appendChild(cardChrome);
      card.classList.add("memory-card-sketchbook");
      card.dataset.themeComponent = this.id;
    }
  }

  class WatercolorMemoryCard {
    static id = "watercolor";

    static render(card, data) {
      const media = $(".media-frame", card);
      if (!media) return;

      const cover = createElement(
        "memory-cover-component memory-cover-component-watercolor",
        `
          <span class="watercolor-cover-wash watercolor-cover-wash-a"></span>
          <span class="watercolor-cover-wash watercolor-cover-wash-b"></span>
          <span class="watercolor-cover-edge"></span>
          <span class="watercolor-cover-number">study ${escapeHTML(data.frame)}</span>
          <strong>${escapeHTML(data.city)}</strong>
          <small>${escapeHTML(data.year)} · pigment on remembered paper</small>
        `
      );

      media.appendChild(cover);
      card.classList.add("memory-card-watercolor");
      card.dataset.themeComponent = this.id;
    }
  }


  const foldLabels = Object.freeze({
    y2k:{ open:"OPEN FILE", close:"CLOSE FILE", icon:"▣" },
    film:{ open:"VIEW SCENE", close:"CLOSE SCENE", icon:"▶" },
    sketchbook:{ open:"展开手记", close:"收起手记", icon:"↗" },
    watercolor:{ open:"展开画页", close:"收起画页", icon:"◌" }
  });

  function isEnglishUI() {
    return String($("#languageSelect")?.value || document.documentElement.lang || "")
      .toLowerCase()
      .startsWith("en");
  }

  function cardKey(card, index, style) {
    return `${style}:${card.dataset.destinationId || index}`;
  }

  function buttonLabel(style, expanded) {
    const labels = foldLabels[style] || foldLabels.sketchbook;
    if (style === "sketchbook" && isEnglishUI()) {
      return expanded ? "CLOSE NOTE" : "READ NOTE";
    }
    if (style === "watercolor" && isEnglishUI()) {
      return expanded ? "CLOSE PAGE" : "OPEN PAGE";
    }
    return expanded ? labels.close : labels.open;
  }

  function applyExpandedState(card, expanded, style, index) {
    const key = cardKey(card, index, style);
    card.classList.toggle("is-memory-expanded", expanded);
    card.classList.toggle("is-memory-collapsed", !expanded);

    $$(".memory-card-toggle", card).forEach(button => {
      button.setAttribute("aria-expanded", String(expanded));
      const label = $(".memory-card-toggle-label", button);
      if (label) label.textContent = buttonLabel(style, expanded);
    });

    const summary = $(".memory-compact-summary", card);
    const content = $(".card-content", card);
    summary?.setAttribute("aria-hidden", String(expanded));
    content?.setAttribute("aria-hidden", String(!expanded));

    if (expanded) expandedCards.add(key);
    else expandedCards.delete(key);
  }

  function attachFoldControl(card, style, index) {
    if (style === "oil") return;

    const labels = foldLabels[style] || foldLabels.sketchbook;
    const key = cardKey(card, index, style);
    const data = cardData(card, index);
    const initiallyExpanded =
      expandedCards.has(key) || allExpandedByStyle.get(style) === true;

    card.classList.remove("is-memory-expanded");
    card.classList.add("is-memory-collapsed");

    const toggleCard = () => {
      const expanded = !card.classList.contains("is-memory-expanded");
      allExpandedByStyle.set(style, false);
      applyExpandedState(card, expanded, style, index);
      updateGlobalFoldButton(style);
      document.dispatchEvent(new CustomEvent("travel-journal-layout-change", {
        detail:{ style, expanded, destinationId:card.dataset.destinationId || "" }
      }));
    };

    const makeToggle = modifier => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        `memory-card-toggle memory-card-toggle-${style} ${modifier} memory-theme-control`;
      button.setAttribute("aria-expanded", String(initiallyExpanded));
      button.innerHTML = `
        <span class="memory-card-toggle-icon" aria-hidden="true">${labels.icon}</span>
        <span class="memory-card-toggle-label">${buttonLabel(style, initiallyExpanded)}</span>`;
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        toggleCard();
      });
      return button;
    };

    const summary = document.createElement("div");
    summary.className =
      `memory-compact-summary memory-compact-summary-${style} memory-theme-control`;
    summary.innerHTML = `
      <div class="memory-compact-copy">
        <span class="memory-compact-meta">${escapeHTML(data.type)} · ${escapeHTML(data.date)}</span>
        <strong>${escapeHTML(data.title)}</strong>
        <small>${escapeHTML(data.country)}</small>
      </div>
      <div class="memory-compact-actions"></div>`;

    const compactActions = $(".memory-compact-actions", summary);
    compactActions.appendChild(makeToggle("memory-card-toggle-compact"));

    const originalEdit = $(".edit-trip", card);
    if (originalEdit) {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className =
        `memory-compact-edit memory-compact-edit-${style} memory-theme-control`;
      editButton.setAttribute(
        "aria-label",
        originalEdit.textContent?.trim() || (isEnglishUI() ? "Edit" : "编辑")
      );
      editButton.innerHTML = `<span aria-hidden="true">✎</span>`;
      editButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        originalEdit.click();
      });
      compactActions.appendChild(editButton);
    }

    const media = $(".media-frame", card);
    media?.appendChild(summary);

    const content = $(".card-content", card) || card;
    content.appendChild(makeToggle("memory-card-toggle-expanded"));
    applyExpandedState(card, initiallyExpanded, style, index);
  }

  function updateGlobalFoldButton(style = currentStyle()) {
    const button = $("#journalFoldAll");
    if (!button) return;

    button.hidden = style === "oil";
    if (style === "oil") return;

    const cards = $$(".trip-card");
    const allExpanded =
      cards.length > 0 && cards.every(card => card.classList.contains("is-memory-expanded"));

    button.setAttribute("aria-expanded", String(allExpanded));
    const label = $(".journal-fold-all-label", button);
    if (label) {
      label.textContent = isEnglishUI()
        ? (allExpanded ? "COLLAPSE ALL" : "EXPAND ALL")
        : (allExpanded ? "收起全部日志" : "展开全部日志");
    }
  }

  function bindGlobalFoldButton() {
    const button = $("#journalFoldAll");
    if (!button || button.dataset.bound === "true") return;
    button.dataset.bound = "true";

    button.addEventListener("click", event => {
      event.preventDefault();
      const style = currentStyle();
      if (style === "oil") return;

      const cards = $$(".trip-card");
      const shouldExpand =
        !cards.length || !cards.every(card => card.classList.contains("is-memory-expanded"));

      allExpandedByStyle.set(style, shouldExpand);
      cards.forEach((card, index) => {
        applyExpandedState(card, shouldExpand, style, index);
      });
      updateGlobalFoldButton(style);
      document.dispatchEvent(new CustomEvent("travel-journal-layout-change", {
        detail:{ style, expanded:shouldExpand, all:true }
      }));
    });
  }

  const renderers = Object.freeze({
    oil: PaintingMemoryCard,
    y2k: Y2KMemoryCard,
    film: FilmMemoryCard,
    sketchbook: SketchbookMemoryCard,
    watercolor: WatercolorMemoryCard
  });

  function renderCard(card, index, style = currentStyle()) {
    const existingComponent = card.querySelector(COMPONENT_SELECTOR);
    const alreadyRendered = card.dataset.themeComponent === style;
    if (alreadyRendered && (style === "oil" || existingComponent)) return;

    removeThemeComponent(card);
    const Renderer = renderers[style] || PaintingMemoryCard;
    Renderer.render(card, cardData(card, index));
    attachFoldControl(card, style, index);
  }

  function renderAll(style = currentStyle()) {
    bindGlobalFoldButton();
    $$(".trip-card").forEach((card, index) => renderCard(card, index, style));
    updateGlobalFoldButton(style);
  }

  function clearAll() {
    $$(".trip-card").forEach(removeThemeComponent);
  }

  window.TravelMemoryComponents = Object.freeze({
    renderAll,
    renderCard,
    clearAll,
    currentStyle,
    updateGlobalFoldButton,
    renderers
  });

  console.info("[Travel Reverie] separate memory card components 6.4 loaded");
})();
