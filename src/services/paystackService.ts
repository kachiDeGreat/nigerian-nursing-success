// src/services/paystackService.ts
export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed";
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
  };
}

// Use environment variables for keys
export const PAYSTACK_SECRET_KEY =
  import.meta.env.VITE_PAYSTACK_SECRET_KEY || "";
export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

// Detect if we're using LIVE mode
export const isLiveMode = PAYSTACK_SECRET_KEY.startsWith("sk_live_");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Log the configuration to the console for easier debugging
if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
  console.error(
    "FATAL: Paystack keys are not defined in environment variables.",
  );
}

interface PaymentMetadata {
  userId: string;
  displayName?: string;
}

// Initialize Paystack payment (uses SECRET key)
export const initializePayment = async (
  email: string,
  amount: number,
  metadata: PaymentMetadata,
): Promise<PaystackResponse> => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured.");
  }

  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          currency: "NGN",
          metadata,
          callback_url: `${window.location.origin}/dashboard`,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Paystack error details:", errorText);
      throw new Error(`Paystack API Error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Network error during payment initialization:", error);
    throw error;
  }
};

// Verify Paystack payment (uses SECRET key)
export const verifyPayment = async (
  reference: string,
): Promise<PaystackVerifyResponse> => {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured.");
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Paystack verification error:", errorText);
    throw new Error(`Paystack API Error: ${response.status}`);
  }

  return await response.json();
};
