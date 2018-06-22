module.exports = {
    cors: {
        origins: [ 'localhost' ]
    },
    data: {
        provider: 'mssql',
        server: '192.168.1.4', // horecafy.database.windows.net
        database: 'horecafydb',
        user: 'root',
        password: 'root'
    },
    logging: {
        level: 'verbose'
    }
};