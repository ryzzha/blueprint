import * as fc from "fs";
import process from "process";
import { Cell } from "ton-core";
import { compileFunc } from "@ton-community/func-js";

async function compileScript() {
 
    const compileResult = await compileFunc({
        targets: ["./contracts/main.fc"],
        sources: (x) => fc.readFileSync(x).toString("utf-8")
    })

    // console.log(compileResult)
    // console.log(compileResult.snapshot) 

    console.log(compileResult) 

    if(compileResult.status == "error") {
        console.error("error in compile")
        process.exit(1); 
    }

    const hexArtifact = "build/main.compiled.json";

    fc.writeFileSync(
        hexArtifact,
        JSON.stringify({
            hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0].toBoc().toString("hex")
        })
    )

}

compileScript();