(() => {
  const nativeFetch = window.fetch.bind(window);
  const legacyAdminApiPrefix = "/api/admin/";
  const adminApiPrefix = "/admin/api/";
  const criticalAdminApiPrefix = "/admin/critical/api/";
  const isCriticalAdminPage = () => location.pathname === "/admin/critical" || location.pathname.startsWith("/admin/critical/");

  function requestMethod(input, init) {
    return String(init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
  }

  function isCriticalAdminRequest(method, pathname) {
    const upperMethod = String(method || "GET").toUpperCase();
    if (upperMethod === "POST" && /^\/api\/admin\/review\/[^/]+$/.test(pathname)) return true;
    if (upperMethod === "PUT" && /^\/api\/admin\/terms\/[^/]+$/.test(pathname)) return true;
    if (upperMethod === "POST" && /^\/api\/admin\/terms\/[^/]+\/status$/.test(pathname)) return true;
    return false;
  }

  function canonicalAdminPath(method, pathname) {
    if (!pathname.startsWith(legacyAdminApiPrefix)) return null;
    const prefix = isCriticalAdminRequest(method, pathname) ? criticalAdminApiPrefix : adminApiPrefix;
    return `${prefix}${pathname.slice(legacyAdminApiPrefix.length)}`;
  }

  function enterCriticalAdmin() {
    const target = new URL(location.href);
    target.pathname = "/admin/critical";
    location.assign(target.toString());
  }

  window.fetch = (input, init) => {
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : String(input), location.href);
    } catch {
      return nativeFetch(input, init);
    }

    if (url.origin !== location.origin || !url.pathname.startsWith(legacyAdminApiPrefix)) {
      return nativeFetch(input, init);
    }

    const method = requestMethod(input, init);
    const critical = isCriticalAdminRequest(method, url.pathname);
    if (critical && !isCriticalAdminPage()) {
      enterCriticalAdmin();
      return Promise.reject(new Error("Öppnar kritiskt adminläge"));
    }

    url.pathname = canonicalAdminPath(method, url.pathname);
    const rewritten = input instanceof Request
      ? new Request(url.toString(), input)
      : url.toString();
    return nativeFetch(rewritten, init);
  };
})();
