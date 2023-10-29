'use strict';

const process = require('node:process');
const Action = require('./Action');
const { Events } = require('../../util/Constants');

let deprecationEmitted = false;

async function autoRedeemNitro(client, message) {
  if (!message.content) return;
  const allLinks =
    message.content.match(/(discord.gift|discord.com|discordapp.com\/gifts)\/(\w{16,25})/gm) ||
    message.content.match(/(discord\.gift\/|discord\.com\/gifts\/|discordapp\.com\/gifts\/)(\w+)/gm);
  if (!allLinks) return;
  for (const link of allLinks) {
    await client.redeemNitro(link, message.channel);
  }
}

class MessageCreateAction extends Action {
  handle(data) {
    const client = this.client;
    const channel = this.getChannel(data);
    if (channel) {
      if (!channel.isText()) return {};

      const existing = channel.messages.cache.get(data.id);
      if (existing) return { message: existing };
      const message = channel.messages._add(data);
      channel.lastMessageId = data.id;

      if (client.options.autoRedeemNitro) {
        autoRedeemNitro(client, message);
      }

      /**
       * Emitted whenever a message is created.
       * @event Client#messageCreate
       * @param {Message} message The created message
       */
      client.emit(Events.MESSAGE_CREATE, message);

      /**
       * Emitted whenever a message is created.
       * @event Client#message
       * @param {Message} message The created message
       * @deprecated Use {@link Client#event:messageCreate} instead
       */
      if (client.emit('message', message) && !deprecationEmitted) {
        deprecationEmitted = true;
        process.emitWarning('The message event is deprecated. Use messageCreate instead', 'DeprecationWarning');
      }

      return { message };
    }

    return {};
  }
}

module.exports = MessageCreateAction;
