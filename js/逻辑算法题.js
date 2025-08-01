/* 
    n 个孩子站成一排。给你一个整数数组 ratings 表示每个孩子的评分。
    你需要按照以下要求，给这些孩子分发糖果：
        每个孩子至少分配到 1 个糖果。
        相邻两个孩子中，评分更高的那个会获得更多的糖果。
        请你给每个孩子分发糖果，计算并返回需要准备的 最少糖果数目 。
*/

const arr = [1, 5, 3, 2, 6, 8, 4, 2, 1, 5, 6, 7, 5, 1];

const candy = (ratings) => {
  const len = ratings.length;
  const candies = new Array(len).fill(1);
  // 正向遍历
  for (let i = 1; i < len; i++) {
    console.log("正向遍历：", ratings[i], ratings[i - 1]);
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = Math.max(candies[i], candies[i - 1] + 1);
    }
  }
  console.log("——————————————————————————————————————————————————————————————");
  // 反向遍历
  for (let j = len - 2; j >= 0; j--) {
    console.log("反向遍历：", ratings[j], ratings[j + 1]);
    if (ratings[j] > ratings[j + 1]) {
      candies[j] = Math.max(candies[j], candies[j + 1] + 1);
    }
  }

  let total = 0;
  // 遍历获得最后结果
  for (let i = 0; i < candies.length; i++) {
    total += candies[i];
  }
  return total;
};

console.log("根据分数分配的糖果：", candy(arr), arr.length);
