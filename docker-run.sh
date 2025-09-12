#!/bin/bash

# Resume Editor Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
}

# Function to build and start services
start_services() {
    print_status "Building and starting Resume Editor services..."
    
    # Create data directory if it doesn't exist
    mkdir -p ./data
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Services started successfully!"
    print_status "Backend API: http://localhost:8000"
    print_status "Frontend: http://localhost:3000"
    print_status "API Documentation: http://localhost:8000/docs"
    print_status "ReDoc: http://localhost:8000/redoc"
}

# Function to stop services
stop_services() {
    print_status "Stopping Resume Editor services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Function to view logs
view_logs() {
    print_status "Showing logs for all services..."
    docker-compose logs -f
}

# Function to view backend logs only
view_backend_logs() {
    print_status "Showing backend logs..."
    docker-compose logs -f backend
}

# Function to view frontend logs only
view_frontend_logs() {
    print_status "Showing frontend logs..."
    docker-compose logs -f frontend
}

# Function to restart services
restart_services() {
    print_status "Restarting Resume Editor services..."
    docker-compose restart
    print_success "Services restarted successfully!"
}

# Function to clean up (remove containers, images, volumes)
cleanup() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_status "Resume Editor Services Status:"
    docker-compose ps
}

# Function to run tests
run_tests() {
    print_status "Running API tests..."
    docker-compose exec backend python3 test_api_endpoints.py
}

# Function to show help
show_help() {
    echo "Resume Editor Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View logs for all services"
    echo "  backend   View backend logs only"
    echo "  frontend  View frontend logs only"
    echo "  status    Show status of all services"
    echo "  test      Run API tests"
    echo "  cleanup   Remove all containers, images, and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start all services"
    echo "  $0 logs           # View all logs"
    echo "  $0 backend        # View backend logs"
    echo "  $0 test           # Run API tests"
}

# Main script logic
case "${1:-help}" in
    start)
        check_docker
        start_services
        ;;
    stop)
        check_docker
        stop_services
        ;;
    restart)
        check_docker
        restart_services
        ;;
    logs)
        check_docker
        view_logs
        ;;
    backend)
        check_docker
        view_backend_logs
        ;;
    frontend)
        check_docker
        view_frontend_logs
        ;;
    status)
        check_docker
        show_status
        ;;
    test)
        check_docker
        run_tests
        ;;
    cleanup)
        check_docker
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
