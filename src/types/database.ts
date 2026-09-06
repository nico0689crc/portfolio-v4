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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          project_id: string
          updated_at: string
        }
        Insert: {
          project_id: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      case_study_metric_translations: {
        Row: {
          label: string
          locale: string
          metric_id: string
          value: string
        }
        Insert: {
          label: string
          locale: string
          metric_id: string
          value: string
        }
        Update: {
          label?: string
          locale?: string
          metric_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_metric_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "case_study_metric_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_metric_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_metric_translations_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "case_study_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      case_study_metrics: {
        Row: {
          id: string
          project_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          project_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_study_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["project_id"]
          },
        ]
      }
      case_study_phase_translations: {
        Row: {
          body: string | null
          label: string | null
          locale: string
          phase_id: string
          title: string | null
        }
        Insert: {
          body?: string | null
          label?: string | null
          locale: string
          phase_id: string
          title?: string | null
        }
        Update: {
          body?: string | null
          label?: string | null
          locale?: string
          phase_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_study_phase_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "case_study_phase_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_phase_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_phase_translations_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "case_study_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_study_phases: {
        Row: {
          id: string
          project_id: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          project_id: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          project_id?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_study_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["project_id"]
          },
        ]
      }
      case_study_translations: {
        Row: {
          context: string | null
          duration: string | null
          learnings: string | null
          locale: string
          note_html: string | null
          note_link_text: string | null
          note_url: string | null
          overview: string | null
          problem: string | null
          process_desc: string | null
          project_id: string
          results: string | null
          role: string | null
          team: string | null
        }
        Insert: {
          context?: string | null
          duration?: string | null
          learnings?: string | null
          locale: string
          note_html?: string | null
          note_link_text?: string | null
          note_url?: string | null
          overview?: string | null
          problem?: string | null
          process_desc?: string | null
          project_id: string
          results?: string | null
          role?: string | null
          team?: string | null
        }
        Update: {
          context?: string | null
          duration?: string | null
          learnings?: string | null
          locale?: string
          note_html?: string | null
          note_link_text?: string | null
          note_url?: string | null
          overview?: string | null
          problem?: string | null
          process_desc?: string | null
          project_id?: string
          results?: string | null
          role?: string | null
          team?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_study_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "case_study_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "case_study_translations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["project_id"]
          },
        ]
      }
      certification_translations: {
        Row: {
          certification_id: string
          locale: string
          name: string
        }
        Insert: {
          certification_id: string
          locale: string
          name: string
        }
        Update: {
          certification_id?: string
          locale?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "certification_translations_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certification_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "certification_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "certification_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      certifications: {
        Row: {
          id: string
          issuer: string
          sort_order: number
          url: string | null
          year: number
        }
        Insert: {
          id?: string
          issuer: string
          sort_order?: number
          url?: string | null
          year: number
        }
        Update: {
          id?: string
          issuer?: string
          sort_order?: number
          url?: string | null
          year?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          locale: string | null
          message: string
          name: string
          status: Database["public"]["Enums"]["message_status"]
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          locale?: string | null
          message: string
          name: string
          status?: Database["public"]["Enums"]["message_status"]
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          locale?: string | null
          message?: string
          name?: string
          status?: Database["public"]["Enums"]["message_status"]
          user_agent?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          end_date: string | null
          id: string
          institution: string
          sort_order: number
          start_date: string | null
          url: string | null
        }
        Insert: {
          end_date?: string | null
          id?: string
          institution: string
          sort_order?: number
          start_date?: string | null
          url?: string | null
        }
        Update: {
          end_date?: string | null
          id?: string
          institution?: string
          sort_order?: number
          start_date?: string | null
          url?: string | null
        }
        Relationships: []
      }
      education_translations: {
        Row: {
          date_label: string
          degree: string
          education_id: string
          locale: string
          location: string | null
        }
        Insert: {
          date_label: string
          degree: string
          education_id: string
          locale: string
          location?: string | null
        }
        Update: {
          date_label?: string
          degree?: string
          education_id?: string
          locale?: string
          location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_translations_education_id_fkey"
            columns: ["education_id"]
            isOneToOne: false
            referencedRelation: "education"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "education_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "education_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      experience_translations: {
        Row: {
          company: string | null
          date_label: string
          description: string
          experience_id: string
          locale: string
          location: string
          role: string
        }
        Insert: {
          company?: string | null
          date_label: string
          description: string
          experience_id: string
          locale: string
          location: string
          role: string
        }
        Update: {
          company?: string | null
          date_label?: string
          description?: string
          experience_id?: string
          locale?: string
          location?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_translations_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "experience_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "experience_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string
          employment_type: string
          end_date: string | null
          id: string
          organization: string
          periods: Json | null
          remote: boolean
          sort_order: number
          start_date: string | null
          techs: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          id?: string
          organization: string
          periods?: Json | null
          remote?: boolean
          sort_order?: number
          start_date?: string | null
          techs?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          id?: string
          organization?: string
          periods?: Json | null
          remote?: boolean
          sort_order?: number
          start_date?: string | null
          techs?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      faq_translations: {
        Row: {
          answer: string
          faq_id: string
          locale: string
          question: string
        }
        Insert: {
          answer: string
          faq_id: string
          locale: string
          question: string
        }
        Update: {
          answer?: string
          faq_id?: string
          locale?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_translations_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faq_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "faq_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "faq_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      faqs: {
        Row: {
          id: string
          sort_order: number
        }
        Insert: {
          id?: string
          sort_order?: number
        }
        Update: {
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      locales: {
        Row: {
          code: string
          enabled: boolean
          is_default: boolean
          name: string
          native_name: string
          sort_order: number
        }
        Insert: {
          code: string
          enabled?: boolean
          is_default?: boolean
          name: string
          native_name: string
          sort_order?: number
        }
        Update: {
          code?: string
          enabled?: boolean
          is_default?: boolean
          name?: string
          native_name?: string
          sort_order?: number
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          route_key: string
          sort_order: number
        }
        Insert: {
          route_key: string
          sort_order?: number
        }
        Update: {
          route_key?: string
          sort_order?: number
        }
        Relationships: []
      }
      page_seo_translations: {
        Row: {
          description: string
          locale: string
          noindex: boolean
          og_image: string | null
          route_key: string
          title: string
        }
        Insert: {
          description: string
          locale: string
          noindex?: boolean
          og_image?: string | null
          route_key: string
          title: string
        }
        Update: {
          description?: string
          locale?: string
          noindex?: boolean
          og_image?: string | null
          route_key?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_seo_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "page_seo_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "page_seo_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "page_seo_translations_route_key_fkey"
            columns: ["route_key"]
            isOneToOne: false
            referencedRelation: "page_seo"
            referencedColumns: ["route_key"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      post_translations: {
        Row: {
          body: string
          content_updated_at: string | null
          cover_alt: string | null
          excerpt: string
          focus_keyphrase: string | null
          locale: string
          noindex: boolean
          og_description: string | null
          og_image: string | null
          og_title: string | null
          post_id: string
          published_at: string | null
          reading_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          body: string
          content_updated_at?: string | null
          cover_alt?: string | null
          excerpt: string
          focus_keyphrase?: string | null
          locale: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          post_id: string
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          body?: string
          content_updated_at?: string | null
          cover_alt?: string | null
          excerpt?: string
          focus_keyphrase?: string | null
          locale?: string
          noindex?: boolean
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          post_id?: string
          published_at?: string | null
          reading_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "post_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "post_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "post_translations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          archived_at: string | null
          cover_blur_data_url: string | null
          cover_height: number | null
          cover_path: string | null
          cover_width: number | null
          created_at: string
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          cover_blur_data_url?: string | null
          cover_height?: number | null
          cover_path?: string | null
          cover_width?: number | null
          created_at?: string
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          cover_blur_data_url?: string | null
          cover_height?: number | null
          cover_path?: string | null
          cover_width?: number | null
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_image_translations: {
        Row: {
          alt: string
          image_id: string
          locale: string
        }
        Insert: {
          alt: string
          image_id: string
          locale: string
        }
        Update: {
          alt?: string
          image_id?: string
          locale?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_image_translations_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "project_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_image_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "project_image_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "project_image_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      project_images: {
        Row: {
          blur_data_url: string | null
          height: number
          id: string
          project_id: string
          sort_order: number
          storage_path: string
          width: number
        }
        Insert: {
          blur_data_url?: string | null
          height: number
          id?: string
          project_id: string
          sort_order?: number
          storage_path: string
          width: number
        }
        Update: {
          blur_data_url?: string | null
          height?: number
          id?: string
          project_id?: string
          sort_order?: number
          storage_path?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_translations: {
        Row: {
          description: string
          locale: string
          noindex: boolean
          project_id: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
        }
        Insert: {
          description: string
          locale: string
          noindex?: boolean
          project_id: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
        }
        Update: {
          description?: string
          locale?: string
          noindex?: boolean
          project_id?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "project_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "project_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "project_translations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          links: Json
          og_image: string | null
          published_at: string | null
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          techs: string[]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key: string
          links?: Json
          og_image?: string | null
          published_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          techs?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          links?: Json
          og_image?: string | null
          published_at?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          techs?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          from_path: string
          permanent: boolean
          to_path: string
        }
        Insert: {
          created_at?: string
          from_path: string
          permanent?: boolean
          to_path: string
        }
        Update: {
          created_at?: string
          from_path?: string
          permanent?: boolean
          to_path?: string
        }
        Relationships: []
      }
      resume_highlight_translations: {
        Row: {
          highlight_id: string
          label: string
          locale: string
          value: string
        }
        Insert: {
          highlight_id: string
          label: string
          locale: string
          value: string
        }
        Update: {
          highlight_id?: string
          label?: string
          locale?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_highlight_translations_highlight_id_fkey"
            columns: ["highlight_id"]
            isOneToOne: false
            referencedRelation: "resume_highlights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_highlight_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "resume_highlight_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "resume_highlight_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      resume_highlights: {
        Row: {
          id: string
          sort_order: number
        }
        Insert: {
          id?: string
          sort_order?: number
        }
        Update: {
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          id: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      skill_category_translations: {
        Row: {
          category_id: string
          label: string
          locale: string
        }
        Insert: {
          category_id: string
          label: string
          locale: string
        }
        Update: {
          category_id?: string
          label?: string
          locale?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_category_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "skill_category_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "skill_category_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      skill_translations: {
        Row: {
          locale: string
          name: string
          skill_id: string
        }
        Insert: {
          locale: string
          name: string
          skill_id: string
        }
        Update: {
          locale?: string
          name?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "skill_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "skill_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "skill_translations_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category_id: string
          id: string
          is_translatable: boolean
          name_default: string
          sort_order: number
        }
        Insert: {
          category_id: string
          id?: string
          is_translatable?: boolean
          name_default: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          id?: string
          is_translatable?: boolean
          name_default?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_redirects: {
        Row: {
          created_at: string
          entity_type: string
          from_slug: string
          locale: string
          to_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          from_slug: string
          locale: string
          to_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          from_slug?: string
          locale?: string
          to_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "slug_redirects_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "slug_redirects_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "slug_redirects_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
      tag_translations: {
        Row: {
          locale: string
          name: string
          slug: string
          tag_id: string
        }
        Insert: {
          locale: string
          name: string
          slug: string
          tag_id: string
        }
        Update: {
          locale?: string
          name?: string
          slug?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tag_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "tag_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "tag_translations_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "tag_translations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          key: string
          sort_order: number
        }
        Insert: {
          id?: string
          key: string
          sort_order?: number
        }
        Update: {
          id?: string
          key?: string
          sort_order?: number
        }
        Relationships: []
      }
      ui_message_keys: {
        Row: {
          allows_html: boolean
          key: string
          namespace: string
          notes: string | null
          sort_order: number
        }
        Insert: {
          allows_html?: boolean
          key: string
          namespace: string
          notes?: string | null
          sort_order?: number
        }
        Update: {
          allows_html?: boolean
          key?: string
          namespace?: string
          notes?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      ui_messages: {
        Row: {
          key: string
          locale: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          locale: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          locale?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_messages_key_fkey"
            columns: ["key"]
            isOneToOne: false
            referencedRelation: "ui_message_keys"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "ui_messages_key_fkey"
            columns: ["key"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "ui_messages_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "ui_messages_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_message_coverage"
            referencedColumns: ["locale"]
          },
          {
            foreignKeyName: "ui_messages_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "ui_messages_missing"
            referencedColumns: ["locale"]
          },
        ]
      }
    }
    Views: {
      ui_message_coverage: {
        Row: {
          locale: string | null
          missing_keys: number | null
          namespace: string | null
          total_keys: number | null
          translated_keys: number | null
        }
        Relationships: []
      }
      ui_messages_missing: {
        Row: {
          key: string | null
          locale: string | null
          namespace: string | null
          notes: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_valid_periods: { Args: { v: Json }; Returns: boolean }
      project_is_published: { Args: { pid: string }; Returns: boolean }
    }
    Enums: {
      content_status: "draft" | "published"
      message_status: "new" | "read" | "replied" | "spam"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      content_status: ["draft", "published"],
      message_status: ["new", "read", "replied", "spam"],
    },
  },
} as const
