(function () {
  "use strict";

  window.EquatorialPostitsConfig = Object.assign(
    {
      version: "1.1.0",
      tourId: "equatorial-vista-aerea",
      storageKey: "mg360:equatorial-postits:v1",
      viewerSelectors: ["#viewer", "#MainViewer", "[data-tdv-viewer]"],
      rootPlayerId: "rootPlayer",
      playlistId: "mainPlayList",
      assetBaseUrl: "./equatorial-postits-skin/assets",
      initialAnnotationsUrl: "",
      pollIntervalMs: 32,
      maxTitleLength: 80,
      maxDescriptionLength: 400,
      ui: {
        title: "Identificação de espaços",
        addLabel: "Adicionar identificação",
        placementHelp: "Toque no ponto exato que deseja identificar",
        dragHelp: "Arraste este marcador até o local desejado",
      },
      colors: [
        { id: "azul", label: "Azul", value: "#1f5da8" },
        { id: "amarelo", label: "Amarelo", value: "#f3bf37" },
        { id: "verde", label: "Verde", value: "#2f8d65" },
        { id: "laranja", label: "Laranja", value: "#e87835" },
        { id: "magenta", label: "Magenta", value: "#a74479" },
      ],
      permissions: {
        create: true,
        edit: true,
        delete: true,
        import: true,
        export: true,
      },
      debug: false,
    },
    window.EquatorialPostitsConfig || {}
  );
})();
