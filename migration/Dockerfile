# syntax=docker/dockerfile:1.7
FROM flyway/flyway:12.1.0

WORKDIR /flyway

# SQLファイルをコピー（migration/sql配下）
COPY sql /flyway/sql

# Flyway設定は環境変数またはvolumeで渡す想定
ENTRYPOINT ["flyway"]
