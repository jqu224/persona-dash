# persona-dash 运行实例容器（任何容器平台可用：腾讯云 CloudBase Run / Sealos / 自有服务器）
# 先在本地构建前端：cd web && npm install && npm run build
FROM node:20-alpine

WORKDIR /app
COPY server/ /app/server/
COPY web/dist/ /app/web/dist/

WORKDIR /app/server
ENV PORT=8080
EXPOSE 8080
CMD ["node", "index.js"]
