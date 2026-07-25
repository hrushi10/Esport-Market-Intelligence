FROM node:22-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

FROM base AS development
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

FROM base AS production-builder
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=production-builder /app/package.json ./
COPY --from=production-builder /app/node_modules ./node_modules
COPY --from=production-builder /app/.next ./.next
COPY --from=production-builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
