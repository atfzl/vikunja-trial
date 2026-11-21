#!/bin/sh
set -eu
# A fresh disk: bring the database back from R2 (nothing to restore on the very first start).
litestream restore -config /etc/litestream.yml -if-db-not-exists -if-replica-exists /db/vikunja.db
# Vikunja runs as Litestream's child: every write is replicated, and on shutdown Litestream
# syncs what's left before exiting.
exec litestream replicate -config /etc/litestream.yml -exec /app/vikunja/vikunja
