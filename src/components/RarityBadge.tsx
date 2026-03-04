import { Circle, Diamond, Flame, Crown, Coins, Eye, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const RARITY_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  glow?: string;
}> = {
  common: {
    label: "Comum",
    icon: Circle,
    bg: "bg-[hsl(0,0%,22%)]",
    text: "text-[hsl(0,0%,70%)]",
  },
  rare: {
    label: "Raro",
    icon: Diamond,
    bg: "bg-[hsl(210,60%,16%)]",
    text: "text-[hsl(210,85%,65%)]",
    glow: "shadow-[0_0_8px_hsl(210,85%,50%,0.3)]",
  },
  epic: {
    label: "Épico",
    icon: Flame,
    bg: "bg-[hsl(270,50%,16%)]",
    text: "text-[hsl(270,80%,72%)]",
    glow: "shadow-[0_0_8px_hsl(270,70%,55%,0.3)]",
  },
  legendary: {
    label: "Lendário",
    icon: Crown,
    bg: "bg-[hsl(45,60%,14%)]",
    text: "text-[hsl(45,100%,60%)]",
    glow: "shadow-[0_0_10px_hsl(45,100%,50%,0.35)]",
  },
  gold: {
    label: "Ouro",
    icon: Coins,
    bg: "bg-[hsl(38,65%,14%)]",
    text: "text-[hsl(38,95%,55%)]",
    glow: "shadow-[0_0_10px_hsl(38,90%,45%,0.35)]",
  },
  secret: {
    label: "Secreto",
    icon: Eye,
    bg: "bg-[hsl(180,55%,12%)]",
    text: "text-[hsl(180,85%,58%)]",
    glow: "shadow-[0_0_12px_hsl(180,80%,45%,0.4)]",
  },
  divine: {
    label: "Divino",
    icon: Sparkles,
    bg: "bg-gradient-to-r from-[hsl(330,55%,16%)] to-[hsl(270,50%,18%)]",
    text: "text-[hsl(330,85%,72%)]",
    glow: "shadow-[0_0_14px_hsl(330,80%,55%,0.45)]",
  },
  god: {
    label: "Deus",
    icon: Shield,
    bg: "bg-gradient-to-r from-[hsl(45,80%,15%)] via-[hsl(30,90%,18%)] to-[hsl(0,70%,18%)]",
    text: "text-[hsl(45,100%,70%)]",
    glow: "shadow-[0_0_18px_hsl(45,100%,50%,0.5)]",
  },
};

interface RarityBadgeProps {
  rarity: string;
  size?: "sm" | "md";
  className?: string;
}

const RarityBadge = ({ rarity, size = "sm", className }: RarityBadgeProps) => {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-bold",
        config.bg,
        config.text,
        config.glow,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
};

export default RarityBadge;
