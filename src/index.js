import app from "./worker.js";
import { applyResponsePolicy } from "./response-policy.js";

const ADMIN_PAGE = "/admin";
const ADMIN_ASSET = "/admin.html";
const ADMIN_API_PREFIX = "/admin/api/";
const LEGACY_ADMIN_API_PREFIX = "/api/admin/";
const LEGACY_CRITICAL_PAGE = "/admin/critical";
const LEGACY_CRITICAL_API_PREFIX = "/admin/critical/api/";
const INDEX_ROBOTS = "index, follow, max-image-preview:large";

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

export function seoForPath(pathname) {
  if (pathname === "/" || pathname === "/index.html") {
    return {
      robots: INDEX_ROBOTS,
      canonical: "https://klarsprak.denied.se/",
      description: null,
    };
  }
  if (pathname === "/varfor" || pathname === "/varfor/" || pathname === "/varfor.html") {
    return {
      robots: INDEX_ROBOTS,
      canonical: "https://klarsprak.denied.se/varfor",
      description: "Läs om Klarspråks metod, syfte och kvalitetskrav för jämförelser mellan allmänspråk och offentlig användning.",
    };
  }
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return null;
  return { robots: "noindex, nofollow", canonical: null, description: null };
}

function requestWithPath(request, pathname) {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
}

function decorateHtml(response, { injectAdminRouting = false, seo = null } = {}) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  let injectedAdminRouting = false;
  const rewriter = new HTMLRewriter();

  if (seo) {
    rewriter.on("head", {
      element(element) {
        element.append(`<meta name="robots" content="${seo.robots}">`, { html: true });
        if (seo.canonical) {
          element.append(`<link rel="canonical" href="${seo.canonical}">`, { html: true });
        }
        if (seo.description) {
          element.append(`<meta name="description" content="${seo.description}">`, { html: true });
        }
      },
    });
  }

  if (injectAdminRouting) {
    rewriter.on("script", {
      element(element) {
        if (injectedAdminRouting) return;
        injectedAdminRouting = true;
        element.before('<script src="/admin-access-routing.js"></script>', { html: true });
      },
    });
  }

  return rewriter.transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const externalUrl = new URL(request.url);
    const route = adminRoute(request.method, externalUrl.pathname);
    const seo = seoForPath(externalUrl.pathname);
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

    response = decorateHtml(response, {
      injectAdminRouting: externalUrl.pathname === ADMIN_PAGE || externalUrl.pathname === `${ADMIN_PAGE}/`,
      seo,
    });

    return applyResponsePolicy(response, {
      noStore: isAdminPath(externalUrl.pathname),
      robots: seo?.robots ?? null,
    });
  },
};
