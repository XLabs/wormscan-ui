module.exports = function (app) {
  app.use(function (req, res, next) {
    res.setHeader("strict-transport-security", "max-age=63072000; includeSubdomains; preload");
    res.setHeader(
      "content-security-policy",
      "default-src 'self' https:; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src * data:; frame-ancestors 'none';",
    );
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("x-xss-protection", "1; mode=block");
    res.setHeader("referrer-policy", "same-origin");
    res.setHeader("x-frame-options", "DENY");
    next();
  });
};
