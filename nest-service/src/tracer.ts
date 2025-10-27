import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

import { HostMetrics } from '@opentelemetry/host-metrics';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export const SERVICE_NAME = process.env.OTEL_SERVICE_NAME;

export const initializeTracing = () => {
  const OTEL_EXPORTER_OTLP_ENDPOINT =
    'http://' + process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const exporterOptions = {
    url: OTEL_EXPORTER_OTLP_ENDPOINT,
  };

  const traceExporter = new OTLPTraceExporter(exporterOptions);
  const logExporter = new OTLPLogExporter(exporterOptions);
  const logProcessor = new BatchLogRecordProcessor(logExporter);

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
  });

  const sdk = new NodeSDK({
    traceExporter,
    logRecordProcessors: [logProcessor],
    instrumentations: [
      // getNodeAutoInstrumentations(),
      new NestInstrumentation(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PgInstrumentation({ enhancedDatabaseReporting: true }),
    ],
    resource,
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry

  sdk.start();

  const metricExporter = new OTLPMetricExporter(exporterOptions);
  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10_000,
  });
  const meterProvider = new MeterProvider({
    resource,
    readers: [metricReader],
  });
  const hostMetrics = new HostMetrics({ meterProvider });
  hostMetrics.start();

  console.log('Starting tracing');

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    const shutdownPromises = [sdk.shutdown()];
    Promise.allSettled(shutdownPromises)
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log(error))
      .finally(() => {
        process.exit(0);
      });
  });

  return sdk;
};
