import config from '../config/config.js';
import {handleError} from '../helper/response_handler.js';
import jwt from "jsonwebtoken"

const verifyToken = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    const { en_message_config: en, status_code_config: statusCode } = config;
    let token = req.headers.authentication;
    if (token) {
      token = Buffer.from(token, 'base64').toString('utf8');
      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return handleError(statusCode.UNAUTHORIZED, en.ERROR_NOT_VALID_TOKEN, res);
        }
        if (decoded) {
          res.locals.store_client_id = parseInt(decoded?.store_client_id, 10);
          res.locals.store_name = decoded?.store_name;
          res.locals.token = decoded?.token;
          res.locals.shopifyStoreId = decoded?.shopifyStoreId;
          next();
        } else {
          return handleError(statusCode.BAD_REQUEST, en.ERROR_TOKEN_NOT_FOUND, res);
        }
      });
    } else {
      return  handleError(statusCode.BAD_REQUEST, en.ERROR_TOKEN_NOT_FOUND, res);
    }
  } else {
    next();
  }
};

export {verifyToken}
