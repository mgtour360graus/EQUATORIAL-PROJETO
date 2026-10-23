(function () {
  "use strict";

  function finite(value) {
    return Number.isFinite(Number(value));
  }

  function ThreeDVistaAdapter(config) {
    this.config = config;
    this.viewer = null;
    this.root = null;
    this.playlist = null;
    this.timer = 0;
    this.lastSignature = "";
  }

  ThreeDVistaAdapter.prototype.findViewer = function () {
    if (this.viewer && document.contains(this.viewer)) return this.viewer;
    var selectors = this.config.viewerSelectors || [];
    for (var index = 0; index < selectors.length; index += 1) {
      var found = document.querySelector(selectors[index]);
      if (found) {
        this.viewer = found;
        return found;
      }
    }
    this.viewer = document.querySelector("canvas") || null;
    return this.viewer;
  };

  ThreeDVistaAdapter.prototype.nativeById = function (id) {
    try {
      return window.tour && window.tour.player && window.tour.player.getById(id);
    } catch (error) {
      return null;
    }
  };

  ThreeDVistaAdapter.prototype.getRoot = function () {
    this.root = this.root || this.nativeById(this.config.rootPlayerId);
    return this.root;
  };

  ThreeDVistaAdapter.prototype.getPlaylist = function () {
    this.playlist = this.playlist || this.nativeById(this.config.playlistId);
    return this.playlist;
  };

  ThreeDVistaAdapter.prototype.getActivePlayer = function () {
    var playlist = this.getPlaylist();
    try {
      var items = playlist && playlist.get("items");
      var selectedIndex = playlist && Number(playlist.get("selectedIndex"));
      return items && items[selectedIndex] && items[selectedIndex].get("player");
    } catch (error) {
      return null;
    }
  };

  ThreeDVistaAdapter.prototype.getCamera = function () {
    var viewer = this.findViewer();
    var playlist = this.getPlaylist();
    var player = this.getActivePlayer();
    if (!viewer || !playlist || !player) return null;
    try {
      var panorama = player.get("panorama") || player.get("media");
      var camera = {
        yaw: Number(player.get("yaw")),
        pitch: Number(player.get("pitch")),
        roll: Number(player.get("roll")) || 0,
        hfov: Number(player.get("hfov")),
        panoramaId:
          (panorama && typeof panorama.get === "function" && panorama.get("id")) ||
          String(panorama && panorama.id ? panorama.id : "unknown"),
        playlistIndex: Number(playlist.get("selectedIndex")),
        rect: viewer.getBoundingClientRect(),
        player: player,
      };
      if (![camera.yaw, camera.pitch, camera.roll, camera.hfov].every(finite)) return null;
      return camera;
    } catch (error) {
      if (this.config.debug) console.warn("Equatorial Post-its: câmera ainda indisponível.", error);
      return null;
    }
  };

  ThreeDVistaAdapter.prototype.screenToSpherical = function (clientX, clientY) {
    var camera = this.getCamera();
    if (!camera) return null;
    var rect = camera.rect;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    var result = window.EquatorialPostitsGeometry.screenToSpherical(
      { x: clientX - rect.left, y: clientY - rect.top },
      camera,
      rect
    );
    result.panoramaId = camera.panoramaId;
    result.playlistIndex = camera.playlistIndex;
    return result;
  };

  ThreeDVistaAdapter.prototype.sphericalToScreen = function (position) {
    var camera = this.getCamera();
    if (!camera || String(position.panoramaId) !== String(camera.panoramaId)) {
      return { visible: false, x: 0, y: 0 };
    }
    var projected = window.EquatorialPostitsGeometry.sphericalToScreen(
      position,
      camera,
      camera.rect
    );
    projected.x += camera.rect.left;
    projected.y += camera.rect.top;
    return projected;
  };

  ThreeDVistaAdapter.prototype.focus = function (note) {
    var camera = this.getCamera();
    if (!camera || String(note.panoramaId) !== String(camera.panoramaId)) return false;
    try {
      camera.player.moveTo(Number(note.yaw), Number(note.pitch), camera.roll, Math.min(camera.hfov, 72));
      return true;
    } catch (error) {
      return false;
    }
  };

  ThreeDVistaAdapter.prototype.openNote = function (note) {
    var self = this;
    var camera = this.getCamera();
    if (camera && String(note.panoramaId) === String(camera.panoramaId)) {
      return this.focus(note);
    }
    var root = this.getRoot();
    var playlist = this.getPlaylist();
    var index = Number(note.playlistIndex);
    if (!root || !playlist || !Number.isInteger(index) || index < 0) return false;
    try {
      root.setPlayListSelectedIndex(playlist, index);
      var attempts = 0;
      var timer = window.setInterval(function () {
        attempts += 1;
        if (self.focus(note) || attempts > 24) window.clearInterval(timer);
      }, 80);
      return true;
    } catch (error) {
      return false;
    }
  };

  ThreeDVistaAdapter.prototype.subscribe = function (callback) {
    var self = this;
    window.clearInterval(this.timer);
    this.timer = window.setInterval(function () {
      var camera = self.getCamera();
      var viewer = self.findViewer();
      if (!viewer) return;
      var rect = viewer.getBoundingClientRect();
      var signature = camera
        ? [
            camera.panoramaId,
            camera.yaw.toFixed(4),
            camera.pitch.toFixed(4),
            camera.roll.toFixed(4),
            camera.hfov.toFixed(4),
            rect.left.toFixed(1),
            rect.top.toFixed(1),
            rect.width.toFixed(1),
            rect.height.toFixed(1),
          ].join("|")
        : "waiting|" + rect.width + "|" + rect.height;
      if (signature !== self.lastSignature) {
        self.lastSignature = signature;
        callback(camera);
      }
    }, Math.max(16, Number(this.config.pollIntervalMs) || 32));
    return function () {
      window.clearInterval(self.timer);
    };
  };

  ThreeDVistaAdapter.prototype.isReady = function () {
    return Boolean(this.getCamera());
  };

  window.EquatorialPostitsAdapters = window.EquatorialPostitsAdapters || {};
  window.EquatorialPostitsAdapters.ThreeDVistaAdapter = ThreeDVistaAdapter;
})();
