FROM node:8.9.1
COPY backend /usr/share/node_app
RUN cd /usr/share/node_app && npm install
CMD cd /usr/share/node_app && node server.js
