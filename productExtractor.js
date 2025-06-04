import axios from "axios";
import { response } from "express";

const OPENROUTER_API_KEY =
  "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"; // Set your API key in environment variables
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "google/gemini-flash-1.5";

// Product data extractor function
function extractProductData(productPayload) {
  const product = productPayload;

  // Extract basic product information
  const basicInfo = {
    name: product.name || "",
    brand: product.brand?.name || "",
    itemCode: product.item_code || "",
    description: product.description || "",
    shortDescription: product.short_description || "",
    category: {
      l1: product.category?.l1?.name || "",
      l2: product.category?.l2?.name || "",
      l3: product.category?.l3?.name || "",
    },
    countryOfOrigin: product.country_of_origin || "",
    currency: product.currency || "",
    itemType: product.item_type || "",
  };

  // Extract pricing information
  const pricing = {
    price: product.sizes?.[0]?.price || 0,
    effectivePrice: product.sizes?.[0]?.price_effective || 0,
    currency: product.currency || "INR",
  };

  // Extract size and dimensions
  const sizeInfo = {
    size: product.sizes?.[0]?.size || "",
    multiSize: product.multi_size || false,
    dimensions: {
      length: product.sizes?.[0]?.item_length || 0,
      width: product.sizes?.[0]?.item_width || 0,
      height: product.sizes?.[0]?.item_height || 0,
      unit: product.sizes?.[0]?.item_dimensions_unit_of_measure || "",
      weight: product.sizes?.[0]?.item_weight || 0,
      weightUnit: product.sizes?.[0]?.item_weight_unit_of_measure || "",
    },
  };

  // Extract other useful attributes
  const attributes = {
    tags: product.tags || [],
    highlights: product.highlights || [],
    isActive: product.is_active || false,
    isSet: product.is_set || false,
    returnable: product.return_config?.returnable || false,
    returnDays: product.return_config?.time || 0,
    netQuantity: {
      value: product.net_quantity?.value || 0,
      unit: product.net_quantity?.unit || "",
    },
  };

  return {
    basicInfo,
    pricing,
    sizeInfo,
    attributes,
  };
}

// Function to generate product title
function generateProductTitle(extractedData) {
  const { basicInfo, pricing, sizeInfo } = extractedData;

  let title = "";

  // Start with brand if available
  if (basicInfo.brand && basicInfo.brand !== "Generic") {
    title += basicInfo.brand + " ";
  }

  // Add product name
  if (basicInfo.name) {
    title += basicInfo.name;
  }

  // Add size if available and meaningful
  if (sizeInfo.size && sizeInfo.size !== "OS") {
    title += ` - Size ${sizeInfo.size}`;
  }

  // Add category for context if product name is generic
  if (basicInfo.name && basicInfo.name.length < 15 && basicInfo.category.l3) {
    title += ` (${basicInfo.category.l3})`;
  }

  return title.trim();
}

// Function to generate product description
function generateProductDescription(extractedData) {
  const { basicInfo, pricing, sizeInfo, attributes } = extractedData;

  let description = "";

  // Start with existing description if available
  if (basicInfo.description) {
    description += basicInfo.description + "\n\n";
  } else if (basicInfo.shortDescription) {
    description += basicInfo.shortDescription + "\n\n";
  }

  // Add product details
  description += "Product Details:\n";

  if (basicInfo.brand && basicInfo.brand !== "Generic") {
    description += `• Brand: ${basicInfo.brand}\n`;
  }

  if (basicInfo.itemType) {
    description += `• Type: ${
      basicInfo.itemType.charAt(0).toUpperCase() + basicInfo.itemType.slice(1)
    }\n`;
  }

  if (basicInfo.countryOfOrigin) {
    description += `• Country of Origin: ${basicInfo.countryOfOrigin}\n`;
  }

  // Add size and dimensions
  if (sizeInfo.size) {
    description += `• Size: ${sizeInfo.size}\n`;
  }

  if (sizeInfo.dimensions.weight > 0) {
    description += `• Weight: ${sizeInfo.dimensions.weight} ${sizeInfo.dimensions.weightUnit}\n`;
  }

  if (
    sizeInfo.dimensions.length > 0 &&
    sizeInfo.dimensions.width > 0 &&
    sizeInfo.dimensions.height > 0
  ) {
    description += `• Dimensions: ${sizeInfo.dimensions.length} x ${sizeInfo.dimensions.width} x ${sizeInfo.dimensions.height} ${sizeInfo.dimensions.unit}\n`;
  }

  // Add net quantity
  if (attributes.netQuantity.value > 0) {
    description += `• Net Quantity: ${attributes.netQuantity.value} ${attributes.netQuantity.unit}\n`;
  }

  // Add return policy
  if (attributes.returnable) {
    description += `• Return Policy: ${attributes.returnDays} days return available\n`;
  }

  // Add highlights if available
  if (attributes.highlights && attributes.highlights.length > 0) {
    description += "\nKey Features:\n";
    attributes.highlights.forEach((highlight) => {
      description += `• ${highlight}\n`;
    });
  }

  // Add category information
  if (basicInfo.category.l1) {
    description += `\nCategory: ${basicInfo.category.l1}`;
    if (basicInfo.category.l2) {
      description += ` > ${basicInfo.category.l2}`;
    }
    if (basicInfo.category.l3) {
      description += ` > ${basicInfo.category.l3}`;
    }
    description += "\n";
  }

  return description.trim();
}

// Main function to process the product payload
function processProductForTitleAndDescription(productPayload) {
  const extractedData = extractProductData(productPayload);
  const title = generateProductTitle(extractedData);
  const description = generateProductDescription(extractedData);
  const imageUrl = productPayload.media?.[0]?.url || "";

  return {
    extractedData,
    title,
    description,
    extractedData,
    pricing: extractedData.pricing,
    imageUrl,
  };
}

async function enhanceProductWithAI(productData) {
  const { title, description, pricing, extractedData } = productData;

  const prompt = `
You are a professional e-commerce product copywriter. I need you to enhance the following product information to make it more appealing and SEO-friendly for online shoppers.

Current Product Information:
- Title: ${title}
- Description: ${description}
- Price: ₹${pricing.price} (Effective: ₹${pricing.effectivePrice})
- Brand: ${extractedData.basicInfo.brand}
- Category: ${extractedData.basicInfo.category.l1} > ${extractedData.basicInfo.category.l2} > ${extractedData.basicInfo.category.l3}
- Country of Origin: ${extractedData.basicInfo.countryOfOrigin}

Please provide:
1. An eye cathing product title that is catchy, SEO-friendly, and includes the brand name, product name, and size if applicable.
   - Example: "Stylish Cotton T-Shirt - Size M | BrandName"
2. A compelling product description (150-300 words) that includes:
   - a eye catching introduction and desciption of the product that contains the offer price, discount, etc.
   - Key features and benefits
   - Use cases or occasions
   - Material/quality highlights
   - Why customers should buy this product
   - EXAMPLE: "This stylish cotton t-shirt is perfect for casual outings and everyday wear. Made from high-quality cotton, it offers comfort and breathability. Available in multiple sizes, this t-shirt is a must-have for your wardrobe. avail it now at an unbeatable price of ₹${pricing.price} (Effective: ₹${pricing.effectivePrice}). Don't miss out on this limited-time offer!"

Format your response as JSON:
{
  "enhancedTitle": "your enhanced title here",
  "enhancedDescription": "your enhanced description here",
  "seoKeywords": ["keyword1", "keyword2", "keyword3"]
}

Example Response: {
  "enhancedTitle": "Sunshine Yellow Sandals - One Size Fits Most |  ₹900 (20% Off!)",
  "enhancedDescription": "Step into sunshine with these vibrant yellow sandals!  Originally priced at ₹1100, you can now snag these stylish beauties for just ₹900 – that's a 20% discount!  Perfect for adding a pop of color to your summer wardrobe, these sandals are crafted from lightweight, comfortable material (Please specify material here, e.g.,  soft leather, breathable canvas).  The one-size-fits-most design ensures a comfortable fit for most feet.  \n\nImagine yourself strolling along the beach, exploring a bustling market, or enjoying a casual lunch date – these versatile sandals are ideal for any summer occasion.  Their lightweight design makes them perfect for travel, and their cheerful yellow hue will brighten up any outfit.  \n\nMade in India with quality craftsmanship, these sandals offer exceptional value for their price.  Don't miss out on this fantastic deal!  Order your pair of Sunshine Yellow Sandals today and experience the perfect blend of style, comfort, and affordability.  Our 30-day return policy ensures a risk-free purchase. ",
  "seoKeywords": ["yellow sandals", "summer sandals", "women's sandals", "one size fits most", "Indian sandals", "affordable sandals", "summer fashion", "beach sandals", "casual sandals", "sale", "discount"]
}

give the response in JSON format only, without any additional text or markdown formatting. The response should not include any code blocks or special characters, just plain JSON.
`;

  try {
    const response = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: MODEL_NAME,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            type: "object",
            properties: {
              enhancedTitle: {
                type: "string",
                description: "Enhanced product title",
              },
              enhancedDescription: {
                type: "string",
                description: "Enhanced product description",
              },
              seoKeywords: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "SEO keywords for the product",
              },
            },
            required: ["enhancedTitle", "enhancedDescription"],
            additionalProperties: false,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Replace with your domain
          "X-Title": "Product Enhancement Service",
        },
      }
    );

    let aiResponse = response.data.choices[0].message.content;
    console.log("Raw AI Response:", aiResponse);

    // // Clean up the response - remove markdown code blocks if present
    aiResponse = aiResponse.trim();

    // Remove markdown code blocks
    if (aiResponse.startsWith("```json")) {
      aiResponse = aiResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (aiResponse.startsWith("```")) {
      aiResponse = aiResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // console.log("OpenRouter AI Response:", aiResponse);
    // Try to parse JSON response
    try {
      const enhancedData = JSON.parse(aiResponse);
      return {
        enhancedTitle: enhancedData.enhancedTitle || title,
        enhancedDescription: enhancedData.enhancedDescription || description,
        seoKeywords: enhancedData.seoKeywords || [],
      };
    } catch (parseError) {
      // If JSON parsing fails, return raw response
      return {
        enhancedTitle: title,
        enhancedDescription: aiResponse,
      };
    }
  } catch (error) {
    console.error(
      "OpenRouter AI Enhancement Error:",
      error.response?.data || error.message
    );
    return {
      enhancedTitle: title,
      enhancedDescription: description,
    };
  }
}

// Export functions for use in other files
export {
  extractProductData,
  generateProductTitle,
  generateProductDescription,
  processProductForTitleAndDescription,
  enhanceProductWithAI,
};
