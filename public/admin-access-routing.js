(() => {
  const nativeFetch = window.fetch.bind(window);
  const legacyAdminApiPrefix = "/api/admin/";
  const adminApiPrefix = "/admin/api/";

  function canonicalAdminPath(pathname) {
    if (!pathname.startsWith(legacyAdminApiPrefix)) return null;
    return `${adminApiPrefix}${pathname.slice(legacyAdminApiPrefix.length)}`;
  }

  if (location.pathname === "/admin/critical" || location.pathname.startsWith("/admin/critical/")) {
    location.replace(`/admin${location.search}${location.hash}`);
    return;
  }

  window.fetch = (input, init) => {
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : String(input), location.href);
    } catch {
      return nativeFetch(input, init);
    }

    if (url.origin !== location.origin) return nativeFetch(input, init);
    const canonical = canonicalAdminPath(url.pathname);
    if (!canonical) return nativeFetch(input, init);

    url.pathname = canonical;
    const rewritten = input instanceof Request
      ? new Request(url.toString(), input)
      : url.toString();
    return nativeFetch(rewritten, init);
  };
})();
