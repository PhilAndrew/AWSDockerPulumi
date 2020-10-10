import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import doWork from './task';
const fs = require('fs');

var log4js = require("log4js");

log4js.configure({
    appenders: { cheese: { type: "file", filename: "output.log" } },
    categories: { default: { appenders: ["cheese"], level: "error" } }
  });

// Start the server
const port = Number(process.env.PORT || 80);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);

    const start = async () => {

        var logger = log4js.getLogger();
        
        //var readStream = fs.createWriteStream('./log.txt');
        await doWork(logger);
    };

    start();
    
});
