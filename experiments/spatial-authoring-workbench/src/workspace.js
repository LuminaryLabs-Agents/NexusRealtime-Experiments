export function createInitialWorkspace() {
  const base = { selectable: true, movable: true, resizable: true, rotatable: true, interactable: true, persistent: true };
  return [
    object("panel-dashboard", "widget.panel", -0.72, 1.42, -1.7, 0.72, 0.42, { type: "panel", props: { title: "Dashboard", body: "Pinch + drag to move." } }, base),
    object("note-alpha", "widget.note", 0.02, 1.22, -1.45, 0.48, 0.34, { type: "note", props: { title: "Note", body: "Point, pinch, edit." } }, base),
    object("timer-focus", "widget.timer", 0.66, 1.38, -1.62, 0.42, 0.28, { type: "timer", props: { label: "Focus", durationSeconds: 300 }, state: { running: false } }, base),
    object("create-note", "widget.button", -0.38, 0.82, -1.18, 0.34, 0.16, { type: "button", props: { label: "+ Note", action: "create-note" } }, { ...base, movable: false, resizable: false }),
    object("create-timer", "widget.button", 0.08, 0.82, -1.18, 0.34, 0.16, { type: "button", props: { label: "+ Timer", action: "create-timer" } }, { ...base, movable: false, resizable: false }),
    object("save-workspace", "widget.button", 0.54, 0.82, -1.18, 0.38, 0.16, { type: "button", props: { label: "Save", action: "save" } }, { ...base, movable: false, resizable: false })
  ];
}

function object(id, type, x, y, z, sx, sy, widget, capabilities) {
  return {
    id,
    type,
    tags: ["spatial", "widget", widget.type],
    transform: {
      space: "local-floor",
      position: { x, y, z },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: sx, y: sy, z: 0.04 }
    },
    bounds: { center: { x: 0, y: 0, z: 0 }, size: { x: sx, y: sy, z: 0.04 } },
    capabilities,
    widget,
    interaction: { verbs: ["press", "open", "close", "toggle", "start", "pause", "reset"] },
    metadata: { spatialAuthoringWorkbench: true }
  };
}
