//! Notifications consumer

use futures::StreamExt;
use lapin::{options::*, Channel};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct NotificationMessage {
    recipient: String,
    subject: String,
    message: String,
    notification_type: String,
}

pub async fn consume_notifications(channel: Channel, pool: PgPool) -> anyhow::Result<()> {
    tracing::info!("Starting notifications consumer...");

    let mut consumer = channel
        .basic_consume(
            "ums.notifications.v2",
            "rust-notifications-consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    while let Some(delivery) = consumer.next().await {
        match delivery {
            Ok(delivery) => {
                let payload = String::from_utf8_lossy(&delivery.data);
                tracing::info!("Received notification: {}", payload);

                match serde_json::from_slice::<NotificationMessage>(&delivery.data) {
                    Ok(notification) => {
                        tracing::info!(
                            "Processing notification: type={}, recipient={}",
                            notification.notification_type,
                            notification.recipient
                        );

                        // TODO: Implement notification processing
                        // - Email sending
                        // - SMS sending
                        // - Store in database

                        // Acknowledge message
                        delivery
                            .ack(BasicAckOptions::default())
                            .await?;

                        tracing::info!("✅ Notification processed successfully");
                    }
                    Err(e) => {
                        tracing::error!("Failed to parse notification message: {}", e);
                        // Reject and don't requeue malformed messages
                        delivery
                            .nack(BasicNackOptions {
                                requeue: false,
                                ..Default::default()
                            })
                            .await?;
                    }
                }
            }
            Err(e) => {
                tracing::error!("Consumer error: {}", e);
                break;
            }
        }
    }

    tracing::warn!("Notifications consumer stopped");
    Ok(())
}
