// Inline script to prevent flash of wrong theme before React hydrates
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('nodo-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var theme = stored || (prefersDark ? 'dark' : 'light');
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
        document.documentElement.classList.add('hydrated');
      } catch(e) {}
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
