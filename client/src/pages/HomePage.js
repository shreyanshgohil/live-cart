import React, { useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  LegacyCard,
  Modal,
  Page,
  Text,
} from "@shopify/polaris";

const dummyCarts = [
  {
    id: "CART-1001",
    customerName: "John Carter",
    email: "john.carter@example.com",
    totalAmount: 149.5,
    currency: "USD",
    itemCount: 3,
    updatedAt: "02 Apr 2026, 10:15 AM",
    status: "Active",
    items: [
      { title: "Classic White T-Shirt", sku: "TS-WHT-001", quantity: 2, price: 24.5 },
      { title: "Blue Denim Jeans", sku: "JN-BLU-032", quantity: 1, price: 79.0 },
      { title: "Canvas Sneakers", sku: "SN-CNV-118", quantity: 1, price: 21.5 },
    ],
  },
  {
    id: "CART-1002",
    customerName: "Ava Mitchell",
    email: "ava.mitchell@example.com",
    totalAmount: 89.0,
    currency: "USD",
    itemCount: 2,
    updatedAt: "02 Apr 2026, 09:20 AM",
    status: "Abandoned",
    items: [
      { title: "Leather Wallet", sku: "WL-BRN-044", quantity: 1, price: 39.0 },
      { title: "Wrist Watch", sku: "WW-BLK-510", quantity: 1, price: 50.0 },
    ],
  },
  {
    id: "CART-1003",
    customerName: "Noah Walker",
    email: "noah.walker@example.com",
    totalAmount: 214.75,
    currency: "USD",
    itemCount: 4,
    updatedAt: "01 Apr 2026, 08:45 PM",
    status: "Active",
    items: [
      { title: "Travel Backpack", sku: "BP-GRY-211", quantity: 1, price: 84.75 },
      { title: "Sports Bottle", sku: "BT-RED-109", quantity: 2, price: 20.0 },
      { title: "Wireless Earbuds", sku: "EB-WLS-908", quantity: 1, price: 90.0 },
    ],
  },
];

const formatPrice = (currency, amount) => `${currency} ${amount.toFixed(2)}`;

export default function HomePage() {
  const [selectedCart, setSelectedCart] = useState(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);

  const openItemsModal = (cart) => {
    setSelectedCart(cart);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setIsItemsModalOpen(false);
  };

  const cartRows = dummyCarts.map((cart) => [
    cart.customerName,
    cart.email,
    formatPrice(cart.currency, cart.totalAmount),
    cart.itemCount,
    cart.updatedAt,
    <Badge tone={cart.status === "Abandoned" ? "critical" : "success"}>{cart.status}</Badge>,
    <Button onClick={() => openItemsModal(cart)}>View cart items</Button>,
  ]);

  const selectedCartItemRows = (selectedCart?.items || []).map((item) => [
    item.title,
    item.sku,
    item.quantity,
    formatPrice(selectedCart?.currency || "USD", item.price),
    formatPrice(selectedCart?.currency || "USD", item.quantity * item.price),
  ]);

  return (
    <Page
      title="Cart Dashboard"
      subtitle="Track customer carts and quickly review the items added by each shopper."
    >
      <LegacyCard>
        <DataTable
          columnContentTypes={[
            "text",
            "text",
            "text",
            "numeric",
            "text",
            "text",
            "text",
          ]}
          headings={[
            "Customer name",
            "Email",
            "Cart amount",
            "Items",
            "Last updated",
            "Status",
            "Details",
          ]}
          rows={cartRows}
          footerContent={`${dummyCarts.length} carts shown`}
        />
      </LegacyCard>

      <Modal
        open={isItemsModalOpen}
        onClose={closeItemsModal}
        title={selectedCart ? `Cart details - ${selectedCart.customerName}` : "Cart details"}
        primaryAction={{
          content: "Close",
          onAction: closeItemsModal,
        }}
      >
        <Modal.Section>
          {selectedCart ? (
            <>
              <Text as="p" variant="bodyMd">
                Cart ID: {selectedCart.id} | Total:{" "}
                {formatPrice(selectedCart.currency, selectedCart.totalAmount)}
              </Text>
              <div style={{ marginTop: "12px" }}>
                <LegacyCard>
                  <DataTable
                    columnContentTypes={["text", "text", "numeric", "text", "text"]}
                    headings={["Item", "SKU", "Qty", "Price", "Line total"]}
                    rows={selectedCartItemRows}
                  />
                </LegacyCard>
              </div>
            </>
          ) : null}
        </Modal.Section>
      </Modal>
    </Page>
  );
}


