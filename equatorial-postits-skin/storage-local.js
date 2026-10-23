(function () {
  "use strict";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
  }

  function validateNote(input, config) {
    if (!input || typeof input !== "object") return null;
    if (!isFiniteNumber(input.yaw) || !isFiniteNumber(input.pitch)) return null;
    var title = String(input.title || "").trim().slice(0, config.maxTitleLength);
    if (!title) return null;
    var now = new Date().toISOString();
    return {
      id: String(input.id || "").trim() || createId(),
      panoramaId: String(input.panoramaId || "unknown"),
      playlistIndex: Number.isInteger(Number(input.playlistIndex))
        ? Number(input.playlistIndex)
        : -1,
      yaw: window.EquatorialPostitsGeometry.normalizeYaw(Number(input.yaw)),
      pitch: window.EquatorialPostitsGeometry.clamp(Number(input.pitch), -90, 90),
      title: title,
      description: String(input.description || "")
        .trim()
        .slice(0, config.maxDescriptionLength),
      color: String(input.color || config.colors[0].id),
      createdAt: String(input.createdAt || now),
      updatedAt: String(input.updatedAt || now),
    };
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "eqp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function LocalStorage(config) {
    this.config = config;
    this.key = config.storageKey + ":" + config.tourId;
    this.memory = [];
    this.available = true;
    try {
      var probe = this.key + ":probe";
      window.localStorage.setItem(probe, "1");
      window.localStorage.removeItem(probe);
    } catch (error) {
      this.available = false;
      console.warn("Equatorial Post-its: armazenamento local indisponível.", error);
    }
  }

  LocalStorage.prototype.load = function () {
    var value = this.memory;
    if (this.available) {
      try {
        value = JSON.parse(window.localStorage.getItem(this.key) || "[]");
      } catch (error) {
        console.warn("Equatorial Post-its: dados locais inválidos.", error);
        value = [];
      }
    }
    if (!Array.isArray(value)) value = [];
    return value
      .map(function (item) {
        return validateNote(item, this.config);
      }, this)
      .filter(Boolean);
  };

  LocalStorage.prototype.save = function (notes) {
    var safe = notes
      .map(function (item) {
        return validateNote(item, this.config);
      }, this)
      .filter(Boolean);
    this.memory = clone(safe);
    if (this.available) {
      try {
        window.localStorage.setItem(this.key, JSON.stringify(safe));
      } catch (error) {
        this.available = false;
        console.warn("Equatorial Post-its: não foi possível gravar no armazenamento local.", error);
      }
    }
    return clone(safe);
  };

  LocalStorage.prototype.merge = function (current, incoming) {
    var byId = new Map();
    current.concat(incoming).forEach(
      function (item) {
        var valid = validateNote(item, this.config);
        if (valid) byId.set(valid.id, valid);
      }.bind(this)
    );
    return this.save(Array.from(byId.values()));
  };

  window.EquatorialPostitsStorage = {
    LocalStorage: LocalStorage,
    validateNote: validateNote,
    createId: createId,
  };
})();
