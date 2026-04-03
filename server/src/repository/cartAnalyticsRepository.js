import axios from "axios";

/** Must match the Storefront API version your token was created for (Postman: 2024-01). */
const STOREFRONT_API_VERSION_PATH = "/api/2024-01";

const STOREFRONT_CART_QUERY = `
  query GetCartById($cartId: ID!) {
    cart(id: $cartId) {
      id
      updatedAt
      totalQuantity
      buyerIdentity {
        email
        phone
        customer {
          id
          displayName
          firstName
          lastName
          email
          phone
        }
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                sku
                product {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`;

const fetchCartFromStorefront = async ({ shopDomain, storefrontToken, cartId }) => {
  const endpoint = `https://${shopDomain}${STOREFRONT_API_VERSION_PATH}/graphql.json`;
  const response = await axios.post(
    endpoint,
    {
      query: STOREFRONT_CART_QUERY,
      variables: { cartId },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken,
      },
      validateStatus: () => true,
    }
  );

  if (response.status === 401) {
    const hint =
      typeof response.data === "string"
        ? response.data
        : response.data?.errors?.[0]?.message || JSON.stringify(response.data);
    throw new Error(`Storefront API 401 (check token + API version). ${hint}`);
  }

  if (response.status < 200 || response.status >= 300) {
    const body =
      typeof response.data === "string"
        ? response.data
        : response.data?.errors?.[0]?.message || JSON.stringify(response.data);
    throw new Error(`Storefront API HTTP ${response.status}: ${body}`);
  }

  return response.data;
};

export { fetchCartFromStorefront };

