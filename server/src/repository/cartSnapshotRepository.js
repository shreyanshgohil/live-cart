import { storefrontCartSnapshotsSchema } from "../database/storefrontCartSnapshots.js";

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

export { upsertCartSnapshot, findCartSnapshotsByShopDomain };
