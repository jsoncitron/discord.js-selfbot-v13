'use strict';

const Base = require('./Base');

/**
 * Represents a read state for a resource on Discord.
 * @extends {Base}
 */
class ReadState extends Base {
  constructor(client, data) {
    super(client);
    this._patch(data);
  }

  _patch(data) {
    /**
     * The resource id of the read state
     * @type {Snowflake}
     */
    this.id = data.id;
    /**
     * The type of the read state
     * @type {?ReadStateType}
     */
    this.type = ReadStateTypes[data.read_state_type ?? 0];
    /**
     * The mention count of the resource
     * @type {number}
     */
    this.mentionCount = data.mention_count ?? data.badge_count ?? 0;
    /**
     * Days since 2015 when the resource was last viewed
     * @type {?number}
     */
    this.lastViewed = data.last_viewed ?? null;
    if (data.last_pin_timestamp) {
      let lastPinTimestamp = Date.parse(data.last_pin_timestamp);
      /**
       * When the channel pins were last acknowledged
       * @type {?Date}
       */
      this.lastPinTimestamp = lastPinTimestamp.getTime() ? lastPinTimestamp : null;
    } else {
      this.lastPinTimestamp = null;
    }
    /**
     * The id of last acknowledged resource in the read state
     * @type {?Snowflake}
     */
    this.lastAckedId = data.last_acked_id ?? data.last_message_id ?? null;
    // TODO Readstateflags
  }

  _copy() {
    return new ReadState(this.client, {
      id: this.id,
      read_state_type: ReadStateTypes.indexOf(this.type),
      mention_count: this.mentionCount,
      last_viewed: this.lastViewed,
      last_pin_timestamp: this.lastPinTimestamp?.toISOString(),
      last_acked_id: this.lastAckedId,
    });
  }

  /**
   * The resource of the read state
   * @type {TextBasedChannel | Guild | ClientUser}
   * @readonly
   */
  get resource() {
    if (this.type === 'CHANNEL') return this.client.channels.get(this.id);
    if (['GUILD_SCHEDULED_EVENT', 'GUILD_HOME', 'GUILD_ONBOARDING_QUESTION'].includes(this.type)) return this.client.guilds.get(this.id);
    return this.client.user;
  }

  /**
   * Deletes the read state. Only applicable to 'CHANNEL' read states
   *
   * @returns {Promise<>}
   */
  delete() {
    return this.client.api.channels[this.id].messages.ack.delete();
  }
}

module.exports = ReadState;
