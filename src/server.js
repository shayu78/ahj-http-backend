/* eslint-disable no-console */
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');

const app = new Koa();
const uuid = require('uuid');
const { Ticket } = require('./Ticket');
const { TicketFull } = require('./TicketFull');

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

let tickets = [];

// app.use(async (ctx, next) => {
//   const origin = ctx.request.get('Origin');
//   if (!origin) await next();
//   const headers = { 'Access-Control-Allow-Origin': '*' };
//   if (ctx.request.method !== 'OPTIONS') {
//     ctx.response.set({ ...headers });
//     try {
//       return await next();
//     } catch (e) {
//       e.headers = { ...e.headers, ...headers };
//       throw e;
//     }
//   }
//   if (ctx.request.get('Access-Control-Request-Method')) {
//     ctx.response.set({
//       ...headers,
//       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
//     });
//     if (ctx.request.get('Access-Control-Request-Headers')) {
//       ctx.response.set(
//         'Access-Control-Allow-Headers',
//         ctx.request.get('Access-Control-Allow-Request-Headers')
//       );
//     }
//     ctx.response.status = 204; // нет данных
//   }
//   return null;
// });

app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

app.use(async (ctx) => {
  const { method } = ctx.request.query;

  switch (method) {
    case 'allTickets':
      if (ctx.method === 'GET') {
        ctx.response.body = tickets.map(
          (value) =>
            // eslint-disable-next-line implicit-arrow-linebreak
            new Ticket(value.id, value.name, value.status, value.created)
        );
        return;
      }
      ctx.response.status = 500;
      return;
    case 'ticketById':
      if (ctx.method === 'GET') {
        const { id } = ctx.request.query;
        if (id) {
          const ticket = tickets.find((value) => value.id === id);
          if (ticket) {
            ctx.response.body = ticket;
            return;
          }
        }
      }
      ctx.response.status = 500;
      return;
    case 'ticketSetStatus':
      if (ctx.method === 'PATCH') {
        const { id, status } = ctx.request.query;
        if (id) {
          const index = tickets.findIndex((value) => value.id === id);
          if (index !== -1) {
            tickets[index].status = status.toLowerCase() === 'true';
            ctx.response.body = tickets[index];
            return;
          }
        }
      }
      ctx.response.status = 500;
      return;
    case 'createTicket':
      if (ctx.method === 'POST') {
        const { name, description } = ctx.request.body;
        const ticket = new TicketFull(
          uuid.v4(),
          name,
          false,
          new Date(),
          description
        );
        tickets.push(ticket);
        ctx.response.body = {
          id: ticket.id,
          name: ticket.name,
          status: ticket.status,
          created: ticket.created,
        };
        return;
      }
      ctx.response.status = 500;
      return;
    case 'removeTicket':
      if (ctx.method === 'DELETE') {
        const { id } = ctx.request.query;
        if (id) {
          const ticket = tickets.find((value) => value.id === id);
          if (ticket) {
            tickets = tickets.filter((value) => value.id !== id);
            ctx.response.body = ticket;
            return;
          }
        }
      }
      ctx.response.status = 500;
      return;
    case 'editTicket':
      if (ctx.method === 'PATCH') {
        const { id, name, description } = ctx.request.body;
        if (id) {
          const index = tickets.findIndex((value) => value.id === id);
          if (index !== -1) {
            tickets[index].name = name;
            tickets[index].description = description;
            ctx.response.body = tickets[index];
            return;
          }
        }
      }
      ctx.response.status = 500;
      return;
    default:
      ctx.response.status = 404;
  }
});

const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port, (err) => {
  if (err) {
    console.log('Server listen error occurred:', err);
    return;
  }
  console.log(`Server is listening on ${port}`);
});
