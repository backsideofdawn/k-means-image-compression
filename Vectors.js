class Vectors {
  static add(vector1, vector2) {
    return vector1.map((value, i) => value + vector2[i]);
  }
  
  static subtract(vector1, vector2) {
    return vector1.map((value, i) => value - vector2[i]);
  }
}