resource "vercel_project" "portfolio" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "IsuruG99/igcomplex-nextjs"
  }

  environment = [
    {
      key    = "NEXT_PUBLIC_SITE_URL"
      value  = "https://${var.project_name}.vercel.app"
      target = ["preview", "production"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = var.supabase_url
      target = ["preview", "production"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["preview", "production"]
    },
    {
      key    = "SUPABASE_SERVICE_ROLE_KEY"
      value  = var.supabase_service_key
      target = ["preview", "production"]
    },
    {
      key    = "OWNER_USERNAME"
      value  = var.owner_username
      target = ["preview", "production"]
    },
    {
      key    = "OWNER_PASSWORD_HASH"
      value  = var.owner_password_hash
      target = ["preview", "production"]
    },
    {
      key    = "OWNER_SESSION_SECRET"
      value  = var.owner_session_secret
      target = ["preview", "production"]
    }
  ]
}