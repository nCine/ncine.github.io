(function () {
  function formatBytes(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  const buttons = document.querySelectorAll(".artifact-download-btn");

  buttons.forEach(btn => {
    const repo = btn.dataset.repo;
    const branch = btn.dataset.branch;
    const manifestName = btn.dataset.manifest;
    const artifactKey = btn.dataset.artifact || "portable";

    const manifestURL =
      `https://raw.githubusercontent.com/${repo}/refs/heads/${branch}/${manifestName}`;

    fetch(manifestURL, { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error("Manifest fetch failed");
        return r.json();
      })
      .then(manifest => {
        let entry = null;

        // Flat schema (Linux / macOS / MinGW)
        if (manifest.filename) {
          entry = manifest;
        }
        // Multi-artifact schema (Windows)
        else if (manifest.artifacts) {
          if (manifest.artifacts[artifactKey]) {
            entry = manifest.artifacts[artifactKey];
          } else {
            const firstKey = Object.keys(manifest.artifacts)[0];
            entry = manifest.artifacts[firstKey];
          }
        }

        if (!entry || !entry.filename) {
          throw new Error("No artifact entry");
        }

        // Upgrade link to direct download
        btn.href =
          `https://github.com/${repo}/raw/refs/heads/${branch}/${entry.filename}`;

        // Build tooltip lines
        const tooltip = [];

        if (entry.filename) {
          tooltip.push(`Name: ${entry.filename}`);
        }

        if (entry.size) {
          tooltip.push(`Size: ${formatBytes(entry.size)}`);
        }

        if (entry.timestamp) {
          tooltip.push(`Timestamp: ${formatDateTime(entry.timestamp)}`);
        }

        if (entry.sha256) {
          tooltip.push(`SHA-256: ${entry.sha256}`);
        }

        if (manifest.git_revision) {
          tooltip.push(`Git revision: ${manifest.git_revision}`);
        }

        if (tooltip.length > 0) {
          btn.title = tooltip.join("\n");
        }
      })
      .catch(() => {
        // Silent fallback: branch URL remains, no tooltip
      });
  });
})();
