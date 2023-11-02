import { Contract } from '@algorandfoundation/tealscript';
type AsaData = { 
  // state
  // 1 : In reserve
  // 2 : Secondary trading
  // 3 : Shipped to customer or in the shipping process
  // 9 : Unknown
  state: uint64; // see above

  seller: Address; // who receives the tokens. In case of public audit reserves this MUST be the reserve account of the token issued
  owner: Address; // who can update this record.. the reserve address must 

  // QUOTES - available options to purchase this asset
  quoteAsset1: uint64; // quote in uint64.. this amount of asset1 (gold token) must be paid in order to allow transfer of this token
  asset1: Asset; // gold token asset id
  quoteAsset2: uint64;  // quote in uint64.. this amount of asset2 (fe usdc token) must be paid in order to allow transfer of this token
  asset2: Asset; // fe usdc asset id
  quoteAsset3?: uint64; 
  asset3: Asset;
  quoteAsset4: uint64; 
  asset5: Asset;
};

// eslint-disable-next-line no-unused-vars
class AsaGoldSmartcontract extends Contract {
  data = BoxMap<Asset, AsaData>();

  /**
   * Calculates the sum of two numbers
   *
   * @param a
   * @param b
   * @returns The sum of a and b
   */
  private register(asset: Asset): number {
    return a + b;
  }

  /**
   * Calculates the difference between two numbers
   *
   * @param a
   * @param b
   * @returns The difference between a and b.
   */
  private getDifference(a: number, b: number): number {
    return a >= b ? a - b : b - a;
  }

  /**
  * A method that takes two numbers and does either addition or subtraction
  *
  * @param a The first number
  * @param b The second number
  * @param operation The operation to perform. Can be either 'sum' or 'difference'
  *
  * @returns The result of the operation
  */
  doMath(a: number, b: number, operation: string): number {
    let result: number;

    if (operation === 'sum') {
      result = this.getSum(a, b);
    } else if (operation === 'difference') {
      result = this.getDifference(a, b);
    } else throw Error('Invalid operation');

    return result;
  }
}
