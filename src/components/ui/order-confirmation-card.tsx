'use client';

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Receipt, ArrowRight, Phone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
  title?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  className?: string;
  vendorName?: string;
  items?: Array<{ title: string; quantity: number; price: number }>;
  deliveryFee?: number;
  serviceFee?: number;
  status?: string;
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title,
  buttonText = "Back to Orders",
  icon,
  className,
  vendorName,
  items = [],
  deliveryFee = 0,
  serviceFee = 0,
  status = "COMPLETED",
}) => {
  const isCancelled = status.toUpperCase() === "CANCELLED";

  // Default values depending on state
  const defaultTitle = isCancelled 
    ? "Order Cancelled" 
    : "Transaction Completed Successfully";
    
  const displayTitle = title || defaultTitle;

  const defaultIcon = isCancelled ? (
    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 shadow-lg shadow-red-500/5">
      <XCircle className="h-10 w-10" />
    </div>
  ) : (
    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5">
      <CheckCircle2 className="h-10 w-10" />
    </div>
  );

  const displayIcon = icon || defaultIcon;

  // Calculate receipt totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotalAmount = totalAmount || `₵${(subtotal + deliveryFee + serviceFee).toFixed(2)}`;

  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Custom premium ease-out
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        aria-live="polite"
        className={cn(
          "w-full max-w-md rounded-[2.5rem] border border-surface-border bg-surface text-foreground shadow-2xl p-6 sm:p-8 relative overflow-hidden",
          isCancelled ? "shadow-red-500/5" : "shadow-emerald-500/5",
          className
        )}
      >
        {/* Top brand line gradient decoration */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-2 bg-gradient-to-r",
          isCancelled ? "from-red-500 via-rose-600 to-orange-500" : "from-primary via-emerald-500 to-teal-500"
        )} />

        <div className="flex flex-col items-center space-y-6 text-center">
          {/* Status Icon */}
          <motion.div variants={itemVariants}>{displayIcon}</motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {displayTitle}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center justify-center gap-1">
              <Receipt className="w-3.5 h-3.5" />
              Receipt Terminal
            </p>
          </motion.div>

          {/* Receipt Content Card */}
          <motion.div 
            variants={itemVariants} 
            className="w-full bg-foreground/[0.02] border border-surface-border rounded-3xl p-5 text-left relative overflow-hidden"
          >
            {/* Dotted border overlay simulating receipt paper */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[length:8px_8px] repeat-x" />

            {/* Vendor Header */}
            {vendorName && (
              <div className="border-b border-surface-border/50 pb-4 mb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground/40 block">Vendor Shop</span>
                <span className="text-base font-black uppercase tracking-tight text-foreground">{vendorName}</span>
              </div>
            )}

            {/* Order Items */}
            {items.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b border-dashed border-surface-border/60">
                <span className="text-[9px] font-black uppercase tracking-wider text-foreground/40 block">Items Purchased</span>
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-semibold text-foreground/80">
                    <span className="truncate max-w-[70%]">{item.quantity}x {item.title}</span>
                    <span className="font-mono">₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-foreground/50 font-bold uppercase tracking-wider text-[9px]">
                <span>Transaction Metadata</span>
                <span>Value</span>
              </div>
              <div className="flex justify-between text-foreground/75 font-semibold">
                <span>Order ID</span>
                <span className="font-mono select-all text-[11px]">#{orderId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-foreground/75 font-semibold">
                <span>Payment Method</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-foreground/75 font-semibold">
                <span>Timestamp</span>
                <span>{dateTime}</span>
              </div>

              {subtotal > 0 && (
                <>
                  <div className="h-px bg-surface-border/50 my-2" />
                  <div className="flex justify-between text-foreground/70 font-semibold">
                    <span>Subtotal</span>
                    <span className="font-mono">₵{subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-foreground/70 font-semibold">
                      <span>Delivery Fee</span>
                      <span className="font-mono">₵{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-foreground/70 font-semibold">
                      <span>Service Charge</span>
                      <span className="font-mono">₵{serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              <div className="border-t border-surface-border pt-4 mt-2 flex justify-between items-baseline">
                <span className="font-black uppercase tracking-tight text-sm text-foreground">Total Charged</span>
                <span className={cn(
                  "text-2xl font-black font-mono tracking-tighter",
                  isCancelled ? "text-red-500" : "text-primary"
                )}>
                  {finalTotalAmount}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div variants={itemVariants} className="w-full">
            <Button
              onClick={onGoToAccount}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg",
                isCancelled
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/10"
                  : "bg-primary text-black hover:bg-primary/95 shadow-primary/10"
              )}
            >
              {buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
