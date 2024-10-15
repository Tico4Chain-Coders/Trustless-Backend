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
  private horizonServer: StellarSDK.Horizon.Server;
  private sorobanServer: StellarSDK.SorobanRpc.Server;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  private usdcToken: string;

  constructor() {
    this.horizonServer = new StellarSDK.Horizon.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.sorobanServer = new StellarSDK.SorobanRpc.Server(
      `${process.env.SOROBAN_SERVER_URL}`,
      { allowHttp: true },
    );
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
  }

  async initializeEscrow(
    contractId: string,
    engagementId: string,
    description: string,
    serviceProvider: string,
    amount: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const account = await this.sorobanServer.getAccount(signer);

      const adjustedPrice = adjustPricesToMicroUSDC(amount);
      const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, {
        type: "u128",
      });

      const operations = [
        contract.call(
          "initialize_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.nativeToScVal(description, { type: "string" }),
          StellarSDK.Address.fromString(process.env.ISSUER_ADDRESS).toScVal(),
          StellarSDK.Address.fromString(serviceProvider).toScVal(),
          scValPrice,
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

      return {
        status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
        unsignedTransaction: preparedTransaction.toXDR()
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
    contractId: string,
    engagementId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const account = await this.sorobanServer.getAccount(signer);
      const operations = [
        contract.call(
          "fund_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations, "1000");
      const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

      return {
        status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
        unsignedTransaction: preparedTransaction.toXDR()
      };
    } catch (error) {
      console.log({ error })
      if (error.message.includes("HostError: Error(Contract, #")) {
        const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)[1];
        const errorMessage = mapErrorCodeToMessage(errorCode);
        throw errorMessage;
      }

      throw error;
    }
  }

  async completeEscrow(
    contractId: string,
    engagementId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const account = await this.sorobanServer.getAccount(signer);

      const operations = [
        contract.call(
          "complete_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

      return {
        status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
        unsignedTransaction: preparedTransaction.toXDR()
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
    contractId: string,
    engagementId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const account = await this.horizonServer.loadAccount(signer);

      const operations = [
        contract.call(
          "cancel_escrow",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

      return {
        status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
        unsignedTransaction: preparedTransaction.toXDR()
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
    contractId: string,
    engagementId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const account = await this.horizonServer.loadAccount(signer);

      const operations = [
        contract.call(
          "refund_remaining_funds",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
          StellarSDK.Address.fromString(signer).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(this.trustlessContractId).toScVal(),
        ),
      ];

      const transaction = buildTransaction(account, operations);
      const preparedTransaction = await this.sorobanServer.prepareTransaction(transaction);

      return {
        status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
        unsignedTransaction: preparedTransaction.toXDR()
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
    contractId: string,
    engagementId: string,
  ): Promise<escrowResponse | ApiResponse> {
    try {
      const contract = new StellarSDK.Contract(contractId);
      const walletApiSecretKey = process.env.API_SECRET_KEY_WALLET;
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(walletApiSecretKey);
      const account = await this.horizonServer.loadAccount(
        this.sourceKeypair.publicKey(),
      );

      const operations = [
        contract.call(
          "get_escrow_by_id",
          StellarSDK.nativeToScVal(engagementId, { type: "string" }),
        ),
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
            "An unexpected error occurred while trying to refund the escrow. Please try again",
        };
      }

      const parseEscrow = parseEngagementData(result);

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
