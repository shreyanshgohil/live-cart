import mongoose from "mongoose";

const clientStores = new mongoose.Schema({
        store_client_id: {
            type: String,
            unique: true,
        },
        shopify_store_id: String,
        email: String,
        status: String,
        app_status: String,
        store_name: String,
        charge_app: {
            type: Boolean,
            default: false,
        },
        trial_days : {
            type: Number,
            default: 7,
        },
        charge_id : String,
        token: String,
        app_language: String,
        shop_name: String,
        shop_plan: String,
        money_format: String,
        currency: String,
        shop_owner: String,
        address1: String,
        address2: String,
        city: String,
        country_name: String,
        phone: String,
        province: String,
        zip: String,
        is_tax_included: String,
        timezone: String,
        iana_timezone: String,
        domain: String,
        uninstall_on: Date,
        install_date: Date,
        theme_language: {
            type: String,
            default: 'en',
        },
        store_theme_id: String,
        selectedTheme: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        onboardingStep: {
            type: Map,
            of: Boolean,
            default: {
                0: false,
                1: false,
                2: false,
                3: false,
            },
        },
    },
    {
        timestamps: {createdAt: 'created_on', updatedAt: 'updated_on'},
        autoIndex: true,
    }
);


clientStores.index({store_name: 1});
clientStores.index({status: 1, store_name: 1});

export const clientStoresSchema = mongoose.model('client_stores', clientStores);
