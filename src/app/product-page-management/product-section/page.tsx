"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProductSectionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/product-page-management?component=product.productsection");
  }, [router]);
  return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-[#8d6a3a]" size={40} />
    </div>
  );
}
