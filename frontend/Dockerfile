# syntax=docker/dockerfile:1.7
FROM node:22-alpine

WORKDIR /app

# 依存関係インストール（package.jsonが存在する場合のみ）
COPY . /app
RUN if [ -f package.json ]; then npm install --legacy-peer-deps; fi

EXPOSE 5173
ENV HOST=0.0.0.0 \
    PORT=5173

# Vite開発サーバーをデフォルト起動とする
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
