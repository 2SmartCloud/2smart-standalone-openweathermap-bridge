const OpenWeatherMapBridge = require('./lib/bridge');

function createOpenWeatherMapBridge({ deviceBridgeConfig, debug }) {
    return new OpenWeatherMapBridge({ ...deviceBridgeConfig, debug });
}

module.exports = createOpenWeatherMapBridge;
