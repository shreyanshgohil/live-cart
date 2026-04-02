import mongoose from "mongoose";

const cartLineItemSchema = new mongoose.Schema(
  {
    title: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    lineAmount: Number,
    currencyCode: String,
    variantGid: String,
  },
  { _id: false }
);

const storefrontCartSnapshotSchema = new mongoose.Schema(
  {
    shopDomain: { type: String, required: true, index: true },
    cartGid: { type: String, required: true },
    customerEmail: String,
    customerPhone: String,
    customerName: String,
    totalAmount: Number,
    currencyCode: String,
    totalQuantity: Number,
    shopifyCartUpdatedAt: Date,
    status: { type: String, default: "Active" },
    items: [cartLineItemSchema],
    lastSyncedAt: Date,
  },
  {
    timestamps: { createdAt: "created_on", updatedAt: "updated_on" },
    autoIndex: true,
  }
);

storefrontCartSnapshotSchema.index({ shopDomain: 1, cartGid: 1 }, { unique: true });

export const storefrontCartSnapshotsSchema = mongoose.model(
  "storefront_cart_snapshots",
  storefrontCartSnapshotSchema
);
