import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";
import { mapErrorCodeToMessage } from "../../utils/errors.utils";
import {
  adjustPricesToMicroUSDC,
  parseEngagementData,
} from "src/utils/parse.utils";
import {
  buildTransaction,
  signAndSendTransaction,
} from "src/utils/transaction.utils";
import { ApiResponse, escrowResponse } from "src/interfaces/response.interface";

@Injectable()
export class EscrowService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  private usdcToken: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
    this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
  }

  async initializeEscrow(
    engagementId: string,
    description: string,
    issuer: string,
    serviceProvider: string,
    amount: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const adjustedPrice = adjustPricesToMicroUSDC(amount);
      const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, {
        type: "u128",
      });

      const operations = [
        this.contract.call(
          "initialize_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.nativeToScVal(description, { type: "string" }),
          StellarSDK.Address.fromString(issuer).toScVal(),
          StellarSDK.Address.fromString(serviceProvider).toScVal(),
          scValPrice,
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
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
            "An unexpected error occurred while trying to initialize the escrow. Please try again",
        };
      }

      return {
        status: result.status,
        message: "The escrow has been successfully initialized",
      };
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async fundEscrow(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );
      // const account = await this.server.getAccount(signer);
      const operations = [
        this.contract.call(
          "fund_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      // const preparedTransaction = await this.server.prepareTransaction(transaction);

      // return preparedTransaction.toXDR();

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
            "An unexpected error occurred while trying to fund the escrow. Please try again",
        };
      }

      return {
        status: result.status,
        message: "The escrow has been successfully funded",
      };
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async completeEscrow(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "complete_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
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
            "An unexpected error occurred while trying to complete the escrow. Please try again",
        };
      }

      return {
        status: result.status,
        message: "The escrow has been successfully completed",
      };
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async cancelEscrow(
    engagementId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "cancel_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
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
            "An unexpected error occurred while trying to cancel the escrow. Please try again",
        };
      }

      return {
        status: result.status,
        message: "The escrow has been successfully canceled",
      };
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async refundRemainingFunds(
    engagementId: string,
    signer: string,
    secretKey: string,
  ): Promise<ApiResponse> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "refund_remaining_funds",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
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
            "An unexpected error occurred while trying to refund the escrow. Please try again",
        };
      }

      return {
        status: result.status,
        message: "Escrow funds have been successfully refunded",
      };
    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async getEscrowByEngagementID(
    engagementId: string,
  ): Promise<escrowResponse> {
    try {
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        this.contract.call(
          "get_escrow_by_id",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
        ),
      ];

      const transaction = buildTransaction(account, operations);

      const escrow = await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );

      const parseEscrow = parseEngagementData(escrow);

      return parseEscrow

    } catch (error) {
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }
}
