# 🚀 Alpha EKS Demo Project

A complete, production-grade DevOps implementation featuring a Node.js backend, Nginx frontend, and AWS infrastructure managed via Terraform.

## 🏗️ Architecture Overview

- **Infrastructure**: AWS (VPC, EKS, RDS, ECR, Secrets Manager, CloudWatch).
- **VPC**: Multi-AZ with public and private subnets.
- **Compute**: EKS with Managed Node Groups (t3.small).
- **Database**: PostgreSQL RDS (Private).
- **Security**: IAM Roles for Service Accounts (IRSA) for secure pod-level AWS access.
- **Deployment**: automated via GitHub Actions.
- **Observability**: CloudWatch Dashboard for EKS, RDS, and ALB metrics.

## 📋 Prerequisites

- AWS CLI configured with administrator access.
- Terraform >= 1.0.0.
- kubectl installed.
- Docker installed (for local builds).

## 🚀 Deployment Steps

### 1. Infrastructure (Terraform)

```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### 2. Application (via CI/CD)

1. Push code to the `main` branch.
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in GitHub Secrets.
3. The pipeline will build, push to ECR, and deploy to EKS.

### 3. Manual Deployment (Optional)

```bash
# Update Kubeconfig
aws eks update-kubeconfig --name demo-eks --region ap-south-1

# Apply manifests
kubectl apply -f k8s/
```

## 🔍 Verification

1. **Health Check**: `GET <ALB_URL>/health` should return `OK`.
2. **Database Check**: `GET <ALB_URL>/api/ready` should return `status: ready` and the DB version.
3. **Frontend**: Access `<ALB_URL>/` to see the UI.

## 🧹 Cleanup

```bash
terraform destroy
```

## 🛡️ Security Details

- **IRSA**: The backend pod uses a dedicated ServiceAccount linked to an IAM role with restricted access to Secrets Manager.
- **Network**: RDS is isolated in private subnets, only accessible from the EKS nodes.
