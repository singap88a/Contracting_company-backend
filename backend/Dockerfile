# Stage 1: Dependencies - تحميل وتثبيت المكتبات
FROM node:20-alpine AS deps
WORKDIR /app

# نسخ ملفات package للتحقق من التبعيات
COPY package*.json ./

# تثبيت جميع المكتبات (dev + production)
RUN npm ci && npm cache clean --force

# Stage 2: Builder - تحضير التطبيق للإنتاج  
FROM node:20-alpine AS builder
WORKDIR /app

# نسخ المكتبات من المرحلة السابقة
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تثبيت المكتبات الإنتاجية فقط وتنظيف الكاش
RUN npm prune --production && npm cache clean --force

# Stage 3: Runner - تشغيل التطبيق في الإنتاج
FROM node:20-alpine AS runner
WORKDIR /app

# تعيين بيئة الإنتاج
ENV NODE_ENV=production

# إنشاء مستخدم غير جذر للأمان
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backenduser -u 1001

# نسخ الملفات المطلوبة فقط للتشغيل
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/api ./api
COPY --from=builder /app/config ./config
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/models ./models
COPY --from=builder /app/routes ./routes

# تغيير ملكية المجلد للمستخدم الجديد
RUN chown -R backenduser:nodejs /app
USER backenduser

# فتح البورت المطلوب
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]