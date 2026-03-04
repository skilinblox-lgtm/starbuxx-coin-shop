import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRobuxPricing() {
  const [ratePer1000, setRatePer1000] = useState<number>(37);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "robux_price_per_1000")
        .single();
      if (data) setRatePer1000(parseFloat(data.value));
      setLoading(false);
    };
    fetch();
  }, []);

  const calculatePrice = (robuxAmount: number) => {
    return (robuxAmount * ratePer1000) / 1000;
  };

  const pricePerUnit = ratePer1000 / 1000;

  return { ratePer1000, pricePerUnit, calculatePrice, loading };
}
