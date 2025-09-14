# Seneca Health Coach 🏃‍♂️💪

<div align="center">

![Seneca Health Coach Banner](./archi%20(1).png)

*An intelligent, real-time fitness coaching platform that combines AI-powered fatigue prediction, personalized monthly planning, and comprehensive health monitoring with real-time anomaly detection.*

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

## 🌟 Overview

Seneca Health Coach is a full-stack fitness application that provides:
- **Real-time Health Monitoring**: Live tracking of heart rate, steps, and calories with anomaly detection
- **AI-Powered Fatigue Prediction**: Machine learning model to predict user energy levels
- **Smart Daily Planners**: Fatigue-adaptive meal planning and workout recommendations
- **Comprehensive User Management**: Multi-collection data storage and retrieval
- **Personalized Monthly Planning**: Automated fitness and nutrition plan generation
- **Real-time Data Processing**: Stream processing with Apache Spark and Kafka
- **Interactive Dashboard**: Modern React-based frontend with real-time updates

## 🏗️ Architecture

## 🏠️ Architecture

### System Architecture Overview

<div align="center">

![System Architecture](./archi%20(2).png)

*Comprehensive system architecture showing microservices, data flow, and technology stack*

</div>

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs   │    │  Data Pipeline  │
│   (Next.js)     │◄──►│   (FastAPI)      │◄──►│   (Kafka +      │
│                 │    │                  │    │    Spark)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                       ▲
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Notification   │    │    Databases     │    │   Monitoring    │
│   WebSocket     │    │ (MongoDB +       │    │   (Grafana)     │
│                 │    │  TimescaleDB)    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Frontend:**
- **Next.js 15.5.3** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Modern icon library

**Backend:**
- **FastAPI** - High-performance Python API framework (4 microservices)
- **Flask** - Lightweight framework for user data service
- **Machine Learning** - scikit-learn with pre-trained fatigue prediction model
- **Authentication** - JWT-based security with OAuth2

**Data Pipeline:**
- **Apache Kafka** - Real-time data streaming
- **Apache Spark** - Big data processing and analytics
- **Confluent Kafka Connect** - Data integration

**Databases:**
- **MongoDB** - User profiles and monthly plans
- **TimescaleDB** - Time-series health metrics
- **PostgreSQL** - Relational data storage

**Infrastructure:**
- **Docker & Docker Compose** - Containerized deployment
- **Grafana** - Metrics visualization and monitoring
- **AKHQ** - Kafka management interface
### ✨ Key Features

### 1. Real-time Health Dashboard
- **Live Metrics**: Real-time heart rate, step count, and calorie tracking
- **Interactive UI**: Beautiful, responsive dashboard with animated components
- **Progress Tracking**: Daily goal monitoring with visual progress bars
- **Multi-page Navigation**: Dedicated pages for logs, nutrition, sleep, and planning

### 2. AI-Powered Fatigue Prediction
- **Machine Learning Model**: Pre-trained model using health metrics
- **Input Parameters**:
  - Resting heart rate
  - Deep sleep duration
  - Sleep efficiency percentage
  - Number of awakenings
  - Exercise duration
  - Average heart rate during activity
- **Prediction Output**: Categorizes user state as Energetic (1), Neutral (0), or Fatigued (2)

### 3. Smart Daily Planners
- **Intelligent Meal Planning**: CSV-based nutrition database with 1000+ foods
- **Fatigue-Adaptive Meals**: Meal plans adjust based on energy level
  - Energetic (1): 5% calorie reduction for efficiency
  - Fatigued (2): 25% calorie increase + extra snacks for energy
- **Realistic Portion Sizes**: User-friendly serving descriptions
- **Macro Optimization**: Automatic adjustment to hit protein, carb, and fat targets
- **Workout Recommendations**: Activity suggestions based on fatigue and calorie goals

### 4. Advanced User Data Management
- **Flask-based User Service**: RESTful API for user data retrieval
- **MongoDB Integration**: Efficient storage and querying of user profiles
- **Data Import Pipeline**: Automated import of fitness datasets
- **Multi-collection Support**: Users, activities, heart rate, measurements, nutrition, sleep

### 5. Monthly Fitness Planning
- **Automated Goal Setting**: AI-generated goals based on user profile
- **Personalized Plans**: Custom calorie and macronutrient targets
- **Progress Tracking**: Monthly progression with adaptive planning
- **Goal Types**: Weight loss, weight gain, muscle gain, maintenance

### 6. Real-time Anomaly Detection
- **Health Monitoring**: Continuous analysis of vital signs
- **Alert System**: WebSocket-based real-time notifications
- **Thresholds**:
  - Heart rate: < 50 BPM or > 120 BPM
  - Steps: < 500 or > 10,000 per day
- **Visual Alerts**: Toast notifications with severity indicators

### 7. Data Processing Pipeline
- **Stream Processing**: Real-time data ingestion via Kafka
- **Batch Analytics**: Spark-based daily load calculations
- **ACWR Calculation**: Acute-to-Chronic Workload Ratio for injury prevention
- **Data Simulation**: Realistic fitness data generation for testing

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** 18+ (for frontend development)
- **Python** 3.8+ (for backend development)
- **Git**

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd senecaHack
   ```

2. **Start Infrastructure Services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - Kafka cluster
   - MongoDB
   - TimescaleDB
   - Grafana
   - Spark cluster
   - AKHQ (Kafka UI)

3. **Verify Services**
   ```bash
   # Check all services are running
   docker-compose ps
   
   # Access web interfaces:
   # - Grafana: http://localhost:3000
   # - AKHQ: http://localhost:8090
   # - Mongo Express: http://localhost:8081
   ```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Access at: http://localhost:3000

### Backend Services

#### 1. Fatigue Predictor & Activity Recommender
```bash
cd backend/fatigue_predictor
pip install -r ../../requirements.txt
uvicorn modelAPI:app --host 0.0.0.0 --port 8000
```
Access at: http://localhost:8000/docs

#### 2. Monthly Planner Service
```bash
cd backend/monthly_plan
uvicorn pipeline_main:app --host 0.0.0.0 --port 3001
```
Access at: http://localhost:3001/docs

#### 3. Smart Daily Planners

**Meal Planner Service:**
```bash
cd backend/daily_planners
pip install pandas fastapi uvicorn
uvicorn fatigued_meal_paln:app --host 0.0.0.0 --port 8002
```
Access at: http://localhost:8002/docs

**Workout Planner Service:**
```bash
cd backend/daily_planners
uvicorn workout_planner:app --host 0.0.0.0 --port 8003
```
Access at: http://localhost:8003/docs

#### 4. User Data Service
```bash
cd backend/user
pip install flask flask-cors pymongo
python app.py
```
Access at: http://localhost:5000

**Import fitness data:**
```bash
cd backend/user
python load_data.py
```

#### 5. Data Ingestion API
```bash
cd pipeline/ingestion
pip install confluent-kafka python-jose passlib[bcrypt]
python ingestion_api.py
```
Access at: http://localhost:8001/docs

#### 6. Notification Engine
```bash
cd backend
python notification_engine.py
```
WebSocket endpoint: ws://localhost:8001/ws/alerts

### Data Pipeline Setup

#### 1. Start Data Simulators
```bash
cd pipeline/simulators
pip install requests pandas
python realtime_simulator.py
```

#### 2. Submit Spark Jobs
```bash
# Submit data cleaning job
docker exec spark-master spark-submit \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0 \
  /opt/bitnami/spark/work/Datacleaning.py
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in respective directories:

**Backend Services:**
```env
API_KEY=your-secret-api-key
SECRET_KEY=your-jwt-secret
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
MONGODB_URI=mongodb://root:example@localhost:27017/

# Service Ports
FATIGUE_PREDICTOR_PORT=8000
MONTHLY_PLANNER_PORT=3001
MEAL_PLANNER_PORT=8002
WORKOUT_PLANNER_PORT=8003
USER_SERVICE_PORT=5000
INGESTION_API_PORT=8001
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

### Database Setup

#### MongoDB Collections
- `users_raw`: Raw user data
- `users_with_targets`: Users with assigned goals
- `users_monthly_plan`: Generated monthly plans

#### TimescaleDB Tables
- Health metrics time-series data
- Activity logs
- Sleep tracking data

## 📊 Monitoring & Observability

### Grafana Dashboards
Access Grafana at http://localhost:3000 (admin/admin)

**Available Dashboards:**
- Real-time health metrics
- Kafka message throughput
- API performance metrics
- System resource utilization

### Kafka Monitoring
- **AKHQ**: http://localhost:8090 - Kafka cluster management
- **Topics**: heartrate, steps, calories, alerts, activity, sleep
- **Consumer Groups**: notification_engine, spark_processor

## 🧪 Testing

### Load Testing
```bash
cd tests
pip install locust
locust -f locustfile.py --host=http://localhost:8000
```
Access Locust UI at: http://localhost:8089

### API Testing
All backend services include interactive Swagger documentation:
- **Fatigue Predictor & Activity Recommender**: http://localhost:8000/docs
- **Monthly Planner**: http://localhost:3001/docs
- **Meal Planner**: http://localhost:8002/docs
- **Workout Planner**: http://localhost:8003/docs
- **User Data Service**: http://localhost:5000 (Flask endpoints)
- **Data Ingestion**: http://localhost:8001/docs

### Data Management

#### Nutrition Database
- **nutrition-data.csv**: 1000+ food items with detailed macro information
- **Categories**: Fruits, Vegetables, Meats, Dairy, Grains, Nuts & Seeds
- **Nutritional Data**: Calories, protein, carbs, fats per serving
- **Smart Portioning**: Realistic serving size calculations

#### User Data Collections
- **users**: User profiles and basic information
- **activities**: Exercise and activity logs
- **heart_rate**: Real-time heart rate measurements
- **measurements**: Body measurements and vital statistics
- **nutrition**: Food intake and meal logs
- **sleep**: Sleep patterns and quality metrics

## 📱 Frontend Components

### Core Components
- **FitnessDashboard**: Main dashboard with live metrics
- **FatiguePredictor**: AI-powered fatigue assessment form
- **MonthPlanner**: Personalized monthly plan viewer
- **ActivityRecommander**: Smart workout suggestions
- **NotificationAlerts**: Real-time health alerts
- **MealPlanner**: Nutrition planning interface with macro optimization
- **FitnessLogs**: Activity tracking and logging interface
- **Profile**: User profile management
- **SleepLog**: Sleep tracking and analysis
- **NutritionLogs**: Food intake tracking

### Navigation Structure
```
Dashboard (/) or (/dashboard)
├── Health Tracking
│   ├── Activity Logs (/logs) - FitnessLogs component
│   ├── Nutrition (/nutritions) - NutritionLogs component
│   └── Sleep Tracking (/sleep) - SleepLog component
│   └── User Profile (/profile) - Profile component
└── Smart Features
    ├── Monthly Planner (/planner) - MonthPlanner component
    ├── Fatigue Predictor (/predict) - FatiguePredictor component
    ├── Activity Recommender (/recomander) - ActivityRecommander component
    └── Meal Planner (/meals) - MealPlanner component
```

## 🔐 Security

### Authentication
- JWT-based authentication for API access
- OAuth2 password flow
- API key protection for sensitive endpoints

### Data Protection
- Input validation with Pydantic models
- SQL injection prevention
- Rate limiting on API endpoints

## 🚀 Deployment

### Production Deployment

1. **Update Environment Variables**
   ```bash
   # Set production values
   export KAFKA_BOOTSTRAP_SERVERS=your-kafka-cluster
   export MONGODB_URI=your-mongodb-connection
   export SECRET_KEY=your-production-secret
   ```

2. **Build and Deploy**
   ```bash
   # Build frontend
   cd frontend && npm run build
   
   # Deploy with Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Scaling Considerations
- **Horizontal Scaling**: Add more Kafka partitions and Spark workers
- **Database Sharding**: Implement MongoDB sharding for user data
- **Load Balancing**: Use nginx for API load balancing
- **Caching**: Implement Redis for session management

## 📈 Performance Metrics

### Throughput Targets
- **Data Ingestion**: 10,000 messages/second
- **API Response Time**: < 200ms
- **WebSocket Latency**: < 50ms
- **ML Prediction**: < 100ms

### Resource Requirements
- **Minimum**: 8GB RAM, 4 CPU cores
- **Recommended**: 16GB RAM, 8 CPU cores
- **Storage**: 100GB for time-series data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**Kafka Connection Issues:**
```bash
# Restart Kafka services
docker-compose restart kafka

# Check Kafka logs
docker-compose logs kafka
```

**Frontend Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**ML Model Loading Issues:**
```bash
# Verify model file exists
ls backend/fatigue_predictor/perfect_model.pkl
```

### Documentation
- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed system design
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment

---

**Built with ❤️ for healthier living through intelligent technology**