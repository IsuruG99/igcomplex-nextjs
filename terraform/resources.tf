resource "vercel_project" "portfolio" {
  name      = var.project_name
  framework = "nextjs"
  
  environment = [
    {
        key   = "NEXT_PUBLIC_SITE_URL"
        value = "https://${var.project_name}.vercel.app"
    },
    {
        key   = "NEXT_PUBLIC_SUPABASE_URL"
        value = var.supabase_url
    },
    {
        key   = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        value = var.supabase_anon_key
    },
    {
        key   = "SUPABASE_SERVICE_ROLE_KEY"
        value = var.supabase_service_key
    },
    {
        key   = "OWNER_USERNAME"
        value = var.owner_username
    },
    {
        key   = "OWNER_PASSWORD_HASH"
        value = var.owner_password_hash
    },
    {
        key   = "OWNER_SESSION_SECRET"
        value = var.owner_session_secret
    }
  ]
}

resource "vercel_deployment" "portfolio" {
  project_id  = vercel_project.igcomplex.id
  production  = true
}