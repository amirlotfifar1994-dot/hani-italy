FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && mkdir .local-data && chown node:node .local-data
COPY server ./server
COPY tools/preview.mjs tools/admin-setup.mjs ./tools/
COPY dist ./dist
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 PERSIA_DATA_DIR=/app/.local-data SEO_INDEXING=false
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "tools/preview.mjs"]
