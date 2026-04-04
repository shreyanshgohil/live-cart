import express from 'express';
import {
    cartSnapshotController,
    contactSupportController,
    generateTokenController,
    shopifyAuthController,
    testController
} from '../controller/index.js';
import {verifyToken} from "../middleware/verify.js";

const router = express.Router();

router.get('/test', testController.testFn);

// Shopify API routes
router.get("/", shopifyAuthController.firtShopify); /* Shopify first time call api && also called user click on app from shopify admin panel */
router.get("/auth/callback", shopifyAuthController.shopifyCallbackFn); /* Shopify when merchant accept to install our app */
router.get("/success-plan", shopifyAuthController.successPlanFn);

router.post('/generate-token', generateTokenController.createToken);
router.get('/carts', cartSnapshotController.getCartsForShopFn);

router.post('/test-route', verifyToken, contactSupportController.addContactFormFn);

export default router;
