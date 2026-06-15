// Server component: emits a tiny synchronous script that runs before hydration
// and before first paint. It resolves the visitor's language (stored choice, else
// browser language) and leaf preference onto <html> so the document reflects them
// immediately, avoiding a flash before React's post-mount sync. Covered by the
// existing CSP (`script-src 'self' 'unsafe-inline'`).
const PREFERENCES_SCRIPT = `(function(){try{var r=document.documentElement;var l=localStorage.getItem('eil:lang');if(l!=='en'&&l!=='tr'){l=/^tr\\b/i.test(navigator.language||'')?'tr':'en';}r.lang=l;r.dataset.lang=l;r.dataset.leaves=localStorage.getItem('eil:leaves')==='off'?'off':'on';}catch(e){}})();`;

export function PreferencesScript() {
  return <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />;
}
