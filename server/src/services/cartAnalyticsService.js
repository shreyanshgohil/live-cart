import {
  buildGraphPayloadFromCart,
  fetchStorefrontCartOrThrow,
} from "./cartSnapshotService.js";

const STATIC_SHOP_DOMAIN = "text-to-audio.myshopify.com";
const STATIC_CART_ID = "hWNADpbnWHMSl2r6HMm4cQdN";
/** Same token as Postman X-Shopify-Storefront-Access-Token; move to env later */
const STATIC_STOREFRONT_TOKEN = "68075787b6aecca4483ff394c240d793";

const getStaticCartAnalytics = async () => {
  const { cart, normalizedCartId } = await fetchStorefrontCartOrThrow({
    shopDomain: STATIC_SHOP_DOMAIN,
    storefrontAccessToken: STATIC_STOREFRONT_TOKEN,
    cartId: STATIC_CART_ID,
  });

  return buildGraphPayloadFromCart(cart, normalizedCartId);
};

export { getStaticCartAnalytics };

