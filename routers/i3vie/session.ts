import crypto from 'crypto';
import { sequelize, User, Session } from './db.ts';
import { Op } from 'sequelize';

/**
 * Manually cleans up any sessions in the db whose expiresAt is in
 * the past. This is automatically run every hour by default, but you
 * can run this manually if you want to cleanup some sessions immediately.
 * 
 * @returns A promise resolving to the number of destroyed sessions.
 */
export async function cleanupSessions() {
    const now = new Date();
    return await Session.destroy({
        where: {
            expiresAt: {
                [Op.lt]: now
            }
        }
    });
}

/**
 * Start the session cleanup interval for i3vie's db sessions.
 * You should never have to run this manually!! Only once in
 * the server's init step. If you really need to cleanup
 * some sessions manually, just run {@link cleanupSessions()} instead.
 * 
 * @param intervalMs How often to run the cleanup in milliseconds. Default is 1 hour `(60 * 60 * 1000 ms)`
 */
export function startSessionCleanupInterval(intervalMs: number = 60 * 60 * 1000) {
    cleanupSessions(); // run once immediately on startup
    setInterval(cleanupSessions, intervalMs);
    return true;
}

/**
 * crypto.randomBytes session token generator
 * @returns A 40-character random string to be used as a session token
 */
export function generateSessionToken(): string {
    return crypto.randomBytes(40).toString('hex');
}

export function createSession(user: User, expiresInMs: number = 3 * 24 * 60 * 60 * 1000): Promise<Session> {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + expiresInMs);

    return Session.create({
        userId: user.id,
        token,
        expiresAt,
    });
}

export function getSessionByToken(token: string): Promise<Session | null> {
    return Session.findOne({ where: { token } });
}

export function getUserBySessionToken(token: string): Promise<User | null> {
    return Session.findOne({ where: { token }, include: User })
        .then(session => session ? session.get('User') as User : null);
}

export function getUserSessions(userId: string): Promise<Session[]> {
    return Session.findAll({ where: { userId } });
}