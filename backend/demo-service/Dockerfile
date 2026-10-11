# 1. שימוש בגרסה יציבה וקלה של Node.js
FROM node:20-alpine

# 2. הגדרת תיקיית העבודה בתוך המכולה
WORKDIR /app

# 3. העתקת קבצי ניהול החבילות תחילה (לניצול מנגנון ה-Cache של Docker)
COPY package*.json ./

# 4. התקנת התלויות של השירות
RUN npm install --production

# 5. העתקת שאר קבצי הקוד של השרת
COPY . .

# 6. חשיפת הפורט עליו רץ השרת (לדוגמה פורט 5000, שנה לפי ה-app.js שלך)
EXPOSE 5000

# 7. פקודת ההרצה של השרת
CMD ["node", "app.js"]
