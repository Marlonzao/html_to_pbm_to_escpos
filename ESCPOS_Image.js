class ESCPOSImageSize {
    constructor(canvas) {
        this.width  = canvas.width;
        this.height = canvas.height;
        this.colors = 4;
    }
}

class ESCPOSImage {
    constructor(canvas) {
        this.size = new ESCPOSImageSize(canvas);
        this.ctx = canvas.getContext("2d");

        this.data = this.bw();
    }

    bw() {
        const threshold = 210;

        let pixels = this.ctx.getImageData(0, 0, this.size.width, this.size.height);

        let data = [];

        for (let i = 0; i < pixels.data.length; i += 4) {
            let luma = pixels.data[i] * 0.3 + pixels.data[i + 1] * 0.59 + pixels.data[i + 2] * 0.11;
            luma = luma < threshold ? 1 : 0;

            data.push(luma);
        }

        return data;
    }

    make() {  
        const header = ['\x1D', '\x76', '\x30', '\x00'];
        let raster = this.toRaster();
        return [ ...header, ...raster.width, ...raster.height, ...raster.data ];
    }

    toRaster() {
        var result  = [];
        var width   = this.size.width;
        var height  = this.size.height;
        var data    = this.data;
        var n       = Math.ceil((width + 7) / 8);

        var x, y, b, c, i;

        for (y = 0; y < height; y++) {
            for (x = 0; x < n; x++) {
                for (b = 0; b < 8; b++) {
                    i = x * 8 + b;
                    if (result[y * n + x] === undefined) {
                        result[y * n + x] = 0x00;
                    }
                    c = x * 8 + b;
                    if (c < width) {
                        if (data[y * width + i]) {
                            result[y * n + x] += this.dec_2_hex((0x80 >> (b & 0x7)));
                        }
                    }
                }
            }
        }

        return {
            data: result,
            width: this.int16ToArray(n),
            height: this.int16ToArray(height)
        };
    }

    int16ToArray(number) {
        return [ 
            this.dec_2_hex((number & 0xFF)), 
            this.dec_2_hex(((number >> 8) & 0xFF))
        ];
    }

    dec_2_hex(num) {
        let hex = num.toString(16);

        if(hex.length < 2)
            hex = '0' + hex;

        return eval('"\\x' + hex + '"');
    }
}