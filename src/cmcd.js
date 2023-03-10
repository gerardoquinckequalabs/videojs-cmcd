export default class CMCDObject {
    constructor() {
        this.keys = {
            // Not all keys will be used for now
            br: undefined,        // Encoded bitrate, integer, kbps
            cid: undefined,       // Content ID, string, 64 chars max
            d: undefined,         // Object duration, integer, milliseconds
            mtp: undefined,       // Measured throughput, integer, kbps, rounded to 100 kbps
            nor: undefined,       // Next Object Request, string, relative path of the next object
            ot: undefined,        // Object type, Token - one of [m, a, v, av, i, c, tt, k, o]
            sf: undefined,        // Streaming format, Token - one of [d,h,s,o]
            st: undefined,        // Stream type (VOD/Live) - Token - one of [v,l]
            sid: undefined,       // Session ID, String, 64 chars max, recommend UUID spec
        }

        this.keys.sid = crypto.randomUUID();
        console.log('New CMCD', this.keys.sid);
    }

    // reset
    reset() {
        Object.keys(this.keys).filter(k => k !== 'sid').forEach(k => this.keys[k] = undefined);
    }

    // setters

    setBrFromBandWidth(bandwidth) { // bandwidth on m3u8 is in bits per second, 1 kbps = 1000 bps
        try {
            this.keys.br = Math.ceil(bandwidth / 1000);
        } catch (e) {
            console.log('cannot set br');
            this.keys.br = undefined;
        }
    }

    setDFromSeconds(seconds) {
        try {
            this.keys.d = Math.ceil(seconds * 1000); // convert to milliseconds
        } catch (e) {
            console.log('cannot set d');
            this.keys.d = undefined;
        }
    }

    setMtpFromBandWidth(bandwidth) { // bandwidth is bps, must round to 100 kbps
        try {
            this.keys.mtp = 100 * Math.ceil(bandwidth / 100000);
        } catch (e) {
            console.log('cannot set mtp');
            this.keys.mtp = undefined;
        }
    }

    setNor(nor) {
        if (typeof nor === 'string') {
            this.keys.nor = nor;
        }
    }

    setStFromType(playListType) {
        switch (playListType.toUpperCase()) {
            case 'VOD':
                this.keys.st = 'v';
                break;

            case 'LIVE':
                this.keys.st = 'l';
                break;

            default:
                this.keys.st = undefined;
                break;
        }
    }

    setStFromDuration(duration) {
        if (typeof duration === 'number') {
            if (duration === Infinity) {
                this.keys.st = 'l';
            } else {
                this.keys.st = 'v';
            }
        } else {
            this.keys.st = undefined;
        }
    }

    queryString() {           // returns CMCD=<URL_encoded_concatenation_of_key_value_pairs>
        let qs = "CMCD=";
        let count = 0;
        Object.keys(this.keys)
            .sort()
            .forEach(k => {
                if (this.keys[k]) {       // skip undefined keys
                    if (count++ > 0) qs += encodeURIComponent(',');
                    // TODO - this only works for string values, as it adds the double quotes
                    //      - integer and tokens don't need double quotes
                    qs += encodeURIComponent(k + '=' + JSON.stringify(this.keys[k]));
                }
            })
        return count > 0 ? qs : '';
    }
}
