variable "vercel_api_token" {
  sensitive = true
}

variable "project_name" {
  default = "igcomplex"
}

variable "supabase_url" {
  sensitive = true
}

variable "supabase_anon_key" {
  sensitive = true
}

variable "supabase_service_key" {
  sensitive = true
}

variable "owner_username" {
  sensitive = true
}

variable "owner_password_hash" {
  description = "Bcrypted Hash"
  sensitive   = true
}

variable "owner_session_secret" {
  sensitive = true
}
