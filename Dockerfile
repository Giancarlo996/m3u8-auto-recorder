FROM alpine

WORKDIR /app

COPY . .

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

RUN apk add --no-cache nodejs npm ffmpeg

RUN npm install

VOLUME [ "/data" ]

CMD ["node", "index.js"]

# docker build -t m3u8-auto-recorder:latest .
