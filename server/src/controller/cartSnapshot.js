import config from "../config/config.js";
import { handleError, handleSuccess } from "../helper/response_handler.js";
import { listCartsForShop } from "../services/cartSnapshotService.js";

const normalizeShopDomainInput = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  let v = value.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return v;
};

const getCartsForShopFn = async (req, res) => {
  const { status_code_config: statusCode, en_message_config: en } = config;

  try {
    const shop = normalizeShopDomainInput(req.query.shop);

    if (!shop) {
      handleError(statusCode.BAD_REQUEST, "Query parameter shop is required", res);
      return;
    }

    const carts = await listCartsForShop(shop);
    handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, { carts }, res);
  } catch (error) {
    console.log("error========cart_list===========>", error?.message || error);
    handleError(statusCode.BAD_REQUEST, error?.message || en.ERROR_SOMETHING_WRONG, res);
  }
};

export { getCartsForShopFn };
