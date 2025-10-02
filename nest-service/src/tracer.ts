import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export const initializeTracing = () => {
  const OTEL_EXPORTER_OTLP_ENDPOINT =
    'http://' + process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const exporterOptions = {
    url: OTEL_EXPORTER_OTLP_ENDPOINT,
  };

  const traceExporter = new OTLPTraceExporter(exporterOptions);
  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [
      // getNodeAutoInstrumentations(),
      new NestInstrumentation(),
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
    }),
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry

  sdk.start();
  console.log('Starting tracing');

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });

  return sdk;
};
