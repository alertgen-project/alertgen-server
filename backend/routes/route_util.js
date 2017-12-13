'use strict';

module.exports = {
  toArray,
};

function toArray(object) {
  /*
    Used to make sure that the passed object uses an array as its container.
    Creates an Array out of the referenced object if the passed reference
    doesn't point to an array. Returns the array if an array has been passed.
   */
  if (Array.isArray(object)) {
    return object;
  } else {
    return [object];
  }
}
