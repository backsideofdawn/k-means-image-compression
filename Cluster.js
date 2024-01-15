function squaredL2NormDistance(vector1, vector2) {
  if (vector1.length !== vector2.length) {
    throw new Error("Vectors must be of same length");
  }
  return vector1
    .map((value, i) => value - vector2[i]) // Subtract the vectors
    .map((num) => num ** 2) // Square the subtraction
    .reduce((a, b) => a + b); // Sum the squared subtraction
}

function countOccurences(vector, matchValue) {
  let count = 0;
  vector.forEach((value) => (count += matchValue == value));
  return count;
}

class Cluster {
  constructor(data, K) {
    this.data = data;

    if (!data.every(({ length }) => length === data[0].length)) {
      throw new Error("Data needs to have constant vector length");
    }

    this.attributeCount = this.data[0].length;

    this.K = K;
    this.groupIndices = Array(data.length).fill(-1);
    this.centroids = this.chooseCentroids();
  }

  classifyData() {
    // For each data point
    for (let i = 0; i < this.data.length; i++) {
      // Go through and find the closest centroid
      const distances = this.centroids.map((centroid) =>
        squaredL2NormDistance(centroid, this.data[i])
      );
      this.groupIndices[i] = distances.indexOf(min(distances));
    }
  }

  moveCentroids() {
    // Set all the attributes of each vector to 0
    this.centroids = Array(this.K).fill().map(() => Array(this.attributeCount).fill(0));
    for (let i = 0; i < this.data.length; i++) {
      // Add the current data point's values to the centroid of the classified group
      const centroid = this.centroids[this.groupIndices[i]];
      for (let j = 0; j < this.attributeCount; j++) {
        centroid[j] += this.data[i][j];
      }
    }

    for (let i = 0; i < this.centroids.length; i++) {
      const occurenceCount = this.groupIndices.filter((item) => item === i).length;
      for (let j = 0; j < this.attributeCount; j++) {
        this.centroids[i][j] /= occurenceCount || 1;
      }
    }
  }

  // https://www.kdnuggets.com/2017/03/naive-sharding-centroid-initialization-method.html
  chooseCentroids() {
    // Create a copy of the data, with the first element of each vector
    // being the sum of the other elements
    const dataCopy = this.data.map((vector) => [
      vector.reduce((a, b) => a + b),
      ...vector,
    ]);

    // Sort the data based on their attribute sums
    dataCopy.sort((a, b) => a[0] - b[0]);

    // Break the sorted data into K chunks
    const chunkSize = ceil(dataCopy.length / this.K);
    let chunks = [];
    for (let i = 0; i < dataCopy.length; i += chunkSize) {
      chunks.push(dataCopy.slice(i, i + chunkSize));
    }

    // Average the each chunk to create the value for the centroid
    const averageChunks = chunks.map((chunk) => {
      const sum = Array(this.attributeCount).fill(0);

      chunk.forEach((vector) => {
        vector.forEach((value, i) => {
          if (i === 0) return; // Ignore sum column
          // Subtract 1 from i to account for the attribute sum column
          sum[i - 1] += value;
        });
      });

      const average = sum.map((value) => value / chunk.length);
      return average;
    });

    return averageChunks;
  }
}
