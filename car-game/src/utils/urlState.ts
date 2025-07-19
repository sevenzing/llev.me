// URL state management for the car game
export interface URLState {
  codeOpen: boolean;
  seed: number | null;
}

// Get current URL state
export function getURLState(): URLState {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    codeOpen: urlParams.get('code') === 'true',
    seed: urlParams.get('seed') ? Number(urlParams.get('seed')) : null,
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