(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require2() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@bsv/sdk/dist/esm/src/primitives/BigNumber.js
  var BufferCtor, CAN_USE_BUFFER, HEX_CHAR_TO_VALUE, BigNumber;
  var init_BigNumber = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/BigNumber.js"() {
      BufferCtor = globalThis.Buffer;
      CAN_USE_BUFFER = BufferCtor != null && typeof BufferCtor.from === "function";
      HEX_CHAR_TO_VALUE = new Int8Array(256).fill(-1);
      for (let i = 0; i < 10; i++) {
        HEX_CHAR_TO_VALUE[48 + i] = i;
      }
      for (let i = 0; i < 6; i++) {
        HEX_CHAR_TO_VALUE[65 + i] = 10 + i;
        HEX_CHAR_TO_VALUE[97 + i] = 10 + i;
      }
      BigNumber = class _BigNumber {
        /**
         * @privateinitializer
         */
        static zeros = [
          "",
          "0",
          "00",
          "000",
          "0000",
          "00000",
          "000000",
          "0000000",
          "00000000",
          "000000000",
          "0000000000",
          "00000000000",
          "000000000000",
          "0000000000000",
          "00000000000000",
          "000000000000000",
          "0000000000000000",
          "00000000000000000",
          "000000000000000000",
          "0000000000000000000",
          "00000000000000000000",
          "000000000000000000000",
          "0000000000000000000000",
          "00000000000000000000000",
          "000000000000000000000000",
          "0000000000000000000000000"
        ];
        /**
         * @privateinitializer
         */
        static groupSizes = [
          0,
          0,
          25,
          16,
          12,
          11,
          10,
          9,
          8,
          8,
          7,
          7,
          7,
          7,
          6,
          6,
          6,
          6,
          6,
          6,
          6,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5
        ];
        /**
         * @privateinitializer
         */
        static groupBases = [
          0,
          0,
          33554432,
          43046721,
          16777216,
          48828125,
          60466176,
          40353607,
          16777216,
          43046721,
          1e7,
          19487171,
          35831808,
          62748517,
          7529536,
          11390625,
          16777216,
          24137569,
          34012224,
          47045881,
          64e6,
          4084101,
          5153632,
          6436343,
          7962624,
          9765625,
          11881376,
          14348907,
          17210368,
          20511149,
          243e5,
          28629151,
          33554432,
          39135393,
          45435424,
          52521875,
          60466176
        ];
        /**
         * The word size of big number chunks.
         *
         * @property wordSize
         *
         * @example
         * console.log(BigNumber.wordSize);  // output: 26
         */
        static wordSize = 26;
        static #WORD_SIZE_BIGINT = 26n;
        static #WORD_MASK = (1n << 26n) - 1n;
        static #MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
        static #MIN_SAFE_INTEGER_BIGINT = BigInt(Number.MIN_SAFE_INTEGER);
        static #MAX_IMULN_ARG = 67108864 - 1;
        static #MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT = (1n << 53n) - 1n;
        // About 3.25 MiB of mathematical payload. Legitimate cryptographic values
        // are orders of magnitude smaller; this cap prevents hostile sparse-length
        // metadata from causing an unbounded dense JavaScript array allocation.
        static #MAX_NOMINAL_WORD_LENGTH = 1048576;
        #_magnitude = 0n;
        #_sign = 0;
        #_nominalWordLength = 1;
        /**
         * Reduction context of the big number.
         *
         * @property red
         */
        red = null;
        /**
         * Negative flag. Indicates whether the big number is a negative number.
         * - If 0, the number is positive.
         * - If 1, the number is negative.
         *
         * @property negative
         */
        get negative() {
          return this.#_sign;
        }
        /**
         * Sets the negative flag. Only 0 (positive) or 1 (negative) are allowed.
         */
        set negative(val) {
          this.#assert(val === 0 || val === 1, "Negative property must be 0 or 1");
          const newSign = val === 1 ? 1 : 0;
          if (this.#_magnitude === 0n) {
            this.#_sign = 0;
          } else {
            this.#_sign = newSign;
          }
        }
        get #_computedWordsArray() {
          if (this.#_magnitude === 0n)
            return [0];
          const arr = [];
          let temp = this.#_magnitude;
          while (temp > 0n) {
            arr.push(Number(temp & _BigNumber.#WORD_MASK));
            temp >>= _BigNumber.#WORD_SIZE_BIGINT;
          }
          return arr.length > 0 ? arr : [0];
        }
        /**
         * Array of numbers, where each number represents a part of the value of the big number.
         *
         * @property words
         */
        get words() {
          if (!Number.isSafeInteger(this.#_nominalWordLength) || this.#_nominalWordLength < 1 || this.#_nominalWordLength > _BigNumber.#MAX_NOMINAL_WORD_LENGTH) {
            throw new Error("BigNumber word length exceeds the supported limit");
          }
          const computed = this.#_computedWordsArray;
          if (this.#_nominalWordLength <= computed.length) {
            return computed;
          }
          const paddedWords = Array.from({ length: this.#_nominalWordLength }).fill(0);
          for (let i = 0; i < computed.length; i++) {
            paddedWords[i] = computed[i];
          }
          return paddedWords;
        }
        /**
         * Sets the words array representing the value of the big number.
         */
        set words(newWords) {
          const oldSign = this.#_sign;
          let newMagnitude = 0n;
          const len = newWords.length > 0 ? newWords.length : 1;
          for (let i = len - 1; i >= 0; i--) {
            const wordVal = newWords[i] ?? 0;
            newMagnitude = newMagnitude << _BigNumber.#WORD_SIZE_BIGINT | BigInt(wordVal & Number(_BigNumber.#WORD_MASK));
          }
          this.#_magnitude = newMagnitude;
          this.#_sign = oldSign;
          this.#_nominalWordLength = len;
          this.normSign();
        }
        /**
         * Length of the words array.
         *
         * @property length
         */
        get length() {
          return Math.max(1, this.#_nominalWordLength);
        }
        /**
         * Checks whether a value is an instance of BigNumber. Regular JS numbers fail this check.
         *
         * @method isBN
         * @param num - The value to be checked.
         * @returns - Returns a boolean value determining whether or not the checked num parameter is a BigNumber.
         */
        static isBN(num) {
          if (num instanceof _BigNumber)
            return true;
          return num !== null && typeof num === "object" && num.constructor?.wordSize === _BigNumber.wordSize && Array.isArray(num.words);
        }
        /**
         * Returns the bigger value between two BigNumbers
         *
         * @method max
         * @param left - The first BigNumber to be compared.
         * @param right - The second BigNumber to be compared.
         * @returns - Returns the bigger BigNumber between left and right.
         */
        static max(left, right) {
          return left.cmp(right) > 0 ? left : right;
        }
        /**
         * Returns the smaller value between two BigNumbers
         *
         * @method min
         * @param left - The first BigNumber to be compared.
         * @param right - The second BigNumber to be compared.
         * @returns - Returns the smaller value between left and right.
         */
        static min(left, right) {
          return left.cmp(right) < 0 ? left : right;
        }
        /**
         * @constructor
         *
         * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
         * @param base - The base of number provided. By default is 10.
         * @param endian - The endianness provided. By default is 'big endian'.
         */
        constructor(number = 0, base = 10, endian = "be") {
          number ??= 0;
          if (typeof number === "bigint") {
            this.#_initializeState(number < 0n ? -number : number, number < 0n ? 1 : 0);
            this.normSign();
            return;
          }
          const baseIsEndian = base === "le" || base === "be";
          const effectiveBase = baseIsEndian ? 10 : base;
          const effectiveEndian = baseIsEndian ? base : endian;
          if (typeof number === "number") {
            this.#initNumber(number, effectiveEndian);
            return;
          }
          if (Array.isArray(number)) {
            this.#initArray(number, effectiveEndian);
            return;
          }
          if (typeof number === "string") {
            this.#_initFromString(number, effectiveBase, effectiveEndian);
            return;
          }
          if (number !== 0) {
            this.#assert(false, "Unsupported input type for BigNumber constructor");
          } else {
            this.#_initializeState(0n, 0);
          }
        }
        #_initFromString(number, effectiveBase, effectiveEndian) {
          if (effectiveBase === "hex")
            effectiveBase = 16;
          this.#assert(typeof effectiveBase === "number" && effectiveBase === Math.trunc(effectiveBase) && effectiveBase >= 2 && effectiveBase <= 36, "Base must be an integer between 2 and 36");
          const originalNumberStr = number.toString().replace(/\s+/g, "");
          let start = 0;
          let sign2 = 0;
          if (originalNumberStr.startsWith("-")) {
            start++;
            sign2 = 1;
          } else if (originalNumberStr.startsWith("+")) {
            start++;
          }
          const numStr = originalNumberStr.substring(start);
          if (numStr.length === 0) {
            this.#_initializeState(0n, sign2 === 1 && originalNumberStr.startsWith("-") ? 1 : 0);
            this.normSign();
            return;
          }
          if (effectiveBase === 16) {
            this.#_initFromHexString(numStr, sign2, effectiveEndian);
          } else {
            this.#_initFromNonHexString(numStr, effectiveBase, sign2, effectiveEndian);
          }
        }
        #_initFromHexString(numStr, sign2, effectiveEndian) {
          if (effectiveEndian === "le") {
            const bytes3 = [];
            let hexStr = numStr;
            if (hexStr.length % 2 !== 0)
              hexStr = "0" + hexStr;
            for (let i = 0; i < hexStr.length; i += 2) {
              const byteHex = hexStr.substring(i, i + 2);
              const byteVal = Number.parseInt(byteHex, 16);
              if (Number.isNaN(byteVal))
                throw new Error("Invalid character in " + hexStr);
              bytes3.push(byteVal);
            }
            this.#initArray(bytes3, "le");
            this.#_sign = sign2;
            this.normSign();
          } else {
            let tempMagnitude;
            try {
              tempMagnitude = BigInt("0x" + numStr);
            } catch {
              throw new Error("Invalid character in " + numStr);
            }
            this.#_initializeState(tempMagnitude, sign2);
            this.normSign();
          }
        }
        #_initFromNonHexString(numStr, base, sign2, effectiveEndian) {
          try {
            this.#_parseBaseString(numStr, base);
            this.#_sign = sign2;
            this.normSign();
            if (effectiveEndian === "le") {
              const currentSign = this.#_sign;
              this.#initArray(this.toArray("be"), "le");
              this.#_sign = currentSign;
              this.normSign();
            }
          } catch (err) {
            const error = err;
            if (error.message.includes("Invalid character in string") || error.message.includes("Invalid digit for base") || error.message.startsWith("Invalid character:")) {
              throw new Error("Invalid character");
            }
            throw error;
          }
        }
        #_bigIntToStringInBase(num, base) {
          if (num === 0n)
            return "0";
          if (base < 2 || base > 36)
            throw new Error("Base must be between 2 and 36");
          const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
          let result = "";
          let currentNum = num > 0n ? num : -num;
          const bigBase = BigInt(base);
          while (currentNum > 0n) {
            result = digits[Number(currentNum % bigBase)] + result;
            currentNum /= bigBase;
          }
          return result;
        }
        #_parseBaseString(numberStr, base) {
          this.#_magnitude = 0n;
          const bigBase = BigInt(base);
          let groupSize = _BigNumber.groupSizes[base];
          let groupBaseBigInt = BigInt(_BigNumber.groupBases[base]);
          if (groupSize === 0 || groupBaseBigInt === 0n) {
            groupSize = Math.floor(Math.log(67108863) / Math.log(base));
            if (groupSize === 0)
              groupSize = 1;
            groupBaseBigInt = bigBase ** BigInt(groupSize);
          }
          let currentPos = 0;
          const totalLen = numberStr.length;
          let firstChunkLen = totalLen % groupSize;
          if (firstChunkLen === 0 && totalLen > 0)
            firstChunkLen = groupSize;
          if (firstChunkLen > 0) {
            const chunkStr = numberStr.substring(currentPos, currentPos + firstChunkLen);
            this.#_magnitude = BigInt(this.#_parseBaseWord(chunkStr, base));
            currentPos += firstChunkLen;
          }
          while (currentPos < totalLen) {
            const chunkStr = numberStr.substring(currentPos, currentPos + groupSize);
            const wordVal = BigInt(this.#_parseBaseWord(chunkStr, base));
            this.#_magnitude = this.#_magnitude * groupBaseBigInt + wordVal;
            currentPos += groupSize;
          }
          this.#_finishInitialization();
        }
        #_parseBaseWord(str, base) {
          let r2 = 0;
          for (let i = 0; i < str.length; i++) {
            const charCode = str.codePointAt(i);
            let digitVal;
            if (charCode >= 48 && charCode <= 57)
              digitVal = charCode - 48;
            else if (charCode >= 65 && charCode <= 90)
              digitVal = charCode - 65 + 10;
            else if (charCode >= 97 && charCode <= 122)
              digitVal = charCode - 97 + 10;
            else
              throw new Error("Invalid character: " + str[i]);
            if (digitVal >= base)
              throw new Error("Invalid character");
            r2 = r2 * base + digitVal;
          }
          return r2;
        }
        #_initializeState(magnitude, sign2) {
          this.#_magnitude = magnitude;
          this.#_sign = magnitude === 0n ? 0 : sign2;
          this.#_finishInitialization();
        }
        #_finishInitialization() {
          if (this.#_magnitude === 0n) {
            this.#_nominalWordLength = 1;
            this.#_sign = 0;
          } else {
            const bitLen = this.#_magnitude.toString(2).length;
            this.#_nominalWordLength = Math.max(1, Math.ceil(bitLen / _BigNumber.wordSize));
          }
        }
        #assert(val, msg = "Assertion failed") {
          if (!val)
            throw new Error(msg);
        }
        #initNumber(number, endian = "be") {
          this.#assert(BigInt(Math.abs(number)) <= _BigNumber.#MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT, "The number is larger than 2 ^ 53 (unsafe)");
          this.#assert(number % 1 === 0, "Number must be an integer for BigNumber conversion");
          this.#_initializeState(BigInt(Math.abs(number)), number < 0 ? 1 : 0);
          if (endian === "le") {
            const currentSign = this.#_sign;
            const beBytes = this.toArray("be");
            this.#initArray(beBytes, "le");
            this.#_sign = currentSign;
            this.normSign();
          }
          return this;
        }
        #initArray(bytes3, endian) {
          if (bytes3.length === 0) {
            this.#_initializeState(0n, 0);
            return this;
          }
          let magnitude = 0n;
          if (endian === "be") {
            for (const byte of bytes3)
              magnitude = magnitude << 8n | BigInt(byte & 255);
          } else {
            for (let i = bytes3.length - 1; i >= 0; i--)
              magnitude = magnitude << 8n | BigInt(bytes3[i] & 255);
          }
          this.#_initializeState(magnitude, 0);
          return this;
        }
        copy(dest) {
          dest.#_magnitude = this.#_magnitude;
          dest.#_sign = this.#_sign;
          dest.#_nominalWordLength = this.#_nominalWordLength;
          dest.red = this.red;
        }
        static move(dest, src) {
          dest.#_magnitude = src.#_magnitude;
          dest.#_sign = src.#_sign;
          dest.#_nominalWordLength = src.#_nominalWordLength;
          dest.red = src.red;
        }
        clone() {
          const r2 = new _BigNumber(0n);
          this.copy(r2);
          return r2;
        }
        expand(size) {
          this.#assert(Number.isSafeInteger(size) && size >= 0 && size <= _BigNumber.#MAX_NOMINAL_WORD_LENGTH, "Expand size must be a non-negative safe integer within the supported word limit");
          this.#_nominalWordLength = Math.max(this.#_nominalWordLength, size, 1);
          return this;
        }
        strip() {
          this.#_finishInitialization();
          return this.normSign();
        }
        normSign() {
          if (this.#_magnitude === 0n) {
            this.#_sign = 0;
          }
          return this;
        }
        inspect() {
          return (this.red === null ? "<BN: " : "<BN-R: ") + this.toString(16) + ">";
        }
        #_getMinimalHex() {
          if (this.#_magnitude === 0n)
            return "0";
          return this.#_magnitude.toString(16);
        }
        #_toHexString(padding) {
          let hexStr = this.#_getMinimalHex();
          if (padding > 1) {
            if (hexStr !== "0" && hexStr.length % 2 !== 0) {
              hexStr = "0" + hexStr;
            }
            while (hexStr.length % padding !== 0) {
              hexStr = "0" + hexStr;
            }
          }
          return (this.isNeg() ? "-" : "") + hexStr;
        }
        /**
         * Converts the BigNumber instance to a string representation.
         *
         * @method toString
         * @param base - The base for representing number. Default is 10. Other accepted values are 16 and 'hex'.
         * @param padding - Represents the minimum number of digits to represent the BigNumber as a string. Default is 1.
         * @returns The string representation of the BigNumber instance
         */
        toString(base = 10, padding = 1) {
          if (base === 16 || base === "hex") {
            return this.#_toHexString(padding);
          }
          if (typeof base !== "number" || base < 2 || base > 36 || base % 1 !== 0)
            throw new Error("Base should be an integer between 2 and 36");
          return this.#toBaseString(base, padding);
        }
        #toBaseString(base, padding) {
          if (this.#_magnitude === 0n) {
            return _BigNumber.#_paddedZero(padding);
          }
          let groupSize = _BigNumber.groupSizes[base];
          let groupBaseBigInt = BigInt(_BigNumber.groupBases[base]);
          if (groupSize === 0 || groupBaseBigInt === 0n) {
            groupSize = Math.floor(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(base));
            if (groupSize === 0)
              groupSize = 1;
            groupBaseBigInt = BigInt(base) ** BigInt(groupSize);
          }
          let out = "";
          let tempMag = this.#_magnitude;
          while (tempMag > 0n) {
            const remainder = tempMag % groupBaseBigInt;
            tempMag /= groupBaseBigInt;
            const chunkStr = this.#_bigIntToStringInBase(remainder, base);
            out = (tempMag > 0n ? this.#_zeroPaddedChunk(chunkStr, groupSize) : chunkStr) + out;
          }
          if (padding > 0) {
            while (out.length < padding)
              out = "0" + out;
          }
          return (this.#_sign === 1 ? "-" : "") + out;
        }
        static #_paddedZero(padding) {
          let out = "0";
          if (padding > 1) {
            while (out.length < padding)
              out = "0" + out;
          }
          return out;
        }
        /** Returns a chunk string zero-padded to groupSize (used by toBaseString for interior chunks). */
        #_zeroPaddedChunk(chunkStr, groupSize) {
          const zerosToPrepend = groupSize - chunkStr.length;
          if (zerosToPrepend <= 0)
            return chunkStr;
          if (zerosToPrepend < _BigNumber.zeros.length)
            return _BigNumber.zeros[zerosToPrepend] + chunkStr;
          return "0".repeat(zerosToPrepend) + chunkStr;
        }
        /**
         * Converts the BigNumber instance to a JavaScript number.
         * Please note that JavaScript numbers are only precise up to 53 bits.
         *
         * @method toNumber
         * @throws If the BigNumber instance cannot be safely stored in a JavaScript number
         * @returns The JavaScript number representation of the BigNumber instance.
         */
        toNumber() {
          const val = this.#_getSignedValue();
          if (val > _BigNumber.#MAX_SAFE_INTEGER_BIGINT || val < _BigNumber.#MIN_SAFE_INTEGER_BIGINT)
            throw new Error("Number can only safely store up to 53 bits");
          return Number(val);
        }
        /**
         * Returns the signed BigInt representation of this BigNumber without any safety checks.
         *
         * @method toBigInt
         * @returns bigint value for this BigNumber.
         */
        toBigInt() {
          return this.#_getSignedValue();
        }
        /**
         * Converts the BigNumber instance to a JSON-formatted string.
         *
         * @method toJSON
         * @returns The JSON string representation of the BigNumber instance.
         */
        toJSON() {
          const hex2 = this.#_getMinimalHex();
          return (this.isNeg() ? "-" : "") + hex2;
        }
        #toArrayLikeGeneric(res, isLE) {
          let tempMag = this.#_magnitude;
          let position = isLE ? 0 : res.length - 1;
          const increment = isLE ? 1 : -1;
          for (const _byte of res) {
            if (tempMag === 0n && position >= 0 && position < res.length) {
              res[position] = 0;
            } else if (position >= 0 && position < res.length) {
              res[position] = Number(tempMag & 0xffn);
            } else {
              break;
            }
            tempMag >>= 8n;
            position += increment;
          }
        }
        /**
         * Converts the BigNumber instance to an array of bytes.
         *
         * @method toArray
         * @param endian - Endianness of the output array, defaults to 'be'.
         * @param length - Optional length of the output array.
         * @returns Array of bytes representing the BigNumber.
         */
        toArray(endian = "be", length) {
          this.strip();
          const actualByteLength = this.byteLength();
          const reqLength = length ?? Math.max(1, actualByteLength);
          this.#assert(actualByteLength <= reqLength, "byte array longer than desired length");
          this.#assert(reqLength > 0, "Requested array length <= 0");
          const res = Array.from({ length: reqLength }).fill(0);
          if (this.#_magnitude === 0n && reqLength > 0)
            return res;
          if (this.#_magnitude === 0n && reqLength === 0)
            return [];
          this.#toArrayLikeGeneric(res, endian === "le");
          return res;
        }
        /**
         * Calculates the number of bits required to represent the BigNumber.
         *
         * @method bitLength
         * @returns The bit length of the BigNumber.
         */
        bitLength() {
          if (this.#_magnitude === 0n) {
            return 0;
          }
          return this.#_magnitude.toString(2).length;
        }
        /**
         * Converts a BigNumber to an array of bits.
         *
         * @method toBitArray
         * @param num - The BigNumber to convert.
         * @returns An array of bits.
         */
        static toBitArray(num) {
          const len = num.bitLength();
          if (len === 0)
            return [];
          const w = Array.from({ length: len });
          const mag = num.#_magnitude;
          for (let bit = 0; bit < len; bit++) {
            w[bit] = (mag >> BigInt(bit) & 1n) === 0n ? 0 : 1;
          }
          return w;
        }
        /**
         * Instance version of {@link toBitArray}.
         */
        toBitArray() {
          return _BigNumber.toBitArray(this);
        }
        /**
         * Returns the number of trailing zero bits in the big number.
         *
         * @method zeroBits
         * @returns Returns the number of trailing zero bits
         * in the binary representation of the big number.
         *
         * @example
         * const bn = new BigNumber('8'); // binary: 1000
         * const zeroBits = bn.zeroBits(); // 3
         */
        zeroBits() {
          if (this.#_magnitude === 0n)
            return 0;
          let c = 0;
          let t = this.#_magnitude;
          while ((t & 1n) === 0n && t !== 0n) {
            c++;
            t >>= 1n;
          }
          return c;
        }
        /**
         * Calculates the number of bytes required to represent the BigNumber.
         *
         * @method byteLength
         * @returns The byte length of the BigNumber.
         */
        byteLength() {
          if (this.#_magnitude === 0n) {
            return 0;
          }
          return Math.ceil(this.bitLength() / 8);
        }
        #_getSignedValue() {
          return this.#_sign === 1 ? -this.#_magnitude : this.#_magnitude;
        }
        #_setValueFromSigned(sVal) {
          if (sVal < 0n) {
            this.#_magnitude = -sVal;
            this.#_sign = 1;
          } else {
            this.#_magnitude = sVal;
            this.#_sign = 0;
          }
          this.#_finishInitialization();
          this.normSign();
        }
        toTwos(width) {
          this.#assert(width >= 0);
          const Bw = BigInt(width);
          let v = this.#_getSignedValue();
          if (this.#_sign === 1 && this.#_magnitude !== 0n)
            v = (1n << Bw) + v;
          const m = (1n << Bw) - 1n;
          v &= m;
          const r2 = new _BigNumber(0n);
          r2.#_initializeState(v, 0);
          return r2;
        }
        fromTwos(width) {
          this.#assert(width >= 0);
          const Bw = BigInt(width);
          const m = this.#_magnitude;
          if (width > 0 && (m >> Bw - 1n & 1n) !== 0n && this.#_sign === 0) {
            const sVal = m - (1n << Bw);
            const r2 = new _BigNumber(0n);
            r2.#_setValueFromSigned(sVal);
            return r2;
          }
          return this.clone();
        }
        isNeg() {
          return this.#_sign === 1 && this.#_magnitude !== 0n;
        }
        neg() {
          return this.clone().ineg();
        }
        ineg() {
          if (this.#_magnitude !== 0n) {
            this.#_sign = this.#_sign === 1 ? 0 : 1;
          }
          return this;
        }
        #_iuop(num, op, isXor = false) {
          const newMag = op(this.#_magnitude, num.#_magnitude);
          let targetNominalLength = this.#_nominalWordLength;
          if (isXor)
            targetNominalLength = Math.max(this.length, num.length);
          this.#_magnitude = newMag;
          this.#_finishInitialization();
          if (isXor)
            this.#_nominalWordLength = Math.max(this.#_nominalWordLength, targetNominalLength);
          return this.strip();
        }
        iuor(num) {
          return this.#_iuop(num, (a, b) => a | b);
        }
        iuand(num) {
          return this.#_iuop(num, (a, b) => a & b);
        }
        iuxor(num) {
          return this.#_iuop(num, (a, b) => a ^ b, true);
        }
        #_iop(num, op, isXor = false) {
          this.#assert(this.#_sign === 0 && num.#_sign === 0);
          return this.#_iuop(num, op, isXor);
        }
        ior(num) {
          return this.#_iop(num, (a, b) => a | b);
        }
        iand(num) {
          return this.#_iop(num, (a, b) => a & b);
        }
        ixor(num) {
          return this.#_iop(num, (a, b) => a ^ b, true);
        }
        #_uop_new(num, opName) {
          if (this.length >= num.length) {
            return this.clone()[opName](num);
          }
          return num.clone()[opName](this);
        }
        or(num) {
          this.#assert(this.#_sign === 0 && num.#_sign === 0);
          return this.#_uop_new(num, "iuor");
        }
        uor(num) {
          return this.#_uop_new(num, "iuor");
        }
        and(num) {
          this.#assert(this.#_sign === 0 && num.#_sign === 0);
          return this.#_uop_new(num, "iuand");
        }
        uand(num) {
          return this.#_uop_new(num, "iuand");
        }
        xor(num) {
          this.#assert(this.#_sign === 0 && num.#_sign === 0);
          return this.#_uop_new(num, "iuxor");
        }
        uxor(num) {
          return this.#_uop_new(num, "iuxor");
        }
        inotn(width) {
          this.#assert(typeof width === "number" && width >= 0);
          const Bw = BigInt(width);
          const m = (1n << Bw) - 1n;
          this.#_magnitude = ~this.#_magnitude & m;
          const wfw = width === 0 ? 1 : Math.ceil(width / _BigNumber.wordSize);
          this.#_nominalWordLength = Math.max(1, wfw);
          this.strip();
          this.#_nominalWordLength = Math.max(this.#_nominalWordLength, Math.max(1, wfw));
          return this;
        }
        notn(width) {
          return this.clone().inotn(width);
        }
        setn(bit, val) {
          this.#assert(typeof bit === "number" && bit >= 0);
          const Bb = BigInt(bit);
          if (val === 1 || val === true)
            this.#_magnitude |= 1n << Bb;
          else
            this.#_magnitude &= ~(1n << Bb);
          const wnb = Math.floor(bit / _BigNumber.wordSize) + 1;
          this.#_nominalWordLength = Math.max(this.#_nominalWordLength, wnb);
          this.#_finishInitialization();
          return this.strip();
        }
        iadd(num) {
          this.#_setValueFromSigned(this.#_getSignedValue() + num.#_getSignedValue());
          return this;
        }
        add(num) {
          const r2 = new _BigNumber(0n);
          r2.#_setValueFromSigned(this.#_getSignedValue() + num.#_getSignedValue());
          return r2;
        }
        isub(num) {
          this.#_setValueFromSigned(this.#_getSignedValue() - num.#_getSignedValue());
          return this;
        }
        sub(num) {
          const r2 = new _BigNumber(0n);
          r2.#_setValueFromSigned(this.#_getSignedValue() - num.#_getSignedValue());
          return r2;
        }
        mul(num) {
          const r2 = new _BigNumber(0n);
          r2.#_magnitude = this.#_magnitude * num.#_magnitude;
          r2.#_sign = r2.#_magnitude === 0n ? 0 : this.#_sign ^ num.#_sign;
          r2.#_nominalWordLength = this.length + num.length;
          r2.red = null;
          return r2.normSign();
        }
        imul(num) {
          this.#_magnitude *= num.#_magnitude;
          this.#_sign = this.#_magnitude === 0n ? 0 : this.#_sign ^ num.#_sign;
          this.#_nominalWordLength = this.length + num.length;
          this.red = null;
          return this.normSign();
        }
        imuln(num) {
          this.#assert(typeof num === "number", "Assertion failed");
          this.#assert(Math.abs(num) <= _BigNumber.#MAX_IMULN_ARG, "Assertion failed");
          this.#_setValueFromSigned(this.#_getSignedValue() * BigInt(num));
          return this;
        }
        muln(num) {
          return this.clone().imuln(num);
        }
        sqr() {
          const r2 = new _BigNumber(0n);
          r2.#_magnitude = this.#_magnitude * this.#_magnitude;
          r2.#_sign = 0;
          r2.#_nominalWordLength = this.length * 2;
          r2.red = null;
          return r2;
        }
        isqr() {
          this.#_magnitude *= this.#_magnitude;
          this.#_sign = 0;
          this.#_nominalWordLength = this.length * 2;
          this.red = null;
          return this;
        }
        pow(num) {
          this.#assert(num.#_sign === 0, "Exponent for pow must be non-negative");
          if (num.isZero())
            return new _BigNumber(1n);
          const res = new _BigNumber(1n);
          const currentBase = this.clone();
          const exp = num.clone();
          const baseIsNegative = currentBase.isNeg();
          const expIsOdd = exp.isOdd();
          if (baseIsNegative)
            currentBase.ineg();
          while (!exp.isZero()) {
            if (exp.isOdd()) {
              res.imul(currentBase);
            }
            currentBase.isqr();
            exp.iushrn(1);
          }
          if (baseIsNegative && expIsOdd) {
            res.ineg();
          }
          return res;
        }
        static #normalizeNonNegativeBigInt(value, label) {
          if (typeof value === "number") {
            if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0)
              throw new Error(`${label} must be a non-negative integer`);
            return BigInt(value);
          }
          if (value < 0n)
            throw new Error(`${label} must be a non-negative integer`);
          return value;
        }
        iushln(bits) {
          const normalizedBits = _BigNumber.#normalizeNonNegativeBigInt(bits, "Shift bits");
          if (normalizedBits === 0n)
            return this;
          this.#_magnitude <<= normalizedBits;
          this.#_finishInitialization();
          return this.strip();
        }
        ishln(bits) {
          this.#assert(this.#_sign === 0, "ishln requires positive number");
          return this.iushln(bits);
        }
        iushrn(bits, hint, extended) {
          const normalizedBits = _BigNumber.#normalizeNonNegativeBigInt(bits, "Shift bits");
          if (normalizedBits === 0n) {
            if (extended != null)
              extended.#_initializeState(0n, 0);
            return this;
          }
          if (extended != null) {
            const m = (1n << normalizedBits) - 1n;
            const sOut = this.#_magnitude & m;
            extended.#_initializeState(sOut, 0);
          }
          this.#_magnitude >>= normalizedBits;
          this.#_finishInitialization();
          return this.strip();
        }
        ishrn(bits, hint, extended) {
          this.#assert(this.#_sign === 0, "ishrn requires positive number");
          return this.iushrn(bits, hint, extended);
        }
        shln(bits) {
          return this.clone().ishln(bits);
        }
        ushln(bits) {
          return this.clone().iushln(bits);
        }
        shrn(bits) {
          return this.clone().ishrn(bits);
        }
        ushrn(bits) {
          return this.clone().iushrn(bits);
        }
        testn(bit) {
          this.#assert(typeof bit === "number" && bit >= 0);
          return (this.#_magnitude >> BigInt(bit) & 1n) !== 0n;
        }
        imaskn(bits) {
          this.#assert(typeof bits === "number" && bits >= 0);
          this.#assert(this.#_sign === 0, "imaskn works only with positive numbers");
          const Bb = BigInt(bits);
          const m = Bb === 0n ? 0n : (1n << Bb) - 1n;
          this.#_magnitude &= m;
          const wfm = bits === 0 ? 1 : Math.max(1, Math.ceil(bits / _BigNumber.wordSize));
          this.#_nominalWordLength = wfm;
          this.#_finishInitialization();
          this.#_nominalWordLength = Math.max(this.#_nominalWordLength, wfm);
          return this.strip();
        }
        maskn(bits) {
          return this.clone().imaskn(bits);
        }
        iaddn(num) {
          this.#assert(typeof num === "number");
          this.#assert(Math.abs(num) <= _BigNumber.#MAX_IMULN_ARG, "num is too large");
          this.#_setValueFromSigned(this.#_getSignedValue() + BigInt(num));
          return this;
        }
        _iaddn(num) {
          return this.iaddn(num);
        }
        isubn(num) {
          this.#assert(typeof num === "number");
          this.#assert(Math.abs(num) <= _BigNumber.#MAX_IMULN_ARG, "Assertion failed");
          this.#_setValueFromSigned(this.#_getSignedValue() - BigInt(num));
          return this;
        }
        addn(num) {
          return this.clone().iaddn(num);
        }
        subn(num) {
          return this.clone().isubn(num);
        }
        iabs() {
          this.#_sign = 0;
          return this;
        }
        abs() {
          return this.clone().iabs();
        }
        divmod(num, mode, positive) {
          this.#assert(!num.isZero(), "Division by zero");
          if (this.isZero()) {
            const z = new _BigNumber(0n);
            return { div: mode === "mod" ? null : z, mod: mode === "div" ? null : z };
          }
          const tV = this.#_getSignedValue();
          const nV = num.#_getSignedValue();
          const dV = mode !== "mod" ? tV / nV : null;
          const mV = this.#_computeMod(tV, nV, mode, positive);
          return { div: this.#_bigNumberFromSigned(dV), mod: this.#_bigNumberFromSigned(mV) };
        }
        #_computeMod(tV, nV, mode, positive) {
          if (mode === "div")
            return null;
          let mV = tV % nV;
          if (positive === true && mV < 0n)
            mV += nV < 0n ? -nV : nV;
          return mV;
        }
        #_bigNumberFromSigned(v) {
          if (v === null)
            return null;
          const r2 = new _BigNumber(0n);
          r2.#_setValueFromSigned(v);
          return r2;
        }
        div(num) {
          return this.divmod(num, "div", false).div;
        }
        mod(num) {
          return this.divmod(num, "mod", false).mod;
        }
        umod(num) {
          return this.divmod(num, "mod", true).mod;
        }
        divRound(num) {
          this.#assert(!num.isZero());
          const tV = this.#_getSignedValue();
          const nV = num.#_getSignedValue();
          let d = tV / nV;
          const m = tV % nV;
          if (m === 0n) {
            const r3 = new _BigNumber(0n);
            r3.#_setValueFromSigned(d);
            return r3;
          }
          const absM = m < 0n ? -m : m;
          const absNV = nV < 0n ? -nV : nV;
          if (absM * 2n >= absNV) {
            if (tV > 0n && nV > 0n || tV < 0n && nV < 0n) {
              d += 1n;
            } else {
              d -= 1n;
            }
          }
          const r2 = new _BigNumber(0n);
          r2.#_setValueFromSigned(d);
          return r2;
        }
        modrn(numArg) {
          this.#assert(numArg !== 0, "Division by zero in modrn");
          const absDivisor = BigInt(Math.abs(numArg));
          if (absDivisor === 0n)
            throw new Error("Division by zero in modrn");
          const remainderMag = this.#_magnitude % absDivisor;
          return numArg < 0 ? Number(-remainderMag) : Number(remainderMag);
        }
        idivn(num) {
          this.#assert(num !== 0);
          this.#assert(Math.abs(num) <= _BigNumber.#MAX_IMULN_ARG, "num is too large");
          this.#_setValueFromSigned(this.#_getSignedValue() / BigInt(num));
          return this;
        }
        divn(num) {
          return this.clone().idivn(num);
        }
        egcd(p) {
          this.#assert(p.negative === 0, "p must not be negative");
          this.#assert(!p.isZero(), "p must not be zero");
          let uV = this.#_getSignedValue();
          let vV = p.#_magnitude;
          let a = 1n;
          let pa = 0n;
          let b = 0n;
          let pb = 1n;
          while (vV !== 0n) {
            const q = uV / vV;
            let t = vV;
            vV = uV % vV;
            uV = t;
            t = pa;
            pa = a - q * pa;
            a = t;
            t = pb;
            pb = b - q * pb;
            b = t;
          }
          const ra = new _BigNumber(0n);
          ra.#_setValueFromSigned(a);
          const rb = new _BigNumber(0n);
          rb.#_setValueFromSigned(b);
          const rg = new _BigNumber(0n);
          rg.#_initializeState(uV < 0n ? -uV : uV, 0);
          return { a: ra, b: rb, gcd: rg };
        }
        gcd(num) {
          let u = this.#_magnitude;
          let v = num.#_magnitude;
          if (u === 0n) {
            const r2 = new _BigNumber(0n);
            r2.#_setValueFromSigned(v);
            return r2.iabs();
          }
          if (v === 0n) {
            const r2 = new _BigNumber(0n);
            r2.#_setValueFromSigned(u);
            return r2.iabs();
          }
          while (v !== 0n) {
            const t = u % v;
            u = v;
            v = t;
          }
          const res = new _BigNumber(0n);
          res.#_initializeState(u, 0);
          return res;
        }
        invm(num) {
          this.#assert(!num.isZero() && num.#_sign === 0, "Modulus for invm must be positive and non-zero");
          const eg = this.egcd(num);
          if (!eg.gcd.eqn(1)) {
            throw new Error("Inverse does not exist (numbers are not coprime).");
          }
          return eg.a.umod(num);
        }
        isEven() {
          return this.#_magnitude % 2n === 0n;
        }
        isOdd() {
          return this.#_magnitude % 2n === 1n;
        }
        andln(num) {
          this.#assert(num >= 0);
          return Number(this.#_magnitude & BigInt(num));
        }
        bincn(bit) {
          this.#assert(typeof bit === "number" && bit >= 0);
          const BVal = 1n << BigInt(bit);
          this.#_setValueFromSigned(this.#_getSignedValue() + BVal);
          return this;
        }
        isZero() {
          return this.#_magnitude === 0n;
        }
        cmpn(num) {
          this.#assert(Math.abs(num) <= _BigNumber.#MAX_IMULN_ARG, "Number is too big");
          const tV = this.#_getSignedValue();
          const nV = BigInt(num);
          if (tV < nV) {
            return -1;
          }
          if (tV > nV) {
            return 1;
          }
          return 0;
        }
        cmp(num) {
          const tV = this.#_getSignedValue();
          const nV = num.#_getSignedValue();
          if (tV < nV) {
            return -1;
          }
          if (tV > nV) {
            return 1;
          }
          return 0;
        }
        ucmp(num) {
          if (this.#_magnitude < num.#_magnitude) {
            return -1;
          }
          if (this.#_magnitude > num.#_magnitude) {
            return 1;
          }
          return 0;
        }
        gtn(num) {
          return this.cmpn(num) === 1;
        }
        gt(num) {
          return this.cmp(num) === 1;
        }
        gten(num) {
          return this.cmpn(num) >= 0;
        }
        gte(num) {
          return this.cmp(num) >= 0;
        }
        ltn(num) {
          return this.cmpn(num) === -1;
        }
        lt(num) {
          return this.cmp(num) === -1;
        }
        lten(num) {
          return this.cmpn(num) <= 0;
        }
        lte(num) {
          return this.cmp(num) <= 0;
        }
        eqn(num) {
          return this.cmpn(num) === 0;
        }
        eq(num) {
          return this.cmp(num) === 0;
        }
        toRed(ctx) {
          this.#assert(this.red == null, "Already a number in reduction context");
          this.#assert(this.#_sign === 0, "toRed works only with positives");
          return ctx.convertTo(this).forceRed(ctx);
        }
        fromRed() {
          this.#assert(this.red, "fromRed works only with numbers in reduction context");
          return this.red.convertFrom(this);
        }
        forceRed(ctx) {
          this.red = ctx;
          return this;
        }
        redAdd(num) {
          this.#assert(this.red, "redAdd works only with red numbers");
          return this.red.add(this, num);
        }
        redIAdd(num) {
          this.#assert(this.red, "redIAdd works only with red numbers");
          return this.red.iadd(this, num);
        }
        redSub(num) {
          this.#assert(this.red, "redSub works only with red numbers");
          return this.red.sub(this, num);
        }
        redISub(num) {
          this.#assert(this.red, "redISub works only with red numbers");
          return this.red.isub(this, num);
        }
        redShl(num) {
          this.#assert(this.red, "redShl works only with red numbers");
          return this.red.shl(this, num);
        }
        redMul(num) {
          this.#assert(this.red, "redMul works only with red numbers");
          this.red.verify2(this, num);
          return this.red.mul(this, num);
        }
        redIMul(num) {
          this.#assert(this.red, "redIMul works only with red numbers");
          this.red.verify2(this, num);
          return this.red.imul(this, num);
        }
        redSqr() {
          this.#assert(this.red, "redSqr works only with red numbers");
          this.red.verify1(this);
          return this.red.sqr(this);
        }
        redISqr() {
          this.#assert(this.red, "redISqr works only with red numbers");
          this.red.verify1(this);
          return this.red.isqr(this);
        }
        redSqrt() {
          this.#assert(this.red, "redSqrt works only with red numbers");
          this.red.verify1(this);
          return this.red.sqrt(this);
        }
        redInvm() {
          this.#assert(this.red, "redInvm works only with red numbers");
          this.red.verify1(this);
          return this.red.invm(this);
        }
        redNeg() {
          this.#assert(this.red, "redNeg works only with red numbers");
          this.red.verify1(this);
          return this.red.neg(this);
        }
        redPow(num) {
          this.#assert(this.red != null && num.red == null, "redPow(normalNum)");
          this.red.verify1(this);
          return this.red.pow(this, num);
        }
        /**
         * Creates a BigNumber from a hexadecimal string.
         *
         * @static
         * @method fromHex
         * @param hex - The hexadecimal string to create a BigNumber from.
         * @param endian - Optional endianness for parsing the hex string.
         * @returns Returns a BigNumber created from the hexadecimal input string.
         *
         * @example
         * const exampleHex = 'a1b2c3';
         * const bigNumber = BigNumber.fromHex(exampleHex);
         */
        static fromHex(hex2, endian) {
          let eE = "be";
          if (endian === "little" || endian === "le")
            eE = "le";
          return new _BigNumber(hex2, 16, eE);
        }
        /**
         * Converts this BigNumber to a hexadecimal string.
         *
         * @method toHex
         * @param length - The minimum length of the hex string
         * @returns Returns a string representing the hexadecimal value of this BigNumber.
         *
         * @example
         * const bigNumber = new BigNumber(255)
         * const hex = bigNumber.toHex()
         */
        toHex(byteLength = 0) {
          if (this.isZero() && byteLength === 0)
            return "";
          let hexStr = this.#_getMinimalHex();
          if (hexStr !== "0" && hexStr.length % 2 !== 0) {
            hexStr = "0" + hexStr;
          }
          const minChars = byteLength * 2;
          while (hexStr.length < minChars) {
            hexStr = "0" + hexStr;
          }
          return (this.isNeg() ? "-" : "") + hexStr;
        }
        /**
         * Creates a BigNumber from a JSON-serialized string.
         *
         * @static
         * @method fromJSON
         * @param str - The JSON-serialized string to create a BigNumber from.
         * @returns Returns a BigNumber created from the JSON input string.
         */
        static fromJSON(str) {
          return new _BigNumber(str, 16);
        }
        /**
         * Creates a BigNumber from a number.
         *
         * @static
         * @method fromNumber
         * @param n - The number to create a BigNumber from.
         * @returns Returns a BigNumber equivalent to the input number.
         */
        static fromNumber(n) {
          return new _BigNumber(n);
        }
        /**
         * Creates a BigNumber from a string, considering an optional base.
         *
         * @static
         * @method fromString
         * @param str - The string to create a BigNumber from.
         * @param base - The base used for conversion. If not provided, base 10 is assumed.
         * @returns Returns a BigNumber equivalent to the string after conversion from the specified base.
         */
        static fromString(str, base) {
          return new _BigNumber(str, base);
        }
        /**
         * Creates a BigNumber from a signed magnitude number.
         *
         * @static
         * @method fromSm
         * @param bytes - The signed magnitude number to convert to a BigNumber.
         * @param endian - Defines endianess. If not provided, big endian is assumed.
         * @returns Returns a BigNumber equivalent to the signed magnitude number interpreted with specified endianess.
         */
        static fromSm(bytes3, endian = "big") {
          if (bytes3.length === 0)
            return new _BigNumber(0n);
          const beBytes = bytes3.slice();
          if (endian === "little") {
            beBytes.reverse();
          }
          let sign2 = 0;
          if (beBytes.length > 0 && (beBytes[0] & 128) !== 0) {
            sign2 = 1;
            beBytes[0] &= 127;
          }
          let hexStr;
          if (CAN_USE_BUFFER) {
            hexStr = BufferCtor.from(beBytes).toString("hex");
          } else {
            hexStr = "";
            for (const byte of beBytes) {
              hexStr += byte < 16 ? "0" + byte.toString(16) : byte.toString(16);
            }
          }
          const magnitude = hexStr.length === 0 ? 0n : BigInt("0x" + hexStr);
          const r2 = new _BigNumber(0n);
          r2.#_initializeState(magnitude, sign2);
          return r2;
        }
        /**
         * Converts this BigNumber to a signed magnitude number.
         *
         * @method toSm
         * @param endian - Defines endianess. If not provided, big endian is assumed.
         * @returns Returns an array equivalent to this BigNumber interpreted as a signed magnitude with specified endianess.
         */
        toSm(endian = "big") {
          if (this.#_magnitude === 0n) {
            return this.#_sign === 1 ? [128] : [];
          }
          let hex2 = this.#_getMinimalHex();
          if (hex2.length % 2 !== 0)
            hex2 = "0" + hex2;
          const byteLen = hex2.length / 2;
          const bytes3 = Array.from({ length: byteLen });
          for (let i = 0, j = 0; i < hex2.length; i += 2) {
            const high = HEX_CHAR_TO_VALUE[hex2.codePointAt(i)];
            const low = HEX_CHAR_TO_VALUE[hex2.codePointAt(i + 1)];
            bytes3[j++] = (high & 15) << 4 | low & 15;
          }
          let result;
          if (this.#_sign === 1) {
            if ((bytes3[0] & 128) === 0) {
              result = bytes3.slice();
              result[0] |= 128;
            } else {
              result = [128, ...bytes3];
            }
          } else if ((bytes3[0] & 128) === 0) {
            result = bytes3.slice();
          } else {
            result = [0, ...bytes3];
          }
          return endian === "little" ? result.reverse() : result;
        }
        /**
         * Creates a BigNumber from a number representing the "bits" value in a block header.
         *
         * @static
         * @method fromBits
         * @param bits - The number representing the bits value in a block header.
         * @param strict - If true, an error is thrown if the number has negative bit set.
         * @returns Returns a BigNumber equivalent to the "bits" value in a block header.
         * @throws Will throw an error if `strict` is `true` and the number has negative bit set.
         */
        static fromBits(bits, strict = false) {
          const nSize = bits >>> 24;
          const nWordCompact = bits & 8388607;
          const isNegativeFromBit = (bits & 8388608) !== 0;
          if (strict && isNegativeFromBit) {
            throw new Error("negative bit set");
          }
          if (nSize === 0 && nWordCompact === 0) {
            if (isNegativeFromBit && strict)
              throw new Error("negative bit set for zero value");
            return new _BigNumber(0n);
          }
          const bn = new _BigNumber(nWordCompact);
          if (nSize <= 3) {
            bn.iushrn((3 - nSize) * 8);
          } else {
            bn.iushln((nSize - 3) * 8);
          }
          if (isNegativeFromBit) {
            bn.ineg();
          }
          return bn;
        }
        /**
         * Converts this BigNumber to a number representing the "bits" value in a block header.
         *
         * @method toBits
         * @returns Returns a number equivalent to the "bits" value in a block header.
         */
        toBits() {
          this.strip();
          if (this.isZero() && !this.isNeg())
            return 0;
          const isActualNegative = this.isNeg();
          const bnAbs = this.abs();
          let mB = bnAbs.toArray("be");
          let firstNonZeroIdx = 0;
          while (firstNonZeroIdx < mB.length - 1 && mB[firstNonZeroIdx] === 0) {
            firstNonZeroIdx++;
          }
          mB = mB.slice(firstNonZeroIdx);
          let nSize = mB.length;
          let nWordNum;
          if (nSize === 0) {
            nWordNum = 0;
          } else if (nSize <= 3) {
            nWordNum = 0;
            for (let i = 0; i < nSize; i++) {
              nWordNum = nWordNum << 8 | mB[i];
            }
          } else {
            nWordNum = mB[0] << 16 | mB[1] << 8 | mB[2];
          }
          if ((nWordNum & 8388608) !== 0 && nSize <= 255) {
            nWordNum >>>= 8;
            nSize++;
          }
          let b = nSize << 24 | nWordNum;
          if (isActualNegative)
            b |= 8388608;
          return b >>> 0;
        }
        /**
         * Creates a BigNumber from the format used in Bitcoin scripts.
         *
         * @static
         * @method fromScriptNum
         * @param num - The number in the format used in Bitcoin scripts.
         * @param requireMinimal - If true, non-minimally encoded values will throw an error.
         * @param maxNumSize - The maximum allowed size for the number.
         * @returns Returns a BigNumber equivalent to the number used in a Bitcoin script.
         */
        static fromScriptNum(num, requireMinimal = false, maxNumSize) {
          if (maxNumSize !== void 0 && num.length > maxNumSize)
            throw new Error("script number overflow");
          if (num.length === 0)
            return new _BigNumber(0n);
          if (requireMinimal) {
            if ((num.at(-1) & 127) === 0) {
              if (num.length <= 1 || (num.at(-2) & 128) === 0) {
                throw new Error("non-minimally encoded script number");
              }
            }
          }
          return _BigNumber.fromSm(num, "little");
        }
        /**
         * Converts this BigNumber to a number in the format used in Bitcoin scripts.
         *
         * @method toScriptNum
         * @returns Returns the equivalent to this BigNumber as a Bitcoin script number.
         */
        toScriptNum() {
          return this.toSm("little");
        }
        /**
         * Compute the multiplicative inverse of the current BigNumber in the modulus field specified by `p`.
         * The multiplicative inverse is a number which when multiplied with the current BigNumber gives '1' in the modulus field.
         *
         * @method _invmp
         * @param p - The `BigNumber` specifying the modulus field.
         * @returns The multiplicative inverse `BigNumber` in the modulus field specified by `p`.
         */
        /**
         * SECURITY NOTE:
         * This implementation avoids variable-time extended Euclidean algorithms
         * to reduce timing side-channel leakage. However, JavaScript BigInt arithmetic
         * does not provide constant-time guarantees. This implementation is suitable
         * for browser and single-tenant environments but is not hardened against
         * high-resolution timing attacks in shared CPU contexts.
         */
        _invmp(p) {
          this.#assert(p.#_sign === 0, "p must not be negative for _invmp");
          this.#assert(!p.isZero(), "p must not be zero for _invmp");
          const a = this.umod(p);
          const exp = p.subn(2);
          if (a.red !== null) {
            return a.redPow(exp);
          }
          let result = new _BigNumber(1n);
          let base = a.clone();
          const e = exp.clone();
          while (!e.isZero()) {
            if (e.isOdd())
              result = result.mul(base).umod(p);
            base = base.sqr().umod(p);
            e.iushrn(1);
          }
          return result;
        }
        /**
         * Performs multiplication between the BigNumber instance and a given BigNumber.
         * It chooses the multiplication method based on the lengths of the numbers to optimize execution time.
         *
         * @method mulTo
         * @param num - The BigNumber multiply with.
         * @param out - The BigNumber where to store the result.
         * @returns The BigNumber resulting from the multiplication operation.
         */
        mulTo(num, out) {
          out.#_magnitude = this.#_magnitude * num.#_magnitude;
          out.#_sign = out.#_magnitude === 0n ? 0 : this.#_sign ^ num.#_sign;
          out.#_nominalWordLength = this.length + num.length;
          out.red = null;
          out.normSign();
          return out;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Mersenne.js
  var Mersenne;
  var init_Mersenne = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Mersenne.js"() {
      init_BigNumber();
      Mersenne = class {
        name;
        p;
        k;
        n;
        tmp;
        /**
         * @constructor
         * @param name - An identifier for the Mersenne instance.
         * @param p - A string representation of the pseudo-Mersenne prime, expressed in hexadecimal.
         *
         * @example
         * const mersenne = new Mersenne('M31', '7FFFFFFF');
         */
        constructor(name, p) {
          this.name = name;
          this.p = new BigNumber(p, 16);
          this.n = this.p.bitLength();
          this.k = new BigNumber(BigInt(1)).iushln(this.n).isub(this.p);
          this.tmp = this._tmp();
        }
        /**
         * Creates a temporary BigNumber structure for computations,
         * ensuring the appropriate number of words are initially allocated.
         *
         * @method _tmp
         * @returns A BigNumber with scaled size depending on prime magnitude.
         */
        _tmp() {
          const tmp = new BigNumber(BigInt(0));
          const requiredWords = Math.ceil(this.n / BigNumber.wordSize);
          tmp.expand(Math.max(1, requiredWords));
          return tmp;
        }
        /**
         * Reduces an input BigNumber in place, under the assumption that
         * it is less than the square of the pseudo-Mersenne prime.
         *
         * @method ireduce
         * @param num - The BigNumber to be reduced.
         * @returns The reduced BigNumber.
         *
         * @example
         * const reduced = mersenne.ireduce(new BigNumber('2345', 16));
         */
        ireduce(num) {
          const r2 = num;
          let rlen;
          do {
            this.split(r2, this.tmp);
            this.imulK(r2);
            r2.iadd(this.tmp);
            rlen = r2.bitLength();
          } while (rlen > this.n);
          const cmp = rlen < this.n ? -1 : r2.ucmp(this.p);
          if (cmp === 0) {
            r2.words = [0];
          } else if (cmp > 0) {
            r2.isub(this.p);
          }
          r2.strip();
          return r2;
        }
        /**
         * Shifts bits of the input BigNumber to the right, in place,
         * to meet the magnitude of the pseudo-Mersenne prime.
         *
         * @method split
         * @param input - The BigNumber to be shifted (will contain HI part).
         * @param out - The BigNumber to hold the shifted result (LO part).
         *
         * @example
         * mersenne.split(new BigNumber('2345', 16), new BigNumber());
         */
        split(input, out) {
          input.iushrn(this.n, 0, out);
        }
        /**
         * Performs an in-place multiplication of the parameter by constant k.
         *
         * @method imulK
         * @param num - The BigNumber to multiply with k.
         * @returns The result of the multiplication, in BigNumber format.
         *
         * @example
         * const multiplied = mersenne.imulK(new BigNumber('2345', 16));
         */
        imulK(num) {
          return num.imul(this.k);
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/K256.js
  var K256;
  var init_K256 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/K256.js"() {
      init_Mersenne();
      K256 = class extends Mersenne {
        /**
         * Constructor for the K256 class.
         * Creates an instance of K256 using the super constructor from Mersenne.
         *
         * @constructor
         *
         * @example
         * const k256 = new K256();
         */
        constructor() {
          super("k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
        }
        /**
         * Splits a BigNumber into a new BigNumber based on specific computation
         * rules. This method modifies the input and output big numbers.
         *
         * @method split
         * @param input - The BigNumber to be split.
         * @param output - The BigNumber that results from the split.
         *
         * @example
         * const input = new BigNumber(3456);
         * const output = new BigNumber(0);
         * k256.split(input, output);
         */
        split(input, output) {
          const mask = 4194303;
          const inputWords = input.words;
          const inputNominalLength = input.length;
          const outLen = Math.min(inputNominalLength, 9);
          const tempOutputWords = Array.from({ length: outLen + (inputNominalLength > 9 ? 1 : 0) }, () => 0);
          for (let i = 0; i < outLen; i++) {
            tempOutputWords[i] = inputWords[i];
          }
          let currentOutputWordCount = outLen;
          if (inputNominalLength <= 9) {
            const finalOutputWords2 = Array.from({ length: currentOutputWordCount }, () => 0);
            for (let i = 0; i < currentOutputWordCount; ++i)
              finalOutputWords2[i] = tempOutputWords[i];
            output.words = finalOutputWords2;
            input.words = [0];
            return;
          }
          let prev = inputWords[9];
          tempOutputWords[currentOutputWordCount++] = prev & mask;
          const finalOutputWords = Array.from({ length: currentOutputWordCount }, () => 0);
          for (let i = 0; i < currentOutputWordCount; ++i)
            finalOutputWords[i] = tempOutputWords[i];
          output.words = finalOutputWords;
          const tempInputNewWords = Array.from({ length: Math.max(1, inputNominalLength - 9) }, () => 0);
          let currentInputNewWordCount = 0;
          for (let i = 10; i < inputNominalLength; i++) {
            const next = Math.trunc(inputWords[i]);
            if (currentInputNewWordCount < tempInputNewWords.length) {
              tempInputNewWords[currentInputNewWordCount++] = (next & mask) << 4 | prev >>> 22;
            }
            prev = next;
          }
          prev >>>= 22;
          if (currentInputNewWordCount < tempInputNewWords.length) {
            tempInputNewWords[currentInputNewWordCount++] = prev;
          } else if (prev !== 0 && tempInputNewWords.length > 0) {
          }
          const finalInputNewWords = Array.from({ length: currentInputNewWordCount }, () => 0);
          for (let i = 0; i < currentInputNewWordCount; ++i)
            finalInputNewWords[i] = tempInputNewWords[i];
          input.words = finalInputNewWords;
        }
        /**
         * Multiplies a BigNumber ('num') with the constant 'K' in-place and returns the result.
         * 'K' is equal to 0x1000003d1 or in decimal representation: [ 64, 977 ].
         *
         * @method imulK
         * @param num - The BigNumber to multiply with K.
         * @returns Returns the mutated BigNumber after multiplication.
         *
         * @example
         * const number = new BigNumber(12345);
         * const result = k256.imulK(number);
         */
        imulK(num) {
          const currentWords = num.words;
          const originalNominalLength = num.length;
          const newNominalLength = originalNominalLength + 2;
          const tempWords = Array.from({ length: newNominalLength }, () => 0);
          for (let i = 0; i < originalNominalLength; i++) {
            tempWords[i] = currentWords[i];
          }
          let lo = 0;
          for (let i = 0; i < newNominalLength; i++) {
            const w = Math.trunc(tempWords[i]);
            lo += w * 977;
            tempWords[i] = lo & 67108863;
            lo = w * 64 + Math.trunc(lo / 67108864);
          }
          num.words = tempWords;
          return num;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ReductionContext.js
  var ReductionContext;
  var init_ReductionContext = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/ReductionContext.js"() {
      init_BigNumber();
      init_K256();
      ReductionContext = class {
        prime;
        m;
        /**
         * Constructs a new ReductionContext.
         *
         * @constructor
         * @param m - A BigNumber representing the modulus, or 'k256' to create a context for Koblitz curve.
         *
         * @example
         * new ReductionContext(new BigNumber(11));
         * new ReductionContext('k256');
         */
        constructor(m) {
          if (m === "k256") {
            const prime = new K256();
            this.m = prime.p;
            this.prime = prime;
          } else {
            this.assert(m.gtn(1), "modulus must be greater than 1");
            this.m = m;
            this.prime = null;
          }
        }
        /**
         * Asserts that given value is truthy. Throws an Error with a provided message
         * if the value is falsy.
         *
         * @private
         * @param val - The value to be checked.
         * @param msg - The error message to be thrown if the value is falsy.
         *
         * @example
         * this.assert(1 < 2, '1 is not less than 2');
         * this.assert(2 < 1, '2 is less than 1'); // throws an Error with message '2 is less than 1'
         */
        assert(val, msg = "Assertion failed") {
          if (!val)
            throw new Error(msg);
        }
        /**
         * Verifies that a BigNumber is positive and red. Throws an error if these
         * conditions are not met.
         *
         * @param a - The BigNumber to be verified.
         *
         * @example
         * this.verify1(new BigNumber(10).toRed());
         * this.verify1(new BigNumber(-10).toRed()); //throws an Error
         * this.verify1(new BigNumber(10)); //throws an Error
         */
        verify1(a) {
          this.assert(a.negative === 0, "red works only with positives");
          this.assert(a.red, "red works only with red numbers");
        }
        /**
         * Verifies that two BigNumbers are both positive and red. Also checks
         * that they have the same reduction context. Throws an error if these
         * conditions are not met.
         *
         * @param a - The first BigNumber to be verified.
         * @param b - The second BigNumber to be verified.
         *
         * @example
         * this.verify2(new BigNumber(10).toRed(this), new BigNumber(20).toRed(this));
         * this.verify2(new BigNumber(-10).toRed(this), new BigNumber(20).toRed(this)); //throws an Error
         * this.verify2(new BigNumber(10).toRed(this), new BigNumber(20)); //throws an Error
         */
        verify2(a, b) {
          this.assert((a.negative | b.negative) === 0, "red works only with positives");
          this.assert(a.red != null && a.red === b.red, "red works only with red numbers");
        }
        /**
         * Performs an in-place reduction of the given BigNumber by the modulus of the reduction context, 'm'.
         *
         * @method imod
         *
         * @param a - BigNumber to be reduced.
         *
         * @returns Returns the reduced result.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.imod(new BigNumber(19)); // Returns 5
         */
        imod(a) {
          if (this.prime != null)
            return this.prime.ireduce(a).forceRed(this);
          BigNumber.move(a, a.umod(this.m).forceRed(this));
          return a;
        }
        /**
         * Negates a BigNumber in the context of the modulus.
         *
         * @method neg
         *
         * @param a - BigNumber to negate.
         *
         * @returns Returns the negation of 'a' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.neg(new BigNumber(3)); // Returns 4
         */
        neg(a) {
          if (a.isZero()) {
            return a.clone();
          }
          return this.m.sub(a).forceRed(this);
        }
        /**
         * Performs the addition operation on two BigNumbers in the reduction context.
         *
         * @method add
         *
         * @param a - First BigNumber to add.
         * @param b - Second BigNumber to add.
         *
         * @returns Returns the result of 'a + b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(5));
         * context.add(new BigNumber(2), new BigNumber(4)); // Returns 1
         */
        add(a, b) {
          this.verify2(a, b);
          const res = a.clone();
          res.iadd(b);
          res.isub(this.m);
          if (res.isNeg()) {
            res.iadd(this.m);
          }
          return res;
        }
        /**
         * Performs an in-place addition operation on two BigNumbers in the reduction context
         * in order to avoid creating a new BigNumber, it modifies the first one with the result.
         *
         * @method iadd
         *
         * @param a - First BigNumber to add.
         * @param b - Second BigNumber to add.
         *
         * @returns Returns the modified 'a' after addition with 'b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(5));
         * const a = new BigNumber(2);
         * context.iadd(a, new BigNumber(4)); // Modifies 'a' to be 1
         */
        iadd(a, b) {
          this.verify2(a, b);
          a.iadd(b);
          a.isub(this.m);
          if (a.isNeg()) {
            a.iadd(this.m);
          }
          return a;
        }
        /**
         * Subtracts one BigNumber from another BigNumber in the reduction context.
         *
         * @method sub
         *
         * @param a - BigNumber to be subtracted from.
         * @param b - BigNumber to subtract.
         *
         * @returns Returns the result of 'a - b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.sub(new BigNumber(3), new BigNumber(2)); // Returns 1
         */
        sub(a, b) {
          this.verify2(a, b);
          const res = a.sub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res.forceRed(this);
        }
        /**
         * Performs in-place subtraction of one BigNumber from another in the reduction context,
         * it modifies the first BigNumber with the result.
         *
         * @method isub
         *
         * @param a - BigNumber to be subtracted from.
         * @param b - BigNumber to subtract.
         *
         * @returns Returns the modified 'a' after subtraction of 'b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(5));
         * const a = new BigNumber(4);
         * context.isub(a, new BigNumber(2)); // Modifies 'a' to be 2
         */
        isub(a, b) {
          this.verify2(a, b);
          const res = a.isub(b);
          if (res.cmpn(0) < 0) {
            res.iadd(this.m);
          }
          return res;
        }
        /**
         * Performs bitwise shift left operation on a BigNumber in the reduction context.
         *
         * @method shl
         *
         * @param a - BigNumber to perform shift on.
         * @param num - The number of positions to shift.
         *
         * @returns Returns the result of shifting 'a' left by 'num' positions in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(32));
         * context.shl(new BigNumber(4), 2); // Returns 16
         */
        shl(a, num) {
          this.verify1(a);
          return this.imod(a.ushln(num));
        }
        /**
         * Performs in-place multiplication of two BigNumbers in the reduction context,
         * modifying the first BigNumber with the result.
         *
         * @method imul
         *
         * @param a - First BigNumber to multiply.
         * @param b - Second BigNumber to multiply.
         *
         * @returns Returns the modified 'a' after multiplication with 'b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * const a = new BigNumber(3);
         * context.imul(a, new BigNumber(2)); // Modifies 'a' to be 6
         */
        imul(a, b) {
          this.verify2(a, b);
          return this.imod(a.imul(b));
        }
        /**
         * Multiplies two BigNumbers in the reduction context.
         *
         * @method mul
         *
         * @param a - First BigNumber to multiply.
         * @param b - Second BigNumber to multiply.
         *
         * @returns Returns the result of 'a * b' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.mul(new BigNumber(3), new BigNumber(2)); // Returns 6
         */
        mul(a, b) {
          this.verify2(a, b);
          return this.imod(a.mul(b));
        }
        /**
         * Calculates the square of a BigNumber in the reduction context,
         * modifying the original BigNumber with the result.
         *
         * @method isqr
         *
         * @param a - BigNumber to be squared.
         *
         * @returns Returns the squared 'a' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * const a = new BigNumber(3);
         * context.isqr(a); // Modifies 'a' to be 2 (9 % 7 = 2)
         */
        isqr(a) {
          return this.imul(a, a.clone());
        }
        /**
         * Calculates the square of a BigNumber in the reduction context.
         *
         * @method sqr
         *
         * @param a - BigNumber to be squared.
         *
         * @returns Returns the result of 'a^2' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.sqr(new BigNumber(3)); // Returns 2 (9 % 7 = 2)
         */
        sqr(a) {
          return this.mul(a, a);
        }
        /**
         * Calculates the square root of a BigNumber in the reduction context.
         *
         * @method sqrt
         *
         * @param a - The BigNumber to calculate the square root of.
         *
         * @returns Returns the square root of 'a' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(9));
         * context.sqrt(new BigNumber(4)); // Returns 2
         */
        sqrt(a) {
          if (a.isZero())
            return a.clone();
          const mod3 = this.m.andln(3);
          this.assert(mod3 % 2 === 1);
          if (mod3 === 3) {
            const pow = this.m.add(new BigNumber(1)).iushrn(2);
            return this.pow(a, pow);
          }
          const q = this.m.subn(1);
          let s2 = 0;
          while (!q.isZero() && q.andln(1) === 0) {
            s2++;
            q.iushrn(1);
          }
          this.assert(!q.isZero());
          const one = new BigNumber(1).toRed(this);
          const nOne = one.redNeg();
          const lpow = this.m.subn(1).iushrn(1);
          const zl = this.m.bitLength();
          const z = new BigNumber(2 * zl * zl).toRed(this);
          while (this.pow(z, lpow).cmp(nOne) !== 0) {
            z.redIAdd(nOne);
          }
          let c = this.pow(z, q);
          let r2 = this.pow(a, q.addn(1).iushrn(1));
          let t = this.pow(a, q);
          let m = s2;
          while (t.cmp(one) !== 0) {
            let tmp = t;
            let i = 0;
            while (tmp.cmp(one) !== 0) {
              tmp = tmp.redSqr();
              i++;
            }
            this.assert(i < m);
            const b = this.pow(c, new BigNumber(1).iushln(m - i - 1));
            r2 = r2.redMul(b);
            c = b.redSqr();
            t = t.redMul(c);
            m = i;
          }
          return r2;
        }
        /**
         * Calculates the multiplicative inverse of a BigNumber in the reduction context.
         *
         * @method invm
         *
         * @param a - The BigNumber to find the multiplicative inverse of.
         *
         * @returns Returns the multiplicative inverse of 'a' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(11));
         * context.invm(new BigNumber(3)); // Returns 4 (3*4 mod 11 = 1)
         */
        invm(a) {
          const inv = a._invmp(this.m);
          if (inv.negative !== 0) {
            inv.negative = 0;
            return this.imod(inv).redNeg();
          } else {
            return this.imod(inv);
          }
        }
        /**
         * Raises a BigNumber to a power in the reduction context.
         *
         * @method pow
         *
         * @param a - The BigNumber to be raised to a power.
         * @param num - The power to raise the BigNumber to.
         *
         * @returns Returns the result of 'a' raised to the power of 'num' in the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.pow(new BigNumber(3), new BigNumber(2)); // Returns 2 (3^2 % 7)
         */
        pow(a, num) {
          this.verify1(a);
          if (num.isZero())
            return new BigNumber(1).toRed(this);
          let result = new BigNumber(1).toRed(this);
          const base = a.clone();
          const bits = num.bitLength();
          for (let i = bits - 1; i >= 0; i--) {
            result = this.sqr(result);
            if (num.testn(i)) {
              result = this.mul(result, base);
            }
          }
          return result;
        }
        /**
         * Converts a BigNumber to its equivalent in the reduction context.
         *
         * @method convertTo
         *
         * @param num - The BigNumber to convert to the reduction context.
         *
         * @returns Returns the converted BigNumber compatible with the reduction context.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * context.convertTo(new BigNumber(8)); // Returns 1 (8 % 7)
         */
        convertTo(num) {
          const r2 = num.umod(this.m);
          return r2 === num ? r2.clone() : r2;
        }
        /**
         * Converts a BigNumber from reduction context to its regular form.
         *
         * @method convertFrom
         *
         * @param num - The BigNumber to convert from the reduction context.
         *
         * @returns Returns the converted BigNumber in its regular form.
         *
         * @example
         * const context = new ReductionContext(new BigNumber(7));
         * const a = context.convertTo(new BigNumber(8)); // 'a' is now 1 in the reduction context
         * context.convertFrom(a); // Returns 1
         */
        convertFrom(num) {
          const res = num.clone();
          res.red = null;
          return res;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/MontgomoryMethod.js
  var MontgomoryMethod;
  var init_MontgomoryMethod = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/MontgomoryMethod.js"() {
      init_ReductionContext();
      init_BigNumber();
      MontgomoryMethod = class extends ReductionContext {
        shift;
        r;
        r2;
        rinv;
        minv;
        /**
         * @constructor
         * @param m - The modulus to be used for the Montgomery method reductions.
         */
        constructor(m) {
          super(m);
          this.shift = this.m.bitLength();
          if (this.shift % 26 !== 0) {
            this.shift += 26 - this.shift % 26;
          }
          this.r = new BigNumber(1).iushln(this.shift);
          this.r2 = this.imod(this.r.sqr());
          this.rinv = this.r._invmp(this.m);
          this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
          this.minv = this.minv.umod(this.r);
          this.minv = this.r.sub(this.minv);
        }
        /**
         * Converts a number into the Montgomery domain.
         *
         * @method convertTo
         * @param num - The number to be converted into the Montgomery domain.
         * @returns The result of the conversion into the Montgomery domain.
         *
         * @example
         * const montMethod = new MontgomoryMethod(m);
         * const convertedNum = montMethod.convertTo(num);
         */
        convertTo(num) {
          return this.imod(num.ushln(this.shift));
        }
        /**
         * Converts a number from the Montgomery domain back to the original domain.
         *
         * @method convertFrom
         * @param num - The number to be converted from the Montgomery domain.
         * @returns The result of the conversion from the Montgomery domain.
         *
         * @example
         * const montMethod = new MontgomoryMethod(m);
         * const convertedNum = montMethod.convertFrom(num);
         */
        convertFrom(num) {
          const r2 = this.imod(num.mul(this.rinv));
          r2.red = null;
          return r2;
        }
        /**
         * Performs an in-place multiplication of two numbers in the Montgomery domain.
         *
         * @method imul
         * @param a - The first number to multiply.
         * @param b - The second number to multiply.
         * @returns The result of the in-place multiplication.
         *
         * @example
         * const montMethod = new MontgomoryMethod(m);
         * const product = montMethod.imul(a, b);
         */
        imul(a, b) {
          if (a.isZero() || b.isZero()) {
            a.words[0] = 0;
            a.length = 1;
            return a;
          }
          const t = a.imul(b);
          const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          const u = t.isub(c).iushrn(this.shift);
          let res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res.forceRed(this);
        }
        /**
         * Performs the multiplication of two numbers in the Montgomery domain.
         *
         * @method mul
         * @param a - The first number to multiply.
         * @param b - The second number to multiply.
         * @returns The result of the multiplication.
         *
         * @example
         * const montMethod = new MontgomoryMethod(m);
         * const product = montMethod.mul(a, b);
         */
        mul(a, b) {
          if (a.isZero() || b.isZero())
            return new BigNumber(0).forceRed(this);
          const t = a.mul(b);
          const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
          const u = t.isub(c).iushrn(this.shift);
          let res = u;
          if (u.cmp(this.m) >= 0) {
            res = u.isub(this.m);
          } else if (u.cmpn(0) < 0) {
            res = u.iadd(this.m);
          }
          return res.forceRed(this);
        }
        /**
         * Calculates the modular multiplicative inverse of a number in the Montgomery domain.
         *
         * @method invm
         * @param a - The number to compute the modular multiplicative inverse of.
         * @returns The modular multiplicative inverse of 'a'.
         *
         * @example
         * const montMethod = new MontgomoryMethod(m);
         * const inverse = montMethod.invm(a);
         */
        invm(a) {
          const res = this.imod(a._invmp(this.m).mul(this.r2));
          return res.forceRed(this);
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/UTF8.js
  function utf8Bytes(value) {
    return encoder.encode(value);
  }
  function utf8ByteLength(value) {
    return utf8Bytes(value).byteLength;
  }
  function hasControlCharacter(value) {
    for (const character of value) {
      const codePoint = character.codePointAt(0);
      if (codePoint <= 31 || codePoint >= 127 && codePoint <= 159)
        return true;
    }
    return false;
  }
  var encoder;
  var init_UTF8 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/UTF8.js"() {
      encoder = new TextEncoder();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/hex.js
  function assertValidHex(msg) {
    if (typeof msg !== "string") {
      throw new TypeError("Invalid hex string");
    }
    if (msg.length === 0)
      return;
    if (!PURE_HEX_REGEX.test(msg)) {
      throw new Error("Invalid hex string");
    }
  }
  function normalizeHex(msg) {
    assertValidHex(msg);
    if (msg.length === 0)
      return "";
    let normalized = msg.toLowerCase();
    if (normalized.length % 2 !== 0) {
      normalized = "0" + normalized;
    }
    return normalized;
  }
  var PURE_HEX_REGEX;
  var init_hex = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/hex.js"() {
      PURE_HEX_REGEX = /^[0-9a-fA-F]*$/;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Hash.js
  function appendUtf8CodeUnit(msg, i, out) {
    const c = msg.codePointAt(i);
    if (c < 128) {
      out.push(c);
      return i;
    }
    if (c < 2048) {
      out.push(c >> 6 | 192, c & 63 | 128);
      return i;
    }
    if (c > 65535) {
      out.push(c >> 18 | 240, c >> 12 & 63 | 128, c >> 6 & 63 | 128, c & 63 | 128);
      return i + 1;
    }
    out.push(c >> 12 | 224, c >> 6 & 63 | 128, c & 63 | 128);
    return i;
  }
  function utf8StringToArray(msg) {
    const res = [];
    let i = 0;
    while (i < msg.length) {
      const lastConsumed = appendUtf8CodeUnit(msg, i, res);
      i = lastConsumed + 1;
    }
    return res;
  }
  function hexStringToArray(msg) {
    assertValidHex(msg);
    const normalized = normalizeHex(msg);
    const res = [];
    for (let i = 0; i < normalized.length; i += 2) {
      res.push(Number.parseInt(normalized[i] + normalized[i + 1], 16));
    }
    return res;
  }
  function numberArrayToByteArray(msg) {
    const res = [];
    for (let i = 0; i < msg.length; i++) {
      res[i] = Math.trunc(msg[i]);
    }
    return res;
  }
  function toArray(msg, enc) {
    if (Array.isArray(msg)) {
      return msg.slice();
    }
    if (!msg) {
      return [];
    }
    if (typeof msg === "string") {
      return enc === "hex" ? hexStringToArray(msg) : utf8StringToArray(msg);
    }
    return numberArrayToByteArray(msg);
  }
  function htonl(w) {
    return swapBytes32(w);
  }
  function toHex32(msg, endian) {
    let res = "";
    for (let w of msg) {
      if (endian === "little") {
        w = htonl(w);
      }
      res += zero8(w.toString(16));
    }
    return res;
  }
  function zero8(word) {
    if (word.length === 7) {
      return "0" + word;
    } else if (word.length === 6) {
      return "00" + word;
    } else if (word.length === 5) {
      return "000" + word;
    } else if (word.length === 4) {
      return "0000" + word;
    } else if (word.length === 3) {
      return "00000" + word;
    } else if (word.length === 2) {
      return "000000" + word;
    } else if (word.length === 1) {
      return "0000000" + word;
    } else {
      return word;
    }
  }
  function bytesToHex(data) {
    if (CAN_USE_BUFFER2) {
      return BufferCtor2.from(data).toString("hex");
    }
    const out = Array.from({ length: data.length });
    for (let i = 0; i < data.length; i++)
      out[i] = HEX_BYTE_STRINGS[data[i]];
    return out.join("");
  }
  function toHashBytes(msg, enc) {
    if (msg instanceof Uint8Array) {
      return msg;
    }
    if (Array.isArray(msg)) {
      return new Uint8Array(msg);
    }
    return Uint8Array.from(toArray(msg, enc));
  }
  function toHashKeyBytes(key) {
    return typeof key === "string" ? toHashBytes(key, "hex") : toHashBytes(key);
  }
  function updateNativeOrFallback(native, fallback, data) {
    if (native != null) {
      native.update(data);
    } else if (fallback != null) {
      fallback.update(data);
    }
  }
  function digestNativeOrFallback(native, fallback) {
    if (native != null)
      return Array.from(native.digest());
    if (fallback != null)
      return Array.from(fallback.digest());
    return [];
  }
  function digestHexNativeOrFallback(native, fallback) {
    if (native != null)
      return native.digest("hex");
    if (fallback != null)
      return bytesToHex(fallback.digest());
    return "";
  }
  function createNodeHash(algorithm) {
    const createHash = NODE_CRYPTO?.createHash;
    if (typeof createHash !== "function")
      return void 0;
    try {
      return createHash(algorithm);
    } catch {
      return void 0;
    }
  }
  function createNodeHmac(algorithm, keyBytes) {
    const createHmac = NODE_CRYPTO?.createHmac;
    if (typeof createHmac !== "function")
      return void 0;
    try {
      return createHmac(algorithm, keyBytes);
    } catch {
      return void 0;
    }
  }
  function digestWithNodeHash(algorithm, msg, enc) {
    const hash = createNodeHash(algorithm);
    if (hash == null)
      return void 0;
    hash.update(toHashBytes(msg, enc));
    return hash.digest();
  }
  function digestWithNodeHmac(algorithm, key, msg, enc) {
    const hmac2 = createNodeHmac(algorithm, toHashKeyBytes(key));
    if (hmac2 == null)
      return void 0;
    hmac2.update(toHashBytes(msg, enc));
    return hmac2.digest();
  }
  function join32(msg, start, end, endian) {
    const len = end - start;
    assert(len % 4 === 0);
    const res = Array.from({ length: len / 4 });
    for (let i = 0, k = start; i < res.length; i++, k += 4) {
      let w;
      if (endian === "big") {
        w = msg[k] << 24 | msg[k + 1] << 16 | msg[k + 2] << 8 | msg[k + 3];
      } else {
        w = msg[k + 3] << 24 | msg[k + 2] << 16 | msg[k + 1] << 8 | msg[k];
      }
      res[i] = w >>> 0;
    }
    return res;
  }
  function split32(msg, endian) {
    const res = Array.from({ length: msg.length * 4 });
    for (let i = 0, k = 0; i < msg.length; i++, k += 4) {
      const m = msg[i];
      if (endian === "big") {
        res[k] = m >>> 24;
        res[k + 1] = m >>> 16 & 255;
        res[k + 2] = m >>> 8 & 255;
        res[k + 3] = m & 255;
      } else {
        res[k + 3] = m >>> 24;
        res[k + 2] = m >>> 16 & 255;
        res[k + 1] = m >>> 8 & 255;
        res[k] = m & 255;
      }
    }
    return res;
  }
  function rotr32(w, b) {
    return w >>> b | w << 32 - b;
  }
  function rotl32(w, b) {
    return w << b | w >>> 32 - b;
  }
  function sum32(a, b) {
    return a + b >>> 0;
  }
  function SUM32_3(a, b, c) {
    return a + b + c >>> 0;
  }
  function SUM32_4(a, b, c, d) {
    return a + b + c + d >>> 0;
  }
  function SUM32_5(a, b, c, d, e) {
    return a + b + c + d + e >>> 0;
  }
  function FT_1(s2, x, y, z) {
    if (s2 === 0) {
      return ch32(x, y, z);
    }
    if (s2 === 1 || s2 === 3) {
      return p32(x, y, z);
    }
    if (s2 === 2) {
      return maj32(x, y, z);
    }
    return 0;
  }
  function ch32(x, y, z) {
    return x & y ^ ~x & z;
  }
  function maj32(x, y, z) {
    return x & y ^ x & z ^ y & z;
  }
  function p32(x, y, z) {
    return x ^ y ^ z;
  }
  function S0_256(x) {
    return rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
  }
  function S1_256(x) {
    return rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
  }
  function G0_256(x) {
    return rotr32(x, 7) ^ rotr32(x, 18) ^ x >>> 3;
  }
  function G1_256(x) {
    return rotr32(x, 17) ^ rotr32(x, 19) ^ x >>> 10;
  }
  function f(j, x, y, z) {
    if (j <= 15) {
      return x ^ y ^ z;
    } else if (j <= 31) {
      return x & y | ~x & z;
    } else if (j <= 47) {
      return (x | ~y) ^ z;
    } else if (j <= 63) {
      return x & z | y & ~z;
    } else {
      return x ^ (y | ~z);
    }
  }
  function K(j) {
    if (j <= 15) {
      return 0;
    } else if (j <= 31) {
      return 1518500249;
    } else if (j <= 47) {
      return 1859775393;
    } else if (j <= 63) {
      return 2400959708;
    } else {
      return 2840853838;
    }
  }
  function Kh(j) {
    if (j <= 15) {
      return 1352829926;
    } else if (j <= 31) {
      return 1548603684;
    } else if (j <= 47) {
      return 1836072691;
    } else if (j <= 63) {
      return 2053994217;
    } else {
      return 0;
    }
  }
  function sha256Bytes(msg, enc) {
    const native = digestWithNodeHash("sha256", msg, enc);
    if (native != null)
      return native;
    return new FastSHA256().update(toHashBytes(msg, enc)).digest();
  }
  function ripemd160Bytes(msg, enc) {
    return digestWithNodeHash("ripemd160", msg, enc);
  }
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0) {
      throw new Error(`positive integer expected, got ${n}`);
    }
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length)) {
      const lens = lengths.join(",");
      throw new Error(`Uint8Array expected of length ${lens}, got length=${b.length}`);
    }
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function") {
      throw new TypeError("Hash should be wrapped by utils.createHasher");
    }
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed === true)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished === true) {
      throw new Error("Hash#digest() has already been called");
    }
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error(`digestInto() expects output buffer of length at least ${min}`);
    }
  }
  function clean(...arrays) {
    for (const arr of arrays)
      arr.fill(0);
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return utf8Bytes(str);
  }
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    const Ah = new Uint32Array(len);
    const Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      Ah[i] = h;
      Al[i] = l;
    }
    return [Ah, Al];
  }
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE);
    const _32n2 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n2 & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  function swapBytes32(w) {
    const res = w >>> 24 | w >>> 8 & 65280 | w << 8 & 16711680 | (w & 255) << 24;
    return res >>> 0;
  }
  var assert, BaseHash, BufferCtor2, CAN_USE_BUFFER2, HEX_DIGITS, HEX_BYTE_STRINGS, NODE_CRYPTO, r, rh, s, sh, RIPEMD160, SHA1, SHA256HMAC, SHA512HMAC, ripemd160, sha1, sha256, hash256, hash160, sha256hmac, sha512hmac, Hash, U32_MASK64, _32n, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H, HashMD, SHA256_IV, K2562, SHA256_W, FastSHA256, sha256Fast, SHA512_IV, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, FastSHA512, sha512Fast, HMAC, hmac, isLittleEndian;
  var init_Hash = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Hash.js"() {
      init_hex();
      init_UTF8();
      assert = (expression, message = "Hash assertion failed") => {
        if (!expression) {
          throw new Error(message);
        }
      };
      BaseHash = class {
        pending = null;
        pendingTotal = 0;
        blockSize;
        outSize;
        endian;
        _delta8;
        _delta32;
        padLength;
        hmacStrength;
        constructor(blockSize, outSize, hmacStrength, padLength) {
          this.blockSize = blockSize;
          this.outSize = outSize;
          this.hmacStrength = hmacStrength;
          this.padLength = padLength / 8;
          this.endian = "big";
          this._delta8 = this.blockSize / 8;
          this._delta32 = this.blockSize / 32;
        }
        _update(_msg, _start) {
          throw new Error("Not implemented");
        }
        _digest() {
          throw new Error("Not implemented");
        }
        _digestHex() {
          throw new Error("Not implemented");
        }
        /**
         * Converts the input message into an array, pads it, and joins into 32bit blocks.
         * If there is enough data, it tries updating the hash computation.
         *
         * @method update
         * @param msg - The message segment to include in the hashing computation.
         * @param enc - The encoding of the message. If 'hex', the string will be treated as such, 'utf8' otherwise.
         *
         * @returns Returns the instance of the object for chaining.
         *
         * @example
         * sha256.update('Hello World', 'utf8');
         */
        update(msg, enc) {
          msg = toArray(msg, enc);
          if (this.pending == null) {
            this.pending = msg;
          } else {
            this.pending = this.pending.concat(msg);
          }
          this.pendingTotal += msg.length;
          if (this.pending.length >= this._delta8) {
            msg = this.pending;
            const r2 = msg.length % this._delta8;
            this.pending = msg.slice(msg.length - r2, msg.length);
            if (this.pending.length === 0) {
              this.pending = null;
            }
            msg = join32(msg, 0, msg.length - r2, this.endian);
            for (let i = 0; i < msg.length; i += this._delta32) {
              this._update(msg, i);
            }
          }
          return this;
        }
        /**
         * Finalizes the hash computation and returns the hash value/result.
         *
         * @method digest
         *
         * @returns Returns the final hash value.
         *
         * @example
         * const hash = sha256.digest();
         */
        digest() {
          this.update(this._pad());
          assert(this.pending === null);
          return this._digest();
        }
        /**
         * Finalizes the hash computation and returns the hash value/result as a hex string.
         *
         * @method digest
         *
         * @returns Returns the final hash value as a hex string.
         *
         * @example
         * const hash = sha256.digestHex();
         */
        digestHex() {
          this.update(this._pad());
          assert(this.pending === null);
          return this._digestHex();
        }
        /**
         * [Private Method] Used internally to prepare the padding for the final stage of the hash computation.
         *
         * @method _pad
         * @private
         *
         * @returns Returns an array denoting the padding.
         */
        _pad() {
          const len = this.pendingTotal;
          if (!Number.isSafeInteger(len) || len < 0) {
            throw new Error("Message too long for this hash function");
          }
          const bytes3 = this._delta8;
          const k = bytes3 - (len + this.padLength) % bytes3;
          const res = Array.from({ length: k + this.padLength });
          res[0] = 128;
          let i;
          for (i = 1; i < k; i++) {
            res[i] = 0;
          }
          const lengthBytes = this.padLength;
          const maxBits = 1n << BigInt(lengthBytes * 8);
          let totalBits = BigInt(len) * 8n;
          if (totalBits >= maxBits) {
            throw new Error("Message too long for this hash function");
          }
          if (this.endian === "big") {
            const lenArray = Array.from({ length: lengthBytes });
            for (let b = lengthBytes - 1; b >= 0; b--) {
              lenArray[b] = Number(totalBits & 0xffn);
              totalBits >>= 8n;
            }
            for (let b = 0; b < lengthBytes; b++) {
              res[i++] = lenArray[b];
            }
          } else {
            for (let b = 0; b < lengthBytes; b++) {
              res[i++] = Number(totalBits & 0xffn);
              totalBits >>= 8n;
            }
          }
          return res;
        }
      };
      BufferCtor2 = typeof globalThis === "undefined" ? void 0 : globalThis.Buffer;
      CAN_USE_BUFFER2 = BufferCtor2 != null && typeof BufferCtor2.from === "function";
      HEX_DIGITS = "0123456789abcdef";
      HEX_BYTE_STRINGS = Array.from({ length: 256 });
      for (let i = 0; i < HEX_BYTE_STRINGS.length; i++) {
        HEX_BYTE_STRINGS[i] = HEX_DIGITS[i >> 4 & 15] + HEX_DIGITS[i & 15];
      }
      NODE_CRYPTO = (() => {
        const processLike = typeof globalThis === "undefined" ? void 0 : globalThis.process;
        const getBuiltinModule = processLike?.getBuiltinModule;
        if (typeof getBuiltinModule === "function") {
          try {
            const crypto = getBuiltinModule.call(processLike, "node:crypto");
            if (crypto != null)
              return crypto;
          } catch {
          }
        }
        return void 0;
      })();
      r = [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        7,
        4,
        13,
        1,
        10,
        6,
        15,
        3,
        12,
        0,
        9,
        5,
        2,
        14,
        11,
        8,
        3,
        10,
        14,
        4,
        9,
        15,
        8,
        1,
        2,
        7,
        0,
        6,
        13,
        11,
        5,
        12,
        1,
        9,
        11,
        10,
        0,
        8,
        12,
        4,
        13,
        3,
        7,
        15,
        14,
        5,
        6,
        2,
        4,
        0,
        5,
        9,
        7,
        12,
        2,
        10,
        14,
        1,
        3,
        8,
        11,
        6,
        15,
        13
      ];
      rh = [
        5,
        14,
        7,
        0,
        9,
        2,
        11,
        4,
        13,
        6,
        15,
        8,
        1,
        10,
        3,
        12,
        6,
        11,
        3,
        7,
        0,
        13,
        5,
        10,
        14,
        15,
        8,
        12,
        4,
        9,
        1,
        2,
        15,
        5,
        1,
        3,
        7,
        14,
        6,
        9,
        11,
        8,
        12,
        2,
        10,
        0,
        4,
        13,
        8,
        6,
        4,
        1,
        3,
        11,
        15,
        0,
        5,
        12,
        2,
        13,
        9,
        7,
        10,
        14,
        12,
        15,
        10,
        4,
        1,
        5,
        8,
        7,
        6,
        2,
        13,
        14,
        0,
        3,
        9,
        11
      ];
      s = [
        11,
        14,
        15,
        12,
        5,
        8,
        7,
        9,
        11,
        13,
        14,
        15,
        6,
        7,
        9,
        8,
        7,
        6,
        8,
        13,
        11,
        9,
        7,
        15,
        7,
        12,
        15,
        9,
        11,
        7,
        13,
        12,
        11,
        13,
        6,
        7,
        14,
        9,
        13,
        15,
        14,
        8,
        13,
        6,
        5,
        12,
        7,
        5,
        11,
        12,
        14,
        15,
        14,
        15,
        9,
        8,
        9,
        14,
        5,
        6,
        8,
        6,
        5,
        12,
        9,
        15,
        5,
        11,
        6,
        8,
        13,
        12,
        5,
        12,
        13,
        14,
        11,
        8,
        5,
        6
      ];
      sh = [
        8,
        9,
        9,
        11,
        13,
        15,
        15,
        5,
        7,
        7,
        8,
        11,
        14,
        14,
        12,
        6,
        9,
        13,
        15,
        7,
        12,
        8,
        9,
        11,
        7,
        7,
        12,
        7,
        6,
        15,
        13,
        11,
        9,
        7,
        15,
        11,
        8,
        6,
        6,
        14,
        12,
        13,
        5,
        14,
        13,
        13,
        7,
        5,
        15,
        5,
        8,
        11,
        14,
        14,
        6,
        14,
        6,
        9,
        12,
        9,
        12,
        5,
        15,
        8,
        8,
        5,
        12,
        9,
        12,
        5,
        14,
        6,
        8,
        13,
        6,
        5,
        15,
        13,
        11,
        11
      ];
      RIPEMD160 = class extends BaseHash {
        h;
        constructor() {
          super(512, 160, 192, 64);
          this.endian = "little";
          this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
          this.endian = "little";
        }
        _update(msg, start) {
          let A = this.h[0];
          let B = this.h[1];
          let C = this.h[2];
          let D = this.h[3];
          let E = this.h[4];
          let Ah = A;
          let Bh = B;
          let Ch = C;
          let Dh = D;
          let Eh = E;
          let T;
          for (let j = 0; j < 80; j++) {
            T = sum32(rotl32(SUM32_4(A, f(j, B, C, D), msg[r[j] + start], K(j)), s[j]), E);
            A = E;
            E = D;
            D = rotl32(C, 10);
            C = B;
            B = T;
            T = sum32(rotl32(SUM32_4(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)), sh[j]), Eh);
            Ah = Eh;
            Eh = Dh;
            Dh = rotl32(Ch, 10);
            Ch = Bh;
            Bh = T;
          }
          T = SUM32_3(this.h[1], C, Dh);
          this.h[1] = SUM32_3(this.h[2], D, Eh);
          this.h[2] = SUM32_3(this.h[3], E, Ah);
          this.h[3] = SUM32_3(this.h[4], A, Bh);
          this.h[4] = SUM32_3(this.h[0], B, Ch);
          this.h[0] = T;
        }
        _digest() {
          return split32(this.h, "little");
        }
        _digestHex() {
          return toHex32(this.h, "little");
        }
      };
      SHA1 = class extends BaseHash {
        h;
        W;
        k;
        constructor() {
          super(512, 160, 80, 64);
          this.k = [1518500249, 1859775393, 2400959708, 3395469782];
          this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
          this.W = Array.from({ length: 80 });
        }
        _update(msg, start) {
          const W = this.W;
          start ??= 0;
          let i;
          for (i = 0; i < 16; i++) {
            W[i] = msg[start + i];
          }
          for (; i < W.length; i++) {
            W[i] = rotl32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
          }
          let a = this.h[0];
          let b = this.h[1];
          let c = this.h[2];
          let d = this.h[3];
          let e = this.h[4];
          for (i = 0; i < W.length; i++) {
            const s2 = Math.trunc(i / 20);
            const t = SUM32_5(rotl32(a, 5), FT_1(s2, b, c, d), e, W[i], this.k[s2]);
            e = d;
            d = c;
            c = rotl32(b, 30);
            b = a;
            a = t;
          }
          this.h[0] = sum32(this.h[0], a);
          this.h[1] = sum32(this.h[1], b);
          this.h[2] = sum32(this.h[2], c);
          this.h[3] = sum32(this.h[3], d);
          this.h[4] = sum32(this.h[4], e);
        }
        _digest() {
          return split32(this.h, "big");
        }
        _digestHex() {
          return toHex32(this.h, "big");
        }
      };
      SHA256HMAC = class {
        #h;
        #native;
        blockSize = 64;
        outSize = 32;
        /**
         * The constructor for the `SHA256HMAC` class.
         *
         * It initializes the `SHA256HMAC` object and sets up the inner and outer padded keys.
         * If the key size is larger than the blockSize, it is digested using SHA-256.
         * If the key size is less than the blockSize, it is padded with zeroes.
         *
         * @constructor
         * @param key - The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.
         *
         * @example
         * const myHMAC = new SHA256HMAC('deadbeef');
         */
        constructor(key) {
          const k = toHashKeyBytes(key);
          this.#native = createNodeHmac("sha256", k);
          if (this.#native == null) {
            this.#h = new HMAC(sha256Fast, k);
          }
        }
        /**
         * Updates the `SHA256HMAC` object with part of the message to be hashed.
         *
         * @method update
         * @param msg - Part of the message to hash. Can be a number array or a string.
         * @param enc - If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
         * @returns Returns the instance of `SHA256HMAC` for chaining calls.
         *
         * @example
         * myHMAC.update('deadbeef', 'hex');
         */
        update(msg, enc) {
          updateNativeOrFallback(this.#native, this.#h, toHashBytes(msg, enc));
          return this;
        }
        /**
         * Finalizes the HMAC computation and returns the resultant hash.
         *
         * @method digest
         * @returns Returns the digest of the hashed data. Can be a number array or a string.
         *
         * @example
         * let hashedMessage = myHMAC.digest();
         */
        digest() {
          return digestNativeOrFallback(this.#native, this.#h);
        }
        /**
         * Finalizes the HMAC computation and returns the resultant hash as a hex string.
         *
         * @method digest
         * @returns Returns the digest of the hashed data as a hex string
         *
         * @example
         * let hashedMessage = myHMAC.digestHex();
         */
        digestHex() {
          return digestHexNativeOrFallback(this.#native, this.#h);
        }
      };
      SHA512HMAC = class {
        #h;
        #native;
        blockSize = 128;
        outSize = 32;
        /**
         * The constructor for the `SHA512HMAC` class.
         *
         * It initializes the `SHA512HMAC` object and sets up the inner and outer padded keys.
         * If the key size is larger than the blockSize, it is digested using SHA-512.
         * If the key size is less than the blockSize, it is padded with zeroes.
         *
         * @constructor
         * @param key - The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.
         *
         * @example
         * const myHMAC = new SHA512HMAC('deadbeef');
         */
        constructor(key) {
          const k = toHashKeyBytes(key);
          this.#native = createNodeHmac("sha512", k);
          if (this.#native == null) {
            this.#h = new HMAC(sha512Fast, k);
          }
        }
        /**
         * Updates the `SHA512HMAC` object with part of the message to be hashed.
         *
         * @method update
         * @param msg - Part of the message to hash. Can be a number array or a string.
         * @param enc - If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.
         * @returns Returns the instance of `SHA512HMAC` for chaining calls.
         *
         * @example
         * myHMAC.update('deadbeef', 'hex');
         */
        update(msg, enc) {
          updateNativeOrFallback(this.#native, this.#h, toHashBytes(msg, enc));
          return this;
        }
        /**
         * Finalizes the HMAC computation and returns the resultant hash.
         *
         * @method digest
         * @returns Returns the digest of the hashed data as a number array.
         *
         * @example
         * let hashedMessage = myHMAC.digest();
         */
        digest() {
          return digestNativeOrFallback(this.#native, this.#h);
        }
        /**
         * Finalizes the HMAC computation and returns the resultant hash as a hex string.
         *
         * @method digest
         * @returns Returns the digest of the hashed data as a hex string
         *
         * @example
         * let hashedMessage = myHMAC.digestHex();
         */
        digestHex() {
          return digestHexNativeOrFallback(this.#native, this.#h);
        }
      };
      ripemd160 = (msg, enc) => {
        const native = ripemd160Bytes(msg, enc);
        if (native != null)
          return Array.from(native);
        return new RIPEMD160().update(msg, enc).digest();
      };
      sha1 = (msg, enc) => {
        return new SHA1().update(msg, enc).digest();
      };
      sha256 = (msg, enc) => {
        return Array.from(sha256Bytes(msg, enc));
      };
      hash256 = (msg, enc) => {
        return Array.from(sha256Bytes(sha256Bytes(msg, enc)));
      };
      hash160 = (msg, enc) => {
        const first = sha256Bytes(msg, enc);
        const native = ripemd160Bytes(first);
        if (native != null)
          return Array.from(native);
        return new RIPEMD160().update(first).digest();
      };
      sha256hmac = (key, msg, enc) => {
        const native = digestWithNodeHmac("sha256", key, msg, enc);
        if (native != null)
          return Array.from(native);
        return new SHA256HMAC(key).update(msg, enc).digest();
      };
      sha512hmac = (key, msg, enc) => {
        const native = digestWithNodeHmac("sha512", key, msg, enc);
        if (native != null)
          return Array.from(native);
        return new SHA512HMAC(key).update(msg, enc).digest();
      };
      Hash = class {
      };
      U32_MASK64 = BigInt(2 ** 32 - 1);
      _32n = BigInt(32);
      shrSH = (h, _l, s2) => h >>> s2;
      shrSL = (h, l, s2) => h << 32 - s2 | l >>> s2;
      rotrSH = (h, l, s2) => h >>> s2 | l << 32 - s2;
      rotrSL = (h, l, s2) => h << 32 - s2 | l >>> s2;
      rotrBH = (h, l, s2) => h << 64 - s2 | l >>> s2 - 32;
      rotrBL = (h, l, s2) => h >>> s2 - 32 | l << 64 - s2;
      add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      add3H = (low, Ah, Bh, Ch) => Math.trunc(Ah + Bh + Ch + Math.trunc(low / 2 ** 32));
      add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      add4H = (low, Ah, Bh, Ch, Dh) => Math.trunc(Ah + Bh + Ch + Dh + Math.trunc(low / 2 ** 32));
      add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
      HashMD = class extends Hash {
        blockLen;
        outputLen;
        padOffset;
        isLE;
        buffer;
        view;
        finished = false;
        length = 0;
        pos = 0;
        destroyed = false;
        constructor(blockLen, outputLen, padOffset, isLE) {
          super();
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
        }
        update(data) {
          aexists(this);
          data = toBytes(data);
          abytes(data);
          const { view, buffer, blockLen } = this;
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = createView(data);
              for (; blockLen <= len - pos; pos += blockLen)
                this.process(dataView, pos);
              continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
            }
          }
          this.length += data.length;
          this.roundClean();
          return this;
        }
        digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const { buffer, view, blockLen, isLE } = this;
          let { pos } = this;
          buffer[pos++] = 128;
          clean(this.buffer.subarray(pos));
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
          setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
          this.process(view, 0);
          const oview = createView(out);
          const len = this.outputLen;
          if (len % 4 !== 0)
            throw new Error("_sha2: outputLen should be aligned to 32bit");
          const outLen = len / 4;
          const state = this.get();
          if (outLen > state.length)
            throw new Error("_sha2: outputLen bigger than state");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
        }
        digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to ??= new this.constructor();
          to.set(...this.get());
          const { blockLen, buffer, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          if (length % blockLen !== 0)
            to.buffer.set(buffer);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
      };
      SHA256_IV = Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      K2562 = Uint32Array.from([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      SHA256_W = new Uint32Array(64);
      FastSHA256 = class extends HashMD {
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        A = SHA256_IV[0] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        B = SHA256_IV[1] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        C = SHA256_IV[2] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        D = SHA256_IV[3] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        E = SHA256_IV[4] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        F = SHA256_IV[5] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        G = SHA256_IV[6] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        H = SHA256_IV[7] | 0;
        constructor(outputLen = 32) {
          super(64, outputLen, 8, false);
        }
        get() {
          const { A, B, C, D, E, F, G, H } = this;
          return [A, B, C, D, E, F, G, H];
        }
        set(...[A, B, C, D, E, F, G, H]) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA256_W[i] = view.getUint32(offset);
          }
          for (let i = 16; i < 64; i++) {
            const w15 = SHA256_W[i - 15];
            const w2 = SHA256_W[i - 2];
            const s0 = G0_256(w15);
            const s1 = G1_256(w2);
            SHA256_W[i] = sum32(sum32(s0, SHA256_W[i - 7]), sum32(s1, SHA256_W[i - 16]));
          }
          let { A, B, C, D, E, F, G, H } = this;
          for (let i = 0; i < 64; i++) {
            const T1 = SUM32_5(H, S1_256(E), ch32(E, F, G), K2562[i], SHA256_W[i]);
            const T2 = sum32(S0_256(A), maj32(A, B, C));
            H = G;
            G = F;
            F = E;
            E = sum32(D, T1);
            D = C;
            C = B;
            B = A;
            A = sum32(T1, T2);
          }
          this.A = sum32(this.A, A);
          this.B = sum32(this.B, B);
          this.C = sum32(this.C, C);
          this.D = sum32(this.D, D);
          this.E = sum32(this.E, E);
          this.F = sum32(this.F, F);
          this.G = sum32(this.G, G);
          this.H = sum32(this.H, H);
        }
        roundClean() {
          clean(SHA256_W);
        }
        destroy() {
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      sha256Fast = createHasher(() => new FastSHA256());
      SHA512_IV = Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ]);
      K512 = (() => split([
        "0x428a2f98d728ae22",
        "0x7137449123ef65cd",
        "0xb5c0fbcfec4d3b2f",
        "0xe9b5dba58189dbbc",
        "0x3956c25bf348b538",
        "0x59f111f1b605d019",
        "0x923f82a4af194f9b",
        "0xab1c5ed5da6d8118",
        "0xd807aa98a3030242",
        "0x12835b0145706fbe",
        "0x243185be4ee4b28c",
        "0x550c7dc3d5ffb4e2",
        "0x72be5d74f27b896f",
        "0x80deb1fe3b1696b1",
        "0x9bdc06a725c71235",
        "0xc19bf174cf692694",
        "0xe49b69c19ef14ad2",
        "0xefbe4786384f25e3",
        "0x0fc19dc68b8cd5b5",
        "0x240ca1cc77ac9c65",
        "0x2de92c6f592b0275",
        "0x4a7484aa6ea6e483",
        "0x5cb0a9dcbd41fbd4",
        "0x76f988da831153b5",
        "0x983e5152ee66dfab",
        "0xa831c66d2db43210",
        "0xb00327c898fb213f",
        "0xbf597fc7beef0ee4",
        "0xc6e00bf33da88fc2",
        "0xd5a79147930aa725",
        "0x06ca6351e003826f",
        "0x142929670a0e6e70",
        "0x27b70a8546d22ffc",
        "0x2e1b21385c26c926",
        "0x4d2c6dfc5ac42aed",
        "0x53380d139d95b3df",
        "0x650a73548baf63de",
        "0x766a0abb3c77b2a8",
        "0x81c2c92e47edaee6",
        "0x92722c851482353b",
        "0xa2bfe8a14cf10364",
        "0xa81a664bbc423001",
        "0xc24b8b70d0f89791",
        "0xc76c51a30654be30",
        "0xd192e819d6ef5218",
        "0xd69906245565a910",
        "0xf40e35855771202a",
        "0x106aa07032bbd1b8",
        "0x19a4c116b8d2d0c8",
        "0x1e376c085141ab53",
        "0x2748774cdf8eeb99",
        "0x34b0bcb5e19b48a8",
        "0x391c0cb3c5c95a63",
        "0x4ed8aa4ae3418acb",
        "0x5b9cca4f7763e373",
        "0x682e6ff3d6b2b8a3",
        "0x748f82ee5defb2fc",
        "0x78a5636f43172f60",
        "0x84c87814a1f0ab72",
        "0x8cc702081a6439ec",
        "0x90befffa23631e28",
        "0xa4506cebde82bde9",
        "0xbef9a3f7b2c67915",
        "0xc67178f2e372532b",
        "0xca273eceea26619c",
        "0xd186b8c721c0c207",
        "0xeada7dd6cde0eb1e",
        "0xf57d4f7fee6ed178",
        "0x06f067aa72176fba",
        "0x0a637dc5a2c898a6",
        "0x113f9804bef90dae",
        "0x1b710b35131c471b",
        "0x28db77f523047d84",
        "0x32caab7b40c72493",
        "0x3c9ebe0a15c9bebc",
        "0x431d67c49c100d4c",
        "0x4cc5d4becb3e42b6",
        "0x597f299cfc657e2a",
        "0x5fcb6fab3ad6faec",
        "0x6c44198c4a475817"
      ].map(BigInt)))();
      SHA512_Kh = (() => K512[0])();
      SHA512_Kl = (() => K512[1])();
      SHA512_W_H = new Uint32Array(80);
      SHA512_W_L = new Uint32Array(80);
      FastSHA512 = class extends HashMD {
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Ah = SHA512_IV[0] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Al = SHA512_IV[1] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Bh = SHA512_IV[2] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Bl = SHA512_IV[3] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Ch = SHA512_IV[4] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Cl = SHA512_IV[5] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Dh = SHA512_IV[6] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Dl = SHA512_IV[7] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Eh = SHA512_IV[8] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        El = SHA512_IV[9] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Fh = SHA512_IV[10] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Fl = SHA512_IV[11] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Gh = SHA512_IV[12] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Gl = SHA512_IV[13] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Hh = SHA512_IV[14] | 0;
        // eslint-disable-next-line no-bitwise -- ToInt32 (ECMA-262); not truncation. Required for SHA arithmetic.
        Hl = SHA512_IV[15] | 0;
        constructor(outputLen = 64) {
          super(128, outputLen, 16, false);
        }
        get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        set(...[Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl]) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 8) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset + 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
            const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
            const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
            const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
            const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
            const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const T2l = add3L(sigma0l, MAJl, T1l);
            Ah = add3H(T2l, sigma0h, MAJh, T1h);
            Al = T2l | 0;
          }
          ;
          ({ h: Ah, l: Al } = add(Ah, Al, this.Ah, this.Al));
          ({ h: Bh, l: Bl } = add(Bh, Bl, this.Bh, this.Bl));
          ({ h: Ch, l: Cl } = add(Ch, Cl, this.Ch, this.Cl));
          ({ h: Dh, l: Dl } = add(Dh, Dl, this.Dh, this.Dl));
          ({ h: Eh, l: El } = add(Eh, El, this.Eh, this.El));
          ({ h: Fh, l: Fl } = add(Fh, Fl, this.Fh, this.Fl));
          ({ h: Gh, l: Gl } = add(Gh, Gl, this.Gh, this.Gl));
          ({ h: Hh, l: Hl } = add(Hh, Hl, this.Hh, this.Hl));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          clean(SHA512_W_H, SHA512_W_L);
        }
        destroy() {
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      sha512Fast = createHasher(() => new FastSHA512());
      HMAC = class extends Hash {
        oHash;
        iHash;
        blockLen;
        outputLen;
        finished = false;
        destroyed = false;
        constructor(hash, _key) {
          super();
          ahash(hash);
          const key = toBytes(_key);
          this.iHash = hash.create();
          if (typeof this.iHash.update !== "function") {
            throw new TypeError("Expected instance of class which extends utils.Hash");
          }
          this.blockLen = this.iHash.blockLen;
          this.outputLen = this.iHash.outputLen;
          const blockLen = this.blockLen;
          const pad = new Uint8Array(blockLen);
          pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54;
          this.iHash.update(pad);
          this.oHash = hash.create();
          for (let i = 0; i < pad.length; i++)
            pad[i] ^= 54 ^ 92;
          this.oHash.update(pad);
          clean(pad);
        }
        update(buf) {
          aexists(this);
          this.iHash.update(buf);
          return this;
        }
        digestInto(out) {
          aexists(this);
          abytes(out, this.outputLen);
          this.finished = true;
          this.iHash.digestInto(out);
          this.oHash.update(out);
          this.oHash.digestInto(out);
          this.destroy();
        }
        digest() {
          const out = new Uint8Array(this.oHash.outputLen);
          this.digestInto(out);
          return out;
        }
        _cloneInto(to) {
          to ??= Object.create(Object.getPrototypeOf(this), {});
          const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
          to = to;
          to.finished = finished;
          to.destroyed = destroyed;
          to.blockLen = blockLen;
          to.outputLen = outputLen;
          to.oHash = oHash._cloneInto(to.oHash ?? void 0);
          to.iHash = iHash._cloneInto(to.iHash ?? void 0);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
        destroy() {
          this.destroyed = true;
          this.oHash.destroy();
          this.iHash.destroy();
        }
      };
      hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
      hmac.create = (hash, key) => new HMAC(hash, key);
      isLittleEndian = (() => {
        const b = new ArrayBuffer(4);
        const a = new Uint32Array(b);
        const c = new Uint8Array(b);
        a[0] = 16909060;
        return c[0] === 4;
      })();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/readVarIntNumStrict.js
  function readVarIntNumStrict(reader, signed = true) {
    const first = reader.readUInt8();
    if (first < 253)
      return first;
    if (first === 253) {
      const value2 = reader.readUInt16LE();
      if (value2 < 253)
        throw new Error("non-canonical varInt");
      return value2;
    }
    if (first === 254) {
      const value2 = reader.readUInt32LE();
      if (value2 <= 65535)
        throw new Error("non-canonical varInt");
      return value2;
    }
    const value = reader.readUInt64LEBn();
    if (value.lte(UINT32_MAX))
      throw new Error("non-canonical varInt");
    if (signed && value.eq(UINT64_MAX))
      return -1;
    if (value.gt(MAX_SAFE_INTEGER)) {
      throw new Error("number too large to retain precision - use readVarIntBn");
    }
    return value.toNumber();
  }
  var UINT32_MAX, UINT64_MAX, MAX_SAFE_INTEGER;
  var init_readVarIntNumStrict = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/readVarIntNumStrict.js"() {
      init_BigNumber();
      UINT32_MAX = new BigNumber(4294967295);
      UINT64_MAX = new BigNumber(2).pow(new BigNumber(64)).sub(new BigNumber(1));
      MAX_SAFE_INTEGER = new BigNumber(Number.MAX_SAFE_INTEGER);
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/WriterUint8Array.js
  var WriterUint8Array;
  var init_WriterUint8Array = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/WriterUint8Array.js"() {
      init_BigNumber();
      init_utils();
      WriterUint8Array = class {
        #buffer;
        #pos;
        #capacity;
        constructor(bufs, initialCapacity = 256) {
          if (!Number.isSafeInteger(initialCapacity) || initialCapacity < 0) {
            throw new RangeError("WriterUint8Array initial capacity must be a non-negative safe integer");
          }
          if (bufs != null && bufs.length > 0) {
            const totalLength = bufs.reduce((sum, buf) => sum + buf.length, 0);
            initialCapacity = Math.max(initialCapacity, totalLength);
          }
          initialCapacity = Math.max(1, initialCapacity);
          this.#buffer = new Uint8Array(initialCapacity);
          this.#pos = 0;
          this.#capacity = initialCapacity;
          if (bufs != null) {
            for (const buf of bufs) {
              this.write(buf);
            }
          }
        }
        /**
         * Returns the current length of written data
         */
        getLength() {
          return this.#pos;
        }
        /**
         * @return the written data as Uint8Array copy of the internal buffer
         */
        toUint8Array() {
          return this.#buffer.slice(0, this.#pos);
        }
        /**
         * Legacy compatibility method – returns number[] (Byte[])
         */
        toArray() {
          return Array.from(this.toUint8Array());
        }
        /**
         * @return the written data as Uint8Array. CAUTION: This is zero-copy subarray of the internal buffer).
         */
        toUint8ArrayZeroCopy() {
          return this.#buffer.subarray(0, this.#pos);
        }
        /** Ensures room for `additionalBytes` without changing the written length. */
        reserve(additionalBytes) {
          if (!Number.isSafeInteger(additionalBytes) || additionalBytes < 0) {
            throw new RangeError("WriterUint8Array reserve requires a non-negative safe integer");
          }
          this.#ensureCapacity(additionalBytes);
        }
        #ensureCapacity(needed) {
          if (this.#pos + needed > this.#capacity) {
            let newCapacity = this.#capacity * 2;
            while (this.#pos + needed > newCapacity) {
              newCapacity *= 2;
            }
            const newBuffer = new Uint8Array(newCapacity);
            newBuffer.set(this.#buffer);
            this.#buffer = newBuffer;
            this.#capacity = newCapacity;
          }
        }
        write(bytes3) {
          const data = bytes3 instanceof Uint8Array ? bytes3 : new Uint8Array(bytes3);
          this.#ensureCapacity(data.length);
          this.#buffer.set(data, this.#pos);
          this.#pos += data.length;
          return this;
        }
        writeReverse(buf) {
          const data = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
          this.#ensureCapacity(data.length);
          for (let i = data.length - 1; i >= 0; i--) {
            this.#buffer[this.#pos] = data[i];
            this.#pos += 1;
          }
          return this;
        }
        writeUInt8(value) {
          this.#ensureCapacity(1);
          this.#buffer[this.#pos] = value & 255;
          this.#pos += 1;
          return this;
        }
        writeInt8(value) {
          this.writeUInt8(value);
          return this;
        }
        writeUInt16LE(value) {
          this.#ensureCapacity(2);
          this.#buffer[this.#pos] = value & 255;
          this.#buffer[this.#pos + 1] = value >> 8 & 255;
          this.#pos += 2;
          return this;
        }
        writeUInt16BE(value) {
          this.#ensureCapacity(2);
          this.#buffer[this.#pos] = value >> 8 & 255;
          this.#buffer[this.#pos + 1] = value & 255;
          this.#pos += 2;
          return this;
        }
        writeInt16LE(value) {
          this.writeUInt16LE(value & 65535);
          return this;
        }
        writeInt16BE(value) {
          this.writeUInt16BE(value & 65535);
          return this;
        }
        writeUInt32LE(value) {
          this.#ensureCapacity(4);
          this.#buffer[this.#pos] = value & 255;
          this.#buffer[this.#pos + 1] = value >> 8 & 255;
          this.#buffer[this.#pos + 2] = value >> 16 & 255;
          this.#buffer[this.#pos + 3] = value >> 24 & 255;
          this.#pos += 4;
          return this;
        }
        writeUInt32BE(value) {
          this.#ensureCapacity(4);
          this.#buffer[this.#pos] = value >> 24 & 255;
          this.#buffer[this.#pos + 1] = value >> 16 & 255;
          this.#buffer[this.#pos + 2] = value >> 8 & 255;
          this.#buffer[this.#pos + 3] = value & 255;
          this.#pos += 4;
          return this;
        }
        writeInt32LE(value) {
          this.writeUInt32LE(value >>> 0);
          return this;
        }
        writeInt32BE(value) {
          this.writeUInt32BE(value >>> 0);
          return this;
        }
        writeUInt64BEBn(bn) {
          const buf = bn.toArray("be", 8);
          this.write(buf);
          return this;
        }
        writeUInt64LEBn(bn) {
          const buf = bn.toArray("be", 8);
          this.writeReverse(buf);
          return this;
        }
        writeUInt64LE(n) {
          const buf = new BigNumber(n).toArray("be", 8);
          this.writeReverse(buf);
          return this;
        }
        writeVarIntNum(n) {
          const buf = Writer.varIntNum(n);
          this.write(buf);
          return this;
        }
        writeVarIntBn(bn) {
          const buf = Writer.varIntBn(bn);
          this.write(buf);
          return this;
        }
        /**
         * Resets the writer to empty state (reuses the buffer)
         */
        reset() {
          this.#pos = 0;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ReaderUint8Array.js
  var ReaderUint8Array;
  var init_ReaderUint8Array = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/ReaderUint8Array.js"() {
      init_BigNumber();
      init_utils();
      init_readVarIntNumStrict();
      ReaderUint8Array = class _ReaderUint8Array {
        bin;
        pos;
        #length;
        static makeReader(bin, pos = 0) {
          if (bin instanceof Uint8Array) {
            return new _ReaderUint8Array(bin, pos);
          }
          if (Array.isArray(bin)) {
            return new Reader(bin, pos);
          }
          throw new Error("ReaderUint8Array.makeReader: bin must be Uint8Array or number[]");
        }
        constructor(bin = new Uint8Array(0), pos = 0) {
          if (bin instanceof Uint8Array) {
            this.bin = bin;
          } else if (Array.isArray(bin)) {
            this.bin = new Uint8Array(bin);
          } else {
            throw new TypeError("ReaderUint8Array constructor: bin must be Uint8Array or number[]");
          }
          this.#length = this.bin.length;
          if (!Number.isSafeInteger(pos) || pos < 0 || pos > this.#length) {
            throw new RangeError("ReaderUint8Array position exceeds available data");
          }
          this.pos = pos;
        }
        #ensureAvailable(len) {
          if (!Number.isSafeInteger(len) || len < 0 || !Number.isSafeInteger(this.pos) || this.pos < 0 || this.pos + len > this.#length) {
            throw new RangeError("ReaderUint8Array read exceeds available data");
          }
        }
        eof() {
          return this.pos >= this.#length;
        }
        read(len = this.#length - this.pos) {
          this.#ensureAvailable(len);
          const start = this.pos;
          const end = this.pos + len;
          this.pos = end;
          return this.bin.slice(start, end);
        }
        /**
         * Reads a zero-copy view over the backing buffer. The view is valid for the
         * lifetime of the backing `Uint8Array`; callers that require isolation should
         * continue to use {@link read}.
         */
        readView(len = this.#length - this.pos) {
          this.#ensureAvailable(len);
          const start = this.pos;
          this.pos += len;
          return this.bin.subarray(start, this.pos);
        }
        /** Advances without allocating. */
        skip(len) {
          this.#ensureAvailable(len);
          this.pos += len;
        }
        remaining() {
          return this.#length - this.pos;
        }
        readReverse(len = this.#length - this.pos) {
          this.#ensureAvailable(len);
          const buf2 = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            buf2[i] = this.bin[this.pos + len - 1 - i];
          }
          this.pos += len;
          return buf2;
        }
        readUInt8() {
          this.#ensureAvailable(1);
          const val = this.bin[this.pos];
          this.pos += 1;
          return val;
        }
        readInt8() {
          const val = this.readUInt8();
          return (val & 128) === 0 ? val : val - 256;
        }
        readUInt16BE() {
          this.#ensureAvailable(2);
          const val = this.bin[this.pos] << 8 | this.bin[this.pos + 1];
          this.pos += 2;
          return val;
        }
        readInt16BE() {
          const val = this.readUInt16BE();
          return (val & 32768) === 0 ? val : val - 65536;
        }
        readUInt16LE() {
          this.#ensureAvailable(2);
          const val = this.bin[this.pos] | this.bin[this.pos + 1] << 8;
          this.pos += 2;
          return val;
        }
        readInt16LE() {
          const val = this.readUInt16LE();
          const x = (val & 32768) === 0 ? val : val - 65536;
          return x;
        }
        readUInt32BE() {
          this.#ensureAvailable(4);
          const val = this.bin[this.pos] * 16777216 + // Shift the first byte by 24 bits
          (this.bin[this.pos + 1] << 16 | // Shift the second byte by 16 bits
          this.bin[this.pos + 2] << 8 | // Shift the third byte by 8 bits
          this.bin[this.pos + 3]);
          this.pos += 4;
          return val;
        }
        readInt32BE() {
          const val = this.readUInt32BE();
          return (val & 2147483648) === 0 ? val : val - 4294967296;
        }
        readUInt32LE() {
          this.#ensureAvailable(4);
          const val = (this.bin[this.pos] | this.bin[this.pos + 1] << 8 | this.bin[this.pos + 2] << 16 | this.bin[this.pos + 3] << 24) >>> 0;
          this.pos += 4;
          return val;
        }
        readInt32LE() {
          const val = this.readUInt32LE();
          return (val & 2147483648) === 0 ? val : val - 4294967296;
        }
        readUInt64BEBn() {
          this.#ensureAvailable(8);
          const bin = Array.from(this.bin.slice(this.pos, this.pos + 8));
          const bn = new BigNumber(bin);
          this.pos = this.pos + 8;
          return bn;
        }
        readUInt64LEBn() {
          const bin = Array.from(this.readReverse(8));
          const bn = new BigNumber(bin);
          return bn;
        }
        readInt64LEBn() {
          const OverflowInt642 = new BigNumber(2).pow(new BigNumber(63));
          const OverflowUint642 = new BigNumber(2).pow(new BigNumber(64));
          const bin = Array.from(this.readReverse(8));
          let bn = new BigNumber(bin);
          if (bn.gte(OverflowInt642)) {
            bn = bn.sub(OverflowUint642);
          }
          return bn;
        }
        readVarIntNum(signed = true) {
          const first = this.readUInt8();
          let bn;
          switch (first) {
            case 253:
              return this.readUInt16LE();
            case 254:
              return this.readUInt32LE();
            case 255:
              bn = signed ? this.readInt64LEBn() : this.readUInt64LEBn();
              if (bn.lte(new BigNumber(2).pow(new BigNumber(53)))) {
                return bn.toNumber();
              } else {
                throw new Error("number too large to retain precision - use readVarIntBn");
              }
            default:
              return first;
          }
        }
        /**
         * Reads a canonical CompactSize value that can be represented exactly by
         * JavaScript. The legacy `-1` sentinel is accepted when `signed` is true;
         * pass `false` for untrusted lengths, counts, and indexes.
         */
        readVarIntNumStrict(signed = true) {
          return readVarIntNumStrict(this, signed);
        }
        readVarInt() {
          const first = this.bin[this.pos];
          switch (first) {
            case 253:
              return this.read(1 + 2);
            case 254:
              return this.read(1 + 4);
            case 255:
              return this.read(1 + 8);
            default:
              return this.read(1);
          }
        }
        readVarIntBn() {
          const first = this.readUInt8();
          switch (first) {
            case 253:
              return new BigNumber(this.readUInt16LE());
            case 254:
              return new BigNumber(this.readUInt32LE());
            case 255:
              return this.readUInt64LEBn();
            default:
              return new BigNumber(first);
          }
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/utils.js
  var utils_exports = {};
  __export(utils_exports, {
    Reader: () => Reader,
    ReaderUint8Array: () => ReaderUint8Array,
    Writer: () => Writer,
    WriterUint8Array: () => WriterUint8Array,
    base64ToArray: () => base64ToArray,
    constantTimeEquals: () => constantTimeEquals,
    encode: () => encode,
    fromBase58: () => fromBase58,
    fromBase58Check: () => fromBase58Check,
    hexToUint8Array: () => hexToUint8Array,
    minimallyEncode: () => minimallyEncode,
    toArray: () => toArray2,
    toBase58: () => toBase58,
    toBase58Check: () => toBase58Check,
    toBase64: () => toBase64,
    toHex: () => toHex,
    toSafeString: () => toSafeString,
    toUTF8: () => toUTF8,
    toUTF8Strict: () => toUTF8Strict,
    toUint8Array: () => toUint8Array,
    verifyNotNull: () => verifyNotNull,
    zero2: () => zero2
  });
  function base64ToArray(msg) {
    const s2 = normalizeBase64(msg);
    const result = [];
    let bitBuffer = 0;
    let bitCount = 0;
    for (let i = 0; i < s2.length; i++) {
      const c = s2.codePointAt(i);
      const v = base64CharacterValue(c, i);
      bitBuffer = bitBuffer << 6 | v;
      bitCount += 6;
      while (bitCount >= 8) {
        bitCount -= 8;
        result.push(bitBuffer >> bitCount & 255);
        bitBuffer &= (1 << bitCount) - 1;
      }
    }
    return result;
  }
  function utf8ToArray(str) {
    return Array.from(utf8Bytes(str));
  }
  function toBase64(byteArray) {
    const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i;
    for (i = 0; i < byteArray.length; i += 3) {
      const byte1 = byteArray[i];
      const byte2 = i + 1 < byteArray.length ? byteArray[i + 1] : 0;
      const byte3 = i + 2 < byteArray.length ? byteArray[i + 2] : 0;
      const encoded1 = byte1 >> 2;
      const encoded2 = (byte1 & 3) << 4 | byte2 >> 4;
      const encoded3 = (byte2 & 15) << 2 | byte3 >> 6;
      const encoded4 = byte3 & 63;
      result += base64Chars.charAt(encoded1) + base64Chars.charAt(encoded2);
      result += i + 1 < byteArray.length ? base64Chars.charAt(encoded3) : "=";
      result += i + 2 < byteArray.length ? base64Chars.charAt(encoded4) : "=";
    }
    return result;
  }
  function verifyNotNull(value, errorMessage = "Expected a valid value, but got undefined or null.") {
    if (value == null)
      throw new Error(errorMessage);
    return value;
  }
  function constantTimeEquals(a, b) {
    if (a.length !== b.length)
      return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff === 0;
  }
  var BufferCtor3, CAN_USE_BUFFER3, toSafeString, zero2, HEX_DIGITS2, HEX_BYTE_STRINGS2, toHex, toUint8Array, toArray2, HEX_CHAR_TO_VALUE2, hexToArray, hexToUint8Array, normalizeBase64, base64CharacterValue, toUTF8, toUTF8Strict, encode, base58chars, fromBase58, toBase58, toBase58Check, fromBase58Check, Writer, Reader, minimallyEncode, OverflowInt64, OverflowUint64;
  var init_utils = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/utils.js"() {
      init_BigNumber();
      init_UTF8();
      init_Hash();
      init_hex();
      init_readVarIntNumStrict();
      init_WriterUint8Array();
      init_ReaderUint8Array();
      BufferCtor3 = globalThis.Buffer;
      CAN_USE_BUFFER3 = BufferCtor3 != null && typeof BufferCtor3.from === "function";
      toSafeString = (value, fallback = "Unknown value") => {
        if (value === null)
          return "null";
        if (value === void 0)
          return "undefined";
        if (typeof value === "string")
          return value;
        if (typeof value === "number" || typeof value === "bigint")
          return value.toString();
        if (typeof value === "boolean")
          return value ? "true" : "false";
        if (typeof value === "symbol")
          return value.description ?? value.toString();
        if (value instanceof Error && value.message.length > 0)
          return value.message;
        const message = value.message;
        if (typeof message === "string" && message.length > 0)
          return message;
        try {
          return JSON.stringify(value) ?? fallback;
        } catch {
          return fallback;
        }
      };
      zero2 = (word) => {
        if (word.length % 2 === 1) {
          return "0" + word;
        } else {
          return word;
        }
      };
      HEX_DIGITS2 = "0123456789abcdef";
      HEX_BYTE_STRINGS2 = Array.from({ length: 256 }, () => "");
      for (let i = 0; i < 256; i++) {
        HEX_BYTE_STRINGS2[i] = HEX_DIGITS2[i >> 4 & 15] + HEX_DIGITS2[i & 15];
      }
      toHex = (msg) => {
        if (CAN_USE_BUFFER3) {
          return BufferCtor3.from(msg).toString("hex");
        }
        if (msg.length === 0)
          return "";
        return Array.from(msg, (byte) => HEX_BYTE_STRINGS2[byte & 255]).join("");
      };
      toUint8Array = (msg, enc) => {
        if (msg instanceof Uint8Array)
          return msg;
        if (typeof msg === "string" && enc === "hex")
          return hexToUint8Array(msg);
        return new Uint8Array(toArray2(msg, enc));
      };
      toArray2 = (msg, enc) => {
        if (Array.isArray(msg))
          return msg.slice();
        if (msg === void 0)
          return [];
        if (typeof msg !== "string") {
          return Array.from(msg, (item) => Math.trunc(item));
        }
        switch (enc) {
          case "hex":
            return hexToArray(msg);
          case "base64":
            return base64ToArray(msg);
          default:
            return utf8ToArray(msg);
        }
      };
      HEX_CHAR_TO_VALUE2 = new Int8Array(256).fill(-1);
      for (let i = 0; i < 10; i++) {
        HEX_CHAR_TO_VALUE2[48 + i] = i;
      }
      for (let i = 0; i < 6; i++) {
        HEX_CHAR_TO_VALUE2[65 + i] = 10 + i;
        HEX_CHAR_TO_VALUE2[97 + i] = 10 + i;
      }
      hexToArray = (msg) => {
        return Array.from(hexToUint8Array(msg));
      };
      hexToUint8Array = (msg) => {
        assertValidHex(msg);
        const normalized = msg.length % 2 === 0 ? msg : "0" + msg;
        if (CAN_USE_BUFFER3) {
          const decoded = BufferCtor3.from(normalized, "hex");
          return new Uint8Array(decoded.buffer, decoded.byteOffset, decoded.byteLength);
        }
        const out = new Uint8Array(normalized.length / 2);
        let o = 0;
        for (let i = 0; i < normalized.length; i += 2) {
          const hi = HEX_CHAR_TO_VALUE2[normalized.codePointAt(i)];
          const lo = HEX_CHAR_TO_VALUE2[normalized.codePointAt(i + 1)];
          out[o++] = hi << 4 | lo;
        }
        return out;
      };
      normalizeBase64 = (msg) => {
        if (typeof msg !== "string")
          throw new TypeError("msg must be a string");
        const normalized = msg.trim().replaceAll(/[\r\n\t\f\v ]+/g, "").replaceAll("-", "+").replaceAll("_", "/");
        const padIndex = normalized.indexOf("=");
        if (padIndex === -1)
          return normalized;
        const pad = normalized.slice(padIndex);
        if (!/^={1,2}$/.test(pad) || normalized.slice(0, padIndex).includes("=")) {
          throw new Error("Invalid base64 padding");
        }
        return normalized.slice(0, padIndex);
      };
      base64CharacterValue = (codePoint, index) => {
        if (codePoint >= 65 && codePoint <= 90)
          return codePoint - 65;
        if (codePoint >= 97 && codePoint <= 122)
          return codePoint - 97 + 26;
        if (codePoint >= 48 && codePoint <= 57)
          return codePoint - 48 + 52;
        if (codePoint === 43)
          return 62;
        if (codePoint === 47)
          return 63;
        throw new Error(`Invalid base64 character at index ${index}`);
      };
      toUTF8 = (arr) => {
        return new TextDecoder().decode(arr instanceof Uint8Array ? arr : new Uint8Array(arr));
      };
      toUTF8Strict = (arr) => {
        return new TextDecoder("utf-8", { fatal: true }).decode(arr instanceof Uint8Array ? arr : new Uint8Array(arr));
      };
      encode = (arr, enc) => {
        switch (enc) {
          case "hex":
            return toHex(arr);
          case "utf8":
            return toUTF8(arr);
          // If no encoding is provided, return the original array
          default:
            return arr;
        }
      };
      base58chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      fromBase58 = (str) => {
        if (str === "" || typeof str !== "string") {
          throw new Error(`Expected base58 string but got \u201C${str}\u201D`);
        }
        const match = str.match(/[^1-9A-HJ-NP-Za-km-z]/gmu);
        if (match !== null) {
          throw new Error(`Invalid base58 character \u201C${match.join("")}\u201D`);
        }
        const lz = str.match(/^1+/gmu);
        const psz = lz === null ? 0 : lz[0].length;
        const size = (str.length - psz) * (Math.log(58) / Math.log(256)) + 1 >>> 0;
        const uint8 = new Uint8Array([
          ...new Uint8Array(psz),
          ...Array.from(str).map((i) => base58chars.indexOf(i)).reduce((acc, i) => {
            acc = acc.map((j) => {
              const x = j * 58 + i;
              i = x >> 8;
              return x;
            });
            return acc;
          }, new Uint8Array(size)).reverse().filter(/* @__PURE__ */ ((lastValue) => (value) => (
            // @ts-expect-error
            lastValue = lastValue || value
          ))(false))
        ]);
        return [...uint8];
      };
      toBase58 = (bin) => {
        const base58Map = Array.from({ length: 256 }, () => -1);
        for (let i = 0; i < base58chars.length; ++i) {
          base58Map[base58chars.codePointAt(i)] = i;
        }
        const result = [];
        for (const byte of bin) {
          let carry = byte;
          for (let j = 0; j < result.length; ++j) {
            const x = (base58Map[result[j]] << 8) + carry;
            const quotient = Math.trunc(x / 58);
            const remainder = x - quotient * 58;
            result[j] = base58chars.codePointAt(remainder);
            carry = quotient;
          }
          while (carry !== 0) {
            const quotient = Math.trunc(carry / 58);
            const remainder = carry - quotient * 58;
            result.push(base58chars.codePointAt(remainder));
            carry = quotient;
          }
        }
        for (const byte of bin) {
          if (byte === 0)
            result.push("1".codePointAt(0));
          else
            break;
        }
        result.reverse();
        return String.fromCodePoint(...result);
      };
      toBase58Check = (bin, prefix = [0]) => {
        let hash = hash256([...prefix, ...bin]);
        hash = [...prefix, ...bin, ...hash.slice(0, 4)];
        return toBase58(hash);
      };
      fromBase58Check = (str, enc, prefixLength = 1) => {
        const bin = fromBase58(str);
        let prefix = bin.slice(0, prefixLength);
        let data = bin.slice(prefixLength, -4);
        let hash = [...prefix, ...data];
        hash = hash256(hash);
        bin.slice(-4).forEach((check, index) => {
          if (check !== hash[index]) {
            throw new Error("Invalid checksum");
          }
        });
        if (enc === "hex") {
          prefix = toHex(prefix);
          data = toHex(data);
        }
        return { prefix, data };
      };
      Writer = class _Writer {
        bufs;
        length;
        constructor(bufs) {
          this.bufs = bufs ?? [];
          this.length = 0;
          for (const b of this.bufs)
            this.length += b.length;
        }
        getLength() {
          return this.length;
        }
        toUint8Array() {
          const out = new Uint8Array(this.length);
          let offset = 0;
          for (const buf of this.bufs) {
            out.set(buf, offset);
            offset += buf.length;
          }
          return out;
        }
        toArray() {
          const totalLength = this.length;
          const ret = Array.from({ length: totalLength }, () => 0);
          let offset = 0;
          for (const buf of this.bufs) {
            if (buf instanceof Uint8Array) {
              for (const byte of buf) {
                ret[offset++] = byte;
              }
            } else {
              const arr = buf;
              for (const item of arr) {
                ret[offset++] = item;
              }
            }
          }
          return ret;
        }
        toHex() {
          return this.toArray().map((n) => n.toString(16).padStart(2, "0")).join("");
        }
        write(buf) {
          this.bufs.push(buf);
          this.length += buf.length;
          return this;
        }
        writeReverse(buf) {
          const buf2 = Array.from({ length: buf.length }, () => 0);
          for (let i = 0; i < buf2.length; i++) {
            buf2[i] = buf[buf.length - 1 - i];
          }
          return this.write(buf2);
        }
        writeUInt8(n) {
          const buf = Array.from({ length: 1 }, () => 0);
          buf[0] = n & 255;
          this.write(buf);
          return this;
        }
        writeInt8(n) {
          return this.writeUInt8(n);
        }
        writeUInt16BE(n) {
          const buf = [
            n >> 8 & 255,
            // shift right 8 bits to get the high byte
            n & 255
            // low byte is just the last 8 bits
          ];
          return this.write(buf);
        }
        writeInt16BE(n) {
          return this.writeUInt16BE(n & 65535);
        }
        writeUInt16LE(n) {
          const buf = [
            n & 255,
            // low byte is just the last 8 bits
            n >> 8 & 255
            // shift right 8 bits to get the high byte
          ];
          return this.write(buf);
        }
        writeInt16LE(n) {
          return this.writeUInt16LE(n & 65535);
        }
        writeUInt32BE(n) {
          const buf = [
            n >> 24 & 255,
            // highest byte
            n >> 16 & 255,
            n >> 8 & 255,
            n & 255
            // lowest byte
          ];
          return this.write(buf);
        }
        writeInt32BE(n) {
          return this.writeUInt32BE(n >>> 0);
        }
        writeUInt32LE(n) {
          const buf = [
            n & 255,
            // lowest byte
            n >> 8 & 255,
            n >> 16 & 255,
            n >> 24 & 255
            // highest byte
          ];
          return this.write(buf);
        }
        writeInt32LE(n) {
          return this.writeUInt32LE(n >>> 0);
        }
        writeUInt64BEBn(bn) {
          const buf = bn.toArray("be", 8);
          this.write(buf);
          return this;
        }
        writeUInt64LEBn(bn) {
          const buf = bn.toArray("be", 8);
          this.writeReverse(buf);
          return this;
        }
        writeUInt64LE(n) {
          if (n === -1) {
            this.write(Array.from({ length: 8 }, () => 255));
          } else {
            const buf = new BigNumber(n).toArray("be", 8);
            this.writeReverse(buf);
          }
          return this;
        }
        writeVarIntNum(n) {
          const buf = _Writer.varIntNum(n);
          this.write(buf);
          return this;
        }
        writeVarIntBn(bn) {
          const buf = _Writer.varIntBn(bn);
          this.write(buf);
          return this;
        }
        static varIntNum(n) {
          if (!Number.isFinite(n) || !Number.isInteger(n)) {
            throw new RangeError("CompactSize value must be a finite integer");
          }
          let buf;
          if (n < 0) {
            return this.varIntBn(new BigNumber(n));
          }
          if (n < 253) {
            buf = [n];
          } else if (n < 65536) {
            buf = [
              253,
              // 0xfd
              n & 255,
              // low byte
              n >> 8 & 255
              // high byte
            ];
          } else if (n < 4294967296) {
            buf = [
              254,
              // 0xfe
              n & 255,
              n >> 8 & 255,
              n >> 16 & 255,
              n >> 24 & 255
            ];
          } else {
            const low = n & 4294967295;
            const high = Math.floor(n / 4294967296) & 4294967295;
            buf = [
              255,
              // 0xff
              low & 255,
              low >> 8 & 255,
              low >> 16 & 255,
              low >> 24 & 255,
              high & 255,
              high >> 8 & 255,
              high >> 16 & 255,
              high >> 24 & 255
            ];
          }
          return buf;
        }
        static varIntBn(bn) {
          let buf;
          if (bn.isNeg()) {
            bn = bn.add(OverflowUint64);
          }
          if (bn.ltn(253)) {
            const n = bn.toNumber();
            buf = [n];
          } else if (bn.ltn(65536)) {
            const n = bn.toNumber();
            buf = [253, n & 255, n >> 8 & 255];
          } else if (bn.lt(new BigNumber(4294967296))) {
            const n = bn.toNumber();
            buf = [254, n & 255, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255];
          } else {
            const bw = new _Writer();
            bw.writeUInt8(255);
            bw.writeUInt64LEBn(bn);
            buf = bw.toArray();
          }
          return buf;
        }
      };
      Reader = class {
        bin;
        pos;
        length;
        constructor(bin = [], pos = 0) {
          this.bin = bin;
          this.length = bin.length;
          if (!Number.isSafeInteger(pos) || pos < 0 || pos > this.length) {
            throw new RangeError("Reader position exceeds available data");
          }
          this.pos = pos;
        }
        ensureAvailable(len) {
          if (!Number.isSafeInteger(len) || len < 0 || !Number.isSafeInteger(this.pos) || this.pos < 0 || this.pos + len > this.length) {
            throw new RangeError("Reader read exceeds available data");
          }
        }
        eof() {
          return this.pos >= this.length;
        }
        read(len = this.length - this.pos) {
          this.ensureAvailable(len);
          const start = this.pos;
          const end = this.pos + len;
          this.pos = end;
          return this.bin.slice(start, end);
        }
        readReverse(len = this.length - this.pos) {
          this.ensureAvailable(len);
          const buf2 = Array.from({ length: len }, () => 0);
          for (let i = 0; i < len; i++) {
            buf2[i] = this.bin[this.pos + len - 1 - i];
          }
          this.pos += len;
          return buf2;
        }
        readUInt8() {
          this.ensureAvailable(1);
          const val = this.bin[this.pos];
          this.pos += 1;
          return val;
        }
        readInt8() {
          const val = this.readUInt8();
          return (val & 128) === 0 ? val : val - 256;
        }
        readUInt16BE() {
          this.ensureAvailable(2);
          const val = this.bin[this.pos] << 8 | this.bin[this.pos + 1];
          this.pos += 2;
          return val;
        }
        readInt16BE() {
          const val = this.readUInt16BE();
          return (val & 32768) === 0 ? val : val - 65536;
        }
        readUInt16LE() {
          this.ensureAvailable(2);
          const val = this.bin[this.pos] | this.bin[this.pos + 1] << 8;
          this.pos += 2;
          return val;
        }
        readInt16LE() {
          const val = this.readUInt16LE();
          const x = (val & 32768) === 0 ? val : val - 65536;
          return x;
        }
        readUInt32BE() {
          this.ensureAvailable(4);
          const val = this.bin[this.pos] * 16777216 + // Shift the first byte by 24 bits
          (this.bin[this.pos + 1] << 16 | // Shift the second byte by 16 bits
          this.bin[this.pos + 2] << 8 | // Shift the third byte by 8 bits
          this.bin[this.pos + 3]);
          this.pos += 4;
          return val;
        }
        readInt32BE() {
          const val = this.readUInt32BE();
          return (val & 2147483648) === 0 ? val : val - 4294967296;
        }
        readUInt32LE() {
          this.ensureAvailable(4);
          const val = (this.bin[this.pos] | this.bin[this.pos + 1] << 8 | this.bin[this.pos + 2] << 16 | this.bin[this.pos + 3] << 24) >>> 0;
          this.pos += 4;
          return val;
        }
        readInt32LE() {
          const val = this.readUInt32LE();
          return (val & 2147483648) === 0 ? val : val - 4294967296;
        }
        readUInt64BEBn() {
          const bin = this.read(8);
          const bn = new BigNumber(bin);
          return bn;
        }
        readUInt64LEBn() {
          const bin = this.readReverse(8);
          const bn = new BigNumber(bin);
          return bn;
        }
        readInt64LEBn() {
          const bin = this.readReverse(8);
          let bn = new BigNumber(bin);
          if (bn.gte(OverflowInt64)) {
            bn = bn.sub(OverflowUint64);
          }
          return bn;
        }
        readVarIntNum(signed = true) {
          const first = this.readUInt8();
          let bn;
          switch (first) {
            case 253:
              return this.readUInt16LE();
            case 254:
              return this.readUInt32LE();
            case 255:
              bn = signed ? this.readInt64LEBn() : this.readUInt64LEBn();
              if (bn.lte(new BigNumber(2).pow(new BigNumber(53)))) {
                return bn.toNumber();
              } else {
                throw new Error("number too large to retain precision - use readVarIntBn");
              }
            default:
              return first;
          }
        }
        /**
         * Reads a canonical CompactSize value that can be represented exactly by
         * JavaScript. The legacy `-1` sentinel is accepted when `signed` is true;
         * pass `false` for untrusted lengths, counts, and indexes.
         */
        readVarIntNumStrict(signed = true) {
          return readVarIntNumStrict(this, signed);
        }
        readVarInt() {
          const first = this.bin[this.pos];
          switch (first) {
            case 253:
              return this.read(1 + 2);
            case 254:
              return this.read(1 + 4);
            case 255:
              return this.read(1 + 8);
            default:
              return this.read(1);
          }
        }
        readVarIntBn() {
          const first = this.readUInt8();
          switch (first) {
            case 253:
              return new BigNumber(this.readUInt16LE());
            case 254:
              return new BigNumber(this.readUInt32LE());
            case 255:
              return this.readUInt64LEBn();
            default:
              return new BigNumber(first);
          }
        }
      };
      minimallyEncode = (buf) => {
        if (buf.length === 0) {
          return buf;
        }
        const last = buf.at(-1);
        if ((last & 127) !== 0) {
          return buf;
        }
        if (buf.length === 1) {
          return [];
        }
        if ((buf.at(-2) & 128) !== 0) {
          return buf;
        }
        for (let i = buf.length - 1; i > 0; i--) {
          if (buf[i - 1] !== 0) {
            if ((buf[i - 1] & 128) === 0) {
              buf[i - 1] |= last;
              return buf.slice(0, i);
            } else {
              buf[i] = last;
              return buf.slice(0, i + 1);
            }
          }
        }
        return [];
      };
      OverflowInt64 = new BigNumber(2).pow(new BigNumber(63));
      OverflowUint64 = new BigNumber(2).pow(new BigNumber(64));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Curve.js
  function normalizedMod4(value, carry) {
    const mod4 = value.andln(3) + carry & 3;
    return mod4 === 3 ? -1 : mod4;
  }
  function jsfDigit(value, carry, mod4, otherMod4) {
    if ((mod4 & 1) === 0)
      return 0;
    const mod8 = value.andln(7) + carry & 7;
    return (mod8 === 3 || mod8 === 5) && otherMod4 === 2 ? -mod4 : mod4;
  }
  function nextJsfCarry(carry, digit) {
    return 2 * carry === digit + 1 ? 1 - carry : carry;
  }
  var globalCurve, Curve;
  var init_Curve = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Curve.js"() {
      init_BigNumber();
      init_ReductionContext();
      init_MontgomoryMethod();
      init_Point();
      init_utils();
      Curve = class _Curve {
        p;
        red;
        redN;
        zero;
        one;
        two;
        g;
        n;
        a;
        b;
        tinv;
        zeroA;
        threeA;
        endo;
        // beta, lambda, basis
        _endoWnafT1;
        _endoWnafT2;
        _wnafT1;
        _wnafT2;
        _wnafT3;
        _wnafT4;
        _bitLength;
        // Represent num in a w-NAF form
        static assert(expression, message = "Elliptic curve assertion failed") {
          if (!expression) {
            throw new Error(message);
          }
        }
        getNAF(num, w, bits) {
          const naf = Array.from({ length: Math.max(num.bitLength(), bits) + 1 }, () => 0);
          naf.fill(0);
          const ws = 1 << w + 1;
          const k = num.clone();
          for (let i = 0; i < naf.length; i++) {
            let z;
            const mod = k.andln(ws - 1);
            if (k.isOdd()) {
              if (mod > (ws >> 1) - 1) {
                z = (ws >> 1) - mod;
              } else {
                z = mod;
              }
              k.isubn(z);
            } else {
              z = 0;
            }
            naf[i] = z;
            k.iushrn(1);
          }
          return naf;
        }
        // Represent k1, k2 in a Joint Sparse Form
        getJSF(k1, k2) {
          const jsf = [[], []];
          k1 = k1.clone();
          k2 = k2.clone();
          let d1 = 0;
          let d2 = 0;
          while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {
            const m14 = normalizedMod4(k1, d1);
            const m24 = normalizedMod4(k2, d2);
            const u1 = jsfDigit(k1, d1, m14, m24);
            jsf[0].push(u1);
            const u2 = jsfDigit(k2, d2, m24, m14);
            jsf[1].push(u2);
            d1 = nextJsfCarry(d1, u1);
            d2 = nextJsfCarry(d2, u2);
            k1.iushrn(1);
            k2.iushrn(1);
          }
          return jsf;
        }
        static cachedProperty(obj, name, computer) {
          const key = "_" + name;
          obj.prototype[name] = function cachedProperty() {
            if (this[key] === void 0) {
              this[key] = computer.call(this);
            }
            return this[key];
          };
        }
        static parseBytes(bytes3) {
          return typeof bytes3 === "string" ? toArray2(bytes3, "hex") : bytes3;
        }
        static intFromLE(bytes3) {
          return new BigNumber(bytes3, "hex", "le");
        }
        constructor() {
          if (globalCurve === void 0) {
            globalCurve = this;
          } else {
            return globalCurve;
          }
          const precomputed = {
            doubles: {
              step: 4,
              points: [
                [
                  "e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a",
                  "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821"
                ],
                [
                  "8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508",
                  "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf"
                ],
                [
                  "175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739",
                  "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695"
                ],
                [
                  "363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640",
                  "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9"
                ],
                [
                  "8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c",
                  "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36"
                ],
                [
                  "723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda",
                  "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f"
                ],
                [
                  "eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa",
                  "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999"
                ],
                [
                  "100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0",
                  "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09"
                ],
                [
                  "e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d",
                  "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d"
                ],
                [
                  "feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d",
                  "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088"
                ],
                [
                  "da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1",
                  "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d"
                ],
                [
                  "53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0",
                  "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8"
                ],
                [
                  "8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047",
                  "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a"
                ],
                [
                  "385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862",
                  "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453"
                ],
                [
                  "6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7",
                  "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160"
                ],
                [
                  "3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd",
                  "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0"
                ],
                [
                  "85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83",
                  "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6"
                ],
                [
                  "948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a",
                  "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589"
                ],
                [
                  "6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8",
                  "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17"
                ],
                [
                  "e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d",
                  "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda"
                ],
                [
                  "e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725",
                  "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd"
                ],
                [
                  "213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754",
                  "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2"
                ],
                [
                  "4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c",
                  "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6"
                ],
                [
                  "fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6",
                  "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f"
                ],
                [
                  "76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39",
                  "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01"
                ],
                [
                  "c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891",
                  "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3"
                ],
                [
                  "d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b",
                  "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f"
                ],
                [
                  "b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03",
                  "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7"
                ],
                [
                  "e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d",
                  "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78"
                ],
                [
                  "a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070",
                  "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1"
                ],
                [
                  "90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4",
                  "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150"
                ],
                [
                  "8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da",
                  "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82"
                ],
                [
                  "e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11",
                  "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc"
                ],
                [
                  "8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e",
                  "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b"
                ],
                [
                  "e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41",
                  "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51"
                ],
                [
                  "b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef",
                  "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45"
                ],
                [
                  "d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8",
                  "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120"
                ],
                [
                  "324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d",
                  "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84"
                ],
                [
                  "4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96",
                  "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d"
                ],
                [
                  "9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd",
                  "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d"
                ],
                [
                  "6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5",
                  "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8"
                ],
                [
                  "a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266",
                  "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8"
                ],
                [
                  "7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71",
                  "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac"
                ],
                [
                  "928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac",
                  "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f"
                ],
                [
                  "85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751",
                  "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962"
                ],
                [
                  "ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e",
                  "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907"
                ],
                [
                  "827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241",
                  "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec"
                ],
                [
                  "eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3",
                  "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d"
                ],
                [
                  "e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f",
                  "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414"
                ],
                [
                  "1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19",
                  "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd"
                ],
                [
                  "146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be",
                  "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0"
                ],
                [
                  "fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9",
                  "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811"
                ],
                [
                  "da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2",
                  "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1"
                ],
                [
                  "a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13",
                  "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c"
                ],
                [
                  "174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c",
                  "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73"
                ],
                [
                  "959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba",
                  "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd"
                ],
                [
                  "d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151",
                  "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405"
                ],
                [
                  "64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073",
                  "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589"
                ],
                [
                  "8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458",
                  "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e"
                ],
                [
                  "13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b",
                  "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27"
                ],
                [
                  "bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366",
                  "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1"
                ],
                [
                  "8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa",
                  "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482"
                ],
                [
                  "8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0",
                  "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945"
                ],
                [
                  "dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787",
                  "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573"
                ],
                [
                  "f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e",
                  "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82"
                ]
              ]
            },
            naf: {
              wnd: 7,
              points: [
                [
                  "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
                  "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672"
                ],
                [
                  "2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
                  "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6"
                ],
                [
                  "5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc",
                  "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da"
                ],
                [
                  "acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe",
                  "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37"
                ],
                [
                  "774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb",
                  "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b"
                ],
                [
                  "f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8",
                  "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81"
                ],
                [
                  "d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e",
                  "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58"
                ],
                [
                  "defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34",
                  "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77"
                ],
                [
                  "2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c",
                  "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a"
                ],
                [
                  "352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5",
                  "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c"
                ],
                [
                  "2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f",
                  "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67"
                ],
                [
                  "9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714",
                  "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402"
                ],
                [
                  "daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729",
                  "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55"
                ],
                [
                  "c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db",
                  "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482"
                ],
                [
                  "6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4",
                  "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82"
                ],
                [
                  "1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5",
                  "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396"
                ],
                [
                  "605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479",
                  "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49"
                ],
                [
                  "62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d",
                  "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf"
                ],
                [
                  "80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f",
                  "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a"
                ],
                [
                  "7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb",
                  "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7"
                ],
                [
                  "d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9",
                  "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933"
                ],
                [
                  "49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963",
                  "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a"
                ],
                [
                  "77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74",
                  "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6"
                ],
                [
                  "f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530",
                  "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37"
                ],
                [
                  "463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b",
                  "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e"
                ],
                [
                  "f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247",
                  "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6"
                ],
                [
                  "caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1",
                  "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476"
                ],
                [
                  "2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120",
                  "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40"
                ],
                [
                  "7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435",
                  "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61"
                ],
                [
                  "754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18",
                  "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683"
                ],
                [
                  "e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8",
                  "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5"
                ],
                [
                  "186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb",
                  "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b"
                ],
                [
                  "df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f",
                  "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417"
                ],
                [
                  "5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143",
                  "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868"
                ],
                [
                  "290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba",
                  "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a"
                ],
                [
                  "af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45",
                  "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6"
                ],
                [
                  "766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a",
                  "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996"
                ],
                [
                  "59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e",
                  "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e"
                ],
                [
                  "f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8",
                  "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d"
                ],
                [
                  "7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c",
                  "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2"
                ],
                [
                  "948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519",
                  "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e"
                ],
                [
                  "7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab",
                  "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437"
                ],
                [
                  "3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca",
                  "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311"
                ],
                [
                  "d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf",
                  "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4"
                ],
                [
                  "1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610",
                  "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575"
                ],
                [
                  "733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4",
                  "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d"
                ],
                [
                  "15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c",
                  "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d"
                ],
                [
                  "a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940",
                  "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629"
                ],
                [
                  "e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980",
                  "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06"
                ],
                [
                  "311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3",
                  "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374"
                ],
                [
                  "34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf",
                  "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee"
                ],
                [
                  "f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63",
                  "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1"
                ],
                [
                  "d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448",
                  "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b"
                ],
                [
                  "32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf",
                  "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661"
                ],
                [
                  "7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5",
                  "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6"
                ],
                [
                  "ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6",
                  "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e"
                ],
                [
                  "16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5",
                  "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d"
                ],
                [
                  "eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99",
                  "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc"
                ],
                [
                  "78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51",
                  "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4"
                ],
                [
                  "494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5",
                  "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c"
                ],
                [
                  "a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5",
                  "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b"
                ],
                [
                  "c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997",
                  "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913"
                ],
                [
                  "841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881",
                  "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154"
                ],
                [
                  "5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5",
                  "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865"
                ],
                [
                  "36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66",
                  "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc"
                ],
                [
                  "336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726",
                  "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224"
                ],
                [
                  "8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede",
                  "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e"
                ],
                [
                  "1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94",
                  "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6"
                ],
                [
                  "85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31",
                  "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511"
                ],
                [
                  "29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51",
                  "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b"
                ],
                [
                  "a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252",
                  "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2"
                ],
                [
                  "4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5",
                  "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c"
                ],
                [
                  "d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b",
                  "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3"
                ],
                [
                  "ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4",
                  "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d"
                ],
                [
                  "af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f",
                  "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700"
                ],
                [
                  "e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889",
                  "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4"
                ],
                [
                  "591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246",
                  "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196"
                ],
                [
                  "11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984",
                  "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4"
                ],
                [
                  "3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a",
                  "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257"
                ],
                [
                  "cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030",
                  "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13"
                ],
                [
                  "c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197",
                  "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096"
                ],
                [
                  "c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593",
                  "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38"
                ],
                [
                  "a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef",
                  "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f"
                ],
                [
                  "347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38",
                  "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448"
                ],
                [
                  "da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a",
                  "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a"
                ],
                [
                  "c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111",
                  "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4"
                ],
                [
                  "4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502",
                  "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437"
                ],
                [
                  "3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea",
                  "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7"
                ],
                [
                  "cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26",
                  "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d"
                ],
                [
                  "b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986",
                  "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a"
                ],
                [
                  "d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e",
                  "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54"
                ],
                [
                  "48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4",
                  "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77"
                ],
                [
                  "dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda",
                  "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517"
                ],
                [
                  "6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859",
                  "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10"
                ],
                [
                  "e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f",
                  "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125"
                ],
                [
                  "eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c",
                  "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e"
                ],
                [
                  "13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942",
                  "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1"
                ],
                [
                  "ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a",
                  "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2"
                ],
                [
                  "b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80",
                  "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423"
                ],
                [
                  "ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d",
                  "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8"
                ],
                [
                  "8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1",
                  "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758"
                ],
                [
                  "52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63",
                  "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375"
                ],
                [
                  "e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352",
                  "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d"
                ],
                [
                  "7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193",
                  "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec"
                ],
                [
                  "5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00",
                  "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0"
                ],
                [
                  "32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58",
                  "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c"
                ],
                [
                  "e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7",
                  "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4"
                ],
                [
                  "8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8",
                  "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f"
                ],
                [
                  "4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e",
                  "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649"
                ],
                [
                  "3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d",
                  "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826"
                ],
                [
                  "674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b",
                  "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5"
                ],
                [
                  "d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f",
                  "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87"
                ],
                [
                  "30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6",
                  "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b"
                ],
                [
                  "be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297",
                  "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc"
                ],
                [
                  "93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a",
                  "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c"
                ],
                [
                  "b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c",
                  "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f"
                ],
                [
                  "d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52",
                  "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a"
                ],
                [
                  "d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb",
                  "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46"
                ],
                [
                  "463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065",
                  "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f"
                ],
                [
                  "7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917",
                  "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03"
                ],
                [
                  "74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9",
                  "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08"
                ],
                [
                  "30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3",
                  "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8"
                ],
                [
                  "9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57",
                  "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373"
                ],
                [
                  "176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66",
                  "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3"
                ],
                [
                  "75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8",
                  "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8"
                ],
                [
                  "809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721",
                  "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1"
                ],
                [
                  "1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180",
                  "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9"
                ]
              ]
            }
          };
          const conf = {
            prime: "k256",
            p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
            a: "0",
            b: "7",
            n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
            h: "1",
            // Precomputed endomorphism
            beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
            lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
            basis: [
              {
                a: "3086d221a7d46bcde86c90e49284eb15",
                b: "-e4437ed6010e88286f547fa90abfe4c3"
              },
              {
                a: "114ca50f7a8e2f3f657c1108d9d44cfd8",
                b: "3086d221a7d46bcde86c90e49284eb15"
              }
            ],
            gRed: false,
            g: [
              "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
              "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
              precomputed
            ]
          };
          this.p = new BigNumber(conf.p, 16);
          this.red = new ReductionContext(conf.prime);
          this.zero = new BigNumber(0).toRed(this.red);
          this.one = new BigNumber(1).toRed(this.red);
          this.two = new BigNumber(2).toRed(this.red);
          this.n = new BigNumber(conf.n, 16);
          this.g = Point.fromJSON(conf.g, conf.gRed);
          this._wnafT1 = Array.from({ length: 4 }, () => void 0);
          this._wnafT2 = Array.from({ length: 4 }, () => void 0);
          this._wnafT3 = Array.from({ length: 4 }, () => void 0);
          this._wnafT4 = Array.from({ length: 4 }, () => void 0);
          this._bitLength = this.n.bitLength();
          this.redN = this.n.toRed(this.red);
          this.a = new BigNumber(conf.a, 16).toRed(this.red);
          this.b = new BigNumber(conf.b, 16).toRed(this.red);
          this.tinv = this.two.redInvm();
          this.zeroA = this.a.fromRed().cmpn(0) === 0;
          this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;
          this.endo = this._getEndomorphism(conf);
          this._endoWnafT1 = Array.from({ length: 4 }, () => void 0);
          this._endoWnafT2 = Array.from({ length: 4 }, () => void 0);
        }
        _getEndomorphism(conf) {
          if (!this.zeroA || this.p.modrn(3) !== 1) {
            return;
          }
          const beta = this._resolveEndomorphismBeta(conf);
          const lambda = this._resolveEndomorphismLambda(conf, beta);
          return {
            beta,
            lambda,
            basis: this.#_resolveEndomorphismBasis(conf, lambda)
          };
        }
        _resolveEndomorphismBeta(conf) {
          if (conf.beta !== void 0)
            return new BigNumber(conf.beta, 16).toRed(this.red);
          const betas = this._getEndoRoots(this.p);
          if (betas == null)
            throw new Error("Failed to get endomorphism roots for beta.");
          const beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
          return beta.toRed(this.red);
        }
        _endomorphismLambdaMatches(lambda, beta, requireCoordinates = false) {
          if (this.g == null)
            throw new Error("Curve generator point (g) is not defined.");
          const gMulX = this.g.mul(lambda)?.x;
          const gXRedMulBeta = this.g.x == null ? void 0 : this.g.x.redMul(beta);
          if (gMulX == null || gXRedMulBeta == null) {
            if (requireCoordinates) {
              throw new Error("Lambda computation failed: g.mul(lambda).x or g.x.redMul(beta) is undefined.");
            }
            return false;
          }
          return gMulX.cmp(gXRedMulBeta) === 0;
        }
        _resolveEndomorphismLambda(conf, beta) {
          if (conf.lambda !== void 0)
            return new BigNumber(conf.lambda, 16);
          const lambdas = this._getEndoRoots(this.n);
          if (lambdas == null)
            throw new Error("Failed to get endomorphism roots for lambda.");
          if (this._endomorphismLambdaMatches(lambdas[0], beta))
            return lambdas[0];
          _Curve.assert(this._endomorphismLambdaMatches(lambdas[1], beta, true), "Lambda selection does not match computed beta.");
          return lambdas[1];
        }
        #_resolveEndomorphismBasis(conf, lambda) {
          if (typeof conf.basis !== "object" || conf.basis === null) {
            return this._getEndoBasis(lambda);
          }
          return conf.basis.map((vec) => ({
            a: new BigNumber(vec.a, 16),
            b: new BigNumber(vec.b, 16)
          }));
        }
        _getEndoRoots(num) {
          const red2 = num === this.p ? this.red : new MontgomoryMethod(num);
          const tinv = new BigNumber(2).toRed(red2).redInvm();
          const ntinv = tinv.redNeg();
          const s2 = new BigNumber(3).toRed(red2).redNeg().redSqrt().redMul(tinv);
          const l1 = ntinv.redAdd(s2).fromRed();
          const l2 = ntinv.redSub(s2).fromRed();
          return [l1, l2];
        }
        _getEndoBasis(lambda) {
          const aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));
          let u = lambda;
          let v = this.n.clone();
          let x1 = new BigNumber(1);
          let y1 = new BigNumber(0);
          let x2 = new BigNumber(0);
          let y2 = new BigNumber(1);
          let a0;
          let b0;
          let a1;
          let b1;
          let a2;
          let b2;
          let prevR = new BigNumber(0);
          let i = 0;
          let r2 = new BigNumber(0);
          let x = new BigNumber(0);
          while (u.cmpn(0) !== 0) {
            const q = v.div(u);
            r2 = v.sub(q.mul(u));
            x = x2.sub(q.mul(x1));
            const y = y2.sub(q.mul(y1));
            if (a1 === void 0 && r2.cmp(aprxSqrt) < 0) {
              a0 = prevR.neg();
              b0 = x1;
              a1 = r2.neg();
              b1 = x;
            } else if (a1 !== void 0 && ++i === 2) {
              break;
            }
            prevR = r2;
            v = u;
            u = r2;
            x2 = x1;
            x1 = x;
            y2 = y1;
            y1 = y;
          }
          if (a0 === void 0 || b0 === void 0 || a1 === void 0 || b1 === void 0) {
            throw new Error("Failed to compute Endo Basis values");
          }
          a2 = r2.neg();
          b2 = x;
          const len1 = a1.sqr().add(b1.sqr());
          const len2 = a2.sqr().add(b2.sqr());
          if (len2.cmp(len1) >= 0) {
            a2 = a0;
            b2 = b0;
          }
          if (a1.negative !== 0) {
            a1 = a1.neg();
            b1 = b1.neg();
          }
          if (a2.negative !== 0) {
            a2 = a2.neg();
            b2 = b2.neg();
          }
          return [
            { a: a1, b: b1 },
            { a: a2, b: b2 }
          ];
        }
        _endoSplit(k) {
          if (this.endo == null) {
            throw new Error("Endomorphism is not defined.");
          }
          const basis = this.endo.basis;
          const v1 = basis[0];
          const v2 = basis[1];
          const c1 = v2.b.mul(k).divRound(this.n);
          const c2 = v1.b.neg().mul(k).divRound(this.n);
          const p1 = c1.mul(v1.a);
          const p2 = c2.mul(v2.a);
          const q1 = c1.mul(v1.b);
          const q2 = c2.mul(v2.b);
          const k1 = k.sub(p1).sub(p2);
          const k2 = q1.add(q2).neg();
          return { k1, k2 };
        }
        validate(point) {
          if (point.inf) {
            return true;
          }
          const x = point.x;
          const y = point.y;
          if (x === null || y === null) {
            throw new Error("Point coordinates cannot be null");
          }
          const ax = this.a.redMul(x);
          const rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
          return y.redSqr().redISub(rhs).cmpn(0) === 0;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/BasePoint.js
  var BasePoint;
  var init_BasePoint = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/BasePoint.js"() {
      init_Curve();
      BasePoint = class {
        curve;
        type;
        precomputed;
        constructor(type) {
          this.curve = new Curve();
          this.type = type;
          this.precomputed = null;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/JacobianPoint.js
  var JacobianPoint;
  var init_JacobianPoint = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/JacobianPoint.js"() {
      init_BasePoint();
      init_BigNumber();
      init_Point();
      JacobianPoint = class _JacobianPoint extends BasePoint {
        x;
        y;
        z;
        zOne;
        /**
         * Constructs a new `JacobianPoint` instance.
         *
         * @param x - If `null`, the x-coordinate will default to the curve's defined 'one' constant.
         * If `x` is not a BigNumber, `x` will be converted to a `BigNumber` assuming it is a hex string.
         *
         * @param y - If `null`, the y-coordinate will default to the curve's defined 'one' constant.
         * If `y` is not a BigNumber, `y` will be converted to a `BigNumber` assuming it is a hex string.
         *
         * @param z - If `null`, the z-coordinate will default to 0.
         * If `z` is not a BigNumber, `z` will be converted to a `BigNumber` assuming it is a hex string.
         *
         * @example
         * const pointJ1 = new JacobianPoint(null, null, null); // creates point at infinity
         * const pointJ2 = new JacobianPoint('3', '4', '1'); // creates point (3, 4, 1)
         */
        constructor(x, y, z) {
          super("jacobian");
          if (x === null && y === null && z === null) {
            this.x = this.curve.one;
            this.y = this.curve.one;
            this.z = new BigNumber(0);
          } else {
            if (!BigNumber.isBN(x)) {
              x = new BigNumber(x, 16);
            }
            this.x = x;
            if (!BigNumber.isBN(y)) {
              y = new BigNumber(y, 16);
            }
            this.y = y;
            if (!BigNumber.isBN(z)) {
              z = new BigNumber(z, 16);
            }
            this.z = z;
          }
          if (this.x.red == null) {
            this.x = this.x.toRed(this.curve.red);
          }
          if (this.y.red == null) {
            this.y = this.y.toRed(this.curve.red);
          }
          if (this.z.red == null) {
            this.z = this.z.toRed(this.curve.red);
          }
          this.zOne = this.z === this.curve.one;
          if (this.isInfinity()) {
            this.x = this.curve.one;
            this.y = this.curve.one;
            this.z = new BigNumber(0).toRed(this.curve.red);
            this.zOne = false;
          }
        }
        /**
         * Converts the `JacobianPoint` object instance to standard affine `Point` format and returns `Point` type.
         *
         * @returns The `Point`(affine) object representing the same point as the original `JacobianPoint`.
         *
         * If the initial `JacobianPoint` represents point at infinity, an instance of `Point` at infinity is returned.
         *
         * @example
         * const pointJ = new JacobianPoint('3', '4', '1');
         * const pointP = pointJ.toP();  // The point in affine coordinates.
         */
        toP() {
          if (this.isInfinity()) {
            return new Point(null, null);
          }
          const zinv = this.z.redInvm();
          const zinv2 = zinv.redSqr();
          const ax = this.x.redMul(zinv2);
          const ay = this.y.redMul(zinv2).redMul(zinv);
          return new Point(ax, ay);
        }
        /**
         * Negation operation. It returns the additive inverse of the Jacobian point.
         *
         * @method neg
         * @returns Returns a new Jacobian point as the result of the negation.
         *
         * @example
         * const jp = new JacobianPoint(x, y, z)
         * const result = jp.neg()
         */
        neg() {
          return new _JacobianPoint(this.x, this.y.redNeg(), this.z);
        }
        /**
         * Addition operation in the Jacobian coordinates. It takes a Jacobian point as an argument
         * and returns a new Jacobian point as a result of the addition. In the special cases,
         * when either one of the points is the point at infinity, it will return the other point.
         *
         * @method add
         * @param p - The Jacobian point to be added.
         * @returns Returns a new Jacobian point as the result of the addition.
         *
         * @example
         * const p1 = new JacobianPoint(x1, y1, z1)
         * const p2 = new JacobianPoint(x2, y2, z2)
         * const result = p1.add(p2)
         */
        add(p) {
          if (this.isInfinity()) {
            return p;
          }
          if (p.isInfinity()) {
            return this;
          }
          const pz2 = p.z.redSqr();
          const z2 = this.z.redSqr();
          const u1 = this.x.redMul(pz2);
          const u2 = p.x.redMul(z2);
          const s1 = this.y.redMul(pz2.redMul(p.z));
          const s2 = p.y.redMul(z2.redMul(this.z));
          const h = u1.redSub(u2);
          const r2 = s1.redSub(s2);
          if (h.cmpn(0) === 0) {
            if (r2.cmpn(0) === 0) {
              return this.dbl();
            } else {
              return new _JacobianPoint(null, null, null);
            }
          }
          const h2 = h.redSqr();
          const h3 = h2.redMul(h);
          const v = u1.redMul(h2);
          const nx = r2.redSqr().redIAdd(h3).redISub(v).redISub(v);
          const ny = r2.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
          const nz = this.z.redMul(p.z).redMul(h);
          return new _JacobianPoint(nx, ny, nz);
        }
        /**
         * Mixed addition operation. This function combines the standard point addition with
         * the transformation from the affine to Jacobian coordinates. It first converts
         * the affine point to Jacobian, and then preforms the addition.
         *
         * @method mixedAdd
         * @param p - The affine point to be added.
         * @returns Returns the result of the mixed addition as a new Jacobian point.
         *
         * @example
         * const jp = new JacobianPoint(x1, y1, z1)
         * const ap = new Point(x2, y2)
         * const result = jp.mixedAdd(ap)
         */
        mixedAdd(p) {
          if (this.isInfinity()) {
            return p.toJ();
          }
          if (p.isInfinity()) {
            return this;
          }
          if (p.x === null || p.y === null) {
            throw new Error("Point coordinates cannot be null");
          }
          const z2 = this.z.redSqr();
          const u1 = this.x;
          const u2 = p.x.redMul(z2);
          const s1 = this.y;
          const s2 = p.y.redMul(z2).redMul(this.z);
          const h = u1.redSub(u2);
          const r2 = s1.redSub(s2);
          if (h.cmpn(0) === 0) {
            if (r2.cmpn(0) === 0) {
              return this.dbl();
            } else {
              return new _JacobianPoint(null, null, null);
            }
          }
          const h2 = h.redSqr();
          const h3 = h2.redMul(h);
          const v = u1.redMul(h2);
          const nx = r2.redSqr().redIAdd(h3).redISub(v).redISub(v);
          const ny = r2.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
          const nz = this.z.redMul(h);
          return new _JacobianPoint(nx, ny, nz);
        }
        /**
         * Multiple doubling operation. It doubles the Jacobian point as many times as the pow parameter specifies. If pow is 0 or the point is the point at infinity, it will return the point itself.
         *
         * @method dblp
         * @param pow - The number of times the point should be doubled.
         * @returns Returns a new Jacobian point as the result of multiple doublings.
         *
         * @example
         * const jp = new JacobianPoint(x, y, z)
         * const result = jp.dblp(3)
         */
        dblp(pow) {
          if (pow === 0) {
            return this;
          }
          if (this.isInfinity()) {
            return this;
          }
          if (pow === void 0) {
            return this.dbl();
          }
          let r2 = this;
          for (let i = 0; i < pow; i++) {
            r2 = r2.dbl();
          }
          return r2;
        }
        /**
         * Point doubling operation in the Jacobian coordinates. A special case is when the point is the point at infinity, in this case, this function will return the point itself.
         *
         * @method dbl
         * @returns Returns a new Jacobian point as the result of the doubling.
         *
         * @example
         * const jp = new JacobianPoint(x, y, z)
         * const result = jp.dbl()
         */
        dbl() {
          if (this.isInfinity()) {
            return this;
          }
          let nx;
          let ny;
          let nz;
          if (this.zOne) {
            const xx = this.x.redSqr();
            const yy = this.y.redSqr();
            const yyyy = yy.redSqr();
            let s2 = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
            s2 = s2.redIAdd(s2);
            const m = xx.redAdd(xx).redIAdd(xx);
            const t = m.redSqr().redISub(s2).redISub(s2);
            let yyyy8 = yyyy.redIAdd(yyyy);
            yyyy8 = yyyy8.redIAdd(yyyy8);
            yyyy8 = yyyy8.redIAdd(yyyy8);
            nx = t;
            ny = m.redMul(s2.redISub(t)).redISub(yyyy8);
            nz = this.y.redAdd(this.y);
          } else {
            const a = this.x.redSqr();
            const b = this.y.redSqr();
            const c = b.redSqr();
            let d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
            d = d.redIAdd(d);
            const e = a.redAdd(a).redIAdd(a);
            const f2 = e.redSqr();
            let c8 = c.redIAdd(c);
            c8 = c8.redIAdd(c8);
            c8 = c8.redIAdd(c8);
            nx = f2.redISub(d).redISub(d);
            ny = e.redMul(d.redISub(nx)).redISub(c8);
            nz = this.y.redMul(this.z);
            nz = nz.redIAdd(nz);
          }
          return new _JacobianPoint(nx, ny, nz);
        }
        /**
         * Equality check operation. It checks whether the affine or Jacobian point is equal to this Jacobian point.
         *
         * @method eq
         * @param p - The affine or Jacobian point to compare with.
         * @returns Returns true if the points are equal, otherwise returns false.
         *
         * @example
         * const jp1 = new JacobianPoint(x1, y1, z1)
         * const jp2 = new JacobianPoint(x2, y2, z2)
         * const areEqual = jp1.eq(jp2)
         */
        eq(p) {
          if (p.type === "affine") {
            return this.eq(p.toJ());
          }
          if (this === p) {
            return true;
          }
          p = p;
          if (this.isInfinity() && p.isInfinity()) {
            return true;
          }
          if (this.isInfinity() !== p.isInfinity()) {
            return false;
          }
          const z2 = this.z.redSqr();
          const pz2 = p.z.redSqr();
          if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0) {
            return false;
          }
          const z3 = z2.redMul(this.z);
          const pz3 = pz2.redMul(p.z);
          return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
        }
        /**
         * Equality check operation in relation to an x coordinate of a point in projective coordinates.
         * It checks whether the x coordinate of the Jacobian point is equal to the provided x coordinate
         * of a point in projective coordinates.
         *
         * @method eqXToP
         * @param x - The x coordinate of a point in projective coordinates.
         * @returns Returns true if the x coordinates are equal, otherwise returns false.
         *
         * @example
         * const jp = new JacobianPoint(x1, y1, z1)
         * const isXEqual = jp.eqXToP(x2)
         */
        eqXToP(x) {
          const zs = this.z.redSqr();
          const rx = x.toRed(this.curve?.red).redMul(zs);
          if (this.x.cmp(rx) === 0) {
            return true;
          }
          const xc = x.clone();
          if (this.curve?.redN == null) {
            throw new Error("Curve or redN is not initialized.");
          }
          const t = this.curve.redN.redMul(zs);
          while (xc.cmp(this.curve.p) < 0) {
            xc.iadd(this.curve.n);
            if (xc.cmp(this.curve.p) >= 0) {
              return false;
            }
            rx.redIAdd(t);
            if (this.x.cmp(rx) === 0) {
              return true;
            }
          }
          return false;
        }
        /**
         * Returns the string representation of the JacobianPoint instance.
         * @method inspect
         * @returns Returns the string description of the JacobianPoint. If the JacobianPoint represents a point at infinity, the return value of this function is '<EC JPoint Infinity>'. For a normal point, it returns the string description format as '<EC JPoint x: x-coordinate y: y-coordinate z: z-coordinate>'.
         *
         * @example
         * const point = new JacobianPoint('5', '6', '1');
         * console.log(point.inspect()); // Output: '<EC JPoint x: 5 y: 6 z: 1>'
         */
        inspect() {
          if (this.isInfinity()) {
            return "<EC JPoint Infinity>";
          }
          return "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">";
        }
        /**
         * Checks whether the JacobianPoint instance represents a point at infinity.
         * @method isInfinity
         * @returns Returns true if the JacobianPoint's z-coordinate equals to zero (which represents the point at infinity in Jacobian coordinates). Returns false otherwise.
         *
         * @example
         * const point = new JacobianPoint('5', '6', '0');
         * console.log(point.isInfinity()); // Output: true
         */
        isInfinity() {
          return this.z.cmpn(0) === 0;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Point.js
  function ctSwap(swap, a, b) {
    const mask = -swap;
    const swapX = (a.X ^ b.X) & mask;
    const swapY = (a.Y ^ b.Y) & mask;
    const swapZ = (a.Z ^ b.Z) & mask;
    a.X ^= swapX;
    b.X ^= swapX;
    a.Y ^= swapY;
    b.Y ^= swapY;
    a.Z ^= swapZ;
    b.Z ^= swapZ;
  }
  function red(x) {
    let hi = x >> 256n;
    x = (x & MASK_256) + (hi << 32n) + hi * 977n;
    hi = x >> 256n;
    x = (x & MASK_256) + (hi << 32n) + hi * 977n;
    if (x >= P_BIGINT)
      x -= P_BIGINT;
    return x;
  }
  var BI_ZERO, BI_ONE, BI_TWO, BI_THREE, BI_FOUR, BI_EIGHT, P_BIGINT, N_BIGINT, MASK_256, biMod, biModSub, biModMul, biModAdd, biModInv, biModSqr, biModPow, P_PLUS1_DIV4, biModSqrt, toBigInt, GX_BIGINT, GY_BIGINT, WNAF_TABLE_CACHE, jpDouble, jpAdd, jpNeg, wnafTable, wnafDigits, scalarMultiplyWNAF, modN, modMulN, modInvN, Point;
  var init_Point = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Point.js"() {
      init_BasePoint();
      init_JacobianPoint();
      init_BigNumber();
      init_utils();
      BI_ZERO = 0n;
      BI_ONE = 1n;
      BI_TWO = 2n;
      BI_THREE = 3n;
      BI_FOUR = 4n;
      BI_EIGHT = 8n;
      P_BIGINT = 0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
      N_BIGINT = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
      MASK_256 = (1n << 256n) - 1n;
      biMod = (a) => red((a % P_BIGINT + P_BIGINT) % P_BIGINT);
      biModSub = (a, b) => a >= b ? a - b : P_BIGINT - (b - a);
      biModMul = (a, b) => red(a * b);
      biModAdd = (a, b) => red(a + b);
      biModInv = (a) => {
        let lm = BI_ONE;
        let hm = BI_ZERO;
        let low = biMod(a);
        let high = P_BIGINT;
        while (low > BI_ONE) {
          const r2 = high / low;
          [lm, hm] = [hm - lm * r2, lm];
          [low, high] = [high - low * r2, low];
        }
        return biMod(lm);
      };
      biModSqr = (a) => biModMul(a, a);
      biModPow = (base, exp) => {
        let result = 1n;
        base = biMod(base);
        while (exp > 0n) {
          if ((exp & 1n) !== 0n) {
            result = biModMul(result, base);
          }
          base = biModMul(base, base);
          exp >>= 1n;
        }
        return result;
      };
      P_PLUS1_DIV4 = P_BIGINT + 1n >> 2n;
      biModSqrt = (a) => {
        const r2 = biModPow(a, P_PLUS1_DIV4);
        if (biModMul(r2, r2) !== biMod(a)) {
          return null;
        }
        return r2;
      };
      toBigInt = (x) => {
        if (BigNumber.isBN(x))
          return BigInt("0x" + x.toString(16));
        if (typeof x === "string")
          return BigInt("0x" + x);
        if (Array.isArray(x))
          return BigInt("0x" + toHex(x));
        return BigInt(x);
      };
      GX_BIGINT = BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798");
      GY_BIGINT = BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8");
      WNAF_TABLE_CACHE = /* @__PURE__ */ new Map();
      jpDouble = (P) => {
        const { X: X1, Y: Y1, Z: Z1 } = P;
        if (Y1 === BI_ZERO)
          return { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
        const Y1sq = biModMul(Y1, Y1);
        const S = biModMul(BI_FOUR, biModMul(X1, Y1sq));
        const M = biModMul(BI_THREE, biModMul(X1, X1));
        const X3 = biModSub(biModMul(M, M), biModMul(BI_TWO, S));
        const Y3 = biModSub(biModMul(M, biModSub(S, X3)), biModMul(BI_EIGHT, biModMul(Y1sq, Y1sq)));
        const Z3 = biModMul(BI_TWO, biModMul(Y1, Z1));
        return { X: X3, Y: Y3, Z: Z3 };
      };
      jpAdd = (P, Q) => {
        if (P.Z === BI_ZERO)
          return Q;
        if (Q.Z === BI_ZERO)
          return P;
        const Z1Z1 = biModMul(P.Z, P.Z);
        const Z2Z2 = biModMul(Q.Z, Q.Z);
        const U1 = biModMul(P.X, Z2Z2);
        const U2 = biModMul(Q.X, Z1Z1);
        const S1 = biModMul(P.Y, biModMul(Z2Z2, Q.Z));
        const S2 = biModMul(Q.Y, biModMul(Z1Z1, P.Z));
        const H = biModSub(U2, U1);
        const r2 = biModSub(S2, S1);
        if (H === BI_ZERO) {
          if (r2 === BI_ZERO)
            return jpDouble(P);
          return { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
        }
        const HH = biModMul(H, H);
        const HHH = biModMul(H, HH);
        const V = biModMul(U1, HH);
        const X3 = biModSub(biModSub(biModMul(r2, r2), HHH), biModMul(BI_TWO, V));
        const Y3 = biModSub(biModMul(r2, biModSub(V, X3)), biModMul(S1, HHH));
        const Z3 = biModMul(H, biModMul(P.Z, Q.Z));
        return { X: X3, Y: Y3, Z: Z3 };
      };
      jpNeg = (P) => {
        if (P.Z === BI_ZERO)
          return P;
        return { X: P.X, Y: P_BIGINT - P.Y, Z: P.Z };
      };
      wnafTable = (window, P0) => {
        const key = `${window}:${P0.x.toString(16)}:${P0.y.toString(16)}`;
        const cached = WNAF_TABLE_CACHE.get(key);
        if (cached !== void 0)
          return cached;
        const table = Array.from({ length: 1 << window - 1 }, () => ({
          X: BI_ZERO,
          Y: BI_ONE,
          Z: BI_ZERO
        }));
        const point = { X: P0.x, Y: P0.y, Z: BI_ONE };
        table[0] = point;
        const doubled = jpDouble(point);
        for (let i = 1; i < table.length; i++) {
          table[i] = jpAdd(table[i - 1], doubled);
        }
        WNAF_TABLE_CACHE.set(key, table);
        return table;
      };
      wnafDigits = (scalar, window) => {
        const digits = [];
        const windowSize = 1n << BigInt(window);
        const halfWindow = windowSize >> 1n;
        let remaining = scalar;
        while (remaining > 0n) {
          if ((remaining & BI_ONE) === BI_ZERO) {
            digits.push(0);
          } else {
            let digit = remaining & windowSize - 1n;
            if (digit > halfWindow)
              digit -= windowSize;
            digits.push(Number(digit));
            remaining -= digit;
          }
          remaining >>= BI_ONE;
        }
        return digits;
      };
      scalarMultiplyWNAF = (k, P0, window = 5) => {
        const table = wnafTable(window, P0);
        const wnaf = wnafDigits(k, window);
        let Q = { X: BI_ZERO, Y: BI_ONE, Z: BI_ZERO };
        for (let i = wnaf.length - 1; i >= 0; i--) {
          Q = jpDouble(Q);
          const di = wnaf[i];
          if (di !== 0) {
            const idx = Math.abs(di) >> 1;
            const addend = di > 0 ? table[idx] : jpNeg(table[idx]);
            Q = jpAdd(Q, addend);
          }
        }
        return Q;
      };
      modN = (a) => {
        let r2 = a % N_BIGINT;
        if (r2 < 0n)
          r2 += N_BIGINT;
        return r2;
      };
      modMulN = (a, b) => modN(a * b);
      modInvN = (a) => {
        let lm = 1n;
        let hm = 0n;
        let low = modN(a);
        let high = N_BIGINT;
        while (low > 1n) {
          const q = high / low;
          [lm, hm] = [hm - lm * q, lm];
          [low, high] = [high - low * q, low];
        }
        return modN(lm);
      };
      Point = class _Point extends BasePoint {
        x;
        y;
        inf;
        static _assertOnCurve(p) {
          if (!p.validate()) {
            throw new Error("Invalid point");
          }
          return p;
        }
        /**
         * Creates a point object from a given Array. These numbers can represent coordinates in hex format, or points
         * in multiple established formats.
         * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
         *
         * @method fromDER
         * @static
         * @param bytes - The point representation number array.
         * @returns Returns a new point representing the given string.
         * @throws `Error` If the point number[] value has a wrong length.
         * @throws `Error` If the point format is unknown.
         *
         * @example
         * const derPoint = [ 2, 18, 123, 108, 125, 83, 1, 251, 164, 214, 16, 119, 200, 216, 210, 193, 251, 193, 129, 67, 97, 146, 210, 216, 77, 254, 18, 6, 150, 190, 99, 198, 128 ];
         * const point = Point.fromDER(derPoint);
         */
        static fromDER(bytes3) {
          const len = 32;
          if ((bytes3[0] === 4 || bytes3[0] === 6 || bytes3[0] === 7) && bytes3.length - 1 === 2 * len) {
            if (bytes3[0] === 6) {
              if (bytes3.at(-1) % 2 !== 0) {
                throw new Error("Point string value is wrong length");
              }
            } else if (bytes3[0] === 7) {
              if (bytes3.at(-1) % 2 !== 1) {
                throw new Error("Point string value is wrong length");
              }
            }
            const res = new _Point(bytes3.slice(1, 1 + len), bytes3.slice(1 + len, 1 + 2 * len));
            return _Point._assertOnCurve(res);
          } else if ((bytes3[0] === 2 || bytes3[0] === 3) && bytes3.length - 1 === len) {
            return _Point._assertOnCurve(_Point.fromX(bytes3.slice(1, 1 + len), bytes3[0] === 3));
          }
          throw new Error("Unknown point format");
        }
        /**
         * Creates a point object from a given string. This string can represent coordinates in hex format, or points
         * in multiple established formats.
         * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
         *
         * @method fromString
         * @static
         *
         * @param str The point representation string.
         * @returns Returns a new point representing the given string.
         * @throws `Error` If the point string value has a wrong length.
         * @throws `Error` If the point format is unknown.
         *
         * @example
         * const pointStr = 'abcdef';
         * const point = Point.fromString(pointStr);
         */
        static fromString(str) {
          const bytes3 = toArray2(str, "hex");
          return _Point._assertOnCurve(_Point.fromDER(bytes3));
        }
        /**
         * Generates a point from an x coordinate and a boolean indicating whether the corresponding
         * y coordinate is odd.
         *
         * @method fromX
         * @static
         * @param x - The x coordinate of the point.
         * @param odd - Boolean indicating whether the corresponding y coordinate is odd or not.
         * @returns Returns the new point.
         * @throws `Error` If the point is invalid.
         *
         * @example
         * const xCoordinate = new BigNumber('10');
         * const point = Point.fromX(xCoordinate, true);
         */
        static fromX(x, odd) {
          let xBigInt = toBigInt(x);
          xBigInt = biMod(xBigInt);
          const y2 = biModAdd(biModMul(biModSqr(xBigInt), xBigInt), 7n);
          const y = biModSqrt(y2);
          if (y === null) {
            throw new Error("Invalid point");
          }
          let yBig = y;
          if ((yBig & BI_ONE) !== (odd ? BI_ONE : BI_ZERO)) {
            yBig = biModSub(P_BIGINT, yBig);
          }
          const xBN = new BigNumber(xBigInt.toString(16), 16);
          const yBN = new BigNumber(yBig.toString(16), 16);
          return _Point._assertOnCurve(new _Point(xBN, yBN));
        }
        /**
         * Generates a point from a serialized JSON object. The function accounts for different options in the JSON object,
         * including precomputed values for optimization of EC operations, and calls another helper function to turn nested
         * JSON points into proper Point objects.
         *
         * @method fromJSON
         * @static
         * @param obj - An object or array that holds the data for the point.
         * @param isRed - A boolean to direct how the Point is constructed from the JSON object.
         * @returns Returns a new point based on the deserialized JSON object.
         *
         * @example
         * const serializedPoint = '{"x":52,"y":15}';
         * const point = Point.fromJSON(serializedPoint, true);
         */
        static fromJSON(obj, isRed) {
          if (typeof obj === "string") {
            obj = JSON.parse(obj);
          }
          let res = new _Point(obj[0], obj[1], isRed);
          res = _Point._assertOnCurve(res);
          if (typeof obj[2] !== "object" || obj[2] === null) {
            return res;
          }
          const pre = obj[2];
          const obj2point = (p) => {
            const pt = new _Point(p[0], p[1], isRed);
            return _Point._assertOnCurve(pt);
          };
          res.precomputed = {
            beta: null,
            doubles: typeof pre.doubles === "object" && pre.doubles !== null ? {
              step: pre.doubles.step,
              points: [res].concat(pre.doubles.points.map(obj2point))
            } : void 0,
            naf: typeof pre.naf === "object" && pre.naf !== null ? {
              wnd: pre.naf.wnd,
              points: [res].concat(pre.naf.points.map(obj2point))
            } : void 0
          };
          return res;
        }
        /**
         * @constructor
         * @param x - The x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
         * @param y - The y-coordinate of the point, similar to x.
         * @param isRed - A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.
         *
         * @example
         * new Point('abc123', 'def456');
         * new Point(null, null); // Generates Infinity point.
         */
        constructor(x, y, isRed = true) {
          super("affine");
          this.precomputed = null;
          if (x === null && y === null) {
            this.x = null;
            this.y = null;
            this.inf = true;
          } else {
            if (!BigNumber.isBN(x)) {
              x = new BigNumber(x, 16);
            }
            this.x = x;
            if (!BigNumber.isBN(y)) {
              y = new BigNumber(y, 16);
            }
            this.y = y;
            if (isRed) {
              this.x.forceRed(this.curve.red);
              this.y.forceRed(this.curve.red);
            }
            if (this.x.red === null) {
              this.x = this.x.toRed(this.curve.red);
            }
            if (this.y.red === null) {
              this.y = this.y.toRed(this.curve.red);
            }
            this.inf = false;
          }
        }
        /**
         * Validates if a point belongs to the curve. Follows the short Weierstrass
         * equation for elliptic curves: y^2 = x^3 + ax + b.
         *
         * @method validate
         * @returns {boolean} true if the point is on the curve, false otherwise.
         *
         * @example
         * const aPoint = new Point(x, y);
         * const isValid = aPoint.validate();
         */
        validate() {
          if (this.inf || this.x == null || this.y == null)
            return false;
          try {
            const xBig = BigInt("0x" + this.x.fromRed().toString(16));
            const yBig = BigInt("0x" + this.y.fromRed().toString(16));
            const lhs = biModMul(yBig, yBig);
            const rhs = biModAdd(biModMul(biModMul(xBig, xBig), xBig), 7n);
            return lhs === rhs;
          } catch {
            return false;
          }
        }
        /**
         * Encodes the coordinates of a point into an array or a hexadecimal string.
         * The details of encoding are determined by the optional compact and enc parameters.
         *
         * @method encode
         * @param compact - If true, an additional prefix byte 0x02 or 0x03 based on the 'y' coordinate being even or odd respectively is used. If false, byte 0x04 is used.
         * @param enc - Expects the string 'hex' if hexadecimal string encoding is required instead of an array of numbers.
         * @throws Will throw an error if the specified encoding method is not recognized. Expects 'hex'.
         * @returns If enc is undefined, a byte array representation of the point will be returned. if enc is 'hex', a hexadecimal string representation of the point will be returned.
         *
         * @example
         * const aPoint = new Point(x, y);
         * const encodedPointArray = aPoint.encode();
         * const encodedPointHex = aPoint.encode(true, 'hex');
         */
        encode(compact = true, enc) {
          if (this.inf) {
            if (enc === "hex")
              return "00";
            return [0];
          }
          const len = this.curve.p.byteLength();
          const x = this.getX().toArray("be", len);
          let res;
          if (compact) {
            res = [this.getY().isEven() ? 2 : 3].concat(x);
          } else {
            res = [4].concat(x, this.getY().toArray("be", len));
          }
          if (enc === "hex") {
            return toHex(res);
          } else {
            return res;
          }
        }
        /**
         * Converts the point coordinates to a hexadecimal string. A wrapper method
         * for encode. Byte 0x02 or 0x03 is used as prefix based on the 'y' coordinate being even or odd respectively.
         *
         * @method toString
         * @returns {string} A hexadecimal string representation of the point coordinates.
         *
         * @example
         * const aPoint = new Point(x, y);
         * const stringPoint = aPoint.toString();
         */
        toString() {
          return this.encode(true, "hex");
        }
        /**
         * Exports the x and y coordinates of the point, and the precomputed doubles and non-adjacent form (NAF) for optimization. The output is an array.
         *
         * @method toJSON
         * @returns An Array where first two elements are the coordinates of the point and optional third element is an object with doubles and NAF points.
         *
         * @example
         * const aPoint = new Point(x, y);
         * const jsonPoint = aPoint.toJSON();
         */
        toJSON() {
          if (this.precomputed == null) {
            return [this.x, this.y];
          }
          return [
            this.x,
            this.y,
            typeof this.precomputed === "object" && this.precomputed !== null ? {
              doubles: this.precomputed.doubles == null ? void 0 : {
                step: this.precomputed.doubles.step,
                points: this.precomputed.doubles.points.slice(1)
              },
              naf: this.precomputed.naf == null ? void 0 : {
                wnd: this.precomputed.naf.wnd,
                points: this.precomputed.naf.points.slice(1)
              }
            } : void 0
          ];
        }
        /**
         * Provides the point coordinates in a human-readable string format for debugging purposes.
         *
         * @method inspect
         * @returns String of the format '<EC Point x: x-coordinate y: y-coordinate>', or '<EC Point Infinity>' if the point is at infinity.
         *
         * @example
         * const aPoint = new Point(x, y);
         * console.log(aPoint.inspect());
         */
        inspect() {
          if (this.isInfinity()) {
            return "<EC Point Infinity>";
          }
          return "<EC Point x: " + (this.x?.fromRed()?.toString(16, 2) ?? "undefined") + " y: " + (this.y?.fromRed()?.toString(16, 2) ?? "undefined") + ">";
        }
        /**
         * Checks if the point is at infinity.
         * @method isInfinity
         * @returns Returns whether or not the point is at infinity.
         *
         * @example
         * const p = new Point(null, null);
         * console.log(p.isInfinity()); // outputs: true
         */
        isInfinity() {
          return this.inf;
        }
        /**
         * Adds another Point to this Point, returning a new Point.
         *
         * @method add
         * @param p - The Point to add to this one.
         * @returns A new Point that results from the addition.
         *
         * @example
         * const p1 = new Point(1, 2);
         * const p2 = new Point(2, 3);
         * const result = p1.add(p2);
         */
        add(p) {
          if (this.inf) {
            return p;
          }
          if (p.inf) {
            return this;
          }
          if (this.eq(p)) {
            return this.dbl();
          }
          if (this.neg().eq(p)) {
            return new _Point(null, null);
          }
          if (this.x?.cmp(p.x ?? new BigNumber(0)) === 0) {
            return new _Point(null, null);
          }
          const P1 = {
            X: BigInt("0x" + this.x.fromRed().toString(16)),
            Y: BigInt("0x" + this.y.fromRed().toString(16)),
            Z: BI_ONE
          };
          const Q1 = {
            X: BigInt("0x" + p.x.fromRed().toString(16)),
            Y: BigInt("0x" + p.y.fromRed().toString(16)),
            Z: BI_ONE
          };
          const R = jpAdd(P1, Q1);
          if (R.Z === BI_ZERO)
            return new _Point(null, null);
          const zInv = biModInv(R.Z);
          const zInv2 = biModMul(zInv, zInv);
          const xRes = biModMul(R.X, zInv2);
          const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
          return new _Point(xRes.toString(16), yRes.toString(16));
        }
        /**
         * Doubles the current point.
         *
         * @method dbl
         *
         * @example
         * const P = new Point('123', '456');
         * const result = P.dbl();
         * */
        dbl() {
          if (this.inf)
            return this;
          if (this.x === null || this.y === null) {
            throw new Error("Point coordinates cannot be null");
          }
          const X = BigInt("0x" + this.x.fromRed().toString(16));
          const Y = BigInt("0x" + this.y.fromRed().toString(16));
          if (Y === BI_ZERO)
            return new _Point(null, null);
          const R = jpDouble({ X, Y, Z: BI_ONE });
          const zInv = biModInv(R.Z);
          const zInv2 = biModMul(zInv, zInv);
          const xRes = biModMul(R.X, zInv2);
          const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
          return new _Point(xRes.toString(16), yRes.toString(16));
        }
        /**
         * Returns X coordinate of point
         *
         * @example
         * const P = new Point('123', '456');
         * const x = P.getX();
         */
        getX() {
          return (this.x ?? new BigNumber(0)).fromRed();
        }
        /**
         * Returns X coordinate of point
         *
         * @example
         * const P = new Point('123', '456');
         * const x = P.getX();
         */
        getY() {
          return (this.y ?? new BigNumber(0)).fromRed();
        }
        /**
         * Multiplies this Point by a scalar value, returning a new Point.
         *
         * @method mul
         * @param k - The scalar value to multiply this Point by.
         * @returns  A new Point that results from the multiplication.
         *
         * @example
         * const p = new Point(1, 2);
         * const result = p.mul(2); // this doubles the Point
         */
        mul(k) {
          if (!BigNumber.isBN(k)) {
            k = new BigNumber(k, 16);
          }
          k = k;
          if (this.inf) {
            return this;
          }
          const isNeg = k.isNeg();
          const kAbs = isNeg ? k.neg() : k;
          let kBig = BigInt("0x" + kAbs.toString(16));
          kBig = biMod(kBig);
          if (kBig === BI_ZERO) {
            return new _Point(null, null);
          }
          if (kBig === BI_ZERO) {
            return new _Point(null, null);
          }
          if (this.x === null || this.y === null) {
            throw new Error("Point coordinates cannot be null");
          }
          let Px;
          let Py;
          if (this === this.curve.g) {
            Px = GX_BIGINT;
            Py = GY_BIGINT;
          } else {
            Px = BigInt("0x" + this.x.fromRed().toString(16));
            Py = BigInt("0x" + this.y.fromRed().toString(16));
          }
          const R = scalarMultiplyWNAF(kBig, { x: Px, y: Py });
          if (R.Z === BI_ZERO) {
            return new _Point(null, null);
          }
          const zInv = biModInv(R.Z);
          const zInv2 = biModMul(zInv, zInv);
          const xRes = biModMul(R.X, zInv2);
          const yRes = biModMul(R.Y, biModMul(zInv2, zInv));
          const xBN = new BigNumber(xRes.toString(16), 16);
          const yBN = new BigNumber(yRes.toString(16), 16);
          const result = new _Point(xBN, yBN);
          if (isNeg) {
            return result.neg();
          }
          return result;
        }
        mulCT(k) {
          if (!BigNumber.isBN(k)) {
            k = new BigNumber(k, 16);
          }
          k = k;
          if (this.inf)
            return new _Point(null, null);
          const isNeg = k.isNeg();
          const kAbs = isNeg ? k.neg() : k;
          let kBig = BigInt("0x" + kAbs.toString(16));
          kBig = biMod(kBig);
          if (kBig === 0n)
            return new _Point(null, null);
          const Px = this === this.curve.g ? GX_BIGINT : BigInt("0x" + this.getX().toString(16));
          const Py = this === this.curve.g ? GY_BIGINT : BigInt("0x" + this.getY().toString(16));
          let R0 = { X: 0n, Y: 1n, Z: 0n };
          let R1 = { X: Px, Y: Py, Z: 1n };
          const bits = kBig.toString(2);
          for (const bitChar of bits) {
            const bit = bitChar === "1" ? 1n : 0n;
            ctSwap(bit, R0, R1);
            R1 = jpAdd(R0, R1);
            R0 = jpDouble(R0);
            ctSwap(bit, R0, R1);
          }
          if (R0.Z === 0n)
            return new _Point(null, null);
          const zInv = biModInv(R0.Z);
          const zInv2 = biModMul(zInv, zInv);
          const x = biModMul(R0.X, zInv2);
          const y = biModMul(R0.Y, biModMul(zInv2, zInv));
          const result = new _Point(x.toString(16), y.toString(16));
          return isNeg ? result.neg() : result;
        }
        /**
         * Performs a multiplication and addition operation in a single step.
         * Multiplies this Point by k1, adds the resulting Point to the result of p2 multiplied by k2.
         *
         * @method mulAdd
         * @param k1 - The scalar value to multiply this Point by.
         * @param p2 - The other Point to be involved in the operation.
         * @param k2 - The scalar value to multiply the Point p2 by.
         * @returns A Point that results from the combined multiplication and addition operations.
         *
         * @example
         * const p1 = new Point(1, 2);
         * const p2 = new Point(2, 3);
         * const result = p1.mulAdd(2, p2, 3);
         */
        mulAdd(k1, p2, k2) {
          const points = [this, p2];
          const coeffs = [k1, k2];
          return this.#_endoWnafMulAdd(points, coeffs);
        }
        /**
         * Performs the Jacobian multiplication and addition operation in a single
         * step. Instead of returning a regular Point, the result is a JacobianPoint.
         *
         * @method jmulAdd
         * @param k1 - The scalar value to multiply this Point by.
         * @param p2 - The other Point to be involved in the operation
         * @param k2 - The scalar value to multiply the Point p2 by.
         * @returns A JacobianPoint that results from the combined multiplication and addition operation.
         *
         * @example
         * const p1 = new Point(1, 2);
         * const p2 = new Point(2, 3);
         * const result = p1.jmulAdd(2, p2, 3);
         */
        jmulAdd(k1, p2, k2) {
          const points = [this, p2];
          const coeffs = [k1, k2];
          return this.#_endoWnafMulAdd(points, coeffs, true);
        }
        /**
         * Checks if the Point instance is equal to another given Point.
         *
         * @method eq
         * @param p - The Point to be checked if equal to the current instance.
         *
         * @returns Whether the two Point instances are equal. Both the 'x' and 'y' coordinates have to match, and both points have to either be valid or at infinity for equality. If both conditions are true, it returns true, else it returns false.
         *
         * @example
         * const p1 = new Point(5, 20);
         * const p2 = new Point(5, 20);
         * const areEqual = p1.eq(p2); // returns true
         */
        eq(p) {
          return this === p || this.inf === p.inf && (this.inf || (this.x ?? new BigNumber(0)).cmp(p.x ?? new BigNumber(0)) === 0 && (this.y ?? new BigNumber(0)).cmp(p.y ?? new BigNumber(0)) === 0);
        }
        /**
         * Negate a point. The negation of a point P is the mirror of P about x-axis.
         *
         * @method neg
         *
         * @example
         * const P = new Point('123', '456');
         * const result = P.neg();
         */
        neg(_precompute) {
          if (this.inf) {
            return this;
          }
          const res = new _Point(this.x, (this.y ?? new BigNumber(0)).redNeg());
          if (_precompute === true && this.precomputed != null) {
            const pre = this.precomputed;
            const negate = (p) => p.neg();
            res.precomputed = {
              naf: pre.naf == null ? void 0 : {
                wnd: pre.naf.wnd,
                points: pre.naf.points.map(negate)
              },
              doubles: pre.doubles == null ? void 0 : {
                step: pre.doubles.step,
                points: pre.doubles.points.map((p) => p.neg())
              },
              beta: void 0
            };
          }
          return res;
        }
        /**
         * Performs the "doubling" operation on the Point a given number of times.
         * This is used in elliptic curve operations to perform multiplication by 2, multiple times.
         * If the point is at infinity, it simply returns the point because doubling
         * a point at infinity is still infinity.
         *
         * @method dblp
         * @param k - The number of times the "doubling" operation is to be performed on the Point.
         * @returns The Point after 'k' "doubling" operations have been performed.
         *
         * @example
         * const p = new Point(5, 20);
         * const doubledPoint = p.dblp(10); // returns the point after "doubled" 10 times
         */
        dblp(k) {
          let r2;
          for (let i = 0; i < k; i++) {
            r2 = (r2 ?? this).dbl();
          }
          return r2 ?? this;
        }
        /**
         * Converts the point to a Jacobian point. If the point is at infinity, the corresponding Jacobian point
         * will also be at infinity.
         *
         * @method toJ
         * @returns Returns a new Jacobian point based on the current point.
         *
         * @example
         * const point = new Point(xCoordinate, yCoordinate);
         * const jacobianPoint = point.toJ();
         */
        toJ() {
          if (this.inf) {
            return new JacobianPoint(null, null, null);
          }
          const res = new JacobianPoint(this.x, this.y, this.curve.one);
          return res;
        }
        #_getBeta() {
          if (typeof this.curve.endo !== "object") {
            return;
          }
          const pre = this.precomputed;
          if (typeof pre === "object" && pre !== null && typeof pre.beta === "object" && pre.beta !== null) {
            return pre.beta;
          }
          const beta = new _Point((this.x ?? new BigNumber(0)).redMul(this.curve.endo.beta), this.y);
          if (pre != null) {
            const curve2 = this.curve;
            const endoMul = (basePoint) => {
              const p = basePoint;
              if (p.x === null) {
                throw new Error("p.x is null");
              }
              if (curve2.endo === void 0 || curve2.endo === null) {
                throw new Error("curve.endo is undefined");
              }
              return new _Point(p.x.redMul(curve2.endo.beta), p.y);
            };
            pre.beta = beta;
            beta.precomputed = {
              beta: null,
              naf: pre.naf == null ? void 0 : {
                wnd: pre.naf.wnd,
                points: pre.naf.points.map(endoMul)
              },
              doubles: pre.doubles == null ? void 0 : {
                step: pre.doubles.step,
                points: pre.doubles.points.map(endoMul)
              }
            };
          }
          return beta;
        }
        #_prepareWnafWindows(defW, points, len, wndWidth, wnd) {
          for (let index = 0; index < len; index++) {
            const nafPoints = points[index].#_getNAFPoints(defW);
            wndWidth[index] = nafPoints.wnd;
            wnd[index] = nafPoints.points;
          }
        }
        _combineWnafPair(a, b, context) {
          const { points, coeffs, wndWidth, wnd, naf, currentMax } = context;
          if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
            naf[a] = this.curve.getNAF(coeffs[a], wndWidth[a], this.curve._bitLength);
            naf[b] = this.curve.getNAF(coeffs[b], wndWidth[b], this.curve._bitLength);
            return Math.max(currentMax, naf[a].length, naf[b].length);
          }
          const comb = [points[a], null, null, points[b]];
          const aY = points[a].y ?? new BigNumber(0);
          const bY = points[b].y ?? new BigNumber(0);
          if (aY.cmp(bY) === 0) {
            comb[1] = points[a].add(points[b]);
            comb[2] = points[a].toJ().mixedAdd(points[b].neg());
          } else if (aY.cmp(bY.redNeg()) === 0) {
            comb[1] = points[a].toJ().mixedAdd(points[b]);
            comb[2] = points[a].add(points[b].neg());
          } else {
            comb[1] = points[a].toJ().mixedAdd(points[b]);
            comb[2] = points[a].toJ().mixedAdd(points[b].neg());
          }
          const index = [-3, -1, -5, -7, 0, 7, 5, 1, 3];
          const jsf = this.curve.getJSF(coeffs[a], coeffs[b]);
          const max = Math.max(currentMax, jsf[0].length);
          naf[a] = Array.from({ length: max });
          naf[b] = Array.from({ length: max });
          for (let position = 0; position < max; position++) {
            const ja = Math.trunc(jsf[0][position]);
            const jb = Math.trunc(jsf[1][position]);
            naf[a][position] = index[(ja + 1) * 3 + (jb + 1)];
            naf[b][position] = 0;
            wnd[a] = comb;
          }
          return max;
        }
        #_prepareWnafRepresentations(points, coeffs, len, wndWidth, wnd, naf) {
          let max = 0;
          for (let index = len - 1; index >= 1; index -= 2) {
            max = this._combineWnafPair(index - 1, index, {
              points,
              coeffs,
              wndWidth,
              wnd,
              naf,
              currentMax: max
            });
          }
          return max;
        }
        _collectWnafStep(start, len, naf, tmp) {
          let index = start;
          let doubles = 0;
          while (index >= 0) {
            let zero = true;
            for (let point = 0; point < len; point++) {
              tmp[point] = new BigNumber(typeof naf[point][index] === "number" ? naf[point][index] : 0);
              if (!tmp[point].isZero())
                zero = false;
            }
            if (!zero)
              break;
            doubles++;
            index--;
          }
          if (index >= 0)
            doubles++;
          return { index, doubles };
        }
        #_addWnafStep(accumulator, len, tmp, wnd) {
          const one = new BigNumber(1);
          const two = new BigNumber(2);
          let result = accumulator;
          for (let index = 0; index < len; index++) {
            const value = tmp[index];
            if (value.cmpn(0) === 0)
              continue;
            const point = value.isNeg() ? wnd[index][value.neg().sub(one).div(two).toNumber()].neg() : wnd[index][value.sub(one).div(two).toNumber()];
            result = point.type === "affine" ? result.mixedAdd(point) : result.add(point);
          }
          return result;
        }
        #_wnafMulAdd(defW, points, coeffs, len, jacobianResult) {
          const scratchLength = this.curve._wnafT1.length;
          const wndWidth = Array.from({ length: scratchLength });
          const wnd = Array.from({ length: scratchLength }, () => []);
          const naf = Array.from({ length: scratchLength }, () => []);
          this.#_prepareWnafWindows(defW, points, len, wndWidth, wnd);
          const max = this.#_prepareWnafRepresentations(points, coeffs, len, wndWidth, wnd, naf);
          let acc = new JacobianPoint(null, null, null);
          const tmp = this.curve._wnafT4;
          let index = max;
          while (index >= 0) {
            const step = this._collectWnafStep(index, len, naf, tmp);
            index = step.index;
            acc = acc.dblp(step.doubles);
            if (index < 0)
              break;
            acc = this.#_addWnafStep(acc, len, tmp, wnd);
            index--;
          }
          for (let i = 0; i < len; i++) {
            wnd[i] = [];
          }
          if (jacobianResult === true) {
            return acc;
          } else {
            return acc.toP();
          }
        }
        #_endoWnafMulAdd(points, coeffs, jacobianResult) {
          const npoints = Array.from({ length: points.length * 2 });
          const ncoeffs = Array.from({ length: points.length * 2 });
          let i;
          for (i = 0; i < points.length; i++) {
            const split2 = this.curve._endoSplit(coeffs[i]);
            let p = points[i];
            let beta = p.#_getBeta() ?? new _Point(null, null);
            if (split2.k1.negative !== 0) {
              split2.k1.ineg();
              p = p.neg(true);
            }
            if (split2.k2.negative !== 0) {
              split2.k2.ineg();
              beta = beta.neg(true);
            }
            npoints[i * 2] = p;
            npoints[i * 2 + 1] = beta;
            ncoeffs[i * 2] = split2.k1;
            ncoeffs[i * 2 + 1] = split2.k2;
          }
          const res = this.#_wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult);
          for (let j = 0; j < i * 2; j++) {
            npoints[j] = null;
            ncoeffs[j] = null;
          }
          return res;
        }
        _getDoubles(step, power) {
          if (typeof this.precomputed === "object" && this.precomputed !== null && typeof this.precomputed.doubles === "object" && this.precomputed.doubles !== null) {
            return this.precomputed.doubles;
          }
          const doubles = [this];
          let acc;
          for (let i = 0; i < (power ?? 0); i += step ?? 1) {
            for (let j = 0; j < (step ?? 1); j++) {
              acc = (acc ?? this).dbl();
            }
            doubles.push(acc);
          }
          return {
            step: step ?? 1,
            points: doubles
          };
        }
        #_getNAFPoints(wnd) {
          if (typeof this.precomputed === "object" && this.precomputed !== null && typeof this.precomputed.naf === "object" && this.precomputed.naf !== null) {
            return this.precomputed.naf;
          }
          const res = [this];
          const max = (1 << wnd) - 1;
          const dbl = max === 1 ? null : this.dbl();
          for (let i = 1; i < max; i++) {
            if (dbl !== null) {
              res[i] = res[i - 1].add(dbl);
            }
          }
          return {
            wnd,
            points: res
          };
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/PublicKey.js
  var PublicKey;
  var init_PublicKey = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/PublicKey.js"() {
      init_Point();
      init_Curve();
      init_ECDSA();
      init_BigNumber();
      init_Hash();
      init_Signature();
      init_utils();
      PublicKey = class _PublicKey extends Point {
        /**
         * Static factory method to derive a public key from a private key.
         * It multiplies the generator point 'g' on the elliptic curve by the private key.
         *
         * @static
         * @method fromPrivateKey
         *
         * @param key - The private key from which to derive the public key.
         *
         * @returns Returns the PublicKey derived from the given PrivateKey.
         *
         * @example
         * const myPrivKey = new PrivateKey(...)
         * const myPubKey = PublicKey.fromPrivateKey(myPrivKey)
         */
        static fromPrivateKey(key) {
          const c = new Curve();
          const p = c.g.mul(key);
          return new _PublicKey(p.x, p.y);
        }
        /**
         * Static factory method to create a PublicKey instance from a string.
         *
         * @param str - A string representing a public key.
         *
         * @returns Returns the PublicKey created from the string.
         *
         * @example
         * const myPubKey = PublicKey.fromString("03....")
         */
        static fromString(str) {
          const p = Point.fromString(str);
          return new _PublicKey(p.x, p.y);
        }
        /**
         * Static factory method to create a PublicKey instance from a number array.
         *
         * @param bytes - A number array representing a public key.
         *
         * @returns Returns the PublicKey created from the number array.
         *
         * @example
         * const myPubKey = PublicKey.fromString("03....")
         */
        static fromDER(bytes3) {
          const p = Point.fromDER(bytes3);
          return new _PublicKey(p.x, p.y);
        }
        /**
         * @constructor
         * @param x - A point or the x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
         * @param y - If x is not a point, the y-coordinate of the point, similar to x.
         * @param isRed - A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.
         *
         * @example
         * new PublicKey(point1);
         * new PublicKey('abc123', 'def456');
         */
        constructor(x, y = null, isRed = true) {
          if (x instanceof Point) {
            super(x.getX(), x.getY());
          } else {
            if (y === null && isRed && typeof x === "string") {
              if (x.length === 66 || x.length === 130) {
                throw new Error('You are using the "new PublicKey()" constructor with a DER hex string. You need to use "PublicKey.fromString()" instead.');
              }
            }
            super(x, y, isRed);
          }
        }
        /**
         * Derive a shared secret from a public key and a private key for use in symmetric encryption.
         * This method multiplies the public key (an instance of Point) with a private key.
         *
         * @param priv - The private key to use in deriving the shared secret.
         *
         * @returns Returns the Point representing the shared secret.
         *
         * @throws Will throw an error if the public key is not valid for ECDH secret derivation.
         *
         * @example
         * const myPrivKey = new PrivateKey(...)
         * const sharedSecret = myPubKey.deriveSharedSecret(myPrivKey)
         */
        deriveSharedSecret(priv) {
          if (!this.validate()) {
            throw new Error("Public key not valid for ECDH secret derivation");
          }
          return this.mulCT(priv);
        }
        /**
         * Verify a signature of a message using this public key.
         *
         * @param msg - The message to verify. It can be a string or an array of numbers.
         * @param sig - The Signature of the message that needs verification.
         * @param enc - The encoding of the message. It defaults to 'utf8'.
         *
         * @returns Returns true if the signature is verified successfully, otherwise false.
         *
         * @example
         * const myMessage = "Hello, world!"
         * const mySignature = new Signature(...)
         * const isVerified = myPubKey.verify(myMessage, mySignature)
         */
        verify(msg, sig, enc) {
          const msgHash = new BigNumber(sha256(msg, enc), 16);
          return verify(msgHash, sig, this);
        }
        /**
         * Encode the public key to DER (Distinguished Encoding Rules) format.
         *
         * @returns Returns the DER-encoded public key in number array or string.
         *
         * @param enc - The encoding of the DER string. undefined = number array, 'hex' = hex string.
         *
         * @example
         * const derPublicKey = myPubKey.toDER()
         */
        toDER(enc) {
          if (enc === "hex")
            return this.encode(true, enc);
          return this.encode(true);
        }
        /**
         * Hash sha256 and ripemd160 of the public key.
         *
         * @returns Returns the hash of the public key.
         *
         * @example
         * const publicKeyHash = pubkey.toHash()
         */
        toHash(enc) {
          const pkh = hash160(this.encode(true));
          if (enc === "hex") {
            return toHex(pkh);
          }
          return pkh;
        }
        /**
         * Base58Check encodes the hash of the public key with a prefix to indicate locking script type.
         * Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".
         *
         * @param prefix defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'mainnet' or 'testnet'
         *
         * @returns Returns the address encoding associated with the hash of the public key.
         *
         * @example
         * const address = pubkey.toAddress()
         * const address = pubkey.toAddress('mainnet')
         * const testnetAddress = pubkey.toAddress([0x6f])
         * const testnetAddress = pubkey.toAddress('testnet')
         */
        toAddress(prefix = [0]) {
          if (typeof prefix === "string") {
            if (prefix === "testnet" || prefix === "test") {
              prefix = [111];
            } else if (prefix === "mainnet" || prefix === "main") {
              prefix = [0];
            } else {
              throw new Error(`Invalid prefix ${prefix}`);
            }
          }
          return toBase58Check(this.toHash(), prefix);
        }
        /**
         * Derives a child key with BRC-42.
         * @param privateKey The private key of the other party
         * @param invoiceNumber The invoice number used to derive the child key
         * @param cacheSharedSecret Optional function to cache shared secrets
         * @param retrieveCachedSharedSecret Optional function to retrieve shared secrets from the cache
         * @returns The derived child key.
         */
        deriveChild(privateKey, invoiceNumber, cacheSharedSecret, retrieveCachedSharedSecret) {
          let sharedSecret;
          if (typeof retrieveCachedSharedSecret === "function") {
            const retrieved = retrieveCachedSharedSecret(privateKey, this);
            if (retrieved === void 0) {
              sharedSecret = this.deriveSharedSecret(privateKey);
              if (typeof cacheSharedSecret === "function") {
                cacheSharedSecret(privateKey, this, sharedSecret);
              }
            } else {
              sharedSecret = retrieved;
            }
          } else {
            sharedSecret = this.deriveSharedSecret(privateKey);
          }
          const invoiceNumberBin = toArray2(invoiceNumber, "utf8");
          const hmac2 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
          const curve2 = new Curve();
          const point = curve2.g.mul(new BigNumber(hmac2));
          const finalPoint = this.add(point);
          return new _PublicKey(finalPoint.x, finalPoint.y);
        }
        /**
         * Takes an array of numbers or a string and returns a new PublicKey instance.
         * This method will throw an error if the Compact encoding is invalid.
         * If a string is provided, it is assumed to represent a hexadecimal sequence.
         * compactByte value 27-30 means uncompressed public key.
         * 31-34 means compressed public key.
         * The range represents the recovery param which can be 0,1,2,3.
         *
         * @static
         * @method fromMsgHashAndCompactSignature
         * @param msgHash - The message hash which was signed.
         * @param signature - The signature in compact format.
         * @param enc - The encoding of the signature string.
         * @returns A PublicKey instance derived from the message hash and compact signature.
         * @example
         * const publicKey = Signature.fromMsgHashAndCompactSignature(msgHash, 'IMOl2mVKfDgsSsHT4uIYBNN4e...', 'base64');
         */
        static fromMsgHashAndCompactSignature(msgHash, signature, enc) {
          const data = toArray2(signature, enc);
          if (data.length !== 65) {
            throw new Error("Invalid Compact Signature");
          }
          const compactByte = data[0];
          if (compactByte < 27 || compactByte >= 35) {
            throw new Error("Invalid Compact Byte");
          }
          let r2 = data[0] - 27;
          if (r2 > 3) {
            r2 -= 4;
          }
          const s2 = new Signature(new BigNumber(data.slice(1, 33)), new BigNumber(data.slice(33, 65)));
          return s2.RecoverPublicKey(r2, msgHash);
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Signature.js
  var Signature;
  var init_Signature = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Signature.js"() {
      init_BigNumber();
      init_PublicKey();
      init_ECDSA();
      init_Hash();
      init_utils();
      init_Point();
      init_Curve();
      Signature = class _Signature {
        /**
         * @property Represents the "r" component of the digital signature
         */
        r;
        /**
         * @property Represents the "s" component of the digital signature
         */
        s;
        /**
         * Takes an array of numbers or a string and returns a new Signature instance.
         * This method will throw an error if the DER encoding is invalid.
         * If a string is provided, it is assumed to represent a hexadecimal sequence.
         *
         * @static
         * @method fromDER
         * @param data - The sequence to decode from DER encoding.
         * @param enc - The encoding of the data string.
         * @returns The decoded data in the form of Signature instance.
         *
         * @example
         * const signature = Signature.fromDER('30440220018c1f5502f8...', 'hex');
         */
        static fromDER(data, enc) {
          const getLength = (buf, p2) => {
            const initial = buf[p2.place++];
            if ((initial & 128) === 0) {
              return initial;
            } else {
              throw new Error("Invalid DER entity length");
            }
          };
          class Position {
            place = 0;
          }
          data = toArray2(data, enc);
          const p = new Position();
          if (data[p.place++] !== 48) {
            throw new Error("Signature DER must start with 0x30");
          }
          const len = getLength(data, p);
          if (len + p.place !== data.length) {
            throw new Error("Signature DER invalid");
          }
          if (data[p.place++] !== 2) {
            throw new Error("Signature DER invalid");
          }
          const rlen = getLength(data, p);
          let r2 = data.slice(p.place, rlen + p.place);
          p.place += rlen;
          if (data[p.place++] !== 2) {
            throw new Error("Signature DER invalid");
          }
          const slen = getLength(data, p);
          if (data.length !== slen + p.place) {
            throw new Error("Invalid R-length in signature DER");
          }
          let s2 = data.slice(p.place, slen + p.place);
          if (r2[0] === 0) {
            if ((r2[1] & 128) === 0) {
              throw new Error("Invalid R-value in signature DER");
            } else {
              r2 = r2.slice(1);
            }
          }
          if (s2[0] === 0) {
            if ((s2[1] & 128) === 0) {
              throw new Error("Invalid S-value in signature DER");
            } else {
              s2 = s2.slice(1);
            }
          }
          return new _Signature(new BigNumber(r2), new BigNumber(s2));
        }
        /**
         * Takes an array of numbers or a string and returns a new Signature instance.
         * This method will throw an error if the Compact encoding is invalid.
         * If a string is provided, it is assumed to represent a hexadecimal sequence.
         * compactByte value 27-30 means uncompressed public key.
         * 31-34 means compressed public key.
         * The range represents the recovery param which can be 0,1,2,3.
         * We could support recovery functions in future if there's demand.
         *
         * @static
         * @method fromCompact
         * @param data - The sequence to decode from Compact encoding.
         * @param enc - The encoding of the data string.
         * @returns The decoded data in the form of Signature instance.
         *
         * @example
         * const signature = Signature.fromCompact('1b18c1f5502f8...', 'hex');
         */
        static fromCompact(data, enc) {
          data = toArray2(data, enc);
          if (data.length !== 65) {
            throw new Error("Invalid Compact Signature");
          }
          const compactByte = data[0];
          if (compactByte < 27 || compactByte >= 35) {
            throw new Error("Invalid Compact Byte");
          }
          return new _Signature(new BigNumber(data.slice(1, 33)), new BigNumber(data.slice(33, 65)));
        }
        /**
         * Creates an instance of the Signature class.
         *
         * @constructor
         * @param r - The R component of the signature.
         * @param s - The S component of the signature.
         *
         * @example
         * const r = new BigNumber('208755674028...');
         * const s = new BigNumber('564745627577...');
         * const signature = new Signature(r, s);
         */
        constructor(r2, s2) {
          this.r = r2;
          this.s = s2;
        }
        /**
         * Verifies a digital signature.
         *
         * This method will return true if the signature, key, and message hash match.
         * If the data or key do not match the signature, the function returns false.
         *
         * @method verify
         * @param msg - The message to verify.
         * @param key - The public key used to sign the original message.
         * @param enc - The encoding of the msg string.
         * @returns A boolean representing whether the signature is valid.
         *
         * @example
         * const msg = 'The quick brown fox jumps over the lazy dog';
         * const publicKey = PublicKey.fromString('04188ca1050...');
         * const isVerified = signature.verify(msg, publicKey);
         */
        verify(msg, key, enc) {
          const msgHash = new BigNumber(sha256(msg, enc), 16);
          return verify(msgHash, this, key);
        }
        /**
         * Converts an instance of Signature into DER encoding.
         * An alias for the toDER method.
         *
         * If the encoding parameter is set to 'hex', the function will return a hex string.
         * If 'base64', it will return a base64 string.
         * Otherwise, it will return an array of numbers.
         *
         * @method toDER
         * @param enc - The encoding to use for the output.
         * @returns The current instance in DER encoding.
         *
         * @example
         * const der = signature.toString('base64');
         */
        toString(enc) {
          return this.toDER(enc);
        }
        /**
         * Converts an instance of Signature into DER encoding.
         *
         * If the encoding parameter is set to 'hex', the function will return a hex string.
         * If 'base64', it will return a base64 string.
         * Otherwise, it will return an array of numbers.
         *
         * @method toDER
         * @param enc - The encoding to use for the output.
         * @returns The current instance in DER encoding.
         *
         * @example
         * const der = signature.toDER('hex');
         */
        toDER(enc) {
          const constructLength = (arr2, len) => {
            if (len < 128) {
              arr2.push(len);
            } else {
              throw new Error("len must be < 0x80");
            }
          };
          const rmPadding = (buf) => {
            let i = 0;
            const len = buf.length - 1;
            while (buf[i] === 0 && (buf[i + 1] & 128) === 0 && i < len) {
              i++;
            }
            if (i === 0) {
              return buf;
            }
            return buf.slice(i);
          };
          let r2 = this.r.toArray();
          let s2 = this.s.toArray();
          if ((r2[0] & 128) !== 0) {
            r2 = [0].concat(r2);
          }
          if ((s2[0] & 128) !== 0) {
            s2 = [0].concat(s2);
          }
          r2 = rmPadding(r2);
          s2 = rmPadding(s2);
          while (s2[0] === 0 && (s2[1] & 128) === 0) {
            s2 = s2.slice(1);
          }
          let arr = [2];
          constructLength(arr, r2.length);
          arr = arr.concat(r2);
          arr.push(2);
          constructLength(arr, s2.length);
          const backHalf = arr.concat(s2);
          let res = [48];
          constructLength(res, backHalf.length);
          res = res.concat(backHalf);
          if (enc === "hex") {
            return toHex(res);
          } else if (enc === "base64") {
            return toBase64(res);
          } else {
            return res;
          }
        }
        /**
         * Converts an instance of Signature into Compact encoding.
         *
         * If the encoding parameter is set to 'hex', the function will return a hex string.
         * If 'base64', it will return a base64 string.
         * Otherwise, it will return an array of numbers.
         *
         * @method toCompact
         * @param enc - The encoding to use for the output.
         * @returns The current instance in DER encoding.
         *
         * @example
         * const compact = signature.toCompact(3, true, 'base64');
         */
        toCompact(recovery, compressed, enc) {
          if (recovery < 0 || recovery > 3)
            throw new Error("Invalid recovery param");
          if (typeof compressed !== "boolean") {
            throw new TypeError("Invalid compressed param");
          }
          let compactByte = 27 + recovery;
          if (compressed) {
            compactByte += 4;
          }
          let arr = [compactByte];
          arr = arr.concat(this.r.toArray("be", 32));
          arr = arr.concat(this.s.toArray("be", 32));
          if (enc === "hex") {
            return toHex(arr);
          } else if (enc === "base64") {
            return toBase64(arr);
          } else {
            return arr;
          }
        }
        /**
         * Recovers the public key from a signature.
         * This method will return the public key if it finds a valid public key.
         * If it does not find a valid public key, it will throw an error.
         * The recovery factor is a number between 0 and 3.
         * @method RecoverPublicKey
         * @param recovery - The recovery factor.
         * @param e - The message hash.
         * @returns The public key associated with the signature.
         *
         * @example
         * const publicKey = signature.RecoverPublicKey(0, msgHash);
         */
        RecoverPublicKey(recovery, e) {
          const r2 = this.r;
          const s2 = this.s;
          const isYOdd = (recovery & 1) !== 0;
          const isSecondKey = recovery >> 1;
          const curve2 = new Curve();
          const n = curve2.n;
          const G = curve2.g;
          const x = isSecondKey === 0 ? r2 : r2.add(n);
          const R = Point.fromX(x, isYOdd);
          const nR = R.mul(n);
          if (!nR.isInfinity()) {
            throw new Error("nR is not at infinity");
          }
          const eNeg = e.neg().umod(n);
          const rInv = r2.invm(n);
          const srInv = rInv.mul(s2).umod(n);
          const eInvrInv = rInv.mul(eNeg).umod(n);
          const Q = G.mul(eInvrInv).add(R.mul(srInv));
          const pubKey = new PublicKey(Q);
          pubKey.validate();
          return pubKey;
        }
        /**
         * Calculates the recovery factor which will work for a particular public key and message hash.
         * This method will return the recovery factor if it finds a valid recovery factor.
         * If it does not find a valid recovery factor, it will throw an error.
         * The recovery factor is a number between 0 and 3.
         *
         * @method CalculateRecoveryFactor
         * @param msgHash - The message hash.
         * @returns the recovery factor: number
         * /
         * @example
         * const recovery = signature.CalculateRecoveryFactor(publicKey, msgHash);
         */
        CalculateRecoveryFactor(pubkey, msgHash) {
          for (let recovery = 0; recovery < 4; recovery++) {
            let Qprime;
            try {
              Qprime = this.RecoverPublicKey(recovery, msgHash);
            } catch {
              continue;
            }
            if (pubkey.eq(Qprime)) {
              return recovery;
            }
          }
          throw new Error("Unable to find valid recovery factor");
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/DRBG.js
  var DRBG;
  var init_DRBG = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/DRBG.js"() {
      init_Hash();
      init_utils();
      DRBG = class {
        K;
        V;
        constructor(entropy, nonce) {
          const entropyBytes = toArray2(entropy, "hex");
          const nonceBytes = toArray2(nonce, "hex");
          if (entropyBytes.length !== 32) {
            throw new Error("Entropy must be exactly 32 bytes (256 bits)");
          }
          if (nonceBytes.length !== 32) {
            throw new Error("Nonce must be exactly 32 bytes (256 bits)");
          }
          const seedMaterial = entropyBytes.concat(nonceBytes);
          this.K = Array.from({ length: 32 });
          this.V = Array.from({ length: 32 });
          for (let i = 0; i < 32; i++) {
            this.K[i] = 0;
            this.V[i] = 1;
          }
          this.update(seedMaterial);
        }
        /**
         * Generates HMAC using the K value of the instance. This method is used internally for operations.
         *
         * @method hmac
         * @returns The SHA256HMAC object created with K value.
         *
         * @example
         * const hmac = drbg.hmac();
         */
        hmac() {
          return new SHA256HMAC(this.K);
        }
        /**
         * Updates the `K` and `V` values of the instance based on the seed.
         * The seed if not provided uses `V` as seed.
         *
         * @method update
         * @param seed - an optional value that used to update `K` and `V`. Default is `undefined`.
         * @returns Nothing, but updates the internal state `K` and `V` value.
         *
         * @example
         * drbg.update('e13af...');
         */
        update(seed) {
          let kmac = this.hmac().update(this.V).update([0]);
          if (seed !== void 0) {
            kmac = kmac.update(seed);
          }
          this.K = kmac.digest();
          this.V = this.hmac().update(this.V).digest();
          if (seed === void 0) {
            return;
          }
          this.K = this.hmac().update(this.V).update([1]).update(seed).digest();
          this.V = this.hmac().update(this.V).digest();
        }
        /**
         * Generates deterministic random hexadecimal string of given length.
         * In every generation process, it also updates the internal state `K` and `V`.
         *
         * @method generate
         * @param len - The length of required random number.
         * @returns The required deterministic random hexadecimal string.
         *
         * @example
         * const randomHex = drbg.generate(256);
         */
        generate(len) {
          let temp = [];
          while (temp.length < len) {
            this.V = this.hmac().update(this.V).digest();
            temp = temp.concat(this.V);
          }
          const res = temp.slice(0, len);
          this.update();
          return toHex(res);
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/ECDSA.js
  function truncateToN(msg, truncOnly, curve2 = new Curve()) {
    const delta = msg.byteLength() * 8 - curve2.n.bitLength();
    if (delta > 0) {
      msg.iushrn(delta);
    }
    if (truncOnly !== true && msg.cmp(curve2.n) >= 0) {
      return msg.sub(curve2.n);
    } else {
      return msg;
    }
  }
  function bnToBigInt(bn) {
    const bytes3 = bn.toArray("be");
    let x = 0n;
    for (const byte of bytes3) {
      x = x << 8n | BigInt(byte);
    }
    return x;
  }
  function selectK(customK, iter, drbg) {
    let selected;
    if (typeof customK === "function") {
      selected = customK(iter);
    } else if (customK !== void 0 && BigNumber.isBN(customK)) {
      selected = customK;
    } else {
      selected = new BigNumber(drbg.generate(bytes), 16);
    }
    if (selected == null)
      throw new Error("k is undefined");
    return truncateToN(selected, true);
  }
  function retryOrRejectFixedK(fixedK, message) {
    if (fixedK)
      throw new Error(message);
    return void 0;
  }
  function signatureFromK(kBN, msgBig, keyBig, forceLowS, fixedK) {
    if (kBN.cmpn(1) < 0 || kBN.cmp(ns1) > 0) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (must be >1 and <N-1)");
    }
    const R = curve.g.mulCT(kBN);
    if (R.isInfinity()) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (k\xB7G at infinity)");
    }
    const rBig = modN(BigInt("0x" + R.getX().toString(16)));
    if (rBig === 0n) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (r == 0)");
    }
    const kInv = modInvN(BigInt("0x" + kBN.toString(16)));
    const sum = modN(msgBig + modMulN(rBig, keyBig));
    let sBig = modMulN(kInv, sum);
    if (sBig === 0n) {
      return retryOrRejectFixedK(fixedK, "Invalid fixed custom K value (s == 0)");
    }
    if (forceLowS && sBig > halfN)
      sBig = N_BIGINT - sBig;
    return new Signature(new BigNumber(rBig.toString(16), 16), new BigNumber(sBig.toString(16), 16));
  }
  var curve, bytes, ns1, halfN, sign, verify;
  var init_ECDSA = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/ECDSA.js"() {
      init_BigNumber();
      init_Signature();
      init_Curve();
      init_Point();
      init_DRBG();
      curve = new Curve();
      bytes = curve.n.byteLength();
      ns1 = curve.n.subn(1);
      halfN = N_BIGINT >> 1n;
      sign = (msg, key, forceLowS = false, customK) => {
        const nBitLength = curve.n.bitLength();
        if (msg.bitLength() > nBitLength) {
          throw new Error(`ECDSA message is too large: expected <= ${nBitLength} bits. Callers must hash messages before signing.`);
        }
        msg = truncateToN(msg);
        const msgBig = bnToBigInt(msg);
        const keyBig = bnToBigInt(key);
        const bkey = key.toArray("be", bytes);
        const nonce = msg.toArray("be", bytes);
        const drbg = new DRBG(bkey, nonce);
        const fixedK = BigNumber.isBN(customK);
        for (let iter = 0; ; iter++) {
          const signature = signatureFromK(selectK(customK, iter, drbg), msgBig, keyBig, forceLowS, fixedK);
          if (signature != null)
            return signature;
        }
      };
      verify = (msg, sig, key) => {
        const nBitLength = curve.n.bitLength();
        if (msg.bitLength() > nBitLength) {
          return false;
        }
        const hash = bnToBigInt(msg);
        if (key.x == null || key.y == null) {
          throw new Error("Invalid public key: missing coordinates.");
        }
        const publicKey = {
          x: bnToBigInt(key.x),
          y: bnToBigInt(key.y)
        };
        const signature = {
          r: bnToBigInt(sig.r),
          s: bnToBigInt(sig.s)
        };
        const { r: r2, s: s2 } = signature;
        const z = hash;
        if (r2 <= BI_ZERO || r2 >= N_BIGINT || s2 <= BI_ZERO || s2 >= N_BIGINT) {
          return false;
        }
        const w = modInvN(s2);
        if (w === 0n)
          return false;
        const u1 = modMulN(z, w);
        const u2 = modMulN(r2, w);
        const RG = scalarMultiplyWNAF(u1, { x: GX_BIGINT, y: GY_BIGINT });
        const RQ = scalarMultiplyWNAF(u2, publicKey);
        const R = jpAdd(RG, RQ);
        if (R.Z === 0n)
          return false;
        const zInv = biModInv(R.Z);
        const zInv2 = biModMul(zInv, zInv);
        const xAff = biModMul(R.X, zInv2);
        const v = modN(xAff);
        return v === r2;
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Random.js
  var Rand, ayn, Random, Random_default;
  var init_Random = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Random.js"() {
      Rand = class {
        _rand;
        // ✅ Explicit function type
        getRandomValues(obj, n) {
          const arr = new Uint8Array(n);
          obj.crypto.getRandomValues(arr);
          return Array.from(arr);
        }
        constructor() {
          const noRand = () => {
            throw new Error("No secure random number generator is available in this environment.");
          };
          this._rand = noRand;
          if (typeof globalThis !== "undefined" && typeof globalThis.crypto?.getRandomValues === "function") {
            this._rand = (n) => {
              return this.getRandomValues(globalThis, n);
            };
            return;
          }
          if (globalThis.self !== void 0 && typeof globalThis.self.crypto?.getRandomValues === "function") {
            this._rand = (n) => {
              return this.getRandomValues(globalThis.self, n);
            };
            return;
          }
          if (globalThis.window !== void 0 && typeof globalThis.window.crypto?.getRandomValues === "function") {
            this._rand = (n) => {
              return this.getRandomValues(globalThis.window, n);
            };
            return;
          }
          if (typeof process !== "undefined" && typeof process.getBuiltinModule === "function") {
            const nodeCrypto = process.getBuiltinModule("node:crypto");
            if (typeof nodeCrypto?.randomBytes === "function") {
              this._rand = (n) => Array.from(nodeCrypto.randomBytes(n));
              return;
            }
          }
          this._rand = noRand;
        }
        generate(len) {
          return this._rand(len);
        }
      };
      ayn = null;
      Random = (len) => {
        ayn ??= new Rand();
        return ayn.generate(len);
      };
      Random_default = Random;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/Polynomial.js
  function assertPolynomialThreshold(threshold, pointCount, minimum) {
    if (!Number.isSafeInteger(threshold) || threshold < minimum || threshold > MAX_SHAMIR_SHARES) {
      throw new TypeError(`threshold must be a safe integer from ${minimum} to ${MAX_SHAMIR_SHARES}`);
    }
    if (threshold > pointCount)
      throw new Error("threshold cannot exceed the number of points");
  }
  var MAX_SHAMIR_SHARES, MAX_POINT_STRING_LENGTH, BASE58_FIELD, PointInFiniteField, Polynomial;
  var init_Polynomial = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/Polynomial.js"() {
      init_BigNumber();
      init_Curve();
      init_Random();
      init_utils();
      MAX_SHAMIR_SHARES = 255;
      MAX_POINT_STRING_LENGTH = 129;
      BASE58_FIELD = /^[1-9A-HJ-NP-Za-km-z]{1,64}$/;
      PointInFiniteField = class _PointInFiniteField {
        x;
        y;
        constructor(x, y) {
          const P = new Curve().p;
          this.x = x.umod(P);
          this.y = y.umod(P);
        }
        toString() {
          return toBase58(this.x.toArray()) + "." + toBase58(this.y.toArray());
        }
        static fromString(str) {
          if (typeof str !== "string" || str.length > MAX_POINT_STRING_LENGTH) {
            throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
          }
          const [x, y, extra] = str.split(".");
          if (extra !== void 0 || x === void 0 || y === void 0 || !BASE58_FIELD.test(x) || !BASE58_FIELD.test(y)) {
            throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
          }
          const point = new _PointInFiniteField(new BigNumber(fromBase58(x)), new BigNumber(fromBase58(y)));
          if (point.toString() !== str) {
            throw new TypeError("Finite-field point must use a bounded canonical Base58 representation");
          }
          return point;
        }
      };
      Polynomial = class _Polynomial {
        points;
        threshold;
        constructor(points, threshold) {
          if (!Array.isArray(points) || points.length === 0 || points.length > MAX_SHAMIR_SHARES) {
            throw new TypeError(`points must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
          }
          const resolvedThreshold = threshold ?? points.length;
          assertPolynomialThreshold(resolvedThreshold, points.length, 1);
          this.points = points.slice();
          this.threshold = resolvedThreshold;
        }
        static fromPrivateKey(key, threshold) {
          if (!Number.isSafeInteger(threshold) || threshold < 2 || threshold > MAX_SHAMIR_SHARES) {
            throw new TypeError(`threshold must be a safe integer from 2 to ${MAX_SHAMIR_SHARES}`);
          }
          const P = new Curve().p;
          const points = [
            new PointInFiniteField(new BigNumber(0), new BigNumber(key.toArray()))
          ];
          for (let i = 1; i < threshold; i++) {
            const randomX = new BigNumber(Random_default(32)).umod(P);
            const randomY = new BigNumber(Random_default(32)).umod(P);
            points.push(new PointInFiniteField(randomX, randomY));
          }
          return new _Polynomial(points);
        }
        // Evaluate the polynomial at x by using Lagrange interpolation
        valueAt(x) {
          assertPolynomialThreshold(this.threshold, this.points.length, 1);
          if (!(x instanceof BigNumber))
            throw new TypeError("x must be a BigNumber");
          const P = new Curve().p;
          const seenXCoordinates = /* @__PURE__ */ new Set();
          for (let index = 0; index < this.threshold; index++) {
            const point = this.points[index];
            if (!(point instanceof PointInFiniteField) || !(point.x instanceof BigNumber) || !(point.y instanceof BigNumber)) {
              throw new TypeError("points must contain finite-field points");
            }
            if (point.x.isNeg() || point.y.isNeg() || point.x.gte(P) || point.y.gte(P)) {
              throw new TypeError("point coordinates must be canonical field elements");
            }
            const xCoordinate = point.x.toString(16);
            if (seenXCoordinates.has(xCoordinate))
              throw new Error("Polynomial points must have unique x coordinates");
            seenXCoordinates.add(xCoordinate);
          }
          const normalizedX = x.umod(P);
          let y = new BigNumber(0);
          for (let i = 0; i < this.threshold; i++) {
            let term = this.points[i].y;
            for (let j = 0; j < this.threshold; j++) {
              if (i !== j) {
                const xj = this.points[j].x;
                const xi = this.points[i].x;
                const numerator = normalizedX.sub(xj).umod(P);
                const denominator = xi.sub(xj).umod(P);
                const denominatorInverse = denominator.invm(P);
                const fraction = numerator.mul(denominatorInverse).umod(P);
                term = term.mul(fraction).umod(P);
              }
            }
            y = y.add(term).umod(P);
          }
          return y;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/PrivateKey.js
  function assertKeyShareCollection(points, threshold, integrity) {
    if (!Array.isArray(points) || points.length === 0 || points.length > MAX_SHAMIR_SHARES) {
      throw new TypeError(`shares must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
    }
    if (!Number.isSafeInteger(threshold) || threshold < 2 || threshold > MAX_SHAMIR_SHARES) {
      throw new TypeError(`threshold must be a safe integer from 2 to ${MAX_SHAMIR_SHARES}`);
    }
    if (typeof integrity !== "string" || !BACKUP_SHARE_INTEGRITY.test(integrity)) {
      throw new TypeError("integrity must be an 8-character lowercase hexadecimal string");
    }
  }
  var MAX_BACKUP_SHARE_LENGTH, BACKUP_SHARE_FIELD, BACKUP_SHARE_THRESHOLD, BACKUP_SHARE_INTEGRITY, KeyShares, PrivateKey;
  var init_PrivateKey = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/PrivateKey.js"() {
      init_BigNumber();
      init_PublicKey();
      init_Curve();
      init_ECDSA();
      init_Hash();
      init_Random();
      init_utils();
      init_Polynomial();
      MAX_BACKUP_SHARE_LENGTH = 256;
      BACKUP_SHARE_FIELD = /^[1-9A-HJ-NP-Za-km-z]{1,64}$/;
      BACKUP_SHARE_THRESHOLD = /^(?:[2-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
      BACKUP_SHARE_INTEGRITY = /^[0-9a-f]{8}$/;
      KeyShares = class _KeyShares {
        points;
        threshold;
        integrity;
        constructor(points, threshold, integrity) {
          this.points = points;
          this.threshold = threshold;
          this.integrity = integrity;
        }
        /**
         * Parse one or more canonical bounded backup shares. Each share uses
         * `x.y.threshold.integrity`, where the threshold is from 2 through 255.
         */
        static fromBackupFormat(shares) {
          if (!Array.isArray(shares) || shares.length === 0 || shares.length > MAX_SHAMIR_SHARES) {
            throw new TypeError(`shares must contain from 1 to ${MAX_SHAMIR_SHARES} entries`);
          }
          let threshold = 0;
          let integrity = "";
          const points = [];
          for (let idx = 0; idx < shares.length; idx++) {
            if (!Object.prototype.hasOwnProperty.call(shares, idx))
              throw new TypeError("shares must be a dense array");
            const share = shares[idx];
            if (typeof share !== "string" || share.length > MAX_BACKUP_SHARE_LENGTH) {
              throw new TypeError(`Invalid share format in share ${idx.toString()}`);
            }
            const shareParts = share.split(".");
            if (shareParts.length !== 4) {
              throw new Error(`Invalid share format in share ${idx.toString()}. Expected format: "x.y.t.i"`);
            }
            const [x, y, t, i] = shareParts;
            if (x === void 0 || y === void 0 || t === void 0 || i === void 0 || !BACKUP_SHARE_FIELD.test(x) || !BACKUP_SHARE_FIELD.test(y) || !BACKUP_SHARE_THRESHOLD.test(t) || !BACKUP_SHARE_INTEGRITY.test(i)) {
              throw new TypeError(`Invalid canonical share data in share ${idx.toString()}`);
            }
            const tInt = Number(t);
            if (idx !== 0 && threshold !== tInt) {
              throw new Error("Threshold mismatch in share " + idx.toString());
            }
            if (idx !== 0 && integrity !== i) {
              throw new Error("Integrity mismatch in share " + idx.toString());
            }
            threshold = tInt;
            integrity = i;
            points.push(PointInFiniteField.fromString(`${x}.${y}`));
          }
          assertKeyShareCollection(points, threshold, integrity);
          return new _KeyShares(points, threshold, integrity);
        }
        toBackupFormat() {
          assertKeyShareCollection(this.points, this.threshold, this.integrity);
          const result = [];
          for (let index = 0; index < this.points.length; index++) {
            if (!Object.prototype.hasOwnProperty.call(this.points, index))
              throw new TypeError("shares must be a dense array");
            const point = this.points[index];
            if (!(point instanceof PointInFiniteField))
              throw new TypeError("shares must contain finite-field points");
            const serialized = point.toString();
            if (PointInFiniteField.fromString(serialized).toString() !== serialized) {
              throw new TypeError("shares must contain canonical finite-field points");
            }
            result.push(`${serialized}.${this.threshold.toString()}.${this.integrity}`);
          }
          return result;
        }
      };
      PrivateKey = class _PrivateKey extends BigNumber {
        /**
         * Generates a private key randomly.
         *
         * @method fromRandom
         * @static
         * @returns The newly generated Private Key.
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         */
        static fromRandom() {
          return new _PrivateKey(Random_default(32));
        }
        /**
         * Generates a private key from a string.
         *
         * @method fromString
         * @static
         * @param str - The string to generate the private key from.
         * @param base - The base of the string.
         * @returns The generated Private Key.
         * @throws Will throw an error if the string is not valid.
         **/
        static fromString(str, base = "hex") {
          return new _PrivateKey(super.fromString(str, base).toArray());
        }
        /**
         * Generates a private key from a hexadecimal string.
         *
         * @method fromHex
         * @static
         * @param {string} str - The hexadecimal string representing the private key. The string must represent a valid private key in big-endian format.
         * @returns {PrivateKey} The generated Private Key instance.
         * @throws {Error} If the string is not a valid hexadecimal or represents an invalid private key.
         **/
        static fromHex(str) {
          return new _PrivateKey(super.fromHex(str, "big"));
        }
        /**
         * Generates a private key from a WIF (Wallet Import Format) string.
         *
         * @method fromWif
         * @static
         * @param wif - The WIF string to generate the private key from.
         * @param base - The base of the string.
         * @returns The generated Private Key.
         * @throws Will throw an error if the string is not a valid WIF.
         **/
        static fromWif(wif, prefixLength = 1) {
          const decoded = fromBase58Check(wif, void 0, prefixLength);
          if (decoded.data.length !== 33) {
            throw new Error("Invalid WIF length");
          }
          if (decoded.data[32] !== 1) {
            throw new Error("Invalid WIF padding");
          }
          return new _PrivateKey(decoded.data.slice(0, 32));
        }
        /**
         * @constructor
         *
         * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
         *
         * @param base - The base of number provided. By default is 10. Ignored if number is BigNumber.
         *
         * @param endian - The endianness provided. By default is 'big endian'. Ignored if number is BigNumber.
         *
         * @param modN - Optional. Default 'apply. If 'apply', apply modN to input to guarantee a valid PrivateKey. If 'error', if input is out of field throw new Error('Input is out of field'). If 'nocheck', assumes input is in field.
         *
         * @example
         * import PrivateKey from './PrivateKey';
         * import BigNumber from './BigNumber';
         * const privKey = new PrivateKey(new BigNumber('123456', 10, 'be'));
         */
        constructor(number = 0, base = 10, endian = "be", modN2 = "apply") {
          if (number instanceof BigNumber) {
            super();
            number.copy(this);
          } else {
            super(number, base, endian);
          }
          if (modN2 !== "nocheck") {
            const check = this.checkInField();
            if (!check.inField) {
              if (modN2 === "error") {
                throw new Error("Input is out of field");
              }
              BigNumber.move(this, check.modN);
            }
          }
        }
        /**
         * A utility function to check that the value of this PrivateKey lies in the field limited by curve.n
         * @returns { inField, modN } where modN is this PrivateKey's current BigNumber value mod curve.n, and inField is true only if modN equals current BigNumber value.
         */
        checkInField() {
          const curve2 = new Curve();
          const modN2 = this.mod(curve2.n);
          const inField = this.cmp(modN2) === 0;
          return { inField, modN: modN2 };
        }
        /**
         * @returns true if the PrivateKey's current BigNumber value lies in the field limited by curve.n
         */
        isValid() {
          return this.checkInField().inField;
        }
        /**
         * Signs a message using the private key.
         *
         * @method sign
         * @param msg - The message (array of numbers or string) to be signed.
         * @param enc - If 'hex' the string will be treated as hex, utf8 otherwise.
         * @param forceLowS - If true (the default), the signature will be forced to have a low S value.
         * @param customK — If provided, uses a custom K-value for the signature. Provie a function that returns a BigNumber, or the BigNumber itself.
         * @returns A digital signature generated from the hash of the message and the private key.
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         * const signature = privateKey.sign('Hello, World!');
         */
        sign(msg, enc, forceLowS = true, customK) {
          const msgHash = new BigNumber(sha256(msg, enc), 16);
          return sign(msgHash, this, forceLowS, customK);
        }
        /**
         * Verifies a message's signature using the public key associated with this private key.
         *
         * @method verify
         * @param msg - The original message which has been signed.
         * @param sig - The signature to be verified.
         * @param enc - The data encoding method.
         * @returns Whether or not the signature is valid.
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         * const signature = privateKey.sign('Hello, World!');
         * const isSignatureValid = privateKey.verify('Hello, World!', signature);
         */
        verify(msg, sig, enc) {
          const msgHash = new BigNumber(sha256(msg, enc), 16);
          return verify(msgHash, sig, this.toPublicKey());
        }
        /**
         * Converts the private key to its corresponding public key.
         *
         * The public key is generated by multiplying the base point G of the curve and the private key.
         *
         * @method toPublicKey
         * @returns The generated PublicKey.
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         * const publicKey = privateKey.toPublicKey();
         */
        toPublicKey() {
          const c = new Curve();
          const p = c.g.mulCT(this);
          return new PublicKey(p.x, p.y);
        }
        /**
         * Converts the private key to a Wallet Import Format (WIF) string.
         *
         * Base58Check encoding is used for encoding the private key.
         * The prefix
         *
         * @method toWif
         * @returns The WIF string.
         *
         * @param prefix defaults to [0x80] for mainnet, set it to [0xef] for testnet.
         *
         * @throws Error('Value is out of field') if current BigNumber value is out of field limited by curve.n
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         * const wif = privateKey.toWif();
         * const testnetWif = privateKey.toWif([0xef]);
         */
        toWif(prefix = [128]) {
          if (!this.isValid()) {
            throw new Error("Value is out of field");
          }
          return toBase58Check([...this.toArray("be", 32), 1], prefix);
        }
        /**
         * Base58Check encodes the hash of the public key associated with this private key with a prefix to indicate locking script type.
         * Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".
         *
         * @param prefix defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'testnet' or 'mainnet'
         *
         * @returns Returns the address encoding associated with the hash of the public key associated with this private key.
         *
         * @example
         * const address = privkey.toAddress()
         * const address = privkey.toAddress('mainnet')
         * const testnetAddress = privkey.toAddress([0x6f])
         * const testnetAddress = privkey.toAddress('testnet')
         */
        toAddress(prefix = [0]) {
          return this.toPublicKey().toAddress(prefix);
        }
        /**
         * Converts this PrivateKey to a hexadecimal string.
         *
         * @method toHex
         * @param length - The minimum length of the hex string
         * @returns Returns a string representing the hexadecimal value of this BigNumber.
         *
         * @example
         * const bigNumber = new BigNumber(255);
         * const hex = bigNumber.toHex();
         */
        toHex() {
          return super.toHex(32);
        }
        /**
         * Converts this PrivateKey to a string representation.
         *
         * @method toString
         * @param {number | 'hex'} [base='hex'] - The base for representing the number. Default is hexadecimal ('hex').
         * @param {number} [padding=64] - The minimum number of digits for the output string. Default is 64, ensuring a 256-bit representation in hexadecimal.
         * @returns {string} A string representation of the PrivateKey in the specified base, padded to the specified length.
         *
         **/
        toString(base = "hex", padding = 64) {
          return super.toString(base, padding);
        }
        /**
         * Derives a shared secret from the public key.
         *
         * @method deriveSharedSecret
         * @param key - The public key to derive the shared secret from.
         * @returns The derived shared secret (a point on the curve).
         * @throws Will throw an error if the public key is not valid.
         *
         * @example
         * const privateKey = PrivateKey.fromRandom();
         * const publicKey = privateKey.toPublicKey();
         * const sharedSecret = privateKey.deriveSharedSecret(publicKey);
         */
        deriveSharedSecret(key) {
          if (!key.validate()) {
            throw new Error("Public key not valid for ECDH secret derivation");
          }
          return key.mulCT(this);
        }
        /**
         * SECURITY NOTE – DETERMINISTIC CHILD KEY DERIVATION
         *
         * This method derives child private keys deterministically from the caller’s
         * long-term private key, the counterparty’s public key, and a caller-supplied
         * invoice number using HMAC over an ECDH shared secret (BRC-42 style derivation).
         *
         * This construction does NOT implement a formally authenticated key exchange
         * (AKE) and does NOT provide the following security properties:
         *
         *  - Forward secrecy: Compromise of a long-term private key compromises all
         *    past and future child keys derived from it.
         *  - Replay protection: Child keys are deterministic for a given invoice
         *    number and key pair; previously observed messages can be replayed.
         *  - Explicit authentication / identity binding: Possession of a public key
         *    alone does not guarantee the intended peer identity, enabling potential
         *    identity misbinding attacks if higher-level identity verification is absent.
         *
         * This derivation is intended for lightweight, deterministic key hierarchies
         * where both parties already possess and trust each other’s long-term public
         * keys. It SHOULD NOT be used as a drop-in replacement for a standard
         * authenticated key exchange (e.g. X3DH, Noise, or SIGMA) in high-security or
         * high-value contexts.
         *
         * Any future protocol providing forward secrecy, replay protection, or strong
         * peer authentication will require a versioned, breaking change.
         */
        /**
         * Derives a child key with BRC-42.
         * @param publicKey The public key of the other party
         * @param invoiceNumber The invoice number used to derive the child key
         * @param cacheSharedSecret Optional function to cache shared secrets
         * @param retrieveCachedSharedSecret Optional function to retrieve shared secrets from the cache
         * @returns The derived child key.
         */
        deriveChild(publicKey, invoiceNumber, cacheSharedSecret, retrieveCachedSharedSecret) {
          let sharedSecret;
          if (typeof retrieveCachedSharedSecret === "function") {
            const retrieved = retrieveCachedSharedSecret(this, publicKey);
            if (retrieved === void 0) {
              sharedSecret = this.deriveSharedSecret(publicKey);
              if (typeof cacheSharedSecret === "function") {
                cacheSharedSecret(this, publicKey, sharedSecret);
              }
            } else {
              sharedSecret = retrieved;
            }
          } else {
            sharedSecret = this.deriveSharedSecret(publicKey);
          }
          const invoiceNumberBin = toArray2(invoiceNumber, "utf8");
          const hmac2 = sha256hmac(sharedSecret.encode(true), invoiceNumberBin);
          const curve2 = new Curve();
          return new _PrivateKey(this.add(new BigNumber(hmac2)).mod(curve2.n).toArray());
        }
        /**
         * Splits the private key into shares using Shamir's Secret Sharing Scheme.
         *
         * @param threshold The minimum number of shares required to reconstruct the private key.
         * @param totalShares The total number of shares to generate.
         * Both values must be safe integers from 2 through 255.
         * @param prime The prime number to be used in Shamir's Secret Sharing Scheme.
         * @returns An array of shares.
         *
         * @example
         * const key = PrivateKey.fromRandom()
         * const shares = key.toKeyShares(2, 5)
         */
        toKeyShares(threshold, totalShares) {
          if (typeof threshold !== "number" || typeof totalShares !== "number") {
            throw new TypeError("threshold and totalShares must be numbers");
          }
          if (!Number.isSafeInteger(threshold) || !Number.isSafeInteger(totalShares)) {
            throw new TypeError("threshold and totalShares must be safe integers");
          }
          if (threshold < 2)
            throw new Error("threshold must be at least 2");
          if (totalShares < 2)
            throw new Error("totalShares must be at least 2");
          if (threshold > totalShares) {
            throw new Error("threshold should be less than or equal to totalShares");
          }
          if (threshold > MAX_SHAMIR_SHARES || totalShares > MAX_SHAMIR_SHARES) {
            throw new RangeError(`threshold and totalShares cannot exceed ${MAX_SHAMIR_SHARES}`);
          }
          const poly = Polynomial.fromPrivateKey(this, threshold);
          const points = [];
          const usedXCoordinates = /* @__PURE__ */ new Set();
          const curve2 = new Curve();
          const seed = Random_default(64);
          for (let i = 0; i < totalShares; i++) {
            let x;
            let attempts = 0;
            do {
              const counter = [i, attempts, ...Random_default(32)];
              const h = sha512hmac(seed, counter);
              x = new BigNumber(h).umod(curve2.p);
              attempts++;
              if (attempts > 5) {
                throw new Error("Failed to generate unique x coordinate after 5 attempts");
              }
            } while (x.isZero() || usedXCoordinates.has(x.toString()));
            usedXCoordinates.add(x.toString());
            const y = poly.valueAt(x);
            points.push(new PointInFiniteField(x, y));
          }
          const integrity = this.toPublicKey().toHash("hex").slice(0, 8);
          return new KeyShares(points, threshold, integrity);
        }
        /**
         * @method toBackupShares
         *
         * Creates a backup of the private key by splitting it into shares.
         *
         *
         * @param threshold The number of shares which will be required to reconstruct the private key.
         * @param totalShares The number of shares to generate for distribution.
         * Both values must be safe integers from 2 through 255.
         * @returns
         */
        toBackupShares(threshold, totalShares) {
          return this.toKeyShares(threshold, totalShares).toBackupFormat();
        }
        /**
         *
         * @method fromBackupShares
         *
         * Creates a private key from backup shares.
         *
         * @param shares
         * @returns PrivateKey
         *
         * @example
         *
         * const share1 = '3znuzt7DZp8HzZTfTh5MF9YQKNX3oSxTbSYmSRGrH2ev.2Nm17qoocmoAhBTCs8TEBxNXCskV9N41rB2PckcgYeqV.2.35449bb9'
         * const share2 = 'Cm5fuUc39X5xgdedao8Pr1kvCSm8Gk7Cfenc7xUKcfLX.2juyK9BxCWn2DiY5JUAgj9NsQ77cc9bWksFyW45haXZm.2.35449bb9'
         *
         * const recoveredKey = PrivateKey.fromBackupShares([share1, share2])
         */
        static fromBackupShares(shares) {
          return _PrivateKey.fromKeyShares(KeyShares.fromBackupFormat(shares));
        }
        /**
         * Combines shares to reconstruct the private key.
         *
         * @param shares An array of points (shares) to be used to reconstruct the private key.
         * @param threshold The minimum number of shares required to reconstruct the private key.
         *
         * @returns The reconstructed private key.
         *
         **/
        static fromKeyShares(keyShares) {
          if (keyShares === null || typeof keyShares !== "object")
            throw new TypeError("keyShares must be an object");
          const points = keyShares.points;
          const threshold = keyShares.threshold;
          const integrity = keyShares.integrity;
          assertKeyShareCollection(points, threshold, integrity);
          if (points.length < threshold) {
            throw new Error(`At least ${threshold} shares are required to reconstruct the private key`);
          }
          const ownedPoints = [];
          const P = new Curve().p;
          for (let index = 0; index < threshold; index++) {
            if (!Object.prototype.hasOwnProperty.call(points, index))
              throw new TypeError("shares must be a dense array");
            const point = points[index];
            if (!(point instanceof PointInFiniteField) || !(point.x instanceof BigNumber) || !(point.y instanceof BigNumber)) {
              throw new TypeError("shares must contain finite-field points");
            }
            if (point.x.isNeg() || point.y.isNeg() || point.x.gte(P) || point.y.gte(P)) {
              throw new TypeError("share coordinates must be canonical field elements");
            }
            ownedPoints.push(new PointInFiniteField(new BigNumber(point.x.toArray()), new BigNumber(point.y.toArray())));
          }
          for (let i = 0; i < threshold; i++) {
            for (let j = i + 1; j < threshold; j++) {
              if (ownedPoints[i].x.eq(ownedPoints[j].x)) {
                throw new Error("Duplicate share detected, each must be unique.");
              }
            }
          }
          const poly = new Polynomial(ownedPoints, threshold);
          const privateKey = new _PrivateKey(poly.valueAt(new BigNumber(0)).toArray());
          const integrityHash = privateKey.toPublicKey().toHash("hex").slice(0, 8);
          if (integrityHash !== integrity) {
            throw new Error("Integrity hash mismatch");
          }
          return privateKey;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/OP.js
  var namedOP, OP, OP_default;
  var init_OP = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/OP.js"() {
      namedOP = {
        // push value
        OP_0: 0,
        // when two op codes have the same value, the top one will be used in standard ASM output
        OP_FALSE: 0,
        OP_PUSHDATA1: 76,
        OP_PUSHDATA2: 77,
        OP_PUSHDATA4: 78,
        OP_1NEGATE: 79,
        OP_RESERVED: 80,
        OP_1: 81,
        OP_TRUE: 81,
        OP_2: 82,
        OP_3: 83,
        OP_4: 84,
        OP_5: 85,
        OP_6: 86,
        OP_7: 87,
        OP_8: 88,
        OP_9: 89,
        OP_10: 90,
        OP_11: 91,
        OP_12: 92,
        OP_13: 93,
        OP_14: 94,
        OP_15: 95,
        OP_16: 96,
        // control
        OP_NOP: 97,
        OP_VER: 98,
        OP_IF: 99,
        OP_NOTIF: 100,
        OP_VERIF: 101,
        OP_VERNOTIF: 102,
        OP_ELSE: 103,
        OP_ENDIF: 104,
        OP_VERIFY: 105,
        OP_RETURN: 106,
        // stack ops
        OP_TOALTSTACK: 107,
        OP_FROMALTSTACK: 108,
        OP_2DROP: 109,
        OP_2DUP: 110,
        OP_3DUP: 111,
        OP_2OVER: 112,
        OP_2ROT: 113,
        OP_2SWAP: 114,
        OP_IFDUP: 115,
        OP_DEPTH: 116,
        OP_DROP: 117,
        OP_DUP: 118,
        OP_NIP: 119,
        OP_OVER: 120,
        OP_PICK: 121,
        OP_ROLL: 122,
        OP_ROT: 123,
        OP_SWAP: 124,
        OP_TUCK: 125,
        // data manipulation ops
        OP_CAT: 126,
        OP_SPLIT: 127,
        // after monolith upgrade (May 2018)
        OP_NUM2BIN: 128,
        // after monolith upgrade (May 2018)
        OP_BIN2NUM: 129,
        // after monolith upgrade (May 2018)
        OP_SIZE: 130,
        // bit logic
        OP_INVERT: 131,
        OP_AND: 132,
        OP_OR: 133,
        OP_XOR: 134,
        OP_EQUAL: 135,
        OP_EQUALVERIFY: 136,
        OP_RESERVED1: 137,
        OP_RESERVED2: 138,
        // numeric
        OP_1ADD: 139,
        OP_1SUB: 140,
        OP_2MUL: 141,
        OP_2DIV: 142,
        OP_NEGATE: 143,
        OP_ABS: 144,
        OP_NOT: 145,
        OP_0NOTEQUAL: 146,
        OP_ADD: 147,
        OP_SUB: 148,
        OP_MUL: 149,
        OP_DIV: 150,
        OP_MOD: 151,
        OP_LSHIFT: 152,
        OP_RSHIFT: 153,
        OP_BOOLAND: 154,
        OP_BOOLOR: 155,
        OP_NUMEQUAL: 156,
        OP_NUMEQUALVERIFY: 157,
        OP_NUMNOTEQUAL: 158,
        OP_LESSTHAN: 159,
        OP_GREATERTHAN: 160,
        OP_LESSTHANOREQUAL: 161,
        OP_GREATERTHANOREQUAL: 162,
        OP_MIN: 163,
        OP_MAX: 164,
        OP_WITHIN: 165,
        // crypto
        OP_RIPEMD160: 166,
        OP_SHA1: 167,
        OP_SHA256: 168,
        OP_HASH160: 169,
        OP_HASH256: 170,
        OP_CODESEPARATOR: 171,
        OP_CHECKSIG: 172,
        OP_CHECKSIGVERIFY: 173,
        OP_CHECKMULTISIG: 174,
        OP_CHECKMULTISIGVERIFY: 175,
        // expansion
        OP_NOP1: 176,
        OP_CHECKLOCKTIMEVERIFY: 177,
        // BIP65 - on BSV post-genesis acts as NOP
        OP_NOP2: 177,
        // alias for OP_CHECKLOCKTIMEVERIFY
        OP_CHECKSEQUENCEVERIFY: 178,
        // BIP112 - on BSV post-genesis acts as NOP
        OP_NOP3: 178,
        // alias for OP_CHECKSEQUENCEVERIFY
        OP_SUBSTR: 179,
        // restored in 2026 CHRONICLE upgrade (was OP_NOP4)
        OP_NOP4: 179,
        // alias for OP_SUBSTR
        OP_LEFT: 180,
        // restored in 2026 CHRONICLE upgrade (was OP_NOP5)
        OP_NOP5: 180,
        // alias for OP_LEFT
        OP_RIGHT: 181,
        // restored in 2026 CHRONICLE upgrade (was OP_NOP6)
        OP_NOP6: 181,
        // alias for OP_RIGHT
        OP_LSHIFTNUM: 182,
        // restored in 2026 CHRONICLE upgrade (was OP_NOP7)
        OP_NOP7: 182,
        // alias for OP_LSHIFTNUM
        OP_RSHIFTNUM: 183,
        // restored in 2026 CHRONICLE upgrade (was OP_NOP8)
        OP_NOP8: 183,
        // alias for OP_RSHIFTNUM
        OP_NOP9: 184,
        OP_NOP10: 185,
        // 0xba–0xf9 are FIRST_UNDEFINED_OP_VALUE in node v1.2.0 and return SCRIPT_ERR_BAD_OPCODE
        // when executed. The names below are retained for ASM parsing/serialisation only.
        OP_NOP11: 186,
        OP_NOP12: 187,
        OP_NOP13: 188,
        OP_NOP14: 189,
        OP_NOP15: 190,
        OP_NOP16: 191,
        OP_NOP17: 192,
        OP_NOP18: 193,
        OP_NOP19: 194,
        OP_NOP20: 195,
        OP_NOP21: 196,
        OP_NOP22: 197,
        OP_NOP23: 198,
        OP_NOP24: 199,
        OP_NOP25: 200,
        OP_NOP26: 201,
        OP_NOP27: 202,
        OP_NOP28: 203,
        OP_NOP29: 204,
        OP_NOP30: 205,
        OP_NOP31: 206,
        OP_NOP32: 207,
        OP_NOP33: 208,
        OP_NOP34: 209,
        OP_NOP35: 210,
        OP_NOP36: 211,
        OP_NOP37: 212,
        OP_NOP38: 213,
        OP_NOP39: 214,
        OP_NOP40: 215,
        OP_NOP41: 216,
        OP_NOP42: 217,
        OP_NOP43: 218,
        OP_NOP44: 219,
        OP_NOP45: 220,
        OP_NOP46: 221,
        OP_NOP47: 222,
        OP_NOP48: 223,
        OP_NOP49: 224,
        OP_NOP50: 225,
        OP_NOP51: 226,
        OP_NOP52: 227,
        OP_NOP53: 228,
        OP_NOP54: 229,
        OP_NOP55: 230,
        OP_NOP56: 231,
        OP_NOP57: 232,
        OP_NOP58: 233,
        OP_NOP59: 234,
        OP_NOP60: 235,
        OP_NOP61: 236,
        OP_NOP62: 237,
        OP_NOP63: 238,
        OP_NOP64: 239,
        OP_NOP65: 240,
        OP_NOP66: 241,
        OP_NOP67: 242,
        OP_NOP68: 243,
        OP_NOP69: 244,
        OP_NOP70: 245,
        OP_NOP71: 246,
        OP_NOP72: 247,
        OP_NOP73: 248,
        OP_NOP77: 252,
        // template matching params (not executable opcodes; 0xf9 was removed from node v1.2.0 opcodes.h
        // but retained here for ASM round-trip compatibility)
        OP_SMALLDATA: 249,
        OP_SMALLINTEGER: 250,
        OP_PUBKEYS: 251,
        OP_PUBKEYHASH: 253,
        OP_PUBKEY: 254,
        OP_INVALIDOPCODE: 255
      };
      OP = namedOP;
      for (const name of Object.keys(namedOP)) {
        const opcode = namedOP[name];
        OP[opcode] ??= name;
      }
      OP_default = OP;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/Script.js
  function scriptSerializationIdentity(script) {
    return script[serializedBytes]();
  }
  function serializedChunkPrefix(chunk) {
    const dataLength = chunk.data?.length ?? 0;
    if (dataLength === 0 || chunk.op === OP_default.OP_RETURN || chunk.op < OP_default.OP_PUSHDATA1) {
      return [chunk.op];
    }
    if (chunk.op === OP_default.OP_PUSHDATA1) {
      return [chunk.op, dataLength & 255];
    }
    if (chunk.op === OP_default.OP_PUSHDATA2) {
      return [chunk.op, dataLength & 255, dataLength >> 8 & 255];
    }
    if (chunk.op === OP_default.OP_PUSHDATA4) {
      const size = dataLength >>> 0;
      return [chunk.op, size & 255, size >> 8 & 255, size >> 16 & 255, size >> 24 & 255];
    }
    return void 0;
  }
  function chunkMatchesBytes(chunk, targetBytes) {
    const prefix = serializedChunkPrefix(chunk);
    const data = chunk.data ?? [];
    if (prefix == null || targetBytes.length !== prefix.length + data.length)
      return false;
    for (let i = 0; i < prefix.length; i++) {
      if (targetBytes[i] !== prefix[i])
        return false;
    }
    for (let i = 0; i < data.length; i++) {
      if (targetBytes[prefix.length + i] !== data[i])
        return false;
    }
    return true;
  }
  var BufferCtor4, serializedBytes, Script;
  var init_Script = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/Script.js"() {
      init_OP();
      init_utils();
      init_BigNumber();
      BufferCtor4 = typeof globalThis === "undefined" ? void 0 : globalThis.Buffer;
      serializedBytes = /* @__PURE__ */ Symbol();
      Script = class _Script {
        #_chunks;
        #parsed;
        #rawBytesCache;
        #hexCache;
        #chunkCacheState;
        /**
         * @method fromASM
         * Static method to construct a Script instance from an ASM (Assembly) formatted string.
         * @param asm - The script in ASM string format.
         * @returns A new Script instance.
         * @example
         * const script = Script.fromASM("OP_DUP OP_HASH160 abcd... OP_EQUALVERIFY OP_CHECKSIG")
         */
        static fromASM(asm) {
          const chunks = [];
          const tokens = asm.split(" ");
          let i = 0;
          while (i < tokens.length) {
            const { chunk, advance } = _Script.#parseASMToken(tokens, i);
            chunks.push(chunk);
            i += advance;
          }
          return new _Script(chunks);
        }
        static #pushdataOpCodeNum(len) {
          if (len >= 0 && len < OP_default.OP_PUSHDATA1)
            return len;
          if (len < Math.pow(2, 8))
            return OP_default.OP_PUSHDATA1;
          if (len < Math.pow(2, 16))
            return OP_default.OP_PUSHDATA2;
          return OP_default.OP_PUSHDATA4;
        }
        static #parseASMToken(tokens, i) {
          const token = tokens[i];
          if (token === "0")
            return { chunk: { op: 0 }, advance: 1 };
          if (token === "-1")
            return { chunk: { op: OP_default.OP_1NEGATE }, advance: 1 };
          const isKnownOp = token.startsWith("OP_") && OP_default[token] !== void 0;
          const opCodeNum = isKnownOp ? OP_default[token] : 0;
          if (opCodeNum === OP_default.OP_PUSHDATA1 || opCodeNum === OP_default.OP_PUSHDATA2 || opCodeNum === OP_default.OP_PUSHDATA4) {
            return { chunk: { data: toArray2(tokens[i + 2], "hex"), op: opCodeNum }, advance: 3 };
          }
          if (!isKnownOp) {
            let hex2 = token;
            if (hex2.length % 2 !== 0)
              hex2 = "0" + hex2;
            const arr = toArray2(hex2, "hex");
            if (encode(arr, "hex") !== hex2) {
              throw new Error("invalid hex string in script");
            }
            return { chunk: { data: arr, op: _Script.#pushdataOpCodeNum(arr.length) }, advance: 1 };
          }
          return { chunk: { op: opCodeNum }, advance: 1 };
        }
        /**
         * @method fromHex
         * Static method to construct a Script instance from a hexadecimal string.
         * @param hex - The script in hexadecimal format.
         * @returns A new Script instance.
         * @example
         * const script = Script.fromHex("76a9...");
         */
        static fromHex(hex2) {
          if (hex2.length === 0)
            return _Script.fromBinary([]);
          if (hex2.length % 2 !== 0) {
            throw new Error("There is an uneven number of characters in the string which suggests it is not hex encoded.");
          }
          let rawBytes;
          try {
            rawBytes = hexToUint8Array(hex2);
          } catch {
            throw new Error("Some elements in this string are not hex encoded.");
          }
          return new _Script([], rawBytes, hex2.toLowerCase(), false);
        }
        /**
         * @method fromBinary
         * Static method to construct a Script instance from a binary array.
         * @param bin - The script in binary array format.
         * @returns A new Script instance.
         * @example
         * const script = Script.fromBinary([0x76, 0xa9, ...])
         */
        static fromBinary(bin) {
          const rawBytes = Uint8Array.from(bin);
          return new _Script([], rawBytes, void 0, false);
        }
        /**
         * Constructs a lazily parsed script over an existing byte view without a copy.
         * The caller must not mutate `bin` while the script is in use.
         */
        static fromBinaryView(bin) {
          return new _Script([], bin, void 0, false);
        }
        /**
         * @constructor
         * Constructs a new Script object.
         * @param chunks=[] - An array of script chunks to directly initialize the script.
         * @param rawBytesCache - Optional serialized bytes that can be reused instead of reserializing `chunks`.
         * @param hexCache - Optional lowercase hex string that matches the serialized bytes, used to satisfy `toHex` quickly.
         * @param parsed - When false the script defers parsing `rawBytesCache` until `chunks` is accessed; defaults to true.
         */
        constructor(chunks = [], rawBytesCache, hexCache, parsed = true) {
          this.#_chunks = chunks;
          this.#parsed = parsed;
          this.#rawBytesCache = rawBytesCache;
          this.#hexCache = hexCache;
        }
        /**
         * Script chunks. Prefer the Script mutation methods or assign a replacement
         * array through this property. In-place chunk and data changes are detected
         * before subsequent serialization.
         */
        get chunks() {
          this.#ensureParsed();
          return this.#_chunks;
        }
        set chunks(value) {
          this.#_chunks = value;
          this.#parsed = true;
          this.#invalidateSerializationCaches();
        }
        #ensureParsed() {
          if (this.#parsed)
            return;
          if (this.#rawBytesCache != null) {
            this.#_chunks = _Script.#parseChunks(this.#rawBytesCache);
          } else {
            this.#_chunks = [];
          }
          this.#parsed = true;
          this.#captureChunkCacheState();
        }
        /**
         * @method toASM
         * Serializes the script to an ASM formatted string.
         * @returns The script in ASM string format.
         */
        toASM() {
          let str = "";
          for (const chunk of this.chunks) {
            str += this.#_chunkToString(chunk);
          }
          return str.slice(1);
        }
        /**
         * @method toHex
         * Serializes the script to a hexadecimal string.
         * @returns The script in hexadecimal format.
         */
        toHex() {
          const bytes3 = this.#getSerializedBytes();
          if (this.#hexCache != null) {
            return this.#hexCache;
          }
          const hex2 = BufferCtor4 == null ? encode(Array.from(bytes3), "hex") : BufferCtor4.from(bytes3).toString("hex");
          this.#hexCache = hex2;
          return hex2;
        }
        /**
         * @method toBinary
         * Serializes the script to a binary array.
         * @returns The script in binary array format.
         */
        toBinary() {
          return Array.from(this.toUint8Array());
        }
        toUint8Array() {
          return Uint8Array.from(this.#getSerializedBytes());
        }
        [serializedBytes]() {
          return this.#getSerializedBytes();
        }
        /**
         * @method writeScript
         * Appends another script to this script.
         * @param script - The script to append.
         * @returns This script instance for chaining.
         */
        writeScript(script) {
          this.#invalidateSerializationCaches();
          this.chunks = this.chunks.concat(script.chunks);
          return this;
        }
        /**
         * @method writeOpCode
         * Appends an opcode to the script.
         * @param op - The opcode to append.
         * @returns This script instance for chaining.
         */
        writeOpCode(op) {
          this.#invalidateSerializationCaches();
          this.chunks.push({ op });
          return this;
        }
        /**
         * @method setChunkOpCode
         * Sets the opcode of a specific chunk in the script.
         * @param i - The index of the chunk.
         * @param op - The opcode to set.
         * @returns This script instance for chaining.
         */
        setChunkOpCode(i, op) {
          this.#invalidateSerializationCaches();
          this.chunks[i] = { op };
          return this;
        }
        /**
         * @method writeBn
         * Appends a BigNumber to the script as an opcode.
         * @param bn - The BigNumber to append.
         * @returns This script instance for chaining.
         */
        writeBn(bn) {
          this.#invalidateSerializationCaches();
          if (bn.cmpn(0) === OP_default.OP_0) {
            this.chunks.push({
              op: OP_default.OP_0
            });
          } else if (bn.cmpn(-1) === 0) {
            this.chunks.push({
              op: OP_default.OP_1NEGATE
            });
          } else if (bn.cmpn(1) >= 0 && bn.cmpn(16) <= 0) {
            this.chunks.push({
              op: bn.toNumber() + OP_default.OP_1 - 1
            });
          } else {
            const buf = bn.toSm("little");
            this.writeBin(buf);
          }
          return this;
        }
        /**
         * @method writeBin
         * Appends binary data to the script, determining the appropriate opcode based on length.
         * @param bin - The binary data to append.
         * @returns This script instance for chaining.
         * @throws {Error} Throws an error if the data is too large to be pushed.
         */
        writeBin(bin) {
          this.#invalidateSerializationCaches();
          let op;
          const data = bin.length > 0 ? bin : void 0;
          if (bin.length > 0 && bin.length < OP_default.OP_PUSHDATA1) {
            op = bin.length;
          } else if (bin.length === 0) {
            op = OP_default.OP_0;
          } else if (bin.length < Math.pow(2, 8)) {
            op = OP_default.OP_PUSHDATA1;
          } else if (bin.length < Math.pow(2, 16)) {
            op = OP_default.OP_PUSHDATA2;
          } else if (bin.length < Math.pow(2, 32)) {
            op = OP_default.OP_PUSHDATA4;
          } else {
            throw new Error("You can't push that much data");
          }
          this.chunks.push({
            data,
            op
          });
          return this;
        }
        /**
         * @method writeNumber
         * Appends a number to the script.
         * @param num - The number to append.
         * @returns This script instance for chaining.
         */
        writeNumber(num) {
          this.#invalidateSerializationCaches();
          this.writeBn(new BigNumber(num));
          return this;
        }
        /**
         * @method removeCodeseparators
         * Removes all OP_CODESEPARATOR opcodes from the script.
         * @returns This script instance for chaining.
         */
        removeCodeseparators() {
          const bytes3 = this.toUint8Array();
          this.#rawBytesCache = Uint8Array.from(_Script.#removeOpcodeBytes(bytes3, OP_default.OP_CODESEPARATOR));
          this.#hexCache = void 0;
          this.#_chunks = [];
          this.#parsed = false;
          return this;
        }
        /**
         * Deletes the given item wherever it appears in the current script.
         *
         * @param script - The script containing the item to delete from the current script.
         *
         * @returns This script instance for chaining.
         */
        findAndDelete(script) {
          this.#invalidateSerializationCaches();
          const targetBytes = script.toUint8Array();
          if (targetBytes.length === 0)
            return this;
          for (let i = 0; i < this.chunks.length; ) {
            if (chunkMatchesBytes(this.chunks[i], targetBytes)) {
              this.chunks.splice(i, 1);
            } else {
              i++;
            }
          }
          return this;
        }
        /**
         * @method isPushOnly
         * Checks if the script contains only push data operations.
         * @returns True if the script is push-only, otherwise false.
         */
        isPushOnly() {
          for (const chunk of this.chunks) {
            const opCodeNum = chunk.op;
            if (opCodeNum > OP_default.OP_16) {
              return false;
            }
          }
          return true;
        }
        /**
         * @method isLockingScript
         * Determines if the script is a locking script.
         * @returns True if the script is a locking script, otherwise false.
         */
        isLockingScript() {
          throw new Error("Not implemented");
        }
        /**
         * @method isUnlockingScript
         * Determines if the script is an unlocking script.
         * @returns True if the script is an unlocking script, otherwise false.
         */
        isUnlockingScript() {
          throw new Error("Not implemented");
        }
        /**
         * @private
         * @method _chunkToString
         * Converts a script chunk to its string representation.
         * @param chunk - The script chunk.
         * @returns The string representation of the chunk.
         */
        static #computeSerializedLength(chunks) {
          let total = 0;
          for (const chunk of chunks) {
            total += 1;
            if (chunk.data == null)
              continue;
            const len = chunk.data.length;
            if (chunk.op === OP_default.OP_RETURN) {
              total += len;
              break;
            }
            if (chunk.op < OP_default.OP_PUSHDATA1) {
              total += len;
            } else if (chunk.op === OP_default.OP_PUSHDATA1) {
              total += 1 + len;
            } else if (chunk.op === OP_default.OP_PUSHDATA2) {
              total += 2 + len;
            } else if (chunk.op === OP_default.OP_PUSHDATA4) {
              total += 4 + len;
            }
          }
          return total;
        }
        #serializeChunksToBytes() {
          const chunks = this.chunks;
          const totalLength = _Script.#computeSerializedLength(chunks);
          const bytes3 = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            bytes3[offset++] = chunk.op;
            if (chunk.data == null)
              continue;
            if (chunk.op === OP_default.OP_RETURN) {
              bytes3.set(chunk.data, offset);
              break;
            }
            offset = _Script.#writeChunkData(bytes3, offset, chunk.op, chunk.data);
          }
          return bytes3;
        }
        #invalidateSerializationCaches() {
          this.#rawBytesCache = void 0;
          this.#hexCache = void 0;
          this.#chunkCacheState = void 0;
        }
        #captureChunkCacheState() {
          this.#chunkCacheState = this.#_chunks.map((ref) => ({
            ref,
            op: ref.op,
            dataRef: ref.data,
            data: ref.data == null ? void 0 : Array.from(ref.data)
          }));
        }
        #chunkCacheMatchesState() {
          if (this.#chunkCacheState?.length !== this.#_chunks.length)
            return false;
          for (let index = 0; index < this.#_chunks.length; index++) {
            const chunk = this.#_chunks[index];
            const state = this.#chunkCacheState[index];
            if (state.ref !== chunk || state.op !== chunk.op || state.dataRef !== chunk.data || state.data?.length !== chunk.data?.length)
              return false;
            if (state.data != null && chunk.data != null) {
              for (let byte = 0; byte < state.data.length; byte++) {
                if (state.data[byte] !== chunk.data[byte])
                  return false;
              }
            }
          }
          return true;
        }
        #getSerializedBytes() {
          if (!this.#parsed && this.#rawBytesCache != null)
            return this.#rawBytesCache;
          this.#ensureParsed();
          if (this.#rawBytesCache == null || !this.#chunkCacheMatchesState()) {
            this.#rawBytesCache = this.#serializeChunksToBytes();
            this.#hexCache = void 0;
            this.#captureChunkCacheState();
          }
          return this.#rawBytesCache;
        }
        static #writeChunkData(target, offset, op, data) {
          const len = data.length;
          if (op < OP_default.OP_PUSHDATA1) {
            target.set(data, offset);
            return offset + len;
          } else if (op === OP_default.OP_PUSHDATA1) {
            target[offset++] = len & 255;
            target.set(data, offset);
            return offset + len;
          } else if (op === OP_default.OP_PUSHDATA2) {
            target[offset++] = len & 255;
            target[offset++] = len >> 8 & 255;
            target.set(data, offset);
            return offset + len;
          } else if (op === OP_default.OP_PUSHDATA4) {
            const size = len >>> 0;
            target[offset++] = size & 255;
            target[offset++] = size >> 8 & 255;
            target[offset++] = size >> 16 & 255;
            target[offset++] = size >> 24 & 255;
            target.set(data, offset);
            return offset + len;
          }
          return offset;
        }
        /**
         * Reads pushdata length bytes from `bytes` at `pos` and returns the resulting
         * `{ len, newPos, hasLength }` for a given opcode. Does not read the actual data.
         */
        static #readPushdataLength(op, bytes3, pos, length) {
          if (op > 0 && op < OP_default.OP_PUSHDATA1) {
            return { len: op, newPos: pos, hasLength: true };
          }
          if (op === OP_default.OP_PUSHDATA1) {
            const hasLength2 = pos < length;
            const len2 = hasLength2 ? bytes3[pos++] ?? 0 : 0;
            return { len: len2, newPos: pos, hasLength: hasLength2 };
          }
          if (op === OP_default.OP_PUSHDATA2) {
            const hasLength2 = pos + 1 < length;
            const len2 = (bytes3[pos] ?? 0) | (bytes3[pos + 1] ?? 0) << 8;
            return { len: len2, newPos: Math.min(pos + 2, length), hasLength: hasLength2 };
          }
          const hasLength = pos + 3 < length;
          const len = ((bytes3[pos] ?? 0) | (bytes3[pos + 1] ?? 0) << 8 | (bytes3[pos + 2] ?? 0) << 16 | (bytes3[pos + 3] ?? 0) << 24) >>> 0;
          return { len, newPos: Math.min(pos + 4, length), hasLength };
        }
        static #parseChunks(bytes3) {
          const chunks = [];
          const length = bytes3.length;
          let pos = 0;
          let inConditionalBlock = 0;
          while (pos < length) {
            const op = bytes3[pos++] ?? 0;
            if (op === OP_default.OP_RETURN && inConditionalBlock === 0) {
              chunks.push({ op, data: _Script.#copyRange(bytes3, pos, length) });
              break;
            }
            if (op === OP_default.OP_IF || op === OP_default.OP_NOTIF || op === OP_default.OP_VERIF || op === OP_default.OP_VERNOTIF) {
              inConditionalBlock++;
            } else if (op === OP_default.OP_ENDIF) {
              inConditionalBlock--;
            }
            if (op > 0 && op <= OP_default.OP_PUSHDATA4) {
              const { len, newPos, hasLength } = _Script.#readPushdataLength(op, bytes3, pos, length);
              pos = newPos;
              const end = Math.min(pos + len, length);
              const invalidLength = !hasLength || end - pos !== len;
              chunks.push({ data: _Script.#copyRange(bytes3, pos, end), op, invalidLength });
              pos = end;
            } else {
              chunks.push({ op });
            }
          }
          return chunks;
        }
        static #removeOpcodeBytes(bytes3, opcode) {
          const out = [];
          const length = bytes3.length;
          let pos = 0;
          while (pos < length) {
            const start = pos;
            const op = bytes3[pos++] ?? 0;
            if (op > 0 && op <= OP_default.OP_PUSHDATA4) {
              const { len, newPos } = _Script.#readPushdataLength(op, bytes3, pos, length);
              pos = newPos;
              const end = Math.min(pos + len, length);
              if (op !== opcode) {
                for (let i = start; i < end; i++)
                  out.push(bytes3[i] ?? 0);
              }
              pos = end;
            } else if (op !== opcode) {
              out.push(op);
            }
          }
          return out;
        }
        static #copyRange(bytes3, start, end) {
          const size = Math.max(end - start, 0);
          const data = Array.from({ length: size }, () => 0);
          for (let i = 0; i < size; i++) {
            data[i] = bytes3[start + i] ?? 0;
          }
          return data;
        }
        #_chunkToString(chunk) {
          const op = chunk.op;
          let str = "";
          if (chunk.data === void 0) {
            const val = OP_default[op];
            str = `${str} ${val}`;
          } else {
            str = `${str} ${toHex(chunk.data)}`;
          }
          return str;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/TransactionSignature.js
  function originalPushLength(source, position, opcode) {
    if (opcode > 0 && opcode < OP_default.OP_PUSHDATA1)
      return { length: opcode, nextPosition: position };
    if (opcode === OP_default.OP_PUSHDATA1) {
      if (source.length - position < 1)
        return void 0;
      return { length: source[position], nextPosition: position + 1 };
    }
    if (opcode === OP_default.OP_PUSHDATA2) {
      if (source.length - position < 2)
        return void 0;
      return { length: source[position] | source[position + 1] << 8, nextPosition: position + 2 };
    }
    if (opcode === OP_default.OP_PUSHDATA4) {
      if (source.length - position < 4)
        return void 0;
      return {
        length: (source[position] | source[position + 1] << 8 | source[position + 2] << 16 | source[position + 3] << 24) >>> 0,
        nextPosition: position + 4
      };
    }
    return { length: 0, nextPosition: position };
  }
  function originalScriptCode(script) {
    const source = script.toBinary();
    const bytes3 = [];
    let position = 0;
    let segmentStart = 0;
    let separators = 0;
    const appendSegment = (end) => {
      for (let index = segmentStart; index < end; index++)
        bytes3.push(source[index]);
    };
    while (position < source.length) {
      const opcodeStart = position;
      const opcode = source[position++];
      const push = originalPushLength(source, position, opcode);
      if (push == null)
        break;
      position = push.nextPosition;
      if (source.length - position < push.length)
        break;
      position += push.length;
      if (opcode === OP_default.OP_CODESEPARATOR) {
        appendSegment(opcodeStart);
        segmentStart = position;
        separators++;
      }
    }
    appendSegment(position);
    return { bytes: bytes3, encodedLength: source.length - separators };
  }
  function bip143Inputs(params, currentInput) {
    if (params.allInputs != null)
      return params.allInputs;
    const inputs = [...params.otherInputs];
    inputs.splice(params.inputIndex, 0, currentInput);
    return inputs;
  }
  function bip143InputAt(inputs, inputIndex, currentInput, index) {
    return index === inputIndex ? currentInput : inputs[index];
  }
  function hashPrevouts(inputs, inputIndex, currentInput) {
    const writer = new Writer();
    for (let index = 0; index < inputs.length; index++) {
      const input = bip143InputAt(inputs, inputIndex, currentInput, index);
      if (input.sourceTXID == null) {
        if (input.sourceTransaction == null)
          throw new Error("Missing sourceTransaction for input");
        writer.write(input.sourceTransaction.hash());
      } else {
        writer.writeReverse(toArray2(input.sourceTXID, "hex"));
      }
      writer.writeUInt32LE(input.sourceOutputIndex);
    }
    return hash256(writer.toUint8Array());
  }
  function hashSequences(inputs, inputIndex, currentInput) {
    const writer = new Writer();
    for (let index = 0; index < inputs.length; index++) {
      const input = bip143InputAt(inputs, inputIndex, currentInput, index);
      writer.writeUInt32LE(input.sequence ?? 4294967295);
    }
    return hash256(writer.toUint8Array());
  }
  function writeBip143Output(writer, output) {
    writer.writeUInt64LE(output.satoshis ?? 0);
    const script = output.lockingScript?.toUint8Array() ?? EMPTY_SCRIPT;
    writer.writeVarIntNum(script.length);
    writer.write(script);
  }
  function hashOutputs(outputs, outputIndex) {
    const writer = new Writer();
    if (outputIndex == null) {
      for (const output of outputs)
        writeBip143Output(writer, output);
    } else {
      const output = outputs[outputIndex];
      if (output == null)
        throw new Error(`Output at index ${outputIndex} does not exist`);
      writeBip143Output(writer, output);
    }
    return hash256(writer.toUint8Array());
  }
  function bip143PrevoutsHash(params, inputs, currentInput) {
    if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) !== 0)
      return [...ZERO_HASH];
    if (params.cache?.hashPrevouts != null)
      return params.cache.hashPrevouts;
    const hash = hashPrevouts(inputs, params.inputIndex, currentInput);
    if (params.cache != null)
      params.cache.hashPrevouts = hash;
    return hash;
  }
  function bip143SequenceHash(params, inputs, currentInput) {
    const baseScope = params.scope & 31;
    if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) !== 0 || baseScope === TransactionSignature.SIGHASH_SINGLE || baseScope === TransactionSignature.SIGHASH_NONE)
      return [...ZERO_HASH];
    if (params.cache?.hashSequence != null)
      return params.cache.hashSequence;
    const hash = hashSequences(inputs, params.inputIndex, currentInput);
    if (params.cache != null)
      params.cache.hashSequence = hash;
    return hash;
  }
  function bip143OutputsHash(params) {
    const baseScope = params.scope & 31;
    if (baseScope !== TransactionSignature.SIGHASH_SINGLE && baseScope !== TransactionSignature.SIGHASH_NONE) {
      if (params.cache?.hashOutputsAll != null)
        return params.cache.hashOutputsAll;
      const hash2 = hashOutputs(params.outputs);
      if (params.cache != null)
        params.cache.hashOutputsAll = hash2;
      return hash2;
    }
    if (baseScope !== TransactionSignature.SIGHASH_SINGLE || params.inputIndex >= params.outputs.length) {
      return [...ZERO_HASH];
    }
    const cached = params.cache?.hashOutputsSingle?.get(params.inputIndex);
    if (cached != null)
      return cached;
    const hash = hashOutputs(params.outputs, params.inputIndex);
    if (params.cache != null) {
      params.cache.hashOutputsSingle ??= /* @__PURE__ */ new Map();
      params.cache.hashOutputsSingle.set(params.inputIndex, hash);
    }
    return hash;
  }
  var EMPTY_SCRIPT, ZERO_HASH, TransactionSignature;
  var init_TransactionSignature = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/TransactionSignature.js"() {
      init_Signature();
      init_BigNumber();
      init_Hash();
      init_utils();
      init_Script();
      init_OP();
      EMPTY_SCRIPT = new Uint8Array(0);
      ZERO_HASH = Object.freeze(Array.from({ length: 32 }, () => 0));
      TransactionSignature = class _TransactionSignature extends Signature {
        static SIGHASH_ALL = 1;
        static SIGHASH_NONE = 2;
        static SIGHASH_SINGLE = 3;
        static SIGHASH_CHRONICLE = 32;
        static SIGHASH_FORKID = 64;
        static SIGHASH_ANYONECANPAY = 128;
        scope;
        /**
         * Implements the original bitcoin transaction signature digest preimage algorithm (OTDA).
         * @param params
         * @returns preimage as a byte array
         */
        static formatOTDA(params) {
          const isAnyoneCanPay = (params.scope & _TransactionSignature.SIGHASH_ANYONECANPAY) === _TransactionSignature.SIGHASH_ANYONECANPAY;
          const isSingle = (params.scope & 31) === _TransactionSignature.SIGHASH_SINGLE;
          const isNone = (params.scope & 31) === _TransactionSignature.SIGHASH_NONE;
          const isAll = (params.scope & 31) === _TransactionSignature.SIGHASH_ALL || !isSingle && !isNone;
          const subscript = originalScriptCode(params.subscript);
          const currentInput = {
            sourceTXID: params.sourceTXID,
            sourceOutputIndex: params.sourceOutputIndex,
            sequence: params.inputSequence,
            script: subscript.bytes,
            scriptLength: subscript.encodedLength
          };
          const writer = new Writer();
          function writeInputs(inputs) {
            writer.writeVarIntNum(inputs.length);
            for (const input of inputs) {
              writer.writeReverse(toArray2(input.sourceTXID, "hex"));
              writer.writeUInt32LE(input.sourceOutputIndex);
              writer.writeVarIntNum(input.scriptLength ?? input.script.length);
              writer.write(input.script);
              writer.writeUInt32LE(input.sequence);
            }
          }
          function writeOutputs(outputs) {
            writer.writeVarIntNum(outputs.length);
            for (const output of outputs) {
              writer.writeUInt64LE(output.satoshis);
              writer.writeVarIntNum(output.script.length);
              writer.write(output.script);
            }
          }
          writer.writeInt32LE(params.transactionVersion);
          const emptyScript = new Script().toBinary();
          if (!isAnyoneCanPay) {
            const inputs = params.allInputs == null ? params.otherInputs.map((input) => ({
              sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex") ?? "",
              sourceOutputIndex: input.sourceOutputIndex,
              sequence: isSingle || isNone ? 0 : input.sequence ?? 4294967295,
              script: emptyScript
            })) : params.allInputs.map((input, index) => index === params.inputIndex ? currentInput : {
              sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex") ?? "",
              sourceOutputIndex: input.sourceOutputIndex,
              sequence: isSingle || isNone ? 0 : input.sequence ?? 4294967295,
              script: emptyScript
            });
            if (params.allInputs == null)
              inputs.splice(params.inputIndex, 0, currentInput);
            writeInputs(inputs);
          } else if (isAnyoneCanPay) {
            writeInputs([currentInput]);
          }
          if (isAll) {
            const outputs = params.outputs.map((output) => ({
              satoshis: output.satoshis ?? 0,
              // Default to 0 if undefined
              script: output.lockingScript.toBinary()
            }));
            writeOutputs(outputs);
          } else if (isSingle) {
            const outputs = [];
            for (let i = 0; i < params.inputIndex; i++)
              outputs.push({ satoshis: -1, script: emptyScript });
            const o = params.outputs[params.inputIndex];
            if (o !== void 0) {
              outputs.push({ satoshis: o.satoshis ?? 0, script: o.lockingScript.toBinary() });
            }
            writeOutputs(outputs);
          } else if (isNone) {
            writeOutputs([]);
          }
          writer.writeUInt32LE(params.lockTime);
          writer.writeUInt32LE(params.scope >>> 0);
          const buf = writer.toUint8Array();
          return buf;
        }
        /**
         * Formats the same SIGHASH preimage bytes as `format`, supporting the optional cache for hash reuse.
         * @param params - Context for the signing operation.
         * @param params.cache - Optional `SignatureHashCache` that may already contain hashed prefixes and is populated during formatting.
         * @returns Bytes for signing.
         */
        static formatBip143(params) {
          const currentInput = {
            sourceTXID: params.sourceTXID,
            sourceOutputIndex: params.sourceOutputIndex,
            sequence: params.inputSequence
          };
          const inputs = bip143Inputs(params, currentInput);
          const hashPrevouts2 = bip143PrevoutsHash(params, inputs, currentInput);
          const hashSequence = bip143SequenceHash(params, inputs, currentInput);
          const outputsHash = bip143OutputsHash(params);
          const writer = new Writer();
          writer.writeInt32LE(params.transactionVersion);
          writer.write(hashPrevouts2);
          writer.write(hashSequence);
          writer.writeReverse(toArray2(params.sourceTXID, "hex"));
          writer.writeUInt32LE(params.sourceOutputIndex);
          const subscriptBin = params.subscript.toUint8Array();
          writer.writeVarIntNum(subscriptBin.length);
          writer.write(subscriptBin);
          writer.writeUInt64LE(params.sourceSatoshis);
          const sequenceNumber = currentInput.sequence ?? 4294967295;
          writer.writeUInt32LE(sequenceNumber);
          writer.write(outputsHash);
          writer.writeUInt32LE(params.lockTime);
          writer.writeUInt32LE(params.scope >>> 0);
          const buf = writer.toUint8Array();
          return buf;
        }
        /**
         * Formats the SIGHASH preimage for the targeted input, optionally using a cache to skip recomputing shared hash prefixes.
         * @param params - Context for the signing input plus transaction metadata.
         * @param params.cache - Optional cache storing previously computed `hashPrevouts`, `hashSequence`, or `hashOutputs*` values; it will be populated if present.
         */
        static format(params) {
          return Array.from(this.formatBytes(params));
        }
        static formatBytes(params) {
          const hasForkId = (params.scope & _TransactionSignature.SIGHASH_FORKID) !== 0;
          const hasChronicle = params.ignoreChronicle !== true && (params.scope & _TransactionSignature.SIGHASH_CHRONICLE) !== 0;
          if (hasForkId && params.sighashForkIdEnabled !== false && !hasChronicle) {
            return _TransactionSignature.formatBip143(params);
          }
          if (params.sighashForkIdEnabled === false || !hasForkId || hasChronicle) {
            return _TransactionSignature.formatOTDA(params);
          }
          return new Uint8Array(0);
        }
        static usesOtdaSingleBug(params) {
          const hasForkId = (params.scope & _TransactionSignature.SIGHASH_FORKID) !== 0;
          const hasChronicle = params.ignoreChronicle !== true && (params.scope & _TransactionSignature.SIGHASH_CHRONICLE) !== 0;
          const usesOtda = params.sighashForkIdEnabled === false || !hasForkId || hasChronicle;
          return usesOtda && (params.scope & 31) === _TransactionSignature.SIGHASH_SINGLE && params.inputIndex >= params.outputs.length;
        }
        // The format used in a tx
        static fromChecksigFormat(buf) {
          if (buf.length === 0) {
            const r2 = new BigNumber(1);
            const s2 = new BigNumber(1);
            const scope2 = 1;
            return new _TransactionSignature(r2, s2, scope2);
          }
          const scope = buf.at(-1);
          const derbuf = buf.slice(0, -1);
          const tempSig = Signature.fromDER(derbuf);
          return new _TransactionSignature(tempSig.r, tempSig.s, scope);
        }
        constructor(r2, s2, scope) {
          super(r2, s2);
          this.scope = scope;
        }
        /**
         * Compares to bitcoind's IsLowDERSignature
         * See also Ecdsa signature algorithm which enforces this.
         * See also Bip 62, "low S values in signatures"
         */
        hasLowS() {
          if (this.s.ltn(1) || this.s.gt(new BigNumber("7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0", "hex"))) {
            return false;
          }
          return true;
        }
        toChecksigFormat() {
          const derbuf = this.toDER();
          return [...derbuf, this.scope];
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/AsyncCryptoBackend.js
  function validateAsyncCryptoBytes(operation, value, expectedLength) {
    if (!(value instanceof Uint8Array)) {
      throw new TypeError(`${operation} returned a non-byte result`);
    }
    if (expectedLength !== void 0 && value.length !== expectedLength) {
      throw new Error(`${operation} returned ${value.length} bytes; expected ${expectedLength}`);
    }
    return value;
  }
  function backendGlobal() {
    return globalThis;
  }
  function readyAsyncCryptoBackend(operation) {
    const backend = backendGlobal().__bsvSdkAsyncCryptoBackendV1;
    if (backend === void 0)
      return void 0;
    if (!backend.isReady()) {
      void backend.preload().catch(() => {
      });
      return void 0;
    }
    return backend.supportsCrypto(operation) ? backend : void 0;
  }
  var init_AsyncCryptoBackend = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/AsyncCryptoBackend.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/index.js
  var init_primitives = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/index.js"() {
      init_utils();
      init_PrivateKey();
      init_AsyncCryptoBackend();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/LockingScript.js
  var LockingScript;
  var init_LockingScript = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/LockingScript.js"() {
      init_Script();
      LockingScript = class extends Script {
        /**
         * @method isLockingScript
         * Determines if the script is a locking script.
         * @returns {boolean} Always returns true for a LockingScript instance.
         */
        isLockingScript() {
          return true;
        }
        /**
         * @method isUnlockingScript
         * Determines if the script is an unlocking script.
         * @returns {boolean} Always returns false for a LockingScript instance.
         */
        isUnlockingScript() {
          return false;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/UnlockingScript.js
  var UnlockingScript;
  var init_UnlockingScript = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/UnlockingScript.js"() {
      init_Script();
      UnlockingScript = class extends Script {
        /**
         * @method isLockingScript
         * Determines if the script is a locking script.
         * @returns {boolean} Always returns false for an UnlockingScript instance.
         */
        isLockingScript() {
          return false;
        }
        /**
         * @method isUnlockingScript
         * Determines if the script is an unlocking script.
         * @returns {boolean} Always returns true for an UnlockingScript instance.
         */
        isUnlockingScript() {
          return true;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/ScriptEvaluationError.js
  function formatStackItem(item) {
    if (item == null)
      return "null/undef";
    if (item.length === void 0)
      return "INVALID_STACK_ITEM";
    return toHex(item);
  }
  var ScriptEvaluationError;
  var init_ScriptEvaluationError = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/ScriptEvaluationError.js"() {
      init_utils();
      ScriptEvaluationError = class extends Error {
        txid;
        outputIndex;
        context;
        programCounter;
        stackState;
        altStackState;
        ifStackState;
        stackMem;
        altStackMem;
        constructor(params) {
          const stackHex = params.stackState.map(formatStackItem).join(", ");
          const altStackHex = params.altStackState.map(formatStackItem).join(", ");
          const pcInfo = `Context: ${params.context}, PC: ${params.programCounter}`;
          const stackInfo = `Stack: [${stackHex}] (len: ${params.stackState.length}, mem: ${params.stackMem})`;
          const altStackInfo = `AltStack: [${altStackHex}] (len: ${params.altStackState.length}, mem: ${params.altStackMem})`;
          const ifStackInfo = `IfStack: [${params.ifStackState.join(", ")}]`;
          const fullMessage = `Script evaluation error: ${params.message}
TXID: ${params.txid}, OutputIdx: ${params.outputIndex}
${pcInfo}
${stackInfo}
${altStackInfo}
${ifStackInfo}`;
          super(fullMessage);
          this.name = this.constructor.name;
          this.txid = params.txid;
          this.outputIndex = params.outputIndex;
          this.context = params.context;
          this.programCounter = params.programCounter;
          this.stackState = params.stackState.map((s2) => s2.slice());
          this.altStackState = params.altStackState.map((s2) => s2.slice());
          this.ifStackState = params.ifStackState.slice();
          this.stackMem = params.stackMem;
          this.altStackMem = params.altStackMem;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/ScriptResourceLimitError.js
  var ScriptResourceLimitError;
  var init_ScriptResourceLimitError = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/ScriptResourceLimitError.js"() {
      ScriptResourceLimitError = class extends Error {
        resource;
        limit;
        attempted;
        constructor(resource, limit, attempted) {
          const labels = {
            stack: "Stack memory usage",
            "alt-stack": "Alt stack memory usage",
            "element-size": "Script element allocation"
          };
          const label = labels[resource];
          super(`${label} has exceeded ${limit} bytes`);
          this.resource = resource;
          this.limit = limit;
          this.attempted = attempted;
          this.name = "ScriptResourceLimitError";
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/ScriptVerificationBackend.js
  function scriptVerificationBackend() {
    return registeredBackend;
  }
  var registeredBackend;
  var init_ScriptVerificationBackend = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/ScriptVerificationBackend.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/Spend.js
  function compareNumberArrays(a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
  function scriptBoolean(value) {
    return new BigNumber(value ? 1 : 0);
  }
  function scriptBooleanAnd(left, right) {
    return scriptBoolean(left && right);
  }
  function scriptBooleanOr(left, right) {
    return scriptBoolean(left || right);
  }
  function smallerBigNumber(left, right) {
    return left.cmp(right) < 0 ? left : right;
  }
  function largerBigNumber(left, right) {
    return left.cmp(right) > 0 ? left : right;
  }
  function snapshotSpendVerificationContext(context) {
    if (typeof context.consensus !== "boolean") {
      throw new TypeError("Spend verification consensus must be boolean");
    }
    for (const [label, value] of [
      ["blockHeight", context.blockHeight],
      ["utxoHeight", context.utxoHeight]
    ]) {
      if (value !== void 0 && (!Number.isSafeInteger(value) || value < 0 || value > 4294967295)) {
        throw new RangeError(`Spend verification ${label} must be an unsigned 32-bit integer`);
      }
    }
    const verifyFlags = Array.isArray(context.verifyFlags) ? Array.from(context.verifyFlags) : context.verifyFlags;
    if (verifyFlags !== void 0 && typeof verifyFlags !== "string" && (!Array.isArray(verifyFlags) || verifyFlags.some((flag) => typeof flag !== "string"))) {
      throw new TypeError("Spend verification flags must be a string or an array of strings");
    }
    return {
      consensus: context.consensus,
      blockHeight: context.blockHeight,
      utxoHeight: context.utxoHeight,
      verifyFlags
    };
  }
  function isMinimallyEncodedHelper(buf, maxNumSize = Number.MAX_SAFE_INTEGER) {
    if (buf.length > maxNumSize) {
      return false;
    }
    if (buf.length > 0) {
      if ((buf.at(-1) & 127) === 0) {
        if (buf.length <= 1 || (buf.at(-2) & 128) === 0) {
          return false;
        }
      }
    }
    return true;
  }
  function isChecksigFormatHelper(buf) {
    if (buf.length < 9 || buf.length > 73)
      return false;
    if (buf[0] !== 48)
      return false;
    if (buf[1] !== buf.length - 3)
      return false;
    const rMarker = buf[2];
    const rLen = buf[3];
    if (rMarker !== 2)
      return false;
    if (rLen === 0)
      return false;
    if (5 + rLen >= buf.length)
      return false;
    const sMarkerOffset = 4 + rLen;
    const sMarker = buf[sMarkerOffset];
    const sLen = buf[sMarkerOffset + 1];
    if (sMarker !== 2)
      return false;
    if (sLen === 0)
      return false;
    if ((buf[4] & 128) !== 0)
      return false;
    if (rLen > 1 && buf[4] === 0 && (buf[5] & 128) === 0)
      return false;
    const sValueOffset = sMarkerOffset + 2;
    if ((buf[sValueOffset] & 128) !== 0)
      return false;
    if (sLen > 1 && buf[sValueOffset] === 0 && (buf[sValueOffset + 1] & 128) === 0)
      return false;
    if (rLen + sLen + 7 !== buf.length)
      return false;
    return true;
  }
  function isChunkMinimalPushHelper(chunk) {
    const data = chunk.data;
    const op = chunk.op;
    if (!Array.isArray(data))
      return true;
    if (data.length === 0)
      return op === OP_default.OP_0;
    if (data.length === 1 && data[0] >= 1 && data[0] <= 16)
      return op === OP_default.OP_1 + (data[0] - 1);
    if (data.length === 1 && data[0] === 129)
      return op === OP_default.OP_1NEGATE;
    if (data.length <= 75)
      return op === data.length;
    if (data.length <= 255)
      return op === OP_default.OP_PUSHDATA1;
    if (data.length <= 65535)
      return op === OP_default.OP_PUSHDATA2;
    return true;
  }
  var maxScriptElementSizeBeforeGenesis, maxScriptSizeBeforeGenesis, maxOpsBeforeGenesis, maxNodeNum2BinSize, maxScriptNumLengthAfterGenesis, maxScriptNumLengthAfterChronicle, maxStackItemsBeforeGenesis, maxMultisigKeyCount, maxMultisigKeyCountBigInt, maxMultisigKeyCountBeforeGenesis, sequenceLocktimeDisableFlag, sequenceLocktimeTypeFlag, sequenceLocktimeMask, locktimeThreshold, SCRIPTNUM_NEG_1, SCRIPTNUMS_0_TO_16, Spend;
  var init_Spend = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/Spend.js"() {
      init_LockingScript();
      init_UnlockingScript();
      init_Script();
      init_BigNumber();
      init_OP();
      init_utils();
      init_ScriptEvaluationError();
      init_Hash();
      init_TransactionSignature();
      init_PublicKey();
      init_ECDSA();
      init_ScriptResourceLimitError();
      init_ScriptVerificationBackend();
      maxScriptElementSizeBeforeGenesis = 520;
      maxScriptSizeBeforeGenesis = 1e4;
      maxOpsBeforeGenesis = 500;
      maxNodeNum2BinSize = 0x7fffffffn;
      maxScriptNumLengthAfterGenesis = 75e4;
      maxScriptNumLengthAfterChronicle = 32e6;
      maxStackItemsBeforeGenesis = 1e3;
      maxMultisigKeyCount = Math.pow(2, 31) - 1;
      maxMultisigKeyCountBigInt = BigInt(maxMultisigKeyCount);
      maxMultisigKeyCountBeforeGenesis = 20;
      sequenceLocktimeDisableFlag = 2147483648;
      sequenceLocktimeTypeFlag = 4194304;
      sequenceLocktimeMask = 65535;
      locktimeThreshold = 5e8;
      SCRIPTNUM_NEG_1 = Object.freeze(new BigNumber(-1).toScriptNum());
      SCRIPTNUMS_0_TO_16 = Object.freeze(Array.from({ length: 17 }, (_, i) => Object.freeze(new BigNumber(i).toScriptNum())));
      Spend = class _Spend {
        sourceTXID;
        sourceOutputIndex;
        sourceSatoshis;
        lockingScript;
        transactionVersion;
        otherInputs;
        allInputs;
        outputs;
        inputIndex;
        unlockingScript;
        inputSequence;
        lockTime;
        context;
        programCounter;
        lastCodeSeparator;
        stack;
        altStack;
        ifStack;
        elseStack;
        memoryLimit;
        hasExplicitMemoryLimit;
        stackMem;
        altStackMem;
        isRelaxedOverride;
        verifyFlags;
        executedOpCount;
        returningFromConditional;
        #sigHashCache;
        #ownsSigHashCache;
        /**
         * @constructor
         * Constructs the Spend object with necessary transaction details.
         * @param {string} params.sourceTXID - The transaction ID of the source UTXO.
         * @param {number} params.sourceOutputIndex - The index of the output in the source transaction.
         * @param {BigNumber} params.sourceSatoshis - The amount of satoshis in the source UTXO.
         * @param {LockingScript} params.lockingScript - The locking script associated with the UTXO.
         * @param {number} params.transactionVersion - The version of the current transaction.
         * @param {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} params.otherInputs -
         *        An array of other inputs in the transaction.
         * @param {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} params.outputs -
         *        The outputs of the current transaction.
         * @param {number} params.inputIndex - The index of this input in the current transaction.
         * @param {UnlockingScript} params.unlockingScript - The unlocking script for this spend.
         * @param {number} params.inputSequence - The sequence number of this input.
         * @param {number} params.lockTime - The lock time of the transaction.
         * @param {number} params.memoryLimit - Optional caller-supplied local
         *        interpreter budget. Resource exhaustion is reported separately from
         *        script invalidity.
         * @param {boolean} params.isRelaxed - Optional. If true, disables all the unlocking script maleability restrictions consitent with Chronicle release. Maleability restrictions are neve appliced to locking scripts.
         *
         * @example
         * const spend = new Spend({
         *   sourceTXID: "abcd1234", // sourceTXID
         *   sourceOutputIndex: 0, // sourceOutputIndex
         *   sourceSatoshis: new BigNumber(1000), // sourceSatoshis
         *   lockingScript: LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
         *   transactionVersion: 1, // transactionVersion
         *   otherInputs: [{ sourceTXID: "abcd1234", sourceOutputIndex: 1, sequence: 0xffffffff }], // otherInputs
         *   outputs: [{ satoshis: new BigNumber(500), lockingScript: LockingScript.fromASM("OP_DUP...") }], // outputs
         *   inputIndex: 0, // inputIndex
         *   unlockingScript: UnlockingScript.fromASM("3045... 02ab..."),
         *   inputSequence: 0xffffffff // inputSequence
         *   memoryLimit: 100000 // memoryLimit
         * });
         */
        constructor(params) {
          this.sourceTXID = params.sourceTXID;
          this.sourceOutputIndex = params.sourceOutputIndex;
          this.sourceSatoshis = params.sourceSatoshis;
          this.lockingScript = params.lockingScript;
          this.transactionVersion = params.transactionVersion;
          this.otherInputs = params.otherInputs;
          this.allInputs = params.allInputs;
          this.outputs = params.outputs;
          this.inputIndex = params.inputIndex;
          this.unlockingScript = params.unlockingScript;
          this.inputSequence = params.inputSequence;
          this.lockTime = params.lockTime;
          this.hasExplicitMemoryLimit = params.memoryLimit !== void 0;
          this.memoryLimit = params.memoryLimit ?? Number.POSITIVE_INFINITY;
          this.isRelaxedOverride = params.isRelaxed === true;
          if (params.verifyFlags === void 0) {
            this.verifyFlags = void 0;
          } else {
            const flagArr = Array.isArray(params.verifyFlags) ? params.verifyFlags : params.verifyFlags.split(",");
            this.verifyFlags = new Set(flagArr.map((flag) => flag.trim()).filter((flag) => flag.length > 0));
          }
          this.stack = [];
          this.altStack = [];
          this.ifStack = [];
          this.elseStack = [];
          this.stackMem = 0;
          this.altStackMem = 0;
          this.executedOpCount = 0;
          this.returningFromConditional = false;
          this.#ownsSigHashCache = params.sigHashCache == null;
          this.#sigHashCache = params.sigHashCache ?? { hashOutputsSingle: /* @__PURE__ */ new Map() };
          this.reset();
        }
        #isRelaxed() {
          return this.isRelaxedOverride || this.transactionVersion > 1;
        }
        #hasExplicitFlags() {
          return this.verifyFlags !== void 0;
        }
        #hasFlag(flag) {
          return this.verifyFlags?.has(flag) === true;
        }
        #isAfterGenesis() {
          if (this.#hasExplicitFlags()) {
            return this.#hasFlag("UTXO_AFTER_GENESIS") || this.#hasFlag("UTXO_AFTER_CHRONICLE");
          }
          return this.#isRelaxed();
        }
        #isAfterChronicle() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("UTXO_AFTER_CHRONICLE");
          return this.#isRelaxed();
        }
        #enforceNonMalleability() {
          return !(this.#hasFlag("CHRONICLE") && this.transactionVersion > 1);
        }
        #shouldEnforceMinimalData() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("MINIMALDATA") && this.#enforceNonMalleability();
          return !this.#isRelaxed();
        }
        #shouldEnforceLowS() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("LOW_S") && this.#enforceNonMalleability();
          return !this.#isRelaxed();
        }
        #shouldEnforceNullDummy() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("NULLDUMMY") && this.#enforceNonMalleability();
          return !this.#isRelaxed();
        }
        #shouldEnforceSigPushOnly() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("SIGPUSHONLY") && this.#enforceNonMalleability();
          return !this.#isRelaxed();
        }
        #shouldEnforceCleanStack() {
          if (this.#hasExplicitFlags())
            return this.#hasFlag("CLEANSTACK") && this.#enforceNonMalleability();
          return !this.#isRelaxed();
        }
        #shouldEnforceDerSignatures() {
          if (this.#hasExplicitFlags()) {
            return this.#hasFlag("DERSIG") || this.#hasFlag("STRICTENC") || this.#hasFlag("LOW_S") || this.#hasFlag("SIGHASH_FORKID");
          }
          return true;
        }
        #shouldEnforceStrictEncoding() {
          if (this.#hasExplicitFlags()) {
            return this.#hasFlag("STRICTENC") || this.#hasFlag("SIGHASH_FORKID");
          }
          return true;
        }
        #scriptNumMaxSize() {
          if (this.#hasExplicitFlags()) {
            if (!this.#isAfterGenesis())
              return 4;
            return this.#isAfterChronicle() ? maxScriptNumLengthAfterChronicle : maxScriptNumLengthAfterGenesis;
          }
          return void 0;
        }
        #maxPushSize() {
          if (this.#hasExplicitFlags() && !this.#isAfterGenesis())
            return maxScriptElementSizeBeforeGenesis;
          return Number.POSITIVE_INFINITY;
        }
        reset() {
          if (this.#ownsSigHashCache) {
            delete this.#sigHashCache.hashPrevouts;
            delete this.#sigHashCache.hashSequence;
            delete this.#sigHashCache.hashOutputsAll;
            this.#sigHashCache.hashOutputsSingle?.clear();
          }
          this.context = "UnlockingScript";
          this.programCounter = 0;
          this.lastCodeSeparator = null;
          this.stack = [];
          this.altStack = [];
          this.ifStack = [];
          this.elseStack = [];
          this.stackMem = 0;
          this.altStackMem = 0;
          this.executedOpCount = 0;
          this.returningFromConditional = false;
        }
        #ensureStackMem(additional) {
          if (this.stackMem + additional > this.memoryLimit) {
            throw new ScriptResourceLimitError("stack", this.memoryLimit, this.stackMem + additional);
          }
        }
        #ensureAltStackMem(additional) {
          if (this.altStackMem + additional > this.memoryLimit) {
            throw new ScriptResourceLimitError("alt-stack", this.memoryLimit, this.altStackMem + additional);
          }
        }
        #pushStack(item) {
          this.#ensureStackMem(item.length);
          this.stack.push(item);
          this.stackMem += item.length;
        }
        #pushStackCopy(item) {
          this.#ensureStackMem(item.length);
          const copy = item.slice();
          this.stack.push(copy);
          this.stackMem += copy.length;
        }
        #popStack() {
          if (this.stack.length === 0) {
            this.#scriptEvaluationError("Attempted to pop from an empty stack.");
          }
          const item = this.stack.pop();
          if (item === void 0) {
            this.#scriptEvaluationError("Attempted to pop from an empty stack.");
            return [];
          }
          this.stackMem -= item.length;
          return item;
        }
        #stackTop(index = -1) {
          if (this.stack.length === 0 || this.stack.length < Math.abs(index) || index >= 0 && index >= this.stack.length) {
            this.#scriptEvaluationError(`Stack underflow accessing element at index ${index}. Stack length is ${this.stack.length}.`);
          }
          return this.stack[this.stack.length + index];
        }
        #requireStackItems(minimum, message) {
          if (this.stack.length < minimum)
            this.#scriptEvaluationError(message);
        }
        #requireAltStackItems(minimum, message) {
          if (this.altStack.length < minimum)
            this.#scriptEvaluationError(message);
        }
        #setStack(items) {
          this.stack = items.map((item) => item.slice());
          this.stackMem = this.stack.reduce((total, item) => total + item.length, 0);
        }
        #clearAltStack() {
          this.altStack = [];
          this.altStackMem = 0;
        }
        #pushAltStack(item) {
          this.#ensureAltStackMem(item.length);
          this.altStack.push(item);
          this.altStackMem += item.length;
        }
        #popAltStack() {
          if (this.altStack.length === 0) {
            this.#scriptEvaluationError("Attempted to pop from an empty alt stack.");
          }
          const item = this.altStack.pop();
          if (item === void 0) {
            this.#scriptEvaluationError("Attempted to pop from an empty alt stack.");
            return [];
          }
          this.altStackMem -= item.length;
          return item;
        }
        #readScriptNumber(buf) {
          try {
            return BigNumber.fromScriptNum(buf, this.#shouldEnforceMinimalData(), this.#scriptNumMaxSize());
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            this.#scriptEvaluationError(message);
          }
          return new BigNumber(0);
        }
        // The node uses the int64 CScriptNum constructor for these splice operands,
        // then clamps getint() to int32. Bytes after the eighth are ignored there.
        #readSpliceOperand(buf) {
          const maxSize = this.#scriptNumMaxSize();
          if (maxSize !== void 0 && buf.length > maxSize) {
            this.#scriptEvaluationError("script number overflow");
          }
          if (this.#shouldEnforceMinimalData() && !isMinimallyEncodedHelper(buf)) {
            this.#scriptEvaluationError("non-minimally encoded script number");
          }
          let value;
          if (buf.length > 8) {
            value = 0n;
            for (let index = 0; index < 8; index++) {
              value |= BigInt(buf[index]) << BigInt(index * 8);
            }
            value = BigInt.asIntN(64, value);
          } else {
            value = this.#readScriptNumber(buf).toBigInt();
          }
          if (value > 0x7fffffffn)
            return 2147483647;
          if (value < -0x80000000n)
            return -2147483648;
          return Number(value);
        }
        #readLockTimeOperand(buf) {
          try {
            return BigNumber.fromScriptNum(buf, this.#shouldEnforceMinimalData(), 5).toBigInt();
          } catch (error) {
            this.#scriptEvaluationError(error instanceof Error ? error.message : String(error));
          }
          return 0n;
        }
        #isDefinedHashType(scope) {
          const baseType = scope & 31;
          return baseType >= TransactionSignature.SIGHASH_ALL && baseType <= TransactionSignature.SIGHASH_SINGLE;
        }
        #enforceSignatureHashType(sig) {
          if (!this.#shouldEnforceStrictEncoding())
            return;
          if (!this.#isDefinedHashType(sig.scope)) {
            this.#scriptEvaluationError("The signature hash type is invalid.");
          }
          const usesChronicle = (sig.scope & TransactionSignature.SIGHASH_CHRONICLE) !== 0;
          const chronicleEnabled = this.#hasExplicitFlags() ? this.#hasFlag("CHRONICLE") : this.#isAfterChronicle();
          if (usesChronicle && !chronicleEnabled) {
            this.#scriptEvaluationError("The signature hash type is invalid before Chronicle.");
          }
        }
        #enforceSignatureForkId(sig) {
          if (!this.#hasExplicitFlags() || !this.#hasFlag("STRICTENC"))
            return;
          const hasForkId = (sig.scope & TransactionSignature.SIGHASH_FORKID) !== 0;
          if (this.#hasFlag("SIGHASH_FORKID") && !hasForkId) {
            this.#scriptEvaluationError("The signature must use SIGHASH_FORKID.");
          }
          if (!this.#hasFlag("SIGHASH_FORKID") && !this.#isAfterGenesis() && hasForkId) {
            this.#scriptEvaluationError("The signature must not use SIGHASH_FORKID.");
          }
        }
        #checkSignatureEncoding(buf) {
          if (buf.length === 0)
            return true;
          const enforceDer = this.#shouldEnforceDerSignatures();
          if (enforceDer && !isChecksigFormatHelper(buf)) {
            this.#scriptEvaluationError("The signature format is invalid.");
            return false;
          }
          try {
            const sig = TransactionSignature.fromChecksigFormat(buf);
            this.#enforceSignatureHashType(sig);
            this.#enforceSignatureForkId(sig);
            if (this.#shouldEnforceLowS() && !sig.hasLowS()) {
              this.#scriptEvaluationError("The signature must have a low S value.");
              return false;
            }
          } catch {
            if (enforceDer) {
              this.#scriptEvaluationError("The signature format is invalid.");
              return false;
            }
          }
          return true;
        }
        #parseChecksigSignature(buf) {
          try {
            return TransactionSignature.fromChecksigFormat(buf);
          } catch (e) {
            if (this.#shouldEnforceDerSignatures())
              throw e;
            return this.#parseLaxChecksigSignature(buf);
          }
        }
        #readLaxDERLength(buf, position) {
          const first = buf[position.value++];
          if (first === void 0)
            throw new Error("Invalid DER length");
          if ((first & 128) === 0)
            return first;
          const lengthBytes = first & 127;
          if (lengthBytes === 0 || position.value + lengthBytes > buf.length) {
            throw new Error("Invalid DER length");
          }
          let length = 0;
          for (let i = 0; i < lengthBytes; i++) {
            length = length << 8 | (buf[position.value++] ?? 0);
          }
          return length;
        }
        #parseLaxDERInteger(buf, position, sequenceEnd) {
          if (position.value >= sequenceEnd || buf[position.value++] !== 2) {
            throw new Error("Invalid DER integer");
          }
          const length = this.#readLaxDERLength(buf, position);
          if (position.value + length > sequenceEnd) {
            throw new Error("Invalid DER integer length");
          }
          let bytes3 = buf.slice(position.value, position.value + length);
          position.value += length;
          while (bytes3.length > 1 && bytes3[0] === 0)
            bytes3 = bytes3.slice(1);
          if (bytes3.length === 0)
            bytes3 = [0];
          return new BigNumber(bytes3);
        }
        #parseLaxChecksigSignature(buf) {
          if (buf.length === 0)
            return TransactionSignature.fromChecksigFormat(buf);
          const scope = buf.at(-1);
          const der = buf.slice(0, -1);
          const position = { value: 0 };
          if (der[position.value++] !== 48)
            throw new Error("Signature DER must start with 0x30");
          const sequenceLength = this.#readLaxDERLength(der, position);
          const sequenceEnd = Math.min(position.value + sequenceLength, der.length);
          const r2 = this.#parseLaxDERInteger(der, position, sequenceEnd);
          const s2 = this.#parseLaxDERInteger(der, position, sequenceEnd);
          return new TransactionSignature(r2, s2, scope);
        }
        #checkPublicKeyEncoding(buf) {
          if (!this.#shouldEnforceStrictEncoding())
            return true;
          if (buf.length === 0) {
            this.#scriptEvaluationError("Public key is empty.");
            return false;
          }
          if (buf.length < 33) {
            this.#scriptEvaluationError("The public key is too short, it must be at least 33 bytes.");
            return false;
          }
          if (buf[0] === 4) {
            if (buf.length !== 65) {
              this.#scriptEvaluationError("The non-compressed public key must be 65 bytes.");
              return false;
            }
          } else if (buf[0] === 2 || buf[0] === 3) {
            if (buf.length !== 33) {
              this.#scriptEvaluationError("The compressed public key must be 33 bytes.");
              return false;
            }
          } else {
            this.#scriptEvaluationError("The public key is in an unknown format.");
            return false;
          }
          try {
            PublicKey.fromDER(buf);
          } catch {
            this.#scriptEvaluationError("The public key is in an unknown format.");
            return false;
          }
          return true;
        }
        #verifySignature(sig, pubkey, subscript) {
          const params = {
            sourceTXID: this.sourceTXID,
            sourceOutputIndex: this.sourceOutputIndex,
            sourceSatoshis: this.sourceSatoshis,
            transactionVersion: this.transactionVersion,
            otherInputs: this.otherInputs,
            allInputs: this.allInputs,
            outputs: this.outputs,
            inputIndex: this.inputIndex,
            subscript,
            inputSequence: this.inputSequence,
            lockTime: this.lockTime,
            scope: sig.scope,
            sighashForkIdEnabled: !this.#hasExplicitFlags() || this.#hasFlag("SIGHASH_FORKID"),
            cache: this.#sigHashCache
          };
          const hash = TransactionSignature.usesOtdaSingleBug(params) ? new BigNumber([1, ...Array.from({ length: 31 }, () => 0)]) : new BigNumber(hash256(TransactionSignature.formatBytes(params)));
          return verify(hash, sig, pubkey);
        }
        #enforceStepResourceLimits() {
          if (this.stackMem > this.memoryLimit) {
            throw new ScriptResourceLimitError("stack", this.memoryLimit, this.stackMem);
          }
          if (this.altStackMem > this.memoryLimit) {
            throw new ScriptResourceLimitError("alt-stack", this.memoryLimit, this.altStackMem);
          }
        }
        #currentScriptForStep() {
          if (this.context === "UnlockingScript" && this.programCounter >= this.unlockingScript.chunks.length) {
            if (this.ifStack.length > 0) {
              this.#scriptEvaluationError("Every OP_IF, OP_NOTIF, or OP_ELSE must be terminated with OP_ENDIF prior to the end of the unlocking script.");
            }
            this.#clearAltStack();
            this.ifStack = [];
            this.elseStack = [];
            this.returningFromConditional = false;
            this.lastCodeSeparator = null;
            this.context = "LockingScript";
            this.programCounter = 0;
          }
          return this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
        }
        #opcodeForOperation(operation) {
          const currentOpcode = operation.op;
          if (currentOpcode === void 0) {
            this.#scriptEvaluationError(`Missing opcode in ${this.context} at pc=${this.programCounter}.`);
            return 0;
          }
          if (operation.invalidLength === true) {
            this.#scriptEvaluationError(`Malformed push data in ${this.context} at pc=${this.programCounter}.`);
          }
          if (Array.isArray(operation.data) && operation.data.length > this.#maxPushSize()) {
            this.#scriptEvaluationError(`Data push > ${this.#maxPushSize()} bytes (pc=${this.programCounter}).`);
          }
          return currentOpcode;
        }
        #enforceChronicleOnlyOpcode(currentOpcode) {
          if (this.#hasExplicitFlags() && !this.#isAfterGenesis() && !this.#isAfterChronicle() && (currentOpcode === OP_default.OP_2MUL || currentOpcode === OP_default.OP_2DIV || currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
            this.#scriptEvaluationError(`${OP_default[currentOpcode]} is disabled until Chronicle.`);
          }
        }
        #executeDataPush(operation) {
          if (this.#shouldEnforceMinimalData() && !isChunkMinimalPushHelper(operation)) {
            this.#scriptEvaluationError(`This data is not minimally-encoded. (PC: ${this.programCounter})`);
          }
          this.#pushStack(Array.isArray(operation.data) ? operation.data : []);
        }
        #countExecutedOpcode(currentOpcode, isScriptExecuting) {
          if (!isScriptExecuting || currentOpcode <= OP_default.OP_16)
            return;
          this.executedOpCount++;
          if (this.#hasExplicitFlags() && !this.#isAfterGenesis() && this.executedOpCount > maxOpsBeforeGenesis) {
            this.#scriptEvaluationError(`Script executed more than ${maxOpsBeforeGenesis} opcodes.`);
          }
        }
        #skipUnavailablePreChronicleOpcode(currentOpcode, isScriptExecuting) {
          if (!this.#hasExplicitFlags() || this.#isAfterChronicle())
            return false;
          if (isScriptExecuting && (currentOpcode === OP_default.OP_SUBSTR || currentOpcode === OP_default.OP_LEFT || currentOpcode === OP_default.OP_RIGHT || currentOpcode === OP_default.OP_LSHIFTNUM || currentOpcode === OP_default.OP_RSHIFTNUM)) {
            if (this.#hasFlag("DISCOURAGE_UPGRADABLE_NOPS")) {
              this.#scriptEvaluationError(`${OP_default[currentOpcode]} is discouraged by verification flags.`);
            }
            this.programCounter++;
            return true;
          }
          if ((isScriptExecuting || !this.#isAfterGenesis()) && (currentOpcode === OP_default.OP_2MUL || currentOpcode === OP_default.OP_2DIV)) {
            this.#scriptEvaluationError(`${OP_default[currentOpcode]} is disabled until Chronicle.`);
          }
          if ((isScriptExecuting || !this.#isAfterGenesis()) && (currentOpcode === OP_default.OP_VER || currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
            this.#scriptEvaluationError(`${OP_default[currentOpcode]} is disabled until Chronicle.`);
          }
          if (!isScriptExecuting && this.#isAfterGenesis() && (currentOpcode === OP_default.OP_VERIF || currentOpcode === OP_default.OP_VERNOTIF)) {
            this.programCounter++;
            return true;
          }
          return false;
        }
        #enforceDiscouragedNop(currentOpcode, isScriptExecuting) {
          const inactiveLocktime = currentOpcode === OP_default.OP_CHECKLOCKTIMEVERIFY && (!this.#hasFlag("CHECKLOCKTIMEVERIFY") || this.#isAfterGenesis());
          const inactiveSequence = currentOpcode === OP_default.OP_CHECKSEQUENCEVERIFY && (!this.#hasFlag("CHECKSEQUENCEVERIFY") || this.#isAfterGenesis());
          if (isScriptExecuting && this.#hasFlag("DISCOURAGE_UPGRADABLE_NOPS") && (currentOpcode === OP_default.OP_NOP1 || inactiveLocktime || inactiveSequence || currentOpcode === OP_default.OP_NOP9 || currentOpcode === OP_default.OP_NOP10)) {
            this.#scriptEvaluationError(`${OP_default[currentOpcode]} is discouraged by verification flags.`);
          }
        }
        #verifyCheckLockTime() {
          if (!this.#hasFlag("CHECKLOCKTIMEVERIFY") || this.#isAfterGenesis())
            return;
          this.#requireStackItems(1, "OP_CHECKLOCKTIMEVERIFY requires one stack item.");
          const required = this.#readLockTimeOperand(this.#stackTop());
          if (required < 0n)
            this.#scriptEvaluationError("Negative lock time.");
          const requiredIsHeight = required < BigInt(locktimeThreshold);
          const transactionIsHeight = this.lockTime < locktimeThreshold;
          if (requiredIsHeight !== transactionIsHeight || required > BigInt(this.lockTime) || this.inputSequence === 4294967295) {
            this.#scriptEvaluationError("OP_CHECKLOCKTIMEVERIFY lock time is unsatisfied.");
          }
        }
        #verifyCheckSequence() {
          if (!this.#hasFlag("CHECKSEQUENCEVERIFY") || this.#isAfterGenesis())
            return;
          this.#requireStackItems(1, "OP_CHECKSEQUENCEVERIFY requires at least one item to be on the stack.");
          const sequenceLock = this.#readLockTimeOperand(this.#stackTop());
          if (sequenceLock < 0n) {
            this.#scriptEvaluationError("OP_CHECKSEQUENCEVERIFY requires a non-negative lock time.");
          }
          if ((sequenceLock & BigInt(sequenceLocktimeDisableFlag)) !== 0n)
            return;
          const sequence = BigInt(this.inputSequence >>> 0);
          const mask = BigInt(sequenceLocktimeTypeFlag | sequenceLocktimeMask);
          const required = sequenceLock & mask;
          const actual = sequence & mask;
          if (this.transactionVersion >>> 0 < 2 || (sequence & BigInt(sequenceLocktimeDisableFlag)) !== 0n || (required & BigInt(sequenceLocktimeTypeFlag)) !== (actual & BigInt(sequenceLocktimeTypeFlag)) || required > actual) {
            this.#scriptEvaluationError("OP_CHECKSEQUENCEVERIFY lock time is unsatisfied.");
          }
        }
        #advanceAfterStep(currentScript) {
          if (this.returningFromConditional && this.ifStack.length === 0) {
            this.programCounter = currentScript.chunks.length;
          } else {
            this.programCounter++;
          }
          if (this.#hasExplicitFlags() && !this.#isAfterGenesis() && this.stack.length + this.altStack.length > maxStackItemsBeforeGenesis) {
            this.#scriptEvaluationError(`Stack item count has exceeded ${maxStackItemsBeforeGenesis}.`);
          }
        }
        step() {
          this.#enforceStepResourceLimits();
          const currentScript = this.#currentScriptForStep();
          if (this.programCounter >= currentScript.chunks.length) {
            return false;
          }
          const operation = currentScript.chunks[this.programCounter];
          const currentOpcode = this.#opcodeForOperation(operation);
          const isScriptExecuting = !this.returningFromConditional && !this.ifStack.includes(false);
          this.#enforceChronicleOnlyOpcode(currentOpcode);
          if (isScriptExecuting && currentOpcode >= 0 && currentOpcode <= OP_default.OP_PUSHDATA4) {
            this.#executeDataPush(operation);
          } else if (isScriptExecuting || currentOpcode >= OP_default.OP_IF && currentOpcode <= OP_default.OP_ENDIF) {
            let buf, buf1, buf2, buf3;
            let x1, x2, x3;
            let bn, bn1, bn2, bn3;
            let n, size, fValue, fSuccess, subscript;
            let bufSig, bufPubkey;
            let sig, pubkey;
            let i, ikey, isig, nKeysCount, nSigsCount, fOk;
            this.#countExecutedOpcode(currentOpcode, isScriptExecuting);
            if (this.#skipUnavailablePreChronicleOpcode(currentOpcode, isScriptExecuting))
              return true;
            this.#enforceDiscouragedNop(currentOpcode, isScriptExecuting);
            switch (currentOpcode) {
              case OP_default.OP_VER: {
                const ver = this.transactionVersion;
                this.#pushStack([
                  ver & 255,
                  ver >>> 8 & 255,
                  ver >>> 16 & 255,
                  ver >>> 24 & 255
                ]);
                break;
              }
              case OP_default.OP_SUBSTR: {
                ;
                (() => {
                  if (this.stack.length < 3)
                    this.#scriptEvaluationError("OP_SUBSTR requires at least three items to be on the stack.");
                  const len = this.#readSpliceOperand(this.#popStack());
                  const offset = this.#readSpliceOperand(this.#popStack());
                  buf = this.#popStack();
                  const size2 = buf.length;
                  if (offset < 0 || offset >= size2 || len < 0 || len > size2 - offset) {
                    this.#scriptEvaluationError(`OP_SUBSTR offset (${offset}) must be in range [0, ${size2}) and length (${len}) must be in range [0, ${size2 - offset}]`);
                  }
                  this.#pushStack(buf.slice(offset, offset + len));
                })();
                break;
              }
              case OP_default.OP_LEFT: {
                ;
                (() => {
                  if (this.stack.length < 2)
                    this.#scriptEvaluationError("OP_LEFT requires at least two items to be on the stack.");
                  const len = this.#readSpliceOperand(this.#popStack());
                  buf = this.#popStack();
                  const size2 = buf.length;
                  if (len < 0 || len > size2) {
                    this.#scriptEvaluationError(`OP_LEFT length (${len}) must be in range [0, ${size2}]`);
                  }
                  this.#pushStack(buf.slice(0, len));
                })();
                break;
              }
              case OP_default.OP_RIGHT: {
                ;
                (() => {
                  if (this.stack.length < 2)
                    this.#scriptEvaluationError("OP_RIGHT requires at least two items to be on the stack.");
                  const len = this.#readSpliceOperand(this.#popStack());
                  buf = this.#popStack();
                  const size2 = buf.length;
                  if (len < 0 || len > size2) {
                    this.#scriptEvaluationError(`OP_RIGHT length (${len}) must be in range [0, ${size2}]`);
                  }
                  this.#pushStack(buf.slice(size2 - len));
                })();
                break;
              }
              case OP_default.OP_LSHIFTNUM: {
                ;
                (() => {
                  if (this.stack.length < 2)
                    this.#scriptEvaluationError("OP_LSHIFTNUM requires at least two items to be on the stack.");
                  const bits = this.#readScriptNumber(this.#popStack()).toBigInt();
                  if (bits < 0) {
                    this.#scriptEvaluationError("OP_LSHIFTNUM bits to shift must not be negative.");
                  }
                  if (bits > 0x7fffffffn) {
                    this.#scriptEvaluationError("OP_LSHIFTNUM shift count exceeds INT_MAX.");
                  }
                  const value = this.#readScriptNumber(this.#popStack()).toBigInt();
                  const maxBytes = this.#scriptNumMaxSize();
                  if (maxBytes !== void 0 && value !== 0n && bits >= BigInt(maxBytes) * 8n) {
                    this.#scriptEvaluationError("script number overflow");
                  }
                  const resultBytes = new BigNumber(value << bits).toScriptNum();
                  if (maxBytes !== void 0 && resultBytes.length > maxBytes) {
                    this.#scriptEvaluationError("script number overflow");
                  }
                  this.#pushStack(resultBytes);
                })();
                break;
              }
              case OP_default.OP_RSHIFTNUM: {
                ;
                (() => {
                  if (this.stack.length < 2)
                    this.#scriptEvaluationError("OP_RSHIFTNUM requires at least two items to be on the stack.");
                  const bits = this.#readScriptNumber(this.#popStack()).toBigInt();
                  if (bits < 0) {
                    this.#scriptEvaluationError("OP_RSHIFTNUM bits to shift must not be negative.");
                  }
                  if (bits > 0x7fffffffn) {
                    this.#scriptEvaluationError("OP_RSHIFTNUM shift count exceeds INT_MAX.");
                  }
                  const value = this.#readScriptNumber(this.#popStack()).toBigInt();
                  let resultBn;
                  if (value < 0) {
                    resultBn = new BigNumber(-(-value >> bits));
                  } else {
                    resultBn = new BigNumber(value >> bits);
                  }
                  this.#pushStack(resultBn.toScriptNum());
                })();
                break;
              }
              case OP_default.OP_1NEGATE:
                this.#pushStackCopy(SCRIPTNUM_NEG_1);
                break;
              case OP_default.OP_0:
                this.#pushStackCopy(SCRIPTNUMS_0_TO_16[0]);
                break;
              case OP_default.OP_1:
              case OP_default.OP_2:
              case OP_default.OP_3:
              case OP_default.OP_4:
              case OP_default.OP_5:
              case OP_default.OP_6:
              case OP_default.OP_7:
              case OP_default.OP_8:
              case OP_default.OP_9:
              case OP_default.OP_10:
              case OP_default.OP_11:
              case OP_default.OP_12:
              case OP_default.OP_13:
              case OP_default.OP_14:
              case OP_default.OP_15:
              case OP_default.OP_16:
                n = currentOpcode - (OP_default.OP_1 - 1);
                this.#pushStackCopy(SCRIPTNUMS_0_TO_16[n]);
                break;
              case OP_default.OP_NOP:
              // OP_NOP1 (0xb0), OP_NOP9 (0xb8), OP_NOP10 (0xb9) are the only defined upgrade-NOP slots
              // in node v1.2.0. All other values above 0xb9 are FIRST_UNDEFINED_OP_VALUE and invalid.
              // falls through
              case OP_default.OP_NOP1:
                break;
              case OP_default.OP_CHECKLOCKTIMEVERIFY:
                this.#verifyCheckLockTime();
                break;
              case OP_default.OP_CHECKSEQUENCEVERIFY:
                this.#verifyCheckSequence();
                break;
              case OP_default.OP_NOP9:
              case OP_default.OP_NOP10:
                break;
              case OP_default.OP_VERIF:
              case OP_default.OP_VERNOTIF:
                ;
                (() => {
                  fValue = false;
                  if (isScriptExecuting) {
                    if (this.stack.length < 1)
                      this.#scriptEvaluationError("OP_VERIF and OP_VERNOTIF require at least one item on the stack when they are used!");
                    buf1 = this.#popStack();
                    if (buf1.length === 4) {
                      const ver = this.transactionVersion;
                      buf2 = [ver & 255, ver >>> 8 & 255, ver >>> 16 & 255, ver >>> 24 & 255];
                      fValue = compareNumberArrays(buf1, buf2);
                    }
                    if (currentOpcode === OP_default.OP_VERNOTIF)
                      fValue = !fValue;
                  }
                  this.ifStack.push(fValue);
                  this.elseStack.push(false);
                })();
                break;
              case OP_default.OP_IF:
              case OP_default.OP_NOTIF:
                ;
                (() => {
                  fValue = false;
                  if (isScriptExecuting) {
                    if (this.stack.length < 1)
                      this.#scriptEvaluationError("OP_IF and OP_NOTIF require at least one item on the stack when they are used!");
                    buf = this.#popStack();
                    if (this.#hasFlag("MINIMALIF") && this.#enforceNonMalleability() && buf.length > 0 && !(buf.length === 1 && buf[0] === 1)) {
                      this.#scriptEvaluationError("OP_IF and OP_NOTIF require minimal truth values.");
                    }
                    fValue = this.#castToBool(buf);
                    if (currentOpcode === OP_default.OP_NOTIF)
                      fValue = !fValue;
                  }
                  this.ifStack.push(fValue);
                  this.elseStack.push(false);
                })();
                break;
              case OP_default.OP_ELSE:
                ;
                (() => {
                  if (this.ifStack.length === 0)
                    this.#scriptEvaluationError("OP_ELSE requires a preceeding OP_IF.");
                  if (this.#hasExplicitFlags() && this.#isAfterGenesis() && this.elseStack.at(-1) === true) {
                    this.#scriptEvaluationError("OP_ELSE may only be used once for each OP_IF or OP_NOTIF after Genesis.");
                  }
                  this.elseStack[this.elseStack.length - 1] = true;
                  this.ifStack[this.ifStack.length - 1] = this.ifStack.at(-1) !== true;
                })();
                break;
              case OP_default.OP_ENDIF:
                ;
                (() => {
                  if (this.ifStack.length === 0)
                    this.#scriptEvaluationError("OP_ENDIF requires a preceeding OP_IF.");
                  this.ifStack.pop();
                  this.elseStack.pop();
                })();
                break;
              case OP_default.OP_VERIFY:
                ;
                (() => {
                  if (this.stack.length < 1)
                    this.#scriptEvaluationError("OP_VERIFY requires at least one item to be on the stack.");
                  buf1 = this.#stackTop();
                  fValue = this.#castToBool(buf1);
                  if (!fValue)
                    this.#scriptEvaluationError("OP_VERIFY requires the top stack value to be truthy.");
                  this.#popStack();
                })();
                break;
              case OP_default.OP_RETURN:
                ;
                (() => {
                  if (this.#hasExplicitFlags() && !this.#isAfterGenesis()) {
                    this.#scriptEvaluationError("OP_RETURN is invalid before Genesis.");
                  }
                  if (this.ifStack.length > 0) {
                    this.returningFromConditional = true;
                  } else {
                    if (this.context === "UnlockingScript")
                      this.programCounter = this.unlockingScript.chunks.length;
                    else
                      this.programCounter = this.lockingScript.chunks.length;
                    this.programCounter--;
                  }
                })();
                break;
              case OP_default.OP_TOALTSTACK:
                this.#requireStackItems(1, "OP_TOALTSTACK requires at oeast one item to be on the stack.");
                this.#pushAltStack(this.#popStack());
                break;
              case OP_default.OP_FROMALTSTACK:
                this.#requireAltStackItems(1, "OP_FROMALTSTACK requires at least one item to be on the stack.");
                this.#pushStack(this.#popAltStack());
                break;
              case OP_default.OP_2DROP:
                this.#requireStackItems(2, "OP_2DROP requires at least two items to be on the stack.");
                this.#popStack();
                this.#popStack();
                break;
              case OP_default.OP_2DUP:
                this.#requireStackItems(2, "OP_2DUP requires at least two items to be on the stack.");
                buf1 = this.#stackTop(-2);
                buf2 = this.#stackTop(-1);
                this.#pushStackCopy(buf1);
                this.#pushStackCopy(buf2);
                break;
              case OP_default.OP_3DUP:
                this.#requireStackItems(3, "OP_3DUP requires at least three items to be on the stack.");
                buf1 = this.#stackTop(-3);
                buf2 = this.#stackTop(-2);
                buf3 = this.#stackTop(-1);
                this.#pushStackCopy(buf1);
                this.#pushStackCopy(buf2);
                this.#pushStackCopy(buf3);
                break;
              case OP_default.OP_2OVER:
                this.#requireStackItems(4, "OP_2OVER requires at least four items to be on the stack.");
                buf1 = this.#stackTop(-4);
                buf2 = this.#stackTop(-3);
                this.#pushStackCopy(buf1);
                this.#pushStackCopy(buf2);
                break;
              case OP_default.OP_2ROT: {
                this.#requireStackItems(6, "OP_2ROT requires at least six items to be on the stack.");
                const rot6 = this.#popStack();
                const rot5 = this.#popStack();
                const rot4 = this.#popStack();
                const rot3 = this.#popStack();
                const rot2 = this.#popStack();
                const rot1 = this.#popStack();
                this.#pushStack(rot3);
                this.#pushStack(rot4);
                this.#pushStack(rot5);
                this.#pushStack(rot6);
                this.#pushStack(rot1);
                this.#pushStack(rot2);
                break;
              }
              case OP_default.OP_2SWAP: {
                this.#requireStackItems(4, "OP_2SWAP requires at least four items to be on the stack.");
                const swap4 = this.#popStack();
                const swap3 = this.#popStack();
                const swap2 = this.#popStack();
                const swap1 = this.#popStack();
                this.#pushStack(swap3);
                this.#pushStack(swap4);
                this.#pushStack(swap1);
                this.#pushStack(swap2);
                break;
              }
              case OP_default.OP_IFDUP:
                ;
                (() => {
                  this.#requireStackItems(1, "OP_IFDUP requires at least one item to be on the stack.");
                  buf1 = this.#stackTop();
                  if (this.#castToBool(buf1)) {
                    this.#pushStackCopy(buf1);
                  }
                })();
                break;
              case OP_default.OP_DEPTH:
                this.#pushStack(new BigNumber(this.stack.length).toScriptNum());
                break;
              case OP_default.OP_DROP:
                this.#requireStackItems(1, "OP_DROP requires at least one item to be on the stack.");
                this.#popStack();
                break;
              case OP_default.OP_DUP:
                this.#requireStackItems(1, "OP_DUP requires at least one item to be on the stack.");
                this.#pushStackCopy(this.#stackTop());
                break;
              case OP_default.OP_NIP:
                this.#requireStackItems(2, "OP_NIP requires at least two items to be on the stack.");
                buf2 = this.#popStack();
                this.#popStack();
                this.#pushStack(buf2);
                break;
              case OP_default.OP_OVER:
                this.#requireStackItems(2, "OP_OVER requires at least two items to be on the stack.");
                this.#pushStackCopy(this.#stackTop(-2));
                break;
              case OP_default.OP_PICK:
              case OP_default.OP_ROLL: {
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
                  bn = this.#readScriptNumber(this.#popStack());
                  const nBigInt = bn.toBigInt();
                  if (nBigInt < 0n || nBigInt >= BigInt(this.stack.length)) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires the top stack element to be 0 or a positive number less than the current size of the stack.`);
                  }
                  const nIndex = Number(nBigInt);
                  const itemToMoveOrCopy = this.stack[this.stack.length - 1 - nIndex];
                  if (currentOpcode === OP_default.OP_ROLL) {
                    this.stack.splice(this.stack.length - 1 - nIndex, 1);
                    this.stackMem -= itemToMoveOrCopy.length;
                    this.#pushStack(itemToMoveOrCopy);
                  } else {
                    this.#pushStackCopy(itemToMoveOrCopy);
                  }
                })();
                break;
              }
              case OP_default.OP_ROT:
                this.#requireStackItems(3, "OP_ROT requires at least three items to be on the stack.");
                x3 = this.#popStack();
                x2 = this.#popStack();
                x1 = this.#popStack();
                this.#pushStack(x2);
                this.#pushStack(x3);
                this.#pushStack(x1);
                break;
              case OP_default.OP_SWAP:
                this.#requireStackItems(2, "OP_SWAP requires at least two items to be on the stack.");
                x2 = this.#popStack();
                x1 = this.#popStack();
                this.#pushStack(x2);
                this.#pushStack(x1);
                break;
              case OP_default.OP_TUCK:
                this.#requireStackItems(2, "OP_TUCK requires at least two items to be on the stack.");
                buf1 = this.#stackTop(-1);
                this.#ensureStackMem(buf1.length);
                this.stack.splice(-2, 0, buf1.slice());
                this.stackMem += buf1.length;
                break;
              case OP_default.OP_SIZE:
                this.#requireStackItems(1, "OP_SIZE requires at least one item to be on the stack.");
                this.#pushStack(new BigNumber(this.#stackTop().length).toScriptNum());
                break;
              case OP_default.OP_AND:
              case OP_default.OP_OR:
              case OP_default.OP_XOR: {
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items on the stack.`);
                  buf2 = this.#popStack();
                  buf1 = this.#popStack();
                  if (buf1.length !== buf2.length)
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires the top two stack items to be the same size.`);
                  const resultBufBitwiseOp = Array.from({ length: buf1.length }, () => 0);
                  for (let k = 0; k < buf1.length; k++) {
                    if (currentOpcode === OP_default.OP_AND)
                      resultBufBitwiseOp[k] = buf1[k] & buf2[k];
                    else if (currentOpcode === OP_default.OP_OR)
                      resultBufBitwiseOp[k] = buf1[k] | buf2[k];
                    else
                      resultBufBitwiseOp[k] = buf1[k] ^ buf2[k];
                  }
                  this.#pushStack(resultBufBitwiseOp);
                })();
                break;
              }
              case OP_default.OP_INVERT: {
                ;
                (() => {
                  this.#requireStackItems(1, "OP_INVERT requires at least one item to be on the stack.");
                  buf = this.#popStack();
                  const invertedBufOp = Array.from({ length: buf.length }, () => 0);
                  for (let k = 0; k < buf.length; k++) {
                    invertedBufOp[k] = ~buf[k] & 255;
                  }
                  this.#pushStack(invertedBufOp);
                })();
                break;
              }
              case OP_default.OP_LSHIFT:
              case OP_default.OP_RSHIFT: {
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
                  bn2 = this.#readScriptNumber(this.#popStack());
                  buf1 = this.#popStack();
                  const shiftBits = bn2.toBigInt();
                  if (shiftBits < 0n)
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires the top item on the stack not to be negative.`);
                  if (buf1.length === 0) {
                    this.#pushStack([]);
                    return;
                  }
                  if (shiftBits >= BigInt(buf1.length) * 8n) {
                    this.#pushStack(Array.from({ length: buf1.length }, () => 0));
                    return;
                  }
                  bn1 = new BigNumber(buf1);
                  let shiftedBn;
                  if (currentOpcode === OP_default.OP_LSHIFT) {
                    shiftedBn = bn1.ushln(shiftBits);
                    const mask = new BigNumber(1).ushln(buf1.length * 8).isubn(1);
                    shiftedBn = shiftedBn.iand(mask);
                  } else {
                    shiftedBn = bn1.ushrn(shiftBits);
                  }
                  const shiftedArr = shiftedBn.toArray("be", buf1.length);
                  this.#pushStack(shiftedArr);
                })();
                break;
              }
              case OP_default.OP_EQUAL:
              case OP_default.OP_EQUALVERIFY:
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
                  buf2 = this.#popStack();
                  buf1 = this.#popStack();
                  fValue = compareNumberArrays(buf1, buf2);
                  this.#pushStack(fValue ? [1] : []);
                  if (currentOpcode === OP_default.OP_EQUALVERIFY) {
                    if (!fValue)
                      this.#scriptEvaluationError("OP_EQUALVERIFY requires the top two stack items to be equal.");
                    this.#popStack();
                  }
                })();
                break;
              case OP_default.OP_1ADD:
              case OP_default.OP_1SUB:
              case OP_default.OP_2MUL:
              case OP_default.OP_2DIV:
              case OP_default.OP_NEGATE:
              case OP_default.OP_ABS:
              case OP_default.OP_NOT:
              case OP_default.OP_0NOTEQUAL:
                ;
                (() => {
                  this.#requireStackItems(1, `${OP_default[currentOpcode]} requires at least one item to be on the stack.`);
                  bn = this.#readScriptNumber(this.#popStack());
                  switch (currentOpcode) {
                    case OP_default.OP_1ADD:
                      bn = bn.add(new BigNumber(1));
                      break;
                    case OP_default.OP_1SUB:
                      bn = bn.sub(new BigNumber(1));
                      break;
                    case OP_default.OP_2MUL:
                      bn = bn.mul(new BigNumber(2));
                      break;
                    case OP_default.OP_2DIV:
                      bn = bn.div(new BigNumber(2));
                      break;
                    case OP_default.OP_NEGATE:
                      bn = bn.neg();
                      break;
                    case OP_default.OP_ABS:
                      if (bn.isNeg())
                        bn = bn.neg();
                      break;
                    case OP_default.OP_NOT:
                      bn = new BigNumber(bn.cmpn(0) === 0 ? 1 : 0);
                      break;
                    case OP_default.OP_0NOTEQUAL:
                      bn = new BigNumber(bn.cmpn(0) === 0 ? 0 : 1);
                      break;
                  }
                  this.#pushStack(bn.toScriptNum());
                })();
                break;
              case OP_default.OP_ADD:
              case OP_default.OP_SUB:
              case OP_default.OP_MUL:
              case OP_default.OP_DIV:
              case OP_default.OP_MOD:
              case OP_default.OP_BOOLAND:
              case OP_default.OP_BOOLOR:
              case OP_default.OP_NUMEQUAL:
              case OP_default.OP_NUMEQUALVERIFY:
              case OP_default.OP_NUMNOTEQUAL:
              case OP_default.OP_LESSTHAN:
              case OP_default.OP_GREATERTHAN:
              case OP_default.OP_LESSTHANOREQUAL:
              case OP_default.OP_GREATERTHANOREQUAL:
              case OP_default.OP_MIN:
              case OP_default.OP_MAX: {
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
                  buf2 = this.#popStack();
                  buf1 = this.#popStack();
                  bn2 = this.#readScriptNumber(buf2);
                  bn1 = this.#readScriptNumber(buf1);
                  const predictedLen = (() => {
                    switch (currentOpcode) {
                      case OP_default.OP_MUL:
                        return bn1.byteLength() + bn2.byteLength();
                      case OP_default.OP_ADD:
                      case OP_default.OP_SUB:
                        return Math.max(bn1.byteLength(), bn2.byteLength()) + 1;
                      default:
                        return Math.max(bn1.byteLength(), bn2.byteLength());
                    }
                  })();
                  this.#ensureStackMem(predictedLen);
                  const resultBnArithmetic = (() => {
                    switch (currentOpcode) {
                      case OP_default.OP_ADD:
                        return bn1.add(bn2);
                      case OP_default.OP_SUB:
                        return bn1.sub(bn2);
                      case OP_default.OP_MUL:
                        return bn1.mul(bn2);
                      case OP_default.OP_DIV:
                        if (bn2.cmpn(0) === 0)
                          this.#scriptEvaluationError("OP_DIV cannot divide by zero!");
                        return bn1.div(bn2);
                      case OP_default.OP_MOD:
                        if (bn2.cmpn(0) === 0)
                          this.#scriptEvaluationError("OP_MOD cannot divide by zero!");
                        return bn1.mod(bn2);
                      case OP_default.OP_BOOLAND:
                        return scriptBooleanAnd(bn1.cmpn(0) !== 0, bn2.cmpn(0) !== 0);
                      case OP_default.OP_BOOLOR:
                        return scriptBooleanOr(bn1.cmpn(0) !== 0, bn2.cmpn(0) !== 0);
                      case OP_default.OP_NUMEQUAL:
                      case OP_default.OP_NUMEQUALVERIFY:
                        return scriptBoolean(bn1.cmp(bn2) === 0);
                      case OP_default.OP_NUMNOTEQUAL:
                        return scriptBoolean(bn1.cmp(bn2) !== 0);
                      case OP_default.OP_LESSTHAN:
                        return scriptBoolean(bn1.cmp(bn2) < 0);
                      case OP_default.OP_GREATERTHAN:
                        return scriptBoolean(bn1.cmp(bn2) > 0);
                      case OP_default.OP_LESSTHANOREQUAL:
                        return scriptBoolean(bn1.cmp(bn2) <= 0);
                      case OP_default.OP_GREATERTHANOREQUAL:
                        return scriptBoolean(bn1.cmp(bn2) >= 0);
                      case OP_default.OP_MIN:
                        return smallerBigNumber(bn1, bn2);
                      case OP_default.OP_MAX:
                        return largerBigNumber(bn1, bn2);
                      default:
                        return new BigNumber(0);
                    }
                  })();
                  this.#pushStack(resultBnArithmetic.toScriptNum());
                  if (currentOpcode === OP_default.OP_NUMEQUALVERIFY) {
                    if (!this.#castToBool(this.#stackTop()))
                      this.#scriptEvaluationError("OP_NUMEQUALVERIFY requires the top stack item to be truthy.");
                    this.#popStack();
                  }
                })();
                break;
              }
              case OP_default.OP_WITHIN:
                this.#requireStackItems(3, "OP_WITHIN requires at least three items to be on the stack.");
                bn3 = this.#readScriptNumber(this.#popStack());
                bn2 = this.#readScriptNumber(this.#popStack());
                bn1 = this.#readScriptNumber(this.#popStack());
                fValue = bn1.cmp(bn2) >= 0 && bn1.cmp(bn3) < 0;
                this.#pushStack(fValue ? [1] : []);
                break;
              case OP_default.OP_RIPEMD160:
              case OP_default.OP_SHA1:
              case OP_default.OP_SHA256:
              case OP_default.OP_HASH160:
              case OP_default.OP_HASH256: {
                ;
                (() => {
                  this.#requireStackItems(1, `${OP_default[currentOpcode]} requires at least one item to be on the stack.`);
                  buf = this.#popStack();
                  let hashResult = [];
                  if (currentOpcode === OP_default.OP_RIPEMD160)
                    hashResult = ripemd160(buf);
                  else if (currentOpcode === OP_default.OP_SHA1)
                    hashResult = sha1(buf);
                  else if (currentOpcode === OP_default.OP_SHA256)
                    hashResult = sha256(buf);
                  else if (currentOpcode === OP_default.OP_HASH160)
                    hashResult = hash160(buf);
                  else if (currentOpcode === OP_default.OP_HASH256)
                    hashResult = hash256(buf);
                  this.#pushStack(hashResult);
                })();
                break;
              }
              case OP_default.OP_CODESEPARATOR:
                this.lastCodeSeparator = this.programCounter;
                break;
              case OP_default.OP_CHECKSIG:
              case OP_default.OP_CHECKSIGVERIFY: {
                ;
                (() => {
                  this.#requireStackItems(2, `${OP_default[currentOpcode]} requires at least two items to be on the stack.`);
                  bufPubkey = this.#popStack();
                  bufSig = this.#popStack();
                  if (!this.#checkSignatureEncoding(bufSig) || !this.#checkPublicKeyEncoding(bufPubkey)) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires correct encoding for the public key and signature.`);
                  }
                  fSuccess = (() => {
                    if (bufSig.length === 0)
                      return false;
                    try {
                      sig = this.#parseChecksigSignature(bufSig);
                      const scriptForChecksig = this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
                      let scriptCodeChunks = scriptForChecksig.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1);
                      if (this.context === "UnlockingScript") {
                        scriptCodeChunks = scriptCodeChunks.concat(this.lockingScript.chunks);
                      }
                      subscript = new Script(scriptCodeChunks);
                      if ((sig.scope & TransactionSignature.SIGHASH_FORKID) === 0 || this.#hasExplicitFlags() && !this.#hasFlag("SIGHASH_FORKID")) {
                        subscript.findAndDelete(new Script().writeBin(bufSig));
                      }
                      pubkey = PublicKey.fromDER(bufPubkey);
                      return this.#verifySignature(sig, pubkey, subscript);
                    } catch {
                      return false;
                    }
                  })();
                  if (!fSuccess && this.#hasFlag("NULLFAIL") && this.#enforceNonMalleability() && bufSig.length > 0) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires failing signatures to be empty.`);
                  }
                  this.#pushStack(fSuccess ? [1] : []);
                  if (currentOpcode === OP_default.OP_CHECKSIGVERIFY) {
                    if (!fSuccess)
                      this.#scriptEvaluationError("OP_CHECKSIGVERIFY requires that a valid signature is provided.");
                    this.#popStack();
                  }
                })();
                break;
              }
              case OP_default.OP_CHECKMULTISIG:
              case OP_default.OP_CHECKMULTISIGVERIFY: {
                ;
                (() => {
                  i = 1;
                  if (this.stack.length < i) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires at least 1 item for nKeys.`);
                  }
                  const nKeysCountBN = this.#readScriptNumber(this.#stackTop(-i));
                  const nKeysCountBigInt = nKeysCountBN.toBigInt();
                  const multisigKeyLimitBigInt = this.#hasExplicitFlags() && !this.#isAfterGenesis() ? BigInt(maxMultisigKeyCountBeforeGenesis) : maxMultisigKeyCountBigInt;
                  if (nKeysCountBigInt < 0n || nKeysCountBigInt > multisigKeyLimitBigInt) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires a key count between 0 and ${multisigKeyLimitBigInt.toString()}.`);
                  }
                  nKeysCount = Number(nKeysCountBigInt);
                  const declaredKeyCount = nKeysCount;
                  ikey = ++i;
                  i += nKeysCount;
                  if (this.stack.length < i) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} stack too small for nKeys and keys. Need ${i}, have ${this.stack.length}.`);
                  }
                  const nSigsCountBN = this.#readScriptNumber(this.#stackTop(-i));
                  const nSigsCountBigInt = nSigsCountBN.toBigInt();
                  if (nSigsCountBigInt < 0n || nSigsCountBigInt > BigInt(nKeysCount)) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires the number of signatures to be no greater than the number of keys.`);
                  }
                  nSigsCount = Number(nSigsCountBigInt);
                  const declaredSigCount = nSigsCount;
                  isig = ++i;
                  i += nSigsCount;
                  if (this.stack.length < i) {
                    this.#scriptEvaluationError(`${OP_default[currentOpcode]} stack too small for N, keys, M, sigs, and dummy. Need ${i}, have ${this.stack.length}.`);
                  }
                  const baseScriptCMS = this.context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
                  const subscriptChunksCMS = baseScriptCMS.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1);
                  subscript = new Script(subscriptChunksCMS);
                  let hasNonEmptySignature = false;
                  for (let k = 0; k < nSigsCount; k++) {
                    bufSig = this.#stackTop(-isig - k);
                    if (bufSig.length > 0)
                      hasNonEmptySignature = true;
                    if ((bufSig.at(-1) & TransactionSignature.SIGHASH_FORKID) === 0 || this.#hasExplicitFlags() && !this.#hasFlag("SIGHASH_FORKID")) {
                      subscript.findAndDelete(new Script().writeBin(bufSig));
                    }
                  }
                  ;
                  (() => {
                    fSuccess = true;
                    while (fSuccess && nSigsCount > 0) {
                      if (nKeysCount === 0) {
                        fSuccess = false;
                        break;
                      }
                      bufSig = this.#stackTop(-isig);
                      bufPubkey = this.#stackTop(-ikey);
                      if (!this.#checkSignatureEncoding(bufSig) || !this.#checkPublicKeyEncoding(bufPubkey)) {
                        this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires correct encoding for the public key and signature.`);
                      }
                      fOk = false;
                      if (bufSig.length > 0) {
                        try {
                          sig = this.#parseChecksigSignature(bufSig);
                          pubkey = PublicKey.fromDER(bufPubkey);
                          fOk = this.#verifySignature(sig, pubkey, subscript);
                        } catch {
                          fOk = false;
                        }
                      }
                      if (fOk) {
                        isig++;
                        nSigsCount--;
                      }
                      ikey++;
                      nKeysCount--;
                      if (nSigsCount > nKeysCount) {
                        fSuccess = false;
                      }
                    }
                  })();
                  (() => {
                    if (!fSuccess && this.#hasFlag("NULLFAIL") && this.#enforceNonMalleability() && hasNonEmptySignature) {
                      this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires failing signatures to be empty.`);
                    }
                    const itemsConsumedByOp = 1 + // N_val
                    declaredKeyCount + // keys
                    1 + // M_val
                    declaredSigCount + // sigs
                    1;
                    let popCount = itemsConsumedByOp - 1;
                    while (popCount > 0) {
                      this.#popStack();
                      popCount--;
                    }
                    this.#requireStackItems(1, `${OP_default[currentOpcode]} requires an extra item (dummy) to be on the stack.`);
                    const dummyBuf = this.#popStack();
                    if (this.#shouldEnforceNullDummy() && dummyBuf.length > 0) {
                      this.#scriptEvaluationError(`${OP_default[currentOpcode]} requires the extra stack item (dummy) to be empty.`);
                    }
                    this.#pushStack(fSuccess ? [1] : []);
                    if (currentOpcode === OP_default.OP_CHECKMULTISIGVERIFY) {
                      if (!fSuccess)
                        this.#scriptEvaluationError("OP_CHECKMULTISIGVERIFY requires that a sufficient number of valid signatures are provided.");
                      this.#popStack();
                    }
                  })();
                })();
                break;
              }
              case OP_default.OP_CAT: {
                ;
                (() => {
                  this.#requireStackItems(2, "OP_CAT requires at least two items to be on the stack.");
                  buf2 = this.#popStack();
                  buf1 = this.#popStack();
                  const catResult = buf1.concat(buf2);
                  if (catResult.length > this.#maxPushSize())
                    this.#scriptEvaluationError(`It's not currently possible to push data larger than ${this.#maxPushSize()} bytes.`);
                  this.#pushStack(catResult);
                })();
                break;
              }
              case OP_default.OP_SPLIT: {
                ;
                (() => {
                  this.#requireStackItems(2, "OP_SPLIT requires at least two items to be on the stack.");
                  const posBuf = this.#popStack();
                  const dataToSplit = this.#popStack();
                  const splitIndexBigInt = this.#readScriptNumber(posBuf).toBigInt();
                  if (splitIndexBigInt < 0n || splitIndexBigInt > BigInt(dataToSplit.length)) {
                    this.#scriptEvaluationError("OP_SPLIT requires the first stack item to be a non-negative number less than or equal to the size of the second-from-top stack item.");
                  }
                  const splitIndex = Number(splitIndexBigInt);
                  this.#pushStack(dataToSplit.slice(0, splitIndex));
                  this.#pushStack(dataToSplit.slice(splitIndex));
                })();
                break;
              }
              case OP_default.OP_NUM2BIN: {
                ;
                (() => {
                  this.#requireStackItems(2, "OP_NUM2BIN requires at least two items to be on the stack.");
                  const sizeBigInt = this.#readScriptNumber(this.#popStack()).toBigInt();
                  const maxPushSize = this.#maxPushSize();
                  if (Number.isFinite(maxPushSize) && sizeBigInt > BigInt(maxPushSize) || sizeBigInt < 0n) {
                    this.#scriptEvaluationError(`It's not currently possible to push data larger than ${maxPushSize} bytes or negative size.`);
                  }
                  if (sizeBigInt > maxNodeNum2BinSize) {
                    this.#scriptEvaluationError("OP_NUM2BIN size exceeds the node int32 push limit.");
                  }
                  if (this.hasExplicitMemoryLimit && Number.isFinite(this.memoryLimit)) {
                    const allocationLimit = Math.max(0, Math.floor(this.memoryLimit));
                    if (sizeBigInt > BigInt(allocationLimit)) {
                      throw new ScriptResourceLimitError("element-size", allocationLimit, sizeBigInt);
                    }
                  }
                  size = Number(sizeBigInt);
                  let rawnum = this.#popStack();
                  rawnum = minimallyEncode(rawnum);
                  if (rawnum.length > size) {
                    this.#scriptEvaluationError("OP_NUM2BIN requires that the size expressed in the top stack item is large enough to hold the value expressed in the second-from-top stack item.");
                  }
                  if (rawnum.length === size) {
                    this.#pushStack(rawnum);
                    return;
                  }
                  const resultN2B = Array.from({ length: size }, () => 0);
                  let signbit = 0;
                  if (rawnum.length > 0) {
                    signbit = rawnum.at(-1) & 128;
                    rawnum[rawnum.length - 1] &= 127;
                  }
                  for (let k = 0; k < rawnum.length; k++) {
                    resultN2B[k] = rawnum[k];
                  }
                  if (signbit !== 0) {
                    resultN2B[size - 1] |= 128;
                  }
                  this.#pushStack(resultN2B);
                })();
                break;
              }
              case OP_default.OP_BIN2NUM: {
                ;
                (() => {
                  this.#requireStackItems(1, "OP_BIN2NUM requires at least one item to be on the stack.");
                  buf1 = this.#popStack();
                  const b2nResult = minimallyEncode(buf1);
                  if (!isMinimallyEncodedHelper(b2nResult)) {
                    this.#scriptEvaluationError("OP_BIN2NUM requires that the resulting number is valid.");
                  }
                  this.#pushStack(b2nResult);
                })();
                break;
              }
              default:
                this.#scriptEvaluationError(`Invalid opcode ${currentOpcode} (pc=${this.programCounter}).`);
            }
          }
          this.#advanceAfterStep(currentScript);
          return true;
        }
        /**
         * @method validate
         * Validates the spend action by interpreting the locking and unlocking scripts.
         * @param {SpendVerificationContext} context - Optional explicit consensus or
         *        policy context passed to a registered script backend.
         * @returns {boolean} Returns true when the spend is valid.
         * @throws {ScriptEvaluationError} If script validation fails.
         * @throws {ScriptResourceLimitError} If a local interpreter resource is
         *         exhausted before validity can be determined.
         * @example
         * spend.validate()
         * console.log("Spend is valid!")
         */
        validate(context) {
          const verifier = scriptVerificationBackend();
          const spend = this.#snapshotForVerifier();
          const ownedContext = context === void 0 ? void 0 : snapshotSpendVerificationContext(context);
          if (verifier?.verifySpendSync !== void 0 && (verifier.isReady?.() ?? true) && (ownedContext === void 0 ? verifier.shouldVerifySpend?.(spend) : verifier.shouldVerifySpend?.(spend, ownedContext)) !== false) {
            const valid = ownedContext === void 0 ? verifier.verifySpendSync(spend) : verifier.verifySpendSync(spend, ownedContext);
            if (valid !== true) {
              this.#scriptEvaluationError("The selected script-verification backend rejected the spend.");
            }
            return true;
          }
          return this.validateJavaScript();
        }
        /**
         * Runs the original TypeScript interpreter explicitly, bypassing any
         * registered optional backend.
         */
        validateJavaScript() {
          this.reset();
          if (this.#shouldEnforceSigPushOnly() && !this.unlockingScript.isPushOnly()) {
            this.#scriptEvaluationError("Unlocking scripts can only contain push operations, and no other opcodes.");
          }
          const originalLockingScript = this.lockingScript;
          const shouldEvaluateP2SH = this.#hasFlag("P2SH") && !this.#isAfterGenesis() && this.#isP2SHLockingScript(this.lockingScript);
          if (shouldEvaluateP2SH && !this.unlockingScript.isPushOnly()) {
            this.#scriptEvaluationError("P2SH unlocking scripts can only contain push operations.");
          }
          this.#runScript("UnlockingScript");
          const stackAfterUnlockingScript = this.stack.map((item) => item.slice());
          this.#runScript("LockingScript");
          this.#requireTruthyTopStack();
          try {
            if (shouldEvaluateP2SH) {
              if (stackAfterUnlockingScript.length === 0) {
                this.#scriptEvaluationError("P2SH evaluation requires a redeem script on the stack.");
              }
              const redeemScriptBytes = stackAfterUnlockingScript.pop();
              if (redeemScriptBytes === void 0) {
                this.#scriptEvaluationError("P2SH evaluation requires a redeem script on the stack.");
                return false;
              }
              this.#setStack(stackAfterUnlockingScript);
              const redeemScript = Script.fromBinary(redeemScriptBytes);
              this.lockingScript = new LockingScript(redeemScript.chunks);
              this.#runScript("LockingScript");
            }
          } finally {
            this.lockingScript = originalLockingScript;
          }
          if (this.#shouldEnforceCleanStack() && this.stack.length !== 1) {
            this.#scriptEvaluationError(`The clean stack rule requires exactly one item to be on the stack after script execution, found ${this.stack.length}.`);
          }
          this.#requireTruthyTopStack();
          return true;
        }
        #snapshotForVerifier() {
          const cloneLockingScript = (script) => new LockingScript(script.chunks.map((chunk) => ({
            op: chunk.op,
            data: chunk.data === void 0 ? void 0 : Array.from(chunk.data),
            invalidLength: chunk.invalidLength
          })));
          const cloneUnlockingScript = (script) => new UnlockingScript(script.chunks.map((chunk) => ({
            op: chunk.op,
            data: chunk.data === void 0 ? void 0 : Array.from(chunk.data),
            invalidLength: chunk.invalidLength
          })));
          const cloneInput = (input) => ({
            sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id("hex"),
            sourceOutputIndex: input.sourceOutputIndex,
            unlockingScript: input.unlockingScript === void 0 ? void 0 : cloneUnlockingScript(input.unlockingScript),
            sequence: input.sequence
          });
          return new _Spend({
            sourceTXID: this.sourceTXID,
            sourceOutputIndex: this.sourceOutputIndex,
            sourceSatoshis: this.sourceSatoshis,
            lockingScript: cloneLockingScript(this.lockingScript),
            transactionVersion: this.transactionVersion,
            otherInputs: this.otherInputs.map(cloneInput),
            allInputs: this.allInputs?.map(cloneInput),
            outputs: this.outputs.map((output) => ({
              satoshis: output.satoshis,
              lockingScript: cloneLockingScript(output.lockingScript),
              change: output.change
            })),
            inputIndex: this.inputIndex,
            unlockingScript: cloneUnlockingScript(this.unlockingScript),
            inputSequence: this.inputSequence,
            lockTime: this.lockTime,
            memoryLimit: this.hasExplicitMemoryLimit ? this.memoryLimit : void 0,
            isRelaxed: this.isRelaxedOverride,
            verifyFlags: this.verifyFlags === void 0 ? void 0 : Array.from(this.verifyFlags)
          });
        }
        /**
         * Validates this spend with an asynchronous pluggable backend. This is the
         * native/WASM counterpart to {@link validate}. An adaptive backend may decline
         * the Spend before execution, in which case the existing JavaScript validator
         * is used. Once selected, backend errors remain authoritative and propagate.
         * @param verifier - The backend used when it accepts this Spend.
         * @param context - Optional explicit consensus or policy context. Transaction
         * version is never used as a substitute for this context.
         */
        async validateWith(verifier, context) {
          const spend = this.#snapshotForVerifier();
          const ownedContext = context === void 0 ? void 0 : snapshotSpendVerificationContext(context);
          const shouldVerify = ownedContext === void 0 ? verifier.shouldVerifySpend?.(spend) : verifier.shouldVerifySpend?.(spend, ownedContext);
          if (shouldVerify !== void 0 && typeof shouldVerify !== "boolean") {
            throw new TypeError("Spend verifier selection must be boolean");
          }
          if (shouldVerify === false) {
            return spend.validateJavaScript();
          }
          const verdict = ownedContext === void 0 ? await verifier.verifySpend(spend) : await verifier.verifySpend(spend, ownedContext);
          if (typeof verdict !== "boolean") {
            throw new TypeError("Spend verifier returned a non-boolean verdict");
          }
          return verdict;
        }
        /**
         * Serializes the ordinary transaction represented by this Spend. The source
         * output is intentionally excluded and is supplied separately to a Spend
         * verifier, avoiding an EF construction and parse for one-input validation.
         */
        toTransactionUint8Array() {
          const currentInput = {
            sourceTXID: this.sourceTXID,
            sourceOutputIndex: this.sourceOutputIndex,
            unlockingScript: this.unlockingScript,
            sequence: this.inputSequence
          };
          const inputs = this.allInputs ?? [
            ...this.otherInputs.slice(0, this.inputIndex),
            currentInput,
            ...this.otherInputs.slice(this.inputIndex)
          ];
          if (this.inputIndex < 0 || this.inputIndex >= inputs.length) {
            throw new RangeError("Spend input index is out of range");
          }
          const writer = new WriterUint8Array();
          writer.writeUInt32LE(this.transactionVersion);
          writer.writeVarIntNum(inputs.length);
          for (let index = 0; index < inputs.length; index++) {
            const input = index === this.inputIndex ? currentInput : inputs[index];
            const sourceTXID = input.sourceTXID ?? input.sourceTransaction?.id("hex");
            if (sourceTXID === void 0)
              throw new Error(`Input ${index} is missing its source transaction ID`);
            if (input.unlockingScript === void 0)
              throw new Error(`Input ${index} is missing its unlocking script`);
            writer.writeReverse(toArray2(sourceTXID, "hex"));
            writer.writeUInt32LE(input.sourceOutputIndex);
            const unlockingScript = input.unlockingScript.toUint8Array();
            writer.writeVarIntNum(unlockingScript.length);
            writer.write(unlockingScript);
            writer.writeUInt32LE(input.sequence ?? 4294967295);
          }
          writer.writeVarIntNum(this.outputs.length);
          for (const output of this.outputs) {
            writer.writeUInt64LE(output.satoshis ?? 0);
            const lockingScript = output.lockingScript.toUint8Array();
            writer.writeVarIntNum(lockingScript.length);
            writer.write(lockingScript);
          }
          writer.writeUInt32LE(this.lockTime);
          return writer.toUint8Array();
        }
        #runScript(context) {
          this.context = context;
          this.programCounter = 0;
          this.ifStack = [];
          this.elseStack = [];
          this.returningFromConditional = false;
          this.#clearAltStack();
          this.lastCodeSeparator = null;
          const script = context === "UnlockingScript" ? this.unlockingScript : this.lockingScript;
          if (this.#hasExplicitFlags() && !this.#isAfterGenesis() && script.toUint8Array().length > maxScriptSizeBeforeGenesis) {
            this.#scriptEvaluationError(`Script size exceeds ${maxScriptSizeBeforeGenesis} bytes.`);
          }
          while (this.programCounter < script.chunks.length) {
            this.step();
          }
          if (this.ifStack.length > 0) {
            this.#scriptEvaluationError("Every OP_IF, OP_NOTIF, or OP_ELSE must be terminated with OP_ENDIF prior to the end of the script.");
          }
          this.ifStack = [];
          this.elseStack = [];
          this.#clearAltStack();
          this.lastCodeSeparator = null;
        }
        #isP2SHLockingScript(script) {
          const chunks = script.chunks;
          return chunks.length === 3 && chunks[0].op === OP_default.OP_HASH160 && chunks[1].op === 20 && Array.isArray(chunks[1].data) && chunks[1].data.length === 20 && chunks[2].op === OP_default.OP_EQUAL;
        }
        #requireTruthyTopStack() {
          if (this.stack.length === 0) {
            this.#scriptEvaluationError("The top stack element must be truthy after script evaluation (stack is empty).");
          } else if (!this.#castToBool(this.#stackTop())) {
            this.#scriptEvaluationError("The top stack element must be truthy after script evaluation.");
          }
        }
        #castToBool(val) {
          if (val.length === 0)
            return false;
          for (let i = 0; i < val.length; i++) {
            if (val[i] !== 0) {
              return !(i === val.length - 1 && val[i] === 128);
            }
          }
          return false;
        }
        #scriptEvaluationError(str) {
          throw new ScriptEvaluationError({
            message: str,
            txid: this.sourceTXID,
            outputIndex: this.sourceOutputIndex,
            context: this.context,
            programCounter: this.programCounter,
            stackState: this.stack,
            altStackState: this.altStack,
            ifStackState: this.ifStack,
            stackMem: this.stackMem,
            altStackMem: this.altStackMem
          });
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/SignatureUtils.js
  function requireUInt32(value, name) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_UINT32) {
      throw new Error(`${name} must be an unsigned 32-bit integer`);
    }
    return value;
  }
  function requireSatoshis(value, name) {
    if (!Number.isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS) {
      throw new Error(`${name} must be a valid number of satoshis`);
    }
    return value;
  }
  function requireTxid(value, name) {
    if (typeof value !== "string" || !/^[0-9a-fA-F]{64}$/.test(value)) {
      throw new Error(`${name} must be a 32-byte hexadecimal transaction ID`);
    }
    return value.toLowerCase();
  }
  function requireScript(value, name) {
    if (value == null || typeof value !== "object" || typeof value.toHex !== "function") {
      throw new Error(`${name} must be a Script`);
    }
    const hex2 = value.toHex();
    if (typeof hex2 !== "string" || !/^(?:[0-9a-fA-F]{2})*$/.test(hex2)) {
      throw new Error(`${name} must serialize to a valid hexadecimal script`);
    }
    return value;
  }
  function computeSignatureScope(signOutputs, anyoneCanPay) {
    if (signOutputs !== "all" && signOutputs !== "none" && signOutputs !== "single") {
      throw new Error('signOutputs must be "all", "none", or "single"');
    }
    if (typeof anyoneCanPay !== "boolean") {
      throw new TypeError("anyoneCanPay must be a boolean");
    }
    let signatureScope = TransactionSignature.SIGHASH_FORKID;
    if (signOutputs === "all") {
      signatureScope |= TransactionSignature.SIGHASH_ALL;
    }
    if (signOutputs === "none") {
      signatureScope |= TransactionSignature.SIGHASH_NONE;
    }
    if (signOutputs === "single") {
      signatureScope |= TransactionSignature.SIGHASH_SINGLE;
    }
    if (anyoneCanPay) {
      signatureScope |= TransactionSignature.SIGHASH_ANYONECANPAY;
    }
    return signatureScope;
  }
  function resolveSourceDetails(tx, inputIndex, providedSourceSatoshis, providedLockingScript) {
    if (tx == null || !Array.isArray(tx.inputs)) {
      throw new Error("A transaction with inputs is required for transaction signing.");
    }
    if (!Number.isSafeInteger(inputIndex) || inputIndex < 0 || inputIndex >= tx.inputs.length) {
      throw new Error(`inputIndex ${inputIndex} is outside the transaction input range`);
    }
    const input = tx.inputs[inputIndex];
    const sourceOutputIndex = requireUInt32(input.sourceOutputIndex, "input.sourceOutputIndex");
    const providedSourceTXID = input.sourceTXID === void 0 ? void 0 : requireTxid(input.sourceTXID, "input.sourceTXID");
    const embeddedSourceTXID = input.sourceTransaction === void 0 ? void 0 : requireTxid(input.sourceTransaction.id("hex"), "input.sourceTransaction ID");
    if (providedSourceTXID !== void 0 && embeddedSourceTXID !== void 0 && providedSourceTXID !== embeddedSourceTXID) {
      throw new Error("The input sourceTXID does not match the input sourceTransaction.");
    }
    const sourceTXID = providedSourceTXID ?? embeddedSourceTXID;
    if (sourceTXID === void 0) {
      throw new Error("The input sourceTXID or sourceTransaction is required for transaction signing.");
    }
    const sourceOutput = input.sourceTransaction?.outputs[sourceOutputIndex];
    if (input.sourceTransaction !== void 0 && sourceOutput == null) {
      throw new Error(`The input sourceTransaction has no output at index ${sourceOutputIndex}.`);
    }
    const explicitSourceSatoshis = providedSourceSatoshis === void 0 ? void 0 : requireSatoshis(providedSourceSatoshis, "sourceSatoshis");
    const embeddedSourceSatoshis = sourceOutput?.satoshis === void 0 ? void 0 : requireSatoshis(sourceOutput.satoshis, "sourceTransaction output satoshis");
    if (explicitSourceSatoshis !== void 0 && embeddedSourceSatoshis !== void 0 && explicitSourceSatoshis !== embeddedSourceSatoshis) {
      throw new Error("The sourceSatoshis does not match the input sourceTransaction output.");
    }
    const sourceSatoshis = explicitSourceSatoshis ?? embeddedSourceSatoshis;
    if (sourceSatoshis === void 0) {
      throw new Error("The sourceSatoshis or input sourceTransaction is required for transaction signing.");
    }
    const explicitLockingScript = providedLockingScript === void 0 ? void 0 : requireScript(providedLockingScript, "lockingScript");
    const embeddedLockingScript = sourceOutput?.lockingScript === void 0 ? void 0 : requireScript(sourceOutput.lockingScript, "sourceTransaction output lockingScript");
    if (explicitLockingScript !== void 0 && embeddedLockingScript !== void 0 && explicitLockingScript.toHex().toLowerCase() !== embeddedLockingScript.toHex().toLowerCase()) {
      throw new Error("The lockingScript does not match the input sourceTransaction output.");
    }
    const lockingScript = explicitLockingScript ?? embeddedLockingScript;
    if (lockingScript === void 0) {
      throw new Error("The lockingScript or input sourceTransaction is required for transaction signing.");
    }
    return {
      sourceTXID,
      sourceSatoshis,
      lockingScript,
      allInputs: tx.inputs,
      // Preserve the public helper's legacy result without paying for it unless a
      // caller explicitly reads the property.
      get otherInputs() {
        return tx.inputs.filter((_, index) => index !== inputIndex);
      }
    };
  }
  function formatPreimage(params) {
    const { tx, inputIndex, signatureScope, sourceTXID, sourceSatoshis, lockingScript, otherInputs, allInputs, inputSequence } = params;
    const input = tx.inputs[inputIndex];
    requireUInt32(input.sourceOutputIndex, "input.sourceOutputIndex");
    requireSatoshis(sourceSatoshis, "sourceSatoshis");
    requireTxid(sourceTXID, "sourceTXID");
    requireScript(lockingScript, "lockingScript");
    requireUInt32(signatureScope, "signatureScope");
    const sequence = inputSequence ?? verifyNotNull(input.sequence, "input.sequence must have value");
    requireUInt32(sequence, "inputSequence");
    return TransactionSignature.format({
      sourceTXID,
      sourceOutputIndex: verifyNotNull(input.sourceOutputIndex, "input.sourceOutputIndex must have value"),
      sourceSatoshis,
      transactionVersion: tx.version,
      otherInputs: otherInputs ?? [],
      allInputs,
      inputIndex,
      outputs: tx.outputs,
      inputSequence: sequence,
      subscript: lockingScript,
      lockTime: tx.lockTime,
      scope: signatureScope,
      cache: tx.getSignatureHashCache()
    });
  }
  var MAX_SATOSHIS, MAX_UINT32;
  var init_SignatureUtils = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/templates/SignatureUtils.js"() {
      init_TransactionSignature();
      init_utils();
      MAX_SATOSHIS = 21e14;
      MAX_UINT32 = 4294967295;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/P2PKH.js
  function validateCompressedPublicKey(value) {
    const bytes3 = validateAsyncCryptoBytes("publicKeyFromPrivate", value, 33);
    if (bytes3[0] !== 2 && bytes3[0] !== 3) {
      throw new Error("publicKeyFromPrivate returned an invalid compressed public key");
    }
    return bytes3;
  }
  var P2PKH;
  var init_P2PKH = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/templates/P2PKH.js"() {
      init_OP();
      init_utils();
      init_LockingScript();
      init_UnlockingScript();
      init_TransactionSignature();
      init_Hash();
      init_SignatureUtils();
      init_Signature();
      init_AsyncCryptoBackend();
      P2PKH = class {
        /**
         * Creates a P2PKH locking script for a given public key hash or address string
         *
         * @param {number[] | string} pubkeyhash or address - An array or address representing the public key hash.
         * @returns {LockingScript} - A P2PKH locking script.
         */
        lock(pubkeyhash) {
          let data;
          if (typeof pubkeyhash === "string") {
            const hash = fromBase58Check(pubkeyhash);
            if (hash.prefix.length !== 1 || hash.prefix[0] !== 0 && hash.prefix[0] !== 111) {
              throw new Error("only P2PKH is supported");
            }
            data = hash.data;
          } else {
            if (!Array.isArray(pubkeyhash)) {
              throw new Error("P2PKH hash must be a dense byte array");
            }
            for (let index = 0; index < pubkeyhash.length; index++) {
              const byte = pubkeyhash[index];
              if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
                throw new Error("P2PKH hash must be a dense byte array");
              }
            }
            data = pubkeyhash;
          }
          if (data.length !== 20) {
            throw new Error("P2PKH hash length must be 20 bytes");
          }
          return new LockingScript([
            { op: OP_default.OP_DUP },
            { op: OP_default.OP_HASH160 },
            { op: data.length, data },
            { op: OP_default.OP_EQUALVERIFY },
            { op: OP_default.OP_CHECKSIG }
          ]);
        }
        /**
         * Creates a function that generates a P2PKH unlocking script along with its signature and length estimation.
         *
         * The returned object contains:
         * 1. `sign` - A function that, when invoked with a transaction and an input index,
         *    produces an unlocking script suitable for a P2PKH locked output.
         * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
         *
         * @param {PrivateKey} privateKey - The private key used for signing the transaction.
         * @param {'all'|'none'|'single'} signOutputs - The signature scope for outputs.
         * @param {boolean} anyoneCanPay - Flag indicating if the signature allows for other inputs to be added later.
         * @param {number} sourceSatoshis - Optional. The amount being unlocked. Otherwise the input.sourceTransaction is required.
         * @param {Script} lockingScript - Optional. The lockinScript. Otherwise the input.sourceTransaction is required.
         * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
         */
        unlock(privateKey, signOutputs = "all", anyoneCanPay = false, sourceSatoshis, lockingScript) {
          return {
            sign: async (tx, inputIndex) => {
              const signatureScope = computeSignatureScope(signOutputs, anyoneCanPay);
              const resolved = resolveSourceDetails(tx, inputIndex, sourceSatoshis, lockingScript);
              const preimage = formatPreimage({
                tx,
                inputIndex,
                signatureScope,
                sourceTXID: resolved.sourceTXID,
                sourceSatoshis: resolved.sourceSatoshis,
                lockingScript: resolved.lockingScript,
                allInputs: resolved.allInputs
              });
              const preimageHash = sha256(preimage);
              const signingBackend = readyAsyncCryptoBackend("signDigest");
              const publicKeyBackend = readyAsyncCryptoBackend("publicKeyFromPrivate");
              const privateKeyBytes = signingBackend === void 0 && publicKeyBackend === void 0 ? void 0 : Uint8Array.from(privateKey.toArray("be", 32));
              const publicKeyBytes = publicKeyBackend === void 0 ? privateKey.toPublicKey().encode(true) : void 0;
              const rawSignature = signingBackend === void 0 ? privateKey.sign(preimageHash) : Signature.fromDER(Array.from(validateAsyncCryptoBytes("signDigest", await signingBackend.signDigest(
                privateKeyBytes,
                // PrivateKey.sign hashes its argument before ECDSA signing.
                // Preserve that historical double-SHA256 contract when passing a
                // digest to a backend that signs the supplied bytes directly.
                Uint8Array.from(sha256(preimageHash))
              ))));
              const sig = new TransactionSignature(rawSignature.r, rawSignature.s, signatureScope);
              const sigForScript = sig.toChecksigFormat();
              const pubkeyForScript = publicKeyBackend === void 0 ? publicKeyBytes : Array.from(validateCompressedPublicKey(await publicKeyBackend.publicKeyFromPrivate(privateKeyBytes)));
              return new UnlockingScript([
                { op: sigForScript.length, data: sigForScript },
                { op: pubkeyForScript.length, data: pubkeyForScript }
              ]);
            },
            estimateLength: async () => {
              return 108;
            }
          };
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/PushDropValidation.js
  var init_PushDropValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/templates/PushDropValidation.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/templates/index.js
  var init_templates = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/templates/index.js"() {
      init_P2PKH();
      init_PushDropValidation();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/script/index.js
  var init_script = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/script/index.js"() {
      init_LockingScript();
      init_UnlockingScript();
      init_templates();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/SatoshisPerKilobyte.js
  function validateRate(value) {
    if (!Number.isFinite(value) || value < 0 || value > 21e14) {
      throw new RangeError("Satoshis-per-kilobyte rate must be finite and non-negative.");
    }
  }
  var SatoshisPerKilobyte;
  var init_SatoshisPerKilobyte = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/SatoshisPerKilobyte.js"() {
      SatoshisPerKilobyte = class {
        /**
         * @property
         * Denotes the number of satoshis paid per kilobyte of transaction size.
         */
        value;
        /**
         * Constructs an instance of the sat/kb fee model.
         *
         * @param {number} value - The number of satoshis per kilobyte to charge as a fee.
         */
        constructor(value) {
          validateRate(value);
          this.value = value;
        }
        /**
         * Computes the fee for a given transaction.
         *
         * @param tx The transaction for which a fee is to be computed.
         * @returns The fee in satoshis for the transaction, as a BigNumber.
         */
        async computeFee(tx) {
          const rate = this.value;
          validateRate(rate);
          const getVarIntSize = (i) => {
            if (i > 4294967295) {
              return 9;
            } else if (i > 65535) {
              return 5;
            } else if (i >= 253) {
              return 3;
            } else {
              return 1;
            }
          };
          let size = 4;
          size += getVarIntSize(tx.inputs.length);
          for (let i = 0; i < tx.inputs.length; i++) {
            const input = tx.inputs[i];
            size += 40;
            let scriptLength;
            if (typeof input.unlockingScript === "object") {
              scriptLength = input.unlockingScript.toBinary().length;
            } else if (typeof input.unlockingScriptTemplate === "object") {
              scriptLength = await input.unlockingScriptTemplate.estimateLength(tx, i);
            } else {
              throw new TypeError("All inputs must have an unlocking script or an unlocking script template for sat/kb fee computation.");
            }
            if (!Number.isSafeInteger(scriptLength) || scriptLength < 0) {
              throw new RangeError("Unlocking script length must be a non-negative safe integer.");
            }
            size += getVarIntSize(scriptLength);
            size += scriptLength;
          }
          size += getVarIntSize(tx.outputs.length);
          for (const out of tx.outputs) {
            size += 8;
            const length = out.lockingScript.toBinary().length;
            if (!Number.isSafeInteger(length) || length < 0) {
              throw new RangeError("Locking script length must be a non-negative safe integer.");
            }
            size += getVarIntSize(length);
            size += length;
          }
          size += 4;
          const fee = Math.ceil(size / 1e3 * rate);
          if (!Number.isSafeInteger(fee) || fee < 0 || fee > 21e14) {
            throw new RangeError("Computed transaction fee is outside the valid satoshi range.");
          }
          return fee;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/HttpClientResponseUtils.js
  function normalizeHttpClientLimits(limits = {}) {
    const maxResponseBytes = limits.maxResponseBytes ?? DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES;
    const timeoutMs = limits.timeoutMs ?? DEFAULT_HTTP_CLIENT_TIMEOUT_MS;
    if (!Number.isSafeInteger(maxResponseBytes) || maxResponseBytes < 1) {
      throw new RangeError("maxResponseBytes must be a positive safe integer");
    }
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10 * 6e4) {
      throw new RangeError("timeoutMs must be an integer from 1 through 600000");
    }
    return { maxResponseBytes, timeoutMs };
  }
  function timedRequestSignal(parent, timeoutMs) {
    const controller = new AbortController();
    const abort = () => controller.abort(parent?.reason);
    if (parent?.aborted === true)
      abort();
    else
      parent?.addEventListener("abort", abort, { once: true });
    const timer = setTimeout(() => controller.abort(new DOMException("HTTP request timed out", "TimeoutError")), timeoutMs);
    return {
      signal: controller.signal,
      dispose() {
        clearTimeout(timer);
        parent?.removeEventListener("abort", abort);
      }
    };
  }
  async function readFetchResponseText(response, maximumBytes) {
    const responseLike = response;
    const declared = response.headers?.get?.("content-length") ?? null;
    if (declared !== null) {
      if (!/^(0|[1-9]\d*)$/.test(declared) || Number(declared) > maximumBytes) {
        await response.body?.cancel().catch(() => {
        });
        throw new Error("HTTP response exceeds the configured size limit");
      }
    }
    if (!("body" in responseLike)) {
      const text = await responseLike.text?.() ?? "";
      if (utf8ByteLength(text) > maximumBytes) {
        throw new Error("HTTP response exceeds the configured size limit");
      }
      return text;
    }
    if (response.body == null)
      return "";
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        length += value.byteLength;
        if (!Number.isSafeInteger(length) || length > maximumBytes) {
          await reader.cancel();
          throw new Error("HTTP response exceeds the configured size limit");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes3 = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes3.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes3);
    } catch (cause) {
      throw new Error("HTTP response is not valid UTF-8", { cause });
    }
  }
  var DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES, DEFAULT_HTTP_CLIENT_TIMEOUT_MS;
  var init_HttpClientResponseUtils = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/HttpClientResponseUtils.js"() {
      init_UTF8();
      DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
      DEFAULT_HTTP_CLIENT_TIMEOUT_MS = 3e4;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpRequestUtils.js
  function executeNodejsRequest(https, url, requestOptions, serializeData) {
    return new Promise((resolve, reject) => {
      let serialized;
      try {
        serialized = requestOptions.data === null || requestOptions.data === void 0 ? void 0 : serializeData(requestOptions.data);
      } catch (error) {
        reject(error);
        return;
      }
      const { data: _data, ...nodeOptions } = requestOptions;
      let settled = false;
      let req;
      let deadline;
      const cleanup = () => {
        if (deadline !== void 0)
          clearTimeout(deadline);
        requestOptions.signal?.removeEventListener("abort", abort);
      };
      const rejectOnce = (error) => {
        if (settled)
          return;
        settled = true;
        cleanup();
        reject(error);
      };
      const resolveOnce = (response) => {
        if (settled)
          return;
        settled = true;
        cleanup();
        resolve(response);
      };
      const abort = () => {
        const reason = requestOptions.signal?.reason instanceof Error ? requestOptions.signal.reason : new DOMException("HTTP request aborted", "AbortError");
        req?.destroy?.(reason);
        rejectOnce(reason);
      };
      req = https.request(url, nodeOptions, (res) => {
        const declared = res.headers?.["content-length"];
        const declaredLength = typeof declared === "string" ? Number(declared) : void 0;
        if (typeof declared === "string" && !/^(0|[1-9]\d*)$/.test(declared) || declaredLength !== void 0 && (!Number.isSafeInteger(declaredLength) || declaredLength > DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES)) {
          res.destroy?.();
          rejectOnce(new Error("HTTP response exceeds the configured size limit"));
          return;
        }
        const chunks = [];
        let length = 0;
        res.on("data", (chunk) => {
          if (settled)
            return;
          const bytes3 = typeof chunk === "string" ? utf8Bytes(chunk) : new Uint8Array(chunk);
          length += bytes3.byteLength;
          if (!Number.isSafeInteger(length) || length > DEFAULT_HTTP_CLIENT_MAX_RESPONSE_BYTES) {
            res.destroy?.();
            req.destroy?.();
            rejectOnce(new Error("HTTP response exceeds the configured size limit"));
            return;
          }
          chunks.push(bytes3);
        });
        res.on("end", () => {
          if (settled)
            return;
          try {
            if (declaredLength !== void 0 && declaredLength !== length) {
              throw new Error("HTTP response differs from its declared length");
            }
            if (!Number.isInteger(res.statusCode) || res.statusCode < 100 || res.statusCode > 599) {
              throw new Error("HTTP response returned an invalid status code");
            }
            const bytes3 = new Uint8Array(length);
            let offset = 0;
            for (const chunk of chunks) {
              bytes3.set(chunk, offset);
              offset += chunk.byteLength;
            }
            const body = new TextDecoder("utf-8", { fatal: true }).decode(bytes3);
            const ok = res.statusCode >= 200 && res.statusCode <= 299;
            const mediaType = res.headers["content-type"];
            const responseData = body !== "" && typeof mediaType === "string" && mediaType.startsWith("application/json") ? JSON.parse(body) : body;
            resolveOnce({
              status: res.statusCode,
              statusText: res.statusMessage ?? "",
              ok,
              data: responseData
            });
          } catch (error) {
            rejectOnce(error);
          }
        });
        res.on("error", rejectOnce);
        res.on("aborted", () => rejectOnce(new Error("HTTP response was aborted")));
      });
      req.on("error", rejectOnce);
      if (!settled) {
        deadline = setTimeout(() => {
          const error = new Error("HTTP request timed out");
          req.destroy?.(error);
          rejectOnce(error);
        }, DEFAULT_HTTP_CLIENT_TIMEOUT_MS);
      }
      req.setTimeout?.(DEFAULT_HTTP_CLIENT_TIMEOUT_MS, () => {
        const error = new Error("HTTP request timed out");
        req.destroy?.(error);
        rejectOnce(error);
      });
      if (requestOptions.signal?.aborted === true)
        abort();
      else
        requestOptions.signal?.addEventListener("abort", abort, { once: true });
      if (settled)
        return;
      if (serialized !== void 0)
        req.write(serialized);
      req.end();
    });
  }
  var init_NodejsHttpRequestUtils = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpRequestUtils.js"() {
      init_HttpClientResponseUtils();
      init_UTF8();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpClient.js
  var NodejsHttpClient;
  var init_NodejsHttpClient = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/NodejsHttpClient.js"() {
      init_NodejsHttpRequestUtils();
      NodejsHttpClient = class {
        https;
        constructor(https) {
          this.https = https;
        }
        async request(url, requestOptions) {
          return await executeNodejsRequest(this.https, url, requestOptions, (data) => JSON.stringify(data));
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/FetchHttpClient.js
  var FetchHttpClient;
  var init_FetchHttpClient = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/FetchHttpClient.js"() {
      init_HttpClientResponseUtils();
      init_UTF8();
      FetchHttpClient = class {
        fetch;
        limits;
        constructor(fetch2, limits = {}) {
          this.fetch = fetch2;
          this.limits = normalizeHttpClientLimits(limits);
        }
        async request(url, options) {
          const timed = timedRequestSignal(options.signal, this.limits.timeoutMs);
          const fetchOptions = {
            method: options.method,
            headers: options.headers,
            body: options.data === void 0 ? null : JSON.stringify(options.data),
            redirect: "error",
            signal: timed.signal
          };
          try {
            const res = await this.fetch(url, fetchOptions);
            const legacyResponse = res;
            const mediaType = legacyResponse.headers?.get?.("Content-Type");
            let data;
            if (!("body" in legacyResponse) && typeof legacyResponse.json === "function" && (mediaType == null || mediaType.startsWith("application/json"))) {
              data = await legacyResponse.json();
              if (utf8ByteLength(JSON.stringify(data)) > this.limits.maxResponseBytes) {
                throw new Error("HTTP response exceeds the configured size limit");
              }
            } else {
              const text = await readFetchResponseText(res, this.limits.maxResponseBytes);
              data = text !== "" && (mediaType?.startsWith("application/json") ?? false) ? JSON.parse(text) : text;
            }
            return {
              ok: res.ok,
              status: res.status,
              statusText: res.statusText,
              data
            };
          } finally {
            timed.dispose();
          }
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/DefaultHttpClient.js
  function defaultHttpClient() {
    const noHttpClient = {
      async request() {
        throw new Error("No method available to perform HTTP request");
      }
    };
    if (globalThis.window !== void 0 && typeof globalThis.window.fetch === "function") {
      return new FetchHttpClient(globalThis.window.fetch.bind(globalThis.window));
    } else if (typeof globalThis.fetch === "function") {
      return new FetchHttpClient(globalThis.fetch.bind(globalThis));
    }
    const nodeRequire = typeof __require === "function" ? __require : void 0;
    if (nodeRequire === void 0) {
      return noHttpClient;
    }
    try {
      const https = nodeRequire(["node", "https"].join(":"));
      return new NodejsHttpClient(https);
    } catch {
      return noHttpClient;
    }
  }
  var init_DefaultHttpClient = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/DefaultHttpClient.js"() {
      init_NodejsHttpClient();
      init_FetchHttpClient();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/LivePolicy.js
  var LivePolicy;
  var init_LivePolicy = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/LivePolicy.js"() {
      init_SatoshisPerKilobyte();
      init_DefaultHttpClient();
      LivePolicy = class _LivePolicy extends SatoshisPerKilobyte {
        static ARC_POLICY_URL = "https://arc.gorillapool.io/v1/policy";
        static instance = null;
        cachedRate = null;
        cacheTimestamp = 0;
        cacheValidityMs;
        /**
         * Constructs an instance of the live policy fee model.
         *
         * @param {number} cacheValidityMs - How long to cache the fee rate in milliseconds (default: 5 minutes)
         */
        constructor(cacheValidityMs = 5 * 60 * 1e3) {
          super(100);
          if (!Number.isSafeInteger(cacheValidityMs) || cacheValidityMs < 0) {
            throw new RangeError("cacheValidityMs must be a non-negative safe integer");
          }
          this.cacheValidityMs = cacheValidityMs;
        }
        /**
         * Gets the singleton instance of LivePolicy to ensure cache sharing across the application.
         *
         * @param {number} cacheValidityMs - How long to cache the fee rate in milliseconds (default: 5 minutes)
         * @returns The singleton LivePolicy instance
         */
        static getInstance(cacheValidityMs = 5 * 60 * 1e3) {
          _LivePolicy.instance ??= new _LivePolicy(cacheValidityMs);
          return _LivePolicy.instance;
        }
        /**
         * Fetches the current fee rate from ARC GorillaPool API.
         *
         * @returns The current satoshis per kilobyte rate
         */
        async fetchFeeRate() {
          const now = Date.now();
          if (this.cachedRate !== null && now - this.cacheTimestamp < this.cacheValidityMs) {
            return this.cachedRate;
          }
          try {
            const response = await defaultHttpClient().request(_LivePolicy.ARC_POLICY_URL, {
              method: "GET",
              headers: { Accept: "application/json" }
            });
            if (!response.ok) {
              throw new Error("Fee-policy provider request failed");
            }
            const responseData = response.data;
            const satoshis2 = responseData?.policy?.miningFee?.satoshis;
            const bytes3 = responseData?.policy?.miningFee?.bytes;
            if (!Number.isSafeInteger(satoshis2) || satoshis2 < 1 || satoshis2 > 21e14 || !Number.isSafeInteger(bytes3) || bytes3 < 1 || bytes3 > 1e9) {
              throw new Error("Invalid policy response format");
            }
            const rate = satoshis2 / bytes3 * 1e3;
            if (!Number.isFinite(rate) || rate <= 0 || rate > 1e9) {
              throw new Error("Invalid policy fee rate");
            }
            this.cachedRate = rate;
            this.cacheTimestamp = now;
            return rate;
          } catch {
            if (this.cachedRate !== null) {
              console.warn("Failed to fetch live fee rate; using cached value.");
              return this.cachedRate;
            }
            console.warn("Failed to fetch live fee rate; using default 100 sat/kb.");
            return 100;
          }
        }
        /**
         * Computes the fee for a given transaction using the current live rate.
         * Overrides the parent method to use dynamic rate fetching.
         *
         * @param tx The transaction for which a fee is to be computed.
         * @returns The fee in satoshis for the transaction.
         */
        async computeFee(tx) {
          const rate = await this.fetchFeeRate();
          this.value = rate;
          return super.computeFee(tx);
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/primitives/SafeRecord.js
  function isPlainRecord(value) {
    if (value == null || typeof value !== "object" || Array.isArray(value))
      return false;
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }
  var init_SafeRecord = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/primitives/SafeRecord.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Broadcaster.js
  function ownDataProperty(value, key) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor == null)
      return { present: false };
    if (!Object.prototype.hasOwnProperty.call(descriptor, "value"))
      return { present: true };
    return { present: true, value: descriptor.value };
  }
  function boundedString(value, maximumBytes) {
    return typeof value === "string" && utf8ByteLength(value) <= maximumBytes;
  }
  function invalidBroadcastResult() {
    return {
      status: "error",
      code: "ERR_INVALID_RESPONSE",
      description: "Broadcaster returned a malformed or transaction-mismatched response."
    };
  }
  function validateBroadcastResult(result, expectedTxid) {
    if (!TXID.test(expectedTxid) || !isPlainRecord(result))
      return invalidBroadcastResult();
    const status = ownDataProperty(result, "status").value;
    if (status === "success") {
      const txid3 = ownDataProperty(result, "txid").value;
      const message = ownDataProperty(result, "message").value;
      const competing = ownDataProperty(result, "competingTxs");
      if (typeof txid3 !== "string" || !TXID.test(txid3) || txid3.toLowerCase() !== expectedTxid.toLowerCase() || !boundedString(message, MAX_BROADCAST_MESSAGE_BYTES))
        return invalidBroadcastResult();
      const normalized2 = {
        status: "success",
        txid: expectedTxid.toLowerCase(),
        message
      };
      if (competing.present) {
        if (!Array.isArray(competing.value) || competing.value.length > MAX_COMPETING_TXS) {
          return invalidBroadcastResult();
        }
        const competingTxs = [];
        const seen = /* @__PURE__ */ new Set();
        for (let i = 0; i < competing.value.length; i++) {
          const descriptor = Object.getOwnPropertyDescriptor(competing.value, i);
          const candidate = descriptor?.value;
          if (descriptor == null || !Object.prototype.hasOwnProperty.call(descriptor, "value") || typeof candidate !== "string" || !TXID.test(candidate))
            return invalidBroadcastResult();
          const canonical = candidate.toLowerCase();
          if (seen.has(canonical))
            return invalidBroadcastResult();
          seen.add(canonical);
          competingTxs.push(canonical);
        }
        normalized2.competingTxs = competingTxs;
      }
      return normalized2;
    }
    if (status !== "error")
      return invalidBroadcastResult();
    const code = ownDataProperty(result, "code").value;
    const description = ownDataProperty(result, "description").value;
    const txid2 = ownDataProperty(result, "txid");
    if (!boundedString(code, MAX_BROADCAST_CODE_BYTES) || !boundedString(description, MAX_BROADCAST_MESSAGE_BYTES) || txid2.present && (typeof txid2.value !== "string" || !TXID.test(txid2.value) || txid2.value.toLowerCase() !== expectedTxid.toLowerCase()))
      return invalidBroadcastResult();
    const normalized = { status: "error", code, description };
    if (txid2.present)
      normalized.txid = expectedTxid.toLowerCase();
    const more = ownDataProperty(result, "more");
    if (more.present && more.value != null && typeof more.value === "object") {
      normalized.more = more.value;
    }
    return normalized;
  }
  var TXID, MAX_BROADCAST_MESSAGE_BYTES, MAX_BROADCAST_CODE_BYTES, MAX_COMPETING_TXS;
  var init_Broadcaster = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/Broadcaster.js"() {
      init_UTF8();
      init_SafeRecord();
      TXID = /^[0-9a-f]{64}$/i;
      MAX_BROADCAST_MESSAGE_BYTES = 8192;
      MAX_BROADCAST_CODE_BYTES = 128;
      MAX_COMPETING_TXS = 256;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/MerklePath.js
  function assertOffset(offset) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new Error("Invalid offset");
    }
  }
  function hashPair(left, right) {
    return toHex(hash256(toArray2((left ?? "") + (right ?? ""), "hex").reverse()).reverse());
  }
  function cachedMerkleRoot(nodeKey, workingHash, treeHeight, nodeHashCache) {
    const cachedNodeHash = nodeHashCache.get(nodeKey);
    if (cachedNodeHash == null)
      return void 0;
    if (cachedNodeHash !== workingHash)
      throw new Error("Mismatched roots");
    const root = nodeHashCache.get(`${treeHeight}:0`);
    if (root == null)
      throw new Error("Mismatched roots");
    return root;
  }
  function nextCachedHash(workingHash, leaf, offset, index, height, isLastOddNode) {
    if (leaf == null) {
      if (isLastOddNode)
        return hashPair(workingHash, workingHash);
      throw new Error(`Missing hash for index ${index} at height ${height}`);
    }
    if (leaf.duplicate === true)
      return hashPair(workingHash, workingHash);
    if (offset % 2 === 1)
      return hashPair(leaf.hash, workingHash);
    return hashPair(workingHash, leaf.hash);
  }
  var offsetAtHeight, siblingOf, sameNodeAtHeight, offsetTreeHeight, MerklePath;
  var init_MerklePath = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/MerklePath.js"() {
      init_utils();
      init_Hash();
      init_ReaderUint8Array();
      offsetAtHeight = (offset, height) => Math.floor(offset / 2 ** height);
      siblingOf = (offset) => offset % 2 === 0 ? offset + 1 : offset - 1;
      sameNodeAtHeight = (index, maxOffset, height) => offsetAtHeight(index, height) === offsetAtHeight(maxOffset, height);
      offsetTreeHeight = (offset) => offset === 0 ? 0 : offset.toString(2).length;
      MerklePath = class _MerklePath {
        blockHeight;
        path;
        /**
         * Creates a MerklePath instance from a hexadecimal string.
         *
         * @static
         * @param {string} hex - The hexadecimal string representation of the Merkle Path.
         * @returns {MerklePath} - A new MerklePath instance.
         */
        static fromHex(hex2) {
          return _MerklePath.fromBinary(toArray2(hex2, "hex"));
        }
        static fromReader(reader, legalOffsetsOnly = true, validateRoots = true) {
          const blockHeight = reader.readVarIntNumStrict(false);
          const treeHeight = reader.readUInt8();
          const path = Array.from({ length: treeHeight }).fill(null).map(() => []);
          let flags, offset, nLeavesAtThisHeight;
          for (let level = 0; level < treeHeight; level++) {
            nLeavesAtThisHeight = reader.readVarIntNumStrict(false);
            while (nLeavesAtThisHeight > 0) {
              offset = reader.readVarIntNumStrict(false);
              flags = reader.readUInt8();
              const leaf = { offset };
              if ((flags & 1) === 1) {
                leaf.duplicate = true;
              } else {
                if ((flags & 2) !== 0) {
                  leaf.txid = true;
                }
                leaf.hash = toHex(reader.read(32).reverse());
              }
              if (!Array.isArray(path[level]) || path[level].length === 0) {
                path[level] = [];
              }
              path[level].push(leaf);
              nLeavesAtThisHeight--;
            }
            path[level].sort((a, b) => a.offset - b.offset);
          }
          return new _MerklePath(blockHeight, path, legalOffsetsOnly, validateRoots);
        }
        /**
         * Creates a MerklePath instance from a binary array.
         *
         * @static
         * @param {number[]} bump - The binary array representation of the Merkle Path.
         * @returns {MerklePath} - A new MerklePath instance.
         */
        static fromBinary(bump, legalOffsetsOnly = true, validateRoots = true) {
          const reader = new ReaderUint8Array(bump);
          return _MerklePath.fromReader(reader, legalOffsetsOnly, validateRoots);
        }
        /**
         *
         * @static fromCoinbaseTxid
         *
         * Creates a MerklePath instance for a coinbase transaction in an empty block.
         * This edge case is difficult to retrieve from standard APIs.
         *
         * @param {string} txid - The coinbase txid.
         * @param {number} height - The height of the block.
         * @returns {MerklePath} - A new MerklePath instance which assumes the tx is in a block with no other transactions.
         */
        static fromCoinbaseTxidAndHeight(txid2, height) {
          return new _MerklePath(height, [[{ offset: 0, hash: txid2, txid: true }]]);
        }
        constructor(blockHeight, path, legalOffsetsOnly = true, validateRoots = true) {
          if (!Array.isArray(path) || path.length === 0 || path.length > 54) {
            throw new Error("Merkle Path must contain between 1 and 54 levels");
          }
          this.blockHeight = blockHeight;
          this.path = path.map((level, height) => {
            if (!Array.isArray(level)) {
              throw new TypeError(`Merkle Path level ${height} must be an array`);
            }
            return level.map((leaf) => ({ ...leaf }));
          });
          const legalOffsets = Array.from({ length: this.path.length }).fill(0).map(() => /* @__PURE__ */ new Set());
          this.path.forEach((leaves, height) => {
            if (leaves.length === 0 && height === 0) {
              throw new Error(`Empty level at height: ${height}`);
            }
            const offsetsAtThisHeight = /* @__PURE__ */ new Set();
            leaves.forEach((leaf) => {
              assertOffset(leaf.offset);
              if (offsetsAtThisHeight.has(leaf.offset)) {
                throw new Error(`Duplicate offset: ${leaf.offset}, at height: ${height}`);
              }
              offsetsAtThisHeight.add(leaf.offset);
              if (height === 0) {
                if (leaf.duplicate !== true) {
                  for (let h = 1; h < this.path.length; h++) {
                    legalOffsets[h].add(siblingOf(offsetAtHeight(leaf.offset, h)));
                  }
                }
              } else if (legalOffsetsOnly && !legalOffsets[height].has(leaf.offset)) {
                throw new Error(`Invalid offset: ${leaf.offset}, at height: ${height}, with legal offsets: ${Array.from(legalOffsets[height], (offset) => offset.toString()).join(", ")}`);
              }
            });
          });
          if (!validateRoots)
            return;
          const sourceIndex = this.path.map((level) => new Map(level.map((leaf) => [leaf.offset, leaf])));
          const hashCache = /* @__PURE__ */ new Map();
          const nodeHashCache = /* @__PURE__ */ new Map();
          const maxOffset = this.path[0].reduce((max, leaf) => Math.max(max, leaf.offset), 0);
          let root;
          this.path[0].forEach((leaf, idx) => {
            const computed = this.computeRootCached(leaf.hash, sourceIndex, hashCache, nodeHashCache, maxOffset);
            if (idx === 0)
              root = computed;
            if (root !== computed) {
              throw new Error("Mismatched roots");
            }
          });
        }
        /**
         * Serializes the MerklePath to the writer provided.
         *
         * @param writer - The writer to which the Merkle Path will be serialized.
         */
        toWriter(writer) {
          writer.writeVarIntNum(this.blockHeight);
          const treeHeight = this.path.length;
          writer.writeUInt8(treeHeight);
          for (let level = 0; level < treeHeight; level++) {
            const nLeaves = Object.keys(this.path[level]).length;
            writer.writeVarIntNum(nLeaves);
            for (const leaf of this.path[level]) {
              writer.writeVarIntNum(leaf.offset);
              let flags = 0;
              if (leaf?.duplicate === true) {
                flags |= 1;
              }
              if (leaf?.txid !== void 0 && leaf.txid !== null) {
                flags |= 2;
              }
              writer.writeUInt8(flags);
              if ((flags & 1) === 0) {
                writer.write(toArray2(leaf.hash, "hex").reverse());
              }
            }
          }
        }
        /**
         * Converts the MerklePath to a binary array format.
         *
         * @returns {number[]} - The binary array representation of the Merkle Path.
         */
        toBinary() {
          const writer = new Writer();
          this.toWriter(writer);
          return writer.toArray();
        }
        /**
         * Converts the MerklePath to a binary array format.
         *
         * @returns {Uint8Array} - The binary array representation of the Merkle Path.
         */
        toBinaryUint8Array() {
          const writer = new WriterUint8Array();
          this.toWriter(writer);
          return writer.toUint8Array();
        }
        /**
         * Converts the MerklePath to a hexadecimal string format.
         *
         * @returns {string} - The hexadecimal string representation of the Merkle Path.
         */
        toHex() {
          return toHex(this.toBinaryUint8Array());
        }
        //
        indexOf(txid2) {
          const leaf = this.path[0].find((l) => l.hash === txid2);
          if (leaf === null || leaf === void 0) {
            throw new Error(`Transaction ID ${txid2} not found in the Merkle Path`);
          }
          return leaf.offset;
        }
        computeRootCached(txid2, sourceIndex, hashCache, nodeHashCache, maxOffset) {
          if (typeof txid2 !== "string")
            txid2 = this.path[0].find((leaf) => Boolean(leaf.hash))?.hash;
          if (typeof txid2 !== "string")
            throw new TypeError("Transaction ID is undefined");
          const index = this.indexOf(txid2);
          if (this.path.length === 1 && this.path[0].length === 1)
            return txid2;
          const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
          let workingHash = txid2;
          for (let height = 0; height < treeHeight; height++) {
            const nodeKey = `${height}:${offsetAtHeight(index, height)}`;
            const cachedRoot = cachedMerkleRoot(nodeKey, workingHash, treeHeight, nodeHashCache);
            if (cachedRoot != null)
              return cachedRoot;
            nodeHashCache.set(nodeKey, workingHash);
            const offset = siblingOf(offsetAtHeight(index, height));
            const leaf = this.cachedFindLeaf(height, offset, sourceIndex, hashCache, maxOffset);
            workingHash = nextCachedHash(workingHash, leaf, offset, index, height, this.path.length === 1 && sameNodeAtHeight(index, maxOffset, height));
          }
          nodeHashCache.set(`${treeHeight}:0`, workingHash);
          return workingHash;
        }
        /**
         * Computes the Merkle root from the provided transaction ID.
         *
         * @param {string} txid - The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!
         * @returns {string} - The computed Merkle root as a hexadecimal string.
         * @throws {Error} - If the transaction ID is not part of the Merkle Path.
         */
        computeRoot(txid2) {
          if (typeof txid2 !== "string") {
            const foundLeaf = this.path[0].find((leaf) => Boolean(leaf?.hash));
            if (foundLeaf == null) {
              throw new Error("No valid leaf found in the Merkle Path");
            }
            txid2 = foundLeaf.hash;
          }
          if (typeof txid2 !== "string") {
            throw new TypeError("Transaction ID is undefined");
          }
          const index = this.indexOf(txid2);
          let workingHash = txid2;
          if (this.path.length === 1 && this.path[0].length === 1)
            return workingHash;
          const maxOffset = this.path[0].reduce((max, l) => Math.max(max, l.offset), 0);
          const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
          for (let height = 0; height < treeHeight; height++) {
            const offset = siblingOf(offsetAtHeight(index, height));
            workingHash = nextCachedHash(workingHash, this.findOrComputeLeaf(height, offset), offset, index, height, this.path.length === 1 && sameNodeAtHeight(index, maxOffset, height));
          }
          return workingHash;
        }
        /**
         * Find leaf with `offset` at `height` or compute from level below, recursively.
         *
         * Does not add computed leaves to path.
         *
         * @param height
         * @param offset
         */
        findOrComputeLeaf(height, offset) {
          assertOffset(offset);
          let leaf = height < this.path.length ? this.path[height].find((l2) => l2.offset === offset) : void 0;
          if (leaf != null)
            return leaf;
          if (height === 0)
            return void 0;
          const h = height - 1;
          const l = offset * 2;
          if (!Number.isSafeInteger(l))
            return void 0;
          const leaf0 = this.findOrComputeLeaf(h, l);
          if (leaf0?.hash == null || leaf0.hash === "")
            return void 0;
          const leaf1 = this.findOrComputeLeaf(h, l + 1);
          if (leaf1?.hash == null) {
            if (leaf1?.duplicate === true) {
              return { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
            }
            if (this.path.length === 1) {
              const maxOffset0 = this.path[0].reduce((max, lf) => Math.max(max, lf.offset), 0);
              if (l === offsetAtHeight(maxOffset0, h)) {
                return { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
              }
            }
            return void 0;
          }
          let workinghash;
          if (leaf1.duplicate === true) {
            workinghash = hashPair(leaf0.hash, leaf0.hash);
          } else {
            workinghash = hashPair(leaf1.hash, leaf0.hash);
          }
          leaf = {
            offset,
            hash: workinghash
          };
          return leaf;
        }
        /**
         * Verifies if the given transaction ID is part of the Merkle tree at the specified block height.
         *
         * @param {string} txid - The transaction ID to verify.
         * @param {ChainTracker} chainTracker - The ChainTracker instance used to verify the Merkle root.
         * @returns {boolean} - True if the transaction ID is valid within the Merkle Path at the specified block height.
         */
        async verify(txid2, chainTracker) {
          const blockHeight = this.blockHeight;
          if (!Number.isSafeInteger(blockHeight) || blockHeight < 0) {
            throw new Error("Merkle Path block height must be a non-negative safe integer");
          }
          const currentHeight = chainTracker?.currentHeight;
          const isValidRootForHeight = chainTracker?.isValidRootForHeight;
          if (typeof currentHeight !== "function" || typeof isValidRootForHeight !== "function") {
            throw new TypeError("A valid ChainTracker is required");
          }
          const root = this.computeRoot(txid2);
          const index = this.indexOf(txid2);
          if (index === 0) {
            const height = await currentHeight.call(chainTracker);
            if (!Number.isSafeInteger(height) || height < 0) {
              throw new Error("ChainTracker current height must be a non-negative safe integer");
            }
            if (blockHeight + 100 > height) {
              return false;
            }
          }
          return await isValidRootForHeight.call(chainTracker, root, blockHeight) === true;
        }
        /**
         * Combines this MerklePath with another to create a compound proof.
         *
         * @param {MerklePath} other - Another MerklePath to combine with this path.
         * @throws {Error} - If the paths have different block heights or roots.
         */
        combine(other) {
          if (this.blockHeight !== other.blockHeight) {
            throw new Error("You cannot combine paths which do not have the same block height.");
          }
          const root1 = this.computeRoot();
          const root2 = other.computeRoot();
          if (root1 !== root2) {
            throw new Error("You cannot combine paths which do not have the same root.");
          }
          const combinedPath = [];
          for (let h = 0; h < this.path.length; h++) {
            combinedPath.push([]);
            for (const leaf of this.path[h]) {
              combinedPath[h].push({ ...leaf });
            }
            for (const otherLeaf of other.path[h]) {
              const existingLeaf = combinedPath[h].find((leaf) => leaf.offset === otherLeaf.offset);
              if (existingLeaf === void 0) {
                combinedPath[h].push({ ...otherLeaf });
              } else if (otherLeaf?.txid !== void 0 && otherLeaf?.txid !== null) {
                existingLeaf.txid = true;
              }
            }
          }
          this.path = combinedPath;
          this.trim();
        }
        /**
         * Remove all internal nodes that are not required by level zero txid nodes.
         * Assumes that at least all required nodes are present.
         * Leaves all levels sorted by increasing offset.
         */
        trim() {
          const pushIfNew = (v, a) => {
            if (a.length === 0 || a.at(-1) !== v) {
              a.push(v);
            }
          };
          const dropOffsetsFromLevel = (dropOffsets2, level) => {
            for (let i = dropOffsets2.length; i >= 0; i--) {
              const l = this.path[level].findIndex((n) => n.offset === dropOffsets2[i]);
              if (l >= 0) {
                this.path[level].splice(l, 1);
              }
            }
          };
          const nextComputedOffsets = (cos) => {
            const ncos = [];
            for (const o of cos) {
              pushIfNew(offsetAtHeight(o, 1), ncos);
            }
            return ncos;
          };
          let computedOffsets = [];
          let dropOffsets = [];
          for (const level of this.path) {
            level.sort((a, b) => a.offset - b.offset);
          }
          for (let l = 0; l < this.path[0].length; l++) {
            const n = this.path[0][l];
            if (n.txid === true) {
              pushIfNew(offsetAtHeight(n.offset, 1), computedOffsets);
            } else {
              const isOdd = n.offset % 2 === 1;
              const peer = this.path[0][l + (isOdd ? -1 : 1)];
              if (peer.txid === void 0 || peer.txid === null || !peer.txid) {
                pushIfNew(peer.offset, dropOffsets);
              }
            }
          }
          dropOffsetsFromLevel(dropOffsets, 0);
          for (let h = 1; h < this.path.length; h++) {
            dropOffsets = computedOffsets;
            computedOffsets = nextComputedOffsets(computedOffsets);
            dropOffsetsFromLevel(dropOffsets, h);
          }
        }
        /**
         * Cached leaf finder for extract(). Uses Map-based indexes for O(1) lookups
         * and caches computed intermediate hashes to avoid redundant work.
         */
        cachedFindLeaf(height, offset, sourceIndex, hashCache, maxOffset) {
          const key = `${height}:${offset}`;
          if (hashCache.has(key))
            return hashCache.get(key);
          let leaf = height < sourceIndex.length ? sourceIndex[height].get(offset) : void 0;
          if (leaf != null) {
            hashCache.set(key, leaf);
            return leaf;
          }
          if (height === 0) {
            hashCache.set(key, void 0);
            return void 0;
          }
          const h = height - 1;
          const l = offset * 2;
          if (!Number.isSafeInteger(l))
            return void 0;
          const leaf0 = this.cachedFindLeaf(h, l, sourceIndex, hashCache, maxOffset);
          if (leaf0?.hash == null || leaf0.hash === "") {
            hashCache.set(key, void 0);
            return void 0;
          }
          const leaf1 = this.cachedFindLeaf(h, l + 1, sourceIndex, hashCache, maxOffset);
          if (leaf1?.hash == null) {
            if (leaf1?.duplicate === true || this.path.length === 1 && l === offsetAtHeight(maxOffset, h)) {
              leaf = { offset, hash: hashPair(leaf0.hash, leaf0.hash) };
              hashCache.set(key, leaf);
              return leaf;
            }
            hashCache.set(key, void 0);
            return void 0;
          }
          const workinghash = leaf1.duplicate === true ? hashPair(leaf0.hash, leaf0.hash) : hashPair(leaf1.hash, leaf0.hash);
          leaf = { offset, hash: workinghash };
          hashCache.set(key, leaf);
          return leaf;
        }
        /**
         * Extracts a minimal compound MerklePath covering only the specified transaction IDs.
         *
         * Given a compound MerklePath (e.g. all block txids at level 0, or a trimmed
         * compound path), this method reconstructs the sibling hashes at each tree level
         * for every requested txid using cached Map-indexed lookups, then assembles them
         * into a single trimmed compound path.
         *
         * The extracted path is verified to compute the same Merkle root as the source.
         *
         * @param {string[]} txids - Transaction IDs to extract proofs for.
         * @returns {MerklePath} - A new trimmed compound MerklePath covering only the requested txids.
         * @throws {Error} - If no txids are provided, a txid is not found, or the roots do not match.
         *
         * @example
         * // Full block compound path (all txids at level 0)
         * const fullBlock = new MerklePath(height, [allTxidsAtLevel0])
         * // Extract a smaller compound proof covering just two transactions
         * const twoTxProof = fullBlock.extract([txid1, txid2])
         * twoTxProof.computeRoot(txid1) // === fullBlock.computeRoot()
         */
        extract(txids) {
          if (txids.length === 0) {
            throw new Error("At least one txid must be provided to extract");
          }
          const originalRoot = this.computeRoot();
          const maxOffset = this.path[0].reduce((max, l) => Math.max(max, l.offset), 0);
          const treeHeight = Math.max(this.path.length, offsetTreeHeight(maxOffset));
          const sourceIndex = this.createSourceLeafIndex();
          const hashCache = /* @__PURE__ */ new Map();
          const txidToOffset = this.createTxidToOffsetIndex();
          const neededPerLevel = this.createNeededLeafLevels(treeHeight);
          for (const txid2 of txids) {
            this.collectExtractedLeaves(txid2, txidToOffset, neededPerLevel, sourceIndex, hashCache, maxOffset, treeHeight);
          }
          const compound = new _MerklePath(this.blockHeight, this.buildExtractedPath(neededPerLevel));
          compound.trim();
          const extractedRoot = compound.computeRoot();
          if (extractedRoot !== originalRoot) {
            throw new Error(`Extracted path root ${extractedRoot} does not match original root ${originalRoot}`);
          }
          return compound;
        }
        createSourceLeafIndex() {
          const sourceIndex = Array.from({ length: this.path.length });
          for (let h = 0; h < this.path.length; h++) {
            const map = /* @__PURE__ */ new Map();
            for (const leaf of this.path[h])
              map.set(leaf.offset, leaf);
            sourceIndex[h] = map;
          }
          return sourceIndex;
        }
        createTxidToOffsetIndex() {
          const txidToOffset = /* @__PURE__ */ new Map();
          for (const leaf of this.path[0]) {
            if (leaf.hash != null)
              txidToOffset.set(leaf.hash, leaf.offset);
          }
          return txidToOffset;
        }
        createNeededLeafLevels(treeHeight) {
          const neededPerLevel = Array.from({ length: treeHeight });
          for (let h = 0; h < treeHeight; h++)
            neededPerLevel[h] = /* @__PURE__ */ new Map();
          return neededPerLevel;
        }
        collectExtractedLeaves(txid2, txidToOffset, neededPerLevel, sourceIndex, hashCache, maxOffset, treeHeight) {
          const txOffset = txidToOffset.get(txid2);
          if (txOffset === void 0) {
            throw new Error(`Transaction ID ${txid2} not found in the Merkle Path`);
          }
          neededPerLevel[0].set(txOffset, { offset: txOffset, txid: true, hash: txid2 });
          const levelZeroSiblingOffset = siblingOf(txOffset);
          if (!neededPerLevel[0].has(levelZeroSiblingOffset)) {
            const sibling = this.cachedFindLeaf(0, levelZeroSiblingOffset, sourceIndex, hashCache, maxOffset);
            if (sibling != null)
              neededPerLevel[0].set(levelZeroSiblingOffset, sibling);
          }
          for (let h = 1; h < treeHeight; h++) {
            const siblingOffset = siblingOf(offsetAtHeight(txOffset, h));
            if (neededPerLevel[h].has(siblingOffset))
              continue;
            const sibling = this.cachedFindLeaf(h, siblingOffset, sourceIndex, hashCache, maxOffset);
            if (sibling != null) {
              neededPerLevel[h].set(siblingOffset, sibling);
            } else if (sameNodeAtHeight(txOffset, maxOffset, h)) {
              neededPerLevel[h].set(siblingOffset, { offset: siblingOffset, duplicate: true });
            }
          }
        }
        buildExtractedPath(neededPerLevel) {
          return neededPerLevel.map((level) => {
            return Array.from(level.values()).sort((a, b) => a.offset - b.offset);
          });
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ArcConfigValidation.js
  function plainOwnDataProperties(value, label, maximumProperties) {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    const prototype = Object.getPrototypeOf(value);
    const properties = Object.getOwnPropertyDescriptors(value);
    if (prototype !== Object.prototype && prototype !== null || Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > maximumProperties || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    return properties;
  }
  function optionalHeaderText(value, label, maximumBytes) {
    if (value === void 0)
      return void 0;
    if (typeof value !== "string" || utf8ByteLength(value) > maximumBytes || hasControlCharacter(value)) {
      throw new TypeError(`${label} must be bounded text without control characters.`);
    }
    return value;
  }
  function snapshotHeaders(value) {
    if (value === void 0)
      return void 0;
    const properties = plainOwnDataProperties(value, "ARC headers", MAX_CUSTOM_HEADERS);
    const headers = /* @__PURE__ */ Object.create(null);
    for (const [name, property] of Object.entries(properties)) {
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]{1,128}$/.test(name)) {
        throw new TypeError(`ARC header name is invalid: ${name}`);
      }
      const headerValue = optionalHeaderText(property.value, `ARC header ${name}`, 8192);
      if (headerValue === void 0) {
        throw new TypeError(`ARC header ${name} must be a string.`);
      }
      headers[name] = headerValue;
    }
    return Object.freeze(headers);
  }
  function validateHttpClient(value) {
    const client = value ?? defaultHttpClient();
    if (client == null || typeof client !== "object" || typeof client.request !== "function") {
      throw new TypeError("ARC httpClient must provide request().");
    }
    return client;
  }
  function normalizeArcConfig(config, defaultDeploymentId2) {
    if (typeof config === "string") {
      return Object.freeze({
        apiKey: optionalHeaderText(config, "ARC API key", 16 * 1024),
        httpClient: defaultHttpClient(),
        deploymentId: defaultDeploymentId2()
      });
    }
    const properties = plainOwnDataProperties(config ?? {}, "ARC config", MAX_CONFIGURATION_PROPERTIES);
    const read = (name) => properties[name]?.value;
    return Object.freeze({
      apiKey: optionalHeaderText(read("apiKey"), "ARC API key", 16 * 1024),
      httpClient: validateHttpClient(read("httpClient")),
      deploymentId: optionalHeaderText(read("deploymentId"), "ARC deployment ID", 256) ?? defaultDeploymentId2(),
      callbackUrl: optionalHeaderText(read("callbackUrl"), "ARC callback URL", 2048),
      callbackToken: optionalHeaderText(read("callbackToken"), "ARC callback token", 16 * 1024),
      headers: snapshotHeaders(read("headers"))
    });
  }
  function normalizeArcUrl(value) {
    if (typeof value !== "string" || value.length === 0 || utf8ByteLength(value) > 2048 || hasControlCharacter(value)) {
      throw new TypeError("ARC URL must be nonempty bounded text without control characters.");
    }
    return value;
  }
  var MAX_CONFIGURATION_PROPERTIES, MAX_CUSTOM_HEADERS;
  var init_ArcConfigValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ArcConfigValidation.js"() {
      init_DefaultHttpClient();
      init_UTF8();
      MAX_CONFIGURATION_PROPERTIES = 32;
      MAX_CUSTOM_HEADERS = 64;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/ConfigurationLock.js
  function lockConfiguration(target, names) {
    for (const name of names) {
      if (!Object.prototype.hasOwnProperty.call(target, name)) {
        throw new Error(`Cannot lock missing configuration property ${name}.`);
      }
      Object.defineProperty(target, name, {
        configurable: false,
        writable: false
      });
    }
  }
  var init_ConfigurationLock = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/ConfigurationLock.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ARC.js
  function defaultDeploymentId() {
    return `ts-sdk-${toHex(Random_default(16))}`;
  }
  function boundedText(value, maximumBytes, allowEmpty = true) {
    return typeof value === "string" && (allowEmpty || value.length !== 0) && utf8ByteLength(value) <= maximumBytes && !hasControlCharacter(value);
  }
  function ownArcData(value) {
    if (value == null || typeof value !== "object" || Array.isArray(value))
      return void 0;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
      return void 0;
    const properties = Object.getOwnPropertyDescriptors(value);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > MAX_ARC_RESPONSE_PROPERTIES || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    return properties;
  }
  function snapshotCompetingTxs(value) {
    if (value === void 0)
      return void 0;
    if (!Array.isArray(value) || value.length > MAX_COMPETING_TXS2)
      return void 0;
    const properties = Object.getOwnPropertyDescriptors(value);
    const expectedKeys = /* @__PURE__ */ new Set([
      "length",
      ...Array.from({ length: value.length }, (_, index) => String(index))
    ]);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length !== expectedKeys.size || Object.keys(properties).some((key) => !expectedKeys.has(key)) || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (let index = 0; index < value.length; index++) {
      const candidate = properties[index]?.value;
      if (typeof candidate !== "string" || !TXID2.test(candidate))
        return void 0;
      const normalized = candidate.toLowerCase();
      if (seen.has(normalized))
        return void 0;
      seen.add(normalized);
      result.push(normalized);
    }
    return result;
  }
  function transactionHex(tx) {
    try {
      return tx.toHexEF();
    } catch (error) {
      if (error.message === "All inputs must have source transactions when serializing to EF format")
        return tx.toHex();
      throw error;
    }
  }
  function invalidArcResponse(description) {
    return { status: "error", code: "ERR_INVALID_RESPONSE", description };
  }
  function successfulArcResponse(data, expectedTxid) {
    const properties = ownArcData(data);
    if (properties === void 0) {
      return invalidArcResponse("ARC returned a malformed response.");
    }
    const read = (name) => properties[name]?.value;
    const txid2 = read("txid");
    const extraInfo = read("extraInfo");
    const txStatus = read("txStatus");
    const competingValue = read("competingTxs");
    if (!boundedText(txStatus, MAX_ARC_STATUS_BYTES, false) || extraInfo !== void 0 && !boundedText(extraInfo, MAX_ARC_INFO_BYTES)) {
      return invalidArcResponse("ARC returned invalid transaction status metadata.");
    }
    const competingTxs = snapshotCompetingTxs(competingValue);
    if (competingValue !== void 0 && competingTxs === void 0) {
      return invalidArcResponse("ARC returned invalid competing transaction identifiers.");
    }
    const upperStatus = txStatus.toUpperCase();
    const isOrphan = extraInfo?.toUpperCase().includes("ORPHAN") || upperStatus.includes("ORPHAN");
    if (ARC_ERROR_STATUSES.has(upperStatus) || isOrphan) {
      if (typeof txid2 === "string" && TXID2.test(txid2) && txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
        return {
          status: "error",
          code: "ERR_TXID_MISMATCH",
          description: "ARC returned a failure for another transaction."
        };
      }
      const failure = {
        status: "error",
        code: txStatus,
        description: `${txStatus} ${extraInfo ?? ""}`.trim()
      };
      if (typeof txid2 === "string" && TXID2.test(txid2))
        failure.txid = expectedTxid.toLowerCase();
      if (competingTxs != null)
        failure.more = { competingTxs };
      return failure;
    }
    if (!ARC_ACCEPTED_STATUSES.has(upperStatus)) {
      return invalidArcResponse("ARC returned an unknown transaction status.");
    }
    if (typeof txid2 !== "string" || !TXID2.test(txid2) || txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
      return {
        status: "error",
        code: "ERR_TXID_MISMATCH",
        description: "ARC acknowledged a transaction other than the submitted transaction."
      };
    }
    const response = {
      status: "success",
      txid: expectedTxid,
      message: `${txStatus} ${extraInfo ?? ""}`.trim()
    };
    if (competingTxs != null)
      response.competingTxs = competingTxs;
    return response;
  }
  function parseArcFailureData(data) {
    if (typeof data !== "string")
      return data;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  function failedArcResponse(status, responseData, expectedTxid) {
    const code = typeof status === "number" && Number.isSafeInteger(status) || typeof status === "string" && boundedText(status, MAX_ARC_STATUS_BYTES, false) ? status.toString() : "ERR_UNKNOWN";
    const failure = {
      status: "error",
      code,
      description: "Unknown error"
    };
    const data = parseArcFailureData(responseData);
    const properties = ownArcData(data);
    if (properties === void 0)
      return failure;
    const detail = properties.detail?.value;
    const txid2 = properties.txid?.value;
    if (typeof txid2 === "string" && TXID2.test(txid2)) {
      if (expectedTxid !== void 0 && txid2.toLowerCase() !== expectedTxid.toLowerCase()) {
        return {
          status: "error",
          code: "ERR_TXID_MISMATCH",
          description: "ARC returned a failure for another transaction."
        };
      }
      failure.txid = txid2.toLowerCase();
    }
    const more = {};
    if (boundedText(detail, MAX_ARC_INFO_BYTES)) {
      failure.description = detail;
      more.detail = detail;
    }
    if (failure.txid !== void 0)
      more.txid = failure.txid;
    if (Object.keys(more).length !== 0)
      failure.more = more;
    return failure;
  }
  function caughtArcResponse() {
    return {
      status: "error",
      code: "500",
      description: "Internal Server Error"
    };
  }
  var ARC_ERROR_STATUSES, TXID2, MAX_ARC_STATUS_BYTES, MAX_ARC_INFO_BYTES, MAX_COMPETING_TXS2, MAX_ARC_RESPONSE_PROPERTIES, ARC_ACCEPTED_STATUSES, ARC;
  var init_ARC = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/ARC.js"() {
      init_Random();
      init_utils();
      init_ArcConfigValidation();
      init_UTF8();
      init_ConfigurationLock();
      ARC_ERROR_STATUSES = /* @__PURE__ */ new Set([
        "DOUBLE_SPEND_ATTEMPTED",
        "REJECTED",
        "INVALID",
        "MALFORMED",
        "MINED_IN_STALE_BLOCK"
      ]);
      TXID2 = /^[0-9a-f]{64}$/i;
      MAX_ARC_STATUS_BYTES = 128;
      MAX_ARC_INFO_BYTES = 8192;
      MAX_COMPETING_TXS2 = 256;
      MAX_ARC_RESPONSE_PROPERTIES = 32;
      ARC_ACCEPTED_STATUSES = /* @__PURE__ */ new Set([
        "SUCCESS",
        "RECEIVED",
        "SENT_TO_NETWORK",
        "ANNOUNCED_TO_NETWORK",
        "ACCEPTED_BY_NETWORK",
        "SEEN_ON_NETWORK",
        "STORED",
        "MINED",
        "IMMUTABLE"
      ]);
      ARC = class {
        URL;
        apiKey;
        deploymentId;
        callbackUrl;
        callbackToken;
        headers;
        #httpClient;
        constructor(URL2, config) {
          this.URL = normalizeArcUrl(URL2);
          const normalized = normalizeArcConfig(config, defaultDeploymentId);
          this.apiKey = normalized.apiKey;
          this.#httpClient = normalized.httpClient;
          this.deploymentId = normalized.deploymentId;
          this.callbackToken = normalized.callbackToken;
          this.callbackUrl = normalized.callbackUrl;
          this.headers = normalized.headers;
          lockConfiguration(this, [
            "URL",
            "apiKey",
            "deploymentId",
            "callbackUrl",
            "callbackToken",
            "headers"
          ]);
        }
        /**
         * Constructs a dictionary of the default & supplied request headers.
         */
        #requestHeaders() {
          const headers = {
            "Content-Type": "application/json",
            "XDeployment-ID": this.deploymentId
          };
          if (this.apiKey != null && this.apiKey !== "") {
            headers.Authorization = `Bearer ${this.apiKey}`;
          }
          if (this.callbackUrl != null && this.callbackUrl !== "") {
            headers["X-CallbackUrl"] = this.callbackUrl;
          }
          if (this.callbackToken != null && this.callbackToken !== "") {
            headers["X-CallbackToken"] = this.callbackToken;
          }
          if (this.headers != null) {
            for (const [key, value] of Object.entries(this.headers)) {
              headers[key] = value;
            }
          }
          return headers;
        }
        /**
         * Broadcasts a transaction via ARC.
         *
         * @param {Transaction} tx - The transaction to be broadcasted.
         * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
         */
        async broadcast(tx) {
          const requestOptions = {
            method: "POST",
            headers: this.#requestHeaders(),
            data: { rawTx: transactionHex(tx) }
          };
          try {
            const response = await this.#httpClient.request(`${this.URL}/v1/tx`, requestOptions);
            return response.ok ? successfulArcResponse(response.data, tx.id("hex")) : failedArcResponse(response.status, response.data, tx.id("hex"));
          } catch {
            return caughtArcResponse();
          }
        }
        /**
         * Broadcasts multiple transactions via ARC.
         * Handles mixed responses where some transactions succeed and others fail.
         *
         * @param {Transaction[]} txs - Array of transactions to be broadcasted.
         * @returns {Promise<Array<object>>} A promise that resolves to an array of objects.
         */
        async broadcastMany(txs) {
          const rawTxs = txs.map((tx) => ({ rawTx: transactionHex(tx) }));
          const requestOptions = {
            method: "POST",
            headers: this.#requestHeaders(),
            data: rawTxs
          };
          try {
            const response = await this.#httpClient.request(`${this.URL}/v1/txs`, requestOptions);
            if (!response.ok) {
              return txs.map((tx) => failedArcResponse(response.status, response.data, tx.id("hex")));
            }
            if (!Array.isArray(response.data) || response.data.length !== txs.length) {
              return txs.map(() => invalidArcResponse("ARC returned a malformed batch response."));
            }
            const responseProperties = Object.getOwnPropertyDescriptors(response.data);
            const expectedArrayKeys = /* @__PURE__ */ new Set([
              "length",
              ...Array.from({ length: response.data.length }, (_, index) => String(index))
            ]);
            if (Object.getOwnPropertySymbols(response.data).length !== 0 || Object.keys(responseProperties).length !== expectedArrayKeys.size || Object.keys(responseProperties).some((key) => !expectedArrayKeys.has(key)) || Object.values(responseProperties).some((property) => property.get != null || property.set != null)) {
              return txs.map(() => invalidArcResponse("ARC returned a malformed batch response."));
            }
            const remaining = /* @__PURE__ */ new Map();
            for (const tx of txs) {
              const txid2 = tx.id("hex").toLowerCase();
              remaining.set(txid2, (remaining.get(txid2) ?? 0) + 1);
            }
            return Array.from({ length: response.data.length }, (_, index) => {
              const result = responseProperties[index]?.value;
              const resultProperties = ownArcData(result);
              if (resultProperties === void 0) {
                return invalidArcResponse("ARC returned a malformed batch result.");
              }
              const txid2 = resultProperties.txid?.value;
              const normalized = typeof txid2 === "string" && TXID2.test(txid2) ? txid2.toLowerCase() : "";
              const available = remaining.get(normalized) ?? 0;
              if (available < 1) {
                return {
                  status: "error",
                  code: "ERR_TXID_MISMATCH",
                  description: "ARC batch acknowledged a transaction that was not submitted."
                };
              }
              if (available === 1)
                remaining.delete(normalized);
              else
                remaining.set(normalized, available - 1);
              return successfulArcResponse(result, normalized);
            });
          } catch {
            const errorResponse = caughtArcResponse();
            return txs.map(() => errorResponse);
          }
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/DefaultBroadcaster.js
  function defaultBroadcaster(isTestnet = false, config = {}) {
    return new ARC(isTestnet ? "https://testnet.arc.gorillapool.io" : "https://arc.gorillapool.io", config);
  }
  var init_DefaultBroadcaster = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/DefaultBroadcaster.js"() {
      init_ARC();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/WhatsOnChain.js
  function boundedText2(value, label, maximumBytes) {
    if (typeof value !== "string" || utf8ByteLength(value) > maximumBytes || hasControlCharacter(value)) {
      throw new TypeError(`${label} must be bounded text without control characters.`);
    }
    return value;
  }
  function ownDataProperties(value, label, maximumProperties) {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    const prototype = Object.getPrototypeOf(value);
    const properties = Object.getOwnPropertyDescriptors(value);
    if (prototype !== Object.prototype && prototype !== null || Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(properties).length > maximumProperties || Object.values(properties).some((property) => property.get != null || property.set != null)) {
      throw new TypeError(`${label} must be an accessor-free plain data object.`);
    }
    return properties;
  }
  function normalizeNetwork(value) {
    if (value !== "main" && value !== "test" && value !== "stn") {
      throw new TypeError("What's On Chain network must be 'main', 'test', or 'stn'.");
    }
    return value;
  }
  function normalizeHttpClient(value) {
    const client = value ?? defaultHttpClient();
    if (client == null || typeof client !== "object" || typeof client.request !== "function") {
      throw new TypeError("What's On Chain httpClient must provide request().");
    }
    return client;
  }
  function normalizeConfig(config) {
    const properties = ownDataProperties(config, "What's On Chain config", 8);
    return {
      apiKey: properties.apiKey?.value === void 0 ? "" : boundedText2(properties.apiKey.value, "What's On Chain API key", 16 * 1024),
      httpClient: normalizeHttpClient(properties.httpClient?.value)
    };
  }
  function normalizeQuery(root, height) {
    if (typeof root !== "string" || !HASH.test(root)) {
      throw new TypeError("Merkle root must be a 64-character hexadecimal string.");
    }
    if (!Number.isSafeInteger(height) || height < 0 || height > MAX_BLOCK_HEIGHT) {
      throw new TypeError("Block height must be a nonnegative bounded integer.");
    }
    return { root: root.toLowerCase(), height };
  }
  function responseMerkleRoot(value) {
    try {
      const properties = ownDataProperties(value, "What's On Chain block header", MAX_HEADER_PROPERTIES);
      const root = properties.merkleroot?.value;
      return typeof root === "string" && HASH.test(root) ? root.toLowerCase() : void 0;
    } catch {
      return void 0;
    }
  }
  function responseCurrentHeight(value) {
    if (!Array.isArray(value) || value.length === 0 || value.length > MAX_HEADER_RESULTS)
      return void 0;
    const arrayProperties = Object.getOwnPropertyDescriptors(value);
    const expectedKeys = /* @__PURE__ */ new Set([
      "length",
      ...Array.from({ length: value.length }, (_, index) => String(index))
    ]);
    if (Object.getOwnPropertySymbols(value).length !== 0 || Object.keys(arrayProperties).length !== expectedKeys.size || Object.keys(arrayProperties).some((key) => !expectedKeys.has(key)) || Object.values(arrayProperties).some((property) => property.get != null || property.set != null)) {
      return void 0;
    }
    try {
      const first = ownDataProperties(arrayProperties[0]?.value, "What's On Chain height response", MAX_HEADER_PROPERTIES);
      const height = first.height?.value;
      return Number.isSafeInteger(height) && height >= 0 && height <= MAX_BLOCK_HEIGHT ? height : void 0;
    } catch {
      return void 0;
    }
  }
  var HASH, MAX_BLOCK_HEIGHT, MAX_HEADER_RESULTS, MAX_HEADER_PROPERTIES, WhatsOnChain;
  var init_WhatsOnChain = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/WhatsOnChain.js"() {
      init_DefaultHttpClient();
      init_UTF8();
      init_ConfigurationLock();
      HASH = /^[0-9a-f]{64}$/i;
      MAX_BLOCK_HEIGHT = 2147483647;
      MAX_HEADER_RESULTS = 256;
      MAX_HEADER_PROPERTIES = 64;
      WhatsOnChain = class {
        network;
        apiKey;
        URL;
        httpClient;
        /**
         * Constructs an instance of the WhatsOnChain ChainTracker.
         *
         * @param {'main' | 'test' | 'stn'} network - The BSV network to use when calling the WhatsOnChain API.
         * @param {WhatsOnChainConfig} config - Configuration options for the WhatsOnChain ChainTracker.
         */
        constructor(network = "main", config = {}) {
          this.network = normalizeNetwork(network);
          this.URL = `https://api.whatsonchain.com/v1/bsv/${this.network}`;
          const normalized = normalizeConfig(config);
          this.httpClient = normalized.httpClient;
          this.apiKey = normalized.apiKey;
          lockConfiguration(this, ["network", "URL", "httpClient", "apiKey"]);
        }
        async isValidRootForHeight(root, height) {
          const query = normalizeQuery(root, height);
          const requestOptions = {
            method: "GET",
            headers: this.getHttpHeaders()
          };
          try {
            const response = await this.httpClient.request(`${this.URL}/block/${query.height}/header`, requestOptions);
            if (response.ok) {
              return responseMerkleRoot(response.data) === query.root;
            } else if (response.status === 404) {
              return false;
            }
            throw new Error("provider request failed");
          } catch {
            throw new Error(`Failed to verify merkleroot for height ${query.height}.`);
          }
        }
        async currentHeight() {
          try {
            const requestOptions = {
              method: "GET",
              headers: this.getHttpHeaders()
            };
            const response = await this.httpClient.request(`${this.URL}/block/headers`, requestOptions);
            if (response.ok) {
              const height = responseCurrentHeight(response.data);
              if (height !== void 0)
                return height;
            }
            throw new Error("provider response was invalid");
          } catch {
            throw new Error("Failed to get current height from What's On Chain.");
          }
        }
        getHttpHeaders() {
          const headers = {
            Accept: "application/json"
          };
          if (typeof this.apiKey === "string" && this.apiKey.trim() !== "") {
            headers.Authorization = this.apiKey;
          }
          return headers;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/DefaultChainTracker.js
  function defaultChainTracker() {
    return new WhatsOnChain();
  }
  var init_DefaultChainTracker = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/DefaultChainTracker.js"() {
      init_WhatsOnChain();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/BeefConstants.js
  var BEEF_V1, BEEF_V2, ATOMIC_BEEF, TX_DATA_FORMAT;
  var init_BeefConstants = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/BeefConstants.js"() {
      BEEF_V1 = 4022206465;
      BEEF_V2 = 4022206466;
      ATOMIC_BEEF = 16843009;
      (function(TX_DATA_FORMAT2) {
        TX_DATA_FORMAT2[TX_DATA_FORMAT2["RAWTX"] = 0] = "RAWTX";
        TX_DATA_FORMAT2[TX_DATA_FORMAT2["RAWTX_AND_BUMP_INDEX"] = 1] = "RAWTX_AND_BUMP_INDEX";
        TX_DATA_FORMAT2[TX_DATA_FORMAT2["TXID_ONLY"] = 2] = "TXID_ONLY";
      })(TX_DATA_FORMAT || (TX_DATA_FORMAT = {}));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/BeefTx.js
  function skipBytes(br, length) {
    if (!Number.isSafeInteger(length) || length < 0 || br.pos + length > br.bin.length) {
      throw new RangeError("Serialized transaction exceeds available BEEF data");
    }
    if (br instanceof ReaderUint8Array)
      br.skip(length);
    else
      br.read(length);
  }
  function scanRawTransaction(br) {
    const start = br.pos;
    skipBytes(br, 4);
    const inputCount = br.readVarIntNumStrict(false);
    const inputTxids = /* @__PURE__ */ new Set();
    for (let i = 0; i < inputCount; i++) {
      inputTxids.add(toHex(br.readReverse(32)));
      skipBytes(br, 4);
      const scriptLength = br.readVarIntNumStrict(false);
      skipBytes(br, scriptLength + 4);
    }
    const outputCount = br.readVarIntNumStrict(false);
    for (let i = 0; i < outputCount; i++) {
      skipBytes(br, 8);
      const scriptLength = br.readVarIntNumStrict(false);
      skipBytes(br, scriptLength);
    }
    skipBytes(br, 4);
    const rawTx = br instanceof ReaderUint8Array ? br.bin.subarray(start, br.pos) : Uint8Array.from(br.bin.slice(start, br.pos));
    return { rawTx, inputTxids: Array.from(inputTxids) };
  }
  function scanInputTxids(rawTx) {
    return scanRawTransaction(new ReaderUint8Array(rawTx)).inputTxids;
  }
  function sameTxids(a, b) {
    if (a.length !== b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i])
        return false;
    }
    return true;
  }
  var BeefTx;
  var init_BeefTx = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/BeefTx.js"() {
      init_Hash();
      init_utils();
      init_Transaction();
      init_BeefConstants();
      BeefTx = class _BeefTx {
        _bumpIndex;
        _tx;
        _rawTx;
        _txid;
        inputTxids = [];
        /**
         * true if `hasProof` or all inputs chain to `hasProof`.
         *
         * Typically set by sorting transactions by proven dependency chains.
         */
        isValid = void 0;
        get bumpIndex() {
          return this._bumpIndex;
        }
        set bumpIndex(v) {
          this._bumpIndex = v;
          this.updateInputTxids();
        }
        get hasProof() {
          return this._bumpIndex !== void 0;
        }
        get isTxidOnly() {
          return this._txid !== void 0 && this._txid !== null && this._rawTx == null && this._tx == null;
        }
        get txid() {
          if (this._txid !== void 0 && this._txid !== null && this._txid !== "")
            return this._txid;
          if (this._tx != null) {
            this._txid = this._tx.id("hex");
            return this._txid;
          }
          if (this._rawTx != null) {
            this._txid = toHex(hash256(this._rawTx).reverse());
            return this._txid;
          }
          throw new Error("Internal");
        }
        get tx() {
          if (this._tx != null)
            return this._tx;
          if (this._rawTx != null) {
            this._tx = Transaction.fromBinaryView(this._rawTx);
            if (this._txid != null)
              cacheKnownTransactionId(this._tx, this._txid);
            return this._tx;
          }
          return void 0;
        }
        /**
         * Raw transaction bytes, if available as number[]
         */
        get rawTx() {
          const bytes3 = this.rawTxUint8Array;
          return bytes3 == null ? void 0 : Array.from(bytes3);
        }
        /**
         * Raw transaction bytes, if available as Uint8Array
         */
        get rawTxUint8Array() {
          const bytes3 = this.getRawTxBytes();
          return bytes3 == null ? void 0 : Uint8Array.from(bytes3);
        }
        getRawTxBytes() {
          if (this._tx != null) {
            if (this._rawTx == null)
              this._rawTx = this._tx.toUint8Array();
            else
              this.syncRawTxFromTransaction();
            return this._rawTx;
          }
          return this._rawTx;
        }
        /**
         * Synchronizes a nested transaction after mutation through the normal
         * Transaction APIs. Returns true when its serialized identity or dependencies
         * changed.
         *
         * @internal
         */
        syncRawTxFromTransaction() {
          if (this._tx == null)
            return false;
          const bytes3 = transactionSerializationIdentity(this._tx);
          if (this._rawTx != null) {
            if (bytes3 === this._rawTx)
              return false;
            this._rawTx = bytes3;
            this._txid = this._tx.id("hex");
            this.updateInputTxids();
            return true;
          }
          const txid2 = this._tx.id("hex");
          const txidChanged = this._txid != null && this._txid !== txid2;
          const previousInputTxids = this.inputTxids;
          this._txid = txid2;
          this.updateInputTxids();
          return txidChanged || !sameTxids(previousInputTxids, this.inputTxids);
        }
        /**
         * @param tx If string, must be a valid txid. If `number[]` must be a valid serialized transaction.
         * @param bumpIndex If transaction already has a proof in the beef to which it will be added.
         */
        constructor(tx, bumpIndex, inputTxids, retainRawView = false) {
          if (typeof tx === "string") {
            this._txid = tx;
          } else if (tx instanceof Uint8Array) {
            this._rawTx = retainRawView ? tx : Uint8Array.from(tx);
          } else if (Array.isArray(tx)) {
            this._rawTx = new Uint8Array(tx);
          } else if (tx instanceof Transaction) {
            this._tx = tx;
          } else {
            throw new TypeError("Invalid transaction data type");
          }
          this._bumpIndex = bumpIndex;
          if (this.hasProof)
            this.inputTxids = [];
          else if (inputTxids != null)
            this.inputTxids = Array.from(inputTxids);
          else
            this.updateInputTxids();
        }
        static fromTx(tx, bumpIndex) {
          return new _BeefTx(tx, bumpIndex);
        }
        static fromRawTx(rawTx, bumpIndex) {
          return new _BeefTx(rawTx, bumpIndex);
        }
        static fromTxid(txid2, bumpIndex) {
          return new _BeefTx(txid2, bumpIndex);
        }
        updateInputTxids() {
          if (this.hasProof) {
            this.inputTxids = [];
          } else if (this._tx != null) {
            const inputTxids = /* @__PURE__ */ new Set();
            for (const input of this._tx.inputs) {
              if (input.sourceTXID !== void 0 && input.sourceTXID !== null && input.sourceTXID !== "") {
                inputTxids.add(input.sourceTXID);
              }
            }
            this.inputTxids = Array.from(inputTxids);
          } else if (this._rawTx != null) {
            this.inputTxids = scanInputTxids(this._rawTx);
          } else {
            this.inputTxids = [];
          }
        }
        toWriter(writer, version) {
          const writeByte = (bb) => {
            writer.writeUInt8(bb);
          };
          const writeTxid = () => {
            if (this._txid == null) {
              throw new Error("Transaction ID (_txid) is undefined");
            }
            writer.writeReverse(toArray2(this._txid, "hex"));
          };
          const writeTx = () => {
            const bytes3 = this.getRawTxBytes();
            if (bytes3 == null) {
              throw new Error("a valid serialized Transaction is expected");
            }
            writer.write(bytes3);
          };
          const writeBumpIndex = () => {
            if (this.bumpIndex === void 0) {
              writeByte(TX_DATA_FORMAT.RAWTX);
            } else {
              writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX);
              writer.writeVarIntNum(this.bumpIndex);
            }
          };
          if (version === BEEF_V2) {
            if (this.isTxidOnly) {
              writeByte(TX_DATA_FORMAT.TXID_ONLY);
              writeTxid();
            } else if (this.bumpIndex !== void 0) {
              writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX);
              writer.writeVarIntNum(this.bumpIndex);
              writeTx();
            } else {
              writeByte(TX_DATA_FORMAT.RAWTX);
              writeTx();
            }
          } else {
            writeTx();
            writeBumpIndex();
          }
        }
        static fromReader(br, version) {
          let bumpIndex;
          let beefTx;
          if (version === BEEF_V2) {
            const format = br.readUInt8();
            if (format === TX_DATA_FORMAT.TXID_ONLY) {
              beefTx = _BeefTx.fromTxid(toHex(br.readReverse(32)));
            } else {
              if (format === TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX) {
                bumpIndex = br.readVarIntNumStrict(false);
              }
              const { rawTx, inputTxids } = scanRawTransaction(br);
              beefTx = new _BeefTx(rawTx, bumpIndex, inputTxids, true);
            }
          } else {
            const { rawTx, inputTxids } = scanRawTransaction(br);
            bumpIndex = br.readUInt8() === 0 ? void 0 : br.readVarIntNumStrict(false);
            beefTx = new _BeefTx(rawTx, bumpIndex, inputTxids, true);
          }
          return beefTx;
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Beef.js
  function mergeCompatibleBumpLevels(levels, other, expectedLevels, validateCombined) {
    if (other.path.length !== expectedLevels)
      throw new Error("Mismatched roots");
    for (let height = 0; height < expectedLevels; height++) {
      mergeCompatibleBumpLevel(levels[height], other.path[height], validateCombined);
    }
  }
  function mergeCompatibleBumpLevel(level, otherLeaves, validateCombined) {
    for (const otherLeaf of otherLeaves) {
      const existing = level.get(otherLeaf.offset);
      if (existing == null) {
        level.set(otherLeaf.offset, otherLeaf);
        continue;
      }
      mergeCompatibleBumpLeaf(existing, otherLeaf, validateCombined);
    }
  }
  function mergeCompatibleBumpLeaf(existing, other, validateCombined) {
    if (validateCombined && (existing.hash !== other.hash || existing.duplicate !== other.duplicate)) {
      throw new Error("Mismatched roots");
    }
    if (other.txid != null)
      existing.txid = true;
  }
  function indexBumpTxids(bump, index, byTxid) {
    for (const leaf of bump.path[0]) {
      if (typeof leaf.hash === "string")
        byTxid.set(leaf.hash, index);
    }
  }
  var Beef;
  var init_Beef = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/Beef.js"() {
      init_MerklePath();
      init_BeefTx();
      init_utils();
      init_Hash();
      init_BeefConstants();
      init_BeefConstants();
      Beef = class _Beef {
        bumps = [];
        txs = [];
        version = BEEF_V2;
        atomicTxid = void 0;
        #txidIndex = void 0;
        #txPositionIndex = void 0;
        #bumpIndexesByHeight = void 0;
        #bumpIndexByTxid = void 0;
        #rawBytesCache;
        #hexCache;
        #atomicBytesCache = /* @__PURE__ */ new Map();
        #atomicCacheTxs;
        #atomicCacheBumps;
        #atomicCacheVersion;
        #rawCacheVersion;
        #rawCacheTxs;
        #rawCacheBumps;
        #bumpState;
        #needsSort = true;
        #sortResultCache;
        #sortTxState;
        constructor(version = BEEF_V2) {
          this.version = version;
        }
        #invalidateSerializationCaches() {
          this.#rawBytesCache = void 0;
          this.#hexCache = void 0;
          this.#atomicBytesCache.clear();
          this.#atomicCacheTxs = void 0;
          this.#atomicCacheBumps = void 0;
          this.#atomicCacheVersion = void 0;
          this.#rawCacheVersion = void 0;
          this.#rawCacheTxs = void 0;
          this.#rawCacheBumps = void 0;
        }
        #captureSerializationState() {
          this.#rawCacheVersion = this.version;
          this.#rawCacheTxs = this.#captureTransactionState();
          this.#rawCacheBumps = Array.from(this.bumps);
          this.#captureBumpState();
        }
        #captureTransactionState() {
          return this.txs.map((ref) => ({
            ref,
            bumpIndex: ref._bumpIndex,
            rawTx: ref._rawTx,
            // Once raw bytes exist, lazily parsing or hashing them does not change
            // their serialized representation and must not evict the forwarding cache.
            tx: ref._rawTx == null ? ref._tx : void 0,
            txid: ref._rawTx == null && ref._tx == null ? ref._txid : void 0
          }));
        }
        #transactionStateMatches(cachedTxs) {
          if (cachedTxs?.length !== this.txs.length)
            return false;
          for (let i = 0; i < this.txs.length; i++) {
            const tx = this.txs[i];
            const cached = cachedTxs[i];
            if (cached.ref !== tx || cached.bumpIndex !== tx._bumpIndex || cached.rawTx !== tx._rawTx || cached.tx !== (tx._rawTx == null ? tx._tx : void 0) || cached.txid !== (tx._rawTx == null && tx._tx == null ? tx._txid : void 0))
              return false;
          }
          return true;
        }
        #captureBumpState() {
          this.#bumpState = this.bumps.map((ref) => ({
            ref,
            blockHeight: ref.blockHeight,
            levels: ref.path.map((level) => ({
              ref: level,
              leaves: level.map((leaf) => ({
                ref: leaf,
                offset: leaf.offset,
                hash: leaf.hash,
                txid: leaf.txid,
                duplicate: leaf.duplicate
              }))
            }))
          }));
        }
        #bumpLeafStateMatches(leaf, state) {
          return state.ref === leaf && state.offset === leaf.offset && state.hash === leaf.hash && state.txid === leaf.txid && state.duplicate === leaf.duplicate;
        }
        #bumpLevelStateMatches(level, state) {
          return state.ref === level && state.leaves.length === level.length && level.every((leaf, index) => this.#bumpLeafStateMatches(leaf, state.leaves[index]));
        }
        #singleBumpStateMatches(bump, state) {
          return state.ref === bump && state.blockHeight === bump.blockHeight && state.levels.length === bump.path.length && bump.path.every((level, index) => this.#bumpLevelStateMatches(level, state.levels[index]));
        }
        #bumpStateMatches() {
          if (this.#bumpState?.length !== this.bumps.length)
            return false;
          return this.bumps.every((bump, index) => this.#singleBumpStateMatches(bump, this.#bumpState[index]));
        }
        #synchronizeNestedBumpMutations() {
          if (this.#bumpState == null) {
            this.#captureBumpState();
            return;
          }
          if (!this.#bumpStateMatches()) {
            this.#invalidateSerializationCaches();
            this.#sortResultCache = void 0;
            this.#sortTxState = void 0;
            this.#needsSort = true;
            this.#invalidateBumpIndexes();
            this.#captureBumpState();
          }
        }
        #serializationCacheMatchesState() {
          if (this.#rawBytesCache == null || this.#rawCacheVersion !== this.version || !this.#transactionStateMatches(this.#rawCacheTxs) || this.#rawCacheBumps?.length !== this.bumps.length)
            return false;
          for (let i = 0; i < this.bumps.length; i++) {
            if (this.#rawCacheBumps[i] !== this.bumps[i])
              return false;
          }
          return true;
        }
        #markMutated(requiresSort = true) {
          this.#invalidateSerializationCaches();
          this.#sortResultCache = void 0;
          this.#sortTxState = void 0;
          if (requiresSort) {
            this.#needsSort = true;
          }
        }
        #ensureSerializableState() {
          for (const tx of this.txs) {
            tx.txid;
          }
        }
        synchronizeNestedTransactionMutations() {
          let changed = false;
          for (const tx of this.txs)
            changed = tx.syncRawTxFromTransaction() || changed;
          if (changed) {
            this.#invalidateSerializationCaches();
            this.#sortResultCache = void 0;
            this.#sortTxState = void 0;
            this.#needsSort = true;
            this.#rebuildTxIndexes();
          }
        }
        #ensureSortedForSerialization() {
          if (this.#needsSort) {
            this.sortTxs();
          }
        }
        #getSerializedBytes() {
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          if (this.#serializationCacheMatchesState() && this.#rawBytesCache != null)
            return this.#rawBytesCache;
          this.#invalidateSerializationCaches();
          this.#ensureSerializableState();
          this.#ensureSortedForSerialization();
          const writer = new WriterUint8Array();
          this.toWriter(writer);
          this.#rawBytesCache = writer.toUint8Array();
          this.#captureSerializationState();
          return this.#rawBytesCache;
        }
        #getBeefForAtomic(txid2) {
          const txidToTx = this.#ensureTxidIndex();
          const subject = txidToTx.get(txid2);
          if (subject == null) {
            throw new Error(`${txid2} does not exist in this Beef`);
          }
          const included = this.#collectAtomicTransactions(subject, txidToTx);
          const beef = this.#copySelectedTransactions(included);
          beef.sortTxs();
          return beef;
        }
        #getAtomicSerializedBytes(txid2) {
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          const cacheMatches = this.#atomicCacheVersion === this.version && this.#transactionStateMatches(this.#atomicCacheTxs) && this.#atomicCacheBumps?.length === this.bumps.length && this.bumps.every((bump, index) => this.#atomicCacheBumps?.[index] === bump);
          if (!cacheMatches)
            this.#atomicBytesCache.clear();
          const cached = this.#atomicBytesCache.get(txid2);
          if (cached != null)
            return cached;
          const beefBytes = this.#getBeefForAtomic(txid2).#getSerializedBytes();
          const txidBytes = toUint8Array(txid2, "hex");
          const atomic = new Uint8Array(4 + txidBytes.length + beefBytes.length);
          const view = new DataView(atomic.buffer);
          view.setUint32(0, ATOMIC_BEEF, true);
          for (let i = 0; i < txidBytes.length; i++) {
            atomic[4 + i] = txidBytes[txidBytes.length - 1 - i];
          }
          atomic.set(beefBytes, 4 + txidBytes.length);
          this.#atomicBytesCache.set(txid2, atomic);
          this.#atomicCacheTxs = this.#captureTransactionState();
          this.#atomicCacheBumps = Array.from(this.bumps);
          this.#atomicCacheVersion = this.version;
          return atomic;
        }
        #collectAtomicTransactions(subject, txidToTx) {
          const included = /* @__PURE__ */ new Set();
          const stack = [subject];
          while (stack.length > 0) {
            const tx = stack.pop();
            if (tx == null || included.has(tx))
              continue;
            included.add(tx);
            if (this.#hasMatchingBump(tx) || tx.isTxidOnly)
              continue;
            for (const inputTxid of tx.inputTxids) {
              const input = txidToTx.get(inputTxid);
              if (input != null)
                stack.push(input);
            }
          }
          return included;
        }
        #hasMatchingBump(tx) {
          const bumpIndex = tx.bumpIndex;
          if (bumpIndex == null || !Number.isSafeInteger(bumpIndex) || bumpIndex < 0 || bumpIndex >= this.bumps.length)
            return false;
          return this.bumps[bumpIndex]?.path[0]?.some((leaf) => leaf.hash === tx.txid) ?? false;
        }
        #copySelectedTransactions(included) {
          const beef = new _Beef(this.version);
          const bumpIndexMap = /* @__PURE__ */ new Map();
          for (const tx of this.txs) {
            if (!included.has(tx) || !this.#hasMatchingBump(tx) || tx.bumpIndex == null)
              continue;
            if (!bumpIndexMap.has(tx.bumpIndex)) {
              bumpIndexMap.set(tx.bumpIndex, beef.bumps.length);
              beef.bumps.push(this.bumps[tx.bumpIndex]);
            }
          }
          for (const tx of this.txs) {
            if (!included.has(tx))
              continue;
            const bumpIndex = tx.bumpIndex == null ? void 0 : bumpIndexMap.get(tx.bumpIndex);
            let copy;
            if (tx._rawTx != null) {
              copy = new BeefTx(tx._rawTx, bumpIndex, Array.from(tx.inputTxids));
            } else if (tx._tx != null) {
              copy = BeefTx.fromTx(tx._tx, bumpIndex);
            } else {
              copy = BeefTx.fromTxid(tx.txid, bumpIndex);
            }
            beef.txs.push(copy);
          }
          return beef;
        }
        /**
         * Checks the BRC-95 transaction-inclusion rule without requiring header-root
         * validation: the subject must exist and every included transaction must be
         * in its recursive dependency graph.
         */
        isAtomic(txid2 = this.atomicTxid ?? "") {
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          if (txid2.length === 0)
            return false;
          const txidToTx = this.#ensureTxidIndex();
          if (txidToTx.size !== this.txs.length)
            return false;
          const subject = txidToTx.get(txid2);
          if (subject == null)
            return false;
          return this.#collectAtomicTransactions(subject, txidToTx).size === this.txs.length;
        }
        /**
         * @param txid of `beefTx` to find
         * @returns `BeefTx` in `txs` with `txid`.
         */
        findTxid(txid2) {
          this.synchronizeNestedTransactionMutations();
          return this.#findTxidIndexed(txid2);
        }
        #findTxidIndexed(txid2) {
          return this.#ensureTxidIndex().get(txid2);
        }
        #ensureTxidIndex() {
          if (this.#txidIndex == null || this.#txPositionIndex == null)
            this.#rebuildTxIndexes();
          return this.#txidIndex;
        }
        #ensureTxPositionIndex() {
          if (this.#txPositionIndex == null || this.#txidIndex == null)
            this.#rebuildTxIndexes();
          return this.#txPositionIndex;
        }
        #rebuildTxIndexes() {
          this.#txidIndex = /* @__PURE__ */ new Map();
          this.#txPositionIndex = /* @__PURE__ */ new Map();
          for (let i = 0; i < this.txs.length; i++) {
            const tx = this.txs[i];
            this.#txidIndex.set(tx.txid, tx);
            this.#txPositionIndex.set(tx.txid, i);
          }
        }
        #addToIndex(tx, position = this.txs.length - 1) {
          this.#txidIndex?.set(tx.txid, tx);
          this.#txPositionIndex?.set(tx.txid, position);
        }
        #replaceOrAppendTx(tx) {
          const position = this.#ensureTxPositionIndex().get(tx.txid);
          if (position === void 0) {
            this.txs.push(tx);
            this.#addToIndex(tx);
          } else {
            this.txs[position] = tx;
            this.#addToIndex(tx, position);
          }
        }
        /**
         * Replaces `BeefTx` for this txid with txidOnly.
         *
         * Replacement is done so that a `clone()` can be
         * updated by this method without affecting the
         * original.
         *
         * @param txid
         * @returns undefined if txid is unknown.
         */
        makeTxidOnly(txid2) {
          const i = this.#ensureTxPositionIndex().get(txid2);
          if (i === void 0)
            return void 0;
          let btx = this.txs[i];
          if (btx.isTxidOnly) {
            return btx;
          }
          btx = BeefTx.fromTxid(txid2);
          this.txs[i] = btx;
          this.#addToIndex(btx, i);
          this.#tryToValidateBumpIndex(btx);
          this.#markMutated(true);
          return btx;
        }
        /**
         * @returns `MerklePath` with level zero hash equal to txid or undefined.
         */
        findBump(txid2) {
          this.#synchronizeNestedBumpMutations();
          const index = this.#ensureBumpTxidIndex().get(txid2);
          return index === void 0 ? void 0 : this.bumps[index];
        }
        #ensureBumpTxidIndex() {
          if (this.#bumpIndexByTxid == null) {
            this.#bumpIndexByTxid = /* @__PURE__ */ new Map();
            for (let i = 0; i < this.bumps.length; i++) {
              for (const leaf of this.bumps[i].path[0]) {
                if (typeof leaf.hash === "string")
                  this.#bumpIndexByTxid.set(leaf.hash, i);
              }
            }
          }
          return this.#bumpIndexByTxid;
        }
        #ensureBumpHeightIndex() {
          if (this.#bumpIndexesByHeight == null) {
            this.#bumpIndexesByHeight = /* @__PURE__ */ new Map();
            for (let i = 0; i < this.bumps.length; i++) {
              const bump = this.bumps[i];
              const indexes = this.#bumpIndexesByHeight.get(bump.blockHeight) ?? [];
              indexes.push(i);
              this.#bumpIndexesByHeight.set(bump.blockHeight, indexes);
            }
          }
          return this.#bumpIndexesByHeight;
        }
        #invalidateBumpIndexes() {
          this.#bumpIndexesByHeight = void 0;
          this.#bumpIndexByTxid = void 0;
        }
        /**
         * Finds a Transaction in this `Beef`
         * and adds any missing input SourceTransactions from this `Beef`.
         *
         * The result is suitable for signing.
         *
         * @param txid The id of the target transaction.
         * @returns Transaction with all available input `SourceTransaction`s from this Beef.
         */
        findTransactionForSigning(txid2) {
          const beefTx = this.findTxid(txid2);
          if (beefTx?.tx == null)
            return void 0;
          for (const i of beefTx.tx.inputs) {
            if (i.sourceTransaction == null) {
              const itx = this.#findTxidIndexed(verifyNotNull(i.sourceTXID, "sourceTXID must be valid"));
              if (itx != null) {
                i.sourceTransaction = itx.tx;
              }
            }
          }
          return beefTx.tx;
        }
        /**
         * Builds the proof tree rooted at a specific `Transaction`.
         *
         * To succeed, the Beef must contain all the required transaction and merkle path data.
         *
         * @param txid The id of the target transaction.
         * @returns Transaction with input `SourceTransaction` and `MerklePath` populated from this Beef.
         */
        findAtomicTransaction(txid2) {
          const beefTx = this.findTxid(txid2);
          if (beefTx?.tx == null)
            return void 0;
          this.#addInputProof(beefTx.tx);
          return beefTx.tx;
        }
        /** Iteratively attach merkle paths and source transactions to all inputs. */
        #addInputProof(tx) {
          const visited = /* @__PURE__ */ new Set();
          const stack = [tx];
          while (stack.length > 0) {
            const current = stack.pop();
            if (current == null)
              continue;
            const txid2 = current.id("hex");
            if (visited.has(txid2))
              continue;
            visited.add(txid2);
            const mp = this.findBump(txid2);
            if (mp != null) {
              current.merklePath = mp;
              continue;
            }
            for (const input of current.inputs) {
              this.#resolveInputSource(input);
              if (input.sourceTransaction != null)
                stack.push(input.sourceTransaction);
            }
          }
        }
        #resolveInputSource(i) {
          if (i.sourceTransaction == null) {
            const itx = this.#findTxidIndexed(verifyNotNull(i.sourceTXID, "sourceTXID must be valid"));
            if (itx != null) {
              i.sourceTransaction = itx.tx;
            }
          }
        }
        /**
         * Merge a MerklePath that is assumed to be fully valid.
         * @param bump
         * @returns index of merged bump
         */
        mergeBump(bump) {
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          this.#markMutated(false);
          return this.#mergeBumpEntry(bump);
        }
        /**
         * Merge several independently proven transactions in one mutation pass.
         *
         * This is equivalent to calling `mergeRawTx` followed by `mergeBump` for
         * every entry, but synchronizes nested BEEF state only once. That distinction
         * matters for wallets assembling a BEEF from a fragmented UTXO set because
         * proof paths are otherwise re-scanned after every input.
         */
        mergeProvenTxs(entries) {
          if (entries.length === 0)
            return [];
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          this.#markMutated(true);
          const merged = [];
          for (const entry of entries) {
            merged.push(this.#mergeRawTxEntry(entry.rawTx));
          }
          const heightCounts = /* @__PURE__ */ new Map();
          for (const entry of entries) {
            const height = entry.merklePath.blockHeight;
            heightCounts.set(height, (heightCounts.get(height) ?? 0) + 1);
          }
          const groups = /* @__PURE__ */ new Map();
          for (let index = 0; index < entries.length; index++) {
            const path = entries[index].merklePath;
            const rootHint = entries[index].merkleRoot;
            const key = heightCounts.get(path.blockHeight) === 1 ? `${path.blockHeight}:single:${index}` : `${path.blockHeight}:${rootHint ?? path.computeRoot()}`;
            const group = groups.get(key);
            if (group == null) {
              groups.set(key, { first: index, paths: [path], validateCombined: rootHint != null });
            } else {
              group.paths.push(path);
              group.validateCombined = group.validateCombined || rootHint != null;
            }
          }
          for (const group of [...groups.values()].sort((a, b) => a.first - b.first)) {
            this.#mergeBumpEntry(this.#combineCompatibleBumps(group.paths, group.validateCombined));
          }
          return merged;
        }
        /** Combine already root-matched paths while preserving the first path reference. */
        #combineCompatibleBumps(paths, validateCombined = false) {
          const combined = paths[0];
          if (paths.length === 1 && !validateCombined)
            return combined;
          const levels = combined.path.map((level) => new Map(level.map((leaf) => [leaf.offset, leaf])));
          for (let pathIndex = 1; pathIndex < paths.length; pathIndex++) {
            mergeCompatibleBumpLevels(levels, paths[pathIndex], combined.path.length, validateCombined);
          }
          const combinedPath = levels.map((level) => [...level.values()]);
          if (validateCombined) {
            const validated = new MerklePath(combined.blockHeight, combinedPath);
            validated.trim();
            return validated;
          }
          combined.path = combinedPath;
          combined.trim();
          return combined;
        }
        /** Merge one bump after the caller has synchronized and marked the BEEF. */
        #mergeBumpEntry(bump) {
          const bumpIndex = this.#findOrInsertBump(bump);
          const b = this.bumps[bumpIndex];
          const txIndex = this.#ensureTxidIndex();
          for (const leaf of b.path[0]) {
            if (typeof leaf.hash !== "string")
              continue;
            const tx = txIndex.get(leaf.hash);
            if (tx != null && tx.bumpIndex == null)
              this.#tryMarkTxProvenByBump(tx, b, bumpIndex);
          }
          return bumpIndex;
        }
        /**
         * Find an existing compatible bump or insert a new one; return its index.
         */
        #findOrInsertBump(bump) {
          const byHeight = this.#ensureBumpHeightIndex();
          const byTxid = this.#ensureBumpTxidIndex();
          const sameHeight = byHeight.get(bump.blockHeight) ?? [];
          if (sameHeight.length > 0) {
            const root = bump.computeRoot();
            for (const existing of sameHeight) {
              if (this.bumps[existing].computeRoot() !== root)
                continue;
              this.bumps[existing].combine(bump);
              indexBumpTxids(this.bumps[existing], existing, byTxid);
              return existing;
            }
          }
          this.bumps.push(bump);
          const index = this.bumps.length - 1;
          sameHeight.push(index);
          byHeight.set(bump.blockHeight, sameHeight);
          indexBumpTxids(bump, index, byTxid);
          return index;
        }
        /** If bump's level-0 path contains tx's txid, record the bumpIndex on tx. */
        #tryMarkTxProvenByBump(tx, b, bumpIndex) {
          const txid2 = tx.txid;
          for (const n of b.path[0]) {
            if (n.hash === txid2) {
              tx.bumpIndex = bumpIndex;
              n.txid = true;
              break;
            }
          }
        }
        /**
         * Merge a serialized transaction.
         *
         * Checks that a transaction with the same txid hasn't already been merged.
         *
         * Replaces existing transaction with same txid.
         *
         * @param rawTx
         * @param bumpIndex Optional. If a number, must be valid index into bumps array.
         * @returns txid of rawTx
         */
        mergeRawTx(rawTx, bumpIndex) {
          this.synchronizeNestedTransactionMutations();
          this.#markMutated(true);
          return this.#mergeRawTxEntry(rawTx, bumpIndex);
        }
        /** Merge one raw transaction after the caller has synchronized and marked the BEEF. */
        #mergeRawTxEntry(rawTx, bumpIndex) {
          const newTx = new BeefTx(rawTx, bumpIndex);
          this.#replaceOrAppendTx(newTx);
          this.#tryToValidateBumpIndex(newTx);
          return newTx;
        }
        #mergeTransactionEntry(current) {
          const bumpIndex = current.merklePath == null ? void 0 : this.#mergeBumpEntry(current.merklePath);
          const newTx = new BeefTx(current, bumpIndex);
          this.#replaceOrAppendTx(newTx);
          this.#tryToValidateBumpIndex(newTx);
          return newTx;
        }
        #queueSourceTransactions(current, stack) {
          for (let i = current.inputs.length - 1; i >= 0; i--) {
            const source = current.inputs[i].sourceTransaction;
            if (source != null)
              stack.push(source);
          }
        }
        /**
         * Merge a `Transaction` and any referenced `merklePath` and `sourceTransaction`, recursifely.
         *
         * Replaces existing transaction with same txid.
         *
         * Attempts to match an existing bump to the new transaction.
         *
         * @param tx
         * @returns txid of tx
         */
        mergeTransaction(tx) {
          this.synchronizeNestedTransactionMutations();
          this.#markMutated(true);
          return this.#mergeTransactionGraph(tx);
        }
        /** Merge one transaction graph after the caller has synchronized and marked the BEEF. */
        #mergeTransactionGraph(tx) {
          tx.materializeSourceTXIDs();
          const rootTxid = tx.id("hex");
          const visited = /* @__PURE__ */ new Set();
          const stack = [tx];
          let root;
          while (stack.length > 0) {
            const current = stack.pop();
            if (current == null)
              continue;
            const txid2 = current.id("hex");
            if (visited.has(txid2))
              continue;
            visited.add(txid2);
            const newTx = this.#mergeTransactionEntry(current);
            if (txid2 === rootTxid)
              root = newTx;
            if (newTx.bumpIndex === void 0)
              this.#queueSourceTransactions(current, stack);
          }
          if (root == null)
            throw new Error("Failed to merge root transaction");
          return root;
        }
        /**
         * Removes an existing transaction from the BEEF, given its TXID
         * @param txid TXID of the transaction to remove
         */
        removeExistingTxid(txid2) {
          const existingTxIndex = this.#ensureTxPositionIndex().get(txid2);
          if (existingTxIndex !== void 0) {
            this.txs.splice(existingTxIndex, 1);
            this.#rebuildTxIndexes();
            this.#markMutated(true);
          }
        }
        mergeTxidOnly(txid2) {
          let tx = this.findTxid(txid2);
          if (tx == null) {
            tx = new BeefTx(txid2);
            this.txs.push(tx);
            this.#addToIndex(tx);
            this.#tryToValidateBumpIndex(tx);
            this.#markMutated(true);
          }
          return tx;
        }
        mergeBeefTx(btx) {
          let beefTx = this.findTxid(btx.txid);
          if (btx.isTxidOnly && beefTx == null) {
            beefTx = this.mergeTxidOnly(btx.txid);
          } else if (btx._tx != null && (beefTx == null || beefTx.isTxidOnly)) {
            beefTx = this.mergeTransaction(btx._tx);
          } else if (btx._rawTx != null && (beefTx == null || beefTx.isTxidOnly)) {
            beefTx = this.mergeRawTx(btx._rawTx);
          }
          if (beefTx == null) {
            throw new Error(`Failed to merge BeefTx for txid: ${btx.txid}`);
          }
          return beefTx;
        }
        /** Merge one BEEF transaction after the caller has synchronized and marked the BEEF. */
        #mergeBeefTxEntry(btx) {
          let beefTx = this.#findTxidIndexed(btx.txid);
          if (btx.isTxidOnly && beefTx == null) {
            beefTx = BeefTx.fromTxid(btx.txid);
            this.txs.push(beefTx);
            this.#addToIndex(beefTx);
            this.#tryToValidateBumpIndex(beefTx);
          } else if (btx._tx != null && (beefTx == null || beefTx.isTxidOnly)) {
            beefTx = this.#mergeTransactionGraph(btx._tx);
          } else if (btx._rawTx != null && (beefTx == null || beefTx.isTxidOnly)) {
            beefTx = this.#mergeRawTxEntry(btx._rawTx);
          }
          if (beefTx == null) {
            throw new Error(`Failed to merge BeefTx for txid: ${btx.txid}`);
          }
          return beefTx;
        }
        mergeBeef(beef) {
          const b = _Beef.fromBinaryStrict(beef instanceof _Beef ? beef.toBinary() : beef);
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          this.#markMutated(true);
          for (const bump of b.bumps) {
            this.#mergeBumpEntry(bump);
          }
          for (const tx of b.txs) {
            this.#mergeBeefTxEntry(tx);
          }
        }
        /**
         * Sorts `txs` and checks structural validity of beef.
         *
         * Does NOT verify merkle roots.
         *
         * Validity requirements:
         * 1. No 'known' txids, unless `allowTxidOnly` is true.
         * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
         * 3. Order of transactions satisfies dependencies before dependents.
         * 4. No transactions with duplicate txids.
         *
         * @param allowTxidOnly optional. If true, transaction txid only is assumed valid
         */
        isValid(allowTxidOnly) {
          return this.verifyValid(allowTxidOnly).valid;
        }
        /**
         * Sorts `txs` and confirms validity of transaction data contained in beef
         * by validating structure of this beef and confirming computed merkle roots
         * using `chainTracker`.
         *
         * Validity requirements:
         * 1. No 'known' txids, unless `allowTxidOnly` is true.
         * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
         * 3. Order of transactions satisfies dependencies before dependents.
         * 4. No transactions with duplicate txids.
         *
         * @param chainTracker Used to verify computed merkle path roots for all bump txids.
         * @param allowTxidOnly optional. If true, transaction txid is assumed valid
         */
        async verify(chainTracker, allowTxidOnly) {
          const r2 = this.verifyValid(allowTxidOnly);
          if (!r2.valid)
            return false;
          for (const height of Object.keys(r2.roots)) {
            const isValid = await chainTracker.isValidRootForHeight(r2.roots[height], Number(height));
            if (isValid !== true) {
              return false;
            }
          }
          return true;
        }
        /**
         * Sorts `txs` and confirms validity of transaction data contained in beef
         * by validating structure of this beef.
         *
         * Returns block heights and merkle root values to be confirmed by a chaintracker.
         *
         * Validity requirements:
         * 1. No 'known' txids, unless `allowTxidOnly` is true.
         * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
         * 3. Order of transactions satisfies dependencies before dependents.
         * 4. No transactions with duplicate txids.
         *
         * @param allowTxidOnly optional. If true, transaction txid is assumed valid
         * @returns {{valid: boolean, roots: Record<number, string>}}
         * `valid` is true iff this Beef is structuraly valid.
         * `roots` is a record where keys are block heights and values are the corresponding merkle roots to be validated.
         */
        verifyValid(allowTxidOnly) {
          this.#synchronizeNestedBumpMutations();
          const r2 = {
            valid: false,
            roots: {}
          };
          if (this.atomicTxid != null && !this.isAtomic(this.atomicTxid))
            return r2;
          const sr = this.sortTxs();
          if (this.#hasDuplicateTxids())
            return r2;
          if (sr.missingInputs.length > 0 || sr.notValid.length > 0 || sr.txidOnly.length > 0 && allowTxidOnly !== true || sr.withMissingInputs.length > 0) {
            return r2;
          }
          const txids = {};
          if (!this.#collectTxidOnlyTxids(txids, allowTxidOnly))
            return r2;
          if (!this.#collectBumpTxids(txids, r2))
            return r2;
          if (!this.#verifyBumpIndexLeaves())
            return r2;
          if (!this.#verifyInputDependencies(txids))
            return r2;
          r2.valid = true;
          return r2;
        }
        #hasDuplicateTxids() {
          const seen = /* @__PURE__ */ new Set();
          for (const tx of this.txs) {
            if (seen.has(tx.txid))
              return true;
            seen.add(tx.txid);
          }
          return false;
        }
        /** Add txidOnly transaction txids; return false if not allowed. */
        #collectTxidOnlyTxids(txids, allowTxidOnly) {
          for (const tx of this.txs) {
            if (!tx.isTxidOnly)
              continue;
            if (allowTxidOnly !== true)
              return false;
            txids[tx.txid] = true;
          }
          return true;
        }
        /**
         * Record txids proven by bumps; validate all bump roots agree per block height.
         * Returns false if any root conflict is detected.
         */
        #collectBumpTxids(txids, r2) {
          for (const b of this.bumps) {
            for (const n of b.path[0]) {
              if (n.txid !== true || typeof n.hash !== "string" || n.hash.length === 0)
                continue;
              txids[n.hash] = true;
              if (!this.#confirmComputedRoot(b, n.hash, r2))
                return false;
            }
          }
          return true;
        }
        /** Verify that every tx with a bumpIndex has a matching txid leaf in its bump. */
        #verifyBumpIndexLeaves() {
          for (const t of this.txs) {
            if (t.bumpIndex === void 0)
              continue;
            if (!Number.isSafeInteger(t.bumpIndex) || t.bumpIndex < 0 || t.bumpIndex >= this.bumps.length)
              return false;
            const leaf = this.bumps[t.bumpIndex]?.path[0]?.find((l) => l.hash === t.txid);
            if (leaf == null)
              return false;
          }
          return true;
        }
        /** Verify all input txids appear before the spending tx in sorted order. */
        #verifyInputDependencies(txids) {
          for (const t of this.txs) {
            for (const i of t.inputTxids) {
              if (!txids[i])
                return false;
            }
            txids[t.txid] = true;
          }
          return true;
        }
        /** Confirm the computed merkle root for txid in bump matches previously accepted root for that height. */
        #confirmComputedRoot(b, txid2, r2) {
          const root = b.computeRoot(txid2);
          if (r2.roots[b.blockHeight] === void 0 || r2.roots[b.blockHeight] === "") {
            r2.roots[b.blockHeight] = root;
          }
          return r2.roots[b.blockHeight] === root;
        }
        /**
         * Serializes this data to `writer`
         * @param writer
         */
        toWriter(writer) {
          writer.writeUInt32LE(this.version);
          writer.writeVarIntNum(this.bumps.length);
          for (const b of this.bumps) {
            writer.write(writer instanceof WriterUint8Array ? b.toBinaryUint8Array() : b.toBinary());
          }
          writer.writeVarIntNum(this.txs.length);
          for (const tx of this.txs) {
            tx.toWriter(writer, this.version);
          }
        }
        /**
         * Returns a binary array representing the serialized BEEF
         * @returns A binary array representing the BEEF
         * @returns An array of byte values containing binary serialization of the BEEF
         */
        toBinary() {
          return Array.from(this.#getSerializedBytes());
        }
        /**
         * Returns a binary array representing the serialized BEEF
         * @returns A Uint8Array containing binary serialization of the BEEF
         */
        toUint8Array() {
          return new Uint8Array(this.#getSerializedBytes());
        }
        /**
         * Serialize this Beef as AtomicBEEF.
         *
         * `txid` must exist
         *
         * includes exactly the subject transaction and its recursive dependencies
         *
         * @param txid
         * @returns serialized contents of this Beef with AtomicBEEF prefix.
         */
        toBinaryAtomic(txid2) {
          return Array.from(this.#getAtomicSerializedBytes(txid2));
        }
        /**
         * Serialize this Beef as AtomicBEEF.
         *
         * `txid` must exist
         *
         * includes exactly the subject transaction and its recursive dependencies
         *
         * @param txid
         * @returns serialized contents of this Beef with AtomicBEEF prefix.
         */
        toUint8ArrayAtomic(txid2) {
          return new Uint8Array(this.#getAtomicSerializedBytes(txid2));
        }
        /**
         * Returns a hex string representing the serialized BEEF
         * @returns A hex string representing the BEEF
         */
        toHex() {
          const bytes3 = this.#getSerializedBytes();
          if (this.#hexCache != null)
            return this.#hexCache;
          const hex2 = toHex(bytes3);
          this.#hexCache = hex2;
          return hex2;
        }
        static fromReader(br) {
          const serializedStart = br.pos;
          let version = br.readUInt32LE();
          let atomicTxid;
          let beefStart = serializedStart;
          if (version === ATOMIC_BEEF) {
            atomicTxid = toHex(br.readReverse(32));
            beefStart = br.pos;
            version = br.readUInt32LE();
          }
          if (version !== BEEF_V1 && version !== BEEF_V2) {
            throw new Error(`Serialized BEEF must start with ${BEEF_V1} or ${BEEF_V2} but starts with ${version}`);
          }
          const beef = new _Beef(version);
          const bumpsLength = br.readVarIntNumStrict(false);
          for (let i = 0; i < bumpsLength; i++) {
            const bump = MerklePath.fromReader(br, false);
            beef.bumps.push(bump);
          }
          const txsLength = br.readVarIntNumStrict(false);
          for (let i = 0; i < txsLength; i++) {
            const beefTx = BeefTx.fromReader(br, version);
            beef.txs.push(beefTx);
          }
          beef.atomicTxid = atomicTxid;
          if (br instanceof ReaderUint8Array) {
            beef.#rawBytesCache = br.bin.subarray(beefStart, br.pos);
            beef.#captureSerializationState();
          }
          return beef;
        }
        /**
         * Parses the first BEEF object in the provided binary array.
         *
         * This compatibility parser intentionally ignores any trailing bytes. It is
         * suitable only when the caller owns the framing or is deliberately reading
         * one object from a larger stream. Use {@link fromBinaryStrict} for untrusted
         * or independently framed input so an appended suffix is rejected.
         *
         * @param bin The binary array or Uint8Array from which to construct BEEF
         * @returns An instance of the Beef class constructed from the binary data
         */
        static fromBinary(bin) {
          return _Beef.fromReader(new ReaderUint8Array(Uint8Array.from(bin)));
        }
        /**
         * Parses one complete BEEF object from an isolated copy of `bin` and rejects
         * any trailing bytes. Use this for data received across a trust boundary.
         */
        static fromBinaryStrict(bin) {
          return _Beef.fromBinaryView(Uint8Array.from(bin));
        }
        /**
         * Parses BEEF while retaining zero-copy views over `bin`. The caller must not
         * mutate the buffer for the lifetime of the returned object.
         */
        static fromBinaryView(bin) {
          const br = new ReaderUint8Array(bin);
          const beef = _Beef.fromReader(br);
          if (!br.eof())
            throw new Error("Serialized BEEF contains trailing data");
          return beef;
        }
        /**
         * Constructs an instance of the Beef class based on the provided string
         * @param s The string value from which to construct BEEF
         * @param enc The encoding of the string value from which BEEF should be constructed
         * @returns An instance of the Beef class constructed from the string
         */
        static fromString(s2, enc = "hex") {
          const bin = toUint8Array(s2, enc);
          return _Beef.fromBinaryStrict(bin);
        }
        /**
         * Try to validate newTx.bumpIndex by looking for an existing bump
         * that proves newTx.txid
         *
         * @param newTx A new `BeefTx` that has been added to this.txs
         * @returns true if a bump was found, false otherwise
         */
        #tryToValidateBumpIndex(newTx) {
          if (newTx.bumpIndex !== void 0) {
            return true;
          }
          const txid2 = newTx.txid;
          const i = this.#ensureBumpTxidIndex().get(txid2);
          if (i === void 0)
            return false;
          newTx.bumpIndex = i;
          const leaf = this.bumps[i].path[0].find((b) => b.hash === txid2);
          if (leaf != null)
            leaf.txid = true;
          return true;
        }
        /**
         * Sort the `txs` by input txid dependency order:
         * - Oldest Tx Anchored by Path or txid only
         * - Newer Txs depending on Older parents
         * - Newest Tx
         *
         * with proof (MerklePath) last, longest chain of dependencies first
         *
         * @returns `{ missingInputs, notValid, valid, withMissingInputs }`
         */
        sortTxs() {
          this.synchronizeNestedTransactionMutations();
          this.#synchronizeNestedBumpMutations();
          if (this.#sortResultCache != null && this.#sortTxStateMatches()) {
            return this.#cloneSortResult(this.#sortResultCache);
          }
          this.#sortResultCache = void 0;
          this.#sortTxState = void 0;
          const validTxids = {};
          const txidToTx = {};
          const result = [];
          const txidOnly = [];
          let queue = this.partitionTxs(txidToTx, validTxids, result, txidOnly);
          const { txsMissingInputs, missingInputs, remaining } = this.#separateMissingInputs(queue, txidToTx);
          queue = remaining;
          const txsNotValid = this.#topoSort(queue, validTxids, result);
          this.txs = txsMissingInputs.concat(txsNotValid).concat(txidOnly).concat(result);
          this.#needsSort = false;
          this.#invalidateSerializationCaches();
          this.#rebuildTxIndexes();
          const sortResult = {
            missingInputs: Object.keys(missingInputs),
            notValid: txsNotValid.map((tx) => tx.txid),
            valid: Object.keys(validTxids),
            withMissingInputs: txsMissingInputs.map((tx) => tx.txid),
            txidOnly: txidOnly.map((tx) => tx.txid)
          };
          this.#sortResultCache = sortResult;
          this.#captureSortTxState();
          return this.#cloneSortResult(sortResult);
        }
        #captureSortTxState() {
          this.#sortTxState = this.txs.map((tx) => ({
            ref: tx,
            txid: tx.txid,
            bumpIndex: tx.bumpIndex,
            isTxidOnly: tx.isTxidOnly,
            inputTxids: [...tx.inputTxids]
          }));
        }
        #sortTxStateMatches() {
          if (this.#sortTxState?.length !== this.txs.length)
            return false;
          for (let index = 0; index < this.txs.length; index++) {
            const tx = this.txs[index];
            const state = this.#sortTxState[index];
            if (state.ref !== tx || state.txid !== tx.txid || state.bumpIndex !== tx.bumpIndex || state.isTxidOnly !== tx.isTxidOnly || state.inputTxids.length !== tx.inputTxids.length)
              return false;
            for (let inputIndex = 0; inputIndex < tx.inputTxids.length; inputIndex++) {
              if (state.inputTxids[inputIndex] !== tx.inputTxids[inputIndex])
                return false;
            }
          }
          return true;
        }
        #cloneSortResult(result) {
          return {
            missingInputs: [...result.missingInputs],
            notValid: [...result.notValid],
            valid: [...result.valid],
            withMissingInputs: [...result.withMissingInputs],
            txidOnly: [...result.txidOnly]
          };
        }
        /**
         * Partition txs into proven (result), txidOnly, and a queue of the rest.
         * Populates txidToTx and validTxids as side-effects.
         */
        partitionTxs(txidToTx, validTxids, result, txidOnly) {
          const queue = [];
          for (const tx of this.txs) {
            txidToTx[tx.txid] = tx;
            tx.isValid = tx.hasProof;
            if (tx.isValid) {
              validTxids[tx.txid] = true;
              result.push(tx);
            } else if (tx.isTxidOnly && tx.inputTxids.length === 0) {
              validTxids[tx.txid] = true;
              txidOnly.push(tx);
            } else {
              queue.push(tx);
            }
          }
          return queue;
        }
        /**
         * Separate queue entries that have at least one input txid not present in txidToTx.
         */
        #separateMissingInputs(candidates, txidToTx) {
          const missingInputs = {};
          const txsMissingInputs = [];
          const remaining = [];
          for (const tx of candidates) {
            let hasMissingInput = false;
            for (const inputTxid of tx.inputTxids) {
              if (txidToTx[inputTxid] === void 0) {
                missingInputs[inputTxid] = true;
                hasMissingInput = true;
              }
            }
            if (hasMissingInput) {
              txsMissingInputs.push(tx);
            } else {
              remaining.push(tx);
            }
          }
          return { txsMissingInputs, missingInputs, remaining };
        }
        /**
         * Topologically sort queue into result; return anything that cannot be sorted.
         */
        #topoSort(queue, validTxids, result) {
          const { indegree, dependents, originalIndex, round } = this.#buildTopoSortGraph(queue, validTxids);
          const processed = this.#processTopoSortQueue(queue, indegree, dependents, originalIndex, round);
          this.#appendTopoSortResult(queue, processed, round, validTxids, result);
          return queue.filter((tx) => !processed.has(tx.txid));
        }
        #buildTopoSortGraph(queue, validTxids) {
          const candidates = new Set(queue.map((tx) => tx.txid));
          const indegree = /* @__PURE__ */ new Map();
          const dependents = /* @__PURE__ */ new Map();
          const originalIndex = new Map(queue.map((tx, index) => [tx.txid, index]));
          const round = /* @__PURE__ */ new Map();
          for (const tx of queue) {
            let degree = 0;
            for (const inputTxid of tx.inputTxids) {
              if (validTxids[inputTxid])
                continue;
              degree++;
              if (candidates.has(inputTxid)) {
                const children = dependents.get(inputTxid) ?? [];
                children.push(tx);
                dependents.set(inputTxid, children);
              }
            }
            indegree.set(tx.txid, degree);
            round.set(tx.txid, 0);
          }
          return { indegree, dependents, originalIndex, round };
        }
        #processTopoSortQueue(queue, indegree, dependents, originalIndex, round) {
          const ready = queue.filter((tx) => indegree.get(tx.txid) === 0);
          const processed = /* @__PURE__ */ new Set();
          for (const tx of ready) {
            if (processed.has(tx.txid))
              continue;
            processed.add(tx.txid);
            for (const dependent of dependents.get(tx.txid) ?? []) {
              const nextRound = (round.get(tx.txid) ?? 0) + ((originalIndex.get(tx.txid) ?? 0) > (originalIndex.get(dependent.txid) ?? 0) ? 1 : 0);
              round.set(dependent.txid, Math.max(round.get(dependent.txid) ?? 0, nextRound));
              const next = (indegree.get(dependent.txid) ?? 0) - 1;
              indegree.set(dependent.txid, next);
              if (next === 0)
                ready.push(dependent);
            }
          }
          return processed;
        }
        #appendTopoSortResult(queue, processed, round, validTxids, result) {
          const byRound = [];
          for (const tx of queue) {
            if (!processed.has(tx.txid))
              continue;
            const txRound = round.get(tx.txid) ?? 0;
            const bucket = byRound[txRound] ?? [];
            bucket.push(tx);
            byRound[txRound] = bucket;
          }
          for (const bucket of byRound) {
            for (const tx of bucket ?? []) {
              validTxids[tx.txid] = true;
              result.push(tx);
            }
          }
        }
        /**
         * @returns a shallow copy of this beef
         */
        clone() {
          const c = new _Beef();
          c.version = this.version;
          c.bumps = Array.from(this.bumps);
          c.txs = Array.from(this.txs);
          c.#txidIndex = void 0;
          c.#txPositionIndex = void 0;
          c.#bumpIndexesByHeight = void 0;
          c.#bumpIndexByTxid = void 0;
          c.#needsSort = this.#needsSort;
          c.#sortResultCache = this.#sortResultCache == null ? void 0 : this.#cloneSortResult(this.#sortResultCache);
          if (c.#sortResultCache != null)
            c.#captureSortTxState();
          c.#hexCache = this.#hexCache;
          c.#rawBytesCache = this.#rawBytesCache;
          if (c.#rawBytesCache != null)
            c.#captureSerializationState();
          return c;
        }
        /**
         * Ensure that all the txids in `knownTxids` are txidOnly
         * @param knownTxids
         */
        trimKnownTxids(knownTxids) {
          let mutated = this.#removeKnownTxidOnlyTxs(new Set(knownTxids));
          mutated = this.#reindexBumps() || mutated;
          if (mutated) {
            this.#markMutated(true);
          }
        }
        /** Remove txidOnly entries that appear in knownTxids; return true if any were removed. */
        #removeKnownTxidOnlyTxs(knownTxids) {
          const originalLength = this.txs.length;
          this.txs = this.txs.filter((tx) => !(tx.isTxidOnly && knownTxids.has(tx.txid)));
          const mutated = this.txs.length !== originalLength;
          if (mutated)
            this.#rebuildTxIndexes();
          return mutated;
        }
        /**
         * Remove bumps that are no longer referenced by any tx and update bumpIndex references.
         * Returns true if any bumps were removed.
         */
        #reindexBumps() {
          const referencedBumpIndices = /* @__PURE__ */ new Set();
          for (const tx of this.txs) {
            if (tx.bumpIndex !== void 0) {
              referencedBumpIndices.add(tx.bumpIndex);
            }
          }
          if (referencedBumpIndices.size >= this.bumps.length)
            return false;
          const indexMap = /* @__PURE__ */ new Map();
          let newIndex = 0;
          for (let i = 0; i < this.bumps.length; i++) {
            if (referencedBumpIndices.has(i)) {
              indexMap.set(i, newIndex);
              newIndex++;
            }
          }
          this.bumps = this.bumps.filter((_, i) => referencedBumpIndices.has(i));
          for (const tx of this.txs) {
            if (tx.bumpIndex === void 0)
              continue;
            const mapped = indexMap.get(tx.bumpIndex);
            if (mapped === void 0) {
              throw new Error(`Internal error: bumpIndex ${tx.bumpIndex} not found in indexMap`);
            }
            tx.bumpIndex = mapped;
          }
          this.#invalidateBumpIndexes();
          return true;
        }
        /**
         * @returns array of transaction txids that either have a proof or whose inputs chain back to a proven transaction.
         */
        getValidTxids() {
          const r2 = this.sortTxs();
          return r2.valid;
        }
        /**
         * @returns Summary of `Beef` contents as multi-line string.
         */
        toLogString() {
          let log = "";
          log += `BEEF with ${this.bumps.length} BUMPS and ${this.txs.length} Transactions, isValid ${this.isValid().toString()}
`;
          let i = -1;
          for (const b of this.bumps) {
            i++;
            log += `  BUMP ${i}
    block: ${b.blockHeight}
    txids: [
${b.path[0].filter((n) => n.txid === true).map((n) => `      '${n.hash ?? ""}'`).join(",\n")}
    ]
`;
          }
          i = -1;
          for (const t of this.txs) {
            i++;
            log += `  TX ${i}
    txid: ${t.txid}
`;
            if (t.bumpIndex !== void 0) {
              log += `    bumpIndex: ${t.bumpIndex}
`;
            }
            if (t.isTxidOnly) {
              log += "    txidOnly\n";
            } else {
              log += `    rawTx length=${t.rawTx?.length ?? 0}
`;
            }
            if (t.inputTxids.length > 0) {
              const inputLines = t.inputTxids.map((it) => `      '${it}'`).join(",\n");
              log += `    inputs: [
${inputLines}
    ]
`;
            }
          }
          return log;
        }
        /**
         * In some circumstances it may be helpful for the BUMP MerklePaths to include
         * leaves that can be computed from row zero.
         */
        addComputedLeaves() {
          for (const bump of this.bumps) {
            for (let row = 1; row < bump.path.length; row++) {
              this.#addComputedLeavesForRow(bump, row);
            }
          }
        }
        /** Add any missing computable leaf at `row` derived from two known leaves at `row - 1`. */
        #addComputedLeavesForRow(bump, row) {
          const hashPair2 = (m) => toHex(hash256(toArray2(m, "hex").reverse()).reverse());
          for (const leafL of bump.path[row - 1]) {
            if (typeof leafL.hash !== "string" || (leafL.offset & 1) !== 0)
              continue;
            const leafR = bump.path[row - 1].find((l) => l.offset === leafL.offset + 1);
            if (leafR === void 0 || typeof leafR.hash !== "string")
              continue;
            const offsetOnRow = leafL.offset >> 1;
            if (bump.path[row].every((l) => l.offset !== offsetOnRow)) {
              bump.path[row].push({
                offset: offsetOnRow,
                // String concatenation puts the right leaf on the left of the left leaf hash
                hash: hashPair2(leafR.hash + leafL.hash)
              });
            }
          }
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/completeBoundAction.js
  function captureSharedIntrinsicState() {
    const owners = [
      Array.prototype,
      Map.prototype,
      Set.prototype,
      WeakMap.prototype,
      WeakSet.prototype,
      Object,
      Object.prototype,
      Number,
      RegExp.prototype,
      String.prototype,
      Uint8ArrayPrototype,
      typedArrayPrototype
    ];
    const snapshots = new ArrayConstructor(owners.length);
    for (let ownerIndex = 0; ownerIndex < owners.length; ownerIndex++) {
      const owner = owners[ownerIndex];
      const keys = reflectOwnKeys(owner);
      const descriptors = new ArrayConstructor(keys.length);
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        descriptors[keyIndex] = objectGetOwnPropertyDescriptor(owner, keys[keyIndex]);
      }
      snapshots[ownerIndex] = { owner, keys, descriptors };
    }
    return snapshots;
  }
  function assertSharedIntrinsicsUnchanged(snapshots) {
    for (let ownerIndex = 0; ownerIndex < snapshots.length; ownerIndex++) {
      const snapshot = snapshots[ownerIndex];
      if (reflectOwnKeys(snapshot.owner).length !== snapshot.keys.length) {
        throw new Error("Wallet callback modified shared JavaScript intrinsics");
      }
      for (let keyIndex = 0; keyIndex < snapshot.keys.length; keyIndex++) {
        const expected = snapshot.descriptors[keyIndex];
        const actual = objectGetOwnPropertyDescriptor(snapshot.owner, snapshot.keys[keyIndex]);
        if (actual == null || actual.configurable !== expected.configurable || actual.enumerable !== expected.enumerable || actual.writable !== expected.writable || !objectIs(actual.value, expected.value) || actual.get !== expected.get || actual.set !== expected.set) {
          throw new Error(`Wallet callback modified shared JavaScript intrinsics (${ownerIndex}:${StringConstructor(snapshot.keys[keyIndex])})`);
        }
      }
    }
  }
  function hasOwn(value, key) {
    return objectGetOwnPropertyDescriptor(value, key) !== void 0;
  }
  function isSafeInteger(value) {
    return numberIsSafeInteger(value);
  }
  function matches(pattern, value) {
    return reflectApply(regexpTest, pattern, [value]);
  }
  function lower(value) {
    return reflectApply(stringToLowerCase, value, []);
  }
  function toHex2(script) {
    return reflectApply(scriptToHex, script, []);
  }
  function captureTransactionIntrinsics() {
    transactionFromAtomicBEEF ??= Transaction.fromAtomicBEEF;
    transactionId ??= Transaction.prototype.id;
    transactionToAtomicBEEF ??= Transaction.prototype.toAtomicBEEF;
  }
  function parseAtomicBEEF(beef) {
    if (transactionFromAtomicBEEF == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionFromAtomicBEEF, Transaction, [beef]);
  }
  function atomicBEEF(transaction) {
    if (transactionToAtomicBEEF == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionToAtomicBEEF, transaction, [true]);
  }
  function transactionID(transaction) {
    if (transactionId == null)
      throw new Error("Transaction intrinsics are unavailable");
    return reflectApply(transactionId, transaction, ["hex"]);
  }
  function snapshotBudgetHas(budget, value) {
    return reflectApply(weakSetHas, budget.active, [value]);
  }
  function snapshotBudgetAdd(budget, value) {
    reflectApply(weakSetAdd, budget.active, [value]);
  }
  function snapshotBudgetDelete(budget, value) {
    reflectApply(weakSetDelete, budget.active, [value]);
  }
  function completedSnapshot(budget, value) {
    return reflectApply(weakMapGet, budget.completed, [value]);
  }
  function rememberSnapshot(budget, value, snapshot) {
    reflectApply(weakMapSet, budget.completed, [value, snapshot]);
  }
  function dataRecord(value, label, ignoreSymbolMetadata = false) {
    if (value == null || typeof value !== "object" || arrayIsArray(value)) {
      throw new Error(`${label} must be a plain data object`);
    }
    const prototype = objectGetPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(`${label} must be a plain data object`);
    }
    const keys = reflectOwnKeys(value);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const descriptor = objectGetOwnPropertyDescriptor(value, key);
      if (typeof key === "symbol" && ignoreSymbolMetadata) {
        if (descriptor == null || !("value" in descriptor)) {
          throw new Error(`${label} symbol metadata must be a data property`);
        }
        continue;
      }
      if (typeof key !== "string" || descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only string-keyed data properties`);
      }
    }
    return value;
  }
  function snapshotDenseByteArray(value, label, remainingByteBudget = MAX_ACTION_TRANSACTION_BYTES) {
    if (objectGetPrototypeOf(value) !== Array.prototype) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
    if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const length = lengthDescriptor.value;
    if (length > MAX_ACTION_TRANSACTION_BYTES) {
      throw new Error(`${label} exceeds the byte limit`);
    }
    const keys = reflectOwnKeys(value);
    if (keys.length !== length + 1) {
      throw new Error(`${label} must contain only dense data arrays`);
    }
    const exceedsAggregateBudget = length > remainingByteBudget;
    const snapshot = exceedsAggregateBudget ? void 0 : new ArrayConstructor(length);
    for (let index = 0; index < length; index++) {
      const descriptor = objectGetOwnPropertyDescriptor(value, StringConstructor(index));
      if (descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      if (!numberIsInteger(descriptor.value) || descriptor.value < 0 || descriptor.value > 255) {
        return void 0;
      }
      if (snapshot !== void 0)
        snapshot[index] = descriptor.value;
    }
    if (exceedsAggregateBudget)
      throw new Error(`${label} exceeds the aggregate byte limit`);
    return snapshot;
  }
  function snapshotUint8Array(value, label, remainingByteBudget = MAX_ACTION_TRANSACTION_BYTES) {
    if (typedArrayBufferGetter == null || typedArrayLengthGetter == null || typedArrayTagGetter == null) {
      return void 0;
    }
    let buffer;
    let length;
    let tag;
    try {
      buffer = reflectApply(typedArrayBufferGetter, value, []);
      length = reflectApply(typedArrayLengthGetter, value, []);
      tag = reflectApply(typedArrayTagGetter, value, []);
    } catch {
      return void 0;
    }
    if (tag !== "Uint8Array")
      return void 0;
    if (sharedArrayBufferByteLengthGetter != null) {
      let shared = false;
      try {
        reflectApply(sharedArrayBufferByteLengthGetter, buffer, []);
        shared = true;
      } catch {
      }
      if (shared)
        throw new Error(`${label} must not use shared byte storage`);
    }
    if (length > MAX_ACTION_TRANSACTION_BYTES) {
      throw new Error(`${label} exceeds the byte limit`);
    }
    if (length > remainingByteBudget) {
      throw new Error(`${label} exceeds the aggregate byte limit`);
    }
    const snapshot = new Uint8ArrayConstructor(length);
    try {
      reflectApply(typedArraySet, snapshot, [value]);
    } catch {
      throw new Error(`${label} must contain only intrinsic byte arrays`);
    }
    return snapshot;
  }
  function snapshotActionData(value, label, depth = 0, budget = {
    nodes: 0,
    active: /* @__PURE__ */ new WeakSet(),
    completed: /* @__PURE__ */ new WeakMap(),
    copiedBytes: 0
  }, ignoreSymbolMetadata = false) {
    if (depth > MAX_ACTION_GRAPH_DEPTH)
      throw new Error(`${label} exceeds the depth limit`);
    budget.nodes += 1;
    if (budget.nodes > MAX_ACTION_GRAPH_NODES)
      throw new Error(`${label} exceeds the node limit`);
    if (value === null || value === void 0 || typeof value === "string" || typeof value === "boolean") {
      return value;
    }
    if (typeof value === "number") {
      if (!numberIsFinite(value) || objectIs(value, -0)) {
        throw new Error(`${label} contains an ambiguous number`);
      }
      return value;
    }
    if (typeof value !== "object")
      throw new Error(`${label} contains unsupported data`);
    if (snapshotBudgetHas(budget, value))
      throw new Error(`${label} contains a cycle`);
    const completed = completedSnapshot(budget, value);
    if (completed !== void 0)
      return completed;
    const byteView = snapshotUint8Array(value, label, MAX_ACTION_TRANSACTION_BYTES - budget.copiedBytes);
    if (byteView !== void 0) {
      budget.copiedBytes += byteView.length;
      reflectApply(weakSetAdd, ownedByteArrays, [byteView]);
      rememberSnapshot(budget, value, byteView);
      return byteView;
    }
    if (arrayIsArray(value)) {
      const byteSnapshot = snapshotDenseByteArray(value, label, MAX_ACTION_TRANSACTION_BYTES - budget.copiedBytes);
      if (byteSnapshot !== void 0) {
        budget.copiedBytes += byteSnapshot.length;
        reflectApply(weakSetAdd, ownedByteArrays, [byteSnapshot]);
        rememberSnapshot(budget, value, byteSnapshot);
        return byteSnapshot;
      }
      const lengthDescriptor = objectGetOwnPropertyDescriptor(value, "length");
      if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      if (lengthDescriptor.value > MAX_ACTION_GRAPH_NODES) {
        throw new Error(`${label} exceeds the node limit`);
      }
    }
    snapshotBudgetAdd(budget, value);
    if (arrayIsArray(value)) {
      const descriptors2 = objectGetOwnPropertyDescriptors(value);
      const lengthDescriptor = descriptors2["length"];
      if (lengthDescriptor == null || !("value" in lengthDescriptor) || !isSafeInteger(lengthDescriptor.value) || lengthDescriptor.value < 0 || lengthDescriptor.value > MAX_ACTION_GRAPH_NODES) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      const length = lengthDescriptor.value;
      const descriptorKeys = reflectOwnKeys(descriptors2);
      if (descriptorKeys.length !== length + 1) {
        throw new Error(`${label} must contain only dense data arrays`);
      }
      for (let keyIndex = 0; keyIndex < descriptorKeys.length; keyIndex++) {
        const key = descriptorKeys[keyIndex];
        if (key === "length")
          continue;
        if (typeof key !== "string" || !matches(canonicalArrayIndexPattern, key) || NumberConstructor(key) >= length) {
          throw new Error(`${label} must contain only dense data arrays`);
        }
      }
      const out2 = new ArrayConstructor(length);
      for (let index = 0; index < length; index++) {
        const key = StringConstructor(index);
        const descriptor = descriptors2[key];
        if (descriptor == null || !descriptor.enumerable || !("value" in descriptor)) {
          throw new Error(`${label} must contain only dense data arrays`);
        }
        out2[index] = snapshotActionData(descriptor.value, `${label}[${index}]`, depth + 1, budget);
      }
      snapshotBudgetDelete(budget, value);
      rememberSnapshot(budget, value, out2);
      return out2;
    }
    const source = dataRecord(value, label, ignoreSymbolMetadata);
    if (snapshotBudgetHas(budget, source) && source !== value) {
      throw new Error(`${label} contains a cycle`);
    }
    const out = objectCreate(null);
    const descriptors = objectGetOwnPropertyDescriptors(source);
    const keys = objectKeys(descriptors);
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex];
      const descriptor = descriptors[key];
      if (!descriptor.enumerable || !("value" in descriptor)) {
        throw new Error(`${label} must contain only string-keyed data properties`);
      }
      objectDefineProperty(out, key, {
        value: snapshotActionData(descriptor.value, `${label}.${key}`, depth + 1, budget),
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    snapshotBudgetDelete(budget, value);
    rememberSnapshot(budget, value, out);
    return out;
  }
  function bytes2(value, label) {
    if (value != null && typeof value === "object") {
      const isOwned = reflectApply(weakSetHas, ownedByteArrays, [value]);
      if (isOwned && arrayIsArray(value)) {
        const length = objectGetOwnPropertyDescriptor(value, "length")?.value;
        if (typeof length !== "number" || length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return value;
      }
      if (isOwned && typedArrayLengthGetter != null) {
        let length;
        try {
          length = reflectApply(typedArrayLengthGetter, value, []);
        } catch {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        if (length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return value;
      }
      const byteView2 = snapshotUint8Array(value, label);
      if (byteView2 !== void 0) {
        if (byteView2.length === 0) {
          throw new Error(`${label} must be a bounded non-empty byte array`);
        }
        return byteView2;
      }
    }
    if (!arrayIsArray(value)) {
      throw new Error(`${label} must be a bounded non-empty byte array`);
    }
    const snapshot = snapshotDenseByteArray(value, label);
    if (snapshot == null || snapshot.length === 0) {
      throw new Error(`${label} must be a bounded non-empty byte array`);
    }
    const byteView = new Uint8ArrayConstructor(snapshot.length);
    for (let index = 0; index < snapshot.length; index++) {
      byteView[index] = snapshot[index];
    }
    return byteView;
  }
  function txid(value, label) {
    if (typeof value !== "string" || !matches(txidPattern, value)) {
      throw new Error(`${label} must be a 32-byte hexadecimal transaction ID`);
    }
    return lower(value);
  }
  function hex(value, label) {
    if (typeof value !== "string" || !matches(evenHexPattern, value)) {
      throw new Error(`${label} must be an even-length hexadecimal string`);
    }
    return lower(value);
  }
  function outpoint(value, label) {
    if (typeof value !== "string")
      throw new Error(`${label} must be a canonical outpoint`);
    const match = reflectApply(regexpExec, canonicalOutpointPattern, [
      value
    ]);
    if (match == null)
      throw new Error(`${label} must be a canonical outpoint`);
    const outputIndex = NumberConstructor(match[2]);
    if (!isSafeInteger(outputIndex) || outputIndex > 4294967295) {
      throw new Error(`${label} must be a canonical outpoint`);
    }
    return `${lower(match[1])}.${outputIndex}`;
  }
  function inputOutpoint(transaction, inputIndex) {
    const input = transaction.inputs[inputIndex];
    if (input == null || !isSafeInteger(input.sourceOutputIndex) || input.sourceOutputIndex < 0 || input.sourceOutputIndex > 4294967295) {
      throw new Error("Wallet transaction input is malformed");
    }
    const embeddedTxid = input.sourceTransaction == null ? void 0 : transactionID(input.sourceTransaction);
    if (input.sourceTXID !== void 0 && embeddedTxid !== void 0 && txid(input.sourceTXID, "Wallet input source TXID") !== txid(embeddedTxid, "Wallet input source transaction ID")) {
      throw new Error("Wallet transaction input source mismatch");
    }
    return `${txid(input.sourceTXID ?? embeddedTxid, "Wallet input source TXID")}.${input.sourceOutputIndex}`;
  }
  function satoshis(value, label) {
    if (typeof value !== "number" || !isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS2) {
      throw new Error(`${label} must be a valid satoshi amount`);
    }
    return value;
  }
  function addSatoshis(total, value, label) {
    const next = total + value;
    if (!isSafeInteger(next) || next > MAX_SATOSHIS2) {
      throw new Error(`${label} exceeds the maximum transaction value`);
    }
    return next;
  }
  function inputSatoshis(transaction, inputIndex) {
    const input = transaction.inputs[inputIndex];
    const sourceOutput = input?.sourceTransaction?.outputs[input.sourceOutputIndex];
    if (sourceOutput == null) {
      throw new Error("Wallet signable transaction omitted an input source output");
    }
    return satoshis(sourceOutput.satoshis, `Wallet input ${inputIndex} source output`);
  }
  function normalizeAdditionalOutputAuthorizations(value) {
    const snapshot = snapshotActionData(value, "Additional output authorizations");
    if (!arrayIsArray(snapshot))
      throw new Error("Additional output authorizations must be an array");
    const result = new ArrayConstructor(snapshot.length);
    for (let index = 0; index < snapshot.length; index++) {
      const entry = dataRecord(snapshot[index], `Additional output authorization ${index}`);
      const keys = objectKeys(entry);
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
        if (keys[keyIndex] !== "outputIndex" && keys[keyIndex] !== "lockingScript" && keys[keyIndex] !== "satoshis") {
          throw new Error(`Additional output authorization ${index} field ${keyIndex} must be index, script or amount`);
        }
      }
      const outputIndex = entry.outputIndex;
      if (!isSafeInteger(outputIndex) || outputIndex < 0 || outputIndex > 4294967295) {
        throw new Error("Additional output authorization index is invalid");
      }
      result[index] = {
        outputIndex,
        lockingScript: hex(entry.lockingScript, `Additional output authorization ${index} script`),
        satoshis: satoshis(entry.satoshis, `Additional output authorization ${index} amount`)
      };
    }
    return result;
  }
  function bindRequestedAction(args, candidate, outputSatoshisRanges, additionalOutputs, trustedRequestedInputSatoshis) {
    if (candidate.version !== (args.version ?? 1)) {
      throw new Error("Wallet transaction substituted the requested version");
    }
    if (candidate.lockTime !== (args.lockTime ?? 0)) {
      throw new Error("Wallet transaction substituted the requested lock time");
    }
    const candidateOutpoints = new ArrayConstructor(candidate.inputs.length);
    const candidateOutpointSet = objectCreate(null);
    for (let index = 0; index < candidate.inputs.length; index++) {
      const candidateOutpoint = inputOutpoint(candidate, index);
      if (hasOwn(candidateOutpointSet, candidateOutpoint)) {
        throw new Error("Wallet transaction contains a duplicate input outpoint");
      }
      candidateOutpoints[index] = candidateOutpoint;
      candidateOutpointSet[candidateOutpoint] = true;
    }
    const indexes = [];
    const requestedOutpoints = objectCreate(null);
    for (let index = 0; index < (args.inputs?.length ?? 0); index++) {
      const requested = args.inputs[index];
      const requestedOutpoint = outpoint(requested.outpoint, `Requested input ${index} outpoint`);
      if (hasOwn(requestedOutpoints, requestedOutpoint)) {
        throw new Error("Action requests the same input outpoint more than once");
      }
      requestedOutpoints[requestedOutpoint] = true;
      let candidateIndex = -1;
      for (let index2 = 0; index2 < candidateOutpoints.length; index2++) {
        if (candidateOutpoints[index2] !== requestedOutpoint)
          continue;
        if (candidateIndex !== -1) {
          throw new Error("Wallet transaction does not contain each requested input exactly once");
        }
        candidateIndex = index2;
      }
      if (candidateIndex === -1) {
        throw new Error("Wallet transaction does not contain each requested input exactly once");
      }
      indexes[index] = candidateIndex;
      if ((candidate.inputs[candidateIndex].sequence ?? 4294967295) !== (requested.sequenceNumber ?? 4294967295)) {
        throw new Error("Wallet transaction substituted a requested input sequence");
      }
      const candidateUnlockingScript = candidate.inputs[candidateIndex].unlockingScript;
      if (requested.unlockingScript !== void 0 && (candidateUnlockingScript == null ? void 0 : lower(toHex2(candidateUnlockingScript))) !== hex(requested.unlockingScript, `Requested input ${index} unlocking script`)) {
        throw new Error("Wallet transaction substituted a requested unlocking script");
      }
    }
    const candidateOutputs = new ArrayConstructor(candidate.outputs.length);
    for (let index = 0; index < candidate.outputs.length; index++) {
      const output = candidate.outputs[index];
      candidateOutputs[index] = {
        satoshis: satoshis(output.satoshis, `Wallet output ${index}`),
        lockingScript: lower(toHex2(output.lockingScript))
      };
    }
    const matchedCandidateOutputs = new ArrayConstructor(candidateOutputs.length);
    const preserveOutputOrder = args.options?.randomizeOutputs === false;
    let requestedOutputValue = 0;
    const matchRequestedOutput = (index, range) => {
      const output = args.outputs[index];
      const lockingScript = hex(output.lockingScript, `Requested output ${index} locking script`);
      const requestedSatoshis = satoshis(output.satoshis, `Requested output ${index}`);
      if (preserveOutputOrder) {
        const candidateOutput = candidateOutputs[index];
        const amountMatches = candidateOutput != null && (range == null ? candidateOutput.satoshis === requestedSatoshis : candidateOutput.satoshis >= range.minimumSatoshis && candidateOutput.satoshis <= range.maximumSatoshis);
        if (candidateOutput == null || candidateOutput.lockingScript !== lockingScript || !amountMatches) {
          throw new Error("Wallet transaction substituted a requested output position");
        }
        matchedCandidateOutputs[index] = true;
        requestedOutputValue = addSatoshis(requestedOutputValue, candidateOutput.satoshis, "Requested output value");
        return;
      }
      let matchedIndex = -1;
      for (let candidateIndex = 0; candidateIndex < candidateOutputs.length; candidateIndex++) {
        const candidateOutput = candidateOutputs[candidateIndex];
        if (matchedCandidateOutputs[candidateIndex] === true || candidateOutput.lockingScript !== lockingScript)
          continue;
        const amountMatches = range == null ? candidateOutput.satoshis === requestedSatoshis : candidateOutput.satoshis >= range.minimumSatoshis && candidateOutput.satoshis <= range.maximumSatoshis;
        if (!amountMatches)
          continue;
        if (range == null) {
          matchedIndex = candidateIndex;
          break;
        }
        if (matchedIndex !== -1) {
          throw new Error("Wallet transaction omitted or substituted a requested output");
        }
        matchedIndex = candidateIndex;
      }
      if (matchedIndex === -1) {
        throw new Error("Wallet transaction omitted or substituted a requested output");
      }
      matchedCandidateOutputs[matchedIndex] = true;
      requestedOutputValue = addSatoshis(requestedOutputValue, candidateOutputs[matchedIndex].satoshis, "Requested output value");
    };
    for (let index = 0; index < (args.outputs?.length ?? 0); index++) {
      if (outputSatoshisRanges[index] === void 0)
        matchRequestedOutput(index);
    }
    for (let index = 0; index < (args.outputs?.length ?? 0); index++) {
      const range = outputSatoshisRanges[index];
      if (range != null)
        matchRequestedOutput(index, range);
    }
    let explicitInputValue = 0;
    const explicitInputIndexes = new ArrayConstructor(candidate.inputs.length);
    for (let requestedIndex = 0; requestedIndex < indexes.length; requestedIndex++) {
      const inputIndex = indexes[requestedIndex];
      explicitInputIndexes[inputIndex] = true;
      explicitInputValue = addSatoshis(explicitInputValue, trustedRequestedInputSatoshis?.[requestedIndex] ?? inputSatoshis(candidate, inputIndex), "Requested input value");
    }
    let walletInputValue = 0;
    for (let inputIndex = 0; inputIndex < candidate.inputs.length; inputIndex++) {
      if (explicitInputIndexes[inputIndex] === true)
        continue;
      walletInputValue = addSatoshis(walletInputValue, inputSatoshis(candidate, inputIndex), "Wallet-added input value");
    }
    let candidateOutputValue = 0;
    for (let index = 0; index < candidateOutputs.length; index++) {
      candidateOutputValue = addSatoshis(candidateOutputValue, candidateOutputs[index].satoshis, "Wallet output value");
    }
    const candidateInputValue = addSatoshis(explicitInputValue, walletInputValue, "Wallet input value");
    if (candidateOutputValue > candidateInputValue) {
      throw new Error("Wallet signable transaction spends more than its inputs");
    }
    let authorizedAdditionalOutputValue = 0;
    for (let index = 0; index < additionalOutputs.length; index++) {
      const authorization = additionalOutputs[index];
      const output = authorization.outputIndex < candidateOutputs.length ? candidateOutputs[authorization.outputIndex] : void 0;
      if (output == null || matchedCandidateOutputs[authorization.outputIndex] === true || output.lockingScript !== authorization.lockingScript || output.satoshis !== authorization.satoshis) {
        throw new Error(`Wallet transaction omitted, duplicated or substituted an authorized additional output at authorization ${index}`);
      }
      matchedCandidateOutputs[authorization.outputIndex] = true;
      authorizedAdditionalOutputValue = addSatoshis(authorizedAdditionalOutputValue, output.satoshis, "Authorized additional output value");
    }
    const additionalOutputValue = candidateOutputValue - requestedOutputValue - authorizedAdditionalOutputValue;
    if (additionalOutputValue > walletInputValue) {
      throw new Error("Wallet used a requested input to fund an unrequested output");
    }
    return indexes;
  }
  function assertSameTemplate(signable, signed) {
    if (signable.version !== signed.version || signable.lockTime !== signed.lockTime || signable.inputs.length !== signed.inputs.length || signable.outputs.length !== signed.outputs.length) {
      throw new Error("Wallet signed transaction substituted the authorized template");
    }
    for (let index = 0; index < signable.inputs.length; index++) {
      if (inputOutpoint(signable, index) !== inputOutpoint(signed, index) || (signable.inputs[index].sequence ?? 4294967295) !== (signed.inputs[index].sequence ?? 4294967295)) {
        throw new Error("Wallet signed transaction substituted an authorized input");
      }
    }
    for (let index = 0; index < signable.outputs.length; index++) {
      if (signable.outputs[index].satoshis !== signed.outputs[index].satoshis || toHex2(signable.outputs[index].lockingScript) !== toHex2(signed.outputs[index].lockingScript)) {
        throw new Error("Wallet signed transaction substituted an authorized output");
      }
    }
  }
  async function abortBestEffort(wallet, reference, originator) {
    try {
      await wallet.abortAction({ reference }, originator);
    } catch {
    }
  }
  async function completeBoundAction(wallet, createArgs, options = {}, originator, trustedRequestedInputSatoshis) {
    captureTransactionIntrinsics();
    const sharedIntrinsicState = captureSharedIntrinsicState();
    const authorizedArgs = snapshotActionData(createArgs, "Create action arguments");
    const walletArgs = snapshotActionData(authorizedArgs, "Create action arguments");
    const requestedInputs = authorizedArgs.inputs ?? [];
    let ownedTrustedRequestedInputSatoshis;
    if (trustedRequestedInputSatoshis !== void 0) {
      const snapshot = snapshotActionData(trustedRequestedInputSatoshis, "Trusted requested input satoshis");
      if (!arrayIsArray(snapshot) || snapshot.length !== requestedInputs.length) {
        throw new Error("Trusted requested input satoshis must match the requested inputs");
      }
      const amounts = new ArrayConstructor(snapshot.length);
      for (let index = 0; index < snapshot.length; index++) {
        amounts[index] = satoshis(snapshot[index], `Trusted requested input ${index}`);
      }
      ownedTrustedRequestedInputSatoshis = amounts;
    }
    const boundOptions = dataRecord(options, "Bound action options");
    const boundOptionKeys = objectKeys(boundOptions);
    for (let keyIndex = 0; keyIndex < boundOptionKeys.length; keyIndex++) {
      const key = boundOptionKeys[keyIndex];
      if (key !== "inputSigners" && key !== "outputSatoshisRanges" && key !== "authorizeAdditionalOutputs") {
        throw new Error(`Unknown bound action option "${key}"`);
      }
    }
    const authorizeAdditionalOutputs = objectGetOwnPropertyDescriptor(boundOptions, "authorizeAdditionalOutputs")?.value;
    if (authorizeAdditionalOutputs !== void 0 && typeof authorizeAdditionalOutputs !== "function") {
      throw new Error("Additional output authorization must be a caller-installed function");
    }
    const inputSignersValue = objectGetOwnPropertyDescriptor(boundOptions, "inputSigners")?.value;
    const inputSigners = dataRecord(inputSignersValue ?? {}, "Input signers");
    const normalizedSigners = objectCreate(null);
    let normalizedSignerCount = 0;
    const inputSignerKeys = objectKeys(inputSigners);
    for (let keyIndex = 0; keyIndex < inputSignerKeys.length; keyIndex++) {
      const key = inputSignerKeys[keyIndex];
      const signer = objectGetOwnPropertyDescriptor(inputSigners, key)?.value;
      const normalized = outpoint(key, "Input signer outpoint");
      if (hasOwn(normalizedSigners, normalized) || typeof signer !== "function") {
        throw new Error("Input signers must uniquely identify requested outpoints");
      }
      normalizedSigners[normalized] = signer;
      normalizedSignerCount++;
    }
    const rangeValue = objectGetOwnPropertyDescriptor(boundOptions, "outputSatoshisRanges")?.value;
    const ranges = dataRecord(rangeValue ?? {}, "Output satoshi ranges");
    const normalizedRanges = new ArrayConstructor(authorizedArgs.outputs?.length ?? 0);
    const rangeKeys = objectKeys(ranges);
    for (let keyIndex = 0; keyIndex < rangeKeys.length; keyIndex++) {
      const key = rangeKeys[keyIndex];
      const value = objectGetOwnPropertyDescriptor(ranges, key)?.value;
      if (!matches(canonicalArrayIndexPattern, key)) {
        throw new Error("Output satoshi ranges must identify requested output indexes");
      }
      const index = NumberConstructor(key);
      if (!isSafeInteger(index) || index >= (authorizedArgs.outputs?.length ?? 0)) {
        throw new Error("Output satoshi ranges must identify requested output indexes");
      }
      const range = dataRecord(value, `Output satoshi range ${index}`);
      const outputRangeKeys = objectKeys(range);
      for (let rangeKeyIndex = 0; rangeKeyIndex < outputRangeKeys.length; rangeKeyIndex++) {
        const rangeKey = outputRangeKeys[rangeKeyIndex];
        if (rangeKey !== "minimumSatoshis" && rangeKey !== "maximumSatoshis") {
          throw new Error(`Unknown output satoshi range option "${rangeKey}"`);
        }
      }
      const minimumSatoshis = satoshis(objectGetOwnPropertyDescriptor(range, "minimumSatoshis")?.value, `Output satoshi range ${index} minimum`);
      const maximumSatoshis = satoshis(objectGetOwnPropertyDescriptor(range, "maximumSatoshis")?.value, `Output satoshi range ${index} maximum`);
      if (minimumSatoshis > maximumSatoshis) {
        throw new Error(`Output satoshi range ${index} minimum exceeds its maximum`);
      }
      normalizedRanges[index] = { minimumSatoshis, maximumSatoshis };
    }
    const rawCreateResult = await wallet.createAction({
      ...walletArgs,
      options: {
        ...walletArgs.options,
        signAndProcess: false,
        returnTXIDOnly: false
      }
    }, originator);
    assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
    const createResult = dataRecord(snapshotActionData(rawCreateResult, "Wallet createAction result", 0, void 0, true), "Wallet createAction result", true);
    assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
    const signable = dataRecord(objectGetOwnPropertyDescriptor(createResult, "signableTransaction")?.value, "Wallet signable transaction");
    const reference = objectGetOwnPropertyDescriptor(signable, "reference")?.value;
    if (typeof reference !== "string" || reference.length === 0 || reference.length > 4096 || !matches(canonicalBase64Pattern, reference)) {
      throw new Error("Wallet signable transaction reference is invalid");
    }
    try {
      const additionalOutputs = authorizeAdditionalOutputs === void 0 ? [] : normalizeAdditionalOutputAuthorizations(authorizeAdditionalOutputs(rawCreateResult));
      assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
      const partial = parseAtomicBEEF(bytes2(objectGetOwnPropertyDescriptor(signable, "tx")?.value, "Wallet signable transaction"));
      const boundInputIndexes = bindRequestedAction(authorizedArgs, partial, normalizedRanges, additionalOutputs, ownedTrustedRequestedInputSatoshis);
      const authorizedPartial = parseAtomicBEEF(atomicBEEF(partial));
      const spends = {};
      const expectedScripts = new ArrayConstructor(partial.inputs.length);
      const expectedScriptIndexes = new ArrayConstructor();
      const usedSigners = objectCreate(null);
      let usedSignerCount = 0;
      for (let index = 0; index < requestedInputs.length; index++) {
        const requested = requestedInputs[index];
        const requestedOutpoint = outpoint(requested.outpoint, `Requested input ${index} outpoint`);
        const inputIndex = boundInputIndexes[index];
        if (requested.unlockingScript !== void 0) {
          expectedScripts[inputIndex] = hex(requested.unlockingScript, `Requested input ${index} unlocking script`);
          expectedScriptIndexes[expectedScriptIndexes.length] = inputIndex;
          continue;
        }
        const signer = objectGetOwnPropertyDescriptor(normalizedSigners, requestedOutpoint)?.value;
        if (requested.unlockingScriptLength === void 0 || signer == null) {
          throw new Error(`Requested input ${index} has no authorized signer`);
        }
        const signed2 = await signer(partial, inputIndex);
        assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
        assertSameTemplate(authorizedPartial, partial);
        const unlockingScript = hex(typeof signed2 === "string" ? signed2 : toHex2(signed2), `Requested input ${index} signed unlocking script`);
        spends[inputIndex] = { unlockingScript };
        expectedScripts[inputIndex] = unlockingScript;
        expectedScriptIndexes[expectedScriptIndexes.length] = inputIndex;
        if (!hasOwn(usedSigners, requestedOutpoint)) {
          usedSigners[requestedOutpoint] = true;
          usedSignerCount++;
        }
      }
      if (usedSignerCount !== normalizedSignerCount) {
        throw new Error("An input signer does not match a requested signable input");
      }
      const signOptions = {
        acceptDelayedBroadcast: authorizedArgs.options?.acceptDelayedBroadcast,
        returnTXIDOnly: false,
        noSend: authorizedArgs.options?.noSend,
        sendWith: authorizedArgs.options?.sendWith
      };
      const rawSignResult = await wallet.signAction({ reference, spends, options: signOptions }, originator);
      assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
      const signResult = dataRecord(snapshotActionData(rawSignResult, "Wallet signAction result", 0, void 0, true), "Wallet signAction result", true);
      assertSharedIntrinsicsUnchanged(sharedIntrinsicState);
      const signed = parseAtomicBEEF(bytes2(objectGetOwnPropertyDescriptor(signResult, "tx")?.value, "Wallet signed transaction"));
      assertSameTemplate(partial, signed);
      for (let index = 0; index < expectedScriptIndexes.length; index++) {
        const inputIndex = expectedScriptIndexes[index];
        const expected = expectedScripts[inputIndex];
        const unlockingScript = signed.inputs[inputIndex]?.unlockingScript;
        if (unlockingScript == null || lower(toHex2(unlockingScript)) !== expected) {
          throw new Error("Wallet signed transaction substituted an authorized unlocking script");
        }
      }
      const signedTxid = objectGetOwnPropertyDescriptor(signResult, "txid")?.value;
      if (signedTxid !== void 0 && txid(signedTxid, "Wallet signed transaction ID") !== lower(transactionID(signed))) {
        throw new Error("Wallet signed transaction ID does not match its transaction data");
      }
      return signed;
    } catch (error) {
      await abortBestEffort(wallet, reference, originator);
      throw error;
    }
  }
  var BOUND_ACTION_OUTPUT_AUTHORIZATION_VERSION, MAX_ACTION_TRANSACTION_BYTES, MAX_SATOSHIS2, MAX_ACTION_GRAPH_DEPTH, MAX_ACTION_GRAPH_NODES, arrayIsArray, ArrayConstructor, NumberConstructor, StringConstructor, numberIsFinite, numberIsInteger, numberIsSafeInteger, objectIs, objectCreate, objectDefineProperty, objectGetOwnPropertyDescriptor, objectGetOwnPropertyDescriptors, objectGetPrototypeOf, objectKeys, reflectApply, reflectOwnKeys, regexpExec, regexpTest, stringToLowerCase, Uint8ArrayConstructor, Uint8ArrayPrototype, typedArrayPrototype, typedArrayBufferGetter, typedArrayLengthGetter, typedArrayTagGetter, typedArraySet, sharedArrayBufferByteLengthGetter, weakMapGet, weakMapSet, weakSetAdd, weakSetDelete, weakSetHas, ownedByteArrays, scriptToHex, transactionFromAtomicBEEF, transactionId, transactionToAtomicBEEF, canonicalArrayIndexPattern, canonicalOutpointPattern, canonicalBase64Pattern, evenHexPattern, txidPattern;
  var init_completeBoundAction = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/completeBoundAction.js"() {
      init_Transaction();
      init_Script();
      BOUND_ACTION_OUTPUT_AUTHORIZATION_VERSION = 1;
      MAX_ACTION_TRANSACTION_BYTES = 256 * 1024 * 1024;
      MAX_SATOSHIS2 = 21e14;
      MAX_ACTION_GRAPH_DEPTH = 64;
      MAX_ACTION_GRAPH_NODES = 1e6;
      arrayIsArray = Array.isArray;
      ArrayConstructor = Array;
      NumberConstructor = Number;
      StringConstructor = String;
      numberIsFinite = Number.isFinite;
      numberIsInteger = Number.isInteger;
      numberIsSafeInteger = Number.isSafeInteger;
      objectIs = Object.is;
      objectCreate = Object.create;
      objectDefineProperty = Object.defineProperty;
      objectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      objectGetOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
      objectGetPrototypeOf = Object.getPrototypeOf;
      objectKeys = Object.keys;
      reflectApply = Reflect.apply;
      reflectOwnKeys = Reflect.ownKeys;
      regexpExec = RegExp.prototype.exec;
      regexpTest = RegExp.prototype.test;
      stringToLowerCase = String.prototype.toLowerCase;
      Uint8ArrayConstructor = Uint8Array;
      Uint8ArrayPrototype = Uint8Array.prototype;
      typedArrayPrototype = objectGetPrototypeOf(Uint8ArrayPrototype);
      typedArrayBufferGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, "buffer")?.get;
      typedArrayLengthGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, "length")?.get;
      typedArrayTagGetter = objectGetOwnPropertyDescriptor(typedArrayPrototype, Symbol.toStringTag)?.get;
      typedArraySet = Uint8ArrayPrototype.set;
      sharedArrayBufferByteLengthGetter = typeof SharedArrayBuffer === "undefined" ? void 0 : objectGetOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength")?.get;
      weakMapGet = WeakMap.prototype.get;
      weakMapSet = WeakMap.prototype.set;
      weakSetAdd = WeakSet.prototype.add;
      weakSetDelete = WeakSet.prototype.delete;
      weakSetHas = WeakSet.prototype.has;
      ownedByteArrays = /* @__PURE__ */ new WeakSet();
      scriptToHex = Script.prototype.toHex;
      canonicalArrayIndexPattern = /^(?:0|[1-9]\d*)$/;
      canonicalOutpointPattern = /^([0-9a-f]{64})\.(0|[1-9]\d*)$/i;
      canonicalBase64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
      evenHexPattern = /^(?:[0-9a-f]{2})*$/i;
      txidPattern = /^[0-9a-f]{64}$/i;
      completeBoundAction.outputAuthorizationVersion = BOUND_ACTION_OUTPUT_AUTHORIZATION_VERSION;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/TransactionEvidence.js
  var TransactionEvidenceError, defaultTransactionEvidenceLimits;
  var init_TransactionEvidence = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/TransactionEvidence.js"() {
      TransactionEvidenceError = class extends Error {
        code;
        constructor(code) {
          super(`Transaction evidence: ${code}`);
          this.code = code;
          this.name = "TransactionEvidenceError";
        }
      };
      defaultTransactionEvidenceLimits = Object.freeze({
        candidateBytes: 1024 * 1024,
        retainedBytes: 16 * 1024 * 1024,
        transactions: 256,
        inputs: 4096,
        scriptBytes: 256 * 1024,
        scriptMemoryBytes: 16 * 1024 * 1024,
        candidatesPerTransaction: 8,
        pendingTransactions: 32,
        concurrentTransactions: 4,
        pendingChainCalls: 8,
        consumers: 128,
        cacheEntries: 128,
        cacheAgeMs: 6e4,
        attemptTimeoutMs: 5e3,
        requestTimeoutMs: 15e3
      });
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/EvidenceScriptWork.js
  function binding(params) {
    const tx = params.tx;
    const sources = tx.inputs.map((input) => {
      const source = input.sourceTransaction;
      const output = source?.outputs[input.sourceOutputIndex];
      if (source === void 0 || output === void 0)
        throw new TransactionEvidenceError("invalid-evidence");
      return [
        source.id("hex"),
        input.sourceOutputIndex,
        output.satoshis,
        output.lockingScript.toHex()
      ];
    });
    return toHex(sha256(toArray2(JSON.stringify([
      tx.toHex(),
      sources,
      params.blockHeight,
      params.consensus,
      params.verifyFlags,
      params.memoryLimit
    ]), "utf8")));
  }
  function evidenceScriptScope(tx) {
    return scopes.get(tx);
  }
  function scopedScriptBackend(scope, backend) {
    return {
      supportsMemoryLimit: backend.supportsMemoryLimit,
      shouldVerifyScripts: backend.shouldVerifyScripts === void 0 ? void 0 : (params) => {
        scope.check();
        const key = binding(params);
        const ready = backend.shouldVerifyScripts(params);
        scope.check();
        if (binding(params) !== key)
          throw new TransactionEvidenceError("invalid-evidence");
        return ready;
      },
      verifyScripts: async (params) => (await scope.work.batch(scope, [params], backend))[0],
      verifyScriptsBatch: async (params) => await scope.work.batch(scope, params, backend)
    };
  }
  var scopes;
  var init_EvidenceScriptWork = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/EvidenceScriptWork.js"() {
      init_Hash();
      init_utils();
      init_TransactionEvidence();
      scopes = /* @__PURE__ */ new WeakMap();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/Transaction.js
  function transactionSerializationIdentity(transaction) {
    return transaction[serializedBytes2]();
  }
  function cacheKnownTransactionId(transaction, txid2) {
    transaction[knownId](txid2);
  }
  function requireSatoshiAmount(value, label) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value > MAX_SATOSHIS3) {
      throw new RangeError(`${label} must be a non-negative safe integer no greater than 21e14.`);
    }
    return value;
  }
  function addSatoshiAmount(total, value, label) {
    const sum = total + value;
    if (!Number.isSafeInteger(sum) || sum > MAX_SATOSHIS3) {
      throw new RangeError(`${label} exceeds the maximum valid monetary range.`);
    }
    return sum;
  }
  function requireUInt322(value, label) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 4294967295) {
      throw new RangeError(`${label} must be an unsigned 32-bit integer.`);
    }
    return value;
  }
  function requireTXID(value, label) {
    if (typeof value !== "string" || !/^[0-9a-fA-F]{64}$/.test(value)) {
      throw new TypeError(`${label} must be a 32-byte hexadecimal transaction ID.`);
    }
    return value.toLowerCase();
  }
  function equalBytes(left, right) {
    if (left === void 0 || right === void 0)
      return left === right;
    if (left.length !== right.length)
      return false;
    for (let index = 0; index < left.length; index++) {
      if (left[index] !== right[index])
        return false;
    }
    return true;
  }
  var serializedBytes2, knownId, POST_CHRONICLE_HEIGHT_FALLBACK, MAX_SATOSHIS3, MAX_EF_SOURCE_OUTPUT_INDEX, Transaction;
  var init_Transaction = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/Transaction.js"() {
      init_UnlockingScript();
      init_LockingScript();
      init_Script();
      init_utils();
      init_Hash();
      init_LivePolicy();
      init_Broadcaster();
      init_MerklePath();
      init_Spend();
      init_DefaultBroadcaster();
      init_DefaultChainTracker();
      init_Beef();
      init_P2PKH();
      init_completeBoundAction();
      init_TransactionSignature();
      init_Random();
      init_ScriptVerificationBackend();
      init_EvidenceScriptWork();
      serializedBytes2 = /* @__PURE__ */ Symbol();
      knownId = /* @__PURE__ */ Symbol();
      POST_CHRONICLE_HEIGHT_FALLBACK = 943816;
      MAX_SATOSHIS3 = 21e14;
      MAX_EF_SOURCE_OUTPUT_INDEX = 1e6;
      Transaction = class _Transaction {
        version;
        inputs;
        outputs;
        lockTime;
        metadata;
        merklePath;
        #cachedHash;
        #cachedIdHex;
        #rawBytesCache;
        #efBytesCache;
        #hexCache;
        #activeSignatureHashCache;
        #rawCacheState;
        /**
         * Returns the transaction-wide signature hash cache active during signing.
         * Callers outside a signing operation receive an isolated cache.
         *
         * @internal
         */
        getSignatureHashCache() {
          return this.#activeSignatureHashCache ?? { hashOutputsSingle: /* @__PURE__ */ new Map() };
        }
        #completeSourceTransaction(tx, visiting, complete) {
          for (const input of tx.inputs) {
            if (input.sourceTXID == null && input.sourceTransaction != null) {
              input.sourceTXID = input.sourceTransaction.id("hex");
            }
          }
          visiting.delete(tx);
          complete.add(tx);
        }
        #scheduleSourceTransactions(tx, visiting, complete, stack) {
          if (visiting.has(tx)) {
            throw new Error("Cyclic source transaction graph");
          }
          visiting.add(tx);
          stack.push({ tx, expanded: true });
          for (let i = tx.inputs.length - 1; i >= 0; i--) {
            const source = tx.inputs[i].sourceTransaction;
            if (tx.inputs[i].sourceTXID == null && source != null && !complete.has(source)) {
              stack.push({ tx: source, expanded: false });
            }
          }
        }
        /**
         * Iteratively materializes source transaction IDs so deep spend chains do not
         * recurse through `hash()` while serializing their parents.
         */
        materializeSourceTXIDs() {
          const complete = /* @__PURE__ */ new Set();
          const visiting = /* @__PURE__ */ new Set();
          const stack = [{ tx: this, expanded: false }];
          while (stack.length > 0) {
            const frame = stack.pop();
            if (frame == null)
              continue;
            if (complete.has(frame.tx))
              continue;
            if (frame.expanded) {
              this.#completeSourceTransaction(frame.tx, visiting, complete);
              continue;
            }
            this.#scheduleSourceTransactions(frame.tx, visiting, complete, stack);
          }
        }
        /**
         * Creates a new transaction, linked to its inputs and their associated merkle paths, from a BEEF V1, V2 or Atomic.
         * Optionally, you can provide a specific TXID to retrieve a particular transaction from the BEEF data.
         * If the TXID is provided but not found in the BEEF data, an error will be thrown.
         * If no TXID is provided, the last transaction in the BEEF data is returned, or the atomic txid.
         * @param beef A binary representation of transactions in BEEF format.
         * @param txid Optional TXID of the transaction to retrieve from the BEEF data.
         * @returns An anchored transaction, linked to its associated inputs populated with merkle paths.
         */
        static fromBEEF(beef, txid2) {
          const { tx } = _Transaction.#fromAnyBeef(beef, txid2);
          return tx;
        }
        /**
         * Zero-copy variant of {@link fromBEEF}. The caller must not mutate `beef`.
         */
        static fromBEEFView(beef, txid2) {
          const { tx } = _Transaction.#fromAnyBeef(beef, txid2, true);
          return tx;
        }
        /**
         * Creates a new transaction from an Atomic BEEF (BRC-95) structure.
         * Extracts the subject transaction and supporting merkle path and source transactions contained in the BEEF data
         *
         * @param beef A binary representation of an Atomic BEEF structure.
         * @returns The subject transaction, linked to its associated inputs populated with merkle paths.
         */
        static fromAtomicBEEF(beef) {
          const { tx, txid: txid2, beef: b } = _Transaction.#fromAnyBeef(beef);
          if (txid2 !== b.atomicTxid) {
            if (b.atomicTxid == null) {
              throw new Error("beef must conform to BRC-95 and must contain the subject txid.");
            } else {
              throw new Error(`Transaction with TXID ${b.atomicTxid} not found in BEEF data.`);
            }
          }
          if (!b.isAtomic(txid2))
            throw new Error("Atomic BEEF contains unrelated transaction data.");
          return tx;
        }
        /**
         * Zero-copy variant of {@link fromAtomicBEEF}. The caller must not mutate
         * `beef` while any linked transaction remains in use.
         */
        static fromAtomicBEEFView(beef) {
          const { tx, txid: txid2, beef: b } = _Transaction.#fromAnyBeef(beef, void 0, true);
          if (txid2 !== b.atomicTxid) {
            if (b.atomicTxid == null)
              throw new Error("beef must conform to BRC-95 and must contain the subject txid.");
            throw new Error(`Transaction with TXID ${b.atomicTxid} not found in BEEF data.`);
          }
          if (!b.isAtomic(txid2))
            throw new Error("Atomic BEEF contains unrelated transaction data.");
          return tx;
        }
        static #fromAnyBeef(beef, txid2, zeroCopy = false) {
          const b = zeroCopy && beef instanceof Uint8Array ? Beef.fromBinaryView(beef) : Beef.fromBinaryStrict(beef);
          if (b.txs.length < 1) {
            throw new Error("beef must include at least one transaction.");
          }
          const lastTx = b.txs.at(-1);
          if (lastTx == null) {
            throw new Error("beef must include at least one transaction.");
          }
          const target = txid2 ?? b.atomicTxid ?? lastTx.txid;
          const tx = b.findAtomicTransaction(target);
          if (tx == null) {
            if (txid2 == null) {
              throw new Error("beef does not contain transaction for atomic txid.");
            } else {
              throw new Error(`Transaction with TXID ${String(target)} not found in BEEF data.`);
            }
          }
          return { tx, beef: b, txid: target };
        }
        /**
         * Creates a new transaction, linked to its inputs and their associated merkle paths, from a EF (BRC-30) structure.
         *
         * EF source descriptors contain only a claimed source TXID, locking script,
         * and amount. They do not authenticate the complete source transaction or
         * prove that the described output exists or remains spendable. In an
         * adversarial environment the recipient must already be familiar with the
         * source information or independently verify it through trusted full
         * transaction and chain-state evidence before signing or authorizing value.
         * @param ef A binary representation of a transaction in EF format.
         * @returns An extended transaction, linked to its associated inputs by locking script and satoshis amounts only.
         */
        static fromEF(ef) {
          const br = ReaderUint8Array.makeReader(ef);
          const version = br.readUInt32LE();
          if (toHex(br.read(6)) !== "0000000000ef") {
            throw new Error("Invalid EF marker");
          }
          const inputsLength = br.readVarIntNumStrict(false);
          const inputs = [];
          for (let i = 0; i < inputsLength; i++) {
            const sourceTXID = toHex(br.readReverse(32));
            const sourceOutputIndex = br.readUInt32LE();
            if (sourceOutputIndex > MAX_EF_SOURCE_OUTPUT_INDEX) {
              throw new RangeError("EF source output index exceeds the allocation limit");
            }
            const scriptLength = br.readVarIntNumStrict(false);
            const scriptBin = br.read(scriptLength);
            const unlockingScript = UnlockingScript.fromBinary(scriptBin);
            const sequence = br.readUInt32LE();
            const satoshis2 = br.readUInt64LEBn().toNumber();
            const lockingScriptLength = br.readVarIntNumStrict(false);
            const lockingScriptBin = br.read(lockingScriptLength);
            const lockingScript = LockingScript.fromBinary(lockingScriptBin);
            const sourceTransaction = new _Transaction(void 0, [], [], void 0);
            sourceTransaction.outputs = Array.from({ length: sourceOutputIndex + 1 }).fill(null);
            sourceTransaction.outputs[sourceOutputIndex] = {
              satoshis: satoshis2,
              lockingScript
            };
            inputs.push({
              sourceTransaction,
              sourceTXID,
              sourceOutputIndex,
              unlockingScript,
              sequence
            });
          }
          const outputsLength = br.readVarIntNumStrict(false);
          const outputs = [];
          for (let i = 0; i < outputsLength; i++) {
            const satoshis2 = br.readUInt64LEBn().toNumber();
            const scriptLength = br.readVarIntNumStrict(false);
            const scriptBin = br.read(scriptLength);
            const lockingScript = LockingScript.fromBinary(scriptBin);
            outputs.push({
              satoshis: satoshis2,
              lockingScript
            });
          }
          const lockTime = br.readUInt32LE();
          if (!br.eof())
            throw new Error("Serialized EF transaction contains trailing data");
          return new _Transaction(version, inputs, outputs, lockTime);
        }
        /**
         * Since the validation of blockchain data is atomically transaction data validation,
         * any application seeking to validate data in output scripts must store the entire transaction as well.
         * Since the transaction data includes the output script data, saving a second copy of potentially
         * large scripts can bloat application storage requirements.
         *
         * This function efficiently parses binary transaction data to determine the offsets and lengths of each script.
         * This supports the efficient retreival of script data from transaction data.
         *
         * @param bin binary transaction data
         * @returns {
         *   inputs: { vin: number, offset: number, length: number }[]
         *   outputs: { vout: number, offset: number, length: number }[]
         * }
         */
        static parseScriptOffsets(bin) {
          const br = ReaderUint8Array.makeReader(bin);
          const inputs = [];
          const outputs = [];
          br.read(4);
          const inputsLength = br.readVarIntNumStrict(false);
          for (let i = 0; i < inputsLength; i++) {
            br.read(36);
            const scriptLength = br.readVarIntNumStrict(false);
            inputs.push({ vin: i, offset: br.pos, length: scriptLength });
            br.read(scriptLength + 4);
          }
          const outputsLength = br.readVarIntNumStrict(false);
          for (let i = 0; i < outputsLength; i++) {
            br.read(8);
            const scriptLength = br.readVarIntNumStrict(false);
            outputs.push({ vout: i, offset: br.pos, length: scriptLength });
            br.read(scriptLength);
          }
          br.read(4);
          if (!br.eof())
            throw new Error("Serialized transaction contains trailing data");
          return { inputs, outputs };
        }
        static fromReader(br) {
          return _Transaction.#fromReaderInternal(br, false);
        }
        static #fromReaderInternal(br, zeroCopyScripts) {
          const version = br.readUInt32LE();
          const inputsLength = br.readVarIntNumStrict(false);
          const inputs = [];
          for (let i = 0; i < inputsLength; i++) {
            const sourceTXID = toHex(br.readReverse(32));
            const sourceOutputIndex = br.readUInt32LE();
            const scriptLength = br.readVarIntNumStrict(false);
            const scriptBin = zeroCopyScripts && br instanceof ReaderUint8Array ? br.readView(scriptLength) : br.read(scriptLength);
            const unlockingScript = zeroCopyScripts && scriptBin instanceof Uint8Array ? UnlockingScript.fromBinaryView(scriptBin) : UnlockingScript.fromBinary(scriptBin);
            const sequence = br.readUInt32LE();
            inputs.push({
              sourceTXID,
              sourceOutputIndex,
              unlockingScript,
              sequence
            });
          }
          const outputsLength = br.readVarIntNumStrict(false);
          const outputs = [];
          for (let i = 0; i < outputsLength; i++) {
            const satoshis2 = br.readUInt64LEBn().toNumber();
            const scriptLength = br.readVarIntNumStrict(false);
            const scriptBin = zeroCopyScripts && br instanceof ReaderUint8Array ? br.readView(scriptLength) : br.read(scriptLength);
            const lockingScript = zeroCopyScripts && scriptBin instanceof Uint8Array ? LockingScript.fromBinaryView(scriptBin) : LockingScript.fromBinary(scriptBin);
            outputs.push({
              satoshis: satoshis2,
              lockingScript
            });
          }
          const lockTime = br.readUInt32LE();
          return new _Transaction(version, inputs, outputs, lockTime);
        }
        /**
         * Creates a Transaction instance from a binary array.
         *
         * @static
         * @param {number[]} bin - The binary array representation of the transaction.
         * @returns {Transaction} - A new Transaction instance.
         */
        static fromBinary(bin) {
          const rawBytes = Uint8Array.from(bin);
          return _Transaction.fromBinaryView(rawBytes);
        }
        /**
         * Parses a transaction while retaining zero-copy views over `bin` for the raw
         * transaction and its scripts. The caller must not mutate `bin`.
         */
        static fromBinaryView(bin) {
          const br = new ReaderUint8Array(bin);
          const tx = _Transaction.#fromReaderInternal(br, true);
          if (!br.eof())
            throw new Error("Serialized transaction contains trailing data");
          tx.#rawBytesCache = bin;
          tx.#captureSerializationState();
          return tx;
        }
        /**
         * Creates a Transaction instance from a hexadecimal string.
         *
         * @static
         * @param {string} hex - The hexadecimal string representation of the transaction.
         * @returns {Transaction} - A new Transaction instance.
         */
        static fromHex(hex2) {
          const rawBytes = toUint8Array(hex2, "hex");
          const tx = _Transaction.fromBinaryView(rawBytes);
          tx.#hexCache = toHex(rawBytes);
          return tx;
        }
        /**
         * Creates a Transaction instance from a hexadecimal string encoded EF.
         *
         * @static
         * @param {string} hex - The hexadecimal string representation of the transaction EF.
         * @returns {Transaction} - A new Transaction instance.
         */
        static fromHexEF(hex2) {
          return _Transaction.fromEF(toUint8Array(hex2, "hex"));
        }
        /**
         * Creates a Transaction instance from a hexadecimal string encoded BEEF.
         * Optionally, you can provide a specific TXID to retrieve a particular transaction from the BEEF data.
         * If the TXID is provided but not found in the BEEF data, an error will be thrown.
         * If no TXID is provided, the last transaction in the BEEF data is returned.
         *
         * @static
         * @param {string} hex - The hexadecimal string representation of the transaction BEEF.
         * @param {string} [txid] - Optional TXID of the transaction to retrieve from the BEEF data.
         * @returns {Transaction} - A new Transaction instance.
         */
        static fromHexBEEF(hex2, txid2) {
          return _Transaction.fromBEEF(toArray2(hex2, "hex"), txid2);
        }
        constructor(version = 1, inputs = [], outputs = [], lockTime = 0, metadata = /* @__PURE__ */ new Map(), merklePath) {
          this.version = version;
          this.inputs = inputs;
          this.outputs = outputs;
          this.lockTime = lockTime;
          this.metadata = metadata;
          this.merklePath = merklePath;
        }
        #invalidateSerializationCaches() {
          this.#cachedHash = void 0;
          this.#cachedIdHex = void 0;
          this.#rawBytesCache = void 0;
          this.#efBytesCache = void 0;
          this.#hexCache = void 0;
          this.#rawCacheState = void 0;
        }
        #sourceTransactionId(input) {
          return input.sourceTXID == null ? input.sourceTransaction?.id("hex") : void 0;
        }
        #captureSerializationState() {
          this.#rawCacheState = {
            version: this.version,
            lockTime: this.lockTime,
            inputs: this.inputs.map((ref) => {
              const sourceOutput = ref.sourceTransaction?.outputs[ref.sourceOutputIndex];
              return {
                ref,
                sourceTXID: ref.sourceTXID,
                sourceTransactionId: this.#sourceTransactionId(ref),
                sourceOutputIndex: ref.sourceOutputIndex,
                sequence: ref.sequence,
                unlockingScript: ref.unlockingScript,
                unlockingScriptBytes: ref.unlockingScript == null ? void 0 : scriptSerializationIdentity(ref.unlockingScript),
                sourceOutput,
                sourceSatoshis: sourceOutput?.satoshis,
                sourceLockingScript: sourceOutput?.lockingScript,
                sourceLockingScriptBytes: sourceOutput == null ? void 0 : scriptSerializationIdentity(sourceOutput.lockingScript)
              };
            }),
            outputs: this.outputs.map((ref) => ({
              ref,
              satoshis: ref.satoshis,
              lockingScript: ref.lockingScript,
              lockingScriptBytes: scriptSerializationIdentity(ref.lockingScript)
            }))
          };
        }
        #serializationCacheMatchesState() {
          const cached = this.#rawCacheState;
          if (cached?.version !== this.version || cached.lockTime !== this.lockTime || cached.inputs.length !== this.inputs.length || cached.outputs.length !== this.outputs.length)
            return false;
          for (let i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i];
            const state = cached.inputs[i];
            const sourceOutput = input.sourceTransaction?.outputs[input.sourceOutputIndex];
            if (state.ref !== input || state.sourceTXID !== input.sourceTXID || state.sourceTransactionId !== this.#sourceTransactionId(input) || state.sourceOutputIndex !== input.sourceOutputIndex || state.sequence !== input.sequence || state.unlockingScript !== input.unlockingScript || state.unlockingScriptBytes !== (input.unlockingScript == null ? void 0 : scriptSerializationIdentity(input.unlockingScript)) || state.sourceOutput !== sourceOutput || state.sourceSatoshis !== sourceOutput?.satoshis || state.sourceLockingScript !== sourceOutput?.lockingScript || state.sourceLockingScriptBytes !== (sourceOutput == null ? void 0 : scriptSerializationIdentity(sourceOutput.lockingScript)))
              return false;
          }
          for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];
            const state = cached.outputs[i];
            if (state.ref !== output || state.satoshis !== output.satoshis || state.lockingScript !== output.lockingScript || state.lockingScriptBytes !== scriptSerializationIdentity(output.lockingScript))
              return false;
          }
          return true;
        }
        /**
         * Adds a new input to the transaction.
         *
         * @param {TransactionInput} input - The TransactionInput object to add to the transaction.
         * @throws {Error} - If the input does not have a sourceTXID or sourceTransaction defined.
         */
        addInput(input) {
          if (input.sourceTXID === void 0 && input.sourceTransaction === void 0) {
            throw new TypeError("A reference to an an input transaction is required. If the input transaction itself cannot be referenced, its TXID must still be provided.");
          }
          requireUInt322(input.sourceOutputIndex, "sourceOutputIndex");
          if (input.sourceTXID !== void 0)
            input.sourceTXID = requireTXID(input.sourceTXID, "sourceTXID");
          if (input.sequence !== void 0)
            requireUInt322(input.sequence, "sequence");
          input.sequence ??= 4294967295;
          this.#invalidateSerializationCaches();
          this.inputs.push(input);
        }
        /**
         * Adds a new output to the transaction.
         *
         * @param {TransactionOutput} output - The TransactionOutput object to add to the transaction.
         */
        addOutput(output) {
          this.#invalidateSerializationCaches();
          if (output.satoshis === void 0 && output.change !== true) {
            throw new TypeError("either satoshis must be defined or change must be set to true");
          }
          if (output.satoshis !== void 0)
            requireSatoshiAmount(output.satoshis, "satoshis");
          if (output.lockingScript == null)
            throw new Error("lockingScript must be defined");
          this.outputs.push(output);
        }
        /**
         * Adds a new P2PKH output to the transaction.
         *
         * @param {number[] | string} address - The P2PKH address of the output.
         * @param {number} [satoshis] - The number of satoshis to send to the address - if not provided, the output is considered a change output.
         *
         */
        addP2PKHOutput(address, satoshis2) {
          const lockingScript = new P2PKH().lock(address);
          if (satoshis2 === void 0) {
            return this.addOutput({ lockingScript, change: true });
          }
          this.addOutput({
            lockingScript,
            satoshis: satoshis2
          });
        }
        /**
         * Updates the transaction's metadata.
         *
         * @param {Record<string, any>} metadata - The metadata object to merge into the existing metadata.
         */
        updateMetadata(metadata) {
          this.metadata = {
            ...this.metadata,
            ...metadata
          };
        }
        /**
         * Computes fees prior to signing.
         * If no fee model is provided, uses a LivePolicy fee model that fetches current rates from ARC.
         * If fee is a number, the transaction uses that value as fee.
         *
         * @param modelOrFee - The initialized fee model to use or fixed fee for the transaction
         * @param changeDistribution - Specifies how the change should be distributed
         * amongst the change outputs
         *
         */
        async fee(modelOrFee = LivePolicy.getInstance(), changeDistribution = "equal") {
          this.#invalidateSerializationCaches();
          if (changeDistribution !== "equal" && changeDistribution !== "random") {
            throw new TypeError('changeDistribution must be either "equal" or "random".');
          }
          if (typeof modelOrFee === "number") {
            const sats = modelOrFee;
            modelOrFee = {
              computeFee: async () => sats
            };
          }
          const baseline = this.#snapshotTransactionGraph(true);
          const result = baseline.#snapshotTransactionGraph(true);
          const modelTransaction = baseline.#snapshotTransactionGraph(true);
          const inputRefs = [...this.inputs];
          const sourceRefs = this.inputs.map((input) => input.sourceTransaction);
          const templateRefs = this.inputs.map((input) => input.unlockingScriptTemplate);
          const outputRefs = [...this.outputs];
          const modelInputRefs = [...modelTransaction.inputs];
          const modelSourceRefs = modelTransaction.inputs.map((input) => input.sourceTransaction);
          const modelTemplateRefs = modelTransaction.inputs.map((input) => input.unlockingScriptTemplate);
          const modelOutputRefs = [...modelTransaction.outputs];
          const fee = requireSatoshiAmount(await modelOrFee.computeFee(modelTransaction), "Computed transaction fee");
          if (!modelTransaction.#signingStateMatches(baseline, modelInputRefs, modelSourceRefs, modelTemplateRefs, modelOutputRefs)) {
            throw new Error("Fee model mutated its transaction snapshot");
          }
          const change = result.#calculateChange(fee);
          if (change < 0) {
            throw new RangeError("Transaction inputs are insufficient for the requested outputs and fee.");
          }
          if (!this.#signingStateMatches(baseline, inputRefs, sourceRefs, templateRefs, outputRefs)) {
            throw new Error("Transaction changed while computing its fee; no change was applied");
          }
          if (change === 0) {
            this.outputs = outputRefs.filter((output) => output.change !== true);
            this.#invalidateSerializationCaches();
            return;
          }
          result.#distributeChange(change, changeDistribution);
          for (let index = 0; index < outputRefs.length; index++) {
            if (outputRefs[index].change === true) {
              outputRefs[index].satoshis = result.outputs[index].satoshis;
            }
          }
          this.#invalidateSerializationCaches();
        }
        #calculateChange(fee) {
          let totalInputs = 0;
          for (let index = 0; index < this.inputs.length; index++) {
            const input = this.inputs[index];
            if (typeof input.sourceTransaction !== "object") {
              throw new TypeError("Source transactions are required for all inputs during fee computation");
            }
            requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
            const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
            if (sourceOutput == null) {
              throw new RangeError(`Input ${index} references a source output that does not exist.`);
            }
            const amount = requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
            totalInputs = addSatoshiAmount(totalInputs, amount, "Transaction input total");
          }
          let totalOutputs = 0;
          for (let index = 0; index < this.outputs.length; index++) {
            const out = this.outputs[index];
            if (out.change !== true) {
              const amount = requireSatoshiAmount(out.satoshis, `Output ${index} amount`);
              totalOutputs = addSatoshiAmount(totalOutputs, amount, "Transaction output total");
            }
          }
          if (totalOutputs + fee > totalInputs) {
            throw new RangeError("Transaction inputs are insufficient for the requested outputs and fee.");
          }
          return totalInputs - totalOutputs - fee;
        }
        #distributeChange(change, changeDistribution) {
          const changeOutputs = this.outputs.filter((out) => out.change === true);
          if (changeOutputs.length === 0)
            return;
          if (changeDistribution === "random") {
            this.#distributeRandomChange(change, changeOutputs);
          } else {
            this.#distributeEqualChange(change, changeOutputs);
          }
        }
        #distributeRandomChange(change, changeOutputs) {
          let remaining = change;
          for (let i = 0; i < changeOutputs.length - 1; i++) {
            const portion = this.#benfordNumber(0, remaining);
            changeOutputs[i].satoshis = portion;
            remaining -= portion;
          }
          changeOutputs.at(-1).satoshis = remaining;
        }
        #distributeEqualChange(change, changeOutputs) {
          const perOutput = Math.floor(change / changeOutputs.length);
          for (const out of changeOutputs) {
            out.satoshis = perOutput;
          }
          changeOutputs.at(-1).satoshis += change - perOutput * changeOutputs.length;
        }
        #benfordNumber(min, max) {
          const d = Random_default(1)[0] % 9 + 1;
          return Math.floor(min + (max - min) * Math.log10(1 + 1 / d) / Math.log10(10));
        }
        /**
         * Utility method that returns the current fee based on inputs and outputs
         *
         * @returns The current transaction fee
         */
        getFee() {
          let totalIn = 0;
          for (let index = 0; index < this.inputs.length; index++) {
            const input = this.inputs[index];
            if (typeof input.sourceTransaction !== "object") {
              throw new TypeError("Source transactions or sourceSatoshis are required for all inputs to calculate fee");
            }
            requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
            const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
            if (sourceOutput == null) {
              throw new RangeError(`Input ${index} references a source output that does not exist.`);
            }
            totalIn = addSatoshiAmount(totalIn, requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`), "Transaction input total");
          }
          let totalOut = 0;
          for (let index = 0; index < this.outputs.length; index++) {
            totalOut = addSatoshiAmount(totalOut, requireSatoshiAmount(this.outputs[index].satoshis, `Output ${index} amount`), "Transaction output total");
          }
          return totalIn - totalOut;
        }
        /**
         * Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.
         * @param options - Signing behavior. Set `skipExistingSignatures` to preserve inputs that already have an unlocking script.
         */
        async sign(options = {}) {
          this.#invalidateSerializationCaches();
          for (let index = 0; index < this.outputs.length; index++) {
            const out = this.outputs[index];
            if (out.satoshis === void 0) {
              if (out.change === true) {
                throw new Error("There are still change outputs with uncomputed amounts. Use the fee() method to compute the change amounts and transaction fees prior to signing.");
              } else {
                throw new Error("One or more transaction outputs is missing an amount. Ensure all output amounts are provided before signing.");
              }
            }
            requireSatoshiAmount(out.satoshis, `Output ${index} amount`);
          }
          this.#totalVerifiedOutputs(this);
          for (let index = 0; index < this.inputs.length; index++) {
            const input = this.inputs[index];
            requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
            requireUInt322(input.sequence ?? 4294967295, `Input ${index} sequence`);
            if (input.sourceTXID !== void 0) {
              requireTXID(input.sourceTXID, `Input ${index} sourceTXID`);
            }
            if (input.sourceTransaction !== void 0) {
              const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
              if (sourceOutput == null) {
                throw new RangeError(`Input ${index} references a source output that does not exist.`);
              }
              requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
              if (input.sourceTXID !== void 0 && (input.sourceTransaction.inputs.length > 0 || input.sourceTransaction.merklePath != null) && requireTXID(input.sourceTXID, `Input ${index} sourceTXID`) !== input.sourceTransaction.id("hex")) {
                throw new Error(`Input ${index} sourceTXID does not reference its supplied source transaction.`);
              }
            }
          }
          this.materializeSourceTXIDs();
          const signingSnapshot = this.#snapshotTransactionGraph(true);
          const inputRefs = [...this.inputs];
          const sourceRefs = this.inputs.map((input) => input.sourceTransaction);
          const templateRefs = this.inputs.map((input) => input.unlockingScriptTemplate);
          const outputRefs = [...this.outputs];
          const skipExistingSignatures = options.skipExistingSignatures === true;
          let unlockingScripts;
          unlockingScripts = await Promise.all(signingSnapshot.inputs.map(async (input, index) => {
            if (skipExistingSignatures && input.unlockingScript != null) {
              return new UnlockingScript([], Uint8Array.from(input.unlockingScript.toUint8Array()), void 0, false);
            }
            const template = templateRefs[index];
            if (template === void 0)
              return void 0;
            const templateTransaction = signingSnapshot.#snapshotTransactionGraph(true);
            for (let templateIndex = 0; templateIndex < templateRefs.length; templateIndex++) {
              templateTransaction.inputs[templateIndex].unlockingScriptTemplate = templateRefs[templateIndex];
            }
            templateTransaction.#activeSignatureHashCache = { hashOutputsSingle: /* @__PURE__ */ new Map() };
            const returned = await template.sign(templateTransaction, index);
            if (returned == null || typeof returned.toUint8Array !== "function") {
              throw new TypeError(`Input ${index} signing template returned an invalid unlocking script`);
            }
            const bytes3 = returned.toUint8Array();
            if (!(bytes3 instanceof Uint8Array)) {
              throw new TypeError(`Input ${index} signing template returned an invalid unlocking script`);
            }
            return new UnlockingScript([], Uint8Array.from(bytes3), void 0, false);
          }));
          if (!this.#signingStateMatches(signingSnapshot, inputRefs, sourceRefs, templateRefs, outputRefs)) {
            throw new Error("Transaction changed while signing; no unlocking scripts were applied");
          }
          for (let i = 0, l = this.inputs.length; i < l; i++) {
            if (templateRefs[i] !== void 0 && !(skipExistingSignatures && inputRefs[i].unlockingScript != null)) {
              this.inputs[i].unlockingScript = unlockingScripts[i];
            }
          }
          this.#invalidateSerializationCaches();
        }
        /**
         * Broadcasts a transaction.
         *
         * @param broadcaster The Broadcaster instance wwhere the transaction will be sent
         * @returns A BroadcastResponse or BroadcastFailure from the Broadcaster
         */
        async broadcast(broadcaster = defaultBroadcaster()) {
          const snapshot = this.#snapshotTransactionGraph();
          const expectedTxid = snapshot.id("hex");
          return validateBroadcastResult(await broadcaster.broadcast(snapshot), expectedTxid);
        }
        #writeTransactionBody(writer) {
          writer.writeUInt32LE(this.version);
          writer.writeVarIntNum(this.inputs.length);
          for (const i of this.inputs) {
            if (i.sourceTXID === void 0) {
              if (i.sourceTransaction == null) {
                throw new Error("sourceTransaction is undefined");
              } else {
                writer.write(i.sourceTransaction.hash());
              }
            } else {
              writer.writeReverse(toArray2(requireTXID(i.sourceTXID, "sourceTXID"), "hex"));
            }
            writer.writeUInt32LE(requireUInt322(i.sourceOutputIndex, "sourceOutputIndex"));
            if (i.unlockingScript == null) {
              throw new Error("unlockingScript is undefined");
            }
            const scriptBin = i.unlockingScript.toUint8Array();
            writer.writeVarIntNum(scriptBin.length);
            writer.write(scriptBin);
            writer.writeUInt32LE(requireUInt322(i.sequence ?? 4294967295, "sequence"));
          }
          writer.writeVarIntNum(this.outputs.length);
          for (const o of this.outputs) {
            writer.writeUInt64LE(o.satoshis ?? 0);
            const scriptBin = o.lockingScript.toUint8Array();
            writer.writeVarIntNum(scriptBin.length);
            writer.write(scriptBin);
          }
          writer.writeUInt32LE(this.lockTime);
        }
        #buildSerializedBytes() {
          const writer = new WriterUint8Array();
          this.#writeTransactionBody(writer);
          return writer.toUint8Array();
        }
        #getSerializedBytes() {
          if (this.#rawBytesCache == null || !this.#serializationCacheMatchesState()) {
            this.#invalidateSerializationCaches();
            this.#rawBytesCache = this.#buildSerializedBytes();
            this.#captureSerializationState();
          }
          return this.#rawBytesCache;
        }
        [serializedBytes2]() {
          return this.#getSerializedBytes();
        }
        [knownId](txid2) {
          this.#cachedIdHex = txid2;
        }
        /**
         * Converts the transaction to a binary array format.
         *
         * @returns {number[]} - The binary array representation of the transaction.
         */
        toBinary() {
          return Array.from(this.#getSerializedBytes());
        }
        toUint8Array() {
          return Uint8Array.from(this.#getSerializedBytes());
        }
        #writeEF(writer) {
          writer.writeUInt32LE(this.version);
          writer.write([0, 0, 0, 0, 0, 239]);
          writer.writeVarIntNum(this.inputs.length);
          for (const i of this.inputs) {
            if (i.sourceTransaction === void 0) {
              throw new TypeError("All inputs must have source transactions when serializing to EF format");
            }
            if (i.sourceTXID === void 0) {
              writer.write(i.sourceTransaction.hash());
            } else {
              writer.write(toArray2(i.sourceTXID, "hex").reverse());
            }
            writer.writeUInt32LE(i.sourceOutputIndex);
            if (i.unlockingScript == null) {
              throw new Error("unlockingScript is undefined");
            }
            const scriptBin = i.unlockingScript.toUint8Array();
            writer.writeVarIntNum(scriptBin.length);
            writer.write(scriptBin);
            writer.writeUInt32LE(i.sequence ?? 4294967295);
            writer.writeUInt64LE(i.sourceTransaction.outputs[i.sourceOutputIndex].satoshis ?? 0);
            const lockingScriptBin = i.sourceTransaction.outputs[i.sourceOutputIndex].lockingScript.toUint8Array();
            writer.writeVarIntNum(lockingScriptBin.length);
            writer.write(lockingScriptBin);
          }
          writer.writeVarIntNum(this.outputs.length);
          for (const o of this.outputs) {
            writer.writeUInt64LE(o.satoshis ?? 0);
            const scriptBin = o.lockingScript.toUint8Array();
            writer.writeVarIntNum(scriptBin.length);
            writer.write(scriptBin);
          }
          writer.writeUInt32LE(this.lockTime);
        }
        /**
         * Converts the transaction to a BRC-30 EF format.
         *
         * @returns {number[]} - The BRC-30 EF representation of the transaction.
         */
        toEF() {
          return Array.from(this.#getEFBytes());
        }
        /**
         * Converts the transaction to a BRC-30 EF format.
         *
         * @remarks This is an alias for {@link toEFBinary}. The returned view is
         * copied from the internal memoized representation for caller isolation.
         *
         * @returns {Uint8Array} - The BRC-30 EF representation of the transaction.
         */
        toEFUint8Array() {
          return this.toEFBinary();
        }
        #getEFBytes() {
          if (this.#efBytesCache == null || !this.#serializationCacheMatchesState()) {
            this.#invalidateSerializationCaches();
            const writer = new WriterUint8Array();
            this.#writeEF(writer);
            this.#efBytesCache = writer.toUint8Array();
            this.#captureSerializationState();
          }
          return this.#efBytesCache;
        }
        /**
         * Converts the transaction to an independently owned BRC-30 EF byte array.
         *
         * @remarks Each call returns an independently mutable copy. Internal
         * serialization remains memoized until transaction state changes.
         *
         * @returns {Uint8Array} The cached BRC-30 EF representation.
         */
        toEFBinary() {
          return Uint8Array.from(this.#getEFBytes());
        }
        /**
         * Converts the transaction to a hexadecimal string EF.
         *
         * @returns {string} - The hexadecimal string representation of the transaction EF.
         */
        toHexEF() {
          return toHex(this.toEFBinary());
        }
        /**
         * Converts the transaction to a hexadecimal string format.
         *
         * @returns {string} - The hexadecimal string representation of the transaction.
         */
        toHex() {
          const bytes3 = this.#getSerializedBytes();
          if (this.#hexCache != null)
            return this.#hexCache;
          const hex2 = toHex(bytes3);
          this.#hexCache = hex2;
          return hex2;
        }
        /**
         * Converts the transaction to a hexadecimal string BEEF.
         *
         * @returns {string} - The hexadecimal string representation of the transaction BEEF.
         */
        toHexBEEF() {
          return toHex(this.toBEEF());
        }
        /**
         * Converts the transaction to a hexadecimal string Atomic BEEF.
         *
         * @returns {string} - The hexadecimal string representation of the transaction Atomic BEEF.
         */
        toHexAtomicBEEF() {
          return toHex(this.toAtomicBEEF());
        }
        /**
         * Calculates the transaction's hash.
         *
         * @param {'hex' | undefined} enc - The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
         * @returns {string | number[]} - The hash of the transaction in the specified format.
         */
        hash(enc) {
          const bytes3 = this.#getSerializedBytes();
          this.#cachedHash ??= hash256(bytes3);
          if (enc === "hex") {
            return toHex(this.#cachedHash);
          }
          return Array.from(this.#cachedHash);
        }
        /**
         * Calculates the transaction's ID.
         *
         * @param {'hex' | undefined} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
         * @returns {string | number[]} - The ID of the transaction in the specified format.
         */
        id(enc) {
          this.#getSerializedBytes();
          if (enc === "hex" && this.#cachedIdHex != null)
            return this.#cachedIdHex;
          const id = [...this.hash()];
          id.reverse();
          if (enc === "hex") {
            this.#cachedIdHex = toHex(id);
            return this.#cachedIdHex;
          }
          return id;
        }
        async #completeVerificationFromMerklePath(tx, scriptsOnly, chainTracker, getTxid, verifiedTransactions, verifiedTxids) {
          if (typeof tx.merklePath !== "object")
            return false;
          if (scriptsOnly) {
            verifiedTransactions.add(tx);
            return true;
          }
          if (await tx.merklePath.verify(getTxid(), chainTracker)) {
            verifiedTxids.add(getTxid());
            return true;
          }
          throw new Error(`Invalid merkle path for transaction ${getTxid()}`);
        }
        async verifyTransactionFee(tx, feeModel, getTxid) {
          if (feeModel === void 0)
            return;
          if (tx === void 0)
            throw new Error("Transaction is undefined");
          const copy = _Transaction.fromEF(tx.toEF());
          delete copy.outputs[0].satoshis;
          copy.outputs[0].change = true;
          await copy.fee(feeModel);
          if (tx.getFee() < copy.getFee()) {
            throw new Error(`Verification failed because the transaction ${getTxid()} has an insufficient fee and has not been mined.`);
          }
        }
        #validateUnminedTransactionStructure(tx, getTxid) {
          if (tx.inputs.length === 0) {
            throw new Error(`Verification failed because transaction ${getTxid()} has no inputs.`);
          }
          if (tx.outputs.length === 0) {
            throw new Error(`Verification failed because transaction ${getTxid()} has no outputs.`);
          }
          const spentOutpoints = /* @__PURE__ */ new Set();
          for (let index = 0; index < tx.inputs.length; index++) {
            const input = tx.inputs[index];
            const outputIndex = requireUInt322(input.sourceOutputIndex, `Input ${index} sourceOutputIndex`);
            requireUInt322(input.sequence ?? 4294967295, `Input ${index} sequence`);
            const sourceTXID = requireTXID(input.sourceTXID ?? input.sourceTransaction?.id("hex"), `Input ${index} sourceTXID`);
            if (/^0{64}$/.test(sourceTXID) && outputIndex === 4294967295) {
              throw new Error(`Verification failed because unmined transaction ${getTxid()} contains a coinbase input.`);
            }
            const outpoint2 = `${sourceTXID}:${outputIndex}`;
            if (spentOutpoints.has(outpoint2)) {
              throw new Error(`Verification failed because transaction ${getTxid()} spends outpoint ${outpoint2} more than once.`);
            }
            spentOutpoints.add(outpoint2);
          }
          this.#totalVerifiedOutputs(tx);
        }
        #queueSourceTransactionForVerification(sourceTransaction, sourceTxid, state) {
          if (state.scriptsOnly) {
            if (!state.verifiedTransactions.has(sourceTransaction) && !state.queuedTransactions.has(sourceTransaction)) {
              state.txQueue.push(sourceTransaction);
              state.queuedTransactions.add(sourceTransaction);
            }
            return;
          }
          if (!state.verifiedTxids.has(sourceTxid) && !state.queuedTxids.has(sourceTxid)) {
            state.txQueue.push(sourceTransaction);
            state.queuedTxids.add(sourceTxid);
          }
        }
        #verifyTransactionInputs(tx, useVerifier, getTxid, state) {
          let inputTotal = 0;
          const sigHashCache = { hashOutputsSingle: /* @__PURE__ */ new Map() };
          for (let index = 0; index < tx.inputs.length; index++) {
            const input = tx.inputs[index];
            if (typeof input.sourceTransaction !== "object") {
              throw new TypeError(`Verification failed because the input at index ${index} of transaction ${getTxid()} is missing an associated source transaction. This source transaction is required for transaction verification because there is no merkle proof for the transaction spending a UTXO it contains.`);
            }
            if (typeof input.unlockingScript !== "object") {
              throw new TypeError(`Verification failed because the input at index ${index} of transaction ${getTxid()} is missing an associated unlocking script. This script is required for transaction verification because there is no merkle proof for the transaction spending the UTXO.`);
            }
            const sourceTransaction = input.sourceTransaction;
            const sourceOutput = sourceTransaction.outputs[input.sourceOutputIndex];
            if (sourceOutput == null) {
              throw new RangeError(`Verification failed because input ${index} of transaction ${getTxid()} references a source output that does not exist.`);
            }
            inputTotal = addSatoshiAmount(inputTotal, requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`), "Transaction input total");
            const computedSourceTxid = sourceTransaction.id("hex");
            if (!state.scriptsOnly && input.sourceTXID !== void 0 && requireTXID(input.sourceTXID, `Input ${index} sourceTXID`) !== computedSourceTxid) {
              throw new Error(`Verification failed because input ${index} of transaction ${getTxid()} does not reference its supplied source transaction.`);
            }
            const sourceTxid = state.scriptsOnly && input.sourceTXID !== void 0 ? input.sourceTXID : sourceTransaction.id("hex");
            this.#queueSourceTransactionForVerification(sourceTransaction, sourceTxid, state);
            input.sourceTXID ??= sourceTxid;
            if (!useVerifier && !new Spend({
              sourceTXID: input.sourceTXID,
              sourceOutputIndex: input.sourceOutputIndex,
              lockingScript: sourceOutput.lockingScript,
              sourceSatoshis: sourceOutput.satoshis ?? 0,
              transactionVersion: tx.version,
              otherInputs: [],
              allInputs: tx.inputs,
              unlockingScript: input.unlockingScript,
              inputSequence: input.sequence ?? 4294967295,
              inputIndex: index,
              outputs: tx.outputs,
              lockTime: tx.lockTime,
              memoryLimit: state.memoryLimit,
              sigHashCache
            }).validateJavaScript()) {
              return { valid: false, inputTotal };
            }
          }
          return { valid: true, inputTotal };
        }
        #totalVerifiedOutputs(tx) {
          let outputTotal = 0;
          for (let index = 0; index < tx.outputs.length; index++) {
            outputTotal = addSatoshiAmount(outputTotal, requireSatoshiAmount(tx.outputs[index].satoshis, `Output ${index} amount`), "Transaction output total");
          }
          return outputTotal;
        }
        async #verifyQueuedScripts(verifierQueue, selectedVerifier) {
          if (verifierQueue.length === 0 || selectedVerifier === void 0)
            return;
          const scriptVerdicts = selectedVerifier.verifyScriptsBatch === void 0 ? await Promise.all(verifierQueue.map(async (params) => await selectedVerifier.verifyScripts(params))) : await selectedVerifier.verifyScriptsBatch(verifierQueue);
          if (!Array.isArray(scriptVerdicts) || scriptVerdicts.length !== verifierQueue.length) {
            throw new Error("Script verifier returned an invalid batch result count");
          }
          const ownedVerdicts = [];
          for (let index = 0; index < scriptVerdicts.length; index++) {
            if (!Object.prototype.hasOwnProperty.call(scriptVerdicts, index) || typeof scriptVerdicts[index] !== "boolean") {
              throw new TypeError("Script verifier returned a non-boolean verdict");
            }
            ownedVerdicts.push(scriptVerdicts[index]);
          }
          const failedIndex = ownedVerdicts.findIndex((valid) => !valid);
          if (failedIndex >= 0) {
            throw new Error(`Script verification failed for transaction ${verifierQueue[failedIndex].tx.id("hex")}`);
          }
        }
        #isTransactionAlreadyVerified(tx, getTxid, state) {
          return state.scriptsOnly ? state.verifiedTransactions.has(tx) : state.verifiedTxids.has(getTxid());
        }
        #snapshotTransactionGraph(includeTemplates = false) {
          const snapshots = /* @__PURE__ */ new Map();
          const originals = [this];
          snapshots.set(this, new _Transaction(this.version, [], [], this.lockTime));
          for (let graphIndex = 0; graphIndex < originals.length; graphIndex++) {
            const original = originals[graphIndex];
            const snapshot2 = snapshots.get(original);
            if (snapshot2 === void 0)
              throw new Error("Transaction snapshot is incomplete");
            snapshot2.version = original.version;
            snapshot2.lockTime = original.lockTime;
            snapshot2.merklePath = original.merklePath === void 0 ? void 0 : new MerklePath(original.merklePath.blockHeight, original.merklePath.path.map((level) => level.map((leaf) => ({ ...leaf }))));
            snapshot2.outputs = Array.from(original.outputs, (output) => output == null ? output : {
              satoshis: output.satoshis,
              lockingScript: new LockingScript([], Uint8Array.from(output.lockingScript.toUint8Array()), void 0, false),
              change: output.change
            });
            snapshot2.inputs = Array.from(original.inputs, (input) => {
              let sourceSnapshot;
              if (input.sourceTransaction !== void 0) {
                sourceSnapshot = snapshots.get(input.sourceTransaction);
                if (sourceSnapshot === void 0) {
                  sourceSnapshot = new _Transaction(input.sourceTransaction.version, [], [], input.sourceTransaction.lockTime);
                  snapshots.set(input.sourceTransaction, sourceSnapshot);
                  originals.push(input.sourceTransaction);
                }
              }
              return {
                sourceTransaction: sourceSnapshot,
                sourceTXID: input.sourceTXID,
                sourceOutputIndex: input.sourceOutputIndex,
                unlockingScript: input.unlockingScript === void 0 ? void 0 : new UnlockingScript([], Uint8Array.from(input.unlockingScript.toUint8Array()), void 0, false),
                unlockingScriptTemplate: includeTemplates ? input.unlockingScriptTemplate : void 0,
                sequence: input.sequence
              };
            });
          }
          const snapshot = snapshots.get(this);
          if (snapshot === void 0)
            throw new Error("Transaction snapshot is incomplete");
          return snapshot;
        }
        #signingStateMatches(snapshot, inputRefs, sourceRefs, templateRefs, outputRefs) {
          if (this.version !== snapshot.version || this.lockTime !== snapshot.lockTime || this.inputs.length !== snapshot.inputs.length || this.outputs.length !== snapshot.outputs.length) {
            return false;
          }
          for (let index = 0; index < this.inputs.length; index++) {
            const current = this.inputs[index];
            const owned = snapshot.inputs[index];
            if (current !== inputRefs[index] || current.sourceTransaction !== sourceRefs[index] || current.unlockingScriptTemplate !== templateRefs[index] || current.sourceTXID !== owned.sourceTXID || current.sourceOutputIndex !== owned.sourceOutputIndex || current.sequence !== owned.sequence || !equalBytes(current.unlockingScript?.toUint8Array(), owned.unlockingScript?.toUint8Array())) {
              return false;
            }
            const currentSource = current.sourceTransaction?.outputs[current.sourceOutputIndex];
            const ownedSource = owned.sourceTransaction?.outputs[owned.sourceOutputIndex];
            if (currentSource == null || ownedSource == null) {
              if (currentSource !== ownedSource)
                return false;
            } else if (!Object.is(currentSource.satoshis, ownedSource.satoshis) || !equalBytes(currentSource.lockingScript.toUint8Array(), ownedSource.lockingScript.toUint8Array())) {
              return false;
            }
          }
          for (let index = 0; index < this.outputs.length; index++) {
            const current = this.outputs[index];
            const owned = snapshot.outputs[index];
            if (current !== outputRefs[index] || !Object.is(current.satoshis, owned.satoshis) || current.change !== owned.change || !equalBytes(current.lockingScript.toUint8Array(), owned.lockingScript.toUint8Array())) {
              return false;
            }
          }
          return true;
        }
        async #verifyUnminedTransaction(tx, getTxid, context) {
          const { feeModel, memoryLimit, selectedVerifier, verifierQueue } = context;
          this.#validateUnminedTransactionStructure(tx, getTxid);
          await this.verifyTransactionFee(tx, feeModel, getTxid);
          const verifierParams = {
            tx,
            blockHeight: POST_CHRONICLE_HEIGHT_FALLBACK,
            consensus: true,
            ...memoryLimit === void 0 ? {} : { memoryLimit }
          };
          const useVerifier = selectedVerifier !== void 0 && (memoryLimit === void 0 || selectedVerifier.supportsMemoryLimit === true) && (selectedVerifier.shouldVerifyScripts?.(verifierParams) ?? true);
          const verifyInputs = (skipScripts) => this.#verifyTransactionInputs(tx, skipScripts, getTxid, context);
          const inputVerification = !useVerifier && context.scriptWork !== void 0 ? context.scriptWork.work.inputs(context.scriptWork, verifierParams, verifyInputs) : verifyInputs(useVerifier);
          if (!inputVerification.valid)
            return false;
          if (useVerifier)
            verifierQueue.push(verifierParams);
          if (this.#totalVerifiedOutputs(tx) > inputVerification.inputTotal)
            return false;
          if (context.scriptsOnly)
            context.verifiedTransactions.add(tx);
          else
            context.verifiedTxids.add(getTxid());
          return true;
        }
        /**
         * Verifies the legitimacy of the Bitcoin transaction according to the rules of SPV by ensuring all the input transactions link back to valid block headers, the chain of spends for all inputs are valid, and the sum of inputs is not less than the sum of outputs.
         *
         * @param chainTracker - An instance of ChainTracker, a Bitcoin block header tracker. If the value is set to 'scripts only', headers will not be verified. If not provided then the default chain tracker will be used.
         * @param feeModel - An instance of FeeModel, a fee model to use for fee calculation. If not provided then the default fee model will be used.
         * @param memoryLimit - Optional caller-supplied local script-interpreter
         * memory budget. If omitted, post-Genesis validation does not impose an
         * arbitrary SDK memory cap.
         * @param verifier - An optional asynchronous script backend. Adaptive backends may decline before execution to preserve the JavaScript path.
         *
         * @returns Whether the transaction is valid according to the rules of SPV.
         *
         * @example tx.verify(new WhatsOnChain(), LivePolicy.getInstance())
         */
        async verify(chainTracker = defaultChainTracker(), feeModel, memoryLimit, verifier) {
          if (chainTracker !== "scripts only")
            this.materializeSourceTXIDs();
          const scriptWork = chainTracker === "scripts only" ? void 0 : evidenceScriptScope(this);
          return await this.#snapshotTransactionGraph().#verifySnapshot(chainTracker, feeModel, memoryLimit, verifier, scriptWork);
        }
        async #verifySnapshot(chainTracker, feeModel, memoryLimit, verifier, scriptWork) {
          const scriptsOnly = chainTracker === "scripts only";
          const backend = verifier ?? scriptVerificationBackend();
          const selectedVerifier = scriptWork !== void 0 && backend !== void 0 ? scopedScriptBackend(scriptWork, backend) : backend;
          if (!scriptsOnly)
            this.materializeSourceTXIDs();
          const verifiedTxids = /* @__PURE__ */ new Set();
          const verifiedTransactions = /* @__PURE__ */ new Set();
          const txQueue = [this];
          const queuedTxids = /* @__PURE__ */ new Set();
          if (!scriptsOnly)
            queuedTxids.add(this.id("hex"));
          const queuedTransactions = new Set(txQueue);
          const verifierQueue = [];
          const verificationContext = {
            scriptsOnly,
            memoryLimit,
            txQueue,
            queuedTransactions,
            queuedTxids,
            verifiedTransactions,
            verifiedTxids,
            feeModel,
            selectedVerifier,
            verifierQueue,
            scriptWork
          };
          let queueIndex = 0;
          while (queueIndex < txQueue.length) {
            const tx = txQueue[queueIndex++];
            let txid2;
            const getTxid = () => {
              txid2 ??= tx.id("hex");
              return txid2;
            };
            if (this.#isTransactionAlreadyVerified(tx, getTxid, verificationContext)) {
              continue;
            }
            if (await this.#completeVerificationFromMerklePath(tx, scriptsOnly, chainTracker, getTxid, verifiedTransactions, verifiedTxids)) {
              continue;
            }
            if (!await this.#verifyUnminedTransaction(tx, getTxid, verificationContext))
              return false;
          }
          await this.#verifyQueuedScripts(verifierQueue, selectedVerifier);
          return true;
        }
        /**
         * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
         *
         * @param writer The writer to serialize to
         * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
         *
         * @returns The serialized BEEF structure
         * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
         */
        writeSerializedBEEF(writer, allowPartial) {
          this.materializeSourceTXIDs();
          writer.writeUInt32LE(BEEF_V1);
          const { bumps, txs } = this.#collectBEEFTransactions(allowPartial);
          writer.writeVarIntNum(bumps.length);
          const bumpBytes = this.#reserveBEEFWriter(writer, bumps, txs);
          for (let i = 0; i < bumps.length; i++) {
            writer.write(bumpBytes?.[i] ?? bumps[i].toBinary());
          }
          writer.writeVarIntNum(txs.length);
          for (const item of txs) {
            writer.write(item.tx.toUint8Array());
            if (typeof item.pathIndex === "number") {
              writer.writeUInt8(1);
              writer.writeVarIntNum(item.pathIndex);
            } else {
              writer.writeUInt8(0);
            }
          }
        }
        #collectBEEFTransactions(allowPartial) {
          const bumps = [];
          const bumpIndexByInstance = /* @__PURE__ */ new Map();
          const bumpIndexByRoot = /* @__PURE__ */ new Map();
          const txs = [];
          const seenTxids = /* @__PURE__ */ new Set();
          const scheduledTxids = /* @__PURE__ */ new Set();
          const stack = [{ tx: this, expanded: false }];
          while (stack.length > 0) {
            const frame = stack.pop();
            if (frame == null)
              continue;
            if (frame.expanded) {
              this.#appendBEEFTransaction(frame.tx, seenTxids, txs, bumps, bumpIndexByInstance, bumpIndexByRoot);
              continue;
            }
            this.#scheduleBEEFTransaction(frame.tx, allowPartial, scheduledTxids, stack);
          }
          return { bumps, txs };
        }
        #appendBEEFTransaction(tx, seenTxids, txs, bumps, bumpIndexByInstance, bumpIndexByRoot) {
          const txid2 = tx.id("hex");
          if (seenTxids.has(txid2))
            return;
          const item = { tx };
          if (tx.merklePath != null) {
            item.pathIndex = this.#getBEEFPathIndex(tx.merklePath, bumps, bumpIndexByInstance, bumpIndexByRoot);
          }
          seenTxids.add(txid2);
          txs.push(item);
        }
        #scheduleBEEFTransaction(tx, allowPartial, scheduledTxids, stack) {
          const txid2 = tx.id("hex");
          if (scheduledTxids.has(txid2))
            return;
          scheduledTxids.add(txid2);
          stack.push({ tx, expanded: true });
          if (tx.merklePath != null)
            return;
          for (const input of tx.inputs) {
            const source = input.sourceTransaction;
            if (source != null)
              stack.push({ tx: source, expanded: false });
            else if (allowPartial === false)
              throw new Error("A required source transaction is missing!");
          }
        }
        #getBEEFPathIndex(merklePath, bumps, bumpIndexByInstance, bumpIndexByRoot) {
          const existingByInstance = bumpIndexByInstance.get(merklePath);
          if (existingByInstance !== void 0)
            return existingByInstance;
          const key = `${merklePath.blockHeight}:${merklePath.computeRoot()}`;
          const existingByRoot = bumpIndexByRoot.get(key);
          if (existingByRoot !== void 0) {
            bumps[existingByRoot].combine(merklePath);
            bumpIndexByInstance.set(merklePath, existingByRoot);
            return existingByRoot;
          }
          const newIndex = bumps.length;
          bumps.push(merklePath);
          bumpIndexByInstance.set(merklePath, newIndex);
          bumpIndexByRoot.set(key, newIndex);
          return newIndex;
        }
        #reserveBEEFWriter(writer, bumps, txs) {
          let bumpBytes;
          if (writer instanceof WriterUint8Array) {
            bumpBytes = bumps.map((bump) => bump.toBinaryUint8Array());
            let remainingBytes = 16;
            for (const bytes3 of bumpBytes)
              remainingBytes += bytes3.length;
            for (const item of txs)
              remainingBytes += item.tx.toUint8Array().length + 10;
            writer.reserve(remainingBytes);
          }
          return bumpBytes;
        }
        /**
         * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
         *
         * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
         *
         * @returns {number[]} The serialized BEEF structure
         * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
         */
        toBEEF(allowPartial) {
          const writer = new Writer();
          this.writeSerializedBEEF(writer, allowPartial);
          return writer.toArray();
        }
        /**
         * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
         *
         * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
         *
         * @returns {number[]} The serialized BEEF structure
         * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
         * @deprecated This historical method returns a legacy `number[]` at runtime
         * despite its declared type. Use {@link toBEEFBytes} for a real Uint8Array.
         */
        toBEEFUint8Array(allowPartial) {
          const writer = new WriterUint8Array();
          this.writeSerializedBEEF(writer, allowPartial);
          return writer.toArray();
        }
        /**
         * Serializes BEEF to a real typed byte array.
         *
         * @remarks This replaces the historical `toBEEFUint8Array` method, whose
         * runtime value is a legacy `number[]` despite its declared return type.
         */
        toBEEFBytes(allowPartial) {
          const writer = new WriterUint8Array();
          this.writeSerializedBEEF(writer, allowPartial);
          return writer.toUint8Array();
        }
        /**
         * Serializes this transaction and its inputs into the Atomic BEEF (BRC-95) format.
         * The Atomic BEEF format starts with a 4-byte prefix `0x01010101`, followed by the TXID of the subject transaction,
         * and then the BEEF data containing only the subject transaction and its dependencies.
         * This format ensures that the BEEF structure is atomic and contains no unrelated transactions.
         *
         * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
         *
         * @returns {number[]} - The serialized Atomic BEEF structure.
         * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
         */
        toAtomicBEEF(allowPartial) {
          this.materializeSourceTXIDs();
          const prefix = [1, 1, 1, 1];
          const txHash = this.hash();
          const beefData = this.toBEEF(allowPartial);
          return prefix.concat(txHash, beefData);
        }
        /**
         * Serializes this transaction and its inputs into the Atomic BEEF (BRC-95) format.
         * The Atomic BEEF format starts with a 4-byte prefix `0x01010101`, followed by the TXID of the subject transaction,
         * and then the BEEF data containing only the subject transaction and its dependencies.
         * This format ensures that the BEEF structure is atomic and contains no unrelated transactions.
         *
         * @param allowPartial If true, error will not be thrown if there are any missing sourceTransactions.
         *
         * @returns {number[]} - The serialized Atomic BEEF structure.
         * @throws Error if there are any missing sourceTransactions unless `allowPartial` is true.
         */
        toAtomicBEEFUint8Array(allowPartial) {
          this.materializeSourceTXIDs();
          const writer = new WriterUint8Array();
          const prefix = [1, 1, 1, 1];
          writer.write(prefix);
          const txHash = this.hash();
          writer.write(txHash);
          this.writeSerializedBEEF(writer, allowPartial);
          return writer.toUint8Array();
        }
        /**
         * Completes the transaction using a wallet interface, which will handle
         * signing and transaction finalization. This method converts the current
         * transaction into a format that can be processed by the wallet, and then
         * updates this transaction object with the result from the wallet.
         *
         * @param {WalletInterface} wallet - The BRC-100 compliant wallet to use for completing the transaction
         * @param {string} [actionDescription] - Optional description for the action
         * @param {string} [originator] - Optional originator domain name
         * @param {CreateActionOptions} [options] - Optional settings for transaction creation (e.g., acceptDelayedBroadcast, trustSelf, noSend, etc.)
         * @returns {Promise<void>}
         */
        async completeWithWallet(wallet, actionDescription, originator, options) {
          const inputCount = this.inputs.length;
          const outputCount = this.outputs.length;
          const description = actionDescription ?? `Transaction with ${inputCount} input(s) and ${outputCount} output(s)`;
          const hasTemplates = this.inputs.some((input) => input.unlockingScriptTemplate != null);
          const actionArgs = await this.#buildWalletActionArgs(description, hasTemplates);
          actionArgs.options = options;
          const inputSigners = {};
          for (let index = 0; index < this.inputs.length; index++) {
            const template = this.inputs[index].unlockingScriptTemplate;
            if (template == null)
              continue;
            const outpoint2 = actionArgs.inputs[index].outpoint;
            inputSigners[outpoint2] = async (transaction, inputIndex) => await template.sign(transaction, inputIndex);
          }
          const newTransaction = await completeBoundAction(wallet, actionArgs, { inputSigners }, originator, this.inputs.map((input, index) => {
            const sourceOutput = input.sourceTransaction?.outputs[input.sourceOutputIndex];
            if (sourceOutput == null) {
              throw new Error(`Input ${index} references a source output that does not exist`);
            }
            return requireSatoshiAmount(sourceOutput.satoshis, `Input ${index} source amount`);
          }));
          this.version = newTransaction.version;
          this.inputs = newTransaction.inputs;
          this.outputs = newTransaction.outputs;
          this.lockTime = newTransaction.lockTime;
          this.merklePath = newTransaction.merklePath;
          this.#invalidateSerializationCaches();
          this.metadata = {
            ...this.metadata,
            ...newTransaction.metadata
          };
        }
        async #buildWalletActionArgs(description, hasTemplates) {
          const actionArgs = {
            description,
            inputs: [],
            outputs: [],
            lockTime: this.lockTime,
            version: this.version
          };
          this.materializeSourceTXIDs();
          const beefData = new Beef();
          for (let index = 0; index < this.inputs.length; index++) {
            const input = this.inputs[index];
            if (input.sourceTransaction == null) {
              throw new Error("All inputs must have a sourceTransaction when using completeWithWallet");
            }
            beefData.mergeTransaction(input.sourceTransaction);
            actionArgs.inputs.push(await this.#buildWalletInputArg(input, index, hasTemplates));
          }
          if (this.inputs.length > 0)
            actionArgs.inputBEEF = beefData.toUint8Array();
          actionArgs.outputs = this.outputs.map((output) => ({
            satoshis: output.satoshis,
            lockingScript: output.lockingScript.toHex(),
            outputDescription: "Output from source transaction"
          }));
          if (Array.isArray(this.metadata?.labels))
            actionArgs.labels = this.metadata.labels;
          return actionArgs;
        }
        async #buildWalletInputArg(input, index, hasTemplates) {
          const inputArg = {
            outpoint: `${input.sourceTransaction.id("hex")}.${input.sourceOutputIndex}`,
            inputDescription: "Input from source transaction",
            sequenceNumber: input.sequence
          };
          if (!hasTemplates) {
            if (input.unlockingScript == null) {
              throw new Error("All inputs must have an unlockingScript when using completeWithWallet");
            }
            inputArg.unlockingScript = input.unlockingScript.toHex();
            return inputArg;
          }
          if (input.unlockingScriptTemplate != null) {
            inputArg.unlockingScriptLength = await input.unlockingScriptTemplate.estimateLength(this, index);
          } else if (input.unlockingScript != null) {
            inputArg.unlockingScript = input.unlockingScript.toHex();
          } else {
            throw new Error(`Input ${index} must have either an unlockingScript or unlockingScriptTemplate`);
          }
          return inputArg;
        }
        /**
         * Returns the formatted preimage of a transaction for the requested input index, signature scope (default SIGHASH_FORKID | SIGHASH_ALL), and optional subscript.
         * @param inputIndex - The index of the input to generate the preimage for
         * @param signatureScope - The signature scope to use for the preimage
         * @param subscript - The subscript to use for the preimage (optional)
         * @returns The formatted preimage
         */
        preimage(inputIndex, signatureScope, subscript) {
          inputIndex ??= 0;
          signatureScope ??= TransactionSignature.SIGHASH_FORKID | TransactionSignature.SIGHASH_ALL;
          if (!Number.isSafeInteger(inputIndex) || inputIndex < 0 || inputIndex >= this.inputs.length) {
            throw new Error("Invalid input index");
          }
          requireUInt322(signatureScope, "signatureScope");
          const flags = signatureScope & 240;
          if (flags !== 224 && flags !== 192 && flags !== 64) {
            throw new Error("FORKID must be set");
          }
          const coverage = signatureScope & 15;
          if (coverage < 1 || coverage > 3) {
            throw new Error("Invalid signature coverage, must be all, none or single");
          }
          const input = this.inputs[inputIndex];
          const sourceOutputIndex = requireUInt322(input.sourceOutputIndex, "sourceOutputIndex");
          if (input.sourceTransaction == null) {
            throw new Error("Source transaction is required");
          }
          const embeddedSourceTXID = requireTXID(input.sourceTransaction.id("hex"), "sourceTransaction ID");
          if (input.sourceTXID !== void 0 && requireTXID(input.sourceTXID, "sourceTXID") !== embeddedSourceTXID) {
            throw new Error("sourceTXID does not match sourceTransaction");
          }
          const output = input.sourceTransaction.outputs[sourceOutputIndex];
          if (output == null) {
            throw new Error(`Source transaction's output at index ${sourceOutputIndex} is required`);
          }
          const sourceSatoshis = requireSatoshiAmount(output.satoshis, "Source output amount");
          const inputSequence = requireUInt322(input.sequence ?? 4294967295, "inputSequence");
          const resolvedSubscript = subscript ?? output.lockingScript;
          if (resolvedSubscript == null || typeof resolvedSubscript.toUint8Array !== "function") {
            throw new Error("subscript must be a locking script");
          }
          return TransactionSignature.format({
            sourceTXID: embeddedSourceTXID,
            sourceOutputIndex,
            sourceSatoshis,
            transactionVersion: this.version,
            otherInputs: [],
            allInputs: this.inputs,
            inputIndex,
            outputs: this.outputs,
            inputSequence,
            subscript: resolvedSubscript,
            lockTime: this.lockTime,
            scope: signatureScope
          });
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/index.js
  var init_transaction = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/index.js"() {
      init_Transaction();
      init_ScriptVerificationBackend();
      init_Beef();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/index.js
  var init_fee_models = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/fee-models/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/index.js
  var init_broadcasters = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/broadcasters/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/index.js
  var init_chaintrackers = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/chaintrackers/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/transaction/http/index.js
  var init_http = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/transaction/http/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/messages/index.js
  var init_messages = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/messages/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/compat/index.js
  var init_compat = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/compat/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/totp/totp.js
  var MAX_PERIOD_SECONDS;
  var init_totp = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/totp/totp.js"() {
      MAX_PERIOD_SECONDS = 24 * 60 * 60;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/totp/index.js
  var init_totp2 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/totp/index.js"() {
      init_totp();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/WalletWire.js
  var MAX_WALLET_WIRE_FRAME_BYTES;
  var init_WalletWire = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/WalletWire.js"() {
      MAX_WALLET_WIRE_FRAME_BYTES = 256 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/ExactByteCache.js
  var BufferCtor5, BufferCompare, SharedArrayBufferCtor, maximumCachedBytes, ExactByteCache;
  var init_ExactByteCache = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/ExactByteCache.js"() {
      BufferCtor5 = globalThis.Buffer;
      BufferCompare = typeof BufferCtor5?.compare === "function" ? BufferCtor5.compare : void 0;
      SharedArrayBufferCtor = globalThis.SharedArrayBuffer;
      maximumCachedBytes = 16 * 1024 * 1024;
      ExactByteCache = class {
        cached;
        get(bytes3) {
          const cached = this.cached;
          if (cached == null || !(bytes3 instanceof Uint8Array) || bytes3.length !== cached.bytes.length || BufferCompare == null || SharedArrayBufferCtor != null && bytes3.buffer instanceof SharedArrayBufferCtor || BufferCompare(bytes3, cached.bytes) !== 0) {
            return void 0;
          }
          return cached.value;
        }
        set(bytes3, value) {
          if (bytes3 instanceof Uint8Array && bytes3.length <= maximumCachedBytes && BufferCompare != null && !(SharedArrayBufferCtor != null && bytes3.buffer instanceof SharedArrayBufferCtor)) {
            this.cached = { bytes: new Uint8Array(bytes3), value };
          }
        }
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/Wallet.interfaces.js
  var SecurityLevels;
  var init_Wallet_interfaces = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/Wallet.interfaces.js"() {
      (function(SecurityLevels2) {
        SecurityLevels2[SecurityLevels2["Silent"] = 0] = "Silent";
        SecurityLevels2[SecurityLevels2["App"] = 1] = "App";
        SecurityLevels2[SecurityLevels2["Counterparty"] = 2] = "Counterparty";
      })(SecurityLevels || (SecurityLevels = {}));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/BRC100ByteEncoding.js
  var init_BRC100ByteEncoding = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/BRC100ByteEncoding.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/KeyDeriver.js
  var init_KeyDeriver = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/KeyDeriver.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/WalletResultValidation.js
  function setAdd(set, value) {
    intrinsicApply(intrinsicSetAdd, set, [value]);
  }
  var intrinsicArrayPrototype, intrinsicDateParse, intrinsicNumberMaxSafeInteger, intrinsicNumberIsFinite, intrinsicNumberIsInteger, intrinsicNumberIsSafeInteger, intrinsicObjectPrototype, intrinsicObjectCreate, intrinsicObjectFreeze, intrinsicObjectGetOwnPropertyDescriptor, intrinsicObjectGetPrototypeOf, intrinsicRegExpExec, intrinsicRegExpTest, intrinsicStringSplit, intrinsicStringToLowerCase, intrinsicStringTrim, intrinsicStringReplace, intrinsicStringNormalize, intrinsicStringIndexOf, intrinsicStringSlice, intrinsicStringStartsWith, intrinsicURLProtocolGetter, intrinsicTypedArrayPrototype, intrinsicTypedArrayBufferGetter, intrinsicTypedArrayLengthGetter, intrinsicTypedArrayTagGetter, intrinsicUint8ArraySet, intrinsicSharedArrayBufferByteLengthGetter, IntrinsicSet, IntrinsicWeakSet, intrinsicMapGet, intrinsicMapSet, intrinsicMapHas, intrinsicMapForEach, intrinsicSetAdd, intrinsicSetHas, intrinsicSetSize, intrinsicWeakMapGet, intrinsicWeakMapSet, intrinsicWeakSetAdd, intrinsicWeakSetHas, intrinsicApply, actionStatuses, sendWithStatuses, maxObjectGraphNodes, maxObjectGraphProperties, maxCertificateBytes, validatedAtomicTransactions, ownedByteArrays2, emptySourceValueEvidence;
  var init_WalletResultValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/WalletResultValidation.js"() {
      init_ExactByteCache();
      intrinsicArrayPrototype = Array.prototype;
      intrinsicDateParse = Date.parse;
      intrinsicNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
      intrinsicNumberIsFinite = Number.isFinite;
      intrinsicNumberIsInteger = Number.isInteger;
      intrinsicNumberIsSafeInteger = Number.isSafeInteger;
      intrinsicObjectPrototype = Object.prototype;
      intrinsicObjectCreate = Object.create;
      intrinsicObjectFreeze = Object.freeze;
      intrinsicObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      intrinsicObjectGetPrototypeOf = Object.getPrototypeOf;
      intrinsicRegExpExec = RegExp.prototype.exec;
      intrinsicRegExpTest = RegExp.prototype.test;
      intrinsicStringSplit = String.prototype.split;
      intrinsicStringToLowerCase = String.prototype.toLowerCase;
      intrinsicStringTrim = String.prototype.trim;
      intrinsicStringReplace = String.prototype.replace;
      intrinsicStringNormalize = String.prototype.normalize;
      intrinsicStringIndexOf = String.prototype.indexOf;
      intrinsicStringSlice = String.prototype.slice;
      intrinsicStringStartsWith = String.prototype.startsWith;
      intrinsicURLProtocolGetter = intrinsicObjectGetOwnPropertyDescriptor(URL.prototype, "protocol")?.get;
      intrinsicTypedArrayPrototype = intrinsicObjectGetPrototypeOf(Uint8Array.prototype);
      intrinsicTypedArrayBufferGetter = intrinsicObjectGetOwnPropertyDescriptor(intrinsicTypedArrayPrototype, "buffer")?.get;
      intrinsicTypedArrayLengthGetter = intrinsicObjectGetOwnPropertyDescriptor(intrinsicTypedArrayPrototype, "length")?.get;
      intrinsicTypedArrayTagGetter = intrinsicObjectGetOwnPropertyDescriptor(intrinsicTypedArrayPrototype, Symbol.toStringTag)?.get;
      intrinsicUint8ArraySet = Uint8Array.prototype.set;
      intrinsicSharedArrayBufferByteLengthGetter = typeof SharedArrayBuffer === "undefined" ? void 0 : intrinsicObjectGetOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength")?.get;
      IntrinsicSet = Set;
      IntrinsicWeakSet = WeakSet;
      intrinsicMapGet = Map.prototype.get;
      intrinsicMapSet = Map.prototype.set;
      intrinsicMapHas = Map.prototype.has;
      intrinsicMapForEach = Map.prototype.forEach;
      intrinsicSetAdd = Set.prototype.add;
      intrinsicSetHas = Set.prototype.has;
      intrinsicSetSize = intrinsicObjectGetOwnPropertyDescriptor(Set.prototype, "size").get;
      intrinsicWeakMapGet = WeakMap.prototype.get;
      intrinsicWeakMapSet = WeakMap.prototype.set;
      intrinsicWeakSetAdd = WeakSet.prototype.add;
      intrinsicWeakSetHas = WeakSet.prototype.has;
      intrinsicApply = Reflect.apply;
      actionStatuses = new IntrinsicSet();
      setAdd(actionStatuses, "completed");
      setAdd(actionStatuses, "unprocessed");
      setAdd(actionStatuses, "sending");
      setAdd(actionStatuses, "unproven");
      setAdd(actionStatuses, "unsigned");
      setAdd(actionStatuses, "nosend");
      setAdd(actionStatuses, "nonfinal");
      setAdd(actionStatuses, "failed");
      sendWithStatuses = new IntrinsicSet();
      setAdd(sendWithStatuses, "unproven");
      setAdd(sendWithStatuses, "sending");
      setAdd(sendWithStatuses, "failed");
      maxObjectGraphNodes = 1e6;
      maxObjectGraphProperties = maxObjectGraphNodes + 2;
      maxCertificateBytes = 16 * 1024 * 1024;
      validatedAtomicTransactions = new ExactByteCache();
      ownedByteArrays2 = new IntrinsicWeakSet();
      emptySourceValueEvidence = intrinsicObjectFreeze(intrinsicObjectCreate(null));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/WalletWireCalls.js
  var calls;
  var init_WalletWireCalls = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/WalletWireCalls.js"() {
      (function(calls2) {
        calls2[calls2["createAction"] = 1] = "createAction";
        calls2[calls2["signAction"] = 2] = "signAction";
        calls2[calls2["abortAction"] = 3] = "abortAction";
        calls2[calls2["listActions"] = 4] = "listActions";
        calls2[calls2["internalizeAction"] = 5] = "internalizeAction";
        calls2[calls2["listOutputs"] = 6] = "listOutputs";
        calls2[calls2["relinquishOutput"] = 7] = "relinquishOutput";
        calls2[calls2["getPublicKey"] = 8] = "getPublicKey";
        calls2[calls2["revealCounterpartyKeyLinkage"] = 9] = "revealCounterpartyKeyLinkage";
        calls2[calls2["revealSpecificKeyLinkage"] = 10] = "revealSpecificKeyLinkage";
        calls2[calls2["encrypt"] = 11] = "encrypt";
        calls2[calls2["decrypt"] = 12] = "decrypt";
        calls2[calls2["createHmac"] = 13] = "createHmac";
        calls2[calls2["verifyHmac"] = 14] = "verifyHmac";
        calls2[calls2["createSignature"] = 15] = "createSignature";
        calls2[calls2["verifySignature"] = 16] = "verifySignature";
        calls2[calls2["acquireCertificate"] = 17] = "acquireCertificate";
        calls2[calls2["listCertificates"] = 18] = "listCertificates";
        calls2[calls2["proveCertificate"] = 19] = "proveCertificate";
        calls2[calls2["relinquishCertificate"] = 20] = "relinquishCertificate";
        calls2[calls2["discoverByIdentityKey"] = 21] = "discoverByIdentityKey";
        calls2[calls2["discoverByAttributes"] = 22] = "discoverByAttributes";
        calls2[calls2["isAuthenticated"] = 23] = "isAuthenticated";
        calls2[calls2["waitForAuthentication"] = 24] = "waitForAuthentication";
        calls2[calls2["getHeight"] = 25] = "getHeight";
        calls2[calls2["getHeaderForHeight"] = 26] = "getHeaderForHeight";
        calls2[calls2["getNetwork"] = 27] = "getNetwork";
        calls2[calls2["getVersion"] = 28] = "getVersion";
      })(calls || (calls = {}));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/WalletArgumentValidation.js
  var init_WalletArgumentValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/WalletArgumentValidation.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/WalletError.js
  var walletErrors;
  var init_WalletError = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/WalletError.js"() {
      (function(walletErrors2) {
        walletErrors2[walletErrors2["unknownError"] = 1] = "unknownError";
        walletErrors2[walletErrors2["unsupportedAction"] = 2] = "unsupportedAction";
        walletErrors2[walletErrors2["invalidHmac"] = 3] = "invalidHmac";
        walletErrors2[walletErrors2["invalidSignature"] = 4] = "invalidSignature";
        walletErrors2[walletErrors2["reviewActions"] = 5] = "reviewActions";
        walletErrors2[walletErrors2["invalidParameter"] = 6] = "invalidParameter";
        walletErrors2[walletErrors2["insufficientFunds"] = 7] = "insufficientFunds";
        walletErrors2[walletErrors2["abortRefused"] = 8] = "abortRefused";
      })(walletErrors || (walletErrors = {}));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/index.js
  var init_substrates = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/substrates/index.js"() {
      init_WalletWire();
      init_WalletWireCalls();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/WalletLoggerInterface.js
  var init_WalletLoggerInterface = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/WalletLoggerInterface.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/wallet/index.js
  var init_wallet = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/wallet/index.js"() {
      init_Wallet_interfaces();
      init_BRC100ByteEncoding();
      init_KeyDeriver();
      init_WalletError();
      init_substrates();
      init_WalletLoggerInterface();
      init_completeBoundAction();
      init_WalletArgumentValidation();
      init_WalletResultValidation();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/certificates/MasterCertificate.js
  var MAX_ENCRYPTED_CERTIFICATE_FIELD_BYTES, MAX_DECRYPTED_CERTIFICATE_FIELD_BYTES;
  var init_MasterCertificate = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/certificates/MasterCertificate.js"() {
      MAX_ENCRYPTED_CERTIFICATE_FIELD_BYTES = 1024 * 1024;
      MAX_DECRYPTED_CERTIFICATE_FIELD_BYTES = 64 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/certificates/VerifiableCertificate.js
  var MAX_ENCRYPTED_FIELD_BYTES, MAX_DECRYPTED_FIELD_BYTES;
  var init_VerifiableCertificate = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/certificates/VerifiableCertificate.js"() {
      MAX_ENCRYPTED_FIELD_BYTES = 1024 * 1024;
      MAX_DECRYPTED_FIELD_BYTES = 64 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/certificates/__tests/CompletedProtoWallet.js
  var init_CompletedProtoWallet = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/certificates/__tests/CompletedProtoWallet.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/certificates/index.js
  var init_certificates = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/certificates/index.js"() {
      init_MasterCertificate();
      init_VerifiableCertificate();
      init_CompletedProtoWallet();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/SessionManager.js
  var DEFAULT_AUTH_SESSION_IDLE_MS;
  var init_SessionManager = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/SessionManager.js"() {
      DEFAULT_AUTH_SESSION_IDLE_MS = 30 * 60 * 1e3;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/utils/createNonce.js
  var init_createNonce = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/utils/createNonce.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/utils/verifyNonce.js
  var init_verifyNonce = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/utils/verifyNonce.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/utils/getVerifiableCertificates.js
  var init_getVerifiableCertificates = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/utils/getVerifiableCertificates.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/utils/validateCertificates.js
  var init_validateCertificates = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/utils/validateCertificates.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/Peer.js
  var BufferCtor6;
  var init_Peer = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/Peer.js"() {
      BufferCtor6 = typeof globalThis === "undefined" ? void 0 : globalThis.Buffer;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/types.js
  var init_types = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/types.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/utils/index.js
  var init_utils2 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/utils/index.js"() {
      init_verifyNonce();
      init_createNonce();
      init_getVerifiableCertificates();
      init_validateCertificates();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/transports/SimplifiedFetchTransport.js
  var defaultFetch, DEFAULT_SIMPLIFIED_FETCH_MAX_RESPONSE_BYTES, DEFAULT_SIMPLIFIED_FETCH_MAX_HANDSHAKE_RESPONSE_BYTES, MAX_SIGNED_RESPONSE_HEADER_VALUE_BYTES, MAX_SIGNED_RESPONSE_HEADER_BYTES, MAX_REQUESTED_CERTIFICATES_HEADER_BYTES, MAX_AUTH_REQUEST_PAYLOAD_BYTES;
  var init_SimplifiedFetchTransport = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/transports/SimplifiedFetchTransport.js"() {
      defaultFetch = typeof globalThis !== "undefined" && typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : fetch;
      DEFAULT_SIMPLIFIED_FETCH_MAX_RESPONSE_BYTES = 16 * 1024 * 1024;
      DEFAULT_SIMPLIFIED_FETCH_MAX_HANDSHAKE_RESPONSE_BYTES = 1024 * 1024;
      MAX_SIGNED_RESPONSE_HEADER_VALUE_BYTES = 32 * 1024;
      MAX_SIGNED_RESPONSE_HEADER_BYTES = 256 * 1024;
      MAX_REQUESTED_CERTIFICATES_HEADER_BYTES = 256 * 1024;
      MAX_AUTH_REQUEST_PAYLOAD_BYTES = 16 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/clients/AuthFetch.js
  var MAX_AUTH_RESPONSE_HEADER_VALUE_BYTES, MAX_AUTH_RESPONSE_HEADER_BYTES, MAX_AUTH_RESPONSE_FRAME_OVERHEAD_BYTES, MAX_AUTH_HTTP_REQUEST_FRAME_BYTES, MAX_PAYMENT_TRANSACTION_BYTES;
  var init_AuthFetch = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/clients/AuthFetch.js"() {
      MAX_AUTH_RESPONSE_HEADER_VALUE_BYTES = 32 * 1024;
      MAX_AUTH_RESPONSE_HEADER_BYTES = 256 * 1024;
      MAX_AUTH_RESPONSE_FRAME_OVERHEAD_BYTES = 512 * 1024;
      MAX_AUTH_HTTP_REQUEST_FRAME_BYTES = 16 * 1024 * 1024;
      MAX_PAYMENT_TRANSACTION_BYTES = 16 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/clients/index.js
  var init_clients = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/clients/index.js"() {
      init_AuthFetch();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/transports/index.js
  var init_transports = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/transports/index.js"() {
      init_SimplifiedFetchTransport();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/auth/index.js
  var init_auth = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/auth/index.js"() {
      init_certificates();
      init_Peer();
      init_SessionManager();
      init_types();
      init_utils2();
      init_clients();
      init_transports();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/overlay-tools/LookupResources.js
  var DEFAULT_LOOKUP_LIMITS;
  var init_LookupResources = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/overlay-tools/LookupResources.js"() {
      DEFAULT_LOOKUP_LIMITS = Object.freeze({
        maxHosts: 256,
        maxHostsPerTracker: 64,
        maxTrackers: 16,
        hostConcurrency: 8,
        trackerConcurrency: 4,
        maxResponseBytes: 32 * 1024 * 1024,
        maxTotalBytes: 64 * 1024 * 1024,
        maxOutputs: 4096,
        maxEvidenceOutputs: 512,
        maxEvidenceBytes: 16 * 1024 * 1024
      });
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/telemetry/Telemetry.js
  var MAX_SANITIZER_LENGTH, systemDateNow, SENSITIVE_TERMS, SENSITIVE_LABEL_PATTERNS, BYTE_VALUE, SERIALIZED_BYTE_ARRAY;
  var init_Telemetry = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/telemetry/Telemetry.js"() {
      MAX_SANITIZER_LENGTH = 64 * 1024;
      systemDateNow = Date.now.bind(Date);
      SENSITIVE_TERMS = [
        "password",
        "passphrase",
        "privatekey",
        "presentationkey",
        "recoverykey",
        "snapshot",
        "mnemonic",
        "seed",
        "secret",
        "shamir",
        "share",
        "ciphertext",
        "plaintext",
        "authtoken",
        "accesstoken",
        "refreshtoken",
        "token",
        "bearer",
        "authorization",
        "credential",
        "cookie",
        "session",
        "apikey",
        "key",
        "signature",
        "hmac",
        "derivation",
        "certificate",
        "revocation",
        "otp",
        "onetime",
        "pin"
      ];
      SENSITIVE_LABEL_PATTERNS = SENSITIVE_TERMS.map((term) => {
        const flexibleTerm = term.replace(/key|token|time/g, (match) => `[_ -]?${match}`);
        return new RegExp(String.raw`(${flexibleTerm}\s*["'=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,;}]+)`, "gi");
      });
      BYTE_VALUE = String.raw`(?:25[0-5]|2[0-4]\d|1?\d?\d)`;
      SERIALIZED_BYTE_ARRAY = new RegExp(String.raw`\[(?:\s*${BYTE_VALUE}\s*,){15,}\s*${BYTE_VALUE}\s*\]`, "g");
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/overlay-tools/LookupResolver.js
  var defaultFetch2, DEFAULT_SLAP_TRACKERS, DEFAULT_TESTNET_SLAP_TRACKERS, DEFAULT_TTN_SLAP_TRACKERS, MAX_LOOKUP_RESPONSE_BYTES, MAX_LOOKUP_REQUEST_BYTES, MAX_LOOKUP_OUTPUTS, MAX_LOOKUP_CONTEXT_BYTES, MAX_AGGREGATED_BEEF_BYTES;
  var init_LookupResolver = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/overlay-tools/LookupResolver.js"() {
      init_LookupResources();
      defaultFetch2 = typeof globalThis !== "undefined" && typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : fetch;
      DEFAULT_SLAP_TRACKERS = Object.freeze([
        // BSVA clusters
        "https://overlay-us-1.bsvb.tech",
        "https://overlay-eu-1.bsvb.tech",
        "https://overlay-ap-1.bsvb.tech",
        // Babbage primary overlay service
        "https://users.bapp.dev"
        // NOTE: Other entities may submit pull requests to the library if they maintain SLAP overlay services.
        // Additional trackers run by different entities contribute to greater network resiliency.
        // It also generally doesn't hurt to have more trackers in this list.
        // DISCLAIMER:
        // Trackers known to host invalid or illegal records will be removed at the discretion of the BSV Association.
      ]);
      DEFAULT_TESTNET_SLAP_TRACKERS = Object.freeze([
        // Babbage primary testnet overlay service
        "https://testnet-users.bapp.dev"
      ]);
      DEFAULT_TTN_SLAP_TRACKERS = Object.freeze([
        // Canonical staging root; kept separate from testnet to prevent cross-chain discovery.
        "https://staging-overlay.babbage.systems"
      ]);
      MAX_LOOKUP_RESPONSE_BYTES = 32 * 1024 * 1024;
      MAX_LOOKUP_REQUEST_BYTES = 1024 * 1024;
      MAX_LOOKUP_OUTPUTS = DEFAULT_LOOKUP_LIMITS.maxOutputs;
      MAX_LOOKUP_CONTEXT_BYTES = 1024 * 1024;
      MAX_AGGREGATED_BEEF_BYTES = 64 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/overlay-tools/SHIPBroadcaster.js
  var MAX_SHIP_RESPONSE_BYTES, MAX_SHIP_BODY_BYTES, MAX_SHIP_ADVERTISEMENT_BEEF_BYTES, MAX_SHIP_TOTAL_ADVERTISEMENT_BEEF_BYTES;
  var init_SHIPBroadcaster = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/overlay-tools/SHIPBroadcaster.js"() {
      MAX_SHIP_RESPONSE_BYTES = 1024 * 1024;
      MAX_SHIP_BODY_BYTES = 64 * 1024 * 1024;
      MAX_SHIP_ADVERTISEMENT_BEEF_BYTES = 16 * 1024 * 1024;
      MAX_SHIP_TOTAL_ADVERTISEMENT_BEEF_BYTES = 64 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/overlay-tools/withDoubleSpendRetry.js
  var MAX_COMPETING_BEEF_BYTES;
  var init_withDoubleSpendRetry = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/overlay-tools/withDoubleSpendRetry.js"() {
      MAX_COMPETING_BEEF_BYTES = 64 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/overlay-tools/index.js
  var init_overlay_tools = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/overlay-tools/index.js"() {
      init_LookupResolver();
      init_SHIPBroadcaster();
      init_withDoubleSpendRetry();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/storage/UHRPAdvertisementValidation.js
  var init_UHRPAdvertisementValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/storage/UHRPAdvertisementValidation.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/storage/index.js
  var init_storage = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/storage/index.js"() {
      init_UHRPAdvertisementValidation();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/identity/types/index.js
  var init_types2 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/identity/types/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/identity/IdentityClient.js
  var MAX_IDENTITY_LOOKUP_BEEF_BYTES;
  var init_IdentityClient = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/identity/IdentityClient.js"() {
      MAX_IDENTITY_LOOKUP_BEEF_BYTES = 16 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/identity/index.js
  var init_identity = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/identity/index.js"() {
      init_IdentityClient();
      init_types2();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/registry/registryTokenValidation.js
  var MAX_REGISTRY_FIELD_BYTES, MAX_REGISTRY_TOKEN_BYTES;
  var init_registryTokenValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/registry/registryTokenValidation.js"() {
      MAX_REGISTRY_FIELD_BYTES = 16 * 1024;
      MAX_REGISTRY_TOKEN_BYTES = 64 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/registry/RegistryClient.js
  var MAX_REGISTRY_BEEF_BYTES;
  var init_RegistryClient = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/registry/RegistryClient.js"() {
      MAX_REGISTRY_BEEF_BYTES = 256 * 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/registry/types/index.js
  var init_types3 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/registry/types/index.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/registry/index.js
  var init_registry = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/registry/index.js"() {
      init_RegistryClient();
      init_registryTokenValidation();
      init_types3();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/kvstore/kvStoreTokenValidation.js
  var MAX_VALUE_BYTES;
  var init_kvStoreTokenValidation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/kvstore/kvStoreTokenValidation.js"() {
      MAX_VALUE_BYTES = 1024 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/kvstore/index.js
  var init_kvstore = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/kvstore/index.js"() {
      init_kvStoreTokenValidation();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/CommsLayer.js
  var init_CommsLayer = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/CommsLayer.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/IdentityLayer.js
  var init_IdentityLayer = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/IdentityLayer.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/types.js
  var REMITTANCE_STATE_TRANSITIONS;
  var init_types4 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/types.js"() {
      REMITTANCE_STATE_TRANSITIONS = {
        new: ["identityRequested", "invoiced", "settled", "terminated", "errored"],
        identityRequested: [
          "identityResponded",
          "identityAcknowledged",
          "invoiced",
          "settled",
          "terminated",
          "errored"
        ],
        identityResponded: ["identityAcknowledged", "invoiced", "settled", "terminated", "errored"],
        identityAcknowledged: ["invoiced", "settled", "terminated", "errored"],
        invoiced: [
          "identityRequested",
          "identityResponded",
          "identityAcknowledged",
          "settled",
          "terminated",
          "errored"
        ],
        settled: ["receipted", "terminated", "errored"],
        receipted: ["terminated", "errored"],
        terminated: ["errored"],
        errored: []
      };
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/RemittanceManager.js
  var MAX_REMITTANCE_ENVELOPE_BYTES, remittanceStates;
  var init_RemittanceManager = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/RemittanceManager.js"() {
      init_types4();
      MAX_REMITTANCE_ENVELOPE_BYTES = 16 * 1024 * 1024;
      remittanceStates = new Set(Object.keys(REMITTANCE_STATE_TRANSITIONS));
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/RemittanceModule.js
  var init_RemittanceModule = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/RemittanceModule.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/modules/BasicBRC29.js
  var MAX_SETTLEMENT_TRANSACTION_BYTES, MAX_NOTE_LENGTH;
  var init_BasicBRC29 = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/modules/BasicBRC29.js"() {
      MAX_SETTLEMENT_TRANSACTION_BYTES = 4 * 1024 * 1024;
      MAX_NOTE_LENGTH = 64 * 1024;
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/modules/index.js
  var init_modules = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/modules/index.js"() {
      init_BasicBRC29();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/remittance/index.js
  var init_remittance = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/remittance/index.js"() {
      init_CommsLayer();
      init_IdentityLayer();
      init_RemittanceManager();
      init_RemittanceModule();
      init_modules();
      init_types4();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/telemetry/TraceContext.js
  var init_TraceContext = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/telemetry/TraceContext.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/telemetry/WalletInstrumentation.js
  var init_WalletInstrumentation = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/telemetry/WalletInstrumentation.js"() {
    }
  });

  // node_modules/@bsv/sdk/dist/esm/src/telemetry/index.js
  var init_telemetry = __esm({
    "node_modules/@bsv/sdk/dist/esm/src/telemetry/index.js"() {
      init_Telemetry();
      init_TraceContext();
      init_WalletInstrumentation();
    }
  });

  // node_modules/@bsv/sdk/dist/esm/mod.js
  var init_mod = __esm({
    "node_modules/@bsv/sdk/dist/esm/mod.js"() {
      init_primitives();
      init_script();
      init_templates();
      init_transaction();
      init_fee_models();
      init_broadcasters();
      init_chaintrackers();
      init_http();
      init_messages();
      init_compat();
      init_totp2();
      init_wallet();
      init_substrates();
      init_auth();
      init_overlay_tools();
      init_storage();
      init_identity();
      init_registry();
      init_kvstore();
      init_remittance();
      init_telemetry();
    }
  });

  // site/src/deliver.js
  var require_deliver = __commonJS({
    "site/src/deliver.js"() {
      init_mod();
      var WOC = "https://api.whatsonchain.com/v1/bsv/main";
      var $ = (id) => document.getElementById(id);
      var short = (s2, n = 12) => s2 ? s2.slice(0, n) + "..." : "";
      var hexOf = (bytes3) => Array.from(bytes3, (b) => b.toString(16).padStart(2, "0")).join("");
      var ALPHA = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      function pkhHex(addr) {
        let n = 0n;
        for (const c of addr.trim()) {
          const v = ALPHA.indexOf(c);
          if (v < 0) throw new Error("bad address");
          n = n * 58n + BigInt(v);
        }
        let h = n.toString(16);
        if (h.length % 2) h = "0" + h;
        const bytes3 = Array.from(utils_exports.toArray(h, "hex"));
        while (bytes3.length < 25) bytes3.unshift(0);
        return hexOf(bytes3.slice(1, 21));
      }
      var REG = null;
      var PRIV = null;
      var ADDR = "";
      var SEL = null;
      var SIGNED = null;
      fetch("registry.json").then((r2) => r2.json()).then((j) => {
        REG = j;
      });
      async function woc(path) {
        const r2 = await fetch(WOC + path);
        if (!r2.ok) throw new Error(`chain ${r2.status}`);
        return r2.json();
      }
      async function txHex(txid2) {
        const r2 = await fetch(`${WOC}/tx/${txid2}/hex`);
        if (!r2.ok) throw new Error(`tx ${txid2.slice(0, 12)}\u2026 unavailable (${r2.status})`);
        return (await r2.text()).trim();
      }
      function twonkUnlock(priv, contractIdHex) {
        const base = new P2PKH().unlock(priv);
        const cid = Array.from(utils_exports.toArray(contractIdHex, "hex"));
        return {
          sign: async (tx, i) => {
            const b = await base.sign(tx, i);
            return UnlockingScript.fromBinary([...b.toBinary(), 32, ...cid]);
          },
          estimateLength: async () => await base.estimateLength() + 33
        };
      }
      $("wif-go").onclick = () => {
        try {
          PRIV = PrivateKey.fromWif($("wif").value.trim());
          ADDR = PRIV.toAddress();
          $("wif").value = "";
          $("wif-out").innerHTML = `seller address: <code>${ADDR}</code>`;
          $("wif-forget").disabled = false;
          listTokens();
        } catch {
          $("wif-out").textContent = "that WIF did not parse.";
        }
      };
      $("wif-forget").onclick = () => {
        PRIV = null;
        ADDR = "";
        SEL = null;
        SIGNED = null;
        $("wif-out").textContent = "";
        $("token-list").textContent = "Load a key first.";
        $("build").disabled = true;
        $("send").disabled = true;
        $("review").textContent = "Nothing signed yet.";
        $("wif-forget").disabled = true;
      };
      function listTokens() {
        const mine = REG.tokens.filter((t) => t.owner === ADDR);
        $("token-list").innerHTML = mine.length ? mine.map((t) => `<label><input type="radio" name="tok" value="${t.outpoint}"> ${t.title} <code>${short(t.outpoint, 20)}</code></label>`).join("<br>") : `This key owns none of the registry's 10 tokens. Enter an outpoint manually below.`;
        for (const r2 of document.querySelectorAll('input[name="tok"]')) {
          r2.onchange = () => selectOutpoint(r2.value, null);
        }
        if (mine.length === 1) {
          document.querySelector('input[name="tok"]').checked = true;
          selectOutpoint(mine[0].outpoint, mine[0].title);
        }
      }
      async function selectOutpoint(outpoint2, title) {
        try {
          const [txid2, vout] = outpoint2.split(":");
          const prev = Transaction.fromHex(await txHex(txid2));
          const out = prev.outputs[Number(vout)];
          const scriptHex = out.lockingScript.toHex();
          if (!scriptHex.startsWith("a914") || out.satoshis !== 546) throw new Error("not a Twonk-shaped output");
          SEL = { txid: txid2, vout: Number(vout), scriptHex, sats: out.satoshis, title: title || "manual outpoint" };
          $("build").disabled = false;
          $("review").textContent = `Selected ${SEL.title} at ${outpoint2}.`;
        } catch (e) {
          SEL = null;
          $("build").disabled = true;
          $("review").textContent = `Could not load outpoint: ${e.message}`;
        }
      }
      $("manual-out").onchange = () => {
        const v = $("manual-out").value.trim();
        if (/^[0-9a-f]{64}:\d+$/.test(v)) selectOutpoint(v, null);
      };
      $("build").onclick = async () => {
        $("review").textContent = "Building\u2026";
        $("send").disabled = true;
        try {
          const buyer = $("buyer").value.trim();
          if (!buyer) throw new Error("buyer address required");
          const buyerPkh = pkhHex(buyer);
          const fee = Math.max(500, Math.floor(Number($("fee").value) || 1500));
          let fundTxid, fundVout, fundTx;
          const manual = $("manual-fund").value.trim();
          if (manual && /^[0-9a-f]{64}:\d+$/.test(manual)) {
            [fundTxid, fundVout] = manual.split(":");
            fundVout = Number(fundVout);
            fundTx = Transaction.fromHex(await txHex(fundTxid));
          } else {
            const unspent = await woc(`/address/${ADDR}/unspent`);
            const cand = (unspent || []).filter((u) => `${u.txId}:${u.vout}` !== `${SEL.txid}:${SEL.vout}` && u.value > 1e3);
            if (!cand.length) throw new Error("no confirmed funding UTXO on this key \u2014 paste one manually (change from a recent tx works)");
            cand.sort((a, b) => b.value - a.value);
            fundTxid = cand[0].txId;
            fundVout = cand[0].vout;
            fundTx = Transaction.fromHex(await txHex(fundTxid));
          }
          const fundSats = fundTx.outputs[fundVout].satoshis;
          const fundScript = fundTx.outputs[fundVout].lockingScript.toHex();
          if (!fundScript.startsWith("76a914") || !fundScript.includes(pkhHex(ADDR))) {
            throw new Error("funding outpoint is not this key's P2PKH");
          }
          const head = SEL.scriptHex.slice(0, 4 + 40 + 8);
          const rest = SEL.scriptHex.slice(4 + 40 + 8 + 40);
          if (!head.startsWith("a914") || !rest.startsWith("88ac6a")) throw new Error("token script shape unexpected");
          const contractId = REG.collection.contractId;
          const tx = new Transaction();
          tx.addInput({
            sourceTXID: fundTxid,
            sourceOutputIndex: fundVout,
            sourceTransaction: fundTx,
            unlockingScriptTemplate: new P2PKH().unlock(PRIV),
            sequence: 4294967295
          });
          const mintTx = Transaction.fromHex(await txHex(SEL.txid));
          tx.addInput({
            sourceTXID: SEL.txid,
            sourceOutputIndex: SEL.vout,
            sourceTransaction: mintTx,
            unlockingScriptTemplate: twonkUnlock(PRIV, contractId),
            sequence: 4294967295
          });
          tx.addOutput({ lockingScript: LockingScript.fromHex(head + buyerPkh + rest), satoshis: 546 });
          const change = fundSats - 546 - fee;
          if (change < 0) throw new Error(`funding ${fundSats} sats cannot cover 546 + ${fee} fee`);
          if (change > 0) tx.addOutput({ lockingScript: new P2PKH().lock(ADDR), satoshis: change });
          await tx.sign();
          SIGNED = { hex: tx.toHex(), txid: tx.id("hex"), fee };
          $("review").innerHTML = `token \u2192 <code>${buyer}</code><br>change \u2192 <code>${ADDR}</code><br>txid <code>${SIGNED.txid}</code> \xB7 ${SIGNED.hex.length / 2} bytes \xB7 fee ${fee} sats`;
          $("send").disabled = false;
        } catch (e) {
          SIGNED = null;
          $("review").textContent = `Build failed: ${e.message}`;
        }
      };
      $("send").onclick = async () => {
        if (!SIGNED) return;
        $("send-out").textContent = "Broadcasting\u2026";
        try {
          const r2 = await fetch("/api/broadcast", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ txhex: SIGNED.hex })
          });
          const j = await r2.json();
          if (!j.ok) throw new Error(j.error || "relay failed");
          $("send-out").innerHTML = `Delivered in <code>${j.txid}</code> \u2014 <a href="${WOC}/tx/${j.txid}">${short(j.txid)}</a>. Tell me and I'll update the registry.`;
          SIGNED = null;
          $("send").disabled = true;
        } catch (e) {
          $("send-out").textContent = `Broadcast failed: ${e.message}`;
        }
      };
    }
  });
  require_deliver();
})();
