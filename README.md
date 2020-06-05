# PetZ - Node API

## Indíce

- [PetZ - Node API](#petz---node-api)
  - [Indíce](#indíce)
  - [Introdução](#introdução)
  - [Técnologias](#técnologias)
  - [Rotas da aplicação](#rotas-da-aplicação)
    - [Rotas públicas](#rotas-públicas)
      - [Criar usuário](#criar-usuário)
      - [Fazer login na sessão](#fazer-login-na-sessão)
    - [Rotas privadas](#rotas-privadas)
      - [Upload de arquivo de imagem](#upload-de-arquivo-de-imagem)
      - [Atualizar perfil](#atualizar-perfil)
    - [Rotas acessíveis como cliente](#rotas-acessíveis-como-cliente)
      - [Listar pets](#listar-pets)
      - [Criar pet](#criar-pet)
      - [Editar pet](#editar-pet)
      - [Excluir pet](#excluir-pet)
      - [Listar agendamentos](#listar-agendamentos)
      - [Criar novo agendamento](#criar-novo-agendamento)
      - [Excluir agendamento](#excluir-agendamento)
    - [Rotas acessíveis como provedor de serviços](#rotas-acessíveis-como-provedor-de-serviços)
      - [Criar estabelecimento](#criar-estabelecimento)
      - [Listar cronograma diário](#listar-cronograma-diário)
      - [Listar estabelecimentos](#listar-estabelecimentos)
      - [Editar estabelecimento](#editar-estabelecimento)
      - [Excluir estabelecimento](#excluir-estabelecimento)
      - [Criar serviço](#criar-serviço)
      - [Listar serviços](#listar-serviços)
      - [Editar serviço](#editar-serviço)
      - [Excluir serviço](#excluir-serviço)

## Introdução

O Petz app é uma aplicação criada com react, pensada para facilitar a comunicação entre clientes que buscam serviços para seus bichinhos e provedores de serviços que possuem estabelecimentos que disponibilizam os serviços requisitados.

Como um cliente na aplicação, você é capaz de:

- Criar, fazer upload de foto para perfil e editar sua conta.
- Adicionar, fazer upload de foto, editar e excluir o cadastro dos seus pets.
- Procurar e agendar serviços para os pets adicionados.

Já como um provedor de serviço, é possível:

- Criar, fazer upload de foto para perfil e editar sua conta.
- Cadastrar, fazer upload de foto, editar e excluir o cadastro de um estabelecimento.
- Cadastar e editar serviços para cada estabelecimento.
- Ver um cronograma diário com todos os agendamentos de cada estabelecimento.

## Técnologias

Esta API é desenvolvida utilizando NodeJS e outras técnologias como:

- Express
- JSON Web Token
- Sequelize

## Rotas da aplicação

### Rotas públicas

#### Criar usuário

```
POST /users
```

Exemplo de corpo da requisição:

```
{
	"name": STRING,
	"email": STRING,
	"password": STRING
    "provider": BOOLEAN
}
```

> Passar provider como false define que a conta será criada como cliente, enquanto se passado true define a conta como provedor de serviços.

Retorna o nome, email e id do usuário criado.

#### Fazer login na sessão

```
POST /sessions
```

Exemplo de corpo da requisição:

```
{
	"email": STRING,
	"password": STRING
}
```

Resposta da requisição para uma conta de provedor:

```
{
  "user": {
    "id": INT,
    "name": STRING,
    "provider": BOOLEAN,
    "email": STRING,
    "avatar": {
        "id": INT,
        "url": STRING,
        "path": STRING
    },
    "establishments": [
      {
        "id": INT,
        "name": STRING,
        "email": STRING,
        "contact": STRING,
        "location": STRING,
        "avatar": {
          "id": INT,
          "url": STRING,
          "path": STRING
        }
      }
    ],
    "services": [
      {
        "id": INT,
        "name": STRING,
        "value": INT,
        "time": INT,
        "establishment_id": INT
      }
    ]
  },
  "token": STRING
}
```

Caso a conta seja cliente ao invés de retornar "establishments" e "services", retornará a lista de pets:

```
"pets": [
      {
        "id": INT,
        "name": STRING,
        "castred": BOOLEAN,
        "sex": STRING,
        "age": INT,
        "weight": INT,
        "comments": STRING,
        "avatar": {
          "url": STRING,
          "id": INT,
          "path": STRING
        }
      }
    ]
```

### Rotas privadas

---

#### Upload de arquivo de imagem

```
POST /files
```

Retorna a url do arquivo e o id, que pode ser utilizado para relacionar a imagem como avatar de um usuário ou pet.

> Essa requisição deve ser feita usando Multipart Form, enviando como file e o arquivo desejado.

#### Atualizar perfil

```
PUT /users
```

Exemplo de corpo da requisição:

```
{
	"name": STRING,
    "email": STRING,
	"avatar_id": INT,
    "oldPassword": INT,
	"newPassword": INT,
	"confirmPassword": INT
}
```

Retorna todos os dados atualizados.

### Rotas acessíveis como cliente

---

#### Listar pets

```
GET /pets
```

#### Criar pet

```
POST /pets
```

Exemplo de corpo da requisição:

```
{
    "name": STRING,
    "age": INT,
    "sex": STRING,
    "weight": INT,
    "castred": BOOLEAN
    "comments": STRING
    "avatar_id": INT
}
```

Retorna todas as informações fornecidas e o id do pet

#### Editar pet

```
PUT /pets/:petId
```

É possível enviar as mesmas informações de rota para criar pet.

Retorna todas as informações atualizadas.

#### Excluir pet

```
DELETE /pets/:petId
```

Retorna id e nome do pet excluído.

#### Listar agendamentos

```
GET /appointments
```

Retorna a lista de todos os agendamentos do usuário:

```
[
  {
    "id": INT,
    "date": DATE,
    "user": {
      "id": INT,
      "name": STRING
    },
    "pet": {
      "id": INT,
      "name": STRING
    },
    "establishment": {
      "id": INT,
      "name": STRING,
      "location": STRING
    },
    "service": {
      "id": INT,
      "name": STRING,
      "value": INT,
      "time": INT
    }
  },
]
```

> A variável "date" retorna um valor do tipo data no formato "2020-06-05 13:00:00.000 +00:00". Atente-se que o formato não incluí o timezone.

#### Criar novo agendamento

```
POST /appointments
```

Exemplo de corpo da requisição:

```
{
	"date": DATE,
	"pet_id": INT,
	"establishment_id": STRING,
	"service_id": STRING
}
```

> A variável "date" deve ser enviado como um valor do tipo data no formato "2020-06-25T13:00:00-03:00".

Retorno da requisição:

```
{
  "id": INT,
  "date": DATE,
  "user": {
    "id": INT,
    "name": STRING
  },
  "pet": {
    "id": INT,
    "name": STRING
  },
  "establishment": {
    "id": INT,
    "name": STRING,
    "location": STRING
  },
  "service": {
    "id": INT,
    "name": STRING,
    "value": INT,
    "time": INT
  }
}
```

> A variável "date" retorna um tipo data sem a timezone.

#### Excluir agendamento

```
DELETE /appointments/:appointmentId
```

Retorna o id do agendamento cancelado.

### Rotas acessíveis como provedor de serviços

---

#### Criar estabelecimento

```
POST /establishments
```

Exmplo de corpo da requisição:

```
{
	"name": STRING,
	"email": STRING,
	"contact": STRING,
	"location": STRING,
    "avatar_id": INT
}
```

Retorna as informações fornecidas e o id do estabelecimento.

#### Listar cronograma diário

```
GET /schedule/:establishmentId
```

Retorna uma lista com todos os agendamentos do dia:

```
[
  {
    "past": BOOLEAN,
    "cancelable": BOOLEAN,
    "id": INT,
    "date": DATE,
    "canceled_at": DATE,
    "user": {
      "id": INT,
      "name": STRING
    },
    "pet": {
      "id": INT,
      "name": STRING
    },
    "service": {
      "id": INT,
      "name": STRING
    }
  }
]
```

#### Listar estabelecimentos

```
GET /establishments
```

Retorna uma lista de todos os estabelecimentos do usuário:

```
[
  {
    "profile": {
      "id": INT,
      "name": STRING,
      "email": STRING,
      "contact": STRING,
      "location": STRING,
      "user": {
        "id": INT,
        "name": STRING
      },
      "avatar": {
        "url": STRING,
        "id": INT,
        "path": STRING
      }
    },
    "services": [
      {
        "id": INT,
        "name": STRING,
        "value": INT,
        "time": INT,
        "establishment_id": INT
      }
    ]
  },
]
```

#### Editar estabelecimento

```
PUT /establishments/establishmentId
```

É possível alterar todos os mesmos campos da criação de estabelecimento.

Retorna as informações atualizadas.

#### Excluir estabelecimento

```
DELETE /establishments/establishmentId
```

Retorna o id e nome do estabelecimento excluído.

#### Criar serviço

```
POST /services/:establishmentId
```

Exmplo de corpo da requisição:

```
{
	"name": STRING,
	"value": INT,
	"time": INT
}
```

Retorna as informações fornecidas e o id do serviço.

#### Listar serviços

```
GET /services/:establishmentId
```

Retorna uma lista com todos os serviços de um estabelecimento.

#### Editar serviço

```
PUT /services/:establishmentId/:serviceId
```

É possível alterar todos os mesmos campos da criação de serviço.

Retorna as informações fornecidas e o id do serviço.

#### Excluir serviço

```
DELETE /services/:establishmentId/:serviceId
```

Retorna id e nome do estabelecimento excluído.
