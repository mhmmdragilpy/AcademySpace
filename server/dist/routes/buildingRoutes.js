import { Router } from 'express';
import { getAllBuildings } from '../controllers/buildingController.js';
const router = Router();
router.get('/', getAllBuildings);
export default router;
//# sourceMappingURL=buildingRoutes.js.map