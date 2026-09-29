"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { MotionConfig } from "framer-motion";
import { createQueryClient } from "@/src/lib/queryClient";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}><MotionConfig reducedMotion="user">{children}</MotionConfig></QueryClientProvider>;
}
