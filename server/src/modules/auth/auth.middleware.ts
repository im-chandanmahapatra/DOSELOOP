import { Request, Response, NextFunction } from 'express';
import { createClient, User } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';

const supabase = createClient(
  env.SUPABASE_URL ?? '',
  env.SUPABASE_SERVICE_ROLE_KEY ?? '',
);

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const isDev = process.env.NODE_ENV !== 'production';

    // Development-only local token bypass
    if (isDev && (token.startsWith('local_token_') || token === 'local_token_aman')) {
      const identifier = token.replace('local_token_', '');
      try {
        let dbUser = null;
        if (identifier && identifier !== 'aman') {
          dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { id: identifier },
                { email: identifier },
              ],
            },
          });
        }

        if (!dbUser) {
          dbUser = await prisma.user.findUnique({
            where: { id: 'usr_aman' },
          });
        }

        if (dbUser) {
          (req as Request & { user?: User }).user = {
            id: dbUser.id,
            app_metadata: {},
            user_metadata: { firstName: dbUser.firstName, lastName: dbUser.lastName ?? '' },
            aud: 'authenticated',
            created_at: dbUser.createdAt.toISOString(),
            email: dbUser.email,
          } as User;
          return next();
        }
      } catch {
        // DB lookup failure fallback in local dev
      }

      (req as Request & { user?: User }).user = {
        id: 'usr_aman',
        app_metadata: {},
        user_metadata: { firstName: 'Aman', lastName: 'Kumar' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'aman@doseloop.com',
      } as User;
      return next();
    }

    // Verify token and get user with Supabase
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && user) {
        (req as Request & { user?: User }).user = user;
        return next();
      }
    } catch (supabaseErr) {
      if (isDev) {
        // Supabase is unreachable in local dev mode; allow fallback
        (req as Request & { user?: User }).user = {
          id: 'usr_aman',
          app_metadata: {},
          user_metadata: { firstName: 'Aman', lastName: 'Kumar' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'aman@doseloop.com',
        } as User;
        return next();
      }
      return res.status(401).json({ error: 'Unauthorized: Authentication service unavailable' });
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  } catch {
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
