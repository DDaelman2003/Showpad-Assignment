import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  clientId?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const clientId = authHeader.substring(7).trim();
  if (!clientId) {
    return res.status(401).json({ error: "Invalid clientID" });
  }

  req.clientId = clientId;
  next();
};