import common from 'common-utils'
import config from '../config/config.js';
import {handleSuccess,handleError} from '../helper/response_handler.js';
import {clientStoresSchema} from "../database/clientStores.js";


export const app_uninstall = async (req, res) => {
    let {status_code_config: statusCode, en_message_config: en} = config;
    try {
        let shop = req.get('x-shopify-shop-domain');
        if (shop) {

            let update_data = {
                'uninstall_on': common.date_format('Y-m-d H:i:s'),
                'status': '0',
                'app_status': '0',
                'charge_app' : false,
                // 'trial_days' : trialDays
            }
            let response = await clientStoresSchema.updateOne({ store_name: shop }, {
                $set: update_data
            });

            if (response) {
                handleSuccess(statusCode.OK, en.APP_UNISTALLED_WEBHOOK_SUCCESS, '', res);
            } else {
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error============app_uninstall=============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
};
