export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bracket: {
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
      }
      player: {
        Row: {
          elo: number | null
          email: string | null
          entrydate: string | null
          firstname: string | null
          gender: string | null
          lastname: string | null
          phone: string | null
          playerid: number
        }
        Insert: {
          elo?: number | null
          email?: string | null
          entrydate?: string | null
          firstname?: string | null
          gender?: string | null
          lastname?: string | null
          phone?: string | null
          playerid?: number
        }
        Update: {
          elo?: number | null
          email?: string | null
          entrydate?: string | null
          firstname?: string | null
          gender?: string | null
          lastname?: string | null
          phone?: string | null
          playerid?: number
        }
      }
      playoff_match: {
        Row: {
          bracketid: number
          highseedid: number | null
          lowseedid: number | null
          playoffmatchid: number
          winnerid: number | null
          winnermatchid: number | null
        }
        Insert: {
          bracketid: number
          highseedid?: number | null
          lowseedid?: number | null
          playoffmatchid?: number
          winnerid?: number | null
          winnermatchid?: number | null
        }
        Update: {
          bracketid?: number
          highseedid?: number | null
          lowseedid?: number | null
          playoffmatchid?: number
          winnerid?: number | null
          winnermatchid?: number | null
        }
      }
      result: {
        Row: {
          divisionid: number | null
          leagueid: number
          matchdate: string
          resultid: number
          team1: number
          team1wins: number | null
          team2: number
          team2wins: number | null
        }
        Insert: {
          divisionid?: number | null
          leagueid: number
          matchdate: string
          resultid?: number
          team1: number
          team1wins?: number | null
          team2: number
          team2wins?: number | null
        }
        Update: {
          divisionid?: number | null
          leagueid?: number
          matchdate?: string
          resultid?: number
          team1?: number
          team1wins?: number | null
          team2?: number
          team2wins?: number | null
        }
      }
      schedule: {
        Row: {
          divisionid: number | null
          leagueid: number | null
          matchdate: string | null
          scheduleid: number
          team1: number | null
          team1wins: number | null
          team2: number | null
          team2wins: number | null
        }
        Insert: {
          divisionid?: number | null
          leagueid?: number | null
          matchdate?: string | null
          scheduleid?: number
          team1?: number | null
          team1wins?: number | null
          team2?: number | null
          team2wins?: number | null
        }
        Update: {
          divisionid?: number | null
          leagueid?: number | null
          matchdate?: string | null
          scheduleid?: number
          team1?: number | null
          team1wins?: number | null
          team2?: number | null
          team2wins?: number | null
        }
      }
      seed: {
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
      }
      team: {
        Row: {
          divisionid: number | null
          femaleid: number
          leagueid: number
          maleid: number
          teamid: number
          teamname: string | null
        }
        Insert: {
          divisionid?: number | null
          femaleid: number
          leagueid: number
          maleid: number
          teamid?: number
          teamname?: string | null
        }
        Update: {
          divisionid?: number | null
          femaleid?: number
          leagueid?: number
          maleid?: number
          teamid?: number
          teamname?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
