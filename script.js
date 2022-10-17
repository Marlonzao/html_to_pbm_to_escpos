async function teste(){
    await qz.websocket.connect();

    let canvas = await gerar_canvas();

    let command = (new ESCPOSImageBuilder(canvas)).make();
    command.unshift('\x1B\x40');
    command.push('\x0A\x0A\x0A\x0A\x0A\x0A');
    command.push('\x1D\x56\x00');

    let config = qz.configs.create("MP-4200 TH", {encoding: 'ISO-8859-1'});
    qz.print(config, command);

}

async function gerar_canvas(){
    let imprimir = document.getElementById('imprimir');

    return await htmlToImage.toCanvas(imprimir, {
        quality: 0.10,
        width: 484,
        height: imprimir.clientHeight
    });
}