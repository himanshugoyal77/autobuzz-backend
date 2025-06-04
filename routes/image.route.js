import express from "express";
import { imageUploadController } from "../controller/image.controller.js";

const router = express.Router();

// Route to handle image upload
router.post("/generate-image", imageUploadController);

// Export the router
export default router;
