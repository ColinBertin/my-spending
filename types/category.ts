export interface Category {
  id: string;
  type?: "normal" | "professional";
  user_id?: string;
  name: string;
  color?: string;
  created_at?: Date;
  icon?: string;
  icon_pack?: string;
}
