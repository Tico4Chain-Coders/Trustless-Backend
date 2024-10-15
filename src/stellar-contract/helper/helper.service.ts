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
  private horizonServer: StellarSDK.Horizon.Server;
  private sorobanServer: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private usdcToken: string;
  private usdcTokenPublic: string;

  constructor() {
    this.horizonServer = new StellarSDK.Horizon.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.sorobanServer = new StellarSDK.SorobanRpc.Server(
      `${process.env.SOROBAN_SERVER_URL}`,
      { allowHttp: true },
    );
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
    this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN;
    this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
  }

  async sendTransaction(signedXdr: string): Promise<StellarSDK.Horizon.HorizonApi.SubmitTransactionResponse> {
    try {
      const transaction = StellarSDK.TransactionBuilder.fromXDR(
        signedXdr,
        StellarSDK.Networks.TESTNET,
      );
      const response = await this.horizonServer.submitTransaction(transaction);

      return response
    } catch (error) {
      throw new Error(error)
    }
  }

  async establishTrustline(sourceSecretKey: string): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey);
      const account = await this.sorobanServer.getAccount(
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
        this.sorobanServer,
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

  async getAllowance(
    from: string,
    spender: string,
  ): Promise<{ allowance: number }> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.sorobanServer.getAccount(
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

      const allowance = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.sorobanServer,
        true,
      );

      const parseAllowance = parseBalanceByAddressData(allowance);

      return { allowance: parseAllowance };
    } catch (error) {
      console.error(
        "An error occurred while trying to obtain the allowance of an address:",
        error,
      );
      throw error;
    }
  }
}
