import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";
import { parse } from "path";
import { u128ToBytes } from "src/utils/u128ToBytes";

@Injectable()
export class ProjectService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  // private tokenContractId: string;

  constructor() {
    // testnet server
    this.server = new StellarSDK.SorobanRpc.Server(`${process.env.SERVER_URL}`);

    // Freelancer-Contract
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;

    // Contract variable
    this.contract = new StellarSDK.Contract(this.trustlessContractId);
  }

  async initializeEscrow(
    freelancer: string,
    prices: string[],
    user: string,
    secretKey: string,
  ): Promise<number> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const adjustedPrices = prices.map((price) => {
        const microUSDC = BigInt(Math.round(parseFloat(price) * 1e6));
        return microUSDC.toString();
      });

      const scValPrices = StellarSDK.nativeToScVal(adjustedPrices, {
        type: "u128",
      });

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: "100",
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "initialize_escrow",
            StellarSDK.Address.fromString(freelancer).toScVal(),
            scValPrices,
            StellarSDK.Address.fromString(user).toScVal(),
          ),
        )
        .build();

      let preparedTransaction =
        await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);

      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === "PENDING") {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === "NOT_FOUND");

        if (getResponse.status === "SUCCESS") {
          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${response.errorResult}`,
        );
      }
    } catch (error) {
      console.error("Error calling create_project:", error);
      throw error;
    }
  }

  async fundObjective(
    escrowId: string,
    partyId: string,
    spender: string,
    usdcContract: string,
    from: string,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBytes = u128ToBytes(escrowId);
      const objectiveIdBigInt = BigInt(partyId);
      const high = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt >> 64n).toString(),
      );
      const low = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt & BigInt("0xFFFFFFFFFFFFFFFF")).toString(),
      );
      const objectiveIdU128 = StellarSDK.xdr.ScVal.scvU128(
        new StellarSDK.xdr.UInt128Parts({ hi: high, lo: low }),
      );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: "10000",
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "fund_objective",
            contractIdBytes,
            objectiveIdU128,
            StellarSDK.Address.fromString(spender).toScVal(),
            StellarSDK.Address.fromString(usdcContract).toScVal(),
            StellarSDK.Address.fromString(from).toScVal(),
          ),
        )
        .build();

      let preparedTransaction =
        await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);

      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === "PENDING") {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === "NOT_FOUND");

        if (getResponse.status === "SUCCESS") {
          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${JSON.stringify(response.errorResult)}`,
        );
      }
    } catch (error) {
      console.error("Error calling fund_objective:", error);
      throw error;
    }
  }

  private microUSDToDecimal(microUSDC: bigint | number): number {
    return Number(microUSDC) / 1e6;
  }

  private parseEscrowData(
    response: StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
  ): any {
    try {
      const xdrResult = response.resultMetaXdr;
      const xdrBuffer = xdrResult.toXDR();
      const xdrBase64 = xdrBuffer.toString("base64");
      const transactionMeta = StellarSDK.xdr.TransactionMeta.fromXDR(
        xdrBase64,
        "base64",
      );

      const contractEvents = transactionMeta.v3().sorobanMeta().events();

      const lastEvent = contractEvents[contractEvents.length - 1];
      const scVal = lastEvent.body().value();
      const contractEventV0 = scVal.data();

      const escrows = StellarSDK.scValToNative(contractEventV0);
      return escrows[1].map((escrow: any) => ({
        escrow_id: Buffer.from(escrow.escrow_id).toString("hex"),
        spender: escrow.spender,
        from: escrow.from,
        parties_count: Number(escrow.parties_count),
        parties: Object.values(escrow.parties).map((party: any) => ({
          completed: party.completed,
          half_paid: this.microUSDToDecimal(Number(party.half_paid)),
          price: this.microUSDToDecimal(Number(party.price)),
        })),
        completed_parties: Number(escrow.completed_parties),
        earned_amount: Number(escrow.earned_amount),
        contract_balance: Number(escrow.contract_balance),
        cancelled: escrow.cancelled,
        completed: escrow.completed,
      }));
    } catch (error) {
      console.error("Error parsing escrow data:", error);
      throw error;
    }
  }

  async getProjectsBySpender(
    spenderAddress: string,
    page: number,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBuffer = StellarSDK.StrKey.decodeContract(
        this.trustlessContractId,
      );
      if (contractIdBuffer.length !== 32) {
        throw new Error("Invalid contract ID: Must be 32 bytes in length");
      }

      const limit = 4;
      const hostFunction =
        StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
          new StellarSDK.xdr.InvokeContractArgs({
            contractAddress:
              StellarSDK.xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
            functionName: "get_projects_by_spender",
            args: [
              StellarSDK.Address.fromString(spenderAddress).toScVal(),
              StellarSDK.xdr.ScVal.scvU32(Number(page)),
              StellarSDK.xdr.ScVal.scvU32(limit),
            ],
          }),
        );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: "100",
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(1000)
        .addOperation(
          StellarSDK.Operation.invokeHostFunction({
            func: hostFunction,
          }),
        )
        .build();

      let preparedTransaction =
        await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);
      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === "PENDING") {
        let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === "NOT_FOUND");

        if (getResponse.status === "SUCCESS") {
          const resultMetaJSON = this.parseEscrowData(getResponse);
          return resultMetaJSON;
        } else {
          return getResponse;
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${JSON.stringify(response.errorResult)}`,
        );
      }
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }
}
