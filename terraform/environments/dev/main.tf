terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "alpha-eks-tf-state"
    key            = "dev/terraform.tfstate"
    region       = "ap-south-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  cluster_name = var.cluster_name
}

module "eks" {
  source             = "../../modules/eks"
  cluster_name       = var.cluster_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
}

module "ecr" {
  source = "../../modules/ecr"
}

module "rds" {
  source             = "../../modules/rds"
  project_name       = var.project_name
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  eks_node_sg_id     = module.eks.node_security_group_id
  db_password        = var.db_password
}

module "iam" {
  source            = "../../modules/iam"
  project_name      = var.project_name
  oidc_provider_arn = module.eks.oidc_provider_arn
  secret_arn        = module.rds.secret_arn
}

module "monitoring" {
  source       = "../../modules/monitoring"
  project_name = var.project_name
  region       = var.region
}

# Outputs
output "cluster_name" {
  value = module.eks.cluster_name
}

output "ecr_backend_url" {
  value = module.ecr.backend_repo_url
}

output "ecr_frontend_url" {
  value = module.ecr.frontend_repo_url
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "irsa_role_arn" {
  value = module.iam.irsa_role_arn
}
