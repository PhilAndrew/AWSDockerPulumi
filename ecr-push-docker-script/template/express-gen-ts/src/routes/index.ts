import { Router } from 'express';
import UserRouter from './Users';
import LogRouter from './Logs';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/logs', LogRouter);

// Export the base-router
export default router;
