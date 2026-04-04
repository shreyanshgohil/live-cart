import config from "../config/config.js";
import { handleError, handleSuccess } from "../helper/response_handler.js";
import { syncCartSnapshotFromAdminCartWebhook } from "../services/cartSnapshotService.js";

const handleCartWebhook = async (req, res) => {
  const { status_code_config: statusCode, en_message_config: en } = config;
  try {
    const shop = req.get("x-shopify-shop-domain");
    if (!shop) {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
      return;
    }

    await syncCartSnapshotFromAdminCartWebhook(shop, req.body || {});

    handleSuccess(statusCode.OK, en.CARTS_WEBHOOK_SUCCESS, "", res);
  } catch (error) {
    console.log("error============cart_webhook=============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

export const carts_create = handleCartWebhook;
export const carts_update = handleCartWebhook;
