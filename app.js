const fs = require(`fs`),
    request = require(`request`),
    log4js = require(`log4js`),
    appConfig = require(`./config`),
    Tail = require(`tail`).Tail;

const headers = {
    'User-Agent': `Voip Agent/0.0.1`,
    'Content-Type': `application/x-www-form-urlencoded`
}
log4js.configure({
    appenders: {
        voip: {
            type: `file`,
            filename: `logs/logger.log`
        }
    },
    categories: {
        default: {
            appenders: [`voip`],
            level: `info`
        }
    }
});

const logger = log4js.getLogger(`voip`);

//Windows path C:\\ProgramData\\3CX\\Instance1\\Data\\Logs\\CDRLogs\\cdr.log
tail = new Tail(`/var/lib/3cxpbx/Instance1/Data/Logs/CDRLogs/cdr.log`, {
    useWatchFile: true
});

let options = {
    url: appConfig.url,
    path: `?`,
    method: `GET`,
    headers: headers,
    qs: {
        'login': appConfig.login,
        'psw': appConfig.password,
        'phones': ``,
        'mes': appConfig.message,
        'charset': `utf-8`
    }
}

tail.on(`line`, function(data) {
    let line = data.split(`\n`);
    for (let i = 0; i < line.length; i++) {
        let cdr = line[i].split(`,`);
        if (cdr[6] === `TerminatedBySrc` && cdr[9] > 1999 && cdr[7].indexOf(`Ext.`) === -1) {
            logger.info(`Send SMS to number  ${cdr[7]}`);
            options.qs.phones = cdr[7];
            sendSms(options);
        }
    }
});

const sendSms = (options) => {
    request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            let date = new Date(),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                hours = date.getHours(),
                minute = date.getMinutes();
            logger.info(`SMS send ${day}.${month}.${year} status: ${body} Time: ${hours}:${minute} to number ${options.qs.phones}`);
        } else {
            logger.error(response.statusCode);
        }
    })

}

tail.on(`error`, (error) => {
    logger.error(error);
});