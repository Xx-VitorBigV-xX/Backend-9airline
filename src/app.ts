// ==============================================  PREPARAÇÃO ================================================================================================
// (Made by Vitor Hugo Amaro)
//a Application Programming Interface (Interface de Programação de Aplicação) 'função distinta'
// recursos/modulos necessarios.
//Iportações 
import express from "express";
import oracledb, { Connection, ConnectionAttributes } from "oracledb";
import dotenv from "dotenv";
import cors from "cors";
import { CONNREFUSED } from "dns";
// (Made by Vitor Hugo Amaro)
// preparar o servidor web de backend na porta 3000
const app = express();//fremework
const port = 3000;
// preparar o servidor para dialogar no padrao JSON 
app.use(express.json());
app.use(cors());
// (Made by Vitor Hugo Amaro)
// já configurando e preparando o uso do dotenv para 
// todos os serviços.
dotenv.config();
// (Made by Vitor Hugo Amaro)
// criando um TIPO chamado CustomResponse.
// Esse tipo vamos sempre reutilizar.
type CustomResponse = {
  status: string,
  message: string,
  payload: any
};

// (Made by Vitor Hugo Amaro)
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

// (Made by Vitor Hugo Amaro)
// ------------------------------------------------------------------------------------------------ LISTAR-AERONAVE
app.get("/listarAeronaves", async(req,res)=>{ 
  //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA AREONAVES
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};//VARIAVEL PARA RECEBER O CR

  try{
    //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.AERONAVES");// EXECUÇÃO DO SELECT
  
    await connection.close();//FECHAMENTO DA CONECÇÃO
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;
    //RESPOSTA  SE OBTEVE RESPOSTA 200
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ----------------------------------------------------------------------------------------------- INSERIR-AERONAVE
// (Made by Vitor Hugo Amaro)
app.put("/inserirAeronave", async(req,res)=>{
  //REQUISIÇÃO TIPO PUT PARA REALIZAR INSERT
  const modelo = req.body.modelo as string;
  const fabricante = req.body.fabricante as string;
  const qtdAssento = req.body.qtdAssento as number;
  const ano_de_fabricação = req.body.ano_de_fabricação as number;
  const Numero_de_identificacao=req.body.Numero_de_identificacao as number;

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({//TENTANDO A CONECÇÃO NO BANCO
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsereAeronave = "INSERT INTO SYS.AERONAVES (Numero_de_identificacao,Resgistro,Modelo,Fabricante,ano_de_fabricação,qtdAssento)VALUES(SYS.SEQ_AERONAVES.NEXTVAL,SYS.SEQ_REGISTRO_AERONAVE.NEXTVAL,:1,:2,:3,:4)"

    const dados = [modelo,fabricante,qtdAssento,ano_de_fabricação];
    let resInsert = await conn.execute(cmdInsereAeronave, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

// ------------------------------------------------------------------------------------------------ LISTAR-ASSENTO-AERONAVE-DO-VOO
// (Made by Vitor Hugo Amaro)
app.get("/listarAssentos", async(req,res)=>{ 
  //ESTE CODIGO ELE DA UM SELECT EM UMA TABELA QUE É UMA COPIA DA STORED PRODUCED DO ASSENTO DAS AERONAVES, ELAS SÃO FEITAS AUTOMATICAMENTE, FOI FEITO UM BACKUP PARA NAO INTERFERIR
  //O STATUS DA AERONAVE, E APENAS O STATUS,DELETE DO ASSENTO DO VOO 
  const Numero_de_identificacao = req.query.id_voo as string;
  console.log('->>',Numero_de_identificacao)
  //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA ASSENTOS DO VOO
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};//VARIAVEL PARA RECEBER O CR

  try{
    //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const numeroIdentificacao = parseInt(Numero_de_identificacao, 10);//CONVERTENDO STRING PARA NUUMERO  POIS O QUERY NAO ACEITA NUMBER 
    console.log('conversão',numeroIdentificacao)
    const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
    let resultadoConsulta = (`select ASSENTOS_VOO_${numeroIdentificacao}.status from FIRSTAPP.ASSENTOS_VOO_${numeroIdentificacao}`);// EXECUÇÃO DO SELECT
    let dados = [numeroIdentificacao];
    console.log('->>',dados)
    let resConsulta = await  connection.execute(resultadoConsulta);//ESPERANDO EXECUTAR 
    


    await connection.close();//FECHAMENTO DA CONECÇÃO
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resConsulta.rows;
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- UPDATE-STATUS-AERONAVE-DO-VOO 
// (Made by Vitor Hugo Amaro)
app.put("/updateAssentos", async (req, res) => {

  const numeroIdentificacao = req.body.id_voo as String;
  const numero = req.body.numero as string
  let cr: CustomResponse = { status: "ERROR", message: "", payload: undefined };
  console.log(`numeroid`,numeroIdentificacao)
  console.log('numeroAss',numero)
  try {
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    };

    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = `
      UPDATE ASSENTOS_VOO_${numeroIdentificacao}
      SET status = 'ocupado'
        WHERE ASSENTOS_VOO_${numeroIdentificacao}.numero = :1
      `;
    //TROCANDO STATUS NA TABELA 'BACKUP' ASSENTO DO VOO
    let dados = [numero];
    console.log('->>', dados);
    let resConsulta = await connection.execute(resultadoConsulta, dados);
    
    
    await connection.commit();
    await connection.close();
    cr.status = "SUCCESS";
    cr.message = "Dados Atualizados";
    cr.payload = resConsulta.rows;
  } catch (e) {
    if (e instanceof Error) {
      cr.message = e.message;
      console.log(e.message);
    } else {
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);
  }
});
// ------------------------------------------------------------------------------------------------- verificacao de status assentos  !!!!!!!!!!!!!!!!!!!!!!!!!!!
// (Made by Vitor Hugo Amaro)
app.get("/VerificaAssentos", async(req,res)=>{ 
  const Numero_de_identificacao = req.query.FK_numero_de_identificacao as string;
  const trecho = req.query.FK_NOME_trecho as string;
  const horario = req.query.horario_partida as string;
  const dia = req.query.dia_partida as string;
  console.log('->>',Numero_de_identificacao)
  //UTILIZANDO A REQUISIÇÃO GET PARA FAZER UM SELECT NA TABELA ASSENTO_VOO
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};//VARIAVEL PARA RECEBER O CR

  try{
    //OBJETO QUE GUARDA TODAS AS INFORMAÇÕES DO USUARIO, SENHA E STRING DE CONEXÃO DO BANCO DE DADOS
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const numeroIdentificacao = parseInt(Numero_de_identificacao, 10);
    console.log('conversão',numeroIdentificacao)
    const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A CONEÇÃO PORQUE A REQUISIÇÃO É ASSÍNCRONA
    let resultadoConsulta = ("SELECT assentos.status, assentos.numero FROM SYS.voos JOIN SYS.assentos ON voos.fk_numero_de_identificacao = assentos.fk_aeronave WHERE voos.FK_numero_de_identificacao =:1 AND voos.FK_NOME_trecho =:2 AND voos.horario_partida =:3 AND voos.dia_partida =:4 ");// EXECUÇÃO DO SELECT
    
    let dados = [numeroIdentificacao,trecho,horario,dia];
    console.log('->>',dados)
    let resConsulta = await  connection.execute(resultadoConsulta, dados);



    await connection.close();//FECHAMENTO DA CONECÇÃO
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resConsulta.rows;
    //RESPOSTA  SE OBTEVE RESPOSTA 200
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- DELETAR-AERONAVE 
// (Made by Vitor Hugo Amaro)
app.delete("/excluirAeronave", async(req,res)=>{
    //UTILIZANDO A REQUISIÇÃO DELETE PARA FAZER UM DELETE NA TABELA AREONAVES
  // excluindo a aeronave atraves do id
  const  Numero_de_identificacao = req.body.Numero_de_identificacao as number;
  console.log(`console> ${Numero_de_identificacao}`)
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{// tentando estabelecer a conexão
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAero = ` BEGIN
    DELETE FROM SYS.assentos WHERE FK_AERONAVE = :1;
    DELETE FROM SYS.AERONAVES WHERE Numero_de_identificacao = :1;
END;`
// BEGIN E AND POIS, QUER-SE FAZER DOIS COMANDOS AO MESMO TEMPO  A EXECUÇÃO SÓ ACEITA UMA STRING DE COMANDO, O BEGIN É UMA STRING DE COMANDO, APESAR DELE FAZER UMA SEQUENCIA DE COMANDO ELE É CONSIDERADO UMA STRING UNICA DE COMANDO 
    const dados = [Numero_de_identificacao];//GUARDANDO AS INFORMAÇÕES DIGITADAS
    let resDelete = await connection.execute(cmdDeleteAero, dados); // método é usado para executar uma instrução SQL no banco de dados Oracle. conn é a variavel de conexão
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de  linhas  inseridas. 
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined ) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave excluída.";
    }else{
      cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
    }
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message,'ç');
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});
// (Made by Vitor Hugo Amaro)
app.listen(port,()=>{
  console.log("Servidor HTTP funcionando...");
});
// ------------------------------------------------------------------------------------------------- UPDATE-AERONAVE
// (Made by Vitor Hugo Amaro)
app.put("/atualizarAeronave",async(req,res)=>{
  //UTILIZANDO A REQUISIÇÃO PUT PARA FAZER UM UPDATE NA TABELA AREONAVES
  //  receber os dados na requisição. 
  const modelo = req.body.modelo as string;
  const fabricante = req.body.fabricante as string;
  const qtdAssento = req.body.qtdAssento as number;
  const ano_de_fabricação = req.body.ano_de_fabricação as number;
  const Numero_de_identificacao=req.body.Numero_de_identificacao as number;
  // objeto para custumizar  resposta
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  let conn;
  try{
    conn = await oracledb.getConnection({// tentando conexão
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });
    const cmdupdateAeronave = "UPDATE SYS.AERONAVES SET  MODELO = :1,FABRICANTE=:2,QTDASSENTO=:3,ANO_DE_FABRICAÇÃO=:4 WHERE Numero_de_identificacao=:5"
    const dados = [modelo,fabricante,qtdAssento,ano_de_fabricação,Numero_de_identificacao];
    let resInsert = await conn.execute(cmdupdateAeronave, dados);//// método é usado para executar uma instrução SQL no banco de dados Oracle. conn é a variavel de conexão
    await conn.commit();  // importante: efetuar o commit para gravar no Oracle.
    const rowsInserted = resInsert.rowsAffected // propriedade desse objeto que indica quantas linhas foram afetadas pela operação
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave Atualizado.";
    }
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
}catch(e){
  if(e instanceof Error){
    cr.message = e.message;
    console.log(e.message);
  }else{
    cr.message = "Erro ao conectar ao oracle. Sem detalhes";
  }
} finally {
  //fechar a conexao.
  if(conn!== undefined){
    await conn.close();
  }
  res.send(cr);  
}

});
// ==============================================  2-SESSÃO-AEROPORTOS ================================================================================================


// ------------------------------------------------------------------------------------------------- LISTAR-AEROPORTO 
// (Made by Vitor Hugo Amaro)
app.get("/listarAeroporto", async(req,res)=>{
//USANDO GET NA REQUISIÇÃO PARA FAZER UM SELECT NA TABELA AEROPORTOS NO BANCO DE DADOS VIA CONEXÃO PELO const connAttibs: ConnectionAttributes
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{//TENTANDO A conexão
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A RESPOTA OK
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.AEROPORTOS");//EXECUNTANDO COMANDO DML
  
    await connection.close();//ESPERANDO FECHAR
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- INSERIR-AEROPORTO 
// (Made by Vitor Hugo Amaro)
app.put("/inserirAeroporto", async(req,res)=>{
  //REQUISIÇÃO TIPO PUT PARA REALIZAR INSERT
  // para inserir a aeronave temos que receber os dados na requisição. 
  const nome = req.body.nome as string;// body associado ao sql
  const nomeCidade = req.body.fk_nome_cidade as string;

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({//TENTANDO A CONECÇÃO NO BANCO
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAerop = "INSERT INTO SYS.AEROPORTOS ( NOME,ID_AEROPORTO,fk_nome_cidade)VALUES(:1, SYS.SEQ_AEROPORTOS.NEXTVAL,:2)"

    const dados = [nome,nomeCidade];
    let resInsert = await conn.execute(cmdInsertAerop, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});
// ------------------------------------------------------------------------------------------------- BUSCA-TODOS-OS-AEROPORTOS-CONFORME-A-CIDADE 
// (Made by Vitor Hugo Amaro)
app.get("/BuscarAeroportosAtravesDeCidades", async(req,res)=>{
  //BUSACAR AEROPORTO DE ACORDO COM A CIADADE, O RETORNO SERÁ APENAS AEROPORTOSD QUE ESTAO ASSOCIADOS COM A CIDADE
  const cidade = req.query.nome as string;
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};
    try{//TENTANDO A conexão
      const connAttibs: ConnectionAttributes = {
        user: process.env.ORACLE_DB_USER,
        password: process.env.ORACLE_DB_PASSWORD,
        connectionString: process.env.ORACLE_CONN_STR,
      }
      const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A RESPOTA OK
      let resultadoConsulta = ("SELECT AEROPORTOS.nome, AEROPORTOS.id_aeroporto FROM SYS.AEROPORTOS JOIN SYS.CIDADES ON AEROPORTOS.fk_nome_cidade = CIDADES.nome WHERE CIDADES.nome = :1");//EXECUNTANDO COMANDO DML
      const dados = [cidade];
      console.log('dados dps do slect',dados)
      let resConsulta = await  connection.execute(resultadoConsulta, dados);


      await connection.close();//ESPERANDO FECHAR
      cr.status = "SUCCESS"; 
      cr.message = "Dados obtidos";
      cr.payload = resConsulta.rows;
  //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
  //pegando o erro
    }catch(e){
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      res.send(cr);  
    }
  
  });
// ------------------------------------------------------------------------------------------------- DELETAR-AEROPORTO 
// (Made by Vitor Hugo Amaro)
app.delete("/excluirAeroporto", async(req,res)=>{
  // USANDO UMA REQUISIÇÃO  DELETE PARA EXCLUIR
  //pegando dados da requisição
  const  id_aeroporto = req.body.id_aeroporto as number;
 
  // definindo um objeto de resposta.
  let cr: CustomResponse = {//tentando a conecçâo
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeleteAeroP = `DELETE SYS.AEROPORTOS WHERE ID_AEROPORTO = :1`
    const dados = [id_aeroporto];
    let resDelete = await connection.execute(cmdDeleteAeroP, dados);// método é usado para executar uma instrução SQL no banco de dados Oracle. connection é a variavel de conexão
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {// propriedade desse objeto que indica quantas linhas foram afetadas pela operação
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto excluído.";
    }else{
      cr.message = "Aeroporto não excluída. Verifique se o código informado está correto.";
    }
//try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
//pegando o erro
  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});
// ------------------------------------------------------------------------------------------------- UPDATE-AEROPORTO
// (Made by Vitor Hugo Amaro)
app.put("/atualizarAeroporto",async(req,res)=>{
  // USANDO UMA REQUISIÇÃO TIPO PUT PARA ALTERAR A TABELA
  const nome = req.body.nome as String;
  const id_aeroporto=req.body.id_aeroporto as number;

  let cr: CustomResponse = {//TENTANDO CONEÇÃO
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  let conn;
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });
    const cmdupdateAeroporto = "UPDATE SYS.AEROPORTOS SET  nome = :1 WHERE id_aeroporto=:2"
    const dados = [nome,id_aeroporto];
    let resInsert = await conn.execute(cmdupdateAeroporto, dados);
    await conn.commit();
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto Atualizado.";
    }

}catch(e){
  if(e instanceof Error){
    cr.message = e.message;
    console.log(e.message);
  }else{
    cr.message = "Erro ao conectar ao oracle. Sem detalhes";
  }
} finally {
  //fechar a conexao.
  if(conn!== undefined){
    await conn.close();
  }
  res.send(cr);  
}

});


// ==============================================  3-SESSÃO-CIDADES ================================================================================================


// ------------------------------------------------------------------------------------------------- LISTAR-CIDADE
// (Made by Vitor Hugo Amaro)
app.get("/listarCidades", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute("SELECT * FROM SYS.CIDADES");
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- INSERIR-CIDADE
// (Made by Vitor Hugo Amaro)
app.put("/inserirCidade", async(req,res)=>{
  
  // para inserir a  temos que receber os dados na requisição. 
  const nome = req.body.nome as string;


  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertcity = "INSERT INTO SYS.CIDADES ( NOME,ID_CIDADE)VALUES(:1, SYS.SEQ_CIDADES.NEXTVAL)"

    const dados = [nome];
    let resInsert = await conn.execute(cmdInsertcity, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade inserida.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});
// ------------------------------------------------------------------------------------------------- DELETAR-CIDADE 
// (Made by Vitor Hugo Amaro)
app.delete("/excluirCidade", async(req,res)=>{
  // excluindo a CIDADE pelo código  id  dela:
  const  id_cidade = req.body.id_cidade as number;
  console.log(`${id_cidade}`)
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  // conectando 
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdDeletecity = `DELETE SYS.CIDADEs WHERE ID_CIDADE = :1`
    const dados = [id_cidade];

    let resDelete = await connection.execute(cmdDeletecity, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await connection.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade excluído.";
    }else{
      cr.message = "cidade não excluída. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }
});
// ------------------------------------------------------------------------------------------------- UPDATE-CIDADE 
// (Made by Vitor Hugo Amaro)
app.put("/atualizarCidade",async(req,res)=>{
  const nome = req.body.nome as string;
  const id_cidade = req.body.id_cidade as number;

  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });


    const cmdupdateCidade = "UPDATE SYS.cidade SET  nome = :1 WHERE id_cidade=:2"
    const dados = [nome,id_cidade];

    let resInsert = await conn.execute(cmdupdateCidade, dados);

    await conn.commit();

    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "cidade atualizada.";
    }else{
      cr.message = "cidade não ATUALIZADA. Verifique se o código informado está correto.";
    }


  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});


// ==============================================  4-SESSÃO-VOOS ================================================================================================


// ------------------------------------------------------------------------------------------------- LISTAR-VOO 
// (Made by Vitor Hugo Amaro)
app.get("/listarVoo", async(req,res)=>{
//faz uma busca de toda a tabela voos no oracle sql
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute('SELECT * FROM SYS.VOOS')
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- BUSCAR-DATA-VOO-DE-IDA
// (Made by Vitor Hugo Amaro)
app.get("/BuscarVooAtravezDaDataIda", async(req,res)=>{
  //busca especificamente atráves da data
  const dia_partida = req.query.dia_partida as string;
  console.log('dados antes do select',dia_partida)
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};
    try{//TENTANDO A conexão
      const connAttibs: ConnectionAttributes = {
        user: process.env.ORACLE_DB_USER,
        password: process.env.ORACLE_DB_PASSWORD,
        connectionString: process.env.ORACLE_CONN_STR,
      }
      const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A RESPOTA OK
      let resultadoConsulta = ("SELECT * FROM SYS.VOOS  WHERE VOOS.dia_partida = :1");//EXECUNTANDO COMANDO 
      const dados = [dia_partida];
      console.log('dados dps do slect',dados)
      let resConsulta = await  connection.execute(resultadoConsulta, dados);


      await connection.close();//ESPERANDO FECHAR
      cr.status = "SUCCESS"; 
      cr.message = "Dados obtidos";
      cr.payload = resConsulta.rows;
  //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
  //pegando o erro
    }catch(e){
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      res.send(cr);  
    }
  
  });
  // ------------------------------------------------------------------------------------------------- BUSCA VOO ATRAVEZ DA DATA VOLTA
// (Made by Vitor Hugo Amaro)
  app.get("/BuscarVooAtravezDaDataVolta", async(req,res)=>{
  //busca especificamente atráves da data

  const dia_partida = req.query.dia_partida as string;
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};
    try{//TENTANDO A conexão
      const connAttibs: ConnectionAttributes = {
        user: process.env.ORACLE_DB_USER,
        password: process.env.ORACLE_DB_PASSWORD,
        connectionString: process.env.ORACLE_CONN_STR,
      }
      const connection = await oracledb.getConnection(connAttibs);//ESPERANDO A RESPOTA OK
      let resultadoConsulta = ("SELECT * FROM SYS.VOOS  WHERE VOOS.dia_partida = :1");//EXECUNTANDO COMANDO
      const dados = [dia_partida];
      console.log('dados dps do slect ->',dados)
      let resConsulta = await  connection.execute(resultadoConsulta, dados);


      await connection.close();//ESPERANDO FECHAR
      cr.status = "SUCCESS"; 
      cr.message = "Dados obtidos";
      cr.payload = resConsulta.rows;
  //try-catch é uma construção em várias linguagens de programação que permite que você escreva código que pode gerar exceções (erros) e fornece um mecanismo para lidar com essas exceções.
  //pegando o erro
    }catch(e){
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      res.send(cr);  
    }
  
  });
// ------------------------------------------------------------------------------------------------- INSERIR-VOO 
// (Made by Vitor Hugo Amaro)
app.put("/inserirvoo", async(req,res)=>{
  
  // para inserir a vooS temos que receber os dados na requisição. 
  
  const idvoo = req.body.id_voo as number;
  const diaPartida = req.body.dia_partida as string;
  const diaChegada = req.body.dia_chegada as string;
  const horarioChegada = req.body.horario_chegada as string;
  const horarioPartida = req.body.horario_partida as string;
  const valor = req.body.valor as number;
  const NumeroAeronave = req.body.FK_numero_de_identificacao as string;
  const NomeTrecho = req.body.FK_NOME_trecho as string;
  const NomeCidadeOrigem = req.body.FK_nome_cidade_origem as String;
  const NomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem as string;
  const NomeCiodadeDestino = req.body.FK_nome_cidade_destino as string;
  const NomeAeroportoDestino = req.body.FK_nome_aeroporto_destino as string;


  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertvoo = "INSERT INTO SYS.VOOS(id_voo,dia_partida, dia_chegada,horario_partida,horario_chegada,valor,FK_numero_de_identificacao,FK_NOME_trecho,FK_nome_cidade_origem,FK_nome_aeroporto_origem,FK_nome_cidade_destino,FK_nome_aeroporto_destino)values(SYS.seq_voo.nextval,:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11)";

    const dados = [diaPartida,diaChegada,horarioChegada,horarioPartida,valor,NumeroAeronave,NomeTrecho, NomeCidadeOrigem,NomeAeroportoOrigem,NomeCiodadeDestino,NomeAeroportoDestino];
    let resInsert = await conn.execute(cmdInsertvoo, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
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
console.log(`>>>>>> ${NumeroAeronave}`)
 //existe duas strings de comando, o 'cmdinsertvoo'  -> o primeiro insere uma nova linha na tabela voo 
 // a segunda é um begin que tem uma declaração que vai criar uma tabela backup de assentos de acordo com as informações especificadas
 await conn.execute(criaAssentosDoVoo);
 // efetua o commit para gravar no Oracle.
 await conn.commit();
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "voo inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
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
});
// ------------------------------------------------------------------------------------------------- LISTAR-TRECHO



// ==============================================  5-SESSÃO-TRECHOS ================================================================================================
// (Made by Vitor Hugo Amaro)
app.get("/listarTrecho", async(req,res)=>{

  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined,};

  try{
    const connAttibs: ConnectionAttributes = {
      user: process.env.ORACLE_DB_USER,
      password: process.env.ORACLE_DB_PASSWORD,
      connectionString: process.env.ORACLE_CONN_STR,
    }
    const connection = await oracledb.getConnection(connAttibs);
    let resultadoConsulta = await connection.execute('SELECT * FROM SYS.TRECHOS')
  
    await connection.close();
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    cr.payload = resultadoConsulta.rows;

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    res.send(cr);  
  }

});
// ------------------------------------------------------------------------------------------------- INSERIR-TRECHO
// (Made by Vitor Hugo Amaro)
app.put("/inserirTrecho", async(req,res)=>{
  
  const nome = req.body.nome as string;
  const idcidadeOrigem = req.body.FK_id_cidade_origem as number;
  const nomeCidadeOrigem = req.body.FK_nome_cidade_origem as string;
  const idAeroportoOrigem = req.body.FK_id_aeroporto_origem as number;
  const nomeAeroportoOrigem = req.body.FK_nome_aeroporto_origem as string;
  const idCidadeDestino = req.body.FK_id_cidade_destino as number;
  const nomeCidadeDestino = req.body.FK_nome_cidade_destino as string;
  const idAeroportoDestino = req.body.FK_id_aeroporto_destino as number;
  const nomeAeroportoDestino = req.body.FK_nome_aeroporto_destino as string;



  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAerop = "INSERT INTO SYS.TRECHOS(ID_TRECHO,NOME,FK_id_cidade_origem,FK_nome_cidade_origem,FK_id_aeroporto_origem, FK_nome_aeroporto_origem,FK_id_cidade_destino, FK_nome_cidade_destino,FK_id_aeroporto_destino,FK_nome_aeroporto_destino)VALUES(SYS.SEQ_TRECHO.NEXTVAL,:1,:2,:3,:4,:5,:6,:7,:8,:9)"

    const dados = [nome,idcidadeOrigem,nomeCidadeOrigem,idAeroportoOrigem,nomeAeroportoOrigem,idCidadeDestino,nomeCidadeDestino,idAeroportoDestino,nomeAeroportoDestino];
    let resInsert = await conn.execute(cmdInsertAerop, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto inserido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});

// (Made by Vitor Hugo Amaro) 
app.delete("/deleteTrecho",async(req,res)=>{
  const idTrecho = req.body.id_trecho as number;
  
  console.log(`recebendo ${idTrecho}`)
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  try{
    const connection = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });
    const cmdDeleteTrecho = 'DELETE SYS.TRECHOS WHERE ID_TRECHO = :1'
    const dados = [idTrecho];
    let resDelete = await connection.execute(cmdDeleteTrecho,dados);
    await connection.commit();
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "Trecho excluído.";
    }else{
      cr.message = "Trecho não excluído. Verifique se o código informado está correto.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    // devolvendo a resposta da requisição.
    res.send(cr);  
  }


 })

// ==============================================  6-SESSÃO-TICKETS ================================================================================================
//ticket -----------------------------------------------------------------------------
// (Made by Vitor Hugo Amaro) 
app.put("/NovoTicket", async(req,res)=>{
  const email = req.body.email as string;
  const nome = req.body.nome as string;
  const FK_id_voo = req.body.FK_id_voo as number;
  const assento = req.body.assento as number

  console.log(`dados ${email}`)
  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  let conn;

  // conectando 
  try{
    conn = await oracledb.getConnection({
       user: process.env.ORACLE_DB_USER,
       password: process.env.ORACLE_DB_PASSWORD,
       connectionString: process.env.ORACLE_CONN_STR,
    });

    const cmdInsertAerop = "INSERT INTO SYS.TICKETS(id_tikets ,email ,nome,FK_id_voo,assento)VALUES(SYS.SEQ_TICKET.NEXTVAL,:1,:2,:3,:4)"

    const dados = [email,nome,FK_id_voo,assento];
    let resInsert = await conn.execute(cmdInsertAerop, dados);
    
    // importante: efetuar o commit para gravar no Oracle.
    await conn.commit();
  
    // obter a informação de quantas linhas foram inseridas. 
    // neste caso precisa ser exatamente 1
    const rowsInserted = resInsert.rowsAffected
    if(rowsInserted !== undefined &&  rowsInserted === 1) {
      cr.status = "SUCCESS"; 
      cr.message = "novo ticket emitido.";
    }

  }catch(e){
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechar a conexao.
    if(conn!== undefined){
      await conn.close();
    }
    res.send(cr);  
  }
});