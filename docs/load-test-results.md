# Recorded Load-Test Results

The following figures were recorded in an earlier load-test note. The original
record does not include the run date, tested deployment identifier, host
configuration, region, or exact command. Treat these as historical observations,
not a reproducible benchmark, production capacity guarantee, or SLA.

| Scenario | Connections | Duration | Average requests/s | Average latency (ms) | P99 latency (ms) | Errors | Timeouts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Health endpoint | 20 | 20 s | 42.65 | 466.83 | 1311 | 0 | 0 |
| Health endpoint | 50 | 20 s | 55.40 | 874.77 | 1930 | 0 | 0 |
| API docs endpoint | 20 | 20 s | 51.45 | 379.67 | 949 | 0 | 0 |

These results cover only the health and documentation endpoints. They do not
measure database-heavy requests, authentication, uploads, image processing,
payments, or end-to-end user journeys.

## Reproducing a useful test

1. Record the commit, target URL, provider plan/region, and runtime configuration.
2. Use a controlled test environment and a non-destructive endpoint.
3. Record the exact `autocannon` command, warm-up, concurrency, and duration.
4. Capture latency percentiles, throughput, errors, timeouts, and host metrics.
5. Repeat tests and compare like-for-like runs before drawing conclusions.

The repository provides `npm run load:test --workspace=server` as a local
starting point. Do not run load tests against a production service without
authorization and a plan to avoid disrupting users.
