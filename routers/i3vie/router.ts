import { Router } from 'express';
const router: Router = Router();
import { getSessionTokenFromRequest, getUserBySessionToken } from './session.ts';

interface Message {
    message: string;
    author: string;
}
// ring buffer for the last 10 messages
const messages: Message[] = [];

router.post('/message', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    const token = getSessionTokenFromRequest(req);
    if (!token) {
        return res.redirect('/i3vie/login');
    }

    // Verify the user session
    const user = await getUserBySessionToken(token);
    if (!user) {
        return res.redirect('/i3vie/login');
    }

    const author = user.username;

    // add the message to the buffer
    messages.push({ message, author });
    if (messages.length > 10) {
        messages.shift();
    }

    return res.redirect('/i3vie/miab');
});

router.get('/miab', async (req, res) => {
    const token = getSessionTokenFromRequest(req);
    if (!token) {
        return res.redirect('/i3vie/login');
    }

    const user = await getUserBySessionToken(token);
    if (!user) {
        return res.redirect('/i3vie/login');
    }

    return res.render("i3vie/message_in_a_bottle.ejs", { messages });
});

router.get('/fun_and_games', (req, res) => {
    res.render("i3vie/fun_and_games.ejs");
});

router.get('/login', (req, res) => {
    res.render("i3vie/login_register.ejs");
});

router.get('/register', (req, res) => {
    res.redirect('/i3vie/login');
});

router.get('/', (req, res) => {
    res.render("i3vie/index.ejs", {
        sites: {
            "message in a bottle": "/i3vie/miab",
            "login/register": "/i3vie/login",
            "fun and games": "/i3vie/fun_and_games"
        }
    });
});

// mount the api_router to /api within this router
import apiRouter from './api_router.ts';
router.use("/api", apiRouter);

export default router;
