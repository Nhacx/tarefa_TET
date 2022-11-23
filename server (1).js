const express = require("express");
const app = express();
const fs = require("fs");
var bodyParser = require('body-parser');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);


var enableCORS = function(req, res, next) {
  if (!process.env.DISABLE_XORIGIN) {
    var allowedOrigins = ['*'];
    var origin = req.headers.origin;
    if(!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(req.method);
      res.set({
        "Access-Control-Allow-Origin" : origin,
        "Access-Control-Allow-Methods" : "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers" : "Origin, X-Requested-With, Content-Type, Accept"
      });
    }
  }
  next();
};

db.serialize(() => {
  if (!exists) {
    db.run(
     
//"CREATE Eleitos (ideleito INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, idade INTEGER, votos TEXT, numero INTEGER)"
      
    "CREATE TABLE Eleicao (id INTEGER PRIMARY KEY, ideleito INTEGER FOREIGN KEY REFERENCES ELEITOS(ideleito), ncandidatos INTEGER, turno INTEGER)"
    
    
    );
    console.log("New table Eleicao created!");

    db.serialize(() => {
db.run(

  //'INSERT INTO Eleitos (nome, idade, votos, numero) VALUES ("Bolsonaro", 17, "62.756.426", 17), ("Arthur Bernardes", 47, "466.877", NULL), ("Lula", 57, "52.793.364", NULL), ("Dilma", 63, "55.752.529", NULL), ("Campo Sales", 57, "420.286", NULL)'
        
        
        'INSERT INTO Eleicao (id, ideleito, ncandidatos, turno) VALUES (1922, 2, 60, 1), (2018, 1, 13, 2), (1898, 5, 2, 1), (2010, 4, 9, 2), (2002, 3, 6, 2)'
      );
    });
  } else {
    console.log('Database "Eleitos" ready to go!');
    db.each("SELECT * from Eleitos", (err, row) => {
      if (row) {
        console.log(`record: ${row.nome}`);
      }
    });
  }
});

app.get("/", function(req, res) {
  res.send("REST API - Node JS + SQLITE");
});


app.get("/Eleitos", function(req, res) {
  if(req.query.votos){
    console.log(`select Eleitos where votos= ${req.query.votos}`);
    db.all(`SELECT * from Eleitos WHERE votos=${req.query.votos}`, (err, rows) => {
      res.json(rows);
    }); 
  }else{
    console.log("select all Eleitos");
    db.all("SELECT * from Eleitos", (err, rows) => {
      res.set('content-type', 'application/json; charset=utf-8')
      res.json(rows);
    }); 
  }
});

app.get("/Eleitos/:ideleito", function(req, res) {
  console.log(`select Eleitos ${req.params.ideleito}`);
  db.all(`SELECT * from Eleitos WHERE ideleito=${req.params.ideleito}` , (err, rows) => {
  res.json(rows);
  });  
});

app.post("/Eleitos", (request, response) => {
  console.log(`insert Eleitos ${request.body.nome}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("INSERT INTO Eleitos (nome, idade, votos, numero) VALUES (?,?,?,?)", data.nome,data.idade,data.votos,data.numero, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.put("/Eleitos/:ideleito", (request, response) => {
  console.log(`update Eleitos ${request.params.ideleito}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("UPDATE Eleitos SET nome=?, idade=?, votos=?, numero=? WHERE ideleito=?", data.nome,data.idade,data.votos,data.numero, request.params.ideleito, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.delete("/Eleitos/:ideleito", (request, response) => {
  console.log(`delete Eleitos ${request.params.ideleito}`);
  
  db.run("DELETE FROM Eleitos WHERE IDEleito=?", request.params.ideleito, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  
});

app.get("/clearEleitos", (request, response) => {
  console.log("delete all Eleitos");
  
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Eleitos",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Eleitos WHERE IDEleito=?`, row.ideleito, error => {
          if (row) {
            console.log(`deleted row ${row.ideleito}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});


app.get("/Eleicao", function(req, res) {
  if(req.query.turno){
    console.log(`select Eleicao where turno= ${req.query.turno}`);
    db.all(`SELECT * from Eleicao WHERE turno=${req.query.turno}`, (err, rows) => {
      res.json(rows);
    }); 
  }else{
    console.log("select all Eleicao");
    db.all("SELECT * from Eleicao", (err, rows) => {
      res.set('content-type', 'application/json; charset=utf-8')
      res.json(rows);
    }); 
  }
});

app.get("/Eleicao/:id", function(req, res) {
  console.log(`select Eleicao ${req.params.id}`);
  db.all(`SELECT * from Eleicao WHERE id=${req.params.id}` , (err, rows) => {
  res.json(rows);
  });  
});

app.post("/Eleicao", (request, response) => {
  console.log(`insert Eleicao ${request.body.ncandidatos}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("INSERT INTO Eleicao (id, ideleito, ncandidatos, turno) VALUES (?,?,?,?)", data.id,data.ideleito,data.ncandidatos,data.turno, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.put("/Eleicao/:id", (request, response) => {
  console.log(`update Eleicao ${request.params.id}`);

  if (!process.env.DISALLOW_WRITE) {
    const data = request.body;
    db.run("UPDATE Eleicao SET ideleito=?, ncandidatos=?, turno=? WHERE id=?", data.ideleito,data.ncandidatos,data.turno, request.params.id, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  }
});

app.delete("/Eleicao/:id", (request, response) => {
  console.log(`delete Eleicao ${request.params.id}`);
  
  db.run("DELETE FROM Eleicao WHERE ID=?", request.params.id, error => {
      if (error) {
        response.send({ message: "error!" });
      } else {
        response.send({ message: "success" });
      }
    });
  
});

app.get("/clearEleicao", (request, response) => {
  console.log("delete all Eleicao");
  
  if (!process.env.DISALLOW_WRITE) {
    db.each(
      "SELECT * from Eleicao",
      (err, row) => {
        console.log("row", row);
        db.run(`DELETE FROM Eleicao WHERE ID?`, row.id, error => {
          if (row) {
            console.log(`deleted row ${row.id}`);
          }
        });
      },
      err => {
        if (err) {
          response.send({ message: "error!" });
        } else {
          response.send({ message: "success" });
        }
      }
    );
  }
});


const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});