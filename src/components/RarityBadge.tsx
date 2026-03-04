import { Circle, Coins, Eye, Sparkles, Shield, Zap, Stars, Diamond, UtensilsCrossed, Rainbow } from "lucide-react";
import { cn } from "@/lib/utils";

export const RARITY_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  glow?: string;
  animate?: string;
}> = {
  common: {
    label: "Comum",
    icon: Circle,
    bg: "bg-[hsl(0,0%,22%)]",
    text: "text-[hsl(0,0%,70%)]",
  },
  diamond: {
    label: "Diamante",
    icon: Diamond,
    bg: "bg-gradient-to-r from-[hsl(195,80%,14%)] via-[hsl(210,90%,18%)] to-[hsl(195,80%,14%)]",
    text: "text-[hsl(195,100%,75%)]",
    glow: "shadow-[0_0_14px_hsl(195,100%,60%,0.5),0_0_28px_hsl(210,90%,50%,0.2)]",
    animate: "animate-pulse",
  },
  taco: {
    label: "Taco",
    icon: UtensilsCrossed,
    bg: "bg-gradient-to-r from-[hsl(30,80%,16%)] via-[hsl(45,90%,18%)] to-[hsl(15,80%,16%)]",
    text: "text-[hsl(35,100%,65%)]",
    glow: "shadow-[0_0_12px_hsl(35,100%,50%,0.4),0_0_24px_hsl(20,90%,45%,0.2)]",
  },
  rainbow: {
    label: "Rainbow",
    icon: Rainbow,
    bg: "bg-gradient-to-r from-[hsl(0,70%,18%)] via-[hsl(120,70%,16%)] to-[hsl(240,70%,18%)]",
    text: "text-[hsl(300,100%,85%)]",
    glow: "shadow-[0_0_16px_hsl(300,80%,60%,0.4),0_0_32px_hsl(180,80%,50%,0.2)]",
    animate: "animate-pulse",
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
    bg: "bg-gradient-to-r from-[hsl(260,70%,14%)] via-[hsl(200,80%,14%)] to-[hsl(160,70%,14%)]",
    text: "text-[hsl(180,100%,70%)]",
    glow: "shadow-[0_0_16px_hsl(180,100%,50%,0.5),0_0_30px_hsl(260,80%,50%,0.2)]",
    animate: "animate-pulse",
  },
  divine: {
    label: "Divino",
    icon: Sparkles,
    bg: "bg-gradient-to-r from-[hsl(280,80%,18%)] via-[hsl(320,80%,22%)] to-[hsl(260,70%,18%)]",
    text: "text-[hsl(300,100%,82%)]",
    glow: "shadow-[0_0_18px_hsl(300,90%,60%,0.5),0_0_35px_hsl(280,80%,50%,0.25)]",
    animate: "animate-pulse",
  },
  secret_divine: {
    label: "Secreto Divino",
    icon: Stars,
    bg: "bg-gradient-to-r from-[hsl(180,80%,12%)] via-[hsl(260,80%,18%)] to-[hsl(320,80%,16%)]",
    text: "text-[hsl(200,100%,85%)]",
    glow: "shadow-[0_0_20px_hsl(200,100%,60%,0.5),0_0_40px_hsl(280,90%,55%,0.3)]",
    animate: "animate-pulse",
  },
  god: {
    label: "Deus do Brainrot",
    icon: Zap,
    bg: "bg-gradient-to-r from-[hsl(0,85%,20%)] via-[hsl(35,100%,22%)] to-[hsl(55,100%,20%)]",
    text: "text-[hsl(45,100%,80%)]",
    glow: "shadow-[0_0_22px_hsl(45,100%,55%,0.6),0_0_44px_hsl(0,80%,50%,0.3)]",
    animate: "animate-pulse",
  },
};

// Special flag emojis that can be added next to brainrot names
export const SPECIAL_FLAGS: Record<string, {
  label: string;
  emoji: string;
  bg: string;
  text: string;
  glow?: string;
}> = {
  love: {
    label: "Love",
    emoji: "❤️",
    bg: "bg-[hsl(350,80%,18%)]",
    text: "text-[hsl(350,100%,70%)]",
    glow: "shadow-[0_0_10px_hsl(350,80%,50%,0.4)]",
  },
  chat: {
    label: "Chat",
    emoji: "💬",
    bg: "bg-[hsl(210,60%,18%)]",
    text: "text-[hsl(210,100%,75%)]",
    glow: "shadow-[0_0_10px_hsl(210,70%,50%,0.4)]",
  },
  brazil: {
    label: "Brasil",
    emoji: "🇧🇷",
    bg: "bg-[hsl(140,60%,14%)]",
    text: "text-[hsl(140,80%,65%)]",
    glow: "shadow-[0_0_10px_hsl(140,70%,40%,0.4)]",
  },
  fire: {
    label: "Fogo",
    emoji: "🔥",
    bg: "bg-[hsl(15,80%,16%)]",
    text: "text-[hsl(25,100%,65%)]",
    glow: "shadow-[0_0_10px_hsl(25,90%,50%,0.4)]",
  },
  star: {
    label: "Estrela",
    emoji: "⭐",
    bg: "bg-[hsl(45,80%,14%)]",
    text: "text-[hsl(45,100%,65%)]",
    glow: "shadow-[0_0_10px_hsl(45,90%,50%,0.4)]",
  },
  crown: {
    label: "Coroa",
    emoji: "👑",
    bg: "bg-[hsl(38,70%,16%)]",
    text: "text-[hsl(38,100%,70%)]",
    glow: "shadow-[0_0_12px_hsl(38,90%,50%,0.5)]",
  },
  skull: {
    label: "Caveira",
    emoji: "💀",
    bg: "bg-[hsl(0,0%,15%)]",
    text: "text-[hsl(0,0%,80%)]",
  },
  lightning: {
    label: "Raio",
    emoji: "⚡",
    bg: "bg-[hsl(50,90%,16%)]",
    text: "text-[hsl(50,100%,65%)]",
    glow: "shadow-[0_0_10px_hsl(50,100%,50%,0.5)]",
  },
  diamond_flag: {
    label: "Diamante",
    emoji: "💎",
    bg: "bg-[hsl(200,80%,16%)]",
    text: "text-[hsl(200,100%,72%)]",
    glow: "shadow-[0_0_12px_hsl(200,90%,55%,0.5)]",
  },
  devil: {
    label: "Demônio",
    emoji: "😈",
    bg: "bg-[hsl(270,70%,18%)]",
    text: "text-[hsl(270,100%,75%)]",
    glow: "shadow-[0_0_10px_hsl(270,80%,55%,0.4)]",
  },
  alien: {
    label: "Alien",
    emoji: "👽",
    bg: "bg-[hsl(120,60%,14%)]",
    text: "text-[hsl(120,80%,65%)]",
    glow: "shadow-[0_0_10px_hsl(120,70%,45%,0.4)]",
  },
  ghost: {
    label: "Fantasma",
    emoji: "👻",
    bg: "bg-[hsl(240,30%,18%)]",
    text: "text-[hsl(240,50%,80%)]",
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
        "inline-flex items-center gap-1 rounded-full font-bold border",
        config.bg,
        config.text,
        config.glow,
        config.animate,
        "border-current/20",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
      {config.label}
    </span>
  );
};

export const SpecialFlagBadge = ({ flag, size = "sm", className }: { flag: string; size?: "sm" | "md"; className?: string }) => {
  const config = SPECIAL_FLAGS[flag];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-bold border border-current/20",
        config.bg,
        config.text,
        config.glow,
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        className,
      )}
    >
      <span className={size === "sm" ? "text-xs" : "text-sm"}>{config.emoji}</span>
      {size === "md" && config.label}
    </span>
  );
};

export default RarityBadge;
