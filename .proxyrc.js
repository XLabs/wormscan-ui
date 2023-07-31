module.exports = function (app) {
  const isDev = process.env.NODE_ENV === "development";

  const CSP = `default-src 'self' https:; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' ${
    isDev ? `'unsafe-inline' 'unsafe-eval'` : ""
  } 'wasm-unsafe-eval'; connect-src * data:; frame-ancestors 'none';`;

  app.use(function (_, res, next) {
    res.setHeader("strict-transport-security", "max-age=63072000; includeSubdomains; preload");
    res.setHeader("content-security-policy", CSP);

    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("x-xss-protection", "1; mode=block");
    res.setHeader("referrer-policy", "same-origin");
    res.setHeader("x-frame-options", "DENY");
    next();
  });
};
