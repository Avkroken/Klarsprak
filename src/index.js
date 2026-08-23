import app from "./worker.js";
import { applyResponsePolicy } from "./response-policy.js";

export default {
  async fetch(request, env, ctx) {
    const response = await app.fetch(request, env, ctx);
    const pathname = new URL(request.url).pathname;
    const noStore = pathname === "/admin.html" || pathname.startsWith("/api/admin/");
    return applyResponsePolicy(response, { noStore });
  },
};
