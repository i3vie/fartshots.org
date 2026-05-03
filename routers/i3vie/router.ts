import { Router } from 'express';
import { sequelize, User } from './db.ts';
import { hash, compare } from 'bcrypt';
import { normalizeUsername } from './helper.ts';
import { UniqueConstraintError } from 'sequelize';
const router: Router = Router();

interface Message {
    message: string;
    author: string;
}
// ring buffer for the last 10 messages
const messages: Message[] = [];

router.post('/message', (req, res) => {
    const { message, author } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    if (!author) {
        return res.status(400).json({ error: 'Author is required' });
    }

    // add the message to the buffer
    messages.push({ message, author });
    if (messages.length > 10) {
        messages.shift();
    }

    res.redirect('/i3vie/miab');
});

router.get('/miab', (req, res) => {
    res.render("i3vie/message_in_a_bottle.ejs", { messages });
});

router.post('/api/login', async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    username = normalizeUsername(String(username));

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
        return res.status(500).json({ error: 'Internal server error' });
    }

    res.json({ message: 'Login successful' });
});

router.post('/api/register', async (req, res) => {
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
        res.json({ message: 'Registration successful', userId: user.id });
    } catch (error: unknown) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        return res.status(500).json({ error: 'Error registering user' });
    }
});

router.get('/', (req, res) => {
    res.render("i3vie/index.ejs", {
        sites: {
            "message in a bottle": "/i3vie/miab",
        }
    });
});

export default router;