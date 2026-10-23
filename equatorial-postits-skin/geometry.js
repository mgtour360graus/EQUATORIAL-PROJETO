(function () {
  "use strict";

  var DEG = Math.PI / 180;
  var RAD = 180 / Math.PI;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeYaw(value) {
    var yaw = Number(value) || 0;
    while (yaw <= -180) yaw += 360;
    while (yaw > 180) yaw -= 360;
    return yaw;
  }

  function normalize(vector) {
    var length = Math.hypot(vector.x, vector.y, vector.z) || 1;
    return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
  }

  function cameraBasis(camera) {
    var yaw = Number(camera.yaw) * DEG;
    var pitch = Number(camera.pitch) * DEG;
    var roll = (Number(camera.roll) || 0) * DEG;
    var sinYaw = Math.sin(yaw);
    var cosYaw = Math.cos(yaw);
    var sinPitch = Math.sin(pitch);
    var cosPitch = Math.cos(pitch);

    var forward = {
      x: sinYaw * cosPitch,
      y: sinPitch,
      z: cosYaw * cosPitch,
    };
    var right = { x: cosYaw, y: 0, z: -sinYaw };
    var up = {
      x: -sinYaw * sinPitch,
      y: cosPitch,
      z: -cosYaw * sinPitch,
    };

    if (Math.abs(roll) > 1e-7) {
      var cosRoll = Math.cos(roll);
      var sinRoll = Math.sin(roll);
      var rolledRight = {
        x: right.x * cosRoll + up.x * sinRoll,
        y: right.y * cosRoll + up.y * sinRoll,
        z: right.z * cosRoll + up.z * sinRoll,
      };
      var rolledUp = {
        x: up.x * cosRoll - right.x * sinRoll,
        y: up.y * cosRoll - right.y * sinRoll,
        z: up.z * cosRoll - right.z * sinRoll,
      };
      right = rolledRight;
      up = rolledUp;
    }

    return { forward: forward, right: right, up: up };
  }

  function projection(camera, rect) {
    var width = Math.max(1, Number(rect.width));
    var height = Math.max(1, Number(rect.height));
    var hfov = clamp(Number(camera.hfov) || 90, 5, 175) * DEG;
    var tanHalfHorizontal = Math.tan(hfov / 2);
    var tanHalfVertical = tanHalfHorizontal / (width / height);
    return {
      width: width,
      height: height,
      tanHalfHorizontal: tanHalfHorizontal,
      tanHalfVertical: tanHalfVertical,
      basis: cameraBasis(camera),
    };
  }

  function screenToSpherical(point, camera, rect) {
    var p = projection(camera, rect);
    var ndcX = (Number(point.x) / p.width) * 2 - 1;
    var ndcY = 1 - (Number(point.y) / p.height) * 2;
    var local = normalize({
      x: ndcX * p.tanHalfHorizontal,
      y: ndcY * p.tanHalfVertical,
      z: 1,
    });
    var world = normalize({
      x:
        p.basis.right.x * local.x +
        p.basis.up.x * local.y +
        p.basis.forward.x * local.z,
      y:
        p.basis.right.y * local.x +
        p.basis.up.y * local.y +
        p.basis.forward.y * local.z,
      z:
        p.basis.right.z * local.x +
        p.basis.up.z * local.y +
        p.basis.forward.z * local.z,
    });
    return {
      yaw: normalizeYaw(Math.atan2(world.x, world.z) * RAD),
      pitch: clamp(Math.asin(clamp(world.y, -1, 1)) * RAD, -90, 90),
    };
  }

  function sphericalToScreen(position, camera, rect) {
    var p = projection(camera, rect);
    var yaw = Number(position.yaw) * DEG;
    var pitch = Number(position.pitch) * DEG;
    var world = {
      x: Math.sin(yaw) * Math.cos(pitch),
      y: Math.sin(pitch),
      z: Math.cos(yaw) * Math.cos(pitch),
    };
    var localX =
      world.x * p.basis.right.x +
      world.y * p.basis.right.y +
      world.z * p.basis.right.z;
    var localY =
      world.x * p.basis.up.x +
      world.y * p.basis.up.y +
      world.z * p.basis.up.z;
    var localZ =
      world.x * p.basis.forward.x +
      world.y * p.basis.forward.y +
      world.z * p.basis.forward.z;

    if (localZ <= 0.0001) {
      return { visible: false, x: 0, y: 0, depth: localZ };
    }

    var ndcX = localX / (localZ * p.tanHalfHorizontal);
    var ndcY = localY / (localZ * p.tanHalfVertical);
    return {
      visible: Math.abs(ndcX) <= 1.08 && Math.abs(ndcY) <= 1.08,
      x: ((ndcX + 1) / 2) * p.width,
      y: ((1 - ndcY) / 2) * p.height,
      depth: localZ,
    };
  }

  window.EquatorialPostitsGeometry = {
    clamp: clamp,
    normalizeYaw: normalizeYaw,
    screenToSpherical: screenToSpherical,
    sphericalToScreen: sphericalToScreen,
  };
})();
