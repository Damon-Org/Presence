import BaseModule from './structures/modules/BaseModule.js'
import { delay } from '../../util/Util.js'

export default class Presence extends BaseModule {
    /**
     * @param {MainClient} mainClient
     */
    constructor(mainClient) {
        super(mainClient);

        this.register(Presence, {
            name: 'presence',
            scope: 'global',
            events: [
                {
                    name: 'ready',
                    call: '_startInterval'
                }
            ]
        });
    }

    /**
     * This method evaluates a config presence string to something with dynamic values
     * @private
     * @param {string} string String to be evaluated
     */
    _presenceStringEval(string) {
        let outputStr = '';
        const split_str = string.split('${');

        for (let i = 0; i < split_str.length; i++) {
            if (split_str[i].includes('}')) {
                const temp_split = split_str[i].split('}');

                outputStr += this.presenceValues[temp_split[0]];
                outputStr += temp_split[1];

                continue;
            }
            outputStr += split_str[i];
        }

        return outputStr;
    }

    /**
     * @private
     */
    _updatePresenceValues() {
        this.presenceValues.serverCount = this.globalStorage.get('serverCount');
    }

    setup() {
        Object.assign(this, this.config.presence_settings);

        this.presenceValues = {
            version: this._m.version,
            serverCount: 1
        };

        return true;
    }

    async _startInterval() {
        await this._updatePresenceValues();

        for (const presence of this.presences) {
            this._m.user.setPresence({
                activity: {
                    type: presence.activity.type,
                    name: this._presenceStringEval(presence.activity.name)
                }
            });

            await delay(this.switch_interval);
        }

        this._startInterval();
    }
}
