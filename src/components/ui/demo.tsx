import React from "react";
import { OrderConfirmationCard } from "@/components/ui/order-confirmation-card";

/**
 * A demo component to showcase the OrderConfirmationCard.
 */
const OrderConfirmationCardDemo = () => {
  const handleGoToAccount = () => {
    // In a real app, this would navigate the user.
    alert("Navigating to your account...");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <OrderConfirmationCard
        orderId="57625869"
        paymentMethod="Apple Pay"
        dateTime="01/02/24 23:46"
        totalAmount="$ 129"
        onGoToAccount={handleGoToAccount}
      />
    </div>
  );
};

export default OrderConfirmationCardDemo;
