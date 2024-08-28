const express = require('express');
const cors = require('cors');
const casual = require('casual');

const app = express();
app.use(cors());

app.get('/generate', (req, res) => {
  const { region, errors, seed, page, limit } = req.query;

  // query checking
  if (!region || !errors || !seed || !page || !limit) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  const regions = {
    USA: 'en',
    Poland: 'pl',
    Georgia: 'ka',
  };

  const locale = regions[region];


  if (!locale) {
    return res.status(400).json({ error: 'Invalid region specified' });
  }

  // data generation
  casual.seed(parseInt(seed));

  const records = [];
  const uniqueIdentifiers = new Set();

  const totalRecords = limit * page;

  while (records.length < totalRecords) {
    // generate identifier
    const identifier = casual.uuid.substring(0, 8);

    if (uniqueIdentifiers.has(identifier)) continue;
    uniqueIdentifiers.add(identifier);

    // generate data
    const name = `${casual.first_name} ${casual.first_name} ${casual.last_name}`;
    const address = `${casual.city} ${casual.street} ${casual.building_number}`;
    const phone = casual.phone;

    /* =======================================================
    -------------------ERROR IMPLEMENTATION-------------------
    ========================================================== */
    const index = records.length + 1;
    let record = { index, identifier, name, address, phone };
    record.name = introduceErrors(record.name, parseFloat(errors));
    record.address = introduceErrors(record.address, parseFloat(errors));
    record.phone = introduceErrors(record.phone, parseFloat(errors));

    records.push(record);
  }

  const responseRecords = records.slice((page - 1) * limit, page * limit);
  return res.json({ records: responseRecords });
});

/* =======================================================
    -----------------------ERROR--------------------------
    ========================================================== */

    const introduceErrors = (value, errorRate) => {
      if (typeof value !== 'string') return value;
    
      let newValue = value;
      const numErrors = Math.floor(errorRate);
      const fractionalError = errorRate - numErrors;
    
      for (let i = 0; i < numErrors; i++) {
        // If errorRate is very high, apply multiple errors in one pass
        const errorType = randomErrorType();
        newValue = applyError(newValue, errorType);
        if (numErrors > 100 && Math.random() < 0.5) {
          newValue = applyError(newValue, randomErrorType());
        }
      }
    
      // Apply an additional fractional error
      if (Math.random() < fractionalError) {
        newValue = applyError(newValue, randomErrorType());
      }
    
      return newValue;
    };
    

const randomErrorType = () => {
  const errorTypes = ['delete', 'add', 'swap'];
  return errorTypes[Math.floor(Math.random() * errorTypes.length)];
};

// apply errors 
const applyError = (value, errorType) => {
  let newValue = value;

  switch (errorType) {
    case 'delete':
      if (newValue.length > 0) {
        const deletePos = Math.floor(Math.random() * newValue.length);
        newValue = newValue.slice(0, deletePos) + newValue.slice(deletePos + 1);
      }
      break;
    case 'add':
      const addPos = Math.floor(Math.random() * newValue.length);
      const randomChar = Math.random() < 0.5
        ? String.fromCharCode(97 + Math.floor(Math.random() * 26))  // add random letter
        : Math.floor(Math.random() * 10).toString();                // add random digit
      newValue = newValue.slice(0, addPos) + randomChar + newValue.slice(addPos);
      break;
    case 'swap':
      if (newValue.length > 1) {
        const swapPos = Math.floor(Math.random() * (newValue.length - 1));
        newValue = newValue.slice(0, swapPos) + newValue[swapPos + 1] + newValue[swapPos] + newValue.slice(swapPos + 2);
      }
      break;
  }

  return newValue;
};

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
