import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";

@Injectable()
export class UserService {
  // Initialize variables.
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;

  constructor() {
    // testnet server
    this.server = new StellarSDK.SorobanRpc.Server(`${process.env.SERVER_URL}`);

    // Freelancer-Contract
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;

    // Contract variable
    this.contract = new StellarSDK.Contract(this.trustlessContractId);
  }

  async register(
    userAddress: string,
    name: string,
    email: string,
    secretKey: string,
  ): Promise<number> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);

      // Account that realize the transaction
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: "100000",
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "register",
            StellarSDK.Address.fromString(userAddress).toScVal(),
            StellarSDK.nativeToScVal(name),
            StellarSDK.nativeToScVal(email),
          ),
        )
        .build();

      // Getting prepared the transaction
      let preparedTransaction =
        await this.server.prepareTransaction(transaction);

      // Getting signed the transaction
      preparedTransaction.sign(this.sourceKeypair);

      // Sending the transaction
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
      throw error;
    }
  }

  async login(userAddress: string, secretKey: string): Promise<string> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);

      // Get the account
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: "100000",
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            "login",
            StellarSDK.Address.fromString(userAddress).toScVal(),
          ),
        )
        .build();

      // Prepare the transaction
      let preparedTransaction =
        await this.server.prepareTransaction(transaction);

      // Sign the transaction
      preparedTransaction.sign(this.sourceKeypair);

      // Send the transaction
      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === "PENDING") {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === "NOT_FOUND");

        if (getResponse.status === "SUCCESS") {
          const userName = getResponse.result;
          console.log(`Transaction successful: ${JSON.stringify(getResponse)}`);
          return userName;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(
          `Transaction submission failed: ${response.errorResult}`,
        );
      }
    } catch (error) {
      console.error("Error calling login function:", error);
      throw error;
    }
  }
}
