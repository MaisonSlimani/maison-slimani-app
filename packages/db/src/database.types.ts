export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = { __InternalSupabase: { Relationships: { [_ in never]: never } };
  public: {
    Tables: {
      admins: {
        Row: {
          email: string
          hash_mdp: string
          role: string | null
        }
        Insert: {
          email: string
          hash_mdp: string
          role?: string | null
        }
        Update: {
          email?: string
          hash_mdp?: string
          role?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          couleur: string | null
          date_creation: string | null
          description: string | null
          id: string
          image_url: string | null
          nom: string
          ordre: number | null
          slug: string
        }
        Insert: {
          active?: boolean | null
          couleur?: string | null
          date_creation?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          nom: string
          ordre?: number | null
          slug: string
        }
        Update: {
          active?: boolean | null
          couleur?: string | null
          date_creation?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          nom?: string
          ordre?: number | null
          slug?: string
        }
        Relationships: []
      }
      commandes: {
        Row: {
          adresse: string
          date_commande: string | null
          email: string | null
          id: string
          nom_client: string
          produits: Json
          statut: string | null
          telephone: string
          total: number
          ville: string
        }
        Insert: {
          adresse: string
          date_commande?: string | null
          email?: string | null
          id?: string
          nom_client: string
          produits: Json
          statut?: string | null
          telephone: string
          total: number
          ville: string
        }
        Update: {
          adresse?: string
          date_commande?: string | null
          email?: string | null
          id?: string
          nom_client?: string
          produits?: Json
          statut?: string | null
          telephone?: string
          total?: number
          ville?: string
        }
        Relationships: []
      }
      commentaires: {
        Row: {
          approved: boolean | null
          commentaire: string
          created_at: string | null
          email: string | null
          flagged: boolean | null
          id: string
          images: Json | null
          nom: string
          produit_id: string
          rating: number
          session_token: string
          updated_at: string | null
        }
        Insert: {
          approved?: boolean | null
          commentaire: string
          created_at?: string | null
          email?: string | null
          flagged?: boolean | null
          id?: string
          images?: Json | null
          nom: string
          produit_id: string
          rating: number
          session_token: string
          updated_at?: string | null
        }
        Update: {
          approved?: boolean | null
          commentaire?: string
          created_at?: string | null
          email?: string | null
          flagged?: boolean | null
          id?: string
          images?: Json | null
          nom?: string
          produit_id?: string
          rating?: number
          session_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commentaires_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      produits: {
        Row: {
          average_rating: number | null
          categorie: string | null
          couleurs: Json | null
          date_ajout: string | null
          description: string
          has_colors: boolean | null
          id: string
          image_url: string | null
          images: Json | null
          nom: string
          prix: number
          rating_count: number | null
          search_vector: unknown
          slug: string | null
          stock: number | null
          taille: string | null
          tailles: Json | null
          total_stock: number | null
          upsell_products: Json | null
          vedette: boolean | null
        }
        Insert: {
          average_rating?: number | null
          categorie?: string | null
          couleurs?: Json | null
          date_ajout?: string | null
          description: string
          has_colors?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          nom: string
          prix: number
          rating_count?: number | null
          search_vector?: unknown
          slug?: string | null
          stock?: number | null
          taille?: string | null
          tailles?: Json | null
          total_stock?: number | null
          upsell_products?: Json | null
          vedette?: boolean | null
        }
        Update: {
          average_rating?: number | null
          categorie?: string | null
          couleurs?: Json | null
          date_ajout?: string | null
          description?: string
          has_colors?: boolean | null
          id?: string
          image_url?: string | null
          images?: Json | null
          nom?: string
          prix?: number
          rating_count?: number | null
          search_vector?: unknown
          slug?: string | null
          stock?: number | null
          taille?: string | null
          tailles?: Json | null
          total_stock?: number | null
          upsell_products?: Json | null
          vedette?: boolean | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          expires_at: number
          key: string
          last_updated: string
        }
        Insert: {
          count?: number
          expires_at: number
          key: string
          last_updated?: string
        }
        Update: {
          count?: number
          expires_at?: number
          key?: string
          last_updated?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          admin_email: string
          created_at: string | null
          device_id: string
          id: string
          subscription: Json
          updated_at: string | null
        }
        Insert: {
          admin_email: string
          created_at?: string | null
          device_id: string
          id?: string
          subscription: Json
          updated_at?: string | null
        }
        Update: {
          admin_email?: string
          created_at?: string | null
          device_id?: string
          id?: string
          subscription?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_admin_email"
            columns: ["admin_email"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["email"]
          },
        ]
      }
      search_queries: {
        Row: {
          created_at: string | null
          id: string
          query: string
          results_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          results_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          results_count?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          admin_email: string | null
          adresse: string | null
          description: string | null
          email_entreprise: string | null
          facebook: string | null
          google_tag_manager_body: string | null
          google_tag_manager_header: string | null
          id: string
          instagram: string | null
          meta_pixel_code: string | null
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          admin_email?: string | null
          adresse?: string | null
          description?: string | null
          email_entreprise?: string | null
          facebook?: string | null
          google_tag_manager_body?: string | null
          google_tag_manager_header?: string | null
          id?: string
          instagram?: string | null
          meta_pixel_code?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_email?: string | null
          adresse?: string | null
          description?: string | null
          email_entreprise?: string | null
          facebook?: string | null
          google_tag_manager_body?: string | null
          google_tag_manager_header?: string | null
          id?: string
          instagram?: string | null
          meta_pixel_code?: string | null
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_average_rating: {
        Args: { p_produit_id: string }
        Returns: number
      }
      create_order_v2_atomic: {
        Args: {
          p_nom_client: string
          p_telephone: string
          p_adresse: string
          p_ville: string
          p_email: string | null
          p_produits: Json
          p_total: number
          p_idempotency_key: string
        }
        Returns: Json
      }
      calculate_total_stock:
        | {
            Args: { p_couleurs: Json; p_has_colors: boolean; p_stock: number }
            Returns: number
          }
        | {
            Args: {
              p_couleurs: Json
              p_has_colors: boolean
              p_stock: number
              p_tailles: Json
            }
            Returns: number
          }
      convert_couleurs_taille_to_tailles: {
        Args: { p_couleurs: Json }
        Returns: Json
      }
      convert_taille_to_tailles: {
        Args: { p_stock: number; p_taille: string }
        Returns: Json
      }
      decrementer_stock: {
        Args: { produit_id: string; quantite: number }
        Returns: undefined
      }
      decrementer_stock_atomic: {
        Args: { produit_id: string; quantite: number }
        Returns: boolean
      }
      decrementer_stock_couleur_atomic:
        | {
            Args: { couleur_nom: string; produit_id: string; quantite: number }
            Returns: boolean
          }
        | {
            Args: {
              couleur_nom: string
              produit_id: string
              quantite: number
              taille_nom?: string
            }
            Returns: boolean
          }
      decrementer_stock_couleur_taille_atomic: {
        Args: {
          couleur_nom: string
          produit_id: string
          quantite: number
          taille_nom: string
        }
        Returns: boolean
      }
      decrementer_stock_taille_atomic: {
        Args: { produit_id: string; quantite: number; taille_nom: string }
        Returns: boolean
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      generate_slug_simple: { Args: { input_text: string }; Returns: string }
      get_category_suggestions: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          category_name: string
          category_slug: string
          product_count: number
        }[]
      }
      get_product_suggestions: {
        Args: { limit_count?: number; search_prefix: string }
        Returns: {
          product_id: string
          suggestion: string
        }[]
      }
      get_rating_count: { Args: { p_produit_id: string }; Returns: number }
      get_similar_products: {
        Args: {
          include_out_of_stock?: boolean
          limit_count?: number
          price_tolerance?: number
          product_id: string
        }
        Returns: {
          categorie: string
          couleurs: Json
          date_ajout: string
          description: string
          has_colors: boolean
          id: string
          image_url: string
          images: Json
          nom: string
          prix: number
          similarity_score: number
          stock: number
          taille: string
          vedette: boolean
        }[]
      }
      get_trending_searches: {
        Args: { limit_count?: number }
        Returns: {
          query: string
          search_count: number
        }[]
      }
      incrementer_stock_atomic: {
        Args: { produit_id: string; quantite: number }
        Returns: boolean
      }
      incrementer_stock_couleur_atomic:
        | {
            Args: { couleur_nom: string; produit_id: string; quantite: number }
            Returns: boolean
          }
        | {
            Args: {
              couleur_nom: string
              produit_id: string
              quantite: number
              taille_nom?: string
            }
            Returns: boolean
          }
      incrementer_stock_couleur_taille_atomic: {
        Args: {
          couleur_nom: string
          produit_id: string
          quantite: number
          taille_nom: string
        }
        Returns: boolean
      }
      incrementer_stock_taille_atomic: {
        Args: { produit_id: string; quantite: number; taille_nom: string }
        Returns: boolean
      }
      search_products: {
        Args: {
          category_filter?: string
          couleur_filter?: string[]
          in_stock?: boolean
          limit_count?: number
          max_price?: number
          min_price?: number
          offset_count?: number
          search_query: string
          sort_by?: string
          taille_filter?: string[]
        }
        Returns: {
          categorie: string
          couleurs: Json
          date_ajout: string
          description: string
          has_colors: boolean
          id: string
          image_url: string
          images: Json
          nom: string
          prix: number
          rank: number
          stock: number
          tailles: Json
          total_stock: number
          vedette: boolean
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
