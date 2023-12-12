"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ==============================================  PREPARAÇÃO ================================================================================================
//a Application Programming Interface (Interface de Programação de Aplicação) 'função distinta'
// recursos/modulos necessarios.
//Iportações 
const express_1 = __importDefault(require("express"));
const oracledb_1 = __importDefault(require("oracledb"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// preparar o servidor web de backend na porta 3000
const app = (0, express_1.default)(); //fremework
const port = 3000;
// preparar o servidor para dialogar no padrao JSON 
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// já configurando e preparando o uso do dotenv para 
// todos os serviços.
dotenv_1.default.config();
/* Este código Backend esta dividido em 6 sessões serviços. Cada sessão é especifica de cada tabela no oracle sql,

1-sessão-Aeronaves
2-sessão-Aeroportos
3-sesão-Cidades
4-sessão-Voos
5-sessão-Trechos
6-sessão-tickets

Cada uma delas contem seus serviços,aqui esta os serviços disponiveis(todas as sesões tem pelo menos a inserir)

-Listar
-Inserir
-Buscar
-Deletar
-Update

para  procurar  uma sessão especifica:  (NUMERO_DA_SESSÃO)-SESSÃO-(NOME-DA-SESSÃO)
EX: 3-SESSÃO-CIDADES
para  procurar uma uma serviço especifico: (nome_do_serviços)-SESSÃO
LISTAR-AEROPORTO

*/
// ==============================================  1-SESSÃO-AERONAVES ================================================================================================
// ------------------------------------------------------------------------------------------------ LISTAR-AERONAVE
// MADE BY NICOLAS KEISMANAS 
app.get("/listarAeronaves", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA AREONAVES
    let cr = { status: "ERROR", message: "", payload: undefined, }; //VARIAVEL PARA RECEBER O CR
    try {
        //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
        let resultadoConsulta = yield connection.execute("SELECT * FROM SYS.AERONAVES"); // EXECUÇÃO DO SELECT
        yield connection.close(); //FECHAMENTO DA CONECÇÃO
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
        //RESPOSTA  SE OBTEVE RESPOSTA 200
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ----------------------------------------------------------------------------------------------- INSERIR-AERONAVE
app.put("/inserirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //REQUISIÇÃO TIPO PUT PARA REALIZAR INSERT
    const modelo = req.body.modelo;
    const fabricante = req.body.fabricante;
    const qtdAssento = req.body.qtdAssento;
    const ano_de_fabricação = req.body.ano_de_fabricação;
    const Numero_de_identificacao = req.body.Numero_de_identificacao;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsereAeronave = "INSERT INTO SYS.AERONAVES (Numero_de_identificacao,Resgistro,Modelo,Fabricante,ano_de_fabricação,qtdAssento)VALUES(SYS.SEQ_AERONAVES.NEXTVAL,SYS.SEQ_REGISTRO_AERONAVE.NEXTVAL,:1,:2,:3,:4)";
        const dados = [modelo, fabricante, qtdAssento, ano_de_fabricação];
        let resInsert = yield conn.execute(cmdInsereAeronave, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeroporto inserido.";
        }
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------ LISTAR-ASSENTO-AERONAVE-DO-VOO
app.get("/listarAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //ESTE CODIGO ELE DA UM SELECT EM UMA TABELA QUE É UMA COPIA DA STORED PRODUCED DO ASSENTO DAS AERONAVES, ELAS SÃO FEITAS AUTOMATICAMENTE,
    // FOI FEITO UM BACKUP PARA NAO INTERFERIR
    //O STATUS DA AERONAVE, E APENAS O STATUS,DELETE DO ASSENTO DO VOO 
    const Numero_de_identificacao = req.query.id_voo;
    console.log('->>', Numero_de_identificacao);
    //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA ASSENTOS DO VOO
    let cr = { status: "ERROR", message: "", payload: undefined, }; //VARIAVEL PARA RECEBER O CR
    try {
        //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const numeroIdentificacao = parseInt(Numero_de_identificacao, 10); //CONVERTENDO STRING PARA NUUMERO  POIS O QUERY NAO ACEITA NUMBER 
        console.log('conversão', numeroIdentificacao);
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
        let resultadoConsulta = (`select ASSENTOS_VOO_${numeroIdentificacao}.status from FIRSTAPP.ASSENTOS_VOO_${numeroIdentificacao}`); // EXECUÇÃO DO SELECT
        let dados = [numeroIdentificacao];
        console.log('->>', dados);
        let resConsulta = yield connection.execute(resultadoConsulta); //ESPERANDO EXECUTAR 
        yield connection.close(); //FECHAMENTO DA CONECÇÃO
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- UPDATE-STATUS-AERONAVE-DO-VOO 
app.put("/updateAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const numeroIdentificacao = req.body.id_voo;
    const numero = req.body.numero;
    let cr = { status: "ERROR", message: "", payload: undefined };
    console.log(`numeroid`, numeroIdentificacao);
    console.log('numeroAss', numero);
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = `
      UPDATE ASSENTOS_VOO_${numeroIdentificacao}
      SET status = 'ocupado'
        WHERE ASSENTOS_VOO_${numeroIdentificacao}.numero = :1
      `;
        //TROCANDO STATUS NA TABELA 'BACKUP' ASSENTO DO VOO
        let dados = [numero];
        console.log('->>', dados);
        let resConsulta = yield connection.execute(resultadoConsulta, dados);
        yield connection.commit();
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados Atualizados";
        cr.payload = resConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- verificacao de status assentos  !!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/VerificaAssentos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Numero_de_identificacao = req.query.FK_numero_de_identificacao;
    const trecho = req.query.FK_NOME_trecho;
    const horario = req.query.horario_partida;
    const dia = req.query.dia_partida;
    console.log('->>', Numero_de_identificacao);
    //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA ASSENTO_VOO
    let cr = { status: "ERROR", message: "", payload: undefined, }; //VARIAVEL PARA RECEBER O CR
    try {
        //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const numeroIdentificacao = parseInt(Numero_de_identificacao, 10);
        console.log('conversão', numeroIdentificacao);
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
        let resultadoConsulta = ("SELECT assentos.status, assentos.numero FROM SYS.voos JOIN SYS.assentos ON voos.fk_numero_de_identificacao = assentos.fk_aeronave WHERE voos.FK_numero_de_identificacao =:1 AND voos.FK_NOME_trecho =:2 AND voos.horario_partida =:3 AND voos.dia_partida =:4 "); // EXECUÇÃO DO SELECT
        let dados = [numeroIdentificacao, trecho, horario, dia];
        console.log('->>', dados);
        let resConsulta = yield connection.execute(resultadoConsulta, dados);
        yield connection.close(); //FECHAMENTO DA CONECÇÃO
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resConsulta.rows;
        //RESPOSTA  SE OBTEVE RESPOSTA 200
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- DELETAR-AERONAVE 
app.delete("/excluirAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //UTILIZANDO A REQUISIÇÃO DELETE PARA FAZER UM DELETE NA TABELA AREONAVES
    // excluindo a aeronave atraves do id
    const Numero_de_identificacao = req.body.Numero_de_identificacao;
    console.log(`console> ${Numero_de_identificacao}`);
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    // conectando 
    try { // tentando estabelecer a conexão
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAero = ` BEGIN
    DELETE FROM SYS.assentos WHERE FK_AERONAVE = :1;
    DELETE FROM SYS.AERONAVES WHERE Numero_de_identificacao = :1;
END;`;
        // BEGIN E AND POIS, QUER-SE FAZER DOIS COMANDOS AO MESMO TEMPO  A EXECUÇÃO SÓ ACEITA UMA STRING DE COMANDO, O BEGIN É UMA STRING DE COMANDO, APESAR DELE FAZER UMA SEQUENCIA DE COMANDO ELE É CONSIDERADO UMA STRING UNICA DE COMANDO 
        const dados = [Numero_de_identificacao]; //GUARDANDO AS INFORMAÇÕES DIGITADAS
        let resDelete = yield connection.execute(cmdDeleteAero, dados); // método é usado para executar uma instrução SQL no banco de dados Oracle. conn é a variavel de conexão
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // obter a informação de  linhas  inseridas. 
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave excluída.";
        }
        else {
            cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
        }
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message, 'ç');
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
app.listen(port, () => {
    console.log("Servidor HTTP funcionando...");
});
// ------------------------------------------------------------------------------------------------- UPDATE-AERONAVE
app.put("/atualizarAeronave", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //UTILIZANDO A REQUISIÇÃO PUT PARA FAZER UM UPDATE NA TABELA AREONAVES
    //  receber os dados na requisição. 
    const modelo = req.body.modelo;
    const fabricante = req.body.fabricante;
    const qtdAssento = req.body.qtdAssento;
    const ano_de_fabricação = req.body.ano_de_fabricação;
    const Numero_de_identificacao = req.body.Numero_de_identificacao;
    // objeto para custumizar  resposta
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdupdateAeronave = "UPDATE SYS.AERONAVES SET  MODELO = :1,FABRICANTE=:2,QTDASSENTO=:3,ANO_DE_FABRICAÇÃO=:4 WHERE Numero_de_identificacao=:5";
        const dados = [modelo, fabricante, qtdAssento, ano_de_fabricação, Numero_de_identificacao];
        let resInsert = yield conn.execute(cmdupdateAeronave, dados); //// método é usado para executar uma instrução SQL no banco de dados Oracle. conn é a variavel de conexão
        yield conn.commit(); // importante: efetuar o commit para gravar no Oracle.
        const rowsInserted = resInsert.rowsAffected; // propriedade desse objeto que indica quantas linhas foram afetadas pela operação
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeronave Atualizado.";
        }
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ==============================================  2-SESSÃO-AEROPORTOS ================================================================================================
// ------------------------------------------------------------------------------------------------- LISTAR-AEROPORTO 
app.get("/listarAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //USANDO GET NA REQUISIÇÃO PARA FAZER UM SELECT NA TABELA AEROPORTOS NO BANCO DE DADOS VIA CONEXÃO PELO const connAttibs: ConnectionAttributes
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try { //TENTANDO A conexão
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A RESPOTA OK
        let resultadoConsulta = yield connection.execute("SELECT * FROM SYS.AEROPORTOS"); //EXECUNTANDO COMANDO DML
        yield connection.close(); //ESPERANDO FECHAR
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- INSERIR-AEROPORTO 
app.put("/inserirAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //REQUISIÇÃO TIPO PUT PARA REALIZAR INSERT
    // para inserir a aeronave temos que receber os dados na requisição. 
    const nome = req.body.nome; // body associado ao sql
    const nomeCidade = req.body.fk_nome_cidade;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAerop = "INSERT INTO SYS.AEROPORTOS ( NOME,ID_AEROPORTO,fk_nome_cidade)VALUES(:1, SYS.SEQ_AEROPORTOS.NEXTVAL,:2)";
        const dados = [nome, nomeCidade];
        let resInsert = yield conn.execute(cmdInsertAerop, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeroporto inserido.";
        }
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- BUSCA-TODOS-OS-AEROPORTOS-CONFORME-A-CIDADE 
app.get("/BuscarAeroportosAtravesDeCidades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //BUSACAR AEROPORTO DE ACORDO COM A CIADADE, O RETORNO SERÁ APENAS AEROPORTOSD QUE ESTAO ASSOCIADOS COM A CIDADE
    const cidade = req.query.nome;
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try { //TENTANDO A conexão
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A RESPOTA OK
        let resultadoConsulta = ("SELECT AEROPORTOS.nome, AEROPORTOS.id_aeroporto FROM SYS.AEROPORTOS JOIN SYS.CIDADES ON AEROPORTOS.fk_nome_cidade = CIDADES.nome WHERE CIDADES.nome = :1"); //EXECUNTANDO COMANDO DML
        const dados = [cidade];
        console.log('dados dps do slect', dados);
        let resConsulta = yield connection.execute(resultadoConsulta, dados);
        yield connection.close(); //ESPERANDO FECHAR
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resConsulta.rows;
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- DELETAR-AEROPORTO 
app.delete("/excluirAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // USANDO UMA REQUISIÇÃO  DELETE PARA EXCLUIR
    //pegando dados da requisição
    const id_aeroporto = req.body.id_aeroporto;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    // conectando 
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeleteAeroP = `DELETE SYS.AEROPORTOS WHERE ID_AEROPORTO = :1`;
        const dados = [id_aeroporto];
        let resDelete = yield connection.execute(cmdDeleteAeroP, dados); // método é usado para executar uma instrução SQL no banco de dados Oracle. connection é a variavel de conexão
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) { // propriedade desse objeto que indica quantas linhas foram afetadas pela operação
            cr.status = "SUCCESS";
            cr.message = "Aeroporto excluído.";
        }
        else {
            cr.message = "Aeroporto não excluída. Verifique se o código informado está correto.";
        }
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- UPDATE-AEROPORTO
app.put("/atualizarAeroporto", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // USANDO UMA REQUISIÇÃO TIPO PUT PARA ALTERAR A TABELA
    const nome = req.body.nome;
    const id_aeroporto = req.body.id_aeroporto;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdupdateAeroporto = "UPDATE SYS.AEROPORTOS SET  nome = :1 WHERE id_aeroporto=:2";
        const dados = [nome, id_aeroporto];
        let resInsert = yield conn.execute(cmdupdateAeroporto, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeroporto Atualizado.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ==============================================  3-SESSÃO-CIDADES ================================================================================================
// ------------------------------------------------------------------------------------------------- LISTAR-CIDADE
app.get("/listarCidades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute("SELECT * FROM SYS.CIDADES");
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- INSERIR-CIDADE
app.put("/inserirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a  temos que receber os dados na requisição. 
    const nome = req.body.nome;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertcity = "INSERT INTO SYS.CIDADES ( NOME,ID_CIDADE)VALUES(:1, SYS.SEQ_CIDADES.NEXTVAL)";
        const dados = [nome];
        let resInsert = yield conn.execute(cmdInsertcity, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "cidade inserida.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- DELETAR-CIDADE 
app.delete("/excluirCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // excluindo a CIDADE pelo código  id  dela:
    const id_cidade = req.body.id_cidade;
    console.log(`${id_cidade}`);
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    // conectando 
    try {
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdDeletecity = `DELETE SYS.CIDADEs WHERE ID_CIDADE = :1`;
        const dados = [id_cidade];
        let resDelete = yield connection.execute(cmdDeletecity, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield connection.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "cidade excluído.";
        }
        else {
            cr.message = "cidade não excluída. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- UPDATE-CIDADE 
app.put("/atualizarCidade", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nome = req.body.nome;
    const id_cidade = req.body.id_cidade;
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdupdateCidade = "UPDATE SYS.cidade SET  nome = :1 WHERE id_cidade=:2";
        const dados = [nome, id_cidade];
        let resInsert = yield conn.execute(cmdupdateCidade, dados);
        yield conn.commit();
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "cidade atualizada.";
        }
        else {
            cr.message = "cidade não ATUALIZADA. Verifique se o código informado está correto.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
// ==============================================  4-SESSÃO-VOOS ================================================================================================
// ------------------------------------------------------------------------------------------------- LISTAR-VOO 
app.get("/listarVoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //faz uma busca de toda a tabela voos no oracle sql
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute('SELECT * FROM SYS.VOOS');
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- BUSCAR-DATA-VOO-DE-IDA
app.get("/BuscarVooAtravezDaDataIda", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //busca especificamente atráves da data
    const dia_partida = req.query.dia_partida;
    console.log('dados antes do select', dia_partida);
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try { //TENTANDO A conexão
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A RESPOTA OK
        let resultadoConsulta = ("SELECT * FROM SYS.VOOS  WHERE VOOS.dia_partida = :1"); //EXECUNTANDO COMANDO 
        const dados = [dia_partida];
        console.log('dados dps do slect', dados);
        let resConsulta = yield connection.execute(resultadoConsulta, dados);
        yield connection.close(); //ESPERANDO FECHAR
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resConsulta.rows;
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- BUSCA VOO ATRAVEZ DA DATA VOLTA
app.get("/BuscarVooAtravezDaDataVolta", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //busca especificamente atráves da data
    const dia_partida = req.query.dia_partida;
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try { //TENTANDO A conexão
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs); //ESPERANDO A RESPOTA OK
        let resultadoConsulta = ("SELECT * FROM SYS.VOOS  WHERE VOOS.dia_partida = :1"); //EXECUNTANDO COMANDO
        const dados = [dia_partida];
        console.log('dados dps do slect ->', dados);
        let resConsulta = yield connection.execute(resultadoConsulta, dados);
        yield connection.close(); //ESPERANDO FECHAR
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resConsulta.rows;
        //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
        //pegando o erro
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- INSERIR-VOO 
app.put("/inserirvoo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // para inserir a vooS temos que receber os dados na requisição. 
    const idvoo = req.body.id_voo;
    const diaPartida = req.body.dia_partida;
    const diaChegada = req.body.dia_chegada;
    const horarioChegada = req.body.horario_chegada;
    const horarioPartida = req.body.horario_partida;
    const valor = req.body.valor;
    const NumeroAeronave = req.body.FK_numero_de_identificacao;
    const NomeTrecho = req.body.FK_NOME_trecho;
    const NomeCidadeOrigem = req.body.FK_nome_cidade_origem;
    const NomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem;
    const NomeCiodadeDestino = req.body.FK_nome_cidade_destino;
    const NomeAeroportoDestino = req.body.FK_nome_aeroporto_destino;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertvoo = "INSERT INTO SYS.VOOS(id_voo,dia_partida, dia_chegada,horario_partida,horario_chegada,valor,FK_numero_de_identificacao,FK_NOME_trecho,FK_nome_cidade_origem,FK_nome_aeroporto_origem,FK_nome_cidade_destino,FK_nome_aeroporto_destino)values(SYS.seq_voo.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11)";
        const dados = [diaPartida, diaChegada, horarioChegada, horarioPartida, valor, NumeroAeronave, NomeTrecho, NomeCidadeOrigem, NomeAeroportoOrigem, NomeCiodadeDestino, NomeAeroportoDestino];
        let resInsert = yield conn.execute(cmdInsertvoo, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        const criaAssentosDoVoo = `DECLARE
    nome_tabela VARCHAR2(50);
    seq_numero NUMBER;
 BEGIN
    -- Gera um número único usando uma sequência
    SELECT SYS.seq_voo.currval INTO seq_numero FROM DUAL;
 
    -- Cria uma tabela temporária
    EXECUTE IMMEDIATE 'CREATE TABLE Assentos_voo_' || seq_numero || ' AS
                       SELECT codigo, numero, status, fk_aeronave
                       FROM SYS.assentos
                       WHERE fk_aeronave = ${NumeroAeronave}';
 
 END;`;
        console.log(`>>>>>> ${NumeroAeronave}`);
        //existe duas strings de comando, o 'cmdinsertvoo'  -> o primeiro insere uma nova linha na tabela voo 
        // a segunda é um begin que tem uma declaração que vai criar uma tabela backup de assentos de acordo com as informações especificadas
        yield conn.execute(criaAssentosDoVoo);
        // efetua o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "voo inserido.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
    /*CustomResponse parece ser um tipo personalizado usado para formatar a resposta da API.
  A conexão com o banco de dados é estabelecida usando as credenciais e a string de conexão fornecidas.
  await oracledb.getConnection retorna uma conexão que é usada para executar a instrução SQL.
  conn.execute é usado para executar a instrução SQL preparada (cmdInsertvoo) com os dados fornecidos.
  await conn.commit() é usado para confirmar as alterações no banco de dados.
  resInsert.rowsAffected é usado para obter o número de linhas afetadas pela instrução SQL.
  O código usa try-catch para lidar com exceções. Se ocorrer uma exceção, a mensagem de erro é registrada na propriedade message do objeto de resposta (cr).
  O bloco finally garante que a conexão seja fechada, independentemente de ocorrer uma exceção ou não.
  A resposta da API é enviada como JSON, contendo informações sobre o status da operação.*/
}));
// ------------------------------------------------------------------------------------------------- LISTAR-TRECHO
// ==============================================  5-SESSÃO-TRECHOS ================================================================================================
app.get("/listarTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cr = { status: "ERROR", message: "", payload: undefined, };
    try {
        const connAttibs = {
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        };
        const connection = yield oracledb_1.default.getConnection(connAttibs);
        let resultadoConsulta = yield connection.execute('SELECT * FROM SYS.TRECHOS');
        yield connection.close();
        cr.status = "SUCCESS";
        cr.message = "Dados obtidos";
        cr.payload = resultadoConsulta.rows;
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        res.send(cr);
    }
}));
// ------------------------------------------------------------------------------------------------- INSERIR-TRECHO
app.put("/inserirTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const nome = req.body.nome;
    const idcidadeOrigem = req.body.FK_id_cidade_origem;
    const nomeCidadeOrigem = req.body.FK_nome_cidade_origem;
    const idAeroportoOrigem = req.body.FK_id_aeroporto_origem;
    const nomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem;
    const idCidadeDestino = req.body.FK_id_cidade_destino;
    const nomeCidadeDestino = req.body.FK_nome_cidade_destino;
    const idAeroportoDestino = req.body.FK_id_aeroporto_destino;
    const nomeAeroportoDestino = req.body.FK_nome_aeroporto_destino;
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAerop = "INSERT INTO SYS.TRECHOS(ID_TRECHO,NOME,FK_id_cidade_origem,FK_nome_cidade_origem,FK_id_aeroporto_origem, FK_nome_aeroporto_origem,FK_id_cidade_destino, FK_nome_cidade_destino,FK_id_aeroporto_destino,FK_nome_aeroporto_destino)VALUES(SYS.SEQ_TRECHO.NEXTVAL,:1,:2,:3,:4,:5,:6,:7,:8,:9)";
        const dados = [nome, idcidadeOrigem, nomeCidadeOrigem, idAeroportoOrigem, nomeAeroportoOrigem, idCidadeDestino, nomeCidadeDestino, idAeroportoDestino, nomeAeroportoDestino];
        let resInsert = yield conn.execute(cmdInsertAerop, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Aeroporto inserido.";
        }
    }
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
app.delete("/deleteTrecho", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idTrecho = req.body.id_trecho;
    console.log(`recebendo ${idTrecho}`);
    // prepara um objeto para resposta da requisição do cliente
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    try {
        // abre conexao com bd
        const connection = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        // prepara e executa uma intrucao sql
        const cmdDeleteTrecho = 'DELETE SYS.TRECHOS WHERE ID_TRECHO = :1';
        const dados = [idTrecho];
        let resDelete = yield connection.execute(cmdDeleteTrecho, dados);
        // efetua commit para gravar inserçoes no bd
        yield connection.commit();
        // verifica se a inserçao de dados foi bem sucedida
        const rowsDeleted = resDelete.rowsAffected;
        if (rowsDeleted !== undefined && rowsDeleted === 1) {
            cr.status = "SUCCESS";
            cr.message = "Trecho excluído.";
        }
        else {
            cr.message = "Trecho não excluído. Verifique se o código informado está correto.";
        }
    }
    // em caso de erro o codigo prepara uma resposta de acordo
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        // devolvendo a resposta da requisição.
        res.send(cr);
    }
}));
// ==============================================  6-SESSÃO-TICKETS ================================================================================================
//ticket -----------------------------------------------------------------------------
app.put("/NovoTicket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const nome = req.body.nome;
    const FK_id_voo = req.body.FK_id_voo;
    const assento = req.body.assento;
    console.log(`dados ${email}`);
    // definindo um objeto de resposta.
    let cr = {
        status: "ERROR",
        message: "",
        payload: undefined,
    };
    let conn;
    // conectando 
    try {
        conn = yield oracledb_1.default.getConnection({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectionString: process.env.ORACLE_CONN_STR,
        });
        const cmdInsertAerop = "INSERT INTO SYS.TICKETS(id_tikets ,email ,nome,FK_id_voo,assento)VALUES(SYS.SEQ_TICKET.NEXTVAL,:1,:2,:3,:4)";
        const dados = [email, nome, FK_id_voo, assento];
        let resInsert = yield conn.execute(cmdInsertAerop, dados);
        // importante: efetuar o commit para gravar no Oracle.
        yield conn.commit();
        // obter a informação de quantas linhas foram inseridas. 
        // neste caso precisa ser exatamente 1
        // verifica se a inserção foi bem sucedida
        const rowsInserted = resInsert.rowsAffected;
        if (rowsInserted !== undefined && rowsInserted === 1) {
            cr.status = "SUCCESS";
            cr.message = "novo ticket emitido.";
        }
    }
    // em caso de erro o codigo da a resposta relatando
    catch (e) {
        if (e instanceof Error) {
            cr.message = e.message;
            console.log(e.message);
        }
        else {
            cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }
    finally {
        //fechar a conexao.
        if (conn !== undefined) {
            yield conn.close();
        }
        res.send(cr);
    }
}));
