(() => {
  "use strict";

  const DB_NAME = "travel-reverie-film-reference-v1";
  const STORE_NAME = "images";
  const MAX_FILE_SIZE = 12 * 1024 * 1024;
  const CAROUSEL_INTERVAL = 5200;
  const objectUrls = new Map();
  const carouselTimers = new Map();
  const libraryState = { dialog:null, figure:null, selectedIds:new Set(), thumbnailUrls:[] };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath:"slot" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function readStoredImages(slot) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(slot);
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
    return globalThis.crypto?.randomUUID?.() || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function normalizeStoredImages(record) {
    if (Array.isArray(record?.images)) {
      return record.images.filter(photo => photo?.blob).map(photo => ({
        id:photo.id || makePhotoId(), blob:photo.blob, name:photo.name || "",
        type:photo.type || photo.blob.type || "", updatedAt:Number(photo.updatedAt) || Date.now()
      }));
    }
    if (record?.blob) return [{
      id:`legacy-${record.updatedAt || Date.now()}`, blob:record.blob, name:record.name || "",
      type:record.type || record.blob.type || "", updatedAt:Number(record.updatedAt) || Date.now()
    }];
    return [];
  }

  function releaseObjectUrl(slot) {
    const current = objectUrls.get(slot);
    if (!current) return;
    URL.revokeObjectURL(current);
    objectUrls.delete(slot);
  }

  function releaseLibraryThumbnails() {
    libraryState.thumbnailUrls.forEach(url => URL.revokeObjectURL(url));
    libraryState.thumbnailUrls = [];
  }

  function photoCollection(figure) {
    return [
      { id:"default", kind:"default", src:figure.dataset.defaultFilmSrc || "", alt:figure.dataset.defaultFilmAlt || "" },
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
    image.title = photos.length > 1 ? "点击切换下一张照片 · 右键管理照片库" : "右键打开照片库并添加照片";
    updatePhotoCount(figure, index, photos.length);
  }

  function nextPhoto(figure) { showPhotoAt(figure, Number(figure.dataset.photoIndex || 0) + 1); }

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
      const isEditingThisFrame = libraryState.figure === figure && libraryState.dialog?.open;
      if (document.hidden || isEditingThisFrame || !board?.open || !["film", "oil"].includes(style)) return;
      nextPhoto(figure);
    }, CAROUSEL_INTERVAL));
  }

  async function validateImage(file) {
    if (!file?.type?.startsWith("image/")) throw new Error("请选择图片文件。");
    if (file.size > MAX_FILE_SIZE) throw new Error("单张图片不能超过 12MB。");
    if (typeof createImageBitmap === "function") {
      const bitmap = await createImageBitmap(file);
      const valid = bitmap.width >= 320 && bitmap.height >= 220;
      bitmap.close();
      if (!valid) throw new Error("图片尺寸过小，建议至少 320 × 220。");
    }
  }

  function ensurePhotoCounter(figure) {
    if ($(".film-reference-photo-count", figure)) return;
    const counter = document.createElement("span");
    counter.className = "film-reference-photo-count";
    counter.setAttribute("aria-live", "polite");
    figure.appendChild(counter);
  }

  function ensurePhotoLibrary() {
    if (libraryState.dialog) return libraryState.dialog;
    const dialog = document.createElement("dialog");
    dialog.className = "photo-library-dialog";
    dialog.setAttribute("aria-label", "地点相框照片库");
    dialog.addEventListener("close", () => {
      releaseLibraryThumbnails();
      libraryState.figure = null;
      libraryState.selectedIds.clear();
    });
    document.body.appendChild(dialog);
    libraryState.dialog = dialog;
    return dialog;
  }

  function customPhotoIndex(figure, id) { return (figure._filmPhotos || []).findIndex(photo => photo.id === id); }

  function renderPhotoLibrary() {
    const dialog = ensurePhotoLibrary();
    const figure = libraryState.figure;
    if (!figure) return;
    releaseLibraryThumbnails();

    const photos = photoCollection(figure);
    const activeIndex = Number(figure.dataset.photoIndex || 0);
    const customPhotos = figure._filmPhotos || [];
    const selectedCount = libraryState.selectedIds.size;
    const onlySelectedId = selectedCount === 1 ? [...libraryState.selectedIds][0] : "";
    const selectedIndex = onlySelectedId ? customPhotoIndex(figure, onlySelectedId) : -1;
    const items = photos.map((photo, index) => {
      if (photo.kind === "default") {
        return `<article class="photo-library-item is-default${index === activeIndex ? " is-active" : ""}">
          <img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.alt)}">
          <div><strong>项目默认照片</strong><span>固定保留 · 顺序第 1 张</span></div>
        </article>`;
      }
      const url = URL.createObjectURL(photo.blob);
      libraryState.thumbnailUrls.push(url);
      const selected = libraryState.selectedIds.has(photo.id);
      return `<label class="photo-library-item${selected ? " is-selected" : ""}${index === activeIndex ? " is-active" : ""}">
        <input type="checkbox" data-library-select="${escapeHTML(photo.id)}" ${selected ? "checked" : ""}>
        <img src="${escapeHTML(url)}" alt="${escapeHTML(photo.name || "自定义旅行照片")}">
        <div><strong>${escapeHTML(photo.name || "未命名照片")}</strong><span>轮播第 ${index + 1} 张</span></div>
      </label>`;
    }).join("");

    dialog.innerHTML = `
      <header class="photo-library-header"><div><p>PHOTO LIBRARY</p><h2>地点相框照片库</h2><small>右键打开 · 图片顺序即为轮播顺序</small></div><button type="button" class="photo-library-close" data-library-action="close" aria-label="关闭照片库">×</button></header>
      <div class="photo-library-toolbar"><label class="photo-library-add">＋ 添加照片<input type="file" accept="image/*" multiple hidden></label><button type="button" data-library-action="select-all" ${customPhotos.length ? "" : "disabled"}>全选自定义照片</button><button type="button" data-library-action="clear-selection" ${selectedCount ? "" : "disabled"}>取消选择</button><button type="button" data-library-action="reset" ${customPhotos.length ? "" : "disabled"}>清空自定义</button></div>
      <p class="photo-library-status">${customPhotos.length ? `已选 ${selectedCount} 张自定义照片` : "当前仅有项目默认照片"}</p>
      <div class="photo-library-grid">${items}</div>
      <footer class="photo-library-footer"><div class="photo-library-order"><button type="button" data-library-action="move-up" ${selectedIndex > 0 ? "" : "disabled"}>↑ 上移</button><button type="button" data-library-action="move-down" ${selectedIndex >= 0 && selectedIndex < customPhotos.length - 1 ? "" : "disabled"}>↓ 下移</button><small>请选择一张自定义照片以调整顺序</small></div><button type="button" class="photo-library-delete" data-library-action="delete-selected" ${selectedCount ? "" : "disabled"}>删除选中（${selectedCount}）</button></footer>`;

    $$("[data-library-select]", dialog).forEach(input => input.addEventListener("change", () => {
      if (input.checked) libraryState.selectedIds.add(input.dataset.librarySelect);
      else libraryState.selectedIds.delete(input.dataset.librarySelect);
      renderPhotoLibrary();
    }));
    $("input[type=file]", dialog).addEventListener("change", handleLibraryAdd);
    $$('[data-library-action]', dialog).forEach(button => button.addEventListener("click", handleLibraryAction));
  }

  async function persistPhotoLibrary(figure) {
    const slot = figure.dataset.filmSlot;
    if (!slot) return;
    if (figure._filmPhotos?.length) await writeStoredImages(slot, figure._filmPhotos);
    else await removeStoredImages(slot);
    startCarousel(figure);
  }

  async function handleLibraryAdd(event) {
    const files = [...(event.target.files || [])];
    event.target.value = "";
    const figure = libraryState.figure;
    if (!figure || !files.length) return;
    try {
      for (const file of files) await validateImage(file);
      const additions = files.map(file => ({ id:makePhotoId(), blob:file, name:file.name, type:file.type, updatedAt:Date.now() }));
      figure._filmPhotos = [...(figure._filmPhotos || []), ...additions];
      libraryState.selectedIds = new Set(additions.map(photo => photo.id));
      await persistPhotoLibrary(figure);
      showPhotoAt(figure, figure._filmPhotos.length);
      renderPhotoLibrary();
    } catch (error) {
      console.error("[Travel Reverie] Photo library add failed", error);
      alert(error?.message || "添加照片失败，请重试。");
    }
  }

  async function handleLibraryAction(event) {
    const action = event.currentTarget.dataset.libraryAction;
    const figure = libraryState.figure;
    const dialog = libraryState.dialog;
    if (!figure) return;
    if (action === "close") { dialog.close(); return; }
    if (action === "select-all") { libraryState.selectedIds = new Set((figure._filmPhotos || []).map(photo => photo.id)); renderPhotoLibrary(); return; }
    if (action === "clear-selection") { libraryState.selectedIds.clear(); renderPhotoLibrary(); return; }
    if (action === "reset") {
      if (!confirm("清空此相框的全部自定义照片，并恢复为项目默认照片？")) return;
      figure._filmPhotos = [];
      libraryState.selectedIds.clear();
      try { await persistPhotoLibrary(figure); showPhotoAt(figure, 0); renderPhotoLibrary(); }
      catch (error) { console.error("[Travel Reverie] Photo library reset failed", error); alert("清空照片失败，请稍后重试。"); }
      return;
    }
    if (action === "delete-selected") {
      const selected = (figure._filmPhotos || []).filter(photo => libraryState.selectedIds.has(photo.id));
      if (!selected.length || !confirm(`确定删除选中的 ${selected.length} 张照片吗？此操作无法撤销。`)) return;
      const currentIndex = Number(figure.dataset.photoIndex || 0);
      figure._filmPhotos = (figure._filmPhotos || []).filter(photo => !libraryState.selectedIds.has(photo.id));
      libraryState.selectedIds.clear();
      try { await persistPhotoLibrary(figure); showPhotoAt(figure, Math.min(currentIndex, photoCollection(figure).length - 1)); renderPhotoLibrary(); }
      catch (error) { console.error("[Travel Reverie] Photo library deletion failed", error); alert("删除照片失败，请稍后重试。"); }
      return;
    }
    if (action === "move-up" || action === "move-down") {
      const id = [...libraryState.selectedIds][0];
      const index = customPhotoIndex(figure, id);
      const target = index + (action === "move-up" ? -1 : 1);
      if (index < 0 || target < 0 || target >= figure._filmPhotos.length) return;
      [figure._filmPhotos[index], figure._filmPhotos[target]] = [figure._filmPhotos[target], figure._filmPhotos[index]];
      try { await persistPhotoLibrary(figure); showPhotoAt(figure, target + 1); renderPhotoLibrary(); }
      catch (error) { console.error("[Travel Reverie] Photo order update failed", error); alert("调整照片顺序失败，请稍后重试。"); }
    }
  }

  function openPhotoLibrary(figure) {
    const dialog = ensurePhotoLibrary();
    libraryState.figure = figure;
    libraryState.selectedIds.clear();
    renderPhotoLibrary();
    if (!dialog.open) dialog.showModal();
  }

  async function handleBrokenCustomPhoto(figure) {
    const active = photoCollection(figure)[Number(figure.dataset.photoIndex || 0)];
    if (!active || active.kind !== "custom") return;
    figure._filmPhotos = (figure._filmPhotos || []).filter(photo => photo.id !== active.id);
    try { await persistPhotoLibrary(figure); } catch (_) {}
    showPhotoAt(figure, 0);
    if (libraryState.figure === figure && libraryState.dialog?.open) renderPhotoLibrary();
  }

  async function initializeFigure(figure) {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    if (!slot || !image) return;
    figure.dataset.defaultFilmSrc = image.getAttribute("src") || "";
    figure.dataset.defaultFilmAlt = image.alt || "";
    figure.title = "右键打开此地点的照片库";
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    ensurePhotoCounter(figure);
    image.addEventListener("error", () => { handleBrokenCustomPhoto(figure); });
    image.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key) || photoCollection(figure).length < 2) return;
      event.preventDefault(); nextPhoto(figure);
    });
    figure.addEventListener("click", event => {
      if (event.target.closest("a") || photoCollection(figure).length < 2) return;
      nextPhoto(figure);
    });
    figure.addEventListener("contextmenu", event => { event.preventDefault(); openPhotoLibrary(figure); });
    try {
      figure._filmPhotos = normalizeStoredImages(await readStoredImages(slot));
      showPhotoAt(figure, figure._filmPhotos.length ? 1 : 0);
      startCarousel(figure);
    } catch (error) {
      console.warn("[Travel Reverie] Unable to restore photo library", error);
      figure._filmPhotos = [];
      showPhotoAt(figure, 0);
    }
  }

  async function initialize() {
    await Promise.all($$(".film-reference-card[data-film-slot]").map(initializeFigure));
    console.info("[Travel Reverie] photo library manager 7.8 loaded");
  }

  window.addEventListener("beforeunload", () => {
    [...objectUrls.keys()].forEach(releaseObjectUrl);
    [...carouselTimers.keys()].forEach(stopCarousel);
    releaseLibraryThumbnails();
  });
  initialize();
})();
