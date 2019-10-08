FROM node

COPY . /tool
WORKDIR /tool

RUN npm install

RUN rm -rf .git/

ENTRYPOINT ["npm", "start", "--"]
CMD []

