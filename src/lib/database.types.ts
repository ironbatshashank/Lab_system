export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | 'lab_director'
  | 'engineer'
  | 'hsm'
  | 'lab_technician'
  | 'supervisor'
  | 'quality_manager'
  | 'external_client'
  | 'account_manager';

export type ProjectStatus =
  | 'draft'
  | 'pending_supervisor'
  | 'pending_hsm'
  | 'pending_technician'
  | 'approved'
  | 'in_progress'
  | 'completed';

export type RequestType = 'problem' | 'proposal';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RequestStatus =
  | 'new'
  | 'under_review'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'converted_to_project';

export type ResponseStatus = 'draft' | 'sent' | 'revised' | 'accepted' | 'rejected';

export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          organization: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: UserRole;
          organization?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          organization?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          engineer_id: string;
          title: string;
          description: string;
          objectives: string;
          equipment_needed: Json;
          timeline_duration: string;
          safety_considerations: string;
          expected_outcomes: string;
          status: ProjectStatus;
          linked_client_request_id: string | null;
          created_at: string;
          updated_at: string;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          engineer_id: string;
          title: string;
          description: string;
          objectives: string;
          equipment_needed?: Json;
          timeline_duration: string;
          safety_considerations: string;
          expected_outcomes: string;
          status?: ProjectStatus;
          linked_client_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          engineer_id?: string;
          title?: string;
          description?: string;
          objectives?: string;
          equipment_needed?: Json;
          timeline_duration?: string;
          safety_considerations?: string;
          expected_outcomes?: string;
          status?: ProjectStatus;
          linked_client_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
        };
      };
      client_requests: {
        Row: {
          id: string;
          client_id: string;
          request_type: RequestType;
          title: string;
          description: string;
          detailed_requirements: string;
          priority: RequestPriority;
          attachments: Json;
          status: RequestStatus;
          assigned_account_manager_id: string | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          request_type: RequestType;
          title: string;
          description: string;
          detailed_requirements: string;
          priority?: RequestPriority;
          attachments?: Json;
          status?: RequestStatus;
          assigned_account_manager_id?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          request_type?: RequestType;
          title?: string;
          description?: string;
          detailed_requirements?: string;
          priority?: RequestPriority;
          attachments?: Json;
          status?: RequestStatus;
          assigned_account_manager_id?: string | null;
          submitted_at?: string;
          updated_at?: string;
        };
      };
      client_responses: {
        Row: {
          id: string;
          request_id: string;
          account_manager_id: string;
          response_text: string;
          quotation_amount: number | null;
          currency: string;
          estimated_timeline: string;
          deliverables: Json;
          terms_and_conditions: string | null;
          status: ResponseStatus;
          created_at: string;
          sent_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          account_manager_id: string;
          response_text: string;
          quotation_amount?: number | null;
          currency?: string;
          estimated_timeline: string;
          deliverables?: Json;
          terms_and_conditions?: string | null;
          status?: ResponseStatus;
          created_at?: string;
          sent_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          account_manager_id?: string;
          response_text?: string;
          quotation_amount?: number | null;
          currency?: string;
          estimated_timeline?: string;
          deliverables?: Json;
          terms_and_conditions?: string | null;
          status?: ResponseStatus;
          created_at?: string;
          sent_at?: string | null;
          updated_at?: string;
        };
      };
      client_request_messages: {
        Row: {
          id: string;
          request_id: string;
          sender_id: string;
          message_text: string;
          attachments: Json;
          is_internal_note: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          sender_id: string;
          message_text: string;
          attachments?: Json;
          is_internal_note?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          sender_id?: string;
          message_text?: string;
          attachments?: Json;
          is_internal_note?: boolean;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          comment_text: string;
          stage: string | null;
          is_internal: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          comment_text: string;
          stage?: string | null;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          comment_text?: string;
          stage?: string | null;
          is_internal?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          project_id: string;
          approver_id: string | null;
          approver_role: string;
          status: ApprovalStatus;
          comments: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          approver_id?: string | null;
          approver_role: string;
          status?: ApprovalStatus;
          comments?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          approver_id?: string | null;
          approver_role?: string;
          status?: ApprovalStatus;
          comments?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
      };
      project_results: {
        Row: {
          id: string;
          project_id: string;
          uploaded_by: string;
          file_name: string;
          file_url: string;
          file_type: string;
          parsed_data: Json | null;
          is_client_visible: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          uploaded_by: string;
          file_name: string;
          file_url: string;
          file_type: string;
          parsed_data?: Json | null;
          is_client_visible?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          uploaded_by?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          parsed_data?: Json | null;
          is_client_visible?: boolean;
          uploaded_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          notification_type: string;
          title: string;
          message: string;
          project_id: string | null;
          request_id: string | null;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_type: string;
          title: string;
          message: string;
          project_id?: string | null;
          request_id?: string | null;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_type?: string;
          title?: string;
          message?: string;
          project_id?: string | null;
          request_id?: string | null;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
