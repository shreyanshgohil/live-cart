import createApp from '@shopify/app-bridge';
import { getSessionToken } from "@shopify/app-bridge-utils";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const shop_name = params?.shop ? params?.shop : 'dhaval-test-grow.myshopify.com'
const embedded = params?.embedded ? 1 : 0;
const shop_url = window?.__st?.pageurl ? window?.__st?.pageurl : '';
/* below config variable is use for Shopify app bridge */
const config = { apiKey: process.env.API_KEY, host: params.host, forceRedirect: true };/*params.host*/
const admin_apiEndpoint = process.env.admin_apiEndpoint;
const client_apiEndpoint = process.env.client_apiEndpoint;
const domain = process.env.domain;
const mode = process.env.MODE;
const config_variable = { config, shop_name, embedded, shop_url };
let BridgeApp = {};
let sessionToken = '12311';
if (process.env?.MODE !== 'local') {
  BridgeApp = createApp({ apiKey: config_variable?.config?.apiKey, host: config_variable?.config?.host });
  sessionToken = await getSessionToken(BridgeApp);
}

export {
  admin_apiEndpoint,
  client_apiEndpoint,
  config_variable,
  domain,
  mode,
  BridgeApp,
  sessionToken
}
