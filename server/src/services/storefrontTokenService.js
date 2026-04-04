import { shopify_call } from "shopify-call";
import config from "../config/config.js";
import {
  getStorefrontAccessTokensQuery,
  storefrontAccessTokenCreateMutation,
} from "../helper/graphql_query_template.js";

export const LIVE_CART_STOREFRONT_TOKEN_TITLE = "live cart";

const graphqlData = (result) => result?.response?.data;

/**
 * Reuses an existing delegate token titled "live cart", or creates one via Admin GraphQL.
 * Scopes on the token mirror the app’s granted unauthenticated_* scopes (not set on this mutation).
 */
export const ensureLiveCartStorefrontAccessToken = async (
  adminAccessToken,
  shopMyshopifyDomain,
) => {
  const endpoint = `${config.SHOPIFY_API_VERSION}/graphql.json`;

  const listRes = await shopify_call(
    adminAccessToken,
    shopMyshopifyDomain,
    endpoint,
    { query: getStorefrontAccessTokensQuery() },
    "POST",
  );
  if (listRes.status !== 200) {
    throw new Error(`List storefront tokens failed: HTTP ${listRes.status}`);
  }

  const edges = graphqlData(listRes)?.shop?.storefrontAccessTokens?.edges ?? [];
  const existing = edges
    .map((e) => e?.node)
    .find((n) => n?.title === LIVE_CART_STOREFRONT_TOKEN_TITLE);
  if (existing?.accessToken) {
    return { accessToken: existing.accessToken };
  }

  const createRes = await shopify_call(
    adminAccessToken,
    shopMyshopifyDomain,
    endpoint,
    {
      query: storefrontAccessTokenCreateMutation(),
      variables: {
        input: { title: LIVE_CART_STOREFRONT_TOKEN_TITLE },
      },
    },
    "POST",
  );
  if (createRes.status !== 200) {
    throw new Error(`Create storefront token failed: HTTP ${createRes.status}`);
  }

  const block = graphqlData(createRes)?.storefrontAccessTokenCreate;
  const userErrors = block?.userErrors ?? [];
  if (userErrors.length) {
    const msg = userErrors
      .map((e) => e?.message)
      .filter(Boolean)
      .join("; ");
    throw new Error(msg || "storefrontAccessTokenCreate userErrors");
  }

  const accessToken = block?.storefrontAccessToken?.accessToken;
  if (!accessToken) {
    throw new Error("storefrontAccessTokenCreate returned no accessToken");
  }
  return { accessToken };
};
