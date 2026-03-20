import React from "react";
import {
  Page,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


export default function HomePage() {
  const navigate = useNavigate();
  const { store_data } = useSelector((store) => store.commonData);
  const token = store_data?.token;

  return (
    <Page
      title="Home Page"
    >
      <h1>Hello</h1>
    </Page>
  );
}


