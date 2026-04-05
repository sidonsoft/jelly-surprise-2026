let saveIndicator: HTMLDivElement | null = null;
let loadToast: HTMLDivElement | null = null;

export function showSaveIndicator(): void {
  if (!saveIndicator) {
    saveIndicator = document.createElement('div');
    saveIndicator.id = 'save-indicator';
    saveIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(saveIndicator);
  }
  saveIndicator.textContent = '💾 Saving...';
  saveIndicator.style.opacity = '1';
  setTimeout(() => {
    if (saveIndicator) saveIndicator.style.opacity = '0';
  }, 800);
}

export function showLoadToast(): void {
  if (!loadToast) {
    loadToast = document.createElement('div');
    loadToast.id = 'load-toast';
    loadToast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(39, 174, 96, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(loadToast);
  }
  loadToast.textContent = '✅ Game loaded';
  loadToast.style.opacity = '1';
  setTimeout(() => {
    if (loadToast) loadToast.style.opacity = '0';
  }, 2000);
}