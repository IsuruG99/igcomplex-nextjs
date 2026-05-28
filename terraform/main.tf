terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.14"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}