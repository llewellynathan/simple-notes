export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          content: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          content: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          content?: string;
          user_id?: string;
        };
      };
    };
  };
}; 