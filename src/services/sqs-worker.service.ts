import { sqsService, ProcessingJobPayload } from './sqs.service';
import { processingJobProcessorService } from './processing-job-processor.service';
import { logger } from '../utils/logger';
import { hasSQSConfig } from '../config/aws';

class SQSWorkerService {
  private running = false;

  startPolling(): void {
    if (this.running) {
      return;
    }

    if (!hasSQSConfig()) {
      logger.warn('SQS worker not started: missing AWS_SQS_QUEUE_URL or AWS credentials');
      return;
    }

    this.running = true;
    logger.info('SQS worker polling started');
    this.pollLoop().catch((error) => {
      logger.error('SQS worker poll loop crashed', { error });
      this.running = false;
    });
  }

  stopPolling(): void {
    this.running = false;
    logger.info('SQS worker polling stopped');
  }

  private async pollLoop(): Promise<void> {
    while (this.running) {
      try {
        const message = await sqsService.receiveProcessingJob();

        if (!message) {
          continue;
        }

        const receiptHandle = message.ReceiptHandle;
        if (!receiptHandle || !message.Body) {
          logger.warn('Received malformed SQS message', { messageId: message.MessageId });
          continue;
        }

        const payload = JSON.parse(message.Body) as ProcessingJobPayload;
        await processingJobProcessorService.processJob(payload);

        await sqsService.deleteMessage(receiptHandle);
      } catch (error) {
        logger.error('SQS worker failed to process message', { error });
      }
    }
  }
}

export const sqsWorkerService = new SQSWorkerService();
export { SQSWorkerService };
