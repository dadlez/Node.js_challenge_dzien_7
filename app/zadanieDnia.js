//Twój kod
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const DB_FILE = './app/data/zadanieDnia/db.json';

const readDB = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(DB_FILE, (err, data) => {
      if(!err) {
        resolve(JSON.parse(data));
      } else {
        reject({ response: 'Błąd odczytu bazy danych', err});
      }
    });
  });
};

const writeDB = (res, data, message) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(DB_FILE, JSON.stringify(data), err => {
      if(!err) {
        res.json({ newList: data, response: message });
        resolve(message);
      } else {
        res.json({ response: 'Błąd zapisu do bazy danych' });
        reject('Błąd zapisu do bazy danych\n' + err);
      }
    })
  });
};

const app = express();

app.use(bodyParser.json());
app.use(express.static('./app/public/zadanieDnia/'));

app.post('/new-task', (req, res) => {
  const newTask = req.body;

  readDB().then(list => {
    const newId = 1 + Math.max(...list.reduce((result, task) => task.id ? result.concat(task.id) : result, [0]));

    Object.assign(newTask, { id: newId, completed: false });
    const newList = list.concat(newTask);

    writeDB(res, newList, 'Nowe zadanie zapisane')
      .then(response => console.log(response))
      .catch(err => console.log(err));
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/modify', (req, res) => {
  const modifiedTask = req.body;
  console.log(modifiedTask)

  readDB().then(list => {
    const newList = list.map(task => {
      if (String(task.id) === modifiedTask.id) {
        Object.assign(task, modifiedTask, { id: Number(task.id) })
      }

      return task;
    });

    writeDB(res, newList, 'Modyfikacja zapisana')
      .then(response => console.log(response))
      .catch(err => console.log(err));
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/destroy', (req, res) => {
  const destoyedTaskId = Number(req.body.id);
  console.log(destoyedTaskId);

  readDB().then(list => {
    const newList = list.filter(task => task.id !== destoyedTaskId);

    writeDB(res, newList, 'Zadanie usunięto')
      .then(response => console.log(resonse))
      .catch(err => console.log(err));
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/list/all', (req, res) => {
  readDB().then(list => {
    const response = 'Baza danych odczytana';
    res.json({ newList: list, response });
    console.log(response);
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/list/completed', (req, res) => {
  readDB().then(list => {
    const newList = list.filter(task => task.completed === true);
    const response = 'Odczytano z bazy danych zadania o stausie completed';
    res.json({ newList, response });
    console.log(response);
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/list/active', (req, res) => {
  readDB().then(list => {
    const newList = list.filter(task => task.completed === false);
    const response = 'Odczytano z bazy danych zadania o stausie active';
    res.json({ newList, response });
    console.log(response);
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.post('/list/clear-completed', (req, res) => {
  readDB().then(list => {
    const newList = list.filter(task => task.completed === false);

    writeDB(res, newList, 'Zaktualizowano bazę danych')
      .then(response => console.log(response))
      .catch(err => console.log(err));
  }).catch(({ err, response }) => {
    res.json({ response });
    console.log(response, err);
  });
});

app.listen(3000, () => console.log('serwer stoi na porcie 3000'));