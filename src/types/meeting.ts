export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  room_id?: string;
  host_id: string;
  participants: string[]; // Array of user IDs
  recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  is_private: boolean;
  meeting_link?: string;
  created_at: string;
}

export interface MeetingFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  participants: string[];
  recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly';
  is_private: boolean;
}
