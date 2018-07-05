module.exports = {
    cors: {
        origins: [ 'localhost' ]
    },
    data: {
        provider: 'mssql',
        server: 'demo.aipxperts.com', // horecafy.database.windows.net
        database: 'horecafy_db',
        user: 'root',
        password: 'root'
    },
    logging: {
        level: 'verbose'
    }
};