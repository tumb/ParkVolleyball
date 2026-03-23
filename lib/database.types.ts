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
    PostgrestVersion: "10.2.0 (e07807d)"
  }
  public: {
    Tables: {
      bracket: {
        Row: {
          bracketid: number
          bracketname: string | null
          created_at: string
          divisionid: number
          leagueid: number
        }
        Insert: {
          bracketid?: number
          bracketname?: string | null
          created_at?: string
          divisionid: number
          leagueid: number
        }
        Update: {
          bracketid?: number
          bracketname?: string | null
          created_at?: string
          divisionid?: number
          leagueid?: number
        }
        Relationships: [
          {
            foreignKeyName: "bracket_divisionid_fkey"
            columns: ["divisionid"]
            isOneToOne: false
            referencedRelation: "division"
            referencedColumns: ["divisionid"]
          },
          {
            foreignKeyName: "bracket_leagueid_fkey"
            columns: ["leagueid"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["leagueid"]
          },
        ]
      }
      bracket_old: {
        Row: {
          bracketid: number
          bracketname: string | null
          leagueid: number
        }
        Insert: {
          bracketid?: number
          bracketname?: string | null
          leagueid: number
        }
        Update: {
          bracketid?: number
          bracketname?: string | null
          leagueid?: number
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          last_updated: string | null
          page_name: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          last_updated?: string | null
          page_name: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          last_updated?: string | null
          page_name?: string
        }
        Relationships: []
      }
      division: {
        Row: {
          divisionid: number
          divisionname: string | null
          divisionvalue: number | null
          leagueid: number
        }
        Insert: {
          divisionid?: number
          divisionname?: string | null
          divisionvalue?: number | null
          leagueid: number
        }
        Update: {
          divisionid?: number
          divisionname?: string | null
          divisionvalue?: number | null
          leagueid?: number
        }
        Relationships: [
          {
            foreignKeyName: "division_leagueid_fkey"
            columns: ["leagueid"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["leagueid"]
          },
        ]
      }
      league: {
        Row: {
          day: string | null
          leagueid: number
          year: number | null
        }
        Insert: {
          day?: string | null
          leagueid?: number
          year?: number | null
        }
        Update: {
          day?: string | null
          leagueid?: number
          year?: number | null
        }
        Relationships: []
      }
      player: {
        Row: {
          elo: number | null
          email: string | null
          entrydate: string | null
          firstname: string | null
          gender: string | null
          image_url: string | null
          lastname: string | null
          phone: string | null
          playerid: number
          uid: string | null
        }
        Insert: {
          elo?: number | null
          email?: string | null
          entrydate?: string | null
          firstname?: string | null
          gender?: string | null
          image_url?: string | null
          lastname?: string | null
          phone?: string | null
          playerid?: number
          uid?: string | null
        }
        Update: {
          elo?: number | null
          email?: string | null
          entrydate?: string | null
          firstname?: string | null
          gender?: string | null
          image_url?: string | null
          lastname?: string | null
          phone?: string | null
          playerid?: number
          uid?: string | null
        }
        Relationships: []
      }
      playoff_match: {
        Row: {
          bracketid: number
          created_at: string
          is_completed: boolean
          location: number
          nextplayoffmatchid: number | null
          nextslot: Database["public"]["Enums"]["playoff_next_slot"] | null
          playoffmatchid: number
          round: number
          teamaid: number | null
          teambid: number | null
          winnerteamid: number | null
        }
        Insert: {
          bracketid: number
          created_at?: string
          is_completed?: boolean
          location: number
          nextplayoffmatchid?: number | null
          nextslot?: Database["public"]["Enums"]["playoff_next_slot"] | null
          playoffmatchid?: number
          round: number
          teamaid?: number | null
          teambid?: number | null
          winnerteamid?: number | null
        }
        Update: {
          bracketid?: number
          created_at?: string
          is_completed?: boolean
          location?: number
          nextplayoffmatchid?: number | null
          nextslot?: Database["public"]["Enums"]["playoff_next_slot"] | null
          playoffmatchid?: number
          round?: number
          teamaid?: number | null
          teambid?: number | null
          winnerteamid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "playoff_match_bracketid_fkey1"
            columns: ["bracketid"]
            isOneToOne: false
            referencedRelation: "bracket"
            referencedColumns: ["bracketid"]
          },
          {
            foreignKeyName: "playoff_match_nextplayoffmatchid_fkey"
            columns: ["nextplayoffmatchid"]
            isOneToOne: false
            referencedRelation: "playoff_match"
            referencedColumns: ["playoffmatchid"]
          },
          {
            foreignKeyName: "playoff_match_teamaid_fkey"
            columns: ["teamaid"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
          {
            foreignKeyName: "playoff_match_teambid_fkey"
            columns: ["teambid"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
          {
            foreignKeyName: "playoff_match_winnerteamid_fkey"
            columns: ["winnerteamid"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
        ]
      }
      playoff_match_old: {
        Row: {
          bracketid: number
          location: number | null
          playoffmatchid: number
          round: number
          teamAId: number
          teamASeed: number
          teamAWonMatch: boolean | null
          teamBId: number
          teamBSeed: number
          winsByLosingTeam: number
        }
        Insert: {
          bracketid: number
          location?: number | null
          playoffmatchid?: number
          round?: number
          teamAId: number
          teamASeed: number
          teamAWonMatch?: boolean | null
          teamBId: number
          teamBSeed: number
          winsByLosingTeam?: number
        }
        Update: {
          bracketid?: number
          location?: number | null
          playoffmatchid?: number
          round?: number
          teamAId?: number
          teamASeed?: number
          teamAWonMatch?: boolean | null
          teamBId?: number
          teamBSeed?: number
          winsByLosingTeam?: number
        }
        Relationships: [
          {
            foreignKeyName: "playoff_match_bracketid_fkey"
            columns: ["bracketid"]
            isOneToOne: false
            referencedRelation: "bracket_old"
            referencedColumns: ["bracketid"]
          },
        ]
      }
      schedule: {
        Row: {
          divisionid: number | null
          last_updated: string | null
          leagueid: number | null
          matchdate: string | null
          recordedby: number | null
          scheduleid: number
          team1: number | null
          team1wins: number | null
          team2: number | null
          team2wins: number | null
        }
        Insert: {
          divisionid?: number | null
          last_updated?: string | null
          leagueid?: number | null
          matchdate?: string | null
          recordedby?: number | null
          scheduleid?: number
          team1?: number | null
          team1wins?: number | null
          team2?: number | null
          team2wins?: number | null
        }
        Update: {
          divisionid?: number | null
          last_updated?: string | null
          leagueid?: number | null
          matchdate?: string | null
          recordedby?: number | null
          scheduleid?: number
          team1?: number | null
          team1wins?: number | null
          team2?: number | null
          team2wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_divisionid_fkey"
            columns: ["divisionid"]
            isOneToOne: false
            referencedRelation: "division"
            referencedColumns: ["divisionid"]
          },
          {
            foreignKeyName: "schedule_leagueid_fkey"
            columns: ["leagueid"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["leagueid"]
          },
          {
            foreignKeyName: "schedule_recordedby_fkey"
            columns: ["recordedby"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
          {
            foreignKeyName: "schedule_team1_fkey"
            columns: ["team1"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
          {
            foreignKeyName: "schedule_team2_fkey"
            columns: ["team2"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
        ]
      }
      seed: {
        Row: {
          bracketid: number
          created_at: string
          seed: number
          teamid: number
        }
        Insert: {
          bracketid: number
          created_at?: string
          seed: number
          teamid: number
        }
        Update: {
          bracketid?: number
          created_at?: string
          seed?: number
          teamid?: number
        }
        Relationships: [
          {
            foreignKeyName: "seed_bracketid_fkey"
            columns: ["bracketid"]
            isOneToOne: false
            referencedRelation: "bracket"
            referencedColumns: ["bracketid"]
          },
          {
            foreignKeyName: "seed_teamid_fkey"
            columns: ["teamid"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["teamid"]
          },
        ]
      }
      seed_old: {
        Row: {
          bracketid: number
          seed: number
          seedid: number
          teamid: number
        }
        Insert: {
          bracketid: number
          seed: number
          seedid?: number
          teamid: number
        }
        Update: {
          bracketid?: number
          seed?: number
          seedid?: number
          teamid?: number
        }
        Relationships: []
      }
      team: {
        Row: {
          available_after: string | null
          available_recordedby: number | null
          divisionid: number | null
          femaleid: number
          leagueid: number
          maleid: number
          pref_divid: number | null
          prefdiv_changedby: number | null
          teamid: number
          teamname: string | null
        }
        Insert: {
          available_after?: string | null
          available_recordedby?: number | null
          divisionid?: number | null
          femaleid: number
          leagueid: number
          maleid: number
          pref_divid?: number | null
          prefdiv_changedby?: number | null
          teamid?: number
          teamname?: string | null
        }
        Update: {
          available_after?: string | null
          available_recordedby?: number | null
          divisionid?: number | null
          femaleid?: number
          leagueid?: number
          maleid?: number
          pref_divid?: number | null
          prefdiv_changedby?: number | null
          teamid?: number
          teamname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_available_recordedby_fkey"
            columns: ["available_recordedby"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
          {
            foreignKeyName: "team_prefdiv_changedby_fkey"
            columns: ["prefdiv_changedby"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
        ]
      }
      team_out: {
        Row: {
          created_by: number | null
          date_out: string | null
          divisionid: number | null
          femaleid_out: number | null
          found_sub: number | null
          last_updated: string | null
          leagueid: number | null
          maleid_out: number | null
          team_out_id: number
          teamid: number | null
        }
        Insert: {
          created_by?: number | null
          date_out?: string | null
          divisionid?: number | null
          femaleid_out?: number | null
          found_sub?: number | null
          last_updated?: string | null
          leagueid?: number | null
          maleid_out?: number | null
          team_out_id?: number
          teamid?: number | null
        }
        Update: {
          created_by?: number | null
          date_out?: string | null
          divisionid?: number | null
          femaleid_out?: number | null
          found_sub?: number | null
          last_updated?: string | null
          leagueid?: number | null
          maleid_out?: number | null
          team_out_id?: number
          teamid?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_out_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
          {
            foreignKeyName: "team_out_divisionid_fkey"
            columns: ["divisionid"]
            isOneToOne: false
            referencedRelation: "division"
            referencedColumns: ["divisionid"]
          },
          {
            foreignKeyName: "team_out_femaleid_out_fkey"
            columns: ["femaleid_out"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
          {
            foreignKeyName: "team_out_maleid_out_fkey"
            columns: ["maleid_out"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["playerid"]
          },
        ]
      }
    }
    Views: {
      distinct_macthdate: {
        Row: {
          leagueid: number | null
          matchdate: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_leagueid_fkey"
            columns: ["leagueid"]
            isOneToOne: false
            referencedRelation: "league"
            referencedColumns: ["leagueid"]
          },
        ]
      }
    }
    Functions: {
      calculate_standings: {
        Args: { leagueid: number }
        Returns: {
          teamname: string
          total: number
        }[]
      }
      calculate_standings4: {
        Args: never
        Returns: {
          teamname: string
          total: number
        }[]
      }
      select_schedule2: {
        Args: never
        Returns: {
          divisionname: string
          leagueid: number
          matchdate: string
          scheduleid: number
          team1: string
          team2: string
          wins1: number
          wins2: number
        }[]
      }
    }
    Enums: {
      playoff_next_slot: "A" | "B"
    }
    CompositeTypes: {
      schedule_result: {
        scheduleid: number | null
        matchdate: string | null
        team1: string | null
        wins1: number | null
        team2: string | null
        wins2: number | null
        divisionname: string | null
        leagueid: number | null
      }
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
      playoff_next_slot: ["A", "B"],
    },
  },
} as const
