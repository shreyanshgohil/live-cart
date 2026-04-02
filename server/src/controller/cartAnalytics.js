import config from "../config/config.js";
import { handleError, handleSuccess } from "../helper/response_handler.js";
import { getStaticCartAnalytics } from "../services/cartAnalyticsService.js";

const getStaticCartAnalyticsFn = async (req, res) => {
  const { status_code_config: statusCode, en_message_config: en } = config;

  try {
    const cartAnalyticsData = await getStaticCartAnalytics();
    handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, cartAnalyticsData, res);
  } catch (error) {
    console.log("error========cart_analytics===========>", error?.message || error);
    handleError(statusCode.BAD_REQUEST, error?.message || en.ERROR_SOMETHING_WRONG, res);
  }
};

export { getStaticCartAnalyticsFn };

