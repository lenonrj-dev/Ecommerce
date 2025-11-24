import jwt from "jsonwebtoken";

const normalizeEmail = (val = "") => String(val || "").trim().toLowerCase();

const extractToken = (req) => {
  if (req.headers?.token) return req.headers.token;
  const authHeader = req.headers?.authorization || "";
  if (/^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  }
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

const adminAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Nǜo autorizado, fa��a login novamente." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expectedEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const decodedEmail = normalizeEmail(decoded?.email);
    const isAdmin =
      decoded?.admin === true && (!expectedEmail || decodedEmail === expectedEmail);

    if (!isAdmin) {
      return res.status(401).json({ message: "Nǜo autorizado, fa��a login novamente." });
    }

    req.adminEmail = decodedEmail;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Nǜo autorizado, token invǭlido." });
  }
};

export default adminAuth;
