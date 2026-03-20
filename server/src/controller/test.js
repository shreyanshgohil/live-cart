import config from '../config/config.js';
import {handleSuccess} from '../helper/response_handler.js';
import {shopify_call} from "shopify-call";

const testFn = async (req, res) => {
    let {status_code_config: statusCode, en_message_config: en} = config;
    handleSuccess(statusCode.OK, en.TEST_FUNCTION_WORKING, [], res);
};

export {testFn};


