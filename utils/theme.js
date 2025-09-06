// Theme utilities for ChatRizz

// Initialize theme on app load
function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem('chatrizz_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('chatrizz_theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  } catch (error) {
    console.error('Theme initialization error:', error);
  }
}

// Apply theme to document
function applyTheme(theme) {
  try {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chatrizz_theme', theme);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('theme_change', { detail: { theme } }));
  } catch (error) {
    console.error('Apply theme error:', error);
  }
}

// Toggle between light and dark theme
function toggleTheme() {
  try {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    return newTheme;
  } catch (error) {
    console.error('Toggle theme error:', error);
    return 'light';
  }
}

// Get current theme
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}