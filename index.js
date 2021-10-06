import BaseModule from './structures/BaseModule.js'
import { delay } from '@/src/util/Util.js'

export default class Presence extends BaseModule {
    /**
     * @param {Main} main
     */
    constructor(main) {
        super(main);

        this.register(Presence, {
            name: 'presence',
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
        const matches = string.match(/(?<=\$\{).*?(?=\})/g);
        for (const key of (matches ? matches : [])) {
            string = string.replace('${'+ key + '}', this.presenceValues[key]);
        }

        return string;
    }

    async _startInterval() {
        this._updatePresenceValues();

        for (const presence of this.activities) {
            const { type } = presence;
            const name = this._presenceStringEval(presence.name);

            this._m.user.setPresence({ activities: [ { name, type } ] });

            await delay(this.switch_interval);
        }

        this._startInterval();
    }

    /**
     * @private
     */
    _updatePresenceValues() {
        const count = this.globalStorage.get('serverCount');
        this.presenceValues.serverCount = count ? count : 'unknown';
    }

    init() {
        Object.assign(this, this.config.presence_settings);

        this.presenceValues = {
            version: this._m.version,
            serverCount: 1
        };

        return true;
    }
}
