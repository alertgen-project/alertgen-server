FROM node
# Rest-API in image kopieren
COPY backend /usr/share/node_app
# npm install im image ausführen
RUN cd /usr/share/node_app && npm install
# Rest-API starten
CMD cd /usr/share/node_app && node server.js
