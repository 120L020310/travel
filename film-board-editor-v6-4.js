(() => {
  "use strict";

  const DB_NAME = "travel-reverie-film-reference-v1";
  const STORE_NAME = "images";
  const MAX_FILE_SIZE = 12 * 1024 * 1024;
  const CAROUSEL_INTERVAL = 5200;
  const objectUrls = new Map();
  const carouselTimers = new Map();

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath:"slot" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function readStoredImages(slot) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(slot);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function writeStoredImages(slot, images) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({ slot, images, updatedAt:Date.now() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function removeStoredImages(slot) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(slot);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function makePhotoId() {
    return crypto?.randomUUID?.() || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function normalizeStoredImages(record) {
    if (Array.isArray(record?.images)) {
      return record.images
        .filter(photo => photo?.blob)
        .map(photo => ({
          id: photo.id || makePhotoId(),
          blob: photo.blob,
          name: photo.name || "",
          type: photo.type || photo.blob.type || "",
          updatedAt: Number(photo.updatedAt) || Date.now()
        }));
    }

    // V6 stored one custom Blob per frame. Treat it as the first custom photo
    // so existing replacements survive the gallery upgrade.
    if (record?.blob) {
      return [{
        id: `legacy-${record.updatedAt || Date.now()}`,
        blob: record.blob,
        name: record.name || "",
        type: record.type || record.blob.type || "",
        updatedAt: Number(record.updatedAt) || Date.now()
      }];
    }

    return [];
  }

  function releaseObjectUrl(slot) {
    const current = objectUrls.get(slot);
    if (!current) return;
    URL.revokeObjectURL(current);
    objectUrls.delete(slot);
  }

  function photoCollection(figure) {
    return [
      {
        id:"default",
        kind:"default",
        src:figure.dataset.defaultFilmSrc || "",
        alt:figure.dataset.defaultFilmAlt || ""
      },
      ...(Array.isArray(figure._filmPhotos) ? figure._filmPhotos : []).map(photo => ({ ...photo, kind:"custom" }))
    ];
  }

  function updatePhotoCount(figure, index, count) {
    const counter = $(".film-reference-photo-count", figure);
    if (counter) counter.textContent = `${index + 1} / ${count}`;
    figure.classList.toggle("is-photo-carousel", count > 1);
    figure.dataset.photoIndex = String(index);
    figure.dataset.photoCount = String(count);
  }

  function showPhotoAt(figure, requestedIndex = 0) {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    const photos = photoCollection(figure);
    if (!slot || !image || !photos.length) return;

    const index = ((requestedIndex % photos.length) + photos.length) % photos.length;
    const photo = photos[index];
    releaseObjectUrl(slot);

    if (photo.kind === "default") {
      image.src = photo.src;
      image.alt = photo.alt || image.alt;
      figure.classList.remove("is-custom-film-image");
    } else {
      const url = URL.createObjectURL(photo.blob);
      objectUrls.set(slot, url);
      image.src = url;
      image.alt = photo.name ? `自定义旅行照片：${photo.name}` : "自定义旅行照片";
      figure.classList.add("is-custom-film-image");
    }

    image.title = photos.length > 1 ? "点击切换下一张照片" : "添加照片后可自动轮播";
    updatePhotoCount(figure, index, photos.length);
  }

  function nextPhoto(figure) {
    showPhotoAt(figure, Number(figure.dataset.photoIndex || 0) + 1);
  }

  function stopCarousel(slot) {
    const timer = carouselTimers.get(slot);
    if (!timer) return;
    clearInterval(timer);
    carouselTimers.delete(slot);
  }

  function startCarousel(figure) {
    const slot = figure.dataset.filmSlot;
    if (!slot) return;
    stopCarousel(slot);
    if (photoCollection(figure).length < 2) return;

    carouselTimers.set(slot, setInterval(() => {
      const style = document.documentElement.dataset.memoryStyle;
      const board = figure.closest(".film-reference-board");
      if (document.hidden || !board?.open || !["film", "oil"].includes(style)) return;
      nextPhoto(figure);
    }, CAROUSEL_INTERVAL));
  }

  async function validateImage(file) {
    if (!file?.type?.startsWith("image/")) {
      throw new Error("请选择图片文件。");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("单张图片不能超过 12MB。");
    }

    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      const valid = bitmap.width >= 320 && bitmap.height >= 220;
      bitmap.close();
      if (!valid) {
        throw new Error("图片尺寸过小，建议至少 320 × 220。");
      }
    }
  }

  function setControlsBusy(controls, busy) {
    $$('button', controls).forEach(button => { button.disabled = busy; });
  }

  function createControls(figure) {
    if ($(".film-reference-edit-controls", figure)) return;

    const controls = document.createElement("div");
    controls.className = "film-reference-edit-controls";
    controls.innerHTML = `
      <span class="film-reference-photo-count" aria-live="polite"></span>
      <button type="button" data-film-action="add" title="向此照片框添加图片">添加照片</button>
      <button type="button" data-film-action="reset" title="移除所有自定义图片并恢复项目自带照片">恢复默认</button>
      <input type="file" accept="image/*" multiple hidden>`;

    const addButton = $('[data-film-action="add"]', controls);
    const resetButton = $('[data-film-action="reset"]', controls);
    const fileInput = $('input[type="file"]', controls);

    addButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      fileInput.click();
    });

    resetButton.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();

      const slot = figure.dataset.filmSlot;
      if (!slot) return;

      setControlsBusy(controls, true);
      try {
        await removeStoredImages(slot);
        figure._filmPhotos = [];
        showPhotoAt(figure, 0);
        startCarousel(figure);
      } catch (error) {
        console.error("[Travel Reverie] Photo gallery reset failed", error);
        alert("恢复默认图片失败，请稍后重试。");
      } finally {
        setControlsBusy(controls, false);
      }
    });

    fileInput.addEventListener("change", async () => {
      const files = [...(fileInput.files || [])];
      fileInput.value = "";
      if (!files.length) return;

      const slot = figure.dataset.filmSlot;
      if (!slot) return;

      setControlsBusy(controls, true);
      try {
        for (const file of files) await validateImage(file);
        const current = Array.isArray(figure._filmPhotos) ? figure._filmPhotos : [];
        const additions = files.map(file => ({
          id: makePhotoId(),
          blob:file,
          name:file.name,
          type:file.type,
          updatedAt:Date.now()
        }));
        figure._filmPhotos = [...current, ...additions];
        await writeStoredImages(slot, figure._filmPhotos);
        showPhotoAt(figure, figure._filmPhotos.length);
        startCarousel(figure);
      } catch (error) {
        console.error("[Travel Reverie] Photo gallery save failed", error);
        alert(error?.message || "添加照片失败，请重试。");
      } finally {
        setControlsBusy(controls, false);
      }
    });

    figure.appendChild(controls);
  }

  async function handleBrokenCustomPhoto(figure) {
    const slot = figure.dataset.filmSlot;
    const photos = photoCollection(figure);
    const active = photos[Number(figure.dataset.photoIndex || 0)];
    if (!slot || active?.kind !== "custom") return;

    figure._filmPhotos = (figure._filmPhotos || []).filter(photo => photo.id !== active.id);
    try {
      if (figure._filmPhotos.length) await writeStoredImages(slot, figure._filmPhotos);
      else await removeStoredImages(slot);
    } catch (_) {}
    showPhotoAt(figure, 0);
    startCarousel(figure);
  }

  async function initializeFigure(figure) {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    if (!slot || !image) return;

    figure.dataset.defaultFilmSrc = image.getAttribute("src") || "";
    figure.dataset.defaultFilmAlt = image.alt || "";
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    createControls(figure);

    image.addEventListener("error", () => { handleBrokenCustomPhoto(figure); });
    image.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key) || photoCollection(figure).length < 2) return;
      event.preventDefault();
      nextPhoto(figure);
    });
    figure.addEventListener("click", event => {
      if (event.target.closest("button, input, a") || photoCollection(figure).length < 2) return;
      nextPhoto(figure);
    });

    try {
      const stored = await readStoredImages(slot);
      figure._filmPhotos = normalizeStoredImages(stored);
      // Preserve the previous single-image editor behaviour for existing users:
      // when they already replaced a frame, their first saved photo opens first.
      showPhotoAt(figure, figure._filmPhotos.length ? 1 : 0);
      startCarousel(figure);
    } catch (error) {
      console.warn("[Travel Reverie] Unable to restore photo gallery", error);
      figure._filmPhotos = [];
      showPhotoAt(figure, 0);
    }
  }

  async function initialize() {
    const figures = $$(".film-reference-card[data-film-slot]");
    await Promise.all(figures.map(initializeFigure));
    console.info("[Travel Reverie] editable photo wall carousel 7.7 loaded");
  }

  window.addEventListener("beforeunload", () => {
    [...objectUrls.keys()].forEach(releaseObjectUrl);
    [...carouselTimers.keys()].forEach(stopCarousel);
  });

  initialize();
})();
