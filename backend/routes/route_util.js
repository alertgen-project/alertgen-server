module.exports = {
  toArray: toArray,
};

function toArray(object){
  /*
    Creates an Array out of the referenced object if the passed reference
    doesn't point to an array
   */
  if (Array.isArray(object)){
    return object;
  } else {
    return [object]
  }
}
