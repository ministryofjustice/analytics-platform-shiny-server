const winston = require('winston');

winston.configure({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV === 'production') {
  winston.add(new winston.transports.File({
    filename: '/var/log/shiny-server/shiny-server.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple(),
    ),
    maxFiles: 5,
    tailable: true,
    maxsize: 1024 * 5000, // 5mb file size
  }));
}
