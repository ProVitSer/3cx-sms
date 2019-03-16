const config = {}
config.url = `https://smsc.ru/sys/send.php`;
//smsc.ru login
config.login = `LOGIN`;
//smsc.ru password
config.password = `PASSWORD`;
//SMS text message
config.message = `К сожалению, все менеджеры заняты, мы обязательно свяжемся с Вами в ближайшее время.`
module.exports = config;