import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "h-forum-82025840",
  api_key: "189953695355398",
  api_secret: "Z4XE2EbSXmUtXvR44qa0MXtMtuc",
});

export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "h-forum",
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const uploadBase64Image = async (base64Image) => {
  try {
    // Ensure base64 is prefixed correctly (required by Cloudinary)
    const dataUri = `data:image/jpeg;base64,${base64Image}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "h-forum",
      resource_type: "image",
    });

    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Image deletion failed");
  }
};

export const getImageUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: "image",
    secure: true,
  });
};

export const getBase64 = async (image) => {
  const formData = new FormData();
  formData.append(
    "prompt",
    "generate a premium quality advertisement image for a new product launch of the attached image. Add text elements like 'buy now!', make it eye catching and fansy. Do not add any text in the image except 'buy now', just generate a premium quality advertisement image with the attached image as the main product focus."
  );
  formData.append("model", "google/gemini-2.0-flash-exp:free");
  formData.append("quality", "auto");

  // Add your image files (up to 16)
  const imageFile1 = await fetch(image).then((r) => r.blob());
  formData.append("image[]", imageFile1);

  const response = await fetch(
    "https://ir-api.myqa.cc/v1/openai/images/edits",
    {
      method: "POST",
      headers: {
        Authorization:
          "Bearer e2745688600103bd2eca0d49ab3898fda71ce39f37a2d710867948f7f9df69c0",
      },
      body: formData,
    }
  );

  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const encoded_image = data.data[0].b64_json;
  return encoded_image;
};

// // upload image to cloudinary and return the URL
// uploadImage("download.jpg")
//   .then((url) => {
//     console.log("Image uploaded successfully:", url);
//   })
//   .catch((error) => {
//     console.error("Error uploading image:", error);
//   });
