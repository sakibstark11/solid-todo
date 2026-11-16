import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware([
  async (event, next) => {
    event.res.headers.set("X-Content-Type-Options", "nosniff");
    event.res.headers.set("X-Frame-Options", "DENY");
    event.res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return next();
  },
]);