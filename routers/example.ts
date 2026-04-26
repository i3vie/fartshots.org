// example router
import { Router } from 'express';
const router: Router = Router();

router.get('/', (req, res) => {
    res.send('Hello from the example router');
});

export default router;
