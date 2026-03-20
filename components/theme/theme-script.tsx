export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var v=t||(d?'dark':'light');document.documentElement.classList.toggle('dark',v==='dark');}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
