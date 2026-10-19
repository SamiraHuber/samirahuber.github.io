// Color scheme switcher for testing. Remove this file and its <script> tag to disable.
(function () {
  const VARS = ['bg', 'bg-soft', 'bg-card', 'text', 'text-muted', 'accent', 'accent-light', 'border', 'gradient-start', 'gradient-end'];

  // Each palette: [bg, bg-soft, bg-card, text, text-muted, accent, accent-light, border, gradient-start, gradient-end]
  const PALETTES = {
    'Default (Indigo)': null,
    Forest: {
      dark: ['#121a16', '#1a2620', '#1f2e26', '#d2e6da', '#8fb3a0', '#6fcf97', '#a8e6c1', '#2f4a3c', '#6fcf97', '#d2e6da'],
      light: ['#f4f8f5', '#e4eee8', '#ffffff', '#16251d', '#4a6356', '#2e8b57', '#4caf7a', '#a8d5ba', '#2e8b57', '#6fcf97'],
    },
    Terracotta: {
      dark: ['#1c1714', '#26201b', '#2d2520', '#ecdccf', '#b89a86', '#e08a5f', '#f2b896', '#4d3b30', '#e08a5f', '#ecdccf'],
      light: ['#fbf7f2', '#f2e9df', '#ffffff', '#2b211b', '#6b574a', '#c0582c', '#d97a4e', '#e8c7b0', '#c0582c', '#e08a5f'],
    },
    Plum: {
      dark: ['#1a1420', '#241c2c', '#2a2134', '#e3d6f0', '#a993c2', '#c08ff0', '#dcbcff', '#45365a', '#c08ff0', '#e3d6f0'],
      light: ['#faf7fd', '#efe8f6', '#ffffff', '#251c2e', '#5f4e72', '#7b3fb8', '#9a63d1', '#d7c3ec', '#7b3fb8', '#c08ff0'],
    },
    Ocean: {
      dark: ['#0f1a1e', '#16252b', '#1a2c33', '#cfe7ec', '#86adb8', '#4fc3d9', '#94e0ee', '#2a4750', '#4fc3d9', '#cfe7ec'],
      light: ['#f3f9fa', '#e2eff2', '#ffffff', '#122428', '#45646c', '#0e7c91', '#2a9bb0', '#a7d7e0', '#0e7c91', '#4fc3d9'],
    },
    Crimson: {
      dark: ['#1a1214', '#25191c', '#2c1e22', '#f0d9dd', '#bd8f98', '#ef6f84', '#f8a9b6', '#4f3238', '#ef6f84', '#f0d9dd'],
      light: ['#fcf6f7', '#f4e6e9', '#ffffff', '#2a1a1d', '#6e4f55', '#b8283f', '#d24a60', '#ecc0c8', '#b8283f', '#ef6f84'],
    },
    Graphite: {
      dark: ['#141414', '#1c1c1c', '#222222', '#e2e2e2', '#9a9a9a', '#f0c050', '#f7d98c', '#3a3a3a', '#f0c050', '#e2e2e2'],
      light: ['#f7f7f5', '#ebebe7', '#ffffff', '#1c1c1c', '#555555', '#b07d00', '#d19a1a', '#d4d4cc', '#b07d00', '#f0c050'],
    },
    Midnight: {
      dark: ['#0b0d12', '#12151d', '#171b25', '#dfe4ee', '#8a93a8', '#7aa2ff', '#b3c8ff', '#2a3142', '#7aa2ff', '#dfe4ee'],
      light: ['#f6f7fa', '#e9ecf2', '#ffffff', '#141821', '#525b70', '#2f5bd3', '#4f78e6', '#c3cde3', '#2f5bd3', '#7aa2ff'],
    },
    Espresso: {
      dark: ['#191512', '#221d19', '#29231e', '#e8ddd2', '#ab9a8b', '#c8a27a', '#e3c7a8', '#463b32', '#c8a27a', '#e8ddd2'],
      light: ['#faf6f1', '#efe7dd', '#ffffff', '#2a211a', '#6a5a4c', '#8a5a2b', '#a8784a', '#dcc9b4', '#8a5a2b', '#c8a27a'],
    },

    // Bright / vivid
    Sunshine: {
      dark: ['#1a1708', '#25210d', '#2c2811', '#fff6cc', '#d6c77a', '#ffd60a', '#ffe766', '#4d4415', '#ffd60a', '#ffa600'],
      light: ['#fffbe6', '#fff3b8', '#ffffff', '#2a2400', '#6b5d10', '#e0a800', '#ffc300', '#ffe27a', '#ff9500', '#ffd60a'],
    },
    Coral: {
      dark: ['#1f1212', '#2b1818', '#331c1c', '#ffe1dc', '#e0a49a', '#ff6b5b', '#ffa196', '#5a2c28', '#ff6b5b', '#ffb347'],
      light: ['#fff5f3', '#ffe4df', '#ffffff', '#3a1410', '#7a3d35', '#f0432f', '#ff6b5b', '#ffc2b8', '#f0432f', '#ffb347'],
    },
    Tangerine: {
      dark: ['#1d140a', '#291c0e', '#312112', '#ffe6cc', '#e0b080', '#ff8c1a', '#ffb366', '#5a3a1a', '#ff8c1a', '#ffd60a'],
      light: ['#fff7ef', '#ffe9d1', '#ffffff', '#331d05', '#7a4f1f', '#ef6c00', '#ff8c1a', '#ffcf99', '#ef6c00', '#ffc300'],
    },
    Lime: {
      dark: ['#11180a', '#18220e', '#1d2912', '#ebffcc', '#aacc80', '#a3e635', '#c9f27a', '#3a4d1f', '#a3e635', '#facc15'],
      light: ['#f8ffeb', '#ecfacc', '#ffffff', '#1a2905', '#4d6620', '#4d9a00', '#65b812', '#cdee99', '#4d9a00', '#a3e635'],
    },
    Mint: {
      dark: ['#0b1a17', '#10251f', '#142d27', '#d6fff4', '#8fd6c2', '#2ee6b0', '#86f2d2', '#1f4d40', '#2ee6b0', '#7dd3fc'],
      light: ['#effffa', '#d6f9ee', '#ffffff', '#062b21', '#2d6b5a', '#00a37a', '#14c08f', '#a3ecd6', '#00a37a', '#2ee6b0'],
    },
    'Electric Blue': {
      dark: ['#070d1f', '#0c142e', '#101a38', '#d9e6ff', '#8aa4e0', '#2f7bff', '#7aaeff', '#1f3366', '#2f7bff', '#00d4ff'],
      light: ['#f0f6ff', '#dbe8ff', '#ffffff', '#081633', '#2c4580', '#0057ff', '#2f7bff', '#a8c8ff', '#0057ff', '#00b4ff'],
    },
    Sky: {
      dark: ['#0a1620', '#0f202e', '#132737', '#d9f1ff', '#8cc2e0', '#38bdf8', '#8ad8fb', '#1f4560', '#38bdf8', '#a5f3fc'],
      light: ['#f0faff', '#d9f1ff', '#ffffff', '#082233', '#2b5a75', '#0284c7', '#0ea5e9', '#a5dcf7', '#0284c7', '#38bdf8'],
    },
    'Neon Magenta': {
      dark: ['#140a1a', '#1d0f26', '#24122f', '#ffd9fb', '#d68fd0', '#ff2bd6', '#ff85ea', '#4d1f4a', '#ff2bd6', '#00e5ff'],
      light: ['#fff0fc', '#ffd9f7', '#ffffff', '#2e0629', '#7a2d70', '#d600a8', '#f019c4', '#ffb3ef', '#d600a8', '#7c3aed'],
    },
    Bubblegum: {
      dark: ['#1f1019', '#2b1623', '#331a2a', '#ffe0f0', '#e0a0c0', '#ff6fb5', '#ffa8d4', '#5a2a45', '#ff6fb5', '#c084fc'],
      light: ['#fff5fa', '#ffe0ef', '#ffffff', '#3a0f26', '#7a3a5a', '#e83e8c', '#ff6fb5', '#ffc2de', '#e83e8c', '#c084fc'],
    },
    Lavender: {
      dark: ['#15131f', '#1d1a2b', '#232033', '#ece6ff', '#aaa0d6', '#a78bfa', '#cbbcff', '#3d3666', '#a78bfa', '#f0abfc'],
      light: ['#f9f7ff', '#efeaff', '#ffffff', '#1f1838', '#55497a', '#6d4fe0', '#8b6ff0', '#d6ccff', '#6d4fe0', '#c084fc'],
    },
    Rainbow: {
      dark: ['#12121a', '#1a1a26', '#20202e', '#f2f2ff', '#a8a8c8', '#ff4d6d', '#ffb3c1', '#383852', '#ff4d6d', '#4dd2ff'],
      light: ['#fdfcff', '#f1efff', '#ffffff', '#1a1a2e', '#55557a', '#e6194b', '#ff4d6d', '#d9d4ff', '#ff8c00', '#7c3aed'],
    },
  };

  const root = document.documentElement;
  let current = 'Default (Indigo)';
  try { current = localStorage.getItem('palette') || current; } catch (e) {}
  if (!(current in PALETTES)) current = 'Default (Indigo)';

  // The header background is hardcoded in styles.css, so route it through a variable while a palette is active.
  const style = document.createElement('style');
  style.textContent = `
    html[data-palette] .header { background: color-mix(in srgb, var(--bg) 85%, transparent); }
    .palette-switcher { position: fixed; bottom: 1rem; left: 1rem; z-index: 1000; display: flex; gap: 0.5rem; align-items: center;
      padding: 0.5rem 0.75rem; border-radius: 999px; background: var(--bg-card); color: var(--text);
      border: 1px solid var(--border); box-shadow: 0 8px 24px var(--shadow); font: 600 0.8rem 'Inter', sans-serif; }
    .palette-switcher select { font: inherit; color: inherit; background: var(--bg-soft); border: 1px solid var(--border);
      border-radius: 999px; padding: 0.25rem 0.5rem; cursor: pointer; }
  `;
  document.head.appendChild(style);

  function apply() {
    const palette = PALETTES[current];
    if (!palette) {
      VARS.forEach(v => root.style.removeProperty(`--${v}`));
      root.removeAttribute('data-palette');
      return;
    }
    const values = palette[root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'];
    VARS.forEach((v, i) => root.style.setProperty(`--${v}`, values[i]));
    root.setAttribute('data-palette', current);
  }

  const panel = document.createElement('label');
  panel.className = 'palette-switcher';
  panel.textContent = 'Colors';
  const select = document.createElement('select');
  Object.keys(PALETTES).forEach(name => select.add(new Option(name, name, false, name === current)));
  select.addEventListener('change', () => {
    current = select.value;
    try { localStorage.setItem('palette', current); } catch (e) {}
    apply();
  });
  panel.appendChild(select);
  document.body.appendChild(panel);

  // Re-apply when the existing light/dark toggle changes the theme.
  new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  apply();
})();
