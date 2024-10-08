import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";
import { parseBalanceByAddressData } from "src/utils/parse.utils";
import {
  buildTransaction,
  signAndSendTransaction,
} from "src/utils/transaction.utils";
import { ApiResponse } from "src/interfaces/response.interface";

@Injectable()
export class HelperService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private usdcToken: string;
  private usdcTokenPublic: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
    this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN;
    this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
  }

  async sendTransaction(signedXdr: string): Promise<any> {
    const transaction = StellarSDK.TransactionBuilder.fromXDR(
      signedXdr,
      StellarSDK.Networks.TESTNET,
    );

    const transactionResult = await this.server.sendTransaction(transaction);
    // console.log({ transactionResult })
    if (transactionResult.status === "PENDING") {
      let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;
      do {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getResponse = await this.server.getTransaction(transactionResult.hash);
      } while (getResponse.status === "NOT_FOUND");

      console.log({ getResponse });
      console.log({ resultXdr: JSON.stringify(getResponse.resultXdr) });
      if (getResponse.status === "SUCCESS") {
        return getResponse;
      } else {
        throw new Error(
          `Transaction failed: ${JSON.stringify(getResponse.resultXdr)}`,
        );
      }
    } else {
      throw new Error(
        `Transaction submission failed: ${transactionResult.errorResult}`,
      );
    }
  }

  async establishTrustline(sourceSecretKey: string): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const usdcAsset = new StellarSDK.Asset("USDC", this.usdcTokenPublic);

      const operations = [
        StellarSDK.Operation.changeTrust({ asset: usdcAsset }),
      ];

      const transaction = buildTransaction(account, operations);

      const result = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      if (result.status !== "SUCCESS") {
        return {
          status: result.status,
          message:
            "An unexpected error occurred while trying to define the trustline in the USDC token. Please try again",
        };
      }

      return {
        status: result.status,
        message: "The trust line has been correctly defined in the USDC token",
      };
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async getBalance(
    address: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_balance",
          StellarSDK.Address.fromString(address).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) => {
          const result = parseBalanceByAddressData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          );
          return { balance: result };
        },
      );
    } catch (error) {
      console.error(
        "An error occurred while trying to obtain the address balance:",
        error,
      );
      throw error;
    }
  }

  async approve_amount(
    from: string,
    spender: string,
    amount: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const microAmount = BigInt(Math.round(parseFloat(amount) * 1e6));
      const high = microAmount >> 64n;
      const low = microAmount & BigInt("0xFFFFFFFFFFFFFFFF");

      const apiWalletAddress = process.env.API_PUBLIC_KEY_WALLET;
      const operations = [
        this.contract.call(
          "approve_amounts",
          StellarSDK.Address.fromString(from).toScVal(),
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.xdr.ScVal.scvI128(
            new StellarSDK.xdr.Int128Parts({
              hi: StellarSDK.xdr.Int64.fromString(high.toString()),
              lo: StellarSDK.xdr.Uint64.fromString(low.toString()),
            }),
          ),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(apiWalletAddress).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );
    } catch (error) {
      console.error(
        "An error occurred when trying to approve amounts between addresses:",
        error,
      );
      throw error;
    }
  }

  async getAllowance(
    from: string,
    spender: string,
  ): Promise<StellarSDK.rpc.Api.GetTransactionResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_allowance",
          StellarSDK.Address.fromString(from).toScVal(),
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) => {
          const result = parseBalanceByAddressData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          );
          return { allownce: result };
        },
      );
    } catch (error) {
      console.error(
        "An error occurred while trying to obtain the allowance of an address:",
        error,
      );
      throw error;
    }
  }
}
