//! RabbitMQ Workers for EBKUST University Management System
//!
//! This service consumes messages from RabbitMQ queues for async processing.
//! It runs alongside Celery workers without replacing them.

use lapin::{
    options::*, types::FieldTable, Connection, ConnectionProperties,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod consumers;

use shared::{db::create_pool, Settings};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "workers=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🦀 Starting Rust Workers...");

    // Load configuration
    let settings = Settings::load()?;

    // Create database connection pool
    tracing::info!("Connecting to PostgreSQL database...");
    let pool = create_pool(&settings.database).await?;
    tracing::info!("✅ Database connection successful");

    // Connect to RabbitMQ
    tracing::info!("Connecting to RabbitMQ: {}", settings.rabbitmq.url);
    let conn = Connection::connect(
        &settings.rabbitmq.url,
        ConnectionProperties::default(),
    )
    .await?;
    tracing::info!("✅ RabbitMQ connection successful");

    let channel = conn.create_channel().await?;

    // Declare queues
    tracing::info!("Declaring RabbitMQ queues...");

    // Notifications queue (v2 - Rust handles these)
    channel
        .queue_declare(
            "ums.notifications.v2",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;

    // Exam result processing queue
    channel
        .queue_declare(
            "ums.exams.results",
            QueueDeclareOptions::default(),
            FieldTable::default(),
        )
        .await?;

    tracing::info!("✅ Queues declared successfully");

    // Spawn consumer tasks
    tracing::info!("Starting consumer tasks...");

    let notifications_task = {
        let channel = channel.clone();
        let pool = pool.clone();
        tokio::spawn(async move {
            consumers::notifications::consume_notifications(channel, pool).await
        })
    };

    let exam_results_task = {
        let channel = channel.clone();
        let pool = pool.clone();
        tokio::spawn(async move {
            consumers::exam_results::consume_exam_results(channel, pool).await
        })
    };

    tracing::info!("🚀 Rust Workers running");
    tracing::info!("📬 Consuming from: ums.notifications.v2, ums.exams.results");

    // Wait for tasks
    tokio::select! {
        result = notifications_task => {
            tracing::error!("Notifications consumer stopped: {:?}", result);
        }
        result = exam_results_task => {
            tracing::error!("Exam results consumer stopped: {:?}", result);
        }
    }

    Ok(())
}
