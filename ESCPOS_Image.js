class ESCPOSImageBuilder {
    constructor(canvas) {

        let ctx = canvas.getContext("2d");
        this.pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.pixels = { data: new Uint8Array(this.pixels.data), shape: [canvas.width, canvas.height, 4], stride: [4, 4 * canvas.width, 1] };

        this.size = new ESCPOSImageSize(this.pixels.shape[0], this.pixels.shape[1], this.pixels.shape[2]);

        this.data = [];

        let temp_arr = [];
        for (var i = 0; i < this.pixels.data.length; i += this.size.colors) {
            let color_arr = new Array(this.size.colors).fill(0);
            let d = this.rgb(color_arr.map((_, b) => this.pixels.data[i + b]));
            temp_arr.push(d);
        }

        this.data = temp_arr.map((pixel) => {
            if (pixel.a != 0xFF)
                return 0;

            if(pixel.r !== 0xFF || pixel.g !== 0xFF || pixel.b !== 0xFF){
                return 1;
            }else{
                return 0
            }
        });
    }
    rgb(pixel) {
        return {
            r: pixel[0],
            g: pixel[1],
            b: pixel[2],
            a: pixel[3]
        };
    }
    toRaster() {
        var result = [];
        var width = this.size.width;
        var height = this.size.height;
        var data = this.data;
        var n = Math.ceil((width + 7) / 8);
        var x, y, b, c, i;

        for (y = 0; y < height; y++) {
            for (x = 0; x < n; x++) {
                for (b = 0; b < 8; b++) {
                    i = x * 8 + b;
                    if (result[y * n + x] === undefined) {
                        result[y * n + x] = 0;
                    }
                    c = x * 8 + b;
                    if (c < width) {
                        if (data[y * width + i]) {
                            result[y * n + x] += (0x80 >> (b & 0x7));
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
        return [number & 0xFF, (number >> 8) & 0xFF];
    }
    dec_2_hex( num ) {
        let hex = num.toString(16);
    
        if(hex.length < 2)
            hex = '0' + hex;
    
        return eval('"\\x' + hex + '"');
    }
    make() {
        let header = [29, 118, 48, 0];

        let raster = this.toRaster();
    
        return [ ...header, ...raster.width, ...raster.height, ...raster.data].map((d) => this.dec_2_hex(d));
    }
}

class ESCPOSImageSize {
    constructor(width, height, colors) {
        this.width = 0;
        this.height = 0;
        this.colors = 0;
        if (width)
            this.width = width;
        if (height)
            this.height = height;
        if (colors)
            this.colors = colors;
    }
}