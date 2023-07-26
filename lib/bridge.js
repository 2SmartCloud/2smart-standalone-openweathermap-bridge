const BaseBridge = require('homie-sdk/lib/Bridge/Base');
const BaseDeviceBridge = require('homie-sdk/lib/Bridge/BaseDevice');
const DeviceBridge = require('./device');

class OpenWeatherMapBridge extends BaseBridge {
    constructor({ smartMqttConnection, openWeatherMap, ...config }) {
        super({ mqttConnection: smartMqttConnection, ...config, device: null });

        this.openWeatherMapConfig = openWeatherMap;

        if (config.device) {
            let deviceBridge = config.device;

            if (!(deviceBridge instanceof BaseDeviceBridge)) {
                deviceBridge = new DeviceBridge({ ...deviceBridge }, { debug: config.debug });
            }
            this.setDeviceBridge(deviceBridge);
        }
    }
    // sync
    // async
    // handlers~
    // ~handlers
}

module.exports = OpenWeatherMapBridge;
