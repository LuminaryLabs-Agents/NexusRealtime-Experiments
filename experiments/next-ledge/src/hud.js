const pct = (value, max = 100) => `${Math.round(Math.max(0, value) / Math.max(1, max) * 100)}%`;

export function createHud({ status, readout } = {}) {
  let lastStatus = "";
  let lastReadout = "";
  return {
    draw(snapshot) {
      if (!snapshot) return;
      const statusText = `${String(snapshot.mode ?? "unknown").toUpperCase()} · ${snapshot.status ?? ""}`;
      const readoutText = `Sector ${snapshot.sector} · Stamina ${pct(snapshot.stamina, snapshot.constants?.maxStamina)} · Height ${Math.max(0, snapshot.maxHeight ?? 0)}m`;
      if (status && statusText !== lastStatus) {
        status.textContent = statusText;
        lastStatus = statusText;
      }
      if (readout && readoutText !== lastReadout) {
        readout.textContent = readoutText;
        lastReadout = readoutText;
      }
    }
  };
}
