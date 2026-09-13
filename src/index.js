import app from "./worker.js";
import { applyResponsePolicy } from "./response-policy.js";

const ADMIN_PAGE = "/admin";
const CRITICAL_ADMIN_PAGE = "/admin/critical";
const ADMIN_ASSET = "/admin.html";
const ADMIN_API_PREFIX = "/admin/api/";
const CRITICAL_ADMIN_API_PREFIX = "/admin/critical/api/";
const LEGACY_ADMIN_API_PREFIX = "/api/admin/";

export function isAdminPath(pathname) {
  return pathname === ADMIN_PAGE
    || pathname === `${ADMIN_PAGE}/`
    || pathname === CRITICAL_ADMIN_PAGE
    || pathname === `${CRITICAL_ADMIN_PAGE}/`
    || pathname === ADMIN_ASSET
    || pathname.startsWith(ADMIN_API_PREFIX)
    || pathname.startsWith(CRITICAL_ADMIN_API_PREFIX)
    || pathname.startsWith(LEGACY_ADMIN_API_PREFIX);
}

function isCriticalAdminRequest(method, legacyPathname) {
  const upperMethod = method.toUpperCase();

  if (upperMethod === "POST" && /^\/api\/admin\/review\/[^/]+$/.test(legacyPathname)) {
    return true;
  }

  if (upperMethod === "PUT" && /^\/api\/admin\/terms\/[^/]+$/.test(legacyPathname)) {
    return true;
  }

  if (upperMethod === "POST" && /^\/api\/admin\/terms\/[^/]+\/status$/.test(legacyPathname)) {
    return true;
  }

  return false;
}

function legacyAdminPath(pathname, prefix) {
  return `${LEGACY_ADMIN_API_PREFIX}${pathname.slice(prefix.length)}`;
}

function protectedAdminPath(method, legacyPathname) {
  const prefix = isCriticalAdminRequest(method, legacyPathname)
    ? CRITICAL_ADMIN_API_PREFIX
    : ADMIN_API_PREFIX;
  return `${prefix}${legacyPathname.slice(LEGACY_ADMIN_API_PREFIX.length)}`;
}

export function adminRoute(method, pathname) {
  if (pathname === ADMIN_ASSET) {
    return { type: "redirect", pathname: ADMIN_PAGE };
  }
  if (pathname === ADMIN_PAGE || pathname === `${ADMIN_PAGE}/`) {
    return { type: "rewrite", pathname: ADMIN_ASSET };
  }
  if (pathname === CRITICAL_ADMIN_PAGE || pathname === `${CRITICAL_ADMIN_PAGE}/`) {
    return { type: "rewrite", pathname: ADMIN_ASSET };
  }
  if (pathname.startsWith(CRITICAL_ADMIN_API_PREFIX)) {
    const legacyPathname = legacyAdminPath(pathname, CRITICAL_ADMIN_API_PREFIX);
    if (!isCriticalAdminRequest(method, legacyPathname)) {
      return {
        type: "redirect",
        pathname: `${ADMIN_API_PREFIX}${pathname.slice(CRITICAL_ADMIN_API_PREFIX.length)}`,
      };
    }
    return { type: "rewrite", pathname: legacyPathname };
  }
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    const legacyPathname = legacyAdminPath(pathname, ADMIN_API_PREFIX);
    if (isCriticalAdminRequest(method, legacyPathname)) {
      return {
        type: "redirect",
        pathname: `${CRITICAL_ADMIN_API_PREFIX}${pathname.slice(ADMIN_API_PREFIX.length)}`,
      };
    }
    return { type: "rewrite", pathname: legacyPathname };
  }
  if (pathname.startsWith(LEGACY_ADMIN_API_PREFIX)) {
    return {
      type: "redirect",
      pathname: protectedAdminPath(method, pathname),
    };
  }
  return { type: "pass", pathname };
}

function requestWithPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function injectAdminAccessRouting(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let injected = false;
  return new HTMLRewriter()
    .on("script", {
      element(element) {
        if (injected) return;
        injected = true;
        element.before('<script src="/admin-access-routing.js"></script>', { html: true });
      },
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const externalUrl = new URL(request.url);
    const route = adminRoute(request.method, externalUrl.pathname);
    let response;

    if (route.type === "redirect") {
      const target = new URL(request.url);
      target.pathname = route.pathname;
      response = Response.redirect(target.toString(), 308);
    } else {
      const upstreamRequest = route.type === "rewrite"
        ? requestWithPath(request, route.pathname)
        : request;
      response = await app.fetch(upstreamRequest, env, ctx);
    }

    if (
      externalUrl.pathname === ADMIN_PAGE
      || externalUrl.pathname === `${ADMIN_PAGE}/`
      || externalUrl.pathname === CRITICAL_ADMIN_PAGE
      || externalUrl.pathname === `${CRITICAL_ADMIN_PAGE}/`
    ) {
      response = injectAdminAccessRouting(response);
    }

    return applyResponsePolicy(response, { noStore: isAdminPath(externalUrl.pathname) });
  },
};
