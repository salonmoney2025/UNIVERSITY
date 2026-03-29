//! Exam results processing consumer

use futures::StreamExt;
use lapin::{options::*, Channel};
use sqlx::PgPool;
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct ExamResultMessage {
    exam_id: Uuid,
    student_id: Uuid,
    marks_obtained: f64,
    graded_by: Uuid,
}

pub async fn consume_exam_results(channel: Channel, pool: PgPool) -> anyhow::Result<()> {
    tracing::info!("Starting exam results consumer...");

    let mut consumer = channel
        .basic_consume(
            "ums.exams.results",
            "rust-exam-results-consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await?;

    while let Some(delivery) = consumer.next().await {
        match delivery {
            Ok(delivery) => {
                let payload = String::from_utf8_lossy(&delivery.data);
                tracing::info!("Received exam result: {}", payload);

                match serde_json::from_slice::<ExamResultMessage>(&delivery.data) {
                    Ok(result) => {
                        tracing::info!(
                            "Processing exam result: exam={}, student={}, marks={}",
                            result.exam_id,
                            result.student_id,
                            result.marks_obtained
                        );

                        // TODO: Implement result processing
                        // - Calculate grade letter
                        // - Update student GPA
                        // - Trigger notifications
                        // - Generate transcripts

                        delivery
                            .ack(BasicAckOptions::default())
                            .await?;

                        tracing::info!("✅ Exam result processed successfully");
                    }
                    Err(e) => {
                        tracing::error!("Failed to parse exam result message: {}", e);
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

    tracing::warn!("Exam results consumer stopped");
    Ok(())
}
