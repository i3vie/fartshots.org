import { sequelize, User } from './db.ts';
import { hash, compare } from 'bcrypt';
import { normalizeUsername } from './helper.ts';
import { UniqueConstraintError } from 'sequelize';
import { Router } from 'express';
import type { Request } from 'express';
import { clearSessionCookie, createSession, destroySessionByToken, getSessionTokenFromRequest, setSessionCookie } from './session.ts';
import { slowDown } from 'express-slow-down';
const apiRouter: Router = Router();

function isSecureRequest(req: Request): boolean {
    return Boolean(req.secure);
}

// Rate limit login attempts
const loginLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 14, // 5 requests per IP per 15 minutes before slowing down
    delayMs: (hits) => (hits * hits) / 2 // after passing the threshold, delay increases quadratically (0.5s, 2s, 4.5s, etc)

});

// Registers are tighter
const registerLimiter = slowDown({
    windowMs: 1 * 60 * 60 * 1000, // 1 hour
    delayAfter: 7, // 3 requests per IP per 1 hour before slowing down
    delayMs: (hits) => hits * hits * 1.5 * 1000 // 1.5s, 6s, 13.5s, etc. harsher for registration
});

apiRouter.post('/v1/login', loginLimiter, async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    username = normalizeUsername(String(username));

    if (!username) {
        return res.status(400).json({ error: 'Invalid username' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    try {
        const passwordMatch = await compare(String(password), user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (e) {
        // Bcrypt shouldn't really throw?..
        return res.status(500).json({ error: 'Internal server error' });
    }

    const session = await createSession(user);
    setSessionCookie(res, session, isSecureRequest(req));
    res.json({ success: true, expiresAt: session.expiresAt });
});

apiRouter.post('/v1/logout', async (req, res) => {
    const token = getSessionTokenFromRequest(req);
    if (token) {
        await destroySessionByToken(token);
    }

    clearSessionCookie(res, isSecureRequest(req));
    res.json({ success: true });
});

apiRouter.post('/v1/register', registerLimiter, async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    username = normalizeUsername(String(username));

    if (!username) {
        return res.status(400).json({ error: 'Invalid username' });
    }

    let hashedPassword: string;

    try {
        hashedPassword = await hash(String(password), 10); // from Bcrypt
    } catch (e) {
        return res.status(500).json({ error: 'Error hashing password' });
    }

    try {
        await User.create({
            username,
            password: hashedPassword,
        });
        res.status(201).json({ success: true, message: 'Registration successful' });
    } catch (error: unknown) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        return res.status(500).json({ error: 'Error registering user' });
    }
});

export default apiRouter;
