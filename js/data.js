const arr = new Array(96).fill(null);
const newArr = arr.map((o, i) => {
  const hour =
    Math.floor((i * 15) / 60) >= 10
      ? Math.floor((i * 15) / 60)
      : `0${Math.floor((i * 15) / 60)}`;
  const minute = (i * 15) % 60 ? (i * 15) % 60 : `0${(i * 15) % 60}`;
  return {
    id: i + 1,
    name: "123",
    time: `${hour}:${minute}`,
    data: (Math.random() * 10).toFixed(2) * 1,
  };
});

console.log(newArr);
