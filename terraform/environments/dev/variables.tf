variable "region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "alpha-eks-demo"
}

variable "cluster_name" {
  type    = string
  default = "demo-eks"
}

variable "db_password" {
  type      = string
  sensitive = true
}
