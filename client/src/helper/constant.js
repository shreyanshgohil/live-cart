
// Example images (replace with your own if needed)
export const ruleImages = {
  device:
    "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Customer_Mobile_Device.png?v=1762189783",
  weekend:
    "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Weekend_Pricing.png?v=1762189783",
  preference:
    "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Customer_Preference.png?v=1762189782",
  inventory:
    "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Product_Inventory.png?v=1762189782",
  vendor: "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/vendor_4973b72d-650a-4568-aefc-9e492c776e7c.png?v=1753613616",
  campaign: "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/campaing.png?v=1753613684",
  daynight: "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Day-Night_Pricing.png?v=1762189782",
  location: "https://cdn.shopify.com/s/files/1/0594/0363/2685/files/Day-Night_Pricing.png?v=1762189782",
};

export const pricingRules = [
  {
    id: "location-based-rule",
    name: "Location Based",
    description:
      "Apply different pricing based on customer's country and state location.",
    image: ruleImages.location,
  },
  {
    id: "customer-based-rule",
    name: "Customer Preference",
    description:
      "Pricing based on purchase history, tags, and browsing behavior.",
    image: ruleImages.preference,
  },
  {
    id: "device-base-rule",
    name: "Customer Mobile Device",
    description: "Apply pricing based on Android and iOS device.",
    image: ruleImages.device,
  },
  {
    id: "product-inventory-base-rule",
    name: "Product Inventory",
    description: "Increase price for low inventory.",
    image: ruleImages.inventory,
  },
  {
    id: "weekend-rule",
    name: "Weekend Pricing",
    description: "Special pricing for weekends.",
    image: ruleImages.weekend,
  },

  /*{
    id: "vendor",
    name: "Product Vendors",
    description: "Vendor-specific pricing rules.",
    image: ruleImages.vendor,
  },*/
  /*{
    id: "campaign",
    name: "Campaign-Based Pricing",
    description: "Apply pricing for special campaigns.",
    image: ruleImages.campaign,
  },*/
  {
    id: "daynight-rule",
    name: "Day/Night Pricing",
    description: "Different pricing for day and night.",
    image: ruleImages.daynight,
  },
   
 
];
