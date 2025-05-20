FROM node:18

WORKDIR /app
COPY package.json package.json ./
RUN npm install

COPY . .

# Necessary to allow container to serve on all interfaces
ENV HOST 0.0.0.0
ENV BROWSERSLIST=">0.2%, not dead, not op_mini all"

CMD ["npm", "start"]