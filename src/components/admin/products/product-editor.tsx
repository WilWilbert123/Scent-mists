"use client";

import React from "react";
import type { Product } from "@/types/product";
import { ProductForm } from "./product-form";

interface ProductEditorProps {
  product: Product;
}

export function ProductEditor({ product }: ProductEditorProps) {
  return <ProductForm initialProduct={product} mode="edit" />;
}

