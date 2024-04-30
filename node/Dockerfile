FROM node:14

WORKDIR /node
COPY package.json .
RUN npm install
COPY . .
EXPOSE 80
CMD npm start