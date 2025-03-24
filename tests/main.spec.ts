import { Cell, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import { Blockchain } from "@ton-community/sandbox";
import { MainContract } from "../wrappers/MainContract";

import "@ton-community/test-utils";

describe("main.fc contract tests", () => {
    it("our first test", async () => {
        console.log("===========================");
        console.log("starting...");

        const blockchain = await Blockchain.create();

        console.log("test blockchain created");

        const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

        const myContract = blockchain.openContract(MainContract.createFromConfig({}, codeCell));

        const senderWallet = await blockchain.treasury("sender");

        console.log("sending message...");

        const sendMessageResult = await myContract.sendInternalMessage(senderWallet.getSender(), toNano("0.05"));

        console.log("message sended");

        expect(sendMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const data = await myContract.getData();

        console.log("wallet address: " + senderWallet.address);
        console.log("address saved in contract: " + data.recent_sender);

        expect(data.recent_sender).toEqualAddress(senderWallet.address);

        console.log("end");

    })
}) 
