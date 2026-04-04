/**
 * @see https://shopify.dev/docs/api/admin-rest/latest/resources/webhook — orders/create includes `cart_token` when linked to a cart checkout.
 * Draft order payloads may omit `cart_token`; optional `note_attributes` (name cart_token / cart_id) can carry it.
 */
export const extractCartTokenFromOrderWebhookPayload = (body) => {
  if (!body || typeof body !== "object") {
    return null;
  }
  const direct = body.cart_token;
  if (direct != null && String(direct).trim() !== "") {
    return String(direct).trim();
  }
  const attrs = body.note_attributes;
  if (!Array.isArray(attrs)) {
    return null;
  }
  for (const a of attrs) {
    const n = String(a?.name || "")
      .toLowerCase()
      .replace(/\s+/g, "_");
    if (n === "cart_token" || n === "cart_id" || n === "cartid") {
      const v = a?.value;
      if (v != null && String(v).trim() !== "") {
        const raw = String(v).trim();
        const gidMatch = raw.match(/^gid:\/\/shopify\/Cart\/([^?]+)/);
        return gidMatch ? gidMatch[1] : raw;
      }
    }
  }
  return null;
};
