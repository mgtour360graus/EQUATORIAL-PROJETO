(function () {
  "use strict";

  var config = window.EquatorialPostitsConfig;
  var Geometry = window.EquatorialPostitsGeometry;
  var Storage = window.EquatorialPostitsStorage;
  if (!config || !Geometry || !Storage) {
    console.error("Equatorial Post-its: arquivos-base não foram carregados na ordem correta.");
    return;
  }

  var state = {
    adapter: null,
    storage: null,
    notes: [],
    camera: null,
    editMode: false,
    placementMode: false,
    markerElements: new Map(),
    markerDrag: null,
    addDrag: null,
    suppressAddClick: false,
    editingId: null,
    draftPosition: null,
    detailsId: null,
    toastTimer: 0,
  };

  var el = {};

  function escapeAttribute(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function colorById(id) {
    return (
      config.colors.find(function (color) {
        return color.id === id;
      }) || config.colors[0]
    );
  }

  function buildInterface() {
    var logo = config.assetBaseUrl.replace(/\/$/, "") + "/logo-equatorial.png";
    var colorOptions = config.colors
      .map(function (color, index) {
        return (
          '<label class="eqp-color-option" title="' +
          escapeAttribute(color.label) +
          '" style="--eqp-choice:' +
          escapeAttribute(color.value) +
          '"><input type="radio" name="eqp-color" value="' +
          escapeAttribute(color.id) +
          '"' +
          (index === 0 ? " checked" : "") +
          '><span aria-hidden="true"></span><span class="eqp-sr-only">' +
          escapeAttribute(color.label) +
          "</span></label>"
        );
      })
      .join("");

    var html =
      '<div id="eqp-root" data-version="' +
      escapeAttribute(config.version) +
      '">' +
      '<div id="eqp-markers" class="eqp-marker-layer" aria-live="polite"></div>' +
      '<div id="eqp-placement" class="eqp-placement" data-active="false">' +
      '<div class="eqp-placement-prompt"><span>' +
      escapeAttribute(config.ui.placementHelp) +
      '</span><button id="eqp-placement-cancel" class="eqp-placement-cancel" type="button" aria-label="Cancelar">×</button></div>' +
      "</div>" +
      '<div id="eqp-drag-ghost" class="eqp-drag-ghost"><span class="eqp-marker-dot"></span><span>' +
      escapeAttribute(config.ui.dragHelp) +
      "</span></div>" +
      '<div class="eqp-toolbar" aria-label="Ferramentas de identificação">' +
      '<button id="eqp-add" class="eqp-tool-button eqp-tool-button--primary" type="button"><span class="eqp-tool-icon" aria-hidden="true">＋</span><span class="eqp-tool-text">' +
      escapeAttribute(config.ui.addLabel) +
      "</span></button>" +
      '<button id="eqp-manage" class="eqp-tool-button" type="button" aria-label="Ver identificações"><span class="eqp-tool-icon" aria-hidden="true">☷</span><span class="eqp-tool-text">Identificações</span></button>' +
      "</div>" +
      '<div id="eqp-panel-backdrop" class="eqp-panel-backdrop"></div>' +
      '<aside id="eqp-panel" class="eqp-panel" aria-hidden="true" aria-label="Identificações salvas">' +
      '<div class="eqp-panel-header"><div class="eqp-brand"><img src="' +
      escapeAttribute(logo) +
      '" alt="Grupo Equatorial"><h2>' +
      escapeAttribute(config.ui.title) +
      '</h2><p id="eqp-count">Nenhuma identificação</p></div><button id="eqp-panel-close" class="eqp-icon-button" type="button" aria-label="Fechar painel">×</button></div>' +
      '<div class="eqp-panel-tools"><input id="eqp-search" class="eqp-search" type="search" placeholder="Buscar espaço" aria-label="Buscar identificação"><button id="eqp-edit-mode" class="eqp-mode-button" type="button" aria-pressed="false" title="Arrastar marcações">Mover</button></div>' +
      '<div id="eqp-list" class="eqp-list"></div>' +
      '<div class="eqp-panel-footer"><p>As identificações desta versão ficam salvas neste navegador. Use Exportar para criar uma cópia em JSON.</p><div class="eqp-panel-actions"><button id="eqp-import" class="eqp-action" type="button">Importar</button><button id="eqp-export" class="eqp-action" type="button">Exportar</button></div></div>' +
      "</aside>" +
      '<dialog id="eqp-editor" class="eqp-dialog"><div class="eqp-dialog-header"><h3 id="eqp-editor-title">Nova identificação</h3><button id="eqp-editor-close" class="eqp-icon-button" type="button" aria-label="Fechar">×</button></div><form id="eqp-form" class="eqp-form" method="dialog">' +
      '<label class="eqp-field"><span>Nome do espaço</span><input id="eqp-title" type="text" required maxlength="' +
      escapeAttribute(config.maxTitleLength) +
      '" autocomplete="off" placeholder="Ex.: Subestação principal"></label>' +
      '<label class="eqp-field"><span>Observação opcional</span><textarea id="eqp-description" maxlength="' +
      escapeAttribute(config.maxDescriptionLength) +
      '" placeholder="Acrescente uma referência ou orientação"></textarea></label>' +
      '<div class="eqp-color-field"><span class="eqp-color-label">Cor da identificação</span><div class="eqp-color-options">' +
      colorOptions +
      "</div></div>" +
      '<div class="eqp-dialog-actions"><button id="eqp-delete" class="eqp-action eqp-action--danger" type="button">Excluir</button><button id="eqp-cancel" class="eqp-action" type="button">Cancelar</button><button class="eqp-action eqp-action--primary" type="submit">Salvar identificação</button></div>' +
      "</form></dialog>" +
      '<dialog id="eqp-details-dialog" class="eqp-dialog"><div class="eqp-details"><div id="eqp-details-color" class="eqp-details-color"></div><h3 id="eqp-details-title"></h3><p id="eqp-details-description"></p><small id="eqp-details-meta" class="eqp-details-meta"></small><div class="eqp-dialog-actions"><button id="eqp-details-close" class="eqp-action" type="button">Fechar</button><button id="eqp-details-locate" class="eqp-action" type="button">Centralizar</button><button id="eqp-details-edit" class="eqp-action eqp-action--primary" type="button">Editar</button></div></div></dialog>' +
      '<input id="eqp-import-file" type="file" accept="application/json,.json" hidden>' +
      '<div id="eqp-toast" class="eqp-toast" role="status" aria-live="polite"></div>' +
      "</div>";

    document.body.insertAdjacentHTML("beforeend", html);
    el.root = document.getElementById("eqp-root");
    el.markers = document.getElementById("eqp-markers");
    el.placement = document.getElementById("eqp-placement");
    el.placementCancel = document.getElementById("eqp-placement-cancel");
    el.dragGhost = document.getElementById("eqp-drag-ghost");
    el.add = document.getElementById("eqp-add");
    el.manage = document.getElementById("eqp-manage");
    el.panel = document.getElementById("eqp-panel");
    el.panelBackdrop = document.getElementById("eqp-panel-backdrop");
    el.panelClose = document.getElementById("eqp-panel-close");
    el.count = document.getElementById("eqp-count");
    el.search = document.getElementById("eqp-search");
    el.editMode = document.getElementById("eqp-edit-mode");
    el.list = document.getElementById("eqp-list");
    el.importButton = document.getElementById("eqp-import");
    el.exportButton = document.getElementById("eqp-export");
    el.importFile = document.getElementById("eqp-import-file");
    el.editor = document.getElementById("eqp-editor");
    el.editorTitle = document.getElementById("eqp-editor-title");
    el.editorClose = document.getElementById("eqp-editor-close");
    el.form = document.getElementById("eqp-form");
    el.title = document.getElementById("eqp-title");
    el.description = document.getElementById("eqp-description");
    el.deleteButton = document.getElementById("eqp-delete");
    el.cancel = document.getElementById("eqp-cancel");
    el.details = document.getElementById("eqp-details-dialog");
    el.detailsColor = document.getElementById("eqp-details-color");
    el.detailsTitle = document.getElementById("eqp-details-title");
    el.detailsDescription = document.getElementById("eqp-details-description");
    el.detailsMeta = document.getElementById("eqp-details-meta");
    el.detailsClose = document.getElementById("eqp-details-close");
    el.detailsLocate = document.getElementById("eqp-details-locate");
    el.detailsEdit = document.getElementById("eqp-details-edit");
    el.toast = document.getElementById("eqp-toast");

    if (!config.permissions.create) el.add.hidden = true;
    if (!config.permissions.edit) el.editMode.hidden = true;
    if (!config.permissions.import) el.importButton.hidden = true;
    if (!config.permissions.export) el.exportButton.hidden = true;
  }

  function showDialog(dialog) {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function toast(message) {
    window.clearTimeout(state.toastTimer);
    el.toast.textContent = message;
    el.toast.dataset.visible = "true";
    state.toastTimer = window.setTimeout(function () {
      el.toast.dataset.visible = "false";
    }, 3200);
  }

  function setPanel(open) {
    el.panel.dataset.open = String(open);
    el.panel.setAttribute("aria-hidden", String(!open));
    el.panelBackdrop.dataset.open = String(open);
    if (open) {
      renderList();
      window.setTimeout(function () {
        el.search.focus({ preventScroll: true });
      }, 80);
    }
  }

  function currentPanoramaId() {
    return state.camera ? String(state.camera.panoramaId) : "unknown";
  }

  function saveNotes(message) {
    state.notes = state.storage.save(state.notes);
    syncMarkers();
    renderList();
    if (message) toast(message);
  }

  function updatePlacementBounds() {
    var viewer = state.adapter && state.adapter.findViewer && state.adapter.findViewer();
    if (!viewer) return;
    var rect = viewer.getBoundingClientRect();
    el.placement.style.left = rect.left + "px";
    el.placement.style.top = rect.top + "px";
    el.placement.style.width = rect.width + "px";
    el.placement.style.height = rect.height + "px";
  }

  function setPlacementMode(active) {
    state.placementMode = Boolean(active);
    el.placement.dataset.active = String(state.placementMode);
    el.add.setAttribute("aria-pressed", String(state.placementMode));
    if (state.placementMode) {
      updatePlacementBounds();
      toast(config.ui.placementHelp);
    }
  }

  function createAt(clientX, clientY) {
    if (!state.adapter.isReady()) {
      toast("A panorâmica ainda está carregando. Tente novamente em alguns segundos.");
      return false;
    }
    var position = state.adapter.screenToSpherical(clientX, clientY);
    if (!position) {
      toast("Solte o marcador dentro da panorâmica.");
      return false;
    }
    setPlacementMode(false);
    openEditor(null, position);
    return true;
  }

  function openEditor(note, position) {
    state.editingId = note ? note.id : null;
    state.draftPosition = position || null;
    el.editorTitle.textContent = note ? "Editar identificação" : "Nova identificação";
    el.title.value = note ? note.title : "";
    el.description.value = note ? note.description : "";
    var selectedColor = note ? note.color : config.colors[0].id;
    el.form.querySelectorAll('input[name="eqp-color"]').forEach(function (input) {
      input.checked = input.value === selectedColor;
    });
    el.deleteButton.hidden = !note || !config.permissions.delete;
    showDialog(el.editor);
    window.setTimeout(function () {
      el.title.focus({ preventScroll: true });
    }, 60);
  }

  function closeEditor() {
    state.editingId = null;
    state.draftPosition = null;
    closeDialog(el.editor);
  }

  function submitEditor(event) {
    event.preventDefault();
    var title = el.title.value.trim().slice(0, config.maxTitleLength);
    if (!title) {
      el.title.focus();
      return;
    }
    var colorInput = el.form.querySelector('input[name="eqp-color"]:checked');
    var now = new Date().toISOString();
    if (state.editingId) {
      var existing = state.notes.find(function (note) {
        return note.id === state.editingId;
      });
      if (!existing) return closeEditor();
      existing.title = title;
      existing.description = el.description.value.trim().slice(0, config.maxDescriptionLength);
      existing.color = colorInput ? colorInput.value : config.colors[0].id;
      existing.updatedAt = now;
      saveNotes("Identificação atualizada.");
    } else if (state.draftPosition) {
      state.notes.push({
        id: Storage.createId(),
        panoramaId: state.draftPosition.panoramaId,
        playlistIndex: state.draftPosition.playlistIndex,
        yaw: state.draftPosition.yaw,
        pitch: state.draftPosition.pitch,
        title: title,
        description: el.description.value.trim().slice(0, config.maxDescriptionLength),
        color: colorInput ? colorInput.value : config.colors[0].id,
        createdAt: now,
        updatedAt: now,
      });
      saveNotes("Identificação adicionada.");
    }
    closeEditor();
  }

  function deleteEditingNote() {
    if (!state.editingId || !config.permissions.delete) return;
    var note = state.notes.find(function (item) {
      return item.id === state.editingId;
    });
    if (!note) return;
    if (!window.confirm('Excluir a identificação "' + note.title + '"?')) return;
    state.notes = state.notes.filter(function (item) {
      return item.id !== state.editingId;
    });
    closeEditor();
    saveNotes("Identificação excluída.");
  }

  function openDetails(note) {
    state.detailsId = note.id;
    var color = colorById(note.color);
    el.detailsColor.style.background = color.value;
    el.detailsTitle.textContent = note.title;
    el.detailsDescription.textContent = note.description || "Sem observações adicionais.";
    el.detailsMeta.textContent =
      "Posição panorâmica: " + note.yaw.toFixed(2) + "° / " + note.pitch.toFixed(2) + "°";
    el.detailsEdit.hidden = !config.permissions.edit;
    showDialog(el.details);
  }

  function closeDetails() {
    state.detailsId = null;
    closeDialog(el.details);
  }

  function noteFromDetails() {
    return state.notes.find(function (note) {
      return note.id === state.detailsId;
    });
  }

  function createMarker(note) {
    var marker = document.createElement("button");
    marker.type = "button";
    marker.className = "eqp-marker";
    marker.dataset.id = note.id;
    marker.innerHTML = '<span class="eqp-marker-dot" aria-hidden="true"></span><span class="eqp-marker-label"></span>';
    marker.addEventListener("click", function (event) {
      if (marker.dataset.dragged === "true") {
        marker.dataset.dragged = "false";
        return;
      }
      if (state.editMode) return;
      event.stopPropagation();
      var selected = state.notes.find(function (item) {
        return item.id === marker.dataset.id;
      });
      if (selected) openDetails(selected);
    });
    marker.addEventListener("pointerdown", beginMarkerDrag);
    marker.addEventListener("pointermove", moveMarkerDrag);
    marker.addEventListener("pointerup", endMarkerDrag);
    marker.addEventListener("pointercancel", cancelMarkerDrag);
    el.markers.appendChild(marker);
    state.markerElements.set(note.id, marker);
    return marker;
  }

  function syncMarkers() {
    var activeIds = new Set(
      state.notes.map(function (note) {
        return note.id;
      })
    );
    state.markerElements.forEach(function (marker, id) {
      if (!activeIds.has(id)) {
        marker.remove();
        state.markerElements.delete(id);
      }
    });
    state.notes.forEach(function (note) {
      var marker = state.markerElements.get(note.id) || createMarker(note);
      var color = colorById(note.color);
      marker.style.setProperty("--eqp-marker-color", color.value);
      marker.querySelector(".eqp-marker-label").textContent = note.title;
      marker.setAttribute("aria-label", note.title + ". Clique para abrir.");
      marker.dataset.editing = String(state.editMode);
    });
    renderMarkers();
  }

  function renderMarkers() {
    if (!state.camera) {
      state.markerElements.forEach(function (marker) {
        marker.hidden = true;
      });
      return;
    }
    var rect = state.camera.rect;
    state.notes.forEach(function (note) {
      var marker = state.markerElements.get(note.id);
      if (!marker || (state.markerDrag && state.markerDrag.id === note.id)) return;
      if (String(note.panoramaId) !== String(state.camera.panoramaId)) {
        marker.hidden = true;
        return;
      }
      var point = Geometry.sphericalToScreen(note, state.camera, rect);
      marker.hidden = !point.visible;
      if (!point.visible) return;
      var markerWidth = marker.offsetWidth;
      var roomRight = rect.width - point.x;
      var roomLeft = point.x;
      marker.dataset.flip = String(roomRight < markerWidth + 16 && roomLeft >= markerWidth + 16);
      marker.dataset.center = String(roomRight < markerWidth + 16 && roomLeft < markerWidth + 16);
      marker.dataset.drop = String(point.y < marker.offsetHeight + 16);
      marker.style.left = rect.left + point.x + "px";
      marker.style.top = rect.top + point.y + "px";
    });
  }

  function beginMarkerDrag(event) {
    if (!state.editMode || !config.permissions.edit || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    var marker = event.currentTarget;
    marker.setPointerCapture(event.pointerId);
    state.markerDrag = {
      id: marker.dataset.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    marker.dataset.dragging = "true";
  }

  function moveMarkerDrag(event) {
    var drag = state.markerDrag;
    if (!drag || drag.pointerId !== event.pointerId || drag.id !== event.currentTarget.dataset.id) return;
    event.preventDefault();
    var distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (distance > 4) drag.moved = true;
    if (!drag.moved) return;
    event.currentTarget.style.left = event.clientX + "px";
    event.currentTarget.style.top = event.clientY + "px";
  }

  function endMarkerDrag(event) {
    var drag = state.markerDrag;
    var marker = event.currentTarget;
    if (!drag || drag.pointerId !== event.pointerId || drag.id !== marker.dataset.id) return;
    event.preventDefault();
    marker.dataset.dragging = "false";
    state.markerDrag = null;
    if (!drag.moved) {
      var clicked = state.notes.find(function (note) {
        return note.id === drag.id;
      });
      if (clicked) openEditor(clicked);
      return;
    }
    marker.dataset.dragged = "true";
    var position = state.adapter.screenToSpherical(event.clientX, event.clientY);
    var note = state.notes.find(function (item) {
      return item.id === drag.id;
    });
    if (!position || !note) {
      renderMarkers();
      toast("Mantenha a identificação dentro da panorâmica.");
      return;
    }
    note.panoramaId = position.panoramaId;
    note.playlistIndex = position.playlistIndex;
    note.yaw = position.yaw;
    note.pitch = position.pitch;
    note.updatedAt = new Date().toISOString();
    saveNotes("Posição atualizada.");
  }

  function cancelMarkerDrag(event) {
    if (!state.markerDrag || state.markerDrag.id !== event.currentTarget.dataset.id) return;
    event.currentTarget.dataset.dragging = "false";
    state.markerDrag = null;
    renderMarkers();
  }

  function renderList() {
    if (!el.list) return;
    var query = el.search.value.trim().toLocaleLowerCase("pt-BR");
    var current = currentPanoramaId();
    var filtered = state.notes
      .filter(function (note) {
        return !query || (note.title + " " + note.description).toLocaleLowerCase("pt-BR").includes(query);
      })
      .sort(function (a, b) {
        var aCurrent = String(a.panoramaId) === current ? 0 : 1;
        var bCurrent = String(b.panoramaId) === current ? 0 : 1;
        return aCurrent - bCurrent || a.title.localeCompare(b.title, "pt-BR");
      });

    el.count.textContent =
      state.notes.length === 0
        ? "Nenhuma identificação"
        : state.notes.length + (state.notes.length === 1 ? " identificação" : " identificações");
    el.list.replaceChildren();
    if (!filtered.length) {
      var empty = document.createElement("div");
      empty.className = "eqp-empty";
      empty.textContent = query
        ? "Nenhuma identificação encontrada."
        : "Adicione a primeira identificação diretamente sobre a panorâmica.";
      el.list.appendChild(empty);
      return;
    }

    filtered.forEach(function (note) {
      var color = colorById(note.color);
      var item = document.createElement("button");
      item.type = "button";
      item.className = "eqp-list-item";
      item.dataset.current = String(String(note.panoramaId) === current);
      item.style.setProperty("--eqp-item-color", color.value);
      var bar = document.createElement("span");
      bar.className = "eqp-list-color";
      var copy = document.createElement("span");
      copy.className = "eqp-list-copy";
      var title = document.createElement("strong");
      title.textContent = note.title;
      var subtitle = document.createElement("small");
      subtitle.textContent =
        String(note.panoramaId) === current
          ? note.description || "Panorâmica atual"
          : "Outra panorâmica · posição " + (note.playlistIndex + 1);
      copy.append(title, subtitle);
      var arrow = document.createElement("span");
      arrow.className = "eqp-list-arrow";
      arrow.textContent = "›";
      item.append(bar, copy, arrow);
      item.addEventListener("click", function () {
        if (!state.adapter.openNote(note)) {
          toast("Não foi possível abrir esta panorâmica ainda.");
          return;
        }
        setPanel(false);
      });
      el.list.appendChild(item);
    });
  }

  function setEditMode(active) {
    state.editMode = Boolean(active);
    el.editMode.setAttribute("aria-pressed", String(state.editMode));
    el.editMode.textContent = state.editMode ? "Concluir" : "Mover";
    state.markerElements.forEach(function (marker) {
      marker.dataset.editing = String(state.editMode);
    });
    toast(
      state.editMode
        ? "Modo de edição ativo: arraste uma etiqueta para reposicioná-la."
        : "Posições protegidas contra movimentos acidentais."
    );
  }

  function exportNotes() {
    var payload = {
      format: "equatorial-postits",
      version: 1,
      tourId: config.tourId,
      exportedAt: new Date().toISOString(),
      notes: state.notes,
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "identificacoes-equatorial-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
    toast("Arquivo de identificações exportado.");
  }

  function importNotes(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(String(reader.result || ""));
        var incoming = Array.isArray(parsed) ? parsed : parsed.notes;
        if (!Array.isArray(incoming)) throw new Error("Formato inválido");
        var before = state.notes.length;
        state.notes = state.storage.merge(state.notes, incoming);
        syncMarkers();
        renderList();
        toast(state.notes.length - before + " nova(s) identificação(ões) importada(s).");
      } catch (error) {
        console.error("Equatorial Post-its: falha na importação.", error);
        toast("O arquivo selecionado não contém identificações válidas.");
      } finally {
        el.importFile.value = "";
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function beginAddDrag(event) {
    if (event.button !== 0 || !config.permissions.create) return;
    state.addDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    el.add.setPointerCapture(event.pointerId);
  }

  function moveAddDrag(event) {
    var drag = state.addDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    var distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (distance > 7) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    el.dragGhost.dataset.visible = "true";
    el.dragGhost.style.left = event.clientX + "px";
    el.dragGhost.style.top = event.clientY + "px";
  }

  function endAddDrag(event) {
    var drag = state.addDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.addDrag = null;
    el.dragGhost.dataset.visible = "false";
    if (!drag.moved) return;
    event.preventDefault();
    state.suppressAddClick = true;
    createAt(event.clientX, event.clientY);
    window.setTimeout(function () {
      state.suppressAddClick = false;
    }, 250);
  }

  function cancelAddDrag() {
    state.addDrag = null;
    el.dragGhost.dataset.visible = "false";
  }

  function bindEvents() {
    el.add.addEventListener("pointerdown", beginAddDrag);
    el.add.addEventListener("pointermove", moveAddDrag);
    el.add.addEventListener("pointerup", endAddDrag);
    el.add.addEventListener("pointercancel", cancelAddDrag);
    el.add.addEventListener("click", function () {
      if (state.suppressAddClick) return;
      setPlacementMode(!state.placementMode);
    });
    el.placement.addEventListener("click", function (event) {
      if (event.target === el.placementCancel) return;
      createAt(event.clientX, event.clientY);
    });
    el.placementCancel.addEventListener("click", function (event) {
      event.stopPropagation();
      setPlacementMode(false);
    });
    el.manage.addEventListener("click", function () {
      setPanel(true);
    });
    el.panelClose.addEventListener("click", function () {
      setPanel(false);
    });
    el.panelBackdrop.addEventListener("click", function () {
      setPanel(false);
    });
    el.search.addEventListener("input", renderList);
    el.editMode.addEventListener("click", function () {
      setEditMode(!state.editMode);
      setPanel(false);
    });
    el.form.addEventListener("submit", submitEditor);
    el.editorClose.addEventListener("click", closeEditor);
    el.cancel.addEventListener("click", closeEditor);
    el.deleteButton.addEventListener("click", deleteEditingNote);
    el.detailsClose.addEventListener("click", closeDetails);
    el.detailsEdit.addEventListener("click", function () {
      var note = noteFromDetails();
      closeDetails();
      if (note) openEditor(note);
    });
    el.detailsLocate.addEventListener("click", function () {
      var note = noteFromDetails();
      if (note && state.adapter.openNote(note)) closeDetails();
      else toast("Não foi possível centralizar esta identificação.");
    });
    el.exportButton.addEventListener("click", exportNotes);
    el.importButton.addEventListener("click", function () {
      el.importFile.click();
    });
    el.importFile.addEventListener("change", function () {
      importNotes(el.importFile.files && el.importFile.files[0]);
    });
    window.addEventListener("resize", function () {
      updatePlacementBounds();
      renderMarkers();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.placementMode) setPlacementMode(false);
    });
    document.addEventListener("fullscreenchange", syncFullscreenHost);
  }

  function syncFullscreenHost() {
    var fullscreen = document.fullscreenElement;
    if (fullscreen && !fullscreen.contains(el.root)) {
      fullscreen.appendChild(el.root);
    } else if (!fullscreen && el.root.parentElement !== document.body) {
      document.body.appendChild(el.root);
    }
    updatePlacementBounds();
    renderMarkers();
  }

  function loadInitialAnnotations() {
    if (state.notes.length || !config.initialAnnotationsUrl) return Promise.resolve();
    return fetch(config.initialAnnotationsUrl, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (payload) {
        var incoming = Array.isArray(payload) ? payload : payload.notes;
        if (Array.isArray(incoming)) state.notes = state.storage.merge([], incoming);
      })
      .catch(function (error) {
        if (config.debug) console.warn("Equatorial Post-its: arquivo inicial indisponível.", error);
      });
  }

  function initialize() {
    if (document.getElementById("eqp-root")) return;
    buildInterface();
    state.storage = new Storage.LocalStorage(config);
    state.notes = state.storage.load();
    state.adapter =
      window.EquatorialPostitsAdapterOverride ||
      new window.EquatorialPostitsAdapters.ThreeDVistaAdapter(config);
    bindEvents();
    loadInitialAnnotations().finally(function () {
      syncMarkers();
      renderList();
    });
    state.adapter.subscribe(function (camera) {
      var previousPanorama = state.camera && state.camera.panoramaId;
      state.camera = camera;
      updatePlacementBounds();
      renderMarkers();
      if (!camera || String(previousPanorama) !== String(camera.panoramaId)) renderList();
    });
    window.EquatorialPostits = {
      version: config.version,
      getNotes: function () {
        return JSON.parse(JSON.stringify(state.notes));
      },
      addMode: function () {
        setPlacementMode(true);
      },
      openPanel: function () {
        setPanel(true);
      },
      export: exportNotes,
      adapter: state.adapter,
    };
    toast("Ferramenta de identificação pronta.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
