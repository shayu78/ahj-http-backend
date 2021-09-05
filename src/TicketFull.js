const { Ticket } = require('./Ticket');

class TicketFull extends Ticket {
  constructor(id, name, status, created, description) {
    super(id, name, status, created);
    this.description = description;
  }
}

module.exports.TicketFull = TicketFull;
