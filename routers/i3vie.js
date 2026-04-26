const express = require('express');
const router = express.Router();

// ring buffer for the last 10 messages
const messages = [];

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

module.exports = router;