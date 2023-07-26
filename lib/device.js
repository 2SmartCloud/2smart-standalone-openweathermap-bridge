const BaseDeviceBridge = require('homie-sdk/lib/Bridge/BaseDevice');
const BaseNodeBridge = require('homie-sdk/lib/Bridge/BaseNode');
const BasePropertyBridge = require('homie-sdk/lib/Bridge/BaseProperty');
const openweathermap = require('openweathermap');
const { config2smart } = require('./utils');

const UPDATE_INTERVAL = 10 * 60 * 1000;

const { create: createTransport } = require('./transport');
const { create: createParser } = require('./parser');

class DeviceBridge extends BaseDeviceBridge {
    constructor(config, { debug } = {}) {
        super(config, { debug });
        this.handleConnected = this.handleConnected.bind(this);
        this.handleDisconnected = this.handleDisconnected.bind(this);

        const transport = this._createPropertyTransport();

        transport.on('load.succeed', this.handleConnected);
        transport.on('load.error', this.handleDisconnected);

        const city = this._createCityOption(transport);

        this.addOption(city);

        const baseNode = this._createBaseNode(transport);

        this.addNode(baseNode);

        baseNode.connected = true;
    }

    get city() {
        return config2smart.get('openweathermap.city') || 'Kyiv';
    }

    _createPropertyTransport() {
        return createTransport({
            type         : 'custom',
            pollInterval : UPDATE_INTERVAL,
            methods      : {
                async set() {
                    throw new Error('Property is not settable');
                },
                async get() {
                    const result = await this.loadOpenWeatherMapNowData({ q: this.bridge.deviceBridge.city });

                    if (result.cod !== 200) {
                        this.emit('load.error');
                        throw new Error(result.message || 'Bad request');
                    }
                    this.emit('load.succeed');

                    this.handleNewData(result);

                    return this.data;
                },
                async loadOpenWeatherMapNowData(opts) {
                    return new Promise((resolve, reject) => {
                        openweathermap.now({ appId: this.bridge.openWeatherMapConfig.appId, units: 'metric', ...opts },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            })
                            .on('error', reject);
                    });
                }
            },
            attachBridge() {
                this.enablePolling();
            },
            detachBridge() {
                this.disablePolling();
            }
        });
    }
    _createCityOption(transport) {
        return new BasePropertyBridge({
            id       : 'city',
            name     : 'City',
            dataType : 'string',
            settable : true,
            retained : true
        }, {
            type      : 'option',
            parser    : createParser('string'),
            transport : createTransport({
                type    : 'custom',
                data    : this.city,
                methods : {
                    async set(data) {
                        const result = await transport.loadOpenWeatherMapNowData({ q: encodeURIComponent(data) });

                        if (result.cod !== 200) {
                            throw new Error(result.message || 'Bad request');
                        }
                        setImmediate(() => {
                            transport.handleNewData(result);
                            transport.emit('load.succeed');
                        });

                        config2smart.set('openweathermap.city', this.city = data);

                        return this.city;
                    },
                    async get() {
                        return this.city;
                    }
                }
            })
        });
    }
    _createTempSensor(transport) {
        return new BasePropertyBridge({
            id       : 'temperature',
            name     : 'Temperature',
            settable : false,
            retained : true,
            unit     : '°C'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.temp}`;
                }
            }),
            transport
        });
    }
    _createTempFeelsLikeSensor(transport) {
        return new BasePropertyBridge({
            id       : 'temperature-feels-like',
            name     : 'Temperature feels like',
            settable : false,
            retained : true,
            unit     : '°C'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.feels_like}`;
                }
            }),
            transport
        });
    }
    _createTempMin(transport) {
        return new BasePropertyBridge({
            id       : 'temperature-min',
            name     : 'Temperature min',
            settable : false,
            retained : true,
            unit     : '°C'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.temp_min}`;
                }
            }),
            transport
        });
    }
    _createTempMax(transport) {
        return new BasePropertyBridge({
            id       : 'temperature-max',
            name     : 'Temperature max',
            settable : false,
            retained : true,
            unit     : '°C'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.temp_max}`;
                }
            }),
            transport
        });
    }
    _createPressure(transport) {
        return new BasePropertyBridge({
            id       : 'pressure',
            name     : 'Pressure',
            settable : false,
            retained : true,
            unit     : 'rhm'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.pressure}`;
                }
            }),
            transport
        });
    }
    _createHumidity(transport) {
        return new BasePropertyBridge({
            id       : 'humidity',
            name     : 'Humidity',
            settable : false,
            retained : true,
            unit     : '%'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.main.humidity}`;
                }
            }),
            transport
        });
    }
    _createWindSpeed(transport) {
        return new BasePropertyBridge({
            id       : 'wind-speed',
            name     : 'Wind speed',
            settable : false,
            retained : true,
            unit     : 'm/s'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.wind.speed}`;
                }
            }),
            transport
        });
    }
    _createWindDeg(transport) {
        return new BasePropertyBridge({
            id       : 'wind-deg',
            name     : 'Wind deg',
            settable : false,
            retained : true,
            unit     : '°'
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'float',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.wind.deg}`;
                }
            }),
            transport
        });
    }
    _createWeather(transport) {
        return new BasePropertyBridge({
            id       : 'weather',
            name     : 'Weather',
            settable : false,
            retained : true,
            unit     : ''
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'string',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${data.weather.length && data.weather[0].description}`;
                }
            }),
            transport
        });
    }
    _createSunrise(transport) {
        return new BasePropertyBridge({
            id       : 'sunrise',
            name     : 'Sunrise',
            settable : false,
            retained : true,
            unit     : ''
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'string',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${new Date(data.sys.sunrise * 1000)}`;
                }
            }),
            transport
        });
    }
    _createSunset(transport) {
        return new BasePropertyBridge({
            id       : 'sunset',
            name     : 'Sunset',
            settable : false,
            retained : true,
            unit     : ''
        }, {
            type   : 'sensor',
            parser : createParser({
                type          : 'custom',
                homieDataType : 'string',
                fromHomie() {
                    throw new Error('Unsupported');
                },
                toHomie(data) {
                    return `${new Date(data.sys.sunset * 1000)}`;
                }
            }),
            transport
        });
    }
    _createBaseNode(transport) {
        return new BaseNodeBridge({
            id      : 'sensors',
            name    : 'Sensors',
            sensors : [
                this._createTempSensor(transport),
                this._createTempFeelsLikeSensor(transport),
                this._createTempMin(transport),
                this._createTempMax(transport),
                this._createPressure(transport),
                this._createHumidity(transport),
                this._createWindSpeed(transport),
                this._createWindDeg(transport),
                this._createWeather(transport),
                this._createSunrise(transport),
                this._createSunset(transport)
            ]
        });
    }

    // sync
    attachBridge(bridge) {
        super.attachBridge(bridge);
    }

    detachBridge() {
        super.detachBridge();
    }

    // async

    // handlers
    handleConnected() {
        this.connected = true;
    }
    handleDisconnected() {
        this.connected = false;
    }
}

module.exports = DeviceBridge;
