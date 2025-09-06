function ThemeToggle() {
  try {
    const [theme, setTheme] = React.useState(getCurrentTheme());

    React.useEffect(() => {
      const handleThemeChange = (event) => {
        setTheme(event.detail.theme);
      };

      window.addEventListener('theme_change', handleThemeChange);
      return () => window.removeEventListener('theme_change', handleThemeChange);
    }, []);

    const handleToggle = () => {
      const newTheme = toggleTheme();
      setTheme(newTheme);
    };

    return (
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-[var(--secondary-color)] transition-colors"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        data-name="theme-toggle"
        data-file="components/ThemeToggle.js"
      >
        <div className={`text-xl ${
          theme === 'light' 
            ? 'icon-moon text-[var(--text-secondary)]' 
            : 'icon-sun text-yellow-500'
        }`}></div>
      </button>
    );
  } catch (error) {
    console.error('ThemeToggle component error:', error);
    return null;
  }
}