import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  url: String,
  type: String,
});

const productPublishSchema = new mongoose.Schema({
  is_set: Boolean,
  product_online_date: Date,
});

const returnConfigSchema = new mongoose.Schema({
  unit: String,
  time: Number,
  returnable: Boolean,
});

const customOrderSchema = new mongoose.Schema({
  manufacturing_time: Number,
  manufacturing_time_unit: String,
  is_custom_order: Boolean,
});

const netQuantitySchema = new mongoose.Schema({
  value: Number,
  unit: String,
});

const createdBySchema = new mongoose.Schema({
  user_id: String,
  super_user: Boolean,
  username: String,
});

const modifiedBySchema = new mongoose.Schema({
  user_id: String,
  super_user: Boolean,
  username: String,
});

const logoSchema = new mongoose.Schema({
  aspect_ratio: String,
  aspect_ratio_f: Number,
  url: String,
  secure_url: String,
});

const brandSchema = new mongoose.Schema({
  name: String,
  logo: logoSchema,
  uid: Number,
});

const identifierSchema = new mongoose.Schema({
  primary: Boolean,
  gtin_type: String,
  gtin_value: String,
});

const sizeSchema = new mongoose.Schema({
  brand_uid: Number,
  item_code: String,
  track_inventory: Boolean,
  price_transfer: Number,
  currency: String,
  _custom_json: Object,
  item_width: Number,
  seller_identifier: String,
  item_id: Number,
  price_effective: Number,
  is_set: Boolean,
  size: String,
  price: Number,
  item_weight: Number,
  item_dimensions_unit_of_measure: String,
  item_height: Number,
  company_id: Number,
  item_weight_unit_of_measure: String,
  created_on: Date,
  identifiers: [identifierSchema],
  modified_on: Date,
  item_length: Number,
  id: String,
});

const traderSchema = new mongoose.Schema({
  type: String,
  address: [String],
  name: String,
});

const taxIdentifierSchema = new mongoose.Schema({
  hsn_code_id: String,
  reporting_hsn: String,
  hsn_code: String,
});

const categoryLevelSchema = new mongoose.Schema({
  uid: Number,
  name: String,
});

const categorySchema = new mongoose.Schema({
  l1: categoryLevelSchema,
  l2: categoryLevelSchema,
  l3: categoryLevelSchema,
});

const productSchema = new mongoose.Schema({
  brand_uid: Number,
  item_code: String,
  product_group_tag: [String],
  country_of_origin: String,
  size_guide: String,
  product_publish: productPublishSchema,
  currency: String,
  media: [mediaSchema],
  _custom_json: Object,
  multi_size: Boolean,
  tags: [String],
  departments: [Number],
  short_description: String,
  is_set: Boolean,
  return_config: returnConfigSchema,
  item_type: String,
  no_of_boxes: Number,
  name: String,
  teaser_tag: Object,
  custom_order: customOrderSchema,
  description: String,
  is_image_less_product: Boolean,
  net_quantity: netQuantitySchema,
  category_slug: String,
  slug: String,
  highlights: [String],
  is_dependent: Boolean,
  variant_media: Object,
  template_tag: String,
  category_uid: Number,
  uid: Number,
  created_on: Date,
  modified_on: Date,
  created_by: createdBySchema,
  stage: String,
  id: String,
  variants: Object,
  modified_by: modifiedBySchema,
  all_company_ids: [Number],
  all_identifiers: [String],
  brand: brandSchema,
  sizes: [sizeSchema],
  is_expirable: Boolean,
  is_active: Boolean,
  trader: [traderSchema],
  tax_identifier: taxIdentifierSchema,
  category: categorySchema,
  attributes: Object,
});

export default mongoose.model("Product", productSchema);
