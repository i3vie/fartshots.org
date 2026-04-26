const express = require("express");
const crypto = require("crypto");
const { exec } = require("child_process");

const router = express.Router();

const SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const REPO = process.env.GITHUB_REPO; // "user/repo"
const BRANCH = process.env.GITHUB_BRANCH || "refs/heads/main";
const WORKDIR = process.env.DEPLOY_DIR;

// raw body capture for signature verification
router.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

function verifySignature(req) {
    const sig = req.headers["x-hub-signature-256"];
    if (!sig || !SECRET) return false;

    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(req.rawBody);

    const digest = "sha256=" + hmac.digest("hex");

    try {
        return crypto.timingSafeEqual(
            Buffer.from(sig),
            Buffer.from(digest)
        );
    } catch {
        return false;
    }
}

router.post("/", (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).send("nope");
    }

    if (req.body.repository?.full_name !== REPO) {
        return res.status(401).send("wrong repo");
    }

    if (req.body.ref !== BRANCH) {
        return res.status(401).send("wrong branch");
    }

    console.log("Deploy triggered");

    exec(
        `cd ${WORKDIR} && flock /tmp/deploy.lock -c "git pull && pm2 restart 0"`,
        (err, stdout, stderr) => {
            console.log(stdout);
            console.error(stderr);

            if (err) {
                return res.status(500).send("fail");
            }

            res.send("ok");
        }
    );
});

module.exports = router;