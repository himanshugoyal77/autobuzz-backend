import { uploadBase64Image, getBase64 } from "../utils/image-upload.js";

export const imageUploadFunction = async (imageUrl) => {
  try {
    const encoded_image = await getBase64(imageUrl);

    const uploadedImageUrl = await uploadBase64Image(encoded_image);
    console.log("Uploaded Image URL:", uploadedImageUrl);

    return uploadedImageUrl;
  } catch (error) {
    console.error("Error in image upload controller:", error);
    throw new Error("Image upload failed");
  }
};

export const imageUploadController = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required" });
    }
    const encoded_image = await getBase64(imageUrl);

    const uploadedImageUrl = await uploadBase64Image(encoded_image);
    console.log("Uploaded Image URL:", uploadedImageUrl);

    return res.status(200).json({ imageUrl: uploadedImageUrl });
  } catch (error) {
    console.error("Error in image upload controller:", error);
    throw new Error("Image upload failed");
  }
};

// getBase64(
//   "https://maisoli.in/cdn/shop/files/2_2775676b-7c9f-437d-a2c8-ff1a4d546827.jpg?v=1742798439&width=1445"
// )
//   .then((base64) => {
//     console.log("Base64 Encoded Image:", base64);
//     // You can now use the base64 string as needed, e.g., upload it to Cloudinary
//     uploadBase64Image(base64)
//       .then((url) => {
//         console.log("Image uploaded successfully:", url);
//       })
//       .catch((error) => {
//         console.error("Error uploading image:", error);
//       });
//   })
//   .catch((error) => {
//     console.error("Error fetching base64 image:", error);
//   });
