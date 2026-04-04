import config from "../config/config.js";
import { extractCartTokenFromOrderWebhookPayload } from "../helper/orderWebhookPayload.js";
import { handleError, handleSuccess } from "../helper/response_handler.js";
import { updateCartSnapshotStatusByCartToken } from "../repository/cartSnapshotRepository.js";

const handleOrderCartLink = async (req, res, status) => {
  const { status_code_config: statusCode, en_message_config: en } = config;
  try {
    const shop = req.get("x-shopify-shop-domain");
    if (!shop) {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
      return;
    }
    const cartToken = extractCartTokenFromOrderWebhookPayload(req.body || {});
    if (cartToken) {
      await updateCartSnapshotStatusByCartToken(shop, cartToken, status);
    }
    handleSuccess(statusCode.OK, en.ORDER_CART_WEBHOOK_SUCCESS, "", res);
  } catch (error) {
    console.log("error============order_webhook=============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

export const orders_create = (req, res) =>
  handleOrderCartLink(req, res, "Ordered");

export const draft_orders_create = (req, res) =>
  handleOrderCartLink(req, res, "DraftOrder");
