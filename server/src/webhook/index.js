import express from "express"
import {app_uninstall} from "./app_uninstall.js"
import {shop_update} from "./shop_update.js"
import {gdpr_webhooks} from "./gdpr_webhooks.js"

const router = express.Router();

router.post("/app_uninstalled", app_uninstall);
router.post("/shop_update", shop_update);
router.post("/shop_data_erase", gdpr_webhooks);
router.post("/customer_data_request", gdpr_webhooks);
router.post("/customer_data_erase", gdpr_webhooks);

export default router;
