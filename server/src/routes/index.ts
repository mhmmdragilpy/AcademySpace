import { Router } from 'express';
import authRoutes from './authRoutes.js';
import facilityRoutes from './facilityRoutes.js';
import facilityTypeRoutes from './facilityTypeRoutes.js';
import buildingRoutes from './buildingRoutes.js';
import reservationRoutes from './reservationRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/facilities', facilityRoutes);
router.use('/facility-types', facilityTypeRoutes);
router.use('/buildings', buildingRoutes);
router.use('/reservations', reservationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/ratings', ratingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);

export default router;
