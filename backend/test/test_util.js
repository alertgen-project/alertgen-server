'use strict';

/**
 * Generates a random number in the passed interval.
 * @param {number} min smallest random number which can be generated
 * @param {number} max biggest random number which can be generated
 * @returns {number} the generated random number
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
  getRandomInt,
};
