export const getThemeDataQuery = () => (
    `query getThemeData {
      themes(first: 100) {
        edges {
          node {
            id
            role
            name
          }
        }
      }
    }`
)

export const getShopDataQuery = () => (
    `{
      shop {
        name
        id
        email
        plan {
          displayName
        }
        myshopifyDomain
        shopOwnerName
        currencyCode
        currencyFormats {
          moneyFormat
        }
        billingAddress {
          address1
          address2
          city
          country
          phone
          province
          zip
        }
        timezoneOffset
        ianaTimezone
        primaryDomain {
          host
          url
          localization {
            defaultLocale
          }
        }
      }
    }`
)

export const webhoookSubscritionCreate = () => (
    `mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
        webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription {
                id
            }
            userErrors {
                field
                message
            }
        }
    }`
)

export const appSubscriptionCreate = () => (
    `mutation AppSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int!, $test: Boolean!) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems,trialDays: $trialDays,test: $test) {
        userErrors {
          field
          message
        }
        appSubscription {
          id
        }
        confirmationUrl
      }
    }`
)

export const appSubscriptionCancel = () => (
    `mutation AppSubscriptionCancel($id: ID!, $prorate: Boolean!) {
      appSubscriptionCancel(id: $id, prorate: $prorate) {
        appSubscription {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }`
)

export const addShopMetafield = () => (
    `mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
      id
      ownerType
      type
    }
    userErrors {
      field
      message
      code
    }
  }
}`
)

export const gettingShopMetafield = () => (
    `{
      shop {
        metafield(namespace: "mg_currency_converter", key: "currency_data") {
          id
          value
          type
          namespace
          key
        }
      }
    }`
)

export const gettingPriorityMetafield = () => (
    `{
      shop {
        metafield(namespace: "dynamic_price", key: "priority") {
          id
          value
          type
          namespace
          key
        }
      }
    }`
)


export const gettingAllProductFromShopifyFn = () => (
    `mutation bulkOperationRunQuery {
          bulkOperationRunQuery(
            query: """
              {
                products {
                  edges {
                    node {
                      id
                      handle
                      status
                      variants {
                        edges {
                          node {
                            id
                            title
                            metafields(namespace: "dynamic_price") {
                              edges {
                                node {
                                  id
                                  key
                                  namespace
                                  value
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            """
          ) {
            bulkOperation {
              id
              partialDataUrl
              type
              url
            }
            userErrors {
              code
              field
              message
            }
          }
        }`
)

export const gettingRunningBulkQueru = () => (
    `query MyQuery {
      currentBulkOperation(type: QUERY) {
        id
        partialDataUrl
        url
      }
    }`
)

export const stageUploadMutuation = () => (
    `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }
  `
)

export const metafieldsSetMutation = () => (`
mutation call($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}
`);

export const bulkQueryMutation = () => (
    `mutation bulkOperationRunMutation(
      $mutation: String!,
      $stagedUploadPath: String!
    ) {
      bulkOperationRunMutation(
        mutation: $mutation,
        stagedUploadPath: $stagedUploadPath
      ) {
        bulkOperation {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `
)

export const metafieldsDeleteMutation = () => (
    `mutation MetafieldsDelete($metafields: [MetafieldIdentifierInput!]!) {
      metafieldsDelete(metafields: $metafields) {
        deletedMetafields {
          key
          namespace
          ownerId
        }
        userErrors {
          field
          message
        }
      }
    }`
)

export const themFileGet = () => (
    `query ThemeFiles($themeId: ID!, $filenames: [String!]!) {
              theme(id: $themeId) {
                files(filenames: $filenames) {
                  nodes {
                    body {
                      ... on OnlineStoreThemeFileBodyBase64 {
                        contentBase64
                      }
                      ... on OnlineStoreThemeFileBodyText {
                        content
                      }
                      ... on OnlineStoreThemeFileBodyUrl {
                        url
                      }
                    }
                    checksumMd5
                    contentType
                    createdAt
                    filename
                    size
                    updatedAt
                  }
                  userErrors {
                    code
                    filename
                  }
                }
              }
            }`
)

export const addSnippetOnTheme = () => (
    `mutation themeFilesUpsert($files: [OnlineStoreThemeFilesUpsertFileInput!]!, $themeId: ID!) {
              themeFilesUpsert(files: $files, themeId: $themeId) {
                upsertedThemeFiles {
                  filename
                }
                userErrors {
                  field
                  message
                  code
                }
              }
            }`
)

export const cartTransFormCreate = () => (
    `mutation cartTransformCreate($functionId: String!, $blockOnFailure: Boolean) {
      cartTransformCreate(functionId: $functionId, blockOnFailure: $blockOnFailure) {
        cartTransform {
          id
          functionId
        }
        userErrors {
          field
          message
        }
      }
    }`
)

export const draftOrderCreateMutation = () => (
    `mutation draftOrderCreate($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder {
          id
          invoiceUrl
        }
      }
    }`
)

export const getOrderQuery = () => (
    `query getOrders($first: Int!, $after: String, $createdAt: String) {
  orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true, query: $createdAt) {
    edges {
      cursor
      node {
        id
        name
        createdAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        subtotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 50) {
          edges {
            node {
              id
              name
              quantity
              originalUnitPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customAttributes {
                key
                value
              }
            }
          }
        }
        customer {
          id
          firstName
          lastName
          email
        }
        displayFulfillmentStatus
        displayFinancialStatus
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}           
`
)

export const validateProductsQuery = () => (
    `query validateProducts($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          isGiftCard
          productType
          tags
          bundleComponents(first: 10) {
            edges {
              cursor
              node {
                quantity
              }
            }
          }
          sellingPlanGroups(first: 1) {
            edges { 
              node { 
                id 
              } 
            }
          }
        }
      }
    }`
)
