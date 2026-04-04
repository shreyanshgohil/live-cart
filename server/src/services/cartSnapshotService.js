import { clientStoresSchema } from "../database/clientStores.js";
import { fetchCartFromStorefront } from "../repository/cartAnalyticsRepository.js";
import {
  findCartSnapshotsByShopDomain,
  upsertCartSnapshot,
} from "../repository/cartSnapshotRepository.js";

const normalizeCartId = (cartId) => {
  if (!cartId) {
    return "";
  }
  if (String(cartId).startsWith("gid://shopify/Cart/")) {
    return cartId;
  }
  return `gid://shopify/Cart/${cartId}`;
};

const guestNameFromEmail = (email) => {
  if (!email || email === "Not available") {
    return "Guest";
  }
  const local = email.split("@")[0];
  return local ? local.replace(/[._-]+/g, " ") : "Guest";
};

/**
 * Guest checkout often leaves buyerIdentity.email/phone empty; logged-in customers
 * are usually on buyerIdentity.customer (displayName, email, etc.).
 */
const resolveBuyerFromCart = (cart) => {
  const bi = cart?.buyerIdentity || {};
  const c = bi.customer || {};

  const email =
    (bi.email && String(bi.email).trim()) ||
    (c.email && String(c.email).trim()) ||
    "";

  const phone =
    (bi.phone && String(bi.phone).trim()) ||
    (c.phone && String(c.phone).trim()) ||
    "";

  const displayName = (c.displayName && String(c.displayName).trim()) || "";
  const first = (c.firstName && String(c.firstName).trim()) || "";
  const last = (c.lastName && String(c.lastName).trim()) || "";
  const nameFromParts = [first, last].filter(Boolean).join(" ").trim();

  let customerName = displayName || nameFromParts;
  if (!customerName && email) {
    customerName = guestNameFromEmail(email);
  }
  if (!customerName) {
    customerName = "Guest";
  }

  return {
    customerEmail: email || "Not available",
    customerPhone: phone || "Not available",
    customerName,
    customerGid: c.id || "",
  };
};

const mapStorefrontCartToLineItems = (cart) => {
  return (cart?.lines?.edges || []).map((edge) => {
    const node = edge?.node || {};
    const productTitle =
      node?.merchandise?.product?.title || "Untitled product";
    const variantTitle = node?.merchandise?.title || "";
    const quantity = Number(node?.quantity || 0);
    const lineAmount = Number(node?.cost?.totalAmount?.amount || 0);
    const currencyCode =
      node?.cost?.totalAmount?.currencyCode ||
      cart?.cost?.totalAmount?.currencyCode ||
      "USD";
    const unitPrice = quantity > 0 ? lineAmount / quantity : lineAmount;

    return {
      variantGid: node?.merchandise?.id || "",
      title: variantTitle ? `${productTitle} (${variantTitle})` : productTitle,
      sku: node?.merchandise?.sku || "—",
      quantity,
      unitPrice,
      lineAmount,
      currencyCode,
    };
  });
};

const buildGraphPayloadFromCart = (cart, fallbackCartGid) => {
  const lineItems = mapStorefrontCartToLineItems(cart).map((row) => ({
    id: row.variantGid,
    label: row.title,
    quantity: row.quantity,
    lineAmount: row.lineAmount,
    currencyCode: row.currencyCode,
  }));

  const buyer = resolveBuyerFromCart(cart);

  return {
    cartId: cart?.id || fallbackCartGid,
    customerEmail: buyer.customerEmail,
    customerPhone: buyer.customerPhone,
    totalQuantity: Number(cart?.totalQuantity || 0),
    totalAmount: Number(cart?.cost?.totalAmount?.amount || 0),
    currencyCode: cart?.cost?.totalAmount?.currencyCode || "USD",
    updatedAt: cart?.updatedAt || "",
    graph: lineItems,
  };
};

/**
 * Maps Admin REST-style cart payloads from carts/create and carts/update webhooks
 * (online store carts only) into the same snapshot shape as Storefront API sync.
 * @see https://shopify.dev/docs/api/admin-rest/latest/resources/webhook
 */
const snapshotDocFromAdminCartWebhook = (shopDomain, body) => {
  const lineItems = body?.line_items || [];
  const first = lineItems[0];
  const currencyCode =
    first?.line_price_set?.shop_money?.currency_code ||
    first?.discounted_price_set?.shop_money?.currency_code ||
    "USD";

  let cartGid = body?.admin_graphql_api_id;
  if (!cartGid && body?.id != null && body.id !== "") {
    const raw = String(body.id);
    cartGid = raw.startsWith("gid://") ? raw : `gid://shopify/Cart/${raw}`;
  }
  if (!cartGid) {
    throw new Error("Cart id missing in webhook payload");
  }

  const totalQuantity = lineItems.reduce(
    (sum, li) => sum + Number(li.quantity || 0),
    0,
  );
  const totalAmount = lineItems.reduce(
    (sum, li) => sum + Number(li.line_price || 0),
    0,
  );

  const c = body?.customer || {};
  const email =
    (body?.email && String(body.email).trim()) ||
    (c.email && String(c.email).trim()) ||
    "";
  const phone =
    (body?.phone && String(body.phone).trim()) ||
    (c.phone && String(c.phone).trim()) ||
    "";

  const displayName =
    c.first_name || c.last_name
      ? [c.first_name, c.last_name].filter(Boolean).join(" ").trim()
      : "";
  let customerName = displayName;
  if (!customerName && email) {
    customerName = guestNameFromEmail(email);
  }
  if (!customerName) {
    customerName = "Guest";
  }

  const items = lineItems.map((li) => {
    const qty = Number(li.quantity || 0);
    const lineAmount = Number(li.line_price || 0);
    const unitPrice = qty > 0 ? lineAmount / qty : lineAmount;
    const liCurrency =
      li.line_price_set?.shop_money?.currency_code || currencyCode;
    const variantGid =
      li.variant_admin_graphql_api_id ||
      (li.variant_id != null
        ? `gid://shopify/ProductVariant/${li.variant_id}`
        : "");

    return {
      variantGid,
      title: li.title || "Untitled",
      sku: li.sku || "—",
      quantity: qty,
      unitPrice,
      lineAmount,
      currencyCode: liCurrency,
    };
  });

  return {
    shopDomain,
    cartGid,
    customerEmail: email || "Not available",
    customerPhone: phone || "Not available",
    customerName,
    totalAmount,
    currencyCode,
    totalQuantity,
    shopifyCartUpdatedAt: body.updated_at
      ? new Date(body.updated_at)
      : new Date(),
    status: "Active",
    items,
  };
};

const snapshotDocFromStorefrontCart = (shopDomain, cart) => {
  const cartGid = cart?.id;
  const buyer = resolveBuyerFromCart(cart);
  const items = mapStorefrontCartToLineItems(cart);

  return {
    shopDomain,
    cartGid,
    customerEmail: buyer.customerEmail,
    customerPhone: buyer.customerPhone,
    customerName: buyer.customerName,
    totalAmount: Number(cart?.cost?.totalAmount?.amount || 0),
    currencyCode: cart?.cost?.totalAmount?.currencyCode || "USD",
    totalQuantity: Number(cart?.totalQuantity || 0),
    shopifyCartUpdatedAt: cart?.updatedAt
      ? new Date(cart.updatedAt)
      : new Date(),
    status: "Active",
    items,
  };
};

const fetchStorefrontCartOrThrow = async ({
  shopDomain,
  storefrontAccessToken,
  cartId,
  key,
}) => {
  const normalizedCartId = normalizeCartId(cartId);
  const storefrontResponse = await fetchCartFromStorefront({
    shopDomain,
    storefrontToken: storefrontAccessToken,
    cartId: normalizedCartId,
    key,
  });

  if (storefrontResponse?.errors?.length) {
    throw new Error(
      storefrontResponse.errors[0]?.message || "Storefront API error",
    );
  }

  const cart = storefrontResponse?.data?.cart;
  if (!cart) {
    throw new Error("Cart not found for the given cart ID");
  }

  return { cart, normalizedCartId };
};

const formatSnapshotForClient = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: row.cartGid,
    cartGid: row.cartGid,
    customerName: row.customerName || guestNameFromEmail(row.customerEmail),
    email: row.customerEmail,
    phone: row.customerPhone,
    totalAmount: row.totalAmount,
    currency: row.currencyCode,
    itemCount: row.totalQuantity,
    updatedAt: row.shopifyCartUpdatedAt,
    status: row.status,
    items: (row.items || []).map((item) => ({
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
      price: item.unitPrice,
      lineTotal: item.lineAmount,
    })),
    graph: (row.items || []).map((item) => ({
      id: item.variantGid || item.title,
      label: item.title,
      quantity: item.quantity,
      lineAmount: item.lineAmount,
      currencyCode: item.currencyCode || row.currencyCode,
    })),
  };
};

const listCartsForShop = async (shopDomain) => {
  const rows = await findCartSnapshotsByShopDomain(shopDomain);
  return rows.map(formatSnapshotForClient);
};

const buildStorefrontCartIdFromAdminWebhookBody = (body) => {
  const token = body?.token ?? body?.id;
  if (token == null || String(token).trim() === "") {
    throw new Error("Cart token missing in webhook payload");
  }
  const tokenStr = String(token).trim();
  const rawKey = body?.line_items?.[0]?.key;
  if (rawKey == null || String(rawKey).trim() === "") {
    throw new Error("line_items[0].key missing in webhook payload");
  }
  let keyParam = String(rawKey).trim();
  const colon = keyParam.indexOf(":");
  if (colon !== -1) {
    keyParam = keyParam.slice(colon + 1).trim();
  }
  if (!keyParam) {
    throw new Error("Could not derive cart key from line_items[0].key");
  }
  return `gid://shopify/Cart/${tokenStr}?key=${keyParam}`;
};

const syncCartSnapshotFromAdminCartWebhook = async (shopDomain, body) => {
  const cartGid = buildStorefrontCartIdFromAdminWebhookBody(body);
  const store = await clientStoresSchema
    .findOne(
      { store_name: shopDomain, status: "1" },
      { storefront_access_token: 1 },
    )
    .lean();
  const storefrontAccessToken = store?.storefront_access_token;
  if (!storefrontAccessToken) {
    throw new Error(
      "storefront_access_token missing for shop; reinstall app or complete OAuth",
    );
  }
  const { cart } = await fetchStorefrontCartOrThrow({
    shopDomain,
    storefrontAccessToken,
    cartId: cartGid,
    key: body.line_items[0].key,
  });
  const doc = snapshotDocFromStorefrontCart(shopDomain, cart);
  await upsertCartSnapshot(doc);
};

export {
  buildGraphPayloadFromCart,
  buildStorefrontCartIdFromAdminWebhookBody,
  fetchStorefrontCartOrThrow,
  listCartsForShop,
  normalizeCartId,
  snapshotDocFromAdminCartWebhook,
  syncCartSnapshotFromAdminCartWebhook,
};
