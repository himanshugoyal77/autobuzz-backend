import Product from "../schema/product.schema.js";

export const saveProductController = async (req, res) => {
  try {
    const productData = req.body.data; // Based on your payload structure
    const product = new Product(productData);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const deleteProductController = async (req, res) => {
  const { productId } = req.body;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

export const getProductByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const parsedCompanyId = Number(companyId);

    console.log(
      "Looking for company ID:",
      parsedCompanyId,
      "Type:",
      typeof parsedCompanyId
    );

    // Debug: Find one product to see the actual data structure
    const sampleProduct = await Product.findOne();
    console.log(
      "Sample product all_company_ids:",
      sampleProduct?.all_company_ids
    );
    console.log(
      "Sample product all_company_ids types:",
      sampleProduct?.all_company_ids?.map((id) => typeof id)
    );

    const products = await Product.find({
      all_company_ids: parsedCompanyId,
    }).sort({ created_on: -1 });

    console.log("Found products:", products.length);

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products by company ID:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getLatestProductController = async (req, res) => {
  try {
    const latestProduct = await Product.findOne().sort({ created_on: -1 });
    if (!latestProduct) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(latestProduct);
  } catch (err) {
    console.error("Error fetching latest product:", err);
    res.status(500).json({ message: "Failed to fetch latest product" });
  }
};

export const getLatestProductByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const parsedCompanyId = Number(companyId);

    console.log(
      "Looking for latest product for company ID:",
      parsedCompanyId,
      "Type:",
      typeof parsedCompanyId
    );

    const latestProduct = await Product.findOne({
      all_company_ids: parsedCompanyId,
    }).sort({ created_on: -1 });

    if (!latestProduct) {
      return res
        .status(404)
        .json({ message: "No products found for this company" });
    }

    res.status(200).json(latestProduct);
  } catch (err) {
    console.error("Error fetching latest product by company ID:", err);
    res.status(500).json({ message: "Failed to fetch latest product" });
  }
};
