const express = require("express");
const path = require("path");
const app = express();

// Set folder public
app.use(express.static(path.join(__dirname)));

// Jalankan server di port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
