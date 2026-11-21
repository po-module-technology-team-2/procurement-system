export type { NexacroItemInfo } from '../data/nexacroItems';

// Multi-lingual Price & RFQ Status Definitions (Data.xlsb Sheet 3)
export interface PriceStatusDefinition {
  code: string;
  en: string;
  vi: string;
  ko: string;
  zh: string;
}

export const PRICE_STATUS_MAPPINGS: Record<string, PriceStatusDefinition> = {
  UP001: {
    code: 'UP001',
    en: 'Price Registration',
    vi: 'Price Registration (Registered)',
    ko: '단가 등록',
    zh: '单价登录'
  },
  UP003: {
    code: 'UP003',
    en: 'Inprogress RFQ',
    vi: 'Inprogress RFQ (Supplier Bidding)',
    ko: '견적 진행중',
    zh: '报价进行中'
  },
  UP004: {
    code: 'UP004',
    en: 'None Price',
    vi: 'None Price (Unregistered)',
    ko: '단가 미등록',
    zh: '单价未登录'
  },
  UP005: {
    code: 'UP005',
    en: 'Request RFQ',
    vi: 'Request RFQ (Quotation Needed)',
    ko: '견적 요청',
    zh: '报价请求'
  }
};

export interface InventoryItem {
  id: string;
  partNumber: string;
  name: string;
  stockLevel: number;
  minStock: number;
  location: string;
  unit: string;
  unitPrice: number;
}
