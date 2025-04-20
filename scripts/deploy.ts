import { address, toNano } from "ton-core";
import { MainContract } from "../wrappers/Main";
import { compile, NetworkProvider } from "@ton-community/blueprint";

export async function run(provider: NetworkProvider) {
    const myContract = MainContract.createFromConfig({
        number: 0,
        address: address("UQCGhs01cudLVBdZCEeJB_xf8GVQvtGm7VjT5tJ8wYER_RzH"),
        owner: address("UQCGhs01cudLVBdZCEeJB_xf8GVQvtGm7VjT5tJ8wYER_RzH")
    }, await compile("MainContract"));

    const openedContract = provider.open(myContract);

    await openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);
}
