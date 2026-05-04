import { Router } from 'express';
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
        }
    });
});

// mount the api_router to /api within this router
import apiRouter from './api_router.ts';
router.use("/api", apiRouter);

export default router;