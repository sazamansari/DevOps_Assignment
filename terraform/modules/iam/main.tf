resource "aws_iam_policy" "secrets_manager_access" {
  name        = "${var.project_name}-secrets-policy"
  description = "Allow backend to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Effect   = "Allow"
        Resource = var.secret_arn
      }
    ]
  })
}

module "irsa_role" {
  source  = "terraform-aws-modules/iam/aws
  version = "~> 5.0"

  role_name = "${var.project_name}-backend-irsa"

  oidc_providers = {
    main = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = ["default:backend-sa"]
    }
  }

  role_policy_arns = {
    secrets = aws_iam_policy.secrets_manager_access.arn
  }
}

output "irsa_role_arn" {
  value = module.irsa_role.iam_role_arn
}
