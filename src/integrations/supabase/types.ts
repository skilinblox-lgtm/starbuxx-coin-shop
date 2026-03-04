export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brainrot_posts: {
        Row: {
          created_at: string
          current_price: number
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          rarity: string | null
          stock: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price?: number
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          rarity?: string | null
          stock?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          rarity?: string | null
          stock?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brainrot_price_history: {
        Row: {
          brainrot_id: string
          id: string
          price: number
          recorded_at: string
        }
        Insert: {
          brainrot_id: string
          id?: string
          price: number
          recorded_at?: string
        }
        Update: {
          brainrot_id?: string
          id?: string
          price?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brainrot_price_history_brainrot_id_fkey"
            columns: ["brainrot_id"]
            isOneToOne: false
            referencedRelation: "brainrot_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      brainrot_reviews: {
        Row: {
          author_name: string
          brainrot_id: string
          comment: string
          created_at: string
          id: string
          is_fake: boolean | null
          order_id: string | null
          rating: number
          user_id: string
        }
        Insert: {
          author_name: string
          brainrot_id: string
          comment: string
          created_at?: string
          id?: string
          is_fake?: boolean | null
          order_id?: string | null
          rating?: number
          user_id: string
        }
        Update: {
          author_name?: string
          brainrot_id?: string
          comment?: string
          created_at?: string
          id?: string
          is_fake?: boolean | null
          order_id?: string | null
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brainrot_reviews_brainrot_id_fkey"
            columns: ["brainrot_id"]
            isOneToOne: false
            referencedRelation: "brainrot_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brainrot_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_role?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      moderator_permissions: {
        Row: {
          can_manage_products: boolean | null
          can_manage_reviews: boolean | null
          can_manage_users: boolean | null
          can_process_deliveries: boolean | null
          can_view_earnings: boolean | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          can_manage_products?: boolean | null
          can_manage_reviews?: boolean | null
          can_manage_users?: boolean | null
          can_process_deliveries?: boolean | null
          can_view_earnings?: boolean | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          can_manage_products?: boolean | null
          can_manage_reviews?: boolean | null
          can_manage_users?: boolean | null
          can_process_deliveries?: boolean | null
          can_view_earnings?: boolean | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          cpf: string
          created_at: string
          discord_username: string
          full_name: string
          game_id: string
          game_username: string
          id: string
          payment_approved_at: string | null
          payment_method: string
          product_id: string | null
          quantity: number
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cpf: string
          created_at?: string
          discord_username: string
          full_name: string
          game_id: string
          game_username: string
          id?: string
          payment_approved_at?: string | null
          payment_method: string
          product_id?: string | null
          quantity: number
          status?: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cpf?: string
          created_at?: string
          discord_username?: string
          full_name?: string
          game_id?: string
          game_username?: string
          id?: string
          payment_approved_at?: string | null
          payment_method?: string
          product_id?: string | null
          quantity?: number
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          created_at: string
          currency: string
          game_id: string
          id: string
          image_url: string | null
          name: string
          price_per_unit: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          currency: string
          game_id: string
          id?: string
          image_url?: string | null
          name: string
          price_per_unit: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          currency?: string
          game_id?: string
          id?: string
          image_url?: string | null
          name?: string
          price_per_unit?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          comment: string
          created_at: string
          game_id: string
          id: string
          is_fake: boolean | null
          rating: number
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment: string
          created_at?: string
          game_id: string
          id?: string
          is_fake?: boolean | null
          rating: number
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string
          created_at?: string
          game_id?: string
          id?: string
          is_fake?: boolean | null
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
