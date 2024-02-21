FROM alpine

WORKDIR /app

COPY . .

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk add --no-cache nodejs npm git python3 build-base

RUN git clone https://github.com/streamlink/streamlink.git
RUN cd streamlink && python3 setup.py install

RUN npm install

VOLUME [ "/data" ]

CMD ["node", "index.js"]

# docker build -t m3u8-auto-recorder:latest .
