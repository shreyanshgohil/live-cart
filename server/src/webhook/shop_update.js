import config from '../config/config.js';
import {handleError, handleSuccess} from '../helper/response_handler.js';
import {clientStoresSchema} from "../database/clientStores.js";
import {unescapeHTML} from "../helper/db_functions.js";

export const shop_update = async (req, res) => {
    let {status_code_config: statusCode, en_message_config: en} = config;
    try {
        let shop = req.get('x-shopify-shop-domain');
        console.log(shop, 'shop')
        if (shop) {
            let shop_data = req.body;
            console.log(shop_data, 'shop_data')
            let taxes_included = shop_data.taxes_included ? '1' : '0';
            let update_data = {
                email: shop_data.email,
                shopify_store_id: shop_data.id,
                app_language: "en",
                theme_language: shop_data.primary_locale,
                store_name: shop_data.myshopify_domain,
                shop_name: shop_data.name,
                shop_plan: shop_data.plan_display_name,
                money_format: unescapeHTML(shop_data.money_format),
                currency: shop_data.currency,
                shop_owner: shop_data.shop_owner,
                address1: shop_data.address1,
                address2: shop_data.address2,
                city: shop_data.city,
                country_name: shop_data.country_name,
                phone: shop_data.phone,
                province: shop_data.province,
                zip: shop_data.zip,
                timezone: shop_data.timezone,
                iana_timezone: shop_data.iana_timezone,
                domain: shop_data.myshopify_domain,
                is_tax_included: taxes_included,
            };
            await clientStoresSchema.updateOne({store_name: shop}, {$set: update_data});

            handleSuccess(statusCode.OK, en.SHOP_UPDATE_WEBHOOK_SUCCESS, '', res);
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error============app_uninstall=============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
};

