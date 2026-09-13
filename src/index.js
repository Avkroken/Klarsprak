import app from "./worker.js";
import { applyResponsePolicy } from "./response-policy.js";

const ADMIN_PAGE = "/admin";
const ADMIN_ASSET = "/admin.html";
const ADMIN_API_PREFIX = "/admin/api/";
const LEGACY_ADMIN_API_PREFIX = "/api/admin/";
const LEGACY_CRITICAL_PAGE = "/admin/critical";
const LEGACY_CRITICAL_API_PREFIX = "/admin/critical/api/";

export function isAdminPath(pathname) {
  return pathname === ADMIN_PAGE
    || pathname === `${ADMIN_PAGE}/`
    || pathname === ADMIN_ASSET
    || pathname.startsWith(ADMIN_API_PREFIX)
    || pathname.startsWith(LEGACY_ADMIN_API_PREFIX)
    || pathname === LEGACY_CRITICAL_PAGE
    || pathname === `${LEGACY_CRITICAL_PAGE}/`
    || pathname.startsWith(LEGACY_CRITICAL_API_PREFIX);
}

export function adminRoute(_method, pathname) {
  if (pathname === ADMIN_ASSET) {
    return { type: "redirect", pathname: ADMIN_PAGE };
  }
  if (pathname === ADMIN_PAGE || pathname === `${ADMIN_PAGE}/`) {
    return { type: "rewrite", pathname: ADMIN_ASSET };
  }
  if (pathname === LEGACY_CRITICAL_PAGE || pathname === `${LEGACY_CRITICAL_PAGE}/`) {
    return { type: "redirect", pathname: ADMIN_PAGE };
  }
  if (pathname.startsWith(LEGACY_CRITICAL_API_PREFIX)) {
    return {
      type: "redirect",
      pathname: `${ADMIN_API_PREFIX}${pathname.slice(LEGACY_CRITICAL_API_PREFIX.length)}`,
    };
  }
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    return {
      type: "rewrite",
      pathname: `${LEGACY_ADMIN_API_PREFIX}${pathname.slice(ADMIN_API_PREFIX.length)}`,
    };
  }
  if (pathname.startsWith(LEGACY_ADMIN_API_PREFIX)) {
    return {
      type: "redirect",
      pathname: `${ADMIN_API_PREFIX}${pathname.slice(LEGACY_ADMIN_API_PREFIX.length)}`,
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

    if (externalUrl.pathname === ADMIN_PAGE || externalUrl.pathname === `${ADMIN_PAGE}/`) {
      response = injectAdminAccessRouting(response);
    }

    return applyResponsePolicy(response, { noStore: isAdminPath(externalUrl.pathname) });
  },
};
