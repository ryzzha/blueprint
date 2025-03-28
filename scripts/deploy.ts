import { beginCell, Cell, contractAddress, StateInit, storeStateInit, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import qs from "qs";
import qrcode from "qrcode-terminal";

async function deployScript() {
    console.log("start deploying...")

    // console.log("sc in hex: " + hex)
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    // console.log("codeCell")
    // console.log(codeCell)
    const dataCell = new Cell();
    // console.log("dataCell")
    // console.log(dataCell)

    const stateInit: StateInit = {
        code: codeCell,
        data: dataCell,
    }

    const stateInitBuilder = beginCell();
    // console.log("stateInitBuilder")
    // console.log(stateInitBuilder)
    storeStateInit(stateInit)(stateInitBuilder);
    const stateInitCell = stateInitBuilder.endCell();
    // console.log("stateInitCell")
    // console.log(stateInitCell)

    const address = contractAddress(0, stateInit);

    console.log("contract address: " + address.toString())
    console.log("scan QR code bellow to deploy")

    // analog how work storeStateInit(stateInit)(stateInitBuilder)
    const stateInitCellCreate = beginCell().storeBit(false).storeBit(false).storeMaybeRef(codeCell).storeMaybeRef(dataCell).storeUint(0, 1).endCell();

    let link = 
    'https://test.tonhub.com/transfer/' + 
        address.toString({
            testOnly: true,
        }) + 
        "?" + 
        qs.stringify({
            text: "Deploy contract",
            amount: toNano("0.01").toString(10),
            init: stateInitCell.toBoc({ idx: false }).toString("base64"),
        });

        qrcode.generate(link, { small: true }, (code) => {
        console.log(code);
    });


}

deployScript();