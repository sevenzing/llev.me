// URL state management for the car game
export interface URLState {
  codeOpen: boolean;
  seed: number | null;
  background?: string;
  mainColor?: string;
  roadColor?: string;
}

// Get current URL state
export function getURLState(): URLState {
  const urlParams = new URLSearchParams(window.location.search);
  let mainColor = urlParams.get('mainColor') || undefined;
  let roadColor = urlParams.get('roadColor') || undefined;

  // Robust hex color handling: add # if missing and looks like hex
  if (mainColor && !mainColor.startsWith('#')) {
    if (/^[0-9A-F]{3}$/i.test(mainColor) || /^[0-9A-F]{6}$/i.test(mainColor)) {
      mainColor = '#' + mainColor;
    }
  }

  if (roadColor && !roadColor.startsWith('#')) {
    if (/^[0-9A-F]{3}$/i.test(roadColor) || /^[0-9A-F]{6}$/i.test(roadColor)) {
      roadColor = '#' + roadColor;
    }
  }

  return {
    codeOpen: urlParams.get('code') === 'true',
    seed: urlParams.get('seed') ? Number(urlParams.get('seed')) : null,
    background: urlParams.get('background') || undefined,
    mainColor,
    roadColor,
  };
}

// Update URL state
export function updateURLState(state: Partial<URLState>): void {
  const url = new URL(window.location.href);
  const urlParams = url.searchParams;

  // Update code open state
  if (state.codeOpen !== undefined) {
    if (state.codeOpen === true) {
      urlParams.set('code', 'true');
    } else {
      urlParams.delete('code');
    }
  }

  // Update seed state
  if (state.seed !== undefined) {
    if (state.seed !== null) {
      urlParams.set('seed', state.seed.toString());
    } else {
      urlParams.delete('seed');
    }
  }

  // Update background
  if (state.background !== undefined) {
    urlParams.set('background', state.background);
  }

  // Update mainColor
  if (state.mainColor !== undefined) {
    urlParams.set('mainColor', state.mainColor);
  }

  // Update roadColor
  if (state.roadColor !== undefined) {
    urlParams.set('roadColor', state.roadColor);
  }

  // Update URL without reloading the page
  window.history.replaceState({}, '', url.toString());
}

// Set initial URL state on page load
export function initializeURLState(): void {
  // If no URL parameters exist, don't add any
  // This keeps URLs clean when no special state is needed
  const currentState = getURLState();
  if (Object.keys(currentState).length === 0) {
    return;
  }

  // URL state exists, ensure it's properly set
  updateURLState(currentState);
} 