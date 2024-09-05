function loadScript(src: string, position: HTMLElement): HTMLScriptElement {
  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.src = src;
  position.appendChild(script);

  return script;
}

export default loadScript;
