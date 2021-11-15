const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const {username} = request.headers;
  
  const userFound = users.find((user) => user.username === username);

  if(!userFound){
    return response.status(404).json({error: "usuário não encontrado"});
  }

  request.user = userFound;

  next();
}

function checkExistsTodo(request, response, next){
  const {id} = request.params;
  const {user} = request;

  const todo = user.todos.find((todo) => todo.id === id);
  if(!todo){
   return response.status(404).json({error: "tarefa não encontrada"});
  }

  request.todo = todo;
  next();
}


app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userIsAlreadyRegistered = users.some((user)=> user.username === username);

  if(userIsAlreadyRegistered){
    return response.status(400).json({error: "username já em uso"});
  }

  users.push(newUser);  
  response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;

  response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {title, deadline} = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  response.status(201).json(newTodo);


});

app.put('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  // Complete aqui
  const {todo} = request;
  const {title, deadline} = request.body;


  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {todo} = request;
  todo.done = true;
  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, checkExistsTodo, (request, response) => {
  const {todo, user} = request;

  user.todos.splice(user.todos.indexOf(todo), 1);

  response.status(204).send();

});

module.exports = app;