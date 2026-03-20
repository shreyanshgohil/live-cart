import config from '../config/config.js';
import {handleSuccess} from '../helper/response_handler.js';

export const gdpr_webhooks = async (req, res) => {
  let {status_code_config: statusCode, en_message_config: en} = config;
  handleSuccess(statusCode.OK, en.WEBHOOK_SUCCESS, [], res);
};
