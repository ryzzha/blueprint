import { Address, Cell, contractAddress, StateInit, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { TonClient4 } from "ton";
import qs from "qs";
import qrcode from "qrcode-terminal";
import "dotenv/config"

async function onchainTestScript() {
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const dataCell = new Cell();

    const stateInit: StateInit = {
        code: codeCell,
        data: dataCell,
    }
    
    const address = contractAddress(0, stateInit);

   const endpoint = await getHttpV4Endpoint({
    network: "testnet"
   });

   const client4 = new TonClient4({ endpoint })

   const latestBlock = await client4.getLastBlock();
   let status = await client4.getAccount(latestBlock.last.seqno, address);

   if(status.account.state.type !== "active") {
    console.log("contract is not active");
    return;
   }

   let link = 
    `https://${process.env.TESTNET ? "testnet" : ""}tonhub.com/transfer/` + 
        address.toString({
            testOnly: process.env.TESTNET ? true : false,
        }) + 
        "?" + 
        qs.stringify({
            text: "Test transaction",
            amount: toNano("0.02").toString(10),
        });

        qrcode.generate(link, { small: true }, (code) => {
        console.log(code);
    });

    let last_sender: Address;

    setInterval(async () => {
        const latestBlock = await client4.getLastBlock();
        const { exitCode, result } = await client4.runMethod(latestBlock.last.seqno, address, "get_the_latest_sender");

        if(exitCode !== 0) {
            console.log("running getter method failed");
            return;
        }

        if(result[0].type !== "slice") {
            console.log("unknown result type");
            return;
        }

        const recent_sender = result[0].cell.beginParse().loadAddress();

        if(recent_sender && recent_sender.toString() !== last_sender?.toString()) {
            console.log("new sender: " + recent_sender.toString({ testOnly: true }));
            last_sender = recent_sender;
        }
    }, 3000)

}

onchainTestScript();