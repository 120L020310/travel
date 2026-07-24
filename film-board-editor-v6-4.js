
(() => {
  "use strict";

  const DB_NAME = "travel-reverie-film-reference-v1";
  const STORE_NAME = "images";
  const MAX_FILE_SIZE = 12 * 1024 * 1024;
  const objectUrls = new Map();

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

  async function readStoredImage(slot) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(slot);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function writeStoredImage(slot, file) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put({
        slot,
        blob:file,
        name:file.name,
        type:file.type,
        updatedAt:Date.now()
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function removeStoredImage(slot) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(slot);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function releaseObjectUrl(slot) {
    const current = objectUrls.get(slot);
    if (!current) return;
    URL.revokeObjectURL(current);
    objectUrls.delete(slot);
  }

  function useDefaultImage(figure) {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    if (!slot || !image) return;

    releaseObjectUrl(slot);
    image.src = figure.dataset.defaultFilmSrc;
    image.alt = figure.dataset.defaultFilmAlt || image.alt;
    figure.classList.remove("is-custom-film-image");
  }

  function useCustomImage(figure, blob, name = "") {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    if (!slot || !image || !blob) return;

    releaseObjectUrl(slot);
    const url = URL.createObjectURL(blob);
    objectUrls.set(slot, url);
    image.src = url;
    image.alt = name
      ? `自定义电影记忆图片：${name}`
      : "自定义电影记忆图片";
    figure.classList.add("is-custom-film-image");
  }

  async function validateImage(file) {
    if (!file?.type?.startsWith("image/")) {
      throw new Error("请选择图片文件。");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("图片不能超过 12MB。");
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

  function createControls(figure) {
    if ($(".film-reference-edit-controls", figure)) return;

    const controls = document.createElement("div");
    controls.className = "film-reference-edit-controls";
    controls.innerHTML = `
      <button type="button" data-film-action="replace" title="更换这张图片">更换图片</button>
      <button type="button" data-film-action="reset" title="恢复项目自带图片">恢复默认</button>
      <input type="file" accept="image/*" hidden>`;

    const replaceButton = $('[data-film-action="replace"]', controls);
    const resetButton = $('[data-film-action="reset"]', controls);
    const fileInput = $('input[type="file"]', controls);

    replaceButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      fileInput.click();
    });

    resetButton.addEventListener("click", async event => {
      event.preventDefault();
      event.stopPropagation();

      const slot = figure.dataset.filmSlot;
      if (!slot) return;

      replaceButton.disabled = true;
      resetButton.disabled = true;
      try {
        await removeStoredImage(slot);
        useDefaultImage(figure);
      } catch (error) {
        console.error("[Travel Reverie] Film image reset failed", error);
        alert("恢复默认图片失败，请稍后重试。");
      } finally {
        replaceButton.disabled = false;
        resetButton.disabled = false;
      }
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file) return;

      const slot = figure.dataset.filmSlot;
      if (!slot) return;

      replaceButton.disabled = true;
      resetButton.disabled = true;
      try {
        await validateImage(file);
        await writeStoredImage(slot, file);
        useCustomImage(figure, file, file.name);
      } catch (error) {
        console.error("[Travel Reverie] Film image replacement failed", error);
        alert(error?.message || "更换图片失败，请重试。");
      } finally {
        replaceButton.disabled = false;
        resetButton.disabled = false;
      }
    });

    figure.appendChild(controls);
  }

  async function initializeFigure(figure) {
    const slot = figure.dataset.filmSlot;
    const image = $("img", figure);
    if (!slot || !image) return;

    figure.dataset.defaultFilmSrc = image.getAttribute("src") || "";
    figure.dataset.defaultFilmAlt = image.alt || "";
    createControls(figure);

    image.addEventListener("error", async () => {
      if (!figure.classList.contains("is-custom-film-image")) return;
      try {
        await removeStoredImage(slot);
      } catch (_) {}
      useDefaultImage(figure);
    });

    try {
      const stored = await readStoredImage(slot);
      if (stored?.blob) {
        useCustomImage(figure, stored.blob, stored.name);
      }
    } catch (error) {
      console.warn("[Travel Reverie] Unable to restore Film image", error);
    }
  }

  async function initialize() {
    const figures = $$(".film-reference-card[data-film-slot]");
    await Promise.all(figures.map(initializeFigure));
    console.info("[Travel Reverie] editable Film reference board 6.4 loaded");
  }

  window.addEventListener("beforeunload", () => {
    [...objectUrls.keys()].forEach(releaseObjectUrl);
  });

  initialize();
})();
