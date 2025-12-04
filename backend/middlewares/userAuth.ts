import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';

type DecodedToken = { userId?: string; admin?: boolean; email?: string };

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const headers = req.headers as Record<string, string | undefined>;
  let token = headers.token || req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, faça login novamente' });
  }

  if (typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const decoded = jwt.verify(String(token), process.env.JWT_SECRET as jwt.Secret) as DecodedToken;
    if (decoded?.userId) {
      (req as unknown as { userId?: string }).userId = decoded.userId;
      req.body.userId = decoded.userId;
    }
    next();
  } catch (error: any) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: error?.message || 'Token inválido',
    });
  }
};
