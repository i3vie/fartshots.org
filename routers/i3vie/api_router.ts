import { sequelize, User } from './db.ts';
import { hash, compare } from 'bcrypt';
import { normalizeUsername } from './helper.ts';
import { UniqueConstraintError } from 'sequelize';
import { Router } from 'express';
import { createSession } from './session.ts';
const apiRouter: Router = Router();

apiRouter.post('/v1/login', async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    username = normalizeUsername(String(username));

    const user = await User.findOne({ where: { username } });

    if (!user) {
        // Pass back to the register route with the username and password
        return res.redirect(307, '/i3vie/api/v1/register'); // 307 preserves the method and body.
        // Worth noting that register will then pass back to login with the same username and password after creation
    }

    try {
        const passwordMatch = await compare(String(password), user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }

    // If we haven't returned it's successful
    const session = await createSession(user);
    res.json({ success: true, token: session.token, expiresAt: session.expiresAt });
});

apiRouter.post('/v1/register', async (req, res) => {
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
        const user = await User.create({
            username,
            password: hashedPassword,
        });
        // Pass back to the login route with the username and password
        res.redirect(307, '/i3vie/api/v1/login'); // 307 preserves the method and body
    } catch (error: unknown) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        return res.status(500).json({ error: 'Error registering user' });
    }
});

export default apiRouter;