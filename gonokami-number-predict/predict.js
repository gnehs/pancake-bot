const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs");
const { fileURLToPath } = require("url");

// 常數定義
const WEEKDAY_MAP = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const MODEL_FEATURES = [
  "weekdayNum",
  "number",
  "isSpecialRamen",
  "currentNumber",
  "timeDifference",
  "numberDifference",
  "hourOfDay",
  "minuteOfDay",
];

// 自定義 Huber 損失函數（如果訓練時使用）
const huberLoss = (yTrue, yPred, delta = 1.0) => {
  return tf.tidy(() => {
    const error = tf.sub(yTrue, yPred);
    const absError = tf.abs(error);
    const quadratic = tf.minimum(absError, delta);
    const linear = tf.sub(absError, quadratic);
    return tf
      .add(tf.mul(0.5, tf.square(quadratic)), tf.mul(delta, linear))
      .mean();
  });
};

// 精簡的 TimePredictionModel 類
class TimePredictionModel {
  constructor() {
    this.model = null;
    this.featureStats = {};
    this.trained = false;
  }

  // 模型結構
  _createModel() {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({
        units: 32,
        activation: "relu",
        inputShape: [MODEL_FEATURES.length],
        kernelInitializer: "glorotNormal",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(
      tf.layers.dense({
        units: 16,
        activation: "relu",
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.2 }));

    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: (yTrue, yPred) => huberLoss(yTrue, yPred, 1.0), // 或改成 "meanSquaredError"
      metrics: ["mse"],
    });

    return model;
  }

  // 載入模型
  async loadModel() {
    const modelPath = path.join(__dirname, "trained_model.json");
    if (!fs.existsSync(modelPath)) {
      throw new Error("找不到訓練好的模型檔案");
    }

    try {
      const modelData = JSON.parse(fs.readFileSync(modelPath, "utf-8"));
      this.model = this._createModel();
      const weights = modelData.weights.map((w) => tf.tensor(w));
      this.model.setWeights(weights);
      this.featureStats = modelData.featureStats;
      this.trained = true;
      console.log("模型載入成功");
    } catch (error) {
      console.error("載入模型時發生錯誤:", error);
      throw error;
    }
  }

  // 數據預處理
  preprocess(data) {
    const processedData = JSON.parse(JSON.stringify(data));
    processedData.forEach((row) => {
      row.weekdayNum = WEEKDAY_MAP[row.weekday] ?? 0;
      row.isSpecialRamen = row.weekdayNum >= 5 || row.weekdayNum === 0 ? 1 : 0;
      const time = new Date(row.time);
      row.hour = time.getHours();
      row.minute = time.getMinutes();
    });
    return processedData;
  }

  // 特徵標準化
  standardizeFeatures(data) {
    return data.map((row) =>
      MODEL_FEATURES.map((feature) => {
        if (feature === "isSpecialRamen") return row[feature];
        if (feature === "timeDifference")
          return Math.min(row[feature] / 60, 60) / 60;
        if (feature === "numberDifference")
          return Math.min(row[feature], 30) / 30;
        if (feature === "hourOfDay") return (row.hour - 11) / (21 - 11);
        if (feature === "minuteOfDay") return row.minute / 60;
        return (
          (row[feature] - (this.featureStats.mean[feature] || 0)) /
          (this.featureStats.std[feature] || 1)
        );
      })
    );
  }

  // 預測核心邏輯
  predict({ targetNumber, currentNumber, currentTime, weekday }) {
    if (!this.trained) throw new Error("模型尚未載入！");

    const predictionData = [
      {
        weekday,
        number: targetNumber,
        currentNumber,
        numberDifference: targetNumber - currentNumber,
        time: currentTime,
        timeDifference: 0, // 預設為 0，可根據需求調整
      },
    ];

    const processedData = this.preprocess(predictionData);
    const features = this.standardizeFeatures(processedData);
    const xs = tf.tensor2d(features, [features.length, MODEL_FEATURES.length]);
    const predictions = this.model.predict(xs);
    const values = predictions.arraySync();

    return values.map((value) =>
      this._convertPredictionToTime(value, currentTime)
    );
  }

  _convertPredictionToTime(value, baseTime) {
    const [normalizedTimeDiff] = value;
    const predictedMinutes = Math.round(normalizedTimeDiff * 60);
    const baseDate = new Date(baseTime);
    const baseMinutes = baseDate.getHours() * 60 + baseDate.getMinutes();
    const totalMinutes = baseMinutes + predictedMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = 0;

    return {
      predicted: {
        hours: Math.min(Math.max(hours, 11), 21),
        minutes,
        seconds,
      },
    };
  }
}

// 預測函數
let modelInstance = null;

async function predictCallingTime(
  targetNumber,
  currentNumber,
  currentTime,
  weekday
) {
  if (!modelInstance) {
    modelInstance = new TimePredictionModel();
    await modelInstance.loadModel();
  }

  const prediction = modelInstance.predict({
    targetNumber,
    currentNumber,
    currentTime,
    weekday,
  });

  const { hours, minutes, seconds } = prediction[0].predicted;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// 匯出
module.exports = { predictCallingTime };
