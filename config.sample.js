module.exports = {

    environment: process.env.APPENV || 'development',
    ports: {
        app: 8001,
        gateway: 8002
    },
    urls: {
        app: 'http://127.0.0.1:2018',
        gateway: 'ws://127.0.0.1:2019',
    },
    database: {
        username: 'root',
        password: 'root',
        database: 'matharena',
        host: 'mysql',
        dialect: 'mysql',
        logging: false,
        timezone: '+00:00',
        define: {
            underscored: true,
            timestamps: false
        }
    }

};
