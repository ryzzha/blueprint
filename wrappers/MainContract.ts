import { Contract, Address, Cell, beginCell, contractAddress, ContractProvider, Sender, SendMode } from "ton-core";

interface MainContractConfig {
    number: number;
    address: Address;
}

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    const { number, address } = config;
    return beginCell().storeUint(number, 32).storeAddress(address).endCell();
}

export class MainContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {}

    static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new MainContract(address, init);
    }

    async sendInternalMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        })
    }

    async sendChangeCounterMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        operation: "increment" | "decrement",
        amount: number
    ) {
        const op = operation == "increment" ? 1 : 2;
        const msg_body = beginCell().storeUint(op, 32).storeUint(amount, 32).endCell();
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        })
    }

    async getData(provider: ContractProvider) {
        const { stack } = await provider.get("get_contract_storage_data", []);
        return {
            number: stack.readNumber(),
            recent_sender: stack.readAddress()
        }
    }
}