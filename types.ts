import React from 'react';

export interface AddressData {
  zip: string;
  location: string; // Prefecture + City only
}

export interface FormData {
  name: string;
  family: string;
  oldAddress: AddressData;
  newAddress: AddressData;
}

export type ImageStyle = 'Simple' | 'Pop' | 'Cheap' | 'Gorgeous';

export interface GeneratedContent {
  greetingText: string;
  originalImage: string | null; // Base64
  generatedImage: string | null; // Base64
  selectedStyle: ImageStyle;
}

export interface LayoutElement {
  id: string;
  type: 'text' | 'image';
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  width: number; // Percentage
  height: number; // Percentage (or auto for text)
  content: string;
  style?: React.CSSProperties;
}

export type PaperSize = 'postcard' | 'a4';

export const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number; name: string }> = {
  postcard: { width: 100, height: 148, name: 'はがき (100x148mm)' },
  a4: { width: 210, height: 297, name: 'A4 (210x297mm)' },
};