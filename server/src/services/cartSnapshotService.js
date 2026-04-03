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
}) => {
  const normalizedCartId = normalizeCartId(cartId);
  const storefrontResponse = await fetchCartFromStorefront({
    shopDomain,
    storefrontToken: storefrontAccessToken,
    cartId: normalizedCartId,
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

const syncCartFromStorefront = async ({
  shopDomain,
  storefrontAccessToken,
  cartId,
}) => {
  const { cart } = await fetchStorefrontCartOrThrow({
    shopDomain,
    storefrontAccessToken,
    cartId,
  });

  const doc = snapshotDocFromStorefrontCart(shopDomain, cart);
  const saved = await upsertCartSnapshot(doc);
  return formatSnapshotForClient(saved);
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

export {
  buildGraphPayloadFromCart,
  fetchStorefrontCartOrThrow,
  listCartsForShop,
  normalizeCartId,
  syncCartFromStorefront,
};
