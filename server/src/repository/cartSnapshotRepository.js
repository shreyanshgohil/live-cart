import { storefrontCartSnapshotsSchema } from "../database/storefrontCartSnapshots.js";

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Match snapshots whose cartGid is gid://shopify/Cart/{cartToken}?key=... or bare gid without query.
 * Order webhooks expose the same cart token as `cart_token` when checkout completed from a cart.
 */
const updateCartSnapshotStatusByCartToken = async (shopDomain, cartToken, status) => {
  if (!shopDomain || !cartToken) {
    return { modifiedCount: 0 };
  }
  const token = String(cartToken).trim();
  const re = new RegExp(`^gid://shopify/Cart/${escapeRegex(token)}(\\?|$)`);
  const res = await storefrontCartSnapshotsSchema.updateMany(
    { shopDomain, cartGid: re },
    { $set: { status, lastSyncedAt: new Date() } },
  );
  return { modifiedCount: res.modifiedCount };
};

const upsertCartSnapshot = async (doc) => {
  const { shopDomain, cartGid, ...rest } = doc;
  return storefrontCartSnapshotsSchema
    .findOneAndUpdate(
      { shopDomain, cartGid },
      {
        $set: {
          ...rest,
          shopDomain,
          cartGid,
          lastSyncedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    .lean();
};

const findCartSnapshotsByShopDomain = async (shopDomain) => {
  return storefrontCartSnapshotsSchema
    .find({ shopDomain })
    .sort({ shopifyCartUpdatedAt: -1 })
    .lean();
};

export {
  upsertCartSnapshot,
  findCartSnapshotsByShopDomain,
  updateCartSnapshotStatusByCartToken,
};
