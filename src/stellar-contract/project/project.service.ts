import { Injectable } from "@nestjs/common";
import * as StellarSDK from "@stellar/stellar-sdk";
import {
  adjustPricesToMicroUSDC,
  microUSDToDecimal,
  parseEscrowData,
  parseBalanceByAddressData,
} from "src/utils/parse.utils";
import {
  buildTransaction,
  signAndSendTransaction,
} from "src/utils/transaction.utils";
import { u128ToBytes } from "src/utils/u128ToBytes";

@Injectable()
export class ProjectService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  private usdcToken: string;
  private usdcTokenPublic: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      `${process.env.SERVER_URL}`,
      { allowHttp: true },
    );
    this.trustlessContractId = process.env.TRUSTLESS_CONTRACT_ID;
    this.usdcToken = process.env.USDC_SOROBAN_CIRCLE_TOKEN_TEST;
    this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN;
    this.contract = new StellarSDK.Contract(process.env.TRUSTLESS_CONTRACT_ID);
  }

  async createEngagement(
    serviceProvider: string,
    prices: string[],
    client: string,
    secretKey: string,
  ): Promise<number> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      // Funcion de src/utils/price, que ajusta el precio.
      const adjustedPrices = adjustPricesToMicroUSDC(prices);

      const scValPrices = StellarSDK.nativeToScVal(adjustedPrices, {
        type: "u128",
      });

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
      const operations = [
        this.contract.call(
          "initialize_escrow",
          StellarSDK.Address.fromString(serviceProvider).toScVal(),
          scValPrices,
          StellarSDK.Address.fromString(client).toScVal(),
        ),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );
    } catch (error) {
      console.error("Error calling create_project:", error);
      throw error;
    }
  }

  async fundEscrow(
    engamentId: string,
    escrowId: string,
    spender: string,
    from: string,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBytes = u128ToBytes(engamentId);
      const objectiveIdBigInt = BigInt(escrowId);
      const high = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt >> 64n).toString(),
      );
      const low = StellarSDK.xdr.Uint64.fromString(
        (objectiveIdBigInt & BigInt("0xFFFFFFFFFFFFFFFF")).toString(),
      );
      const objectiveIdU128 = StellarSDK.xdr.ScVal.scvU128(
        new StellarSDK.xdr.UInt128Parts({ hi: high, lo: low }),
      );

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
      const operations = [
        this.contract.call(
          "fund_objective",
          contractIdBytes,
          objectiveIdU128,
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
          StellarSDK.Address.fromString(from).toScVal(),
        ),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );
    } catch (error) {
      console.error("Error calling fund_objective:", error);
      throw error;
    }
  }

  async getEscrowsBySpender(
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

      const operations = [
        StellarSDK.Operation.invokeHostFunction({
          func: hostFunction,
        }),
      ];

      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
        (response) =>
          parseEscrowData(
            response as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse,
          ),
      );
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }

  async establishTrustline(sourceSecretKey: string): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const usdcAsset = new StellarSDK.Asset("USDC", this.usdcTokenPublic);

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
      const operations = [
        StellarSDK.Operation.changeTrust({ asset: usdcAsset }),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        false,
      );
    } catch (error) {
      console.log("Error:", error);
      throw error;
    }
  }

  async getBalance(address: string, secretKey: string): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
      const operations = [
        this.contract.call(
          "get_balance",
          StellarSDK.Address.fromString(address).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
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
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }

  async approve_amount(
    from: string,
    spender: string,
    amount: string,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const microAmount = BigInt(Math.round(parseFloat(amount) * 1e6));
      const high = microAmount >> 64n;
      const low = microAmount & BigInt("0xFFFFFFFFFFFFFFFF");

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
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
        ),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
      return await signAndSendTransaction(
        transaction,
        this.sourceKeypair,
        this.server,
        true,
      );
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }

  async getAllowance(
    from: string,
    spender: string,
    secretKey: string,
  ): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      // Aqui se pasan los parametros junto con el nombre de la funcion para el smart contract.
      const operations = [
        this.contract.call(
          "get_allowance",
          StellarSDK.Address.fromString(from).toScVal(),
          StellarSDK.Address.fromString(spender).toScVal(),
          StellarSDK.Address.fromString(this.usdcToken).toScVal(),
        ),
      ];

      // Se llama a la funcion que ejecuta la creacion de la transaccion.
      const transaction = buildTransaction(account, operations);

      // Firma y envia la transaccion al smart contract.
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
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }
}
