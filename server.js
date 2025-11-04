const express = require('express');
const app = express();
const port = 3000;

// Jadikan folder 'public' sebagai folder static
app.use(express.static('public'));

// Jalankan server
app.listen(port, () => {
  console.log(`Server jalan di http://localhost:${port}`);
});
