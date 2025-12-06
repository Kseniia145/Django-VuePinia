FROM node:18-alpine

WORKDIR /app

# Копіювання package файлів
COPY package*.json ./

# Встановлення залежностей
RUN npm install

# Копіювання коду проєкту
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

