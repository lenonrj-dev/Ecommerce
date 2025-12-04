import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";

const normalizeEmail = (val = "") => String(val || "").trim().toLowerCase();

const extractToken = (req: Request) => {
  const headers = req.headers as Record<string, string | undefined>;
  if (headers?.token) return headers.token;
  const authHeader = headers?.authorization || "";
  if (/^Bearer\s+/i.test(authHeader)) {
    return authHeader.replace(/^Bearer\s+/i, "").trim();
  }
  const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
  if (cookies?.token) return cookies.token;
  return null;
};

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Não autorizado, faça login novamente." });
    }

    const decoded = jwt.verify(String(token), process.env.JWT_SECRET as jwt.Secret) as { admin?: boolean; email?: string };
    const expectedEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const decodedEmail = normalizeEmail(decoded?.email);
    const isAdmin =
      decoded?.admin === true && (!expectedEmail || decodedEmail === expectedEmail);

    if (!isAdmin) {
      return res.status(401).json({ message: "Não autorizado, faça login novamente." });
    }

    (req as unknown as { adminEmail?: string }).adminEmail = decodedEmail;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Não autorizado, token inválido." });
  }
};

export default adminAuth;
