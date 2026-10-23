# Backup and Recovery Planning

This document is a **planning checklist**, not evidence that backups,
replication, retention, or recovery objectives are currently configured. Verify
each item in the relevant provider console before relying on it.

## Data to protect

- **PostgreSQL:** user, gallery, photo metadata, orders, subscriptions, and
  application configuration.
- **Amazon S3:** original media and generated image objects.
- **Deployment configuration:** environment-variable names and operational
  settings. Keep secret values in the hosting providers' secret stores, not in
  this repository.

## Confirm provider protections

### Neon PostgreSQL

- [ ] Confirm the database's backup and point-in-time recovery options.
- [ ] Record the provider's actual retention window and recovery procedure.
- [ ] Create a controlled restore into a non-production database and verify
  application data before documenting recovery times.

### Amazon S3

- [ ] Confirm bucket versioning and lifecycle configuration.
- [ ] Decide whether cross-region/account replication is required and configure
  it explicitly if needed.
- [ ] Test restoration of an object version and validate application metadata
  still refers to the expected object.
- [ ] Confirm CloudFront behavior after object restoration or replacement.

## Recovery runbooks

### Database data loss

1. Coordinate a write freeze or maintenance window where appropriate.
2. Select a provider recovery point based on verified backup data.
3. Restore to a separate database first when feasible.
4. Validate users, galleries, photos, orders, subscriptions, and migration
   state before switching application configuration.
5. Record the incident, validation steps, and actual recovery duration.

### S3 object deletion or corruption

1. Identify the affected bucket and object key from application records.
2. Use a prior object version or configured replica if one exists.
3. Verify the restored object and any generated variants.
4. Check the application record and CloudFront delivery path.

### Provider or region outage

1. Confirm provider status and impact before changing production routing.
2. Use an established, tested standby only if one has actually been configured.
3. Validate sign-in, gallery reads, media delivery, uploads, and critical
   purchase flows after recovery.

Do not publish RPO/RTO commitments until they are defined, configured, and
demonstrated in recovery exercises.
