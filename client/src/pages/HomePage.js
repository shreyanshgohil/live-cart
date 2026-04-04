import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  DataTable,
  LegacyCard,
  Modal,
  Page,
  Spinner,
  Text,
} from "@shopify/polaris";
import { ApiCall } from "../helper/axios";
import { config_variable } from "../helper/commonApi";

const formatPrice = (currency, amount) =>
  `${currency} ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleString();
};

export default function HomePage() {
  const [selectedCart, setSelectedCart] = useState(null);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [cartsFromDb, setCartsFromDb] = useState([]);
  const [cartsLoading, setCartsLoading] = useState(true);
  const [cartsError, setCartsError] = useState("");

  const loadCartsFromDatabase = useCallback(async () => {
    const shop = config_variable?.shop_name;
    if (!shop) {
      setCartsError("Shop is not set.");
      setCartsFromDb([]);
      return;
    }

    try {
      setCartsLoading(true);
      const path = `/carts?shop=${encodeURIComponent(shop)}`;
      const response = await ApiCall("GET", path);

      if (response?.data?.status === "success") {
        setCartsFromDb(response?.data?.data?.carts || []);
        setCartsError("");
      } else {
        setCartsError(
          response?.data?.message || "Could not load carts from database.",
        );
        setCartsFromDb([]);
      }
    } catch {
      setCartsError("Could not load carts from database.");
      setCartsFromDb([]);
    } finally {
      setCartsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartsFromDatabase();
  }, [loadCartsFromDatabase]);

  const openItemsModal = (cart) => {
    setSelectedCart(cart);
    setIsItemsModalOpen(true);
  };

  const closeItemsModal = () => {
    setIsItemsModalOpen(false);
  };

  const cartRows = cartsFromDb.map((cart) => [
    cart.customerName,
    cart.email,
    formatPrice(cart.currency, cart.totalAmount),
    cart.itemCount,
    formatDate(cart.updatedAt),
    <Badge tone={cart.status === "Abandoned" ? "critical" : "success"}>
      {cart.status}
    </Badge>,
    <Button onClick={() => openItemsModal(cart)}>View cart items</Button>,
  ]);

  const selectedCartItemRows = (selectedCart?.items || []).map((item) => [
    item.title,
    item.sku,
    item.quantity,
    formatPrice(selectedCart?.currency || "USD", item.price),
    formatPrice(selectedCart?.currency || "USD", item.lineTotal),
  ]);

  return (
    <Page title="Cart Dashboard">
      <LegacyCard>
        <LegacyCard.Section>
          {cartsLoading ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Spinner accessibilityLabel="Loading carts" size="small" />
            </div>
          ) : cartsError && !cartsFromDb.length ? (
            <Text as="p" variant="bodyMd" tone="critical">
              {cartsError}
            </Text>
          ) : !cartsFromDb.length ? (
            <Text as="p" variant="bodyMd" tone="subdued">
              No carts in the database yet. Carts appear here when Shopify
              sends cart webhooks or your backend saves snapshots.
            </Text>
          ) : (
            <div className="cart-table-center-items">
              <DataTable
                columnContentTypes={[
                  "text",
                  "text",
                  "text",
                  "text",
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
                footerContent={`${cartsFromDb.length} carts shown`}
              />
            </div>
          )}
        </LegacyCard.Section>
      </LegacyCard>

      <Modal
        open={isItemsModalOpen}
        onClose={closeItemsModal}
        title={
          selectedCart
            ? `Cart details - ${selectedCart.customerName}`
            : "Cart details"
        }
        primaryAction={{
          content: "Close",
          onAction: closeItemsModal,
        }}
      >
        <Modal.Section>
          {selectedCart ? (
            <>
              <Text as="p" variant="bodyMd">
                Cart ID: {selectedCart.cartGid || selectedCart.id} | Total:{" "}
                {formatPrice(selectedCart.currency, selectedCart.totalAmount)}
              </Text>
              <Text as="p" variant="bodyMd">
                Email: {selectedCart.email} | Phone: {selectedCart.phone}
              </Text>
              <div style={{ marginTop: "12px" }}>
                <LegacyCard>
                  <div className="cart-items-modal-table">
                    <DataTable
                      columnContentTypes={[
                        "text",
                        "text",
                        "text",
                        "text",
                        "text",
                      ]}
                      headings={["Item", "SKU", "Qty", "Price", "Line total"]}
                      rows={selectedCartItemRows}
                    />
                  </div>
                </LegacyCard>
              </div>
            </>
          ) : null}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
