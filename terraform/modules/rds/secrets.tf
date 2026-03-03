resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}-db-credentials"
  recovery_window_in_days = 0 
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "dbuser"
    password = var.db_password
    host     = aws_db_instance.main.address
    port     = 5432
    database = "appdb"
  })
}

output "secret_arn" {
  value = aws_secretsmanager_secret.db_credentials.arn
}
