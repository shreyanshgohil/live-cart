import config from '../config/config.js';
import {getEncryptDecryptData, getStoreData} from '../helper/db_functions.js'
import {handleSuccess,handleError} from '../helper/response_handler.js';
import {clientStoresSchema} from "../database/clientStores.js";
import common from "common-utils";
import jwt from "jsonwebtoken"

const createToken = async (req, res) => {
    const {status_code_config: statusCode, en_message_config: en} = config;
    try {
        const reqData = req.body;
        if (reqData?.shop) {
            const { shop } = reqData;
            const { store_client_id, token, shopify_store_id } = await clientStoresSchema.findOne({ store_name: shop} ,{ store_client_id : 1,token : 1  ,shopify_store_id : 1 });
            if (common.checkValues(store_client_id)) {
                const storedata = { store_name: shop, store_client_id, token, shopifyStoreId : shopify_store_id };
                getStoreData(shop)
                    .then((shopInfo) => {
                        if (common.isRealValue(shopInfo)) {
                            jwt.sign(
                                storedata,
                                config.secret,
                                { expiresIn: 1440 * 60 },
                                (err, security_token) => {
                                    if (err) {
                                        throw err;
                                    } else {
                                        shopInfo.token = shopInfo?.token
                                            ? getEncryptDecryptData(config.ACTION_ENCRYPT, shopInfo.token)
                                            : '';
                                        shopInfo.scid = shopInfo?.store_client_id
                                            ? getEncryptDecryptData(
                                                config.ACTION_ENCRYPT,
                                                shopInfo.store_client_id.toString(),
                                            )
                                            : '';
                                        shopInfo.money_format = common.html_entity_decode(shopInfo.money_format);
                                        res.setHeader('security_token', Buffer.from(security_token).toString('base64'));
                                        const data = {
                                            shop_data: shopInfo,
                                            token: Buffer.from(security_token).toString('base64'),
                                        };
                                        handleSuccess(statusCode.OK, en.SUCCESS_TOKEN_GENERATE, data, res);
                                    }
                                },
                            ); /* 24 hours */
                        } else {
                            handleError(statusCode.BAD_REQUEST, en.SHOP_NOT_FOUND, res);
                        }
                    })
                    .catch((error) => {
                        console.log('shopInfo=================error==============>', error);
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    });
            } else {
                handleError(statusCode.BAD_REQUEST, en.SHOP_NOT_FOUND, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log('error========generate_token===========>', error);
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }


}

export {createToken};


