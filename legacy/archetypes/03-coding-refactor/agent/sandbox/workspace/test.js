import assert from "node:assert";
import { add, factorial } from "./src/math.js";

assert.strictEqual(add(2, 3), 5, "add(2,3) should be 5");
assert.strictEqual(factorial(0), 1, "factorial(0) should be 1");
assert.strictEqual(factorial(1), 1, "factorial(1) should be 1");
assert.strictEqual(factorial(5), 120, "factorial(5) should be 120");

console.log("ALL TESTS PASSED");
