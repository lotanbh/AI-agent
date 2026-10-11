# 1. שלב הבנייה (Build Stage)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# התקנת כל החבילות כולל אלו של הפיתוח לצורך ה-Build
RUN npm install
COPY . .
# ביצוע Build של אפליקציית Next.js
RUN npm run build

# 2. שלב ההרצה (Production Stage)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# העתקת הקבצים החיוניים בלבד כדי לשמור על Image קטן ומאובטח
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# חשיפת הפורט של Next.js
EXPOSE 3000

# הרצת האפליקציה במצב Production
CMD ["npm", "run", "start"]
