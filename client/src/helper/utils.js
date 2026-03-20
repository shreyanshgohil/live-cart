import { ApiCall } from './axios';

export const QUICK_PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50];

// Flatten variants for table display
export const getFlattenedVariants = (formData, type) => {
  const flattened = [];
  (formData.selected_products || []).forEach((product) => {
    (product.variants || []).forEach((variant) => {
      let newValue;
      const pricingLogic = formData.price_update_logic || "percentage";
      
      if (type === "device") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              android_value:
                variant.updated_price?.percentage?.android_value || "",
              android_type:
                variant.updated_price?.percentage?.android_type || "increase",
              ios_value: variant.updated_price?.percentage?.ios_value || "",
              ios_type: variant.updated_price?.percentage?.ios_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              android_value:
                variant.updated_price?.fixed_price?.android_value || "",
              ios_value: variant.updated_price?.fixed_price?.ios_value || "",
            }
          };
        }
      } else if (type === "weekend") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              weekend_value:
                variant.updated_price?.percentage?.weekend_value || "",
              weekend_type:
                variant.updated_price?.percentage?.weekend_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              weekend_value:
                variant.updated_price?.fixed_price?.weekend_value || "",
            }
          };
        }
      } else if (type === "daynight") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              day_value:
                variant.updated_price?.percentage?.day_value || "",
              day_type:
                variant.updated_price?.percentage?.day_type || "increase",
              night_value:
                variant.updated_price?.percentage?.night_value || "",
              night_type:
                variant.updated_price?.percentage?.night_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              day_value:
                variant.updated_price?.fixed_price?.day_value || "",
              night_value:
                variant.updated_price?.fixed_price?.night_value || "",
            }
          };
        }
      } else if (type === "inventory") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              below_value: variant.updated_price?.percentage?.below_value || "",
              below_type: variant.updated_price?.percentage?.below_type || "increase",
              above_value: variant.updated_price?.percentage?.above_value || "",
              above_type: variant.updated_price?.percentage?.above_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              below_value: variant.updated_price?.fixed_price?.below_value || "",
              above_value: variant.updated_price?.fixed_price?.above_value || "",
            }
          };
        }
      } else if (type === "productBase") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              product_value:
                variant.updated_price?.percentage?.product_value || "",
              product_type:
                variant.updated_price?.percentage?.product_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              product_value:
                variant.updated_price?.fixed_price?.product_value || "",
            }
          };
        }
      } else if (type === "customer") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: {
              customer_value:
                variant.updated_price?.percentage?.customer_value || "",
              customer_type:
                variant.updated_price?.percentage?.customer_type || "increase",
            }
          };
        } else {
          newValue = {
            fixed_price: {
              value:
                variant.updated_price?.fixed_price?.value || "",
            }
          };
        }
      } else if (type === "location") {
        if (pricingLogic === "percentage") {
          newValue = {
            percentage: variant.updated_price?.percentage || {},
          };
        } else {
          newValue = {
            fixed_price: variant.updated_price?.fixed_price || {},
          };
        }
      }
      
      flattened.push({
        id: variant.variant_id,
        productId: product.product_id,
        productTitle: product.product_title,
        variantTitle: variant.variant_title,
        productImage: product.product_image,
        originalPrice: variant.original_price,
        ...newValue
      });
    });
  });
  return flattened;
};

// Clean up variant data to only include the selected pricing logic
export const cleanVariantData = (formData, type) => {
  const cleanedProducts = formData.selected_products.map(product => ({
    ...product,
    variants: product.variants.map(variant => {
      const pricingLogic = formData.price_update_logic || "percentage";
      let cleanedUpdatedPrice = {};
      
      if (pricingLogic === "percentage") {
        // Only include percentage data
        if (type === "device") {
          cleanedUpdatedPrice = {
            percentage: {
              android_value: variant.updated_price?.percentage?.android_value || "",
              android_type: variant.updated_price?.percentage?.android_type || "increase",
              ios_value: variant.updated_price?.percentage?.ios_value || "",
              ios_type: variant.updated_price?.percentage?.ios_type || "increase",
            }
          };
        } else if (type === "weekend") {
          cleanedUpdatedPrice = {
            percentage: {
              weekend_value: variant.updated_price?.percentage?.weekend_value || "",
              weekend_type: variant.updated_price?.percentage?.weekend_type || "increase",
            }
          };
        } else if (type === "daynight") {
          cleanedUpdatedPrice = {
            percentage: {
              day_value: variant.updated_price?.percentage?.day_value || "",
              day_type: variant.updated_price?.percentage?.day_type || "increase",
              night_value: variant.updated_price?.percentage?.night_value || "",
              night_type: variant.updated_price?.percentage?.night_type || "increase",
            }
          };
        } else if (type === "inventory") {
          cleanedUpdatedPrice = {
            percentage: {
              below_value: variant.updated_price?.percentage?.below_value || "",
              below_type: variant.updated_price?.percentage?.below_type || "increase",
            }
          };
        } else if (type === "customer") {
          cleanedUpdatedPrice = {
            percentage: {
              customer_value: variant.updated_price?.percentage?.customer_value || "",
              customer_type: variant.updated_price?.percentage?.customer_type || "increase",
            }
          };
        } else if (type === "location") {
          cleanedUpdatedPrice = {
            percentage: variant.updated_price?.percentage || {},
          };
        }
      } else {
        // Only include fixed_price data
        if (type === "device") {
          cleanedUpdatedPrice = {
            fixed_price: {
              android_value: variant.updated_price?.fixed_price?.android_value || "",
              ios_value: variant.updated_price?.fixed_price?.ios_value || "",
            }
          };
        } else if (type === "weekend") {
          cleanedUpdatedPrice = {
            fixed_price: {
              weekend_value: variant.updated_price?.fixed_price?.weekend_value || "",
            }
          };
        } else if (type === "daynight") {
          cleanedUpdatedPrice = {
            fixed_price: {
              day_value: variant.updated_price?.fixed_price?.day_value || "",
              night_value: variant.updated_price?.fixed_price?.night_value || "",
            }
          };
        } else if (type === "inventory") {
          cleanedUpdatedPrice = {
            fixed_price: {
              below_value: variant.updated_price?.fixed_price?.below_value || "",
            }
          };
        } else if (type === "customer") {
          cleanedUpdatedPrice = {
            fixed_price: {
              value: variant.updated_price?.fixed_price?.value || "",
            }
          };
        } else if (type === "location") {
          cleanedUpdatedPrice = {
            fixed_price: variant.updated_price?.fixed_price || {},
          };
        }
      }
      
      return {
        ...variant,
        updated_price: cleanedUpdatedPrice
      };
    })
  }));
  
  return {
    ...formData,
    selected_products: cleanedProducts
  };
};

export const calculateNewPrice = (originalPrice, percentage, type) => {
  const original = parseFloat(originalPrice);
  const percent = parseFloat(percentage);

  if (isNaN(original) || isNaN(percent) || percent === "")
    return originalPrice;

  const change = (original * percent) / 100;
  const newPrice =
    type === "increase" ? original + change : original - change;

  return Math.max(0, newPrice).toFixed(2);
};

// Normalize ID for consistent comparison (Shopify may return gid or numeric)
export const normalizeId = (id) => (id == null ? "" : String(id));

// Default updated_price structure for a new variant by rule type (used when picking products)
function getDefaultUpdatedPriceForRule(ruleType, pricingLogic, bulkSettings) {
  if (pricingLogic === "percentage") {
    switch (ruleType) {
      case "customer":
        return {
          percentage: {
            customer_value: (bulkSettings?.customer?.value?.trim() !== "") ? bulkSettings.customer?.value ?? "" : "",
            customer_type: bulkSettings?.customer?.type || "increase",
          },
        };
      case "daynight":
        return {
          percentage: {
            day_value: (bulkSettings?.day?.value?.trim() !== "") ? bulkSettings.day?.value ?? "" : "",
            day_type: bulkSettings?.day?.type || "increase",
            night_value: (bulkSettings?.night?.value?.trim() !== "") ? bulkSettings.night?.value ?? "" : "",
            night_type: bulkSettings?.night?.type || "increase",
          },
        };
      case "device":
        return {
          percentage: {
            android_value: (bulkSettings?.android?.value?.trim() !== "") ? bulkSettings.android?.value ?? "" : "",
            android_type: bulkSettings?.android?.type || "increase",
            ios_value: (bulkSettings?.ios?.value?.trim() !== "") ? bulkSettings.ios?.value ?? "" : "",
            ios_type: bulkSettings?.ios?.type || "increase",
          },
        };
      case "weekend":
        return {
          percentage: {
            weekend_value: (bulkSettings?.weekend?.value?.trim() !== "") ? bulkSettings.weekend?.value ?? "" : "",
            weekend_type: bulkSettings?.weekend?.type || "increase",
          },
        };
      case "inventory":
        return {
          percentage: {
            below_value: (bulkSettings?.below?.value?.trim() !== "") ? bulkSettings.below?.value ?? "" : "",
            below_type: bulkSettings?.below?.type || "increase",
          },
        };
      case "location": {
        const selectedStates = bulkSettings?.selectedStates || [];
        return {
          percentage: selectedStates.reduce((acc, stateCode) => {
            acc[stateCode] = {
              value: (bulkSettings?.value?.trim() !== "") ? bulkSettings.value ?? "" : "",
              type: bulkSettings?.type || "increase",
            };
            return acc;
          }, {}),
        };
      }
      default:
        return {};
    }
  }
  // fixed_price defaults
  switch (ruleType) {
    case "customer":
      return { fixed_price: { value: "" } };
    case "daynight":
      return { fixed_price: { day_value: "", night_value: "" } };
    case "device":
      return { fixed_price: { android_value: "", ios_value: "" } };
    case "weekend":
      return { fixed_price: { weekend_value: "" } };
    case "inventory":
      return { fixed_price: { below_value: "" } };
    case "location": {
      const selectedStates = bulkSettings?.selectedStates || [];
      return {
        fixed_price: selectedStates.reduce((acc, stateCode) => {
          acc[stateCode] = "";
          return acc;
        }, {}),
      };
    }
    default:
      return {};
  }
}

/**
 * Normalize products from API (get-by-id) so form state always has product_id, variant_id, etc.
 * Prevents "default title" / "0 variants" when re-opening picker or editing.
 */
export function normalizeProductsFromApi(products, ruleType = "customer") {
  if (!Array.isArray(products) || products.length === 0) return [];
  return products.map((product) => ({
    product_id: product.product_id ?? product.id,
    product_title: product.product_title ?? product.title ?? "",
    product_image: product.product_image ?? product.images?.[0]?.originalSrc ?? "",
    variants: (product.variants || []).map((variant) => ({
      variant_id: variant.variant_id ?? variant.id,
      variant_title: variant.variant_title ?? variant.title ?? "",
      original_price: variant.original_price ?? variant.price,
      inventory_quantity: variant.inventory_quantity ?? "",
      updated_price: variant.updated_price ?? {},
    })),
  }));
}

/**
 * Build product for form state from ResourcePicker selection.
 * - When picker returns product with no variants (e.g. re-open with initial selection), preserves existing variants and their pricing.
 * - Normalizes variant ID comparison so existing pricing is kept when re-selecting.
 * - Ensures same logic across all rule pages.
 */
export function buildProductFromSelection(product, existingProduct, options) {
  const { pricingLogic = "percentage", bulkSettings = {}, ruleType } = options;
  const productId = normalizeId(product?.id);
  const existing = existingProduct && normalizeId(existingProduct.product_id) === productId ? existingProduct : null;

  // When picker returns no variants (e.g. second open), use existing variants so we don't lose data or show 0 variants
  const sourceVariants = (product.variants && product.variants.length > 0)
    ? product.variants
    : (existing?.variants || []);

  const builtVariants = sourceVariants.map((variant) => {
    const variantId = normalizeId(variant.id ?? variant.variant_id);
    const existingVariant = existing?.variants?.find(
      (ev) => normalizeId(ev.variant_id) === variantId
    );
    if (existingVariant) {
      return {
        ...existingVariant,
        variant_id: variant.id ?? existingVariant.variant_id,
        variant_title: variant.title ?? existingVariant.variant_title,
        original_price: variant.price ?? existingVariant.original_price,
      };
    }
    const updatedPrice = getDefaultUpdatedPriceForRule(ruleType, pricingLogic, bulkSettings);
    const base = {
      variant_id: variant.id ?? variant.variant_id,
      variant_title: variant.title ?? variant.variant_title,
      original_price: variant.price ?? variant.original_price,
      updated_price: updatedPrice,
    };
    if (ruleType === "inventory") {
      base.inventory_quantity = variant.inventory_quantity ?? "";
    }
    return base;
  });

  return {
    product_id: product.id,
    product_title: product.title ?? existing?.product_title ?? "",
    product_image: (product.images && product.images[0]?.originalSrc) ?? existing?.product_image ?? "",
    variants: builtVariants,
  };
}

// Validate products to check for subscription, bundle, and giftcard products
export const validateProducts = async (productIds, token) => {
  try {
    const response = await ApiCall(
      'POST',
      '/rule/validate-products',
      { productIds },
      { authentication: token }
    );

    if (response?.data?.statusCode === 200 && response?.data?.data) {
      return {
        valid: response.data.data.valid || [],
        invalid: response.data.data.invalid || []
      };
    }
    return { valid: productIds, invalid: [] };
  } catch (error) {
    console.error('Error validating products:', error);
    // Return all as valid on error to avoid blocking user
    return { valid: productIds, invalid: [] };
  }
};
  