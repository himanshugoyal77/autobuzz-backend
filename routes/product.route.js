import express from "express";
import {
  saveProductController,
  getLatestProductController,
  getProductByCompanyIdController,
  getLatestProductByCompanyIdController,
} from "../controller/product.controller.js"; // Adjust the path if needed

const router = express.Router();

// Save a new product
router.post("/saveProduct", saveProductController);

// Get products by company ID
router.get(
  "/getProductByCompanyId/:companyId",
  getProductByCompanyIdController
);

// Get the latest product (by created_on)
router.get("/getLatestProduct", getLatestProductController);

// Get the latest product by company ID
router.get(
  "/getLatestProductByCompanyId/:companyId",
  getLatestProductByCompanyIdController
);

export default router;
