const express = require('express');
const app = express();  
const cors = require('cors');       
const bodyParser = require('body-parser');
const port = 3000; //porta padrão
const sql = require('mssql');
//const connStr = "Server=DESKTOP-RRSRG04\\SQLEXPRESS;Database=AlunoTesteDB;User=sa;Password=masterkey;";

// const connStr = {
//     user: 'sa',
//     password: 'masterkey',
//     server: 'DESKTOP-RRSRG04\\SQLEXPRESS',  
//     database: 'AlunoTesteDB',
//     port: '1433'
//   };

  var connStr = {
    user: 'sa',
    password: 'masterkey',
    server: 'localhost',
    database: 'AlunoTesteDB',
    options: {
        truestedConnection: true,
        instanceName: 'SQLEXPRESS'
   }};

//configurando o body parser para pegar POSTS mais tarde
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

router.get('/alunos/:id?', (req, res) =>{
    let filter = '';
    if(req.params.id) filter = ' WHERE AlunoId=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM Alunos' + filter, res);
})

router.delete('/alunos/:id', (req, res) =>{
    execSQLQuery('DELETE Alunos WHERE AlunoId=' + parseInt(req.params.id), res);
})

router.post('/alunos', (req, res) =>{
    //const id = parseInt(req.body.id);
    const nome = req.body.nome.substring(0,150);
    const email = req.body.email.substring(0,11);
    execSQLQuery(`INSERT INTO Alunos(Nome, Email) VALUES('${nome}','${email}')`, res);
})

router.patch('/alunos/:id', (req, res) =>{
    const id = parseInt(req.params.id);
    const nome = req.body.nome.substring(0,150);
    const email = req.body.email.substring(0,11);
    execSQLQuery(`UPDATE Alunos SET Nome='${nome}', Email='${email}' WHERE AlunoId=${id}`, res);
})

app.use('/', router);

//fazendo a conexão global
sql.connect(connStr)
   .then(conn => {
        global.conn = conn;
        //inicia o servidor
        app.listen(port);
        console.log('API funcionando!');
   })
   .catch(err => console.log(err));

function execSQLQuery(sqlQry, res){
    global.conn.request()
               .query(sqlQry)
               .then(result => res.json(result.recordset))
               .catch(err => res.json(err));
}