// src/types/paystack.d.ts
interface PaystackPop {
  setup(options: {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref: string;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
    metadata?: Record<string, unknown>;
    channels?: string[];
  }): {
    openIframe: () => void;
  };
}

interface Window {
  PaystackPop: PaystackPop;
}
