import config from '../config/config.js';
import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';
import {handleSuccess,handleError} from '../helper/response_handler.js';
import {clientStoresSchema} from "../database/clientStores.js";
import {
    addShopMetafield, appSubscriptionCreate,
    getShopDataQuery,
    getThemeDataQuery,
    gettingShopMetafield,
    webhoookSubscritionCreate,
    cartTransFormCreate
} from "../helper/graphql_query_template.js";
import {shopify_call} from 'shopify-call';
import common from "common-utils";
import {v4 as uuidv4} from "uuid";
import {escapeHtml, unescapeHTML} from "../helper/db_functions.js";

const shopifyAuth = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SCOPES.split(','),
    hostName: process.env.HOST.replace(/https:\/\//, ''),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
});


const firtShopify = async (req, res) => {
    const {status_code_config: statusCode, en_message_config: en} = config;
    const shop = req.query?.shop;
    const host = req.query?.host;
    try {
        if (shop) {
            let shopdData = await clientStoresSchema.findOne({ store_name: shop,  status: '1'} ,{ store_name : 1,shop_plan:1, charge_app : 1,trial_days: 1 , token : 1 });
            if (!shopdData) {
                await shopifyAuth.auth.begin({
                    shop: req.query.shop,
                    callbackPath: '/api/auth/callback',
                    isOnline: false,
                    rawRequest: req,
                    rawResponse: res,
                });
            } else {
                // res.send("Hello")
                const redirectUrl = `${config.editor_url}?shop=${shop}&host=${host}`;
                res.redirect(redirectUrl);

                /*if(shopdData?.charge_app){
                    // res.send("Hello");
                    const redirectUrl = `${config.editor_url}?shop=${shop}&host=${host}`;
                    res.redirect(redirectUrl);
                }else{
                    let redirectUrl = `${process.env.HOST}/api/success-plan?shop=${shopdData?.store_name}&host=${host}`;
                    let trialDays = shopdData?.trial_days;
                    let testStore = false;
                    if(shopdData?.shop_plan?.includes('Developer Preview')){
                        testStore = true;
                    }
                    if(trialDays === undefined || trialDays === null || trialDays === "null" || trialDays === "undefined" || trialDays === "false" || trialDays === false){
                        trialDays = 7;
                    }else{
                        if(!Number(trialDays)){
                            trialDays = 0;
                        }
                    }
                    if(trialDays <= 0){
                        trialDays = 0;
                    }

                    let payload = {
                        query: appSubscriptionCreate(),
                        variables: {
                            "name": "MG Currency Convert Plan",
                            "returnUrl": redirectUrl,
                            "test" : testStore,
                            "trialDays" : trialDays,
                            "lineItems": [
                                {
                                    "plan": {
                                        "appRecurringPricingDetails": {
                                            "price": {
                                                "amount": 4.99,
                                                "currencyCode": "USD"
                                            },
                                            "interval": "EVERY_30_DAYS"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                    let appSubscriptionCreateShopifyCall  = await shopify_call(shopdData?.token, shopdData?.store_name, `${config.SHOPIFY_API_VERSION}/graphql.json`, payload, 'POST');
                    if(appSubscriptionCreateShopifyCall?.status === 200 && !appSubscriptionCreateShopifyCall?.response?.data?.appSubscriptionCreate?.userErrors?.length){
                        let redirectUrl = appSubscriptionCreateShopifyCall?.response?.data?.appSubscriptionCreate?.confirmationUrl;
                        if(redirectUrl){
                            res.send(`
                                <script>
                                  if (window.top) {
                                    window.top.location.href = '${redirectUrl}';
                                  } else {
                                    window.location.href = '${redirectUrl}';
                                  }
                                </script>
                                `);
                        }else{
                            let redirectUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?shop=${shop}`;
                            res.send(`
                                <script>
                                  if (window.top) {
                                    window.top.location.href = '${redirectUrl}';
                                  } else {
                                    window.location.href = '${redirectUrl}';
                                  }
                                </script>
                                `);

                        }
                    }else {
                        let redirectUrl = `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?shop=${shop}`;
                        res.send(`
                                <script>
                                  if (window.top) {
                                    window.top.location.href = '${redirectUrl}';
                                  } else {
                                    window.location.href = '${redirectUrl}';
                                  }
                                </script>
                                `);
                    }
                }*/
            }
        } else {
            handleError(statusCode.OK, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (err) {
        console.log(err, 'error');
        handleError(statusCode.OK, en.ERROR_SOMETHING_WRONG, res);
    }
}

const successPlanFn = async (req, res) => {
    const {status_code_config: statusCode, en_message_config: en} = config;
    const shop = req.query?.shop;
    const chargeId = req.query?.charge_id;
    try {
        if (shop && chargeId) {
            let update_data = {
                'charge_id': chargeId,
                'charge_app': true,
            }
            await clientStoresSchema.updateOne({ store_name: shop }, {
                $set: update_data
            });
            res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}?shop=${shop}`);
        }else{
            handleError(statusCode.OK, en.ERROR_SOMETHING_WRONG, res)
        }
    } catch (err) {
        console.log(err, 'error');
        handleError(statusCode.OK, en.ERROR_SOMETHING_WRONG, res);
    }
}

const shopifyCallbackFn = async (req, res) => {
    let {status_code_config: statusCode, en_message_config: en} = config;
    try {
        const {session} = await shopifyAuth.auth.callback({
            rawRequest: req,
            rawResponse: res
        });
        let host = req?.query?.host;
        if (session?.shop && session.scope) {
            let shop = session?.shop;
            const {SHOPIFY_API_KEY, HOST, SITE_WEBHOOK_PREFIX} = process.env;
            if (session?.accessToken) {
                const access_token = session.accessToken;
                let shopQuery = {query: getShopDataQuery()}
                let themeQuery = {query: getThemeDataQuery()}
                let [themeDataShopifyCall, shopDataShopifyCall] = await Promise.all([shopify_call(access_token, shop, `${config.SHOPIFY_API_VERSION}/graphql.json`, themeQuery, 'POST'), shopify_call(access_token, shop, `${config.SHOPIFY_API_VERSION}/graphql.json`, shopQuery, 'POST')])
                if (themeDataShopifyCall?.response?.data && shopDataShopifyCall?.response?.data) {
                    let themeId = '';
                    let themeData = themeDataShopifyCall?.response?.data?.themes?.edges;
                    themeData = themeData?.find(themes => themes?.node?.role === 'MAIN');
                    if (themeData?.node?.id) {
                        themeId = themeData?.node?.id?.replace('gid://shopify/OnlineStoreTheme/', '');
                    }
                    let shopData = shopDataShopifyCall?.response?.data?.shop;
                    let date = common.date_format('Y-m-d H:i:s');
                    let shop_data = {
                        store_client_id : uuidv4(),
                        shopify_store_id: shopData?.id?.replace('gid://shopify/Shop/', '') || '',
                        email: shopData?.email || '',
                        app_language: "en",
                        theme_language: shopData?.primaryDomain?.localization?.defaultLocale || '',
                        store_name: shopData?.myshopifyDomain,
                        shop_name: shopData?.name,
                        shop_plan: shopData?.plan?.displayName,
                        shop_owner: shopData?.shopOwnerName,
                        address1: shopData?.billingAddress?.address1,
                        address2: shopData?.billingAddress?.address2,
                        city: shopData?.billingAddress?.city,
                        country_name: shopData?.billingAddress?.country,
                        phone: shopData?.billingAddress?.phone,
                        province: shopData?.billingAddress?.province,
                        zip: shopData?.billingAddress?.zip,
                        timezone: shopData?.timezoneOffset,
                        iana_timezone: shopData?.ianaTimezone,
                        domain: shopData?.primaryDomain?.host,
                    };
                    let updateFields = {
                        install_date : date,
                        status : '1',
                        app_status : '0',
                        token : access_token,
                        store_theme_id : themeId,
                        money_format: unescapeHTML(shopData?.currencyFormats?.moneyFormat),
                        currency: shopData?.currencyCode || '',
                    };
                    let insertData = await clientStoresSchema.updateOne({ store_name: shopData?.myshopifyDomain },
                        {
                            $set: updateFields,
                            $setOnInsert: shop_data,
                        },
                        {
                            upsert : true,
                            new : true
                        });

                    const webhook_array = config.WEBHOOK_ARR;
                    let webhook_array_len = webhook_array.length;
                    let webhook_response = [];
                    while (webhook_array_len--) {
                        let element = webhook_array[webhook_array_len];
                        let path = element.toLowerCase();
                        let payload = {
                            query: webhoookSubscritionCreate(),
                            variables: {
                                topic: element,
                                webhookSubscription: {
                                    callbackUrl: `${HOST}${SITE_WEBHOOK_PREFIX}/${path}`,
                                    format: "JSON",
                                }
                            }
                        }
                        let response = shopify_call(access_token, shop, `${config.SHOPIFY_API_VERSION}/graphql.json`, payload, 'POST');
                        webhook_response.push(response);
                    }
                    await addMetafieldsInShop(access_token,shopData?.myshopifyDomain,shopData?.currencyCode,shopData?.id,shopData?.plan?.displayName,unescapeHTML(shopData?.currencyFormats?.moneyFormat))
                    let [app_remove_webhook] = await Promise.all(webhook_response);

                    try {
                        const cartTransformPayload = {
                            query: cartTransFormCreate(),
                            variables: {
                                functionId: config.CART_TRANSFORM_ID,
                                blockOnFailure: false
                            }
                        };

                        const cartTransformResponse = await shopify_call(
                            access_token,
                            shop,
                            `${config.SHOPIFY_API_VERSION}/graphql.json`,
                            cartTransformPayload,
                            'POST'
                        );

                        if (cartTransformResponse?.status === 200 &&
                            !cartTransformResponse?.response?.data?.cartTransformCreate?.userErrors?.length) {
                            console.log("Cart transform created successfully");
                        } else {
                            console.log("Cart transform creation failed or had errors:",
                                cartTransformResponse?.response?.data?.cartTransformCreate?.userErrors);
                        }
                    } catch (cartTransformError) {
                        console.log("Error creating cart transform:", cartTransformError);
                    }
                    const redirectParams = host
                        ? `shop=${shop}&host=${host}`
                        : `shop=${shop}`;
                    res.redirect(`https://${shop}/admin/apps/${SHOPIFY_API_KEY}?${redirectParams}`);
                    // if (app_remove_webhook.response) {
                    //     res.redirect(`https://${shop}/admin/apps/${SHOPIFY_API_KEY}?shop=${shop}`);
                    // } else {
                    //     res.redirect(`${config.editor_url}?shop=${shop}&host=${host}`);
                    //     // res.send("Hello");
                    // }
                }else{
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                }
            } else {
                console.log("error==============access_token==============>", 'access_token_response')
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}


const addMetafieldsInShop = async (accessToken, shop, currencyCode, shopID, shopPlan, moneyFormat) => {
    console.log(accessToken, shop, currencyCode, shopID, shopPlan, moneyFormat)
    try {
        // Create a JSON object containing both store plan and money format
        const storeDataObject = {
            store_plan: shopPlan || "Unknown",
            money_format: moneyFormat || "{{amount}}"
        };

        // Default priority order for rule types (when app is installed)
        const defaultPriority = ["inventory", "customer", "location", "device", "weekend", "daynight"];

        // Define metafields to be created
        const metafields = [
            {
                namespace: "mg_dynamic_price",
                key: "store_data",
                value: JSON.stringify(storeDataObject),
                type: "json",
                ownerId: shopID
            },
            {
                namespace: "dynamic_price",
                key: "priority",
                value: JSON.stringify(defaultPriority),
                type: "json",
                ownerId: shopID
            }
        ];

        // Create the GraphQL payload
        const payload = {
            query: addShopMetafield(),
            variables: {
                metafields: metafields
            }
        };

        // Make the API call to create metafields
        const response = await shopify_call(
            accessToken,
            shop,
            `${config.SHOPIFY_API_VERSION}/graphql.json`,
            payload,
            'POST'
        );

        if (response?.status === 200 && !response?.response?.data?.metafieldsSet?.userErrors?.length) {
            console.log("Metafield created successfully for shop:", shop);
            console.log("Created metafield:", response?.response?.data?.metafieldsSet?.metafields);
        } else {
            console.log("Error creating metafield:", response?.response?.data?.metafieldsSet?.userErrors);
        }
    } catch (error) {
        console.log("Error in addMetafieldsInShop:", error);
    }
}

export {firtShopify,shopifyCallbackFn,successPlanFn};


