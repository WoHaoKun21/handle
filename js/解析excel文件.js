const getFileData = async () => {
  axios
    .get("/docs/用户.xlsx", {
      responseType: "blob",
    })
    .then((res) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log(e.target.result);
      };
      reader.readAsArrayBuffer(res.data);
    });
};

getFileData();
