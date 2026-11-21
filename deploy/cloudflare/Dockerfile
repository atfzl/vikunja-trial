# The Vikunja API for vikunja.mime8.dev, on Cloudflare Containers.
#
# A container's disk is wiped when it sleeps, so the SQLite database is kept in R2 by
# Litestream: restored on start, then every change replicated while Vikunja runs.
# Attachments go straight to R2 (files.type s3).

# Vikunja's own image, built daily from main (matches this fork's frontend). Re-pin when the
# fork syncs with upstream: docker buildx imagetools inspect vikunja/vikunja:unstable
FROM vikunja/vikunja:unstable@sha256:2b97828cdf0f59351443a405207ab613e697050ccdfe1c24d2cd6e542d8261a4 AS vikunja
FROM litestream/litestream:0.5.18-scratch AS litestream

FROM alpine:3.22
RUN adduser -D -u 1000 vikunja && mkdir -p /db /app/vikunja && chown vikunja /db /app/vikunja
COPY --from=vikunja /app/vikunja/vikunja /app/vikunja/vikunja
COPY --from=litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY litestream.yml /etc/litestream.yml
COPY start.sh /start.sh

USER vikunja
WORKDIR /app/vikunja
ENV VIKUNJA_SERVICE_ROOTPATH=/app/vikunja/ \
    VIKUNJA_DATABASE_TYPE=sqlite \
    VIKUNJA_DATABASE_PATH=/db/vikunja.db \
    GODEBUG=multipathtcp=0
EXPOSE 3456
ENTRYPOINT ["/bin/sh", "/start.sh"]
