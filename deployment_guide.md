# 📖 Step-by-Step Deployment Guide

Follow these steps exactly to deploy the Alpha EKS project into a fresh AWS account.

---

### Phase 1: Prerequisites & AWS Setup

1. **Install Tools**:
   - `aws-cli`, `terraform`, `kubectl`, `docker`
2. **Configure AWS Credentials**:
   ```bash
   aws configure
   # Enter your Access Key, Secret Key, and region (ap-south-1)
   ```
3. **Bootstrap Terraform State (Required)**:
   Since the project uses a remote S3 backend, you must create the bucket and DynamoDB table first:
   ```bash
   # Create S3 Bucket
   aws s3 mb s3://alpha-eks-tf-state --region ap-south-1

   # Create DynamoDB Table for locking
   aws dynamodb create-table \
       --table-name alpha-eks-lock \
       --attribute-definitions AttributeName=LockID,AttributeType=S \
       --key-schema AttributeName=LockID,KeyType=HASH \
       --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
       --region ap-south-1
   ```

---

### Phase 2: Deploy Infrastructure

1. **Initialize Terraform**:
   ```bash
   cd terraform/environments/dev
   terraform init
   ```
2. **Apply Infrastructure**:
   ```bash
   terraform apply -auto-approve
   ```
   > [!NOTE]
   > This takes ~15-20 minutes. Note the outputs: `cluster_name`, `ecr_backend_url`, `ecr_frontend_url`, and `rds_endpoint`.

---

### Phase 3: Prepare Kubernetes Context

1. **Update Kubeconfig**:
   ```bash
   aws eks update-kubeconfig --name demo-eks --region ap-south-1
   ```
2. **Install AWS Load Balancer Controller**:
   The ALB Ingress requires the controller. Use the existing Terraform IRSA roles or follow the official guide to install via Helm.

---

### Phase 4: Build & Push Images

1. **Login to ECR**:
   ```bash
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-south-1.amazonaws.com
   ```
2. **Build & Push Backend**:
   ```bash
   cd app/backend
   docker build -t demo-backend .
   docker tag demo-backend:latest $(aws ecr describe-repositories --repository-names demo-backend --query 'repositories[0].repositoryUri' --output text):latest
   docker push $(aws ecr describe-repositories --repository-names demo-backend --query 'repositories[0].repositoryUri' --output text):latest
   ```
3. **Build & Push Frontend (React)**:
   ```bash
   cd ../frontend
   docker build -t demo-frontend .
   docker tag demo-frontend:latest $(aws ecr describe-repositories --repository-names demo-frontend --query 'repositories[0].repositoryUri' --output text):latest
   docker push $(aws ecr describe-repositories --repository-names demo-frontend --query 'repositories[0].repositoryUri' --output text):latest
   ```

---

### Phase 5: Deploy Application

1. **Update Manifests**:
   Replace `<ACCOUNT_ID>` in `k8s/service-account.yaml`, `k8s/backend-deployment.yaml`, and `k8s/frontend-deployment.yaml` with your actual AWS Account ID.
2. **Apply Manifests**:
   ```bash
   cd ../../k8s
   kubectl apply -f .
   ```

---

### Phase 6: Verification

1. **Check Pods**: `kubectl get pods` (Wait for `Running`)
2. **Get Ingress URL**:
   ```bash
   kubectl get ingress app-ingress
   ```
   *Note: It may take 3-5 minutes for the ALB to provision and pass health checks.*
3. **Test Endpoints**:
   - `http://<ALB-DNS>/` -> Should show React UI.
   - `http://<ALB-DNS>/api/ready` -> Should show DB connection status.

---

### Phase 7: GitHub Actions CI/CD (Optional)

1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
3. Push to `main` branch to trigger the pipeline.
