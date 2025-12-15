import { Router } from "express";
import { getAllFacilityTypes } from "../controllers/facilityTypeController.js";

const router = Router();

router.get("/", getAllFacilityTypes);

export default router;
