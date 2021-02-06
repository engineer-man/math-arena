module.exports = {

    environment: process.env.APPENV || 'development',
    ports: {
        app: 8001,
        gateway: 8002
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
