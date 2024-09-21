import { Injectable } from '@nestjs/common';
import * as StellarSDK from '@stellar/stellar-sdk';
import { u128ToBytes } from 'src/utils/u128ToBytes';

@Injectable()
export class ProjectService {
  private server: StellarSDK.SorobanRpc.Server;
  private contract: StellarSDK.Contract;
  private sourceKeypair: StellarSDK.Keypair;
  private trustlessContractId: string;
  // private tokenContractId: string;

  constructor() {
    this.server = new StellarSDK.SorobanRpc.Server(
      'https://soroban-testnet.stellar.org/',
    );
    this.trustlessContractId = 'CC6JFRDTJY2BUASVP6HF7BDDSKEL37AITKSVDGAH6Y7MGEKLG7WXDCXR';
    // this.tokenContractId = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
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

      const scValPrices = StellarSDK.nativeToScVal(adjustedPrices, { type: 'u128' });

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: '100',
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            'initialize_escrow',
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

      if (response.status === 'PENDING') {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');

        if (getResponse.status === 'SUCCESS') {
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
      console.error('Error calling create_project:', error);
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
        (objectiveIdBigInt & BigInt('0xFFFFFFFFFFFFFFFF')).toString(),
      );
      const objectiveIdU128 = StellarSDK.xdr.ScVal.scvU128(
        new StellarSDK.xdr.UInt128Parts({ hi: high, lo: low }),
      );

      const transaction = new StellarSDK.TransactionBuilder(account, {
        fee: '10000',
      })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(30)
        .addOperation(
          this.contract.call(
            'fund_objective',
            contractIdBytes,
            objectiveIdU128,
            StellarSDK.Address.fromString(spender).toScVal(),
            StellarSDK.Address.fromString(usdcContract).toScVal(),
            StellarSDK.Address.fromString(from).toScVal(),
          ),
        )
        .build();

      let preparedTransaction = await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);

      const response = await this.server.sendTransaction(preparedTransaction);

      if (response.status === 'PENDING') {
        let getResponse;

        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');

        if (getResponse.status === 'SUCCESS') {
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
      console.error('Error calling fund_objective:', error);
      throw error;
    }
  }

  async getProjectsBySpender(spenderAddress: string, secretKey: string): Promise<any> {
    try {
      this.sourceKeypair = StellarSDK.Keypair.fromSecret(secretKey);
      const account = await this.server.getAccount(
        this.sourceKeypair.publicKey(),
      );

      const contractIdBuffer = StellarSDK.StrKey.decodeContract(this.trustlessContractId);
      if (contractIdBuffer.length !== 32) {
        throw new Error('Invalid contract ID: Must be 32 bytes in length');
      }

      const hostFunction = StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
        new StellarSDK.xdr.InvokeContractArgs({
          contractAddress: StellarSDK.xdr.ScAddress.scAddressTypeContract(contractIdBuffer),
          functionName: 'get_projects_by_spender',
          args: [
            StellarSDK.Address.fromString(spenderAddress).toScVal(),
          ],
        })
      );
      
      const transaction = new StellarSDK.TransactionBuilder(account, {
          fee: '100',
        })
        .setNetworkPassphrase(StellarSDK.Networks.TESTNET)
        .setTimeout(300) 
        .addOperation(StellarSDK.Operation.invokeHostFunction({
          func: hostFunction,
        }))
        .build();
      
      console.log('Sending transaction...');
      let preparedTransaction = await this.server.prepareTransaction(transaction);
      preparedTransaction.sign(this.sourceKeypair);
      const response = await this.server.sendTransaction(preparedTransaction);
      
      console.log('Transaction Response:', response);
      if (response.status === 'PENDING') {
        let getResponse: StellarSDK.rpc.Api.GetTransactionResponse;
  
        do {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          getResponse = await this.server.getTransaction(response.hash);
        } while (getResponse.status === 'NOT_FOUND');
  
        if (getResponse.status === 'SUCCESS') {
          const resultMetaXdr = getResponse.resultMetaXdr.toXDR();
          const encodedResultMetaXdr = Buffer.from(resultMetaXdr).toString('base64');

          console.log('Encoded resultMetaXdr (JSON):', encodedResultMetaXdr); 

          return getResponse;
        } else {
          throw new Error(`Transaction failed: ${getResponse.resultXdr}`);
        }
      } else {
        throw new Error(`Transaction submission failed: ${JSON.stringify(response.errorResult)}`);
      }
    } catch (error) {
      console.error('Error fetching projects by client:', error);
      throw error;
    }
  }
}