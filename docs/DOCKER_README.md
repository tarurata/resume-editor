# Resume Editor - Docker Setup

This guide explains how to run the Resume Editor application using Docker.

## 🐳 **Quick Start**

### Prerequisites
- Docker Desktop installed and running
- Git (to clone the repository)

### 1. Start All Services
```bash
./docker-run.sh start
```

This will:
- Build the Docker images for both frontend and backend
- Start all services in detached mode
- Set up persistent data storage
- Run health checks

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📋 **Available Commands**

### Using the Management Script
```bash
./docker-run.sh [COMMAND]
```

**Commands:**
- `start` - Build and start all services
- `stop` - Stop all services
- `restart` - Restart all services
- `logs` - View logs for all services
- `backend` - View backend logs only
- `frontend` - View frontend logs only
- `status` - Show status of all services
- `test` - Run API tests
- `cleanup` - Remove all containers, images, and volumes
- `help` - Show help message

### Using Docker Compose Directly
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## 🏗️ **Architecture**

### Services
1. **Backend (FastAPI)**
   - Port: 8000
   - Database: SQLite (persistent volume)
   - Health check: `/api/v1/health`

2. **Frontend (Next.js)**
   - Port: 3000
   - Environment: Production
   - Health check: `/health`

### Data Persistence
- Database file: `resume_editor.db` (mounted as volume)
- Data directory: `./data/` (mounted as volume)

## 🔧 **Configuration**

### Environment Variables
Backend environment variables (in `docker-compose.yml`):
```yaml
environment:
  - HOST=0.0.0.0
  - PORT=8000
  - DEBUG=false
```

### Ports
- **8000**: Backend API
- **3000**: Frontend application

## 🧪 **Testing**

### Run API Tests
```bash
./docker-run.sh test
```

### Manual Testing
1. Access the API documentation at http://localhost:8000/docs
2. Use the interactive Swagger UI to test endpoints
3. Check the health endpoint: http://localhost:8000/api/v1/health

## 📊 **Monitoring**

### View Logs
```bash
# All services
./docker-run.sh logs

# Backend only
./docker-run.sh backend

# Frontend only
./docker-run.sh frontend
```

### Check Status
```bash
./docker-run.sh status
```

## 🗃️ **Data Management**

### Database
- The SQLite database is stored in `resume_editor.db`
- Data persists between container restarts
- To reset the database, delete the file and restart

### Backup
```bash
# Backup database
cp resume_editor.db resume_editor_backup_$(date +%Y%m%d_%H%M%S).db
```

## 🚨 **Troubleshooting**

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Docker Not Running**
   ```bash
   # Start Docker Desktop
   open -a Docker
   ```

3. **Permission Issues**
   ```bash
   # Make script executable
   chmod +x docker-run.sh
   ```

4. **Database Issues**
   ```bash
   # Remove database and restart
   rm resume_editor.db
   ./docker-run.sh restart
   ```

### View Detailed Logs
```bash
# Backend logs with timestamps
docker-compose logs -f --timestamps backend

# All logs with timestamps
docker-compose logs -f --timestamps
```

### Clean Restart
```bash
# Stop and remove everything
./docker-run.sh cleanup

# Start fresh
./docker-run.sh start
```

## 🔄 **Development Workflow**

### Making Changes
1. Make your code changes
2. The containers will automatically reload (if using `--reload`)
3. Check logs to see if changes are applied

### Rebuilding After Major Changes
```bash
# Rebuild and restart
docker-compose up --build -d
```

## 📁 **File Structure**
```
resume-editor/
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile.backend          # Backend Docker image
├── Dockerfile.frontend         # Frontend Docker image
├── .dockerignore              # Docker ignore file
├── docker-run.sh              # Management script
├── resume_editor.db           # SQLite database (created on first run)
├── data/                      # Data directory (mounted volume)
└── ...
```

## 🎯 **Production Considerations**

### Security
- Change default ports in production
- Use environment variables for sensitive data
- Enable HTTPS
- Set up proper authentication

### Performance
- Use a production database (PostgreSQL, MySQL)
- Configure proper resource limits
- Set up monitoring and logging
- Use a reverse proxy (nginx)

### Scaling
- Use Docker Swarm or Kubernetes
- Set up load balancing
- Implement horizontal scaling
- Use external database services

## 📞 **Support**

If you encounter issues:
1. Check the logs: `./docker-run.sh logs`
2. Verify Docker is running: `docker info`
3. Check port availability
4. Review the troubleshooting section above

For more help, check the main README.md or create an issue in the repository.
