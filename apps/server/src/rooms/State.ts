import {Schema, MapSchema, type} from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") name = "";
  @type("string") variant = "forest";
  @type("float32") x = 0;
  @type("float32") z = 0;
  @type("float32") heading = 0;
  @type("string") locomotion = "idle";
  @type("boolean") connected = true;
}

export class LakesideState extends Schema {
  @type({map: PlayerState}) players = new MapSchema<PlayerState>();
  @type("string") hostPlayerId = "";
  @type("string") environmentPreset = "morning-mist";
}
