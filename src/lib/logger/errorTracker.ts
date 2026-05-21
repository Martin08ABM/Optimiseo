// Error tracking and reporting utilities

import logger, { analysisLogger, paymentLogger, securityLogger } from './index';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  path?: string;
  method?: string;
  metadata?: Record<string, any>;
}

interface AnalysisErrorContext extends ErrorContext {
  analysisId?: string;
  url?: string;
  analysisType?: string;
}

interface PaymentErrorContext extends ErrorContext {
  paymentId?: string;
  customerId?: string;
  subscriptionId?: string;
}

interface SecurityErrorContext extends ErrorContext {
  ip?: string;
  userAgent?: string;
  fingerprint?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorTracker {
  /**
   * Track general application errors
   */
  static trackError(error: unknown, context: ErrorContext = {}) {
    if (error instanceof Error) {
      logger.error({ 
        error,
        context,
        stack: error.stack,
      }, `Error: ${error.message}`);
    } else {
      logger.error({ 
        error: String(error),
        context,
      }, `Unknown error: ${String(error)}`);
    }
  }

  /**
   * Track analysis-specific errors
   */
  static trackAnalysisError(error: unknown, context: AnalysisErrorContext = {}) {
    if (error instanceof Error) {
      analysisLogger.error({
        error,
        context,
        stack: error.stack,
      }, `Analysis error: ${error.message}`);
    } else {
      analysisLogger.error({
        error: String(error),
        context,
      }, `Analysis error: ${String(error)}`);
    }
  }

  /**
   * Track payment and subscription errors
   */
  static trackPaymentError(error: unknown, context: PaymentErrorContext = {}) {
    if (error instanceof Error) {
      paymentLogger.error({
        error,
        context,
        stack: error.stack,
      }, `Payment error: ${error.message}`);
    } else {
      paymentLogger.error({
        error: String(error),
        context,
      }, `Payment error: ${String(error)}`);
    }
  }

  /**
   * Track security-related events
   */
  static trackSecurityEvent(error: unknown, context: SecurityErrorContext) {
    if (error instanceof Error) {
      securityLogger.error({
        error,
        context,
        stack: error.stack,
      }, `Security event: ${error.message}`);
    } else {
      securityLogger.error({
        error: String(error),
        context,
      }, `Security event: ${String(error)}`);
    }

    // For critical security events, we might want to send notifications
    if (context.severity === 'critical') {
      // TODO: Implement notification system (Slack, Email, PagerDuty)
      this.sendCriticalAlert(error, context);
    }
  }

  /**
   * Track rate limit violations
   */
  static trackRateLimit(userId: string, path: string, limit: number) {
    securityLogger.warn({
      userId,
      path,
      limit,
      event: 'rate_limit_exceeded',
    }, `Rate limit exceeded by user ${userId}`);
  }

  /**
   * Track authentication failures
   */
  static trackAuthFailure(identifier: string, reason: string, context: ErrorContext = {}) {
    securityLogger.warn({
      identifier,
      reason,
      context,
      event: 'auth_failure',
    }, `Authentication failed for ${identifier}`);
  }

  /**
   * Track validation errors
   */
  static trackValidationError(
    errors: Record<string, string>,
    data: unknown,
    context: ErrorContext = {}
  ) {
    logger.warn({
      errors,
      data,
      context,
      event: 'validation_error',
    }, 'Validation error occurred');
  }

  /**
   * Helper to send critical alerts
   */
  private static sendCriticalAlert(error: unknown, context: SecurityErrorContext) {
    // This would integrate with a notification service
    // For now, just log it
    logger.fatal({
      error: error instanceof Error ? { message: error.message, stack: error.stack } : String(error),
      context,
    }, 'CRITICAL SECURITY ALERT');
  }
}

// Performance monitoring utilities
export class PerformanceTracker {
  private static timings = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(name: string) {
    this.timings.set(name, Date.now());
  }

  /**
   * End timing and log the duration
   */
  static endTimer(name: string, context: Record<string, any> = {}) {
    const start = this.timings.get(name);
    if (start) {
      const duration = Date.now() - start;
      logger.info({
        name,
        duration,
        context,
      }, `Operation ${name} completed in ${duration}ms`);
      this.timings.delete(name);
      return duration;
    }
    return null;
  }

  /**
   * Time an async operation
   */
  static async timeOperation<T>(
    name: string,
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await operation();
      this.endTimer(name, { ...context, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...context, success: false, error });
      throw error;
    }
  }
}

export default ErrorTracker;