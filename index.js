import { uploadImage, uploadBase64Image } from "./utils/image-upload.js";
import express from "express";
import cors from "cors";
import imageRoute from "./routes/image.route.js";
import productRoute from "./routes/product.route.js";
import {
  processProductForTitleAndDescription,
  enhanceProductWithAI,
  extractProductData,
} from "./productExtractor.js";
import Product from "./schema/product.schema.js";
import { imageUploadFunction } from "./controller/image.controller.js";

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", imageRoute);
app.use("/api/v1", productRoute);

app.get("/", (req, res) => {
  res.send("Welcome to the Image Upload API");
});

// export const getProductWithTitleDescription = async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const products = await Product.find({
//       all_company_ids: Number(companyId),
//     })
//       .sort({ created_on: -1 })
//       .limit(1);

//     if (!products || products.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No products found for this company" });
//     }

//     // Process products with Promise.all to wait for all async operations
//     const processedProducts = await Promise.all(
//       products.map(async (product) => {
//         try {
//           const { title, description, pricing, imageUrl, extractedData } =
//             processProductForTitleAndDescription(product.toObject());

//           console.log("image in getProductWithTitleDescription", imageUrl);

//           // Ensure title and description are not empty
//           if (!title || !description) {
//             return {
//               generatedTitle: "No title available",
//               generatedDescription: "No description available",
//               pricing: product.pricing,
//               imageUrl: product.media?.[0]?.url || "",
//             };
//           }

//           // Fix imageUrl assignment - you can't reassign a const
//           let finalImageUrl = imageUrl;
//           if (!finalImageUrl) {
//             finalImageUrl = product.media?.[0]?.url || "";
//           }

//           // Run image upload and AI enhancement in parallel for better performance
//           const [bannerAdImage, aiEnhancement] = await Promise.all([
//             imageUploadFunction(finalImageUrl),
//             enhanceProductWithAI({
//               extractedData,
//               title,
//               description,
//               pricing,
//             }),
//           ]);

//           const {
//             enhancedTitle: generatedTitle,
//             enhancedDescription: generatedDescription,
//           } = aiEnhancement;

//           console.log(
//             "Generated Title:",
//             generatedTitle,
//             "Generated Description:",
//             generatedDescription,
//             "Pricing:",
//             pricing,
//             "Banner Ad Image:",
//             bannerAdImage
//           );

//           return {
//             generatedTitle,
//             generatedDescription,
//             pricing,
//             bannerAdImage,
//           };
//         } catch (productError) {
//           console.error("Error processing individual product:", productError);
//           // Return fallback data for this product instead of failing completely
//           return {
//             generatedTitle: product.title || "Error generating title",
//             generatedDescription:
//               product.description || "Error generating description",
//             pricing: product.pricing,
//             bannerAdImage: product.media?.[0]?.url || "",
//             error: productError.message,
//           };
//         }
//       })
//     );

//     res.status(200).json(processedProducts);
//   } catch (err) {
//     console.error("Controller error:", err);
//     res.status(500).json({
//       message: "Failed to process products",
//       error: err.message,
//     });
//   }
// };

export const getProductWithTitleDescription = async (req, res) => {
  try {
    // Get product data from request body instead of database
    const { product } = req.body;

    // Validate that product data is provided
    if (!product) {
      return res.status(400).json({
        message: "Product data is required in request body",
      });
    }

    // Validate required product fields
    if (!product._id) {
      return res.status(400).json({
        message: "Product must have an _id field",
      });
    }

    console.log("Processing product from payload:", product._id);

    try {
      const { title, description, pricing, imageUrl, extractedData } =
        processProductForTitleAndDescription(product);

      console.log("Extracted data:", { title, description, pricing, imageUrl });

      // Ensure title and description are not empty
      if (!title || !description) {
        return res.status(200).json({
          generatedTitle: product.name || product.title || "No title available",
          generatedDescription:
            product.description || "No description available",
          pricing: product.pricing || {},
          imageUrl: product.media?.[0]?.url || "",
          message: "Used fallback data due to missing title/description",
        });
      }

      // Fix imageUrl assignment
      let finalImageUrl = imageUrl;
      if (!finalImageUrl) {
        finalImageUrl = product.media?.[0]?.url || "";
      }

      // Run image upload and AI enhancement in parallel for better performance
      const [bannerAdImage, aiEnhancement] = await Promise.all([
        imageUploadFunction(finalImageUrl),
        enhanceProductWithAI({
          extractedData,
          title,
          description,
          pricing,
        }),
      ]);

      const {
        enhancedTitle: generatedTitle,
        enhancedDescription: generatedDescription,
      } = aiEnhancement;

      console.log(
        "Generated Title:",
        generatedTitle,
        "Generated Description:",
        generatedDescription,
        "Pricing:",
        pricing,
        "Banner Ad Image:",
        bannerAdImage
      );

      const result = {
        generatedTitle,
        generatedDescription: generatedDescription,
        pricing,
        bannerAdImage: bannerAdImage || finalImageUrl,
      };

      res.status(200).json(result);
    } catch (productError) {
      console.error("Error processing product:", productError);

      // Return fallback data instead of failing completely
      res.status(200).json({
        generatedTitle:
          product.name || product.title || "Error generating title",
        generatedDescription:
          // add link to buy this product "https://fyndify.com/product/" + product._id,
          product.description +
            "\n\nBuy this product here: https://fyndify.com/product/" +
            product._id || "Error generating description",
        pricing: product.pricing || {},
        bannerAdImage: product.media?.[0]?.url || "",
        error: productError.message,
        message: "Processing failed, returning fallback data",
      });
    }
  } catch (err) {
    console.error("Controller error:", err);
    res.status(500).json({
      message: "Failed to process product",
      error: err.message,
    });
  }
};

app.post("/products/:companyId", getProductWithTitleDescription);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Database connected");
  } catch (err) {
    console.log(err);
  }
};

function deleteAllProducts() {
  Product.deleteMany({})
    .then(() => {
      console.log("All products deleted successfully");
    })
    .catch((err) => {
      console.error("Error deleting products:", err);
    });
}

app.listen(PORT, () => {
  connect();
  // Uncomment the line below to delete all products on server start
  //deleteAllProducts();
  console.log(`Server is running on port ${PORT}`);
});
