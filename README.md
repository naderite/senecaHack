# Seneca Health Coach 🏃‍♂️💪

An intelligent, real-time fitness coaching platform that combines AI-powered fatigue prediction, personalized monthly planning, and comprehensive health monitoring with real-time anomaly detection.

## 🌟 Overview

Seneca Health Coach is a full-stack fitness application that provides:
- **Real-time Health Monitoring**: Live tracking of heart rate, steps, and calories with anomaly detection
- **AI-Powered Fatigue Prediction**: Machine learning model to predict user energy levels
- **Personalized Monthly Planning**: Automated fitness and nutrition plan generation
- **Activity Recommendations**: Smart workout suggestions based on fatigue levels
- **Real-time Data Processing**: Stream processing with Apache Spark and Kafka
- **Interactive Dashboard**: Modern React-based frontend with real-time updates

## 🏗️ Architecture

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

### Technology Stack

**Frontend:**
- **Next.js 15.5.3** - React framework with server-side rendering
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Modern icon library

**Backend:**
- **FastAPI** - High-performance Python API framework
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

## ✨ Key Features

### 1. Real-time Health Dashboard
- **Live Metrics**: Real-time heart rate, step count, and calorie tracking
- **Interactive UI**: Beautiful, responsive dashboard with animated components
- **Progress Tracking**: Daily goal monitoring with visual progress bars

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

### 3. Smart Activity Recommendations
- **Fatigue-Aware Planning**: Suggests appropriate activities based on predicted energy level
- **Activity Types**: Yoga, Walking, Swimming, Cycling, Weight Training, Running, Pilates
- **Calorie Optimization**: Recommends duration to meet target calorie burn
- **Safety Constraints**: Limits high-intensity activities when fatigued

### 4. Monthly Fitness Planning
- **Automated Goal Setting**: AI-generated goals based on user profile
- **Personalized Plans**: Custom calorie and macronutrient targets
- **Progress Tracking**: Monthly progression with adaptive planning
- **Goal Types**: Weight loss, weight gain, muscle gain, maintenance

### 5. Real-time Anomaly Detection
- **Health Monitoring**: Continuous analysis of vital signs
- **Alert System**: WebSocket-based real-time notifications
- **Thresholds**:
  - Heart rate: < 50 BPM or > 120 BPM
  - Steps: < 500 or > 10,000 per day
- **Visual Alerts**: Toast notifications with severity indicators

### 6. Data Processing Pipeline
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

#### 3. Data Ingestion API
```bash
cd pipeline/ingestion
pip install confluent-kafka python-jose passlib[bcrypt]
python ingestion_api.py
```
Access at: http://localhost:8001/docs

#### 4. Notification Engine
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
- Fatigue Predictor: http://localhost:8000/docs
- Monthly Planner: http://localhost:3001/docs
- Data Ingestion: http://localhost:8001/docs

## 📱 Frontend Components

### Core Components
- **FitnessDashboard**: Main dashboard with live metrics
- **FatiguePredictor**: AI-powered fatigue assessment form
- **MonthPlanner**: Personalized monthly plan viewer
- **ActivityRecommander**: Smart workout suggestions
- **NotificationAlerts**: Real-time health alerts
- **MealPlanner**: Nutrition planning interface

### Navigation Structure
```
Dashboard (/)
├── Health Tracking
│   ├── Activity Logs (/logs)
│   ├── Nutrition (/nutritions)
│   └── Sleep Tracking (/sleep)
└── Smart Features
    ├── Monthly Planner (/planner)
    ├── Fatigue Predictor (/predict)
    ├── Activity Recommender (/recomander)
    └── Meal Planner (/meals)
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