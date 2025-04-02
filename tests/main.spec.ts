import { Cell, toNano } from "ton-core";
import { hex } from "../build/main.compiled.json";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton-community/sandbox";
import { MainContract } from "../wrappers/MainContract";

import "@ton-community/test-utils";

describe("main.fc contract tests", () => {
    let blockchain: Blockchain;
    let senderWallet: SandboxContract<TreasuryContract>;
    beforeEach(async () => {
        console.log("===========================");
        console.log("starting...");
        blockchain = await Blockchain.create();
        console.log("test blockchain created");

        senderWallet = await blockchain.treasury("sender");
    })

    it("our first test", async () => {
         // console.log("sending internal message...");
        // const sendMessageResult = await myContract.sendInternalMessage(senderWallet.getSender(), toNano("0.05"));
        // console.log("internal message sended");

        // expect(sendMessageResult.transactions).toHaveTransaction({
        //     from: senderWallet.address,
        //     to: myContract.address,
        //     success: true,
        // });
    }),
    it("test counter", async () => {
        const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];

        const initWallet = await blockchain.treasury("initAddress");

        const myContract = blockchain.openContract(MainContract.createFromConfig({
            number: 5,
            address: initWallet.address
        }, codeCell));


        console.log("sending increment message...");
        const incrementMessageResult = await myContract.sendChangeCounterMessage(senderWallet.getSender(), toNano("0.01"), "increment", 6);
        console.log("increment message sended");
        
        // console.log(incrementMessageResult)

        expect(incrementMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const { number: number_1, recent_sender: recent_sender_1 } = await myContract.getData();

        expect(number_1).toEqual(11);
        expect(recent_sender_1).toEqualAddress(senderWallet.address);

        console.log("sending decrement message...");
        const decrementMessageResult = await myContract.sendChangeCounterMessage(senderWallet.getSender(), toNano("0.01"), "decrement", 3);
        console.log("decrement message sended");
        
        // console.log(decrementMessageResult)

        expect(decrementMessageResult.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: myContract.address,
            success: true,
        });

        const { number: number_2, recent_sender: recent_sender_2 } = await myContract.getData();

        expect(number_2).toEqual(8);
        expect(recent_sender_2).toEqualAddress(senderWallet.address);

        console.log("end");

    })
}) 
